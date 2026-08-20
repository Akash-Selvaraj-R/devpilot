import os
from pathlib import Path

import pytest

from app.agents.repository_analyzer import RepositoryAnalyzer

DEMO_REPO_PATH = str(
    Path(__file__).resolve().parent.parent.parent / "examples" / "demo-repository"
)


@pytest.fixture
def analyzer():
    return RepositoryAnalyzer()


@pytest.fixture
def demo_analysis(analyzer):
    return analyzer.analyze(DEMO_REPO_PATH)


def test_analyze_demo_repository(analyzer, demo_analysis):
    assert "error" not in demo_analysis
    assert demo_analysis["name"] == "demo-repository"
    assert "languages" in demo_analysis
    assert "frameworks" in demo_analysis
    assert "files_count" in demo_analysis
    assert "entry_points" in demo_analysis
    assert "test_files" in demo_analysis
    assert "structure" in demo_analysis
    assert "summary" in demo_analysis


def test_detect_languages(demo_analysis):
    languages = demo_analysis["languages"]
    assert "Python" in languages
    assert languages["Python"] > 0
    assert "JavaScript" in languages
    assert languages["JavaScript"] > 0


def test_detect_frameworks(demo_analysis):
    frameworks = demo_analysis["frameworks"]
    assert "Flask" in frameworks


def test_count_files(demo_analysis):
    assert demo_analysis["files_count"] > 0


def test_identify_entry_points(demo_analysis):
    entry_points = demo_analysis["entry_points"]
    assert any("app.py" in ep for ep in entry_points)


def test_identify_tests(demo_analysis):
    test_files = demo_analysis["test_files"]
    assert len(test_files) > 0
    assert any("test_" in f or ".test." in f for f in test_files)


def test_analyze_nonexistent_path(analyzer):
    result = analyzer.analyze("/nonexistent/path/that/does/not/exist")
    assert "error" in result


def test_summary_contains_project_name(demo_analysis):
    summary = demo_analysis["summary"]
    assert "demo-repository" in summary


def test_dependencies_detected(demo_analysis):
    deps = demo_analysis["dependencies"]
    assert "pip" in deps
    assert len(deps["pip"]) > 0


def test_structure_is_dict(demo_analysis):
    structure = demo_analysis["structure"]
    assert isinstance(structure, dict)
    assert len(structure) > 0
