import enum
import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, Enum, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from app.core.database import Base


class ProjectStatus(str, enum.Enum):
    CREATED = "created"
    ANALYZING = "analyzing"
    PLANNING = "planning"
    IMPLEMENTING = "implementing"
    TESTING = "testing"
    DEBUGGING = "debugging"
    COMPLETE = "complete"
    FAILED = "failed"


class TaskStatus(str, enum.Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"


def _uuid() -> str:
    return str(uuid.uuid4())


def _now() -> datetime:
    return datetime.now(timezone.utc)


class Project(Base):
    __tablename__ = "projects"

    id = Column(String, primary_key=True, default=_uuid)
    name = Column(String, nullable=False)
    repo_url = Column(String, nullable=False)
    branch = Column(String, default="main")
    status = Column(Enum(ProjectStatus), default=ProjectStatus.CREATED)
    created_at = Column(DateTime, default=_now)
    updated_at = Column(DateTime, default=_now, onupdate=_now)

    tasks = relationship("Task", back_populates="project", cascade="all, delete-orphan")


class Task(Base):
    __tablename__ = "tasks"

    id = Column(String, primary_key=True, default=_uuid)
    project_id = Column(String, ForeignKey("projects.id"), nullable=False)
    description = Column(Text, nullable=False)
    status = Column(Enum(TaskStatus), default=TaskStatus.PENDING)
    result = Column(Text, default="{}")
    created_at = Column(DateTime, default=_now)

    project = relationship("Project", back_populates="tasks")
    events = relationship("AgentEvent", back_populates="task", cascade="all, delete-orphan")
    code_changes = relationship("CodeChange", back_populates="task", cascade="all, delete-orphan")
    test_runs = relationship("TestRun", back_populates="task", cascade="all, delete-orphan")
    reports = relationship("Report", back_populates="task", cascade="all, delete-orphan")


class AgentEvent(Base):
    __tablename__ = "agent_events"

    id = Column(String, primary_key=True, default=_uuid)
    task_id = Column(String, ForeignKey("tasks.id"), nullable=False)
    event_type = Column(String, nullable=False)
    data = Column(Text, default="{}")
    created_at = Column(DateTime, default=_now)

    task = relationship("Task", back_populates="events")


class CodeChange(Base):
    __tablename__ = "code_changes"

    id = Column(String, primary_key=True, default=_uuid)
    task_id = Column(String, ForeignKey("tasks.id"), nullable=False)
    file_path = Column(String, nullable=False)
    operation = Column(String, nullable=False)
    content = Column(Text, default="")
    diff = Column(Text, default="")
    created_at = Column(DateTime, default=_now)

    task = relationship("Task", back_populates="code_changes")


class TestRun(Base):
    __tablename__ = "test_runs"

    id = Column(String, primary_key=True, default=_uuid)
    task_id = Column(String, ForeignKey("tasks.id"), nullable=False)
    command = Column(String, nullable=False)
    exit_code = Column(Integer, default=0)
    stdout = Column(Text, default="")
    stderr = Column(Text, default="")
    duration = Column(Integer, default=0)
    created_at = Column(DateTime, default=_now)

    task = relationship("Task", back_populates="test_runs")


class Report(Base):
    __tablename__ = "reports"

    id = Column(String, primary_key=True, default=_uuid)
    task_id = Column(String, ForeignKey("tasks.id"), nullable=False)
    summary = Column(Text, default="")
    files_changed = Column(Text, default="[]")
    features = Column(Text, default="[]")
    tests_passed = Column(Integer, default=0)
    tests_failed = Column(Integer, default=0)
    issues = Column(Text, default="[]")
    security_notes = Column(Text, default="[]")
    score = Column(Text, default="{}")
    created_at = Column(DateTime, default=_now)

    task = relationship("Task", back_populates="reports")
