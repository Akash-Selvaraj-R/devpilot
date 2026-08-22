import enum
import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, Enum, String, Text

from app.core.database import Base


class MemoryCategory(str, enum.Enum):
    PREFERENCE = "preference"
    RECURRING_ISSUE = "recurring_issue"
    TECHNOLOGY = "technology"
    PATTERN = "pattern"


def _uuid() -> str:
    return str(uuid.uuid4())


def _now() -> datetime:
    return datetime.now(timezone.utc)


class DeveloperMemory(Base):
    __tablename__ = "developer_memory"

    id = Column(String, primary_key=True, default=_uuid)
    category = Column(Enum(MemoryCategory), nullable=False)
    content = Column(Text, nullable=False)
    source = Column(String, default="manual")
    created_at = Column(DateTime, default=_now)
    updated_at = Column(DateTime, default=_now, onupdate=_now)


class CodingSession(Base):
    __tablename__ = "coding_sessions"

    id = Column(String, primary_key=True, default=_uuid)
    title = Column(String, default="Untitled Session")
    personality_id = Column(String, default="senior_engineer")
    language = Column(String, default="")
    summary = Column(Text, default="")
    messages_json = Column(Text, nullable=False, default="[]")
    created_at = Column(DateTime, default=_now)
    updated_at = Column(DateTime, default=_now, onupdate=_now)
