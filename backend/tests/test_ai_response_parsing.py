import json

import pytest

from app.agents.planning_agent import PlanningAgent


@pytest.fixture
def planner():
    return PlanningAgent()


def test_parse_json_response(planner):
    raw = json.dumps({
        "goal": "Add a new endpoint",
        "steps": [{"id": 1, "description": "Create route", "files_involved": ["app.py"]}],
        "files_to_modify": ["app.py"],
        "files_to_create": [],
        "dependencies": [],
        "testing_strategy": "Run pytest",
    })
    result = json.loads(raw)
    assert result["goal"] == "Add a new endpoint"
    assert len(result["steps"]) == 1
    assert result["steps"][0]["files_involved"] == ["app.py"]


def test_parse_plan_response(planner):
    plan = {
        "goal": "Implement user auth",
        "steps": [
            {"id": 1, "description": "Add login endpoint", "files_involved": ["auth.py", "app.py"]},
            {"id": 2, "description": "Add JWT middleware", "files_involved": ["middleware.py"]},
        ],
        "files_to_modify": ["app.py"],
        "files_to_create": ["auth.py", "middleware.py"],
        "dependencies": ["pyjwt"],
        "testing_strategy": "Unit tests for auth functions",
    }
    validated = planner._validate_plan(plan)
    assert validated["goal"] == "Implement user auth"
    assert len(validated["steps"]) == 2
    assert validated["files_to_create"] == ["auth.py", "middleware.py"]
    assert validated["dependencies"] == ["pyjwt"]


def test_parse_code_changes():
    changes = [
        {
            "file": "app.py",
            "operation": "modify",
            "content": "from flask import Flask\napp = Flask(__name__)",
            "diff": "+from flask import Flask\n+app = Flask(__name__)",
        },
        {
            "file": "auth.py",
            "operation": "create",
            "content": "def authenticate():\n    pass",
            "diff": "+def authenticate():\n+    pass",
        },
    ]
    assert len(changes) == 2
    assert changes[0]["operation"] == "modify"
    assert changes[1]["operation"] == "create"
    assert "app.py" in changes[0]["file"]
    assert "auth.py" in changes[1]["file"]


def test_handle_malformed_response(planner):
    incomplete = {"goal": "Do something"}
    validated = planner._validate_plan(incomplete)
    assert validated["goal"] == "Do something"
    assert isinstance(validated["steps"], list)
    assert len(validated["steps"]) == 1
    assert validated["files_to_modify"] == []
    assert validated["files_to_create"] == []
    assert validated["dependencies"] == []
    assert validated["testing_strategy"] != ""


def test_validate_plan_missing_goal(planner):
    plan = {"steps": [], "files_to_modify": [], "files_to_create": [], "dependencies": [], "testing_strategy": "test"}
    validated = planner._validate_plan(plan)
    assert validated["goal"] == "Implement requested changes"


def test_validate_plan_missing_steps(planner):
    plan = {"goal": "Fix bug", "files_to_modify": [], "files_to_create": [], "dependencies": [], "testing_strategy": "test"}
    validated = planner._validate_plan(plan)
    assert len(validated["steps"]) == 1
    assert validated["steps"][0]["id"] == 1


def test_validate_plan_missing_all_optional_fields(planner):
    plan = {}
    validated = planner._validate_plan(plan)
    assert validated["goal"] == "Implement requested changes"
    assert isinstance(validated["steps"], list)
    assert validated["files_to_modify"] == []
    assert validated["files_to_create"] == []
    assert validated["dependencies"] == []
    assert validated["testing_strategy"] != ""
