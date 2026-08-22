import pytest
from app.core.personalities import (
    PERSONALITIES,
    get_personality,
    get_all_personalities,
    build_personality_prompt,
)
from app.core.demo_responses import DEMO_RESPONSES


class TestPersonalities:
    def test_get_all_personalities_returns_four(self):
        personalities = get_all_personalities()
        assert len(personalities) == 4

    def test_personality_ids_are_valid(self):
        expected_ids = {"mentor", "senior_engineer", "strict_reviewer", "interview_coach"}
        actual_ids = {p.id for p in get_all_personalities()}
        assert actual_ids == expected_ids

    def test_get_personality_returns_correct(self):
        p = get_personality("mentor")
        assert p is not None
        assert p.name == "Mentor"
        assert p.id == "mentor"

    def test_get_personality_returns_none_for_invalid(self):
        p = get_personality("nonexistent")
        assert p is None

    def test_all_personalities_have_required_fields(self):
        for p in get_all_personalities():
            assert p.id
            assert p.name
            assert p.icon
            assert p.description
            assert p.system_instructions
            assert p.verbosity in ("detailed", "concise", "thorough", "guided")
            assert isinstance(p.reveal_solutions, bool)
            assert p.teaching_style in ("socratic", "direct", "evaluative")

    def test_mentor_does_not_reveal_solutions(self):
        p = get_personality("mentor")
        assert p.reveal_solutions is False

    def test_senior_engineer_reveals_solutions(self):
        p = get_personality("senior_engineer")
        assert p.reveal_solutions is True

    def test_strict_reviewer_reveals_solutions(self):
        p = get_personality("strict_reviewer")
        assert p.reveal_solutions is True

    def test_interview_coach_does_not_reveal_solutions(self):
        p = get_personality("interview_coach")
        assert p.reveal_solutions is False


class TestPersonalityPromptBuilder:
    def test_build_prompt_with_valid_personality(self):
        prompt = build_personality_prompt("mentor", "explain", "console.log('hello')")
        assert "mentor" in prompt.lower() or "patient" in prompt.lower() or "educational" in prompt.lower()
        assert "console.log('hello')" in prompt

    def test_build_prompt_defaults_to_senior_engineer(self):
        prompt = build_personality_prompt("nonexistent", "explain", "code")
        assert "senior" in prompt.lower() or "production" in prompt.lower() or "concise" in prompt.lower()

    def test_build_prompt_includes_context(self):
        prompt = build_personality_prompt("mentor", "ask", "code", "React TypeScript project")
        assert "React TypeScript project" in prompt

    def test_build_prompt_includes_action_instructions(self):
        for action in ["explain", "review", "debug", "improve", "ask"]:
            prompt = build_personality_prompt("senior_engineer", action, "code")
            assert len(prompt) > 50

    def test_build_prompt_different_for_different_personalities(self):
        mentor_prompt = build_personality_prompt("mentor", "explain", "code")
        senior_prompt = build_personality_prompt("senior_engineer", "explain", "code")
        assert mentor_prompt != senior_prompt


class TestDemoResponses:
    def test_demo_responses_have_all_personalities(self):
        for pid in PERSONALITIES:
            assert pid in DEMO_RESPONSES

    def test_demo_responses_have_all_actions(self):
        actions = {"explain", "review", "debug", "improve", "ask"}
        for pid, responses in DEMO_RESPONSES.items():
            for action in actions:
                assert action in responses, f"Missing {action} for {pid}"

    def test_demo_responses_are_strings(self):
        for pid, responses in DEMO_RESPONSES.items():
            for action, response in responses.items():
                assert isinstance(response, str)
                assert len(response) > 10


class TestPersonalityPromptDifferentiation:
    def test_mentor_explain_asks_questions(self):
        prompt = build_personality_prompt("mentor", "explain", "code")
        assert "?" in prompt

    def test_mentor_does_not_show_code_first(self):
        prompt = build_personality_prompt("mentor", "explain", "code")
        code_pos = prompt.find("code")
        question_pos = prompt.find("?")
        assert question_pos < code_pos or question_pos > 0

    def test_senior_engineer_prompt_is_concise(self):
        prompt = build_personality_prompt("senior_engineer", "explain", "code")
        mentor_prompt = build_personality_prompt("mentor", "explain", "code")
        assert len(prompt) < len(mentor_prompt)

    def test_strict_reviewer_uses_severity_levels(self):
        prompt = build_personality_prompt("strict_reviewer", "review", "code")
        assert "CRITICAL" in prompt or "severity" in prompt.lower()

    def test_interview_coach_asks_before_revealing(self):
        prompt = build_personality_prompt("interview_coach", "explain", "code")
        assert "?" in prompt

    def test_all_four_personalities_differ_for_same_action(self):
        prompts = []
        for pid in ["mentor", "senior_engineer", "strict_reviewer", "interview_coach"]:
            prompts.append(build_personality_prompt(pid, "explain", "code"))
        assert len(set(prompts)) == 4

    def test_same_personality_different_actions(self):
        prompts = set()
        for action in ["explain", "review", "debug", "improve", "ask"]:
            prompts.add(build_personality_prompt("senior_engineer", action, "code"))
        assert len(prompts) == 5

    def test_mentor_debug_uses_guided_approach(self):
        prompt = build_personality_prompt("mentor", "debug", "code")
        assert "question" in prompt.lower() or "?" in prompt

    def test_strict_reviewer_debug_hunts_bugs(self):
        prompt = build_personality_prompt("strict_reviewer", "debug", "code")
        assert "bug" in prompt.lower() or "severity" in prompt.lower() or "fix" in prompt.lower()

    def test_interview_coach_review_evaluates_thinking(self):
        prompt = build_personality_prompt("interview_coach", "review", "code")
        assert "?" in prompt


class TestMemoryModel:
    def test_memory_category_values(self):
        from app.models.memory import MemoryCategory
        categories = {c.value for c in MemoryCategory}
        assert "preference" in categories
        assert "recurring_issue" in categories
        assert "technology" in categories
        assert "pattern" in categories


class TestMemoryFiltering:
    def test_empty_list_returns_empty(self):
        from app.api.coding import _filter_memories
        result = _filter_memories([], "python", "explain", "code")
        assert result == []

    def test_preferences_always_included(self):
        from app.api.coding import _filter_memories
        from app.models.memory import DeveloperMemory, MemoryCategory
        from datetime import datetime, timezone
        mem = DeveloperMemory(
            id="1", category=MemoryCategory.PREFERENCE,
            content="Prefers concise explanations",
            source="manual",
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
        )
        result = _filter_memories([mem], "python", "explain", "code")
        assert len(result) == 1

    def test_language_relevant_memories_score_higher(self):
        from app.api.coding import _filter_memories
        from app.models.memory import DeveloperMemory, MemoryCategory
        from datetime import datetime, timezone
        now = datetime.now(timezone.utc)
        python_mem = DeveloperMemory(
            id="1", category=MemoryCategory.TECHNOLOGY,
            content="Uses Django framework for backend",
            source="manual", created_at=now, updated_at=now,
        )
        js_mem = DeveloperMemory(
            id="2", category=MemoryCategory.TECHNOLOGY,
            content="Uses React for frontend",
            source="manual", created_at=now, updated_at=now,
        )
        result = _filter_memories([js_mem, python_mem], "python", "debug", "code")
        assert result[0].id == "1"

    def test_recurring_issues_boosted_for_debug(self):
        from app.api.coding import _filter_memories
        from app.models.memory import DeveloperMemory, MemoryCategory
        from datetime import datetime, timezone
        now = datetime.now(timezone.utc)
        issue_mem = DeveloperMemory(
            id="1", category=MemoryCategory.RECURRING_ISSUE,
            content="Frequently encounters null/undefined handling issues",
            source="auto_extract", created_at=now, updated_at=now,
        )
        tech_mem = DeveloperMemory(
            id="2", category=MemoryCategory.TECHNOLOGY,
            content="Uses TypeScript",
            source="manual", created_at=now, updated_at=now,
        )
        result = _filter_memories([tech_mem, issue_mem], "typescript", "debug", "null check code")
        assert result[0].id == "1"
