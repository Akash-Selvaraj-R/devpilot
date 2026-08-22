import json
import logging
import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.demo_responses import DEMO_RESPONSES
from app.core.personalities import (
    build_personality_prompt,
    get_all_personalities,
    get_personality,
)
from app.models.memory import CodingSession, DeveloperMemory, MemoryCategory
from app.schemas.memory import (
    CodingRequest,
    CodingResponse,
    CodingSessionCreate,
    CodingSessionResponse,
    MemoryCreate,
    MemoryResponse,
    PersonalityResponse,
)
from app.core.ai_provider import AIProvider, AIServiceError

logger = logging.getLogger(__name__)
router = APIRouter()

_LANGUAGE_KEYWORDS: dict[str, list[str]] = {
    "python": ["python", "django", "flask", "fastapi", "pip", "pytest"],
    "javascript": ["javascript", "js", "node", "npm", "express", "react", "vue"],
    "typescript": ["typescript", "ts", "tsx", "jsx", "tsc", "type"],
    "java": ["java", "spring", "maven", "gradle"],
    "go": ["go", "golang", "goroutine"],
    "rust": ["rust", "cargo", "borrow", "ownership"],
    "css": ["css", "scss", "tailwind", "style"],
    "sql": ["sql", "database", "query", "migration"],
}

_ACTION_KEYWORDS: dict[str, list[str]] = {
    "debug": ["error", "bug", "crash", "exception", "fail", "null", "undefined"],
    "review": ["pattern", "convention", "style", "lint"],
    "improve": ["preference", "prefer", "like", "always"],
    "explain": ["concept", "learn"],
    "ask": [],
}


def _filter_memories(
    memories: list,
    language: str,
    action: str,
    code: str,
    max_count: int = 10,
) -> list:
    if not memories:
        return []

    lang_lower = language.lower() if language else ""
    code_lower = code.lower() if code else ""
    code_words = set(code_lower.split()) if code_lower else set()

    scored: list[tuple[int, object]] = []
    for mem in memories:
        score = 0
        cat = mem.category.value if hasattr(mem.category, "value") else str(mem.category)
        content_lower = mem.content.lower()

        if cat == "preference":
            score += 10

        if lang_lower and lang_lower in _LANGUAGE_KEYWORDS:
            for kw in _LANGUAGE_KEYWORDS[lang_lower]:
                if kw in content_lower:
                    score += 5
                    break

        action_kws = _ACTION_KEYWORDS.get(action, [])
        for kw in action_kws:
            if kw in content_lower:
                score += 3
                break

        if cat == "recurring_issue" and action in ("debug", "improve"):
            score += 4

        if cat in ("technology", "pattern") and code_words:
            mem_words = set(content_lower.split())
            overlap = len(code_words & mem_words)
            if overlap >= 2:
                score += 2

        scored.append((score, mem))

    scored.sort(key=lambda x: x[0], reverse=True)
    return [mem for _, mem in scored[:max_count]]


@router.get("/api/personalities", response_model=list[PersonalityResponse])
async def list_personalities():
    personalities = get_all_personalities()
    return [
        PersonalityResponse(
            id=p.id,
            name=p.name,
            icon=p.icon,
            description=p.description,
            system_instructions=p.system_instructions,
            verbosity=p.verbosity,
            reveal_solutions=p.reveal_solutions,
            teaching_style=p.teaching_style,
        )
        for p in personalities
    ]


@router.get("/api/personalities/{personality_id}", response_model=PersonalityResponse)
async def get_personality_detail(personality_id: str):
    p = get_personality(personality_id)
    if not p:
        raise HTTPException(status_code=404, detail="Personality not found")
    return PersonalityResponse(
        id=p.id,
        name=p.name,
        icon=p.icon,
        description=p.description,
        system_instructions=p.system_instructions,
        verbosity=p.verbosity,
        reveal_solutions=p.reveal_solutions,
        teaching_style=p.teaching_style,
    )


@router.get("/api/memory", response_model=list[MemoryResponse])
async def list_memory(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(DeveloperMemory).order_by(DeveloperMemory.created_at.desc())
    )
    memories = result.scalars().all()
    return [
        MemoryResponse(
            id=m.id,
            category=m.category.value,
            content=m.content,
            source=m.source,
            created_at=m.created_at,
            updated_at=m.updated_at,
        )
        for m in memories
    ]


@router.post("/api/memory", response_model=MemoryResponse)
async def create_memory(body: MemoryCreate, db: AsyncSession = Depends(get_db)):
    try:
        category_enum = MemoryCategory(body.category)
    except ValueError:
        category_enum = MemoryCategory.PREFERENCE
    memory = DeveloperMemory(
        id=str(uuid.uuid4()),
        category=category_enum,
        content=body.content,
        source=body.source,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
    )
    db.add(memory)
    await db.flush()
    return MemoryResponse(
        id=memory.id,
        category=memory.category.value if hasattr(memory.category, 'value') else str(memory.category),
        content=memory.content,
        source=memory.source,
        created_at=memory.created_at,
        updated_at=memory.updated_at,
    )


@router.delete("/api/memory/{memory_id}")
async def delete_memory(memory_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(DeveloperMemory).where(DeveloperMemory.id == memory_id)
    )
    memory = result.scalar_one_or_none()
    if not memory:
        raise HTTPException(status_code=404, detail="Memory not found")
    await db.delete(memory)
    await db.flush()
    return {"status": "deleted", "id": memory_id}


@router.delete("/api/memory")
async def clear_all_memory(db: AsyncSession = Depends(get_db)):
    await db.execute(delete(DeveloperMemory))
    await db.flush()
    return {"status": "cleared"}


@router.get("/api/sessions", response_model=list[CodingSessionResponse])
async def list_sessions(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(CodingSession).order_by(CodingSession.created_at.desc()).limit(50)
    )
    sessions = result.scalars().all()
    return [
        CodingSessionResponse(
            id=s.id,
            title=s.title,
            personality_id=s.personality_id,
            language=s.language,
            summary=s.summary,
            messages_json=s.messages_json,
            created_at=s.created_at,
            updated_at=s.updated_at,
        )
        for s in sessions
    ]


@router.post("/api/sessions", response_model=CodingSessionResponse)
async def create_session(body: CodingSessionCreate, db: AsyncSession = Depends(get_db)):
    session = CodingSession(
        id=str(uuid.uuid4()),
        title=body.title,
        personality_id=body.personality_id,
        language=body.language,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
    )
    db.add(session)
    await db.flush()
    return CodingSessionResponse(
        id=session.id,
        title=session.title,
        personality_id=session.personality_id,
        language=session.language,
        summary=session.summary,
        messages_json=session.messages_json,
        created_at=session.created_at,
        updated_at=session.updated_at,
    )


@router.get("/api/sessions/{session_id}", response_model=CodingSessionResponse)
async def get_session(session_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(CodingSession).where(CodingSession.id == session_id)
    )
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return CodingSessionResponse(
        id=session.id,
        title=session.title,
        personality_id=session.personality_id,
        language=session.language,
        summary=session.summary,
        messages_json=session.messages_json,
        created_at=session.created_at,
        updated_at=session.updated_at,
    )


@router.delete("/api/sessions/{session_id}")
async def delete_session(session_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(CodingSession).where(CodingSession.id == session_id)
    )
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    await db.delete(session)
    await db.flush()
    return {"status": "deleted", "id": session_id}


@router.post("/api/ai/coding", response_model=CodingResponse)
async def coding_assistant(body: CodingRequest, db: AsyncSession = Depends(get_db)):
    personality = get_personality(body.personality_id)
    if not personality:
        personality = get_personality("senior_engineer")

    # Fetch and filter memories by relevance
    memories = []
    try:
        mem_result = await db.execute(
            select(DeveloperMemory).order_by(DeveloperMemory.created_at.desc()).limit(50)
        )
        all_memories = mem_result.scalars().all()
        memories = _filter_memories(all_memories, body.language, body.action, body.code)
    except Exception:
        pass

    memory_text = ""
    if memories:
        memory_items = []
        for m in memories:
            memory_items.append(f"- [{m.category.value}] {m.content}")
        memory_text = "\n".join(memory_items)

    system_prompt = build_personality_prompt(
        body.personality_id, body.action, body.code, body.repo_context
    )

    if memory_text:
        system_prompt += f"\n\nDeveloper Preferences & Context:\n{memory_text}"

    # Load session history for continuity
    session_history_text = ""
    has_previous_session = False
    session_message_count = 0
    if body.session_id:
        try:
            sess_result = await db.execute(
                select(CodingSession).where(CodingSession.id == body.session_id)
            )
            session = sess_result.scalar_one_or_none()
            if session:
                raw = session.messages_json or "[]"
                messages = json.loads(raw)
                session_message_count = len(messages)
                recent = messages[-10:]
                history_lines = []
                for msg in recent:
                    role = msg.get("role", "unknown")
                    content = msg.get("content", "")[:300]
                    history_lines.append(f"[{role}]: {content}")
                session_history_text = "\n".join(history_lines)
                has_previous_session = bool(session_history_text)
        except Exception:
            pass

    if session_history_text:
        parts = system_prompt.split("\nCode:\n")
        if len(parts) == 2:
            parts[0] += f"\n\nPrevious conversation context:\n{session_history_text}\n\n"
            system_prompt = "\nCode:\n".join(parts)
        else:
            system_prompt += f"\n\nPrevious conversation context:\n{session_history_text}"

    user_message = body.code
    if body.question:
        user_message = f"{body.question}\n\nCode:\n{body.code}" if body.code else body.question

    context_used = {
        "current_code": bool(body.code),
        "repo_context": bool(body.repo_context),
        "language": body.language or None,
        "personality": personality.name,
        "personality_id": body.personality_id,
        "developer_memory": len(memories),
        "previous_session": has_previous_session,
        "memory_categories": [m.category.value for m in memories],
        "relevant_memory_ids": [m.id for m in memories],
        "session_message_count": session_message_count,
    }

    response_text = ""
    try:
        ai = AIProvider()
        response_text = await ai.chat(
            messages=[{"role": "user", "content": user_message}],
            system_prompt=system_prompt,
        )
    except AIServiceError:
        response_text = _get_demo_response(body.personality_id, body.action, body.code)
    except Exception as e:
        logger.error("AI coding request failed: %s", str(e))
        response_text = _get_demo_response(body.personality_id, body.action, body.code)

    session_id = body.session_id
    if session_id:
        try:
            sess_result = await db.execute(
                select(CodingSession).where(CodingSession.id == session_id)
            )
            session = sess_result.scalar_one_or_none()
            if session:
                raw = session.messages_json or "[]"
                messages = json.loads(raw)
                messages.append({"role": "user", "content": user_message[:2000]})
                messages.append({"role": "assistant", "content": response_text[:2000]})
                if len(messages) > 50:
                    messages = messages[-50:]
                session.messages_json = json.dumps(messages)
                session.updated_at = datetime.now(timezone.utc)
                if not session.summary:
                    session.summary = user_message[:200]
                await db.flush()
        except Exception:
            pass

    await _extract_and_store_memory(db, body, response_text)

    return CodingResponse(
        response=response_text,
        personality_id=body.personality_id,
        action=body.action,
        context_used=context_used,
        session_id=session_id,
    )


def _get_demo_response(personality_id: str, action: str, code: str) -> str:
    personality_responses = DEMO_RESPONSES.get(personality_id, DEMO_RESPONSES.get("senior_engineer", {}))
    return personality_responses.get(action, personality_responses.get("ask", "I can help with that code. Could you share what you're working on?"))


_RECURRING_ISSUE_PATTERNS: dict[str, list[str]] = {
    "null/undefined handling": ["undefined", "null", "none", "cannot read", "typeerror"],
    "async/error handling": ["async", "await", "promise", "unhandled", "rejected", "catch"],
    "missing validation": ["input", "validate", "sanitiz", "check", "assert"],
    "type safety problems": ["typeerror", "type error", "cast", "as any", "unknown"],
    "resource management": ["memory leak", "leak", "unclosed", "dispose", "cleanup"],
    "concurrency issues": ["race condition", "deadlock", "thread", "concurrent"],
}


async def _extract_and_store_memory(db: AsyncSession, body: CodingRequest, response: str) -> None:
    try:
        lower_question = body.question.lower() if body.question else ""
        lower_code = body.code.lower() if body.code else ""

        # Auto-extract preferences
        if any(phrase in lower_question for phrase in [
            "i prefer", "i like", "i always", "i usually",
            "i want concise", "keep it short", "prefer concise",
        ]):
            content = body.question[:200]
            memory = DeveloperMemory(
                id=str(uuid.uuid4()),
                category=MemoryCategory.PREFERENCE,
                content=content,
                source="auto_extract",
                created_at=datetime.now(timezone.utc),
                updated_at=datetime.now(timezone.utc),
            )
            db.add(memory)

        # Auto-extract recurring issues from debug/improve actions
        if body.action in ("debug", "improve") and body.code:
            for issue_name, keywords in _RECURRING_ISSUE_PATTERNS.items():
                if any(term in lower_code for term in keywords):
                    existing = await db.execute(
                        select(DeveloperMemory).where(
                            DeveloperMemory.category == MemoryCategory.RECURRING_ISSUE,
                            DeveloperMemory.content.ilike(f"%{issue_name}%")
                        )
                    )
                    if not existing.scalar_one_or_none():
                        memory = DeveloperMemory(
                            id=str(uuid.uuid4()),
                            category=MemoryCategory.RECURRING_ISSUE,
                            content=f"Recurring issue: {issue_name}",
                            source="auto_extract",
                            created_at=datetime.now(timezone.utc),
                            updated_at=datetime.now(timezone.utc),
                        )
                        db.add(memory)

        await db.flush()
    except Exception:
        pass
