from datetime import datetime

from pydantic import BaseModel


class ProjectCreate(BaseModel):
    name: str
    repo_url: str
    branch: str = "main"


class ProjectResponse(BaseModel):
    id: str
    name: str
    repo_url: str
    branch: str
    status: str
    created_at: datetime
    updated_at: datetime
    task_count: int = 0

    model_config = {"from_attributes": True}


class TaskCreate(BaseModel):
    description: str


class TaskIdRequest(BaseModel):
    task_id: str


class TaskResponse(BaseModel):
    id: str
    project_id: str
    description: str
    status: str
    result: str
    created_at: datetime

    model_config = {"from_attributes": True}


class AgentEventResponse(BaseModel):
    id: str
    task_id: str
    event_type: str
    data: str
    created_at: datetime

    model_config = {"from_attributes": True}


class CodeChangeResponse(BaseModel):
    id: str
    task_id: str
    file_path: str
    operation: str
    content: str
    diff: str
    created_at: datetime

    model_config = {"from_attributes": True}


class TestRunResponse(BaseModel):
    __test__ = False

    id: str
    task_id: str
    command: str
    exit_code: int
    stdout: str
    stderr: str
    duration: int
    created_at: datetime

    model_config = {"from_attributes": True}


class ReportResponse(BaseModel):
    id: str
    task_id: str
    summary: str
    files_changed: str
    features: str
    tests_passed: int
    tests_failed: int
    issues: str
    security_notes: str
    score: str
    created_at: datetime

    model_config = {"from_attributes": True}
