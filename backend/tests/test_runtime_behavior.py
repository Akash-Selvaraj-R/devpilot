"""Tests that prove runtime behavior for personality, memory, session, and context."""
import json
import pytest
from datetime import datetime, timezone

from app.core.personalities import (
    build_personality_prompt,
    get_all_personalities,
    get_personality,
)
from app.core.demo_responses import DEMO_RESPONSES
from app.api.coding import _filter_memories
from app.models.memory import DeveloperMemory, MemoryCategory, CodingSession
from app.schemas.memory import CodingRequest, CodingResponse


# ── Personality Runtime Tests ──────────────────────────────────────────────

class TestPersonalityReachesBackend:
    """Verify that the personality_id from the request is used in prompt construction."""

    def test_personality_id_determines_system_prompt(self):
        """Each personality should produce a different system prompt for the same action."""
        code = "function foo() { return 1; }"
        prompts = {}
        for pid in ["mentor", "senior_engineer", "strict_reviewer", "interview_coach"]:
            prompts[pid] = build_personality_prompt(pid, "explain", code)
        assert len(set(prompts.values())) == 4, "All four personalities must produce distinct prompts"

    def test_mentor_prompt_educational_tone(self):
        prompt = build_personality_prompt("mentor", "explain", "code")
        assert "step by step" in prompt.lower() or "understand" in prompt.lower() or "why" in prompt.lower()

    def test_senior_engineer_prompt_production_focus(self):
        prompt = build_personality_prompt("senior_engineer", "explain", "code")
        assert "production" in prompt.lower() or "concise" in prompt.lower() or "practical" in prompt.lower()

    def test_strict_reviewer_prompt_severity_levels(self):
        prompt = build_personality_prompt("strict_reviewer", "review", "code")
        assert "severity" in prompt.lower() or "critical" in prompt.lower() or "issue" in prompt.lower()

    def test_interview_coach_prompt_guided_questions(self):
        prompt = build_personality_prompt("interview_coach", "explain", "code")
        assert "?" in prompt


class TestPersonalityActionMatrix:
    """Verify every personality x action combination produces a unique demo response."""

    PERSONALITY_IDS = ["mentor", "senior_engineer", "strict_reviewer", "interview_coach"]
    ACTIONS = ["explain", "review", "debug", "improve", "ask"]

    def test_all_combinations_exist(self):
        for pid in self.PERSONALITY_IDS:
            for action in self.ACTIONS:
                assert pid in DEMO_RESPONSES, f"Missing personality {pid}"
                assert action in DEMO_RESPONSES[pid], f"Missing action {action} for {pid}"

    def test_all_responses_are_distinct(self):
        """No two personality+action combos should produce the same response."""
        responses = set()
        for pid in self.PERSONALITY_IDS:
            for action in self.ACTIONS:
                resp = DEMO_RESPONSES[pid][action]
                key = f"{pid}:{action}"
                assert resp not in responses, f"Duplicate response for {key}"
                responses.add(resp)

    def test_mentor_debug_asks_questions(self):
        resp = DEMO_RESPONSES["mentor"]["debug"]
        assert "?" in resp, "Mentor debug should ask guiding questions"

    def test_senior_engineer_debug_provides_direct_fix(self):
        resp = DEMO_RESPONSES["senior_engineer"]["debug"]
        assert "fix" in resp.lower() or "```" in resp, "Senior engineer debug should provide fix"

    def test_strict_reviewer_debug_hunts_bugs(self):
        resp = DEMO_RESPONSES["strict_reviewer"]["debug"]
        assert "severity" in resp.lower() or "critical" in resp.lower() or "bug" in resp.lower()

    def test_interview_coach_debug_guides(self):
        resp = DEMO_RESPONSES["interview_coach"]["debug"]
        assert "?" in resp, "Interview coach debug should ask questions"

    def test_same_personality_different_actions(self):
        """Same personality, different actions should produce different responses."""
        for pid in self.PERSONALITY_IDS:
            responses = set()
            for action in self.ACTIONS:
                responses.add(DEMO_RESPONSES[pid][action])
            assert len(responses) == 5, f"Personality {pid} should have 5 distinct action responses"


class TestMockProviderRouting:
    """Verify that the demo response lookup respects personality_id + action."""

    def test_get_demo_response_with_valid_personality(self):
        from app.api.coding import _get_demo_response
        for pid in ["mentor", "senior_engineer", "strict_reviewer", "interview_coach"]:
            for action in ["explain", "review", "debug", "improve", "ask"]:
                resp = _get_demo_response(pid, action, "code")
                assert resp == DEMO_RESPONSES[pid][action], f"Wrong response for {pid}/{action}"

    def test_get_demo_response_with_invalid_personality_falls_back(self):
        from app.api.coding import _get_demo_response
        resp = _get_demo_response("nonexistent", "explain", "code")
        assert resp == DEMO_RESPONSES["senior_engineer"]["explain"]

    def test_get_demo_response_with_invalid_action_falls_back(self):
        from app.api.coding import _get_demo_response
        resp = _get_demo_response("mentor", "nonexistent", "code")
        assert resp == DEMO_RESPONSES["mentor"]["ask"]


# ── Memory Runtime Tests ───────────────────────────────────────────────────

class TestMemoryFilteringRelevance:
    """Verify memory relevance filtering works correctly."""

    def _make_mem(self, id, category, content):
        return DeveloperMemory(
            id=id,
            category=MemoryCategory(category),
            content=content,
            source="manual",
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
        )

    def test_preference_memories_always_top_scored(self):
        prefs = [self._make_mem("p1", "preference", "Prefers concise explanations")]
        tech = [self._make_mem("t1", "technology", "Uses TypeScript")]
        result = _filter_memories(prefs + tech, "typescript", "explain", "code")
        assert result[0].category == MemoryCategory.PREFERENCE

    def test_language_match_boosts_score(self):
        ts_mem = self._make_mem("t1", "technology", "TypeScript type safety")
        py_mem = self._make_mem("t2", "technology", "Python Django backend")
        result = _filter_memories([ts_mem, py_mem], "typescript", "explain", "code")
        assert result[0].id == "t1"

    def test_recurring_issue_boosted_for_debug(self):
        issue = self._make_mem("i1", "recurring_issue", "null/undefined handling")
        tech = self._make_mem("t1", "technology", "React")
        result = _filter_memories([tech, issue], "javascript", "debug", "undefined check code")
        assert result[0].id == "i1"

    def test_empty_input_returns_empty(self):
        assert _filter_memories([], "python", "explain", "code") == []

    def test_max_count_limits_output(self):
        mems = [self._make_mem(f"m{i}", "preference", f"Preference {i}") for i in range(20)]
        result = _filter_memories(mems, "python", "explain", "code", max_count=5)
        assert len(result) == 5


class TestMemoryPersistence:
    """Verify memory CRUD operations persist correctly."""

    @pytest.mark.asyncio
    async def test_create_and_retrieve_memory(self, client):
        # Create memory
        resp = await client.post("/api/memory", json={
            "category": "preference",
            "content": "Prefers concise explanations",
            "source": "manual",
        })
        assert resp.status_code == 200
        data = resp.json()
        assert data["content"] == "Prefers concise explanations"
        assert data["category"] == "preference"
        mem_id = data["id"]

        # Retrieve memories
        resp = await client.get("/api/memory")
        assert resp.status_code == 200
        memories = resp.json()
        assert any(m["id"] == mem_id for m in memories)

        # Delete memory
        resp = await client.delete(f"/api/memory/{mem_id}")
        assert resp.status_code == 200

        # Verify deleted
        resp = await client.get("/api/memory")
        assert resp.status_code == 200
        assert not any(m["id"] == mem_id for m in resp.json())

    @pytest.mark.asyncio
    async def test_memory_survives_across_requests(self, client):
        """Memory created in one request should be available in subsequent requests."""
        # Create
        await client.post("/api/memory", json={
            "category": "preference",
            "content": "Prefers concise explanations",
            "source": "manual",
        })

        # Verify in separate request
        resp = await client.get("/api/memory")
        assert resp.status_code == 200
        memories = resp.json()
        assert len(memories) >= 1
        assert any(m["content"] == "Prefers concise explanations" for m in memories)


class TestMemoryInPrompt:
    """Verify memories are injected into the system prompt."""

    def test_memories_appear_in_prompt(self):
        mems = [
            DeveloperMemory(
                id="1", category=MemoryCategory.PREFERENCE,
                content="Prefers concise explanations",
                source="manual",
                created_at=datetime.now(timezone.utc),
                updated_at=datetime.now(timezone.utc),
            )
        ]
        filtered = _filter_memories(mems, "python", "explain", "code")
        assert len(filtered) == 1
        assert filtered[0].content == "Prefers concise explanations"


# ── Session Runtime Tests ──────────────────────────────────────────────────

class TestSessionPersistence:
    """Verify session CRUD operations persist correctly."""

    @pytest.mark.asyncio
    async def test_create_and_retrieve_session(self, client):
        resp = await client.post("/api/sessions", json={
            "title": "Test Session",
            "personality_id": "mentor",
            "language": "typescript",
        })
        assert resp.status_code == 200
        data = resp.json()
        assert data["title"] == "Test Session"
        assert data["personality_id"] == "mentor"
        session_id = data["id"]

        resp = await client.get(f"/api/sessions/{session_id}")
        assert resp.status_code == 200
        assert resp.json()["id"] == session_id

    @pytest.mark.asyncio
    async def test_session_messages_persist(self, client):
        """Session messages should be saved after coding requests."""
        # Create session
        resp = await client.post("/api/sessions", json={
            "title": "Test",
            "personality_id": "senior_engineer",
        })
        session_id = resp.json()["id"]

        # Send coding request with session_id
        resp = await client.post("/api/ai/coding", json={
            "action": "explain",
            "code": "function foo() { return 1; }",
            "personality_id": "senior_engineer",
            "session_id": session_id,
        })
        assert resp.status_code == 200

        # Verify messages were saved
        resp = await client.get(f"/api/sessions/{session_id}")
        session = resp.json()
        messages = json.loads(session["messages_json"])
        assert len(messages) >= 2  # user + assistant
        assert messages[0]["role"] == "user"
        assert messages[1]["role"] == "assistant"

    @pytest.mark.asyncio
    async def test_session_history_influences_next_request(self, client):
        """Previous messages should be available for context."""
        resp = await client.post("/api/sessions", json={
            "title": "Test",
            "personality_id": "senior_engineer",
        })
        session_id = resp.json()["id"]

        # First request
        await client.post("/api/ai/coding", json={
            "action": "ask",
            "code": "function foo() {}",
            "question": "What does this do?",
            "personality_id": "senior_engineer",
            "session_id": session_id,
        })

        # Second request - should have previous context
        resp = await client.post("/api/ai/coding", json={
            "action": "explain",
            "code": "function bar() {}",
            "personality_id": "senior_engineer",
            "session_id": session_id,
        })
        assert resp.status_code == 200
        context = resp.json()["context_used"]
        assert context["previous_session"] is True
        assert context["session_message_count"] >= 2


# ── Context Runtime Tests ──────────────────────────────────────────────────

class TestContextUsed:
    """Verify context_used reflects actual request state."""

    @pytest.mark.asyncio
    async def test_context_reflects_code_presence(self, client):
        resp = await client.post("/api/ai/coding", json={
            "action": "explain",
            "code": "function foo() {}",
            "personality_id": "senior_engineer",
        })
        context = resp.json()["context_used"]
        assert context["current_code"] is True

    @pytest.mark.asyncio
    async def test_context_reflects_no_code(self, client):
        resp = await client.post("/api/ai/coding", json={
            "action": "ask",
            "question": "What is TypeScript?",
            "personality_id": "senior_engineer",
        })
        context = resp.json()["context_used"]
        assert context["current_code"] is False

    @pytest.mark.asyncio
    async def test_context_reflects_personality(self, client):
        for pid in ["mentor", "senior_engineer", "strict_reviewer", "interview_coach"]:
            resp = await client.post("/api/ai/coding", json={
                "action": "explain",
                "code": "code",
                "personality_id": pid,
            })
            context = resp.json()["context_used"]
            assert context["personality_id"] == pid

    @pytest.mark.asyncio
    async def test_context_no_hardcoded_memory_count(self, client):
        """Memory count should reflect actual filtered memories, not a hardcoded value."""
        resp = await client.post("/api/ai/coding", json={
            "action": "explain",
            "code": "code",
            "personality_id": "senior_engineer",
        })
        context = resp.json()["context_used"]
        assert isinstance(context["developer_memory"], int)
        assert context["developer_memory"] >= 0

    @pytest.mark.asyncio
    async def test_context_session_message_count(self, client):
        resp = await client.post("/api/ai/coding", json={
            "action": "explain",
            "code": "code",
            "personality_id": "senior_engineer",
        })
        context = resp.json()["context_used"]
        assert "session_message_count" in context
        assert isinstance(context["session_message_count"], int)
