import json
import logging
import os

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.agents.debugging_agent import DebuggingAgent
from app.agents.implementation_agent import ImplementationAgent
from app.agents.planning_agent import PlanningAgent
from app.agents.report_agent import ReportAgent
from app.agents.repository_analyzer import RepositoryAnalyzer
from app.agents.test_agent import TestAgent
from app.core.ai_provider import AIProvider, AIServiceError
from app.models.project import (
    AgentEvent,
    CodeChange,
    Project,
    ProjectStatus,
    Report,
    Task,
    TaskStatus,
    TestRun,
)
from app.services.repo_service import RepoService

logger = logging.getLogger(__name__)


class ProjectService:
    def __init__(self) -> None:
        self.repo_service = RepoService()
        self.analyzer = RepositoryAnalyzer()
        self.planner = PlanningAgent()
        self.implementer = ImplementationAgent()
        self.tester = TestAgent()
        self.debugger = DebuggingAgent()
        self.reporter = ReportAgent()
        self.ai = AIProvider()

    async def _emit_event(self, db: AsyncSession, task_id: str, event_type: str, data: dict) -> None:
        event = AgentEvent(
            task_id=task_id,
            event_type=event_type,
            data=json.dumps(data),
        )
        db.add(event)
        await db.flush()

    async def _get_project(self, db: AsyncSession, project_id: str) -> Project:
        result = await db.execute(select(Project).where(Project.id == project_id))
        project = result.scalar_one_or_none()
        if not project:
            raise ValueError(f"Project {project_id} not found")
        return project

    async def _get_task(self, db: AsyncSession, task_id: str) -> Task:
        result = await db.execute(select(Task).where(Task.id == task_id))
        task = result.scalar_one_or_none()
        if not task:
            raise ValueError(f"Task {task_id} not found")
        return task

    async def _create_task(self, db: AsyncSession, project_id: str, description: str) -> Task:
        task = Task(project_id=project_id, description=description, status=TaskStatus.PENDING)
        db.add(task)
        await db.flush()
        return task

    def _ensure_repo(self, project: Project) -> str:
        repo_path = self.repo_service.get_repo_path(project.id)
        if not os.path.exists(repo_path):
            self.repo_service.clone_repo(project.repo_url, project.id)
        return repo_path

    async def analyze_project(self, project_id: str, db: AsyncSession) -> dict:
        project = await self._get_project(db, project_id)
        project.status = ProjectStatus.ANALYZING
        await db.flush()

        task = await self._create_task(db, project_id, "Analyze repository")
        task.status = TaskStatus.RUNNING
        await db.flush()
        await self._emit_event(db, task.id, "analysis_started", {"message": "Starting repository analysis"})

        try:
            repo_path = self._ensure_repo(project)
            summary = self.analyzer.analyze(repo_path)
            task.status = TaskStatus.COMPLETED
            task.result = json.dumps(summary)
            project.status = ProjectStatus.CREATED
            await self._emit_event(db, task.id, "analysis_completed", {"summary": summary.get("summary", "")})
            return summary
        except Exception as e:
            task.status = TaskStatus.FAILED
            task.result = json.dumps({"error": str(e)})
            project.status = ProjectStatus.FAILED
            await self._emit_event(db, task.id, "analysis_failed", {"error": str(e)})
            raise

    async def plan_project(self, project_id: str, task_description: str, db: AsyncSession) -> dict:
        project = await self._get_project(db, project_id)
        project.status = ProjectStatus.PLANNING
        await db.flush()

        task = await self._create_task(db, project_id, task_description)
        task.status = TaskStatus.RUNNING
        await db.flush()
        await self._emit_event(db, task.id, "planning_started", {"description": task_description})

        try:
            repo_path = self._ensure_repo(project)
            repo_summary = self.analyzer.analyze(repo_path)
            relevant_files = self._get_relevant_files(repo_path, task_description, repo_summary)
            plan = await self.planner.plan(repo_summary, task_description, relevant_files, self.ai)
            task.status = TaskStatus.COMPLETED
            task.result = json.dumps(plan)
            project.status = ProjectStatus.PLANNING
            await self._emit_event(db, task.id, "planning_completed", {"goal": plan.get("goal", "")})
            return plan
        except AIServiceError as e:
            task.status = TaskStatus.FAILED
            task.result = json.dumps({"error": str(e)})
            project.status = ProjectStatus.FAILED
            await self._emit_event(db, task.id, "planning_failed", {"error": str(e)})
            raise
        except Exception as e:
            task.status = TaskStatus.FAILED
            task.result = json.dumps({"error": str(e)})
            project.status = ProjectStatus.FAILED
            await self._emit_event(db, task.id, "planning_failed", {"error": str(e)})
            raise

    async def implement_project(self, project_id: str, task_id: str, db: AsyncSession) -> list[dict]:
        project = await self._get_project(db, project_id)
        task = await self._get_task(db, task_id)
        project.status = ProjectStatus.IMPLEMENTING
        task.status = TaskStatus.RUNNING
        await db.flush()
        await self._emit_event(db, task.id, "implementation_started", {})

        try:
            repo_path = self._ensure_repo(project)
            repo_summary = self.analyzer.analyze(repo_path)
            plan = json.loads(task.result) if task.result else {}
            changes = await self.implementer.implement(plan, repo_summary, self.ai)
            repo_service = self.repo_service
            for change in changes:
                file_path = os.path.join(repo_path, change["file"])
                if change["operation"] == "create":
                    repo_service.write_file(file_path, change["content"])
                elif change["operation"] == "modify":
                    repo_service.write_file(file_path, change["content"])

                code_change = CodeChange(
                    task_id=task.id,
                    file_path=change["file"],
                    operation=change["operation"],
                    content=change.get("content", ""),
                    diff=change.get("diff", ""),
                )
                db.add(code_change)

            task.status = TaskStatus.COMPLETED
            task.result = json.dumps({"changes": changes})
            project.status = ProjectStatus.IMPLEMENTING
            await self._emit_event(db, task.id, "implementation_completed", {"files_changed": len(changes)})
            return changes
        except AIServiceError as e:
            task.status = TaskStatus.FAILED
            task.result = json.dumps({"error": str(e)})
            project.status = ProjectStatus.FAILED
            await self._emit_event(db, task.id, "implementation_failed", {"error": str(e)})
            raise
        except Exception as e:
            task.status = TaskStatus.FAILED
            task.result = json.dumps({"error": str(e)})
            project.status = ProjectStatus.FAILED
            await self._emit_event(db, task.id, "implementation_failed", {"error": str(e)})
            raise

    async def test_project(self, project_id: str, task_id: str, db: AsyncSession) -> dict:
        project = await self._get_project(db, project_id)
        task = await self._get_task(db, task_id)
        project.status = ProjectStatus.TESTING
        task.status = TaskStatus.RUNNING
        await db.flush()
        await self._emit_event(db, task.id, "testing_started", {})

        try:
            repo_path = self.repo_service.get_repo_path(project.id)
            test_results = await self.tester.run_tests(repo_path)

            test_run = TestRun(
                task_id=task.id,
                command=test_results.get("command", ""),
                exit_code=test_results.get("exit_code", -1),
                stdout=test_results.get("stdout", ""),
                stderr=test_results.get("stderr", ""),
                duration=test_results.get("duration", 0),
            )
            db.add(test_run)

            task.status = TaskStatus.COMPLETED
            task.result = json.dumps(test_results)
            project.status = ProjectStatus.TESTING
            await self._emit_event(db, task.id, "testing_completed", {
                "exit_code": test_results.get("exit_code", -1),
                "duration": test_results.get("duration", 0),
            })
            return test_results
        except Exception as e:
            task.status = TaskStatus.FAILED
            task.result = json.dumps({"error": str(e)})
            project.status = ProjectStatus.FAILED
            await self._emit_event(db, task.id, "testing_failed", {"error": str(e)})
            raise

    async def debug_project(self, project_id: str, task_id: str, db: AsyncSession) -> dict:
        project = await self._get_project(db, project_id)
        task = await self._get_task(db, task_id)
        project.status = ProjectStatus.DEBUGGING
        task.status = TaskStatus.RUNNING
        await db.flush()
        await self._emit_event(db, task.id, "debugging_started", {})

        try:
            repo_path = self.repo_service.get_repo_path(project.id)
            task_data = json.loads(task.result) if task.result else {}
            test_output = task_data if "exit_code" in task_data else {}
            changes_result = await db.execute(
                select(CodeChange).where(CodeChange.task_id == task_id)
            )
            changes = changes_result.scalars().all()
            implementation = [
                {"file": c.file_path, "operation": c.operation, "content": c.content, "diff": c.diff}
                for c in changes
            ]
            source_code: dict[str, str] = {}
            for change in changes:
                full_path = os.path.join(repo_path, change.file_path)
                if os.path.exists(full_path):
                    source_code[change.file_path] = self.repo_service.read_file(full_path)

            diagnosis = await self.debugger.diagnate(
                task={"description": task.description},
                implementation=implementation,
                test_output=test_output,
                source_code=source_code,
                ai_provider=self.ai,
            )

            task.status = TaskStatus.COMPLETED
            task.result = json.dumps(diagnosis)
            project.status = ProjectStatus.DEBUGGING
            await self._emit_event(db, task.id, "debugging_completed", {
                "root_cause": diagnosis.get("root_cause", ""),
                "confidence": diagnosis.get("confidence", 0),
            })
            return diagnosis
        except Exception as e:
            task.status = TaskStatus.FAILED
            task.result = json.dumps({"error": str(e)})
            project.status = ProjectStatus.FAILED
            await self._emit_event(db, task.id, "debugging_failed", {"error": str(e)})
            raise

    async def generate_report(self, project_id: str, task_id: str, db: AsyncSession) -> dict:
        project = await self._get_project(db, project_id)
        task = await self._get_task(db, task_id)
        await self._emit_event(db, task.id, "report_started", {})

        try:
            changes_result = await db.execute(
                select(CodeChange).where(CodeChange.task_id == task_id)
            )
            changes = changes_result.scalars().all()
            implementation = [
                {"file": c.file_path, "operation": c.operation, "content": c.content, "diff": c.diff}
                for c in changes
            ]

            test_result = await db.execute(
                select(TestRun).where(TestRun.task_id == task_id).order_by(TestRun.created_at.desc()).limit(1)
            )
            test_run = test_result.scalar_one_or_none()
            test_results = {
                "command": test_run.command if test_run else "",
                "exit_code": test_run.exit_code if test_run else -1,
                "stdout": test_run.stdout if test_run else "",
                "stderr": test_run.stderr if test_run else "",
                "duration": test_run.duration if test_run else 0,
            }

            report_data = await self.reporter.generate(
                task={"description": task.description},
                changes=implementation,
                test_results=test_results,
                ai_provider=self.ai,
            )

            report = Report(
                task_id=task.id,
                summary=report_data.get("summary", ""),
                files_changed=json.dumps(report_data.get("files_changed", [])),
                features=json.dumps(report_data.get("features_implemented", [])),
                tests_passed=report_data.get("tests_passed", 0),
                tests_failed=report_data.get("tests_failed", 0),
                issues=json.dumps(report_data.get("issues", [])),
                security_notes=json.dumps(report_data.get("security_considerations", [])),
                score=json.dumps(report_data.get("score", {})),
            )
            db.add(report)

            project.status = ProjectStatus.COMPLETE
            task.status = TaskStatus.COMPLETED
            await self._emit_event(db, task.id, "report_completed", {"summary": report_data.get("summary", "")})
            return report_data
        except Exception as e:
            task.status = TaskStatus.FAILED
            task.result = json.dumps({"error": str(e)})
            await self._emit_event(db, task.id, "report_failed", {"error": str(e)})
            raise

    def _get_relevant_files(self, repo_path: str, task_description: str, repo_summary: dict) -> list[str]:
        entry_points = repo_summary.get("entry_points", [])
        test_files = repo_summary.get("test_files", [])
        relevant = list(set(entry_points + test_files))
        structure = repo_summary.get("structure", {})
        self._collect_files_from_structure(structure, relevant, max_depth=2)
        return relevant[:30]

    def _collect_files_from_structure(self, structure: dict, files: list, max_depth: int, depth: int = 0) -> None:
        if depth >= max_depth:
            return
        for name, value in structure.items():
            if value is None:
                files.append(name)
            else:
                self._collect_files_from_structure(value, files, max_depth, depth + 1)
