import pytest

from app.schemas.project import (
    ProjectCreate,
    ProjectResponse,
    TaskCreate,
    TaskResponse,
    CodeChangeResponse,
    TestRunResponse,
)
from datetime import datetime, timezone


def test_plan_step_schema():
    step = {"id": 1, "description": "Create auth module", "files_involved": ["auth.py", "app.py"]}
    assert step["id"] == 1
    assert isinstance(step["files_involved"], list)
    assert len(step["files_involved"]) == 2


def test_plan_schema():
    plan = {
        "goal": "Add authentication",
        "steps": [
            {"id": 1, "description": "Create auth module", "files_involved": ["auth.py"]},
            {"id": 2, "description": "Add routes", "files_involved": ["app.py"]},
        ],
        "files_to_modify": ["app.py"],
        "files_to_create": ["auth.py"],
        "dependencies": ["pyjwt"],
        "testing_strategy": "Run unit tests",
    }
    assert plan["goal"] == "Add authentication"
    assert len(plan["steps"]) == 2
    assert plan["steps"][0]["id"] == 1
    assert plan["steps"][1]["id"] == 2
    assert "app.py" in plan["files_to_modify"]
    assert "auth.py" in plan["files_to_create"]
    assert "pyjwt" in plan["dependencies"]


def test_code_change_schema():
    change = {
        "file": "app.py",
        "operation": "modify",
        "content": "from flask import Flask",
        "diff": "+from flask import Flask",
    }
    assert change["file"] == "app.py"
    assert change["operation"] == "modify"
    assert "+" in change["diff"]


def test_test_result_schema():
    result = {
        "command": "pytest tests/",
        "exit_code": 0,
        "stdout": "5 passed",
        "stderr": "",
        "duration": 12,
    }
    assert result["exit_code"] == 0
    assert result["command"] == "pytest tests/"
    assert "passed" in result["stdout"]


def test_project_create_schema():
    project = ProjectCreate(name="My Project", repo_url="https://github.com/test/repo.git")
    assert project.name == "My Project"
    assert project.repo_url == "https://github.com/test/repo.git"
    assert project.branch == "main"


def test_project_create_schema_custom_branch():
    project = ProjectCreate(
        name="Feature Branch",
        repo_url="https://github.com/test/repo.git",
        branch="feature/auth",
    )
    assert project.branch == "feature/auth"


def test_project_response_schema():
    now = datetime.now(timezone.utc)
    response = ProjectResponse(
        id="abc-123",
        name="Test",
        repo_url="https://github.com/test/repo.git",
        branch="main",
        status="created",
        created_at=now,
        updated_at=now,
        task_count=0,
    )
    assert response.id == "abc-123"
    assert response.task_count == 0
    assert response.status == "created"


def test_task_create_schema():
    task = TaskCreate(description="Implement login")
    assert task.description == "Implement login"


def test_task_response_schema():
    now = datetime.now(timezone.utc)
    response = TaskResponse(
        id="task-1",
        project_id="proj-1",
        description="Run tests",
        status="completed",
        result="{}",
        created_at=now,
    )
    assert response.status == "completed"
    assert response.project_id == "proj-1"


def test_code_change_response_schema():
    now = datetime.now(timezone.utc)
    response = CodeChangeResponse(
        id="cc-1",
        task_id="task-1",
        file_path="app.py",
        operation="modify",
        content="new content",
        diff="+new content",
        created_at=now,
    )
    assert response.operation == "modify"
    assert response.file_path == "app.py"


def test_test_run_response_schema():
    now = datetime.now(timezone.utc)
    response = TestRunResponse(
        id="tr-1",
        task_id="task-1",
        command="pytest",
        exit_code=0,
        stdout="all passed",
        stderr="",
        duration=5,
        created_at=now,
    )
    assert response.exit_code == 0
    assert response.duration == 5
