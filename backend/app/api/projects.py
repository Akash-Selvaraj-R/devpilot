import json
import logging
import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sse_starlette.sse import EventSourceResponse

from app.core.database import get_db
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
from app.schemas.project import (
    AgentEventResponse,
    CodeChangeResponse,
    ProjectCreate,
    ProjectResponse,
    ReportResponse,
    TaskCreate,
    TaskIdRequest,
    TaskResponse,
    TestRunResponse,
)
from app.services.project_service import ProjectService

logger = logging.getLogger(__name__)
router = APIRouter()
project_service = ProjectService()


@router.post("/api/projects", response_model=ProjectResponse)
async def create_project(body: ProjectCreate, db: AsyncSession = Depends(get_db)):
    project = Project(
        id=str(uuid.uuid4()),
        name=body.name,
        repo_url=body.repo_url,
        branch=body.branch,
        status=ProjectStatus.CREATED,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
    )
    db.add(project)
    await db.flush()
    result = await db.execute(select(func.count(Task.id)).where(Task.project_id == project.id))
    task_count = result.scalar() or 0
    return ProjectResponse(
        id=project.id,
        name=project.name,
        repo_url=project.repo_url,
        branch=project.branch,
        status=project.status.value,
        created_at=project.created_at,
        updated_at=project.updated_at,
        task_count=task_count,
    )


@router.get("/api/projects", response_model=list[ProjectResponse])
async def list_projects(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Project).order_by(Project.created_at.desc()))
    projects = result.scalars().all()
    responses = []
    for project in projects:
        count_result = await db.execute(select(func.count(Task.id)).where(Task.project_id == project.id))
        task_count = count_result.scalar() or 0
        responses.append(ProjectResponse(
            id=project.id,
            name=project.name,
            repo_url=project.repo_url,
            branch=project.branch,
            status=project.status.value,
            created_at=project.created_at,
            updated_at=project.updated_at,
            task_count=task_count,
        ))
    return responses


@router.get("/api/projects/{project_id}", response_model=ProjectResponse)
async def get_project(project_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Project).where(Project.id == project_id))
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    count_result = await db.execute(select(func.count(Task.id)).where(Task.project_id == project.id))
    task_count = count_result.scalar() or 0
    return ProjectResponse(
        id=project.id,
        name=project.name,
        repo_url=project.repo_url,
        branch=project.branch,
        status=project.status.value,
        created_at=project.created_at,
        updated_at=project.updated_at,
        task_count=task_count,
    )


@router.post("/api/projects/{project_id}/analyze")
async def analyze_project(project_id: str, background_tasks: BackgroundTasks, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Project).where(Project.id == project_id))
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    background_tasks.add_task(_run_background, project_id)
    return {"status": "analysis_started", "project_id": project_id}


@router.post("/api/projects/{project_id}/plan")
async def plan_project(project_id: str, body: TaskCreate, background_tasks: BackgroundTasks, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Project).where(Project.id == project_id))
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    background_tasks.add_task(_run_plan_background, project_id, body.description)
    return {"status": "planning_started", "project_id": project_id}


@router.post("/api/projects/{project_id}/implement")
async def implement_project(project_id: str, body: TaskIdRequest, background_tasks: BackgroundTasks, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Project).where(Project.id == project_id))
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    background_tasks.add_task(_run_implement_background, project_id, body.task_id)
    return {"status": "implementation_started", "project_id": project_id, "task_id": body.task_id}


@router.post("/api/projects/{project_id}/test")
async def test_project(project_id: str, body: TaskIdRequest, background_tasks: BackgroundTasks, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Project).where(Project.id == project_id))
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    background_tasks.add_task(_run_test_background, project_id, body.task_id)
    return {"status": "testing_started", "project_id": project_id, "task_id": body.task_id}


@router.post("/api/projects/{project_id}/debug")
async def debug_project(project_id: str, body: TaskIdRequest, background_tasks: BackgroundTasks, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Project).where(Project.id == project_id))
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    background_tasks.add_task(_run_debug_background, project_id, body.task_id)
    return {"status": "debugging_started", "project_id": project_id, "task_id": body.task_id}


@router.post("/api/projects/{project_id}/report")
async def generate_report(project_id: str, body: TaskIdRequest, background_tasks: BackgroundTasks, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Project).where(Project.id == project_id))
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    background_tasks.add_task(_run_report_background, project_id, body.task_id)
    return {"status": "report_started", "project_id": project_id, "task_id": body.task_id}


@router.get("/api/tasks/{task_id}", response_model=TaskResponse)
async def get_task(task_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Task).where(Task.id == task_id))
    task = result.scalar_one_or_none()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return TaskResponse(
        id=task.id,
        project_id=task.project_id,
        description=task.description,
        status=task.status.value,
        result=task.result,
        created_at=task.created_at,
    )


@router.get("/api/tasks/{task_id}/events")
async def get_task_events(task_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Task).where(Task.id == task_id))
    task = result.scalar_one_or_none()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    async def event_generator():
        last_id = None
        while True:
            query = select(AgentEvent).where(AgentEvent.task_id == task_id).order_by(AgentEvent.created_at)
            if last_id:
                query = query.where(AgentEvent.id > last_id)
            events_result = await db.execute(query)
            events = events_result.scalars().all()
            for event in events:
                last_id = event.id
                yield {
                    "event": event.event_type,
                    "data": event.data,
                    "id": event.id,
                }
            task_result = await db.execute(select(Task.status).where(Task.id == task_id))
            status = task_result.scalar()
            if status in (TaskStatus.COMPLETED, TaskStatus.FAILED):
                yield {"event": "complete", "data": json.dumps({"status": status.value})}
                break
            import asyncio
            await asyncio.sleep(1)

    return EventSourceResponse(event_generator())


async def _run_background(project_id: str) -> None:
    from app.core.database import async_session
    async with async_session() as session:
        try:
            await project_service.analyze_project(project_id, session)
            await session.commit()
        except Exception as e:
            await session.rollback()
            logger.error("Background analysis failed: %s", str(e))


async def _run_plan_background(project_id: str, description: str) -> None:
    from app.core.database import async_session
    async with async_session() as session:
        try:
            await project_service.plan_project(project_id, description, session)
            await session.commit()
        except Exception as e:
            await session.rollback()
            logger.error("Background planning failed: %s", str(e))


async def _run_implement_background(project_id: str, task_id: str) -> None:
    from app.core.database import async_session
    async with async_session() as session:
        try:
            await project_service.implement_project(project_id, task_id, session)
            await session.commit()
        except Exception as e:
            await session.rollback()
            logger.error("Background implementation failed: %s", str(e))


async def _run_test_background(project_id: str, task_id: str) -> None:
    from app.core.database import async_session
    async with async_session() as session:
        try:
            await project_service.test_project(project_id, task_id, session)
            await session.commit()
        except Exception as e:
            await session.rollback()
            logger.error("Background testing failed: %s", str(e))


async def _run_debug_background(project_id: str, task_id: str) -> None:
    from app.core.database import async_session
    async with async_session() as session:
        try:
            await project_service.debug_project(project_id, task_id, session)
            await session.commit()
        except Exception as e:
            await session.rollback()
            logger.error("Background debugging failed: %s", str(e))


async def _run_report_background(project_id: str, task_id: str) -> None:
    from app.core.database import async_session
    async with async_session() as session:
        try:
            await project_service.generate_report(project_id, task_id, session)
            await session.commit()
        except Exception as e:
            await session.rollback()
            logger.error("Background report generation failed: %s", str(e))


# --- New endpoints for task details, project tasks, and project data ---


@router.get("/api/tasks/{task_id}/changes", response_model=list[CodeChangeResponse])
async def get_task_code_changes(task_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(CodeChange).where(CodeChange.task_id == task_id).order_by(CodeChange.created_at)
    )
    changes = result.scalars().all()
    return [
        CodeChangeResponse(
            id=c.id, task_id=c.task_id, file_path=c.file_path,
            operation=c.operation, content=c.content, diff=c.diff, created_at=c.created_at,
        )
        for c in changes
    ]


@router.get("/api/tasks/{task_id}/tests", response_model=list[TestRunResponse])
async def get_task_test_runs(task_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(TestRun).where(TestRun.task_id == task_id).order_by(TestRun.created_at)
    )
    runs = result.scalars().all()
    return [
        TestRunResponse(
            id=r.id, task_id=r.task_id, command=r.command,
            exit_code=r.exit_code, stdout=r.stdout, stderr=r.stderr,
            duration=r.duration, created_at=r.created_at,
        )
        for r in runs
    ]


@router.get("/api/tasks/{task_id}/report", response_model=ReportResponse)
async def get_task_report(task_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Report).where(Report.task_id == task_id).order_by(Report.created_at.desc()).limit(1)
    )
    report = result.scalar_one_or_none()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found for this task")
    return ReportResponse(
        id=report.id, task_id=report.task_id, summary=report.summary,
        files_changed=report.files_changed, features=report.features,
        tests_passed=report.tests_passed, tests_failed=report.tests_failed,
        issues=report.issues, security_notes=report.security_notes,
        score=report.score, created_at=report.created_at,
    )


@router.get("/api/projects/{project_id}/tasks", response_model=list[TaskResponse])
async def get_project_tasks(project_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Task).where(Task.project_id == project_id).order_by(Task.created_at.desc())
    )
    tasks = result.scalars().all()
    return [
        TaskResponse(
            id=t.id, project_id=t.project_id, description=t.description,
            status=t.status.value, result=t.result, created_at=t.created_at,
        )
        for t in tasks
    ]


@router.get("/api/projects/{project_id}/changes", response_model=list[CodeChangeResponse])
async def get_project_code_changes(project_id: str, db: AsyncSession = Depends(get_db)):
    task_ids_result = await db.execute(
        select(Task.id).where(Task.project_id == project_id)
    )
    task_ids = [r[0] for r in task_ids_result.all()]
    if not task_ids:
        return []
    result = await db.execute(
        select(CodeChange).where(CodeChange.task_id.in_(task_ids)).order_by(CodeChange.created_at)
    )
    changes = result.scalars().all()
    return [
        CodeChangeResponse(
            id=c.id, task_id=c.task_id, file_path=c.file_path,
            operation=c.operation, content=c.content, diff=c.diff, created_at=c.created_at,
        )
        for c in changes
    ]


@router.get("/api/projects/{project_id}/tests", response_model=list[TestRunResponse])
async def get_project_test_runs(project_id: str, db: AsyncSession = Depends(get_db)):
    task_ids_result = await db.execute(
        select(Task.id).where(Task.project_id == project_id)
    )
    task_ids = [r[0] for r in task_ids_result.all()]
    if not task_ids:
        return []
    result = await db.execute(
        select(TestRun).where(TestRun.task_id.in_(task_ids)).order_by(TestRun.created_at)
    )
    runs = result.scalars().all()
    return [
        TestRunResponse(
            id=r.id, task_id=r.task_id, command=r.command,
            exit_code=r.exit_code, stdout=r.stdout, stderr=r.stderr,
            duration=r.duration, created_at=r.created_at,
        )
        for r in runs
    ]


@router.get("/api/projects/{project_id}/reports", response_model=list[ReportResponse])
async def get_project_reports(project_id: str, db: AsyncSession = Depends(get_db)):
    task_ids_result = await db.execute(
        select(Task.id).where(Task.project_id == project_id)
    )
    task_ids = [r[0] for r in task_ids_result.all()]
    if not task_ids:
        return []
    result = await db.execute(
        select(Report).where(Report.task_id.in_(task_ids)).order_by(Report.created_at.desc())
    )
    reports = result.scalars().all()
    return [
        ReportResponse(
            id=r.id, task_id=r.task_id, summary=r.summary,
            files_changed=r.files_changed, features=r.features,
            tests_passed=r.tests_passed, tests_failed=r.tests_failed,
            issues=r.issues, security_notes=r.security_notes,
            score=r.score, created_at=r.created_at,
        )
        for r in reports
    ]


@router.get("/api/projects/{project_id}/health")
async def get_engineering_health(project_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Project).where(Project.id == project_id))
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    report_result = await db.execute(
        select(Report)
        .join(Task, Report.task_id == Task.id)
        .where(Task.project_id == project_id)
        .order_by(Report.created_at.desc())
        .limit(1)
    )
    report = report_result.scalar_one_or_none()

    if report and report.score:
        try:
            score = json.loads(report.score) if isinstance(report.score, str) else report.score
        except (json.JSONDecodeError, TypeError):
            score = {}
    else:
        score = {}

    overall = score.get("overall", 5) * 10
    return {
        "overall": overall,
        "code_quality": score.get("code_quality", 5) * 10,
        "architecture": score.get("architecture", 5) * 10,
        "testing": score.get("test_coverage", 5) * 10,
        "security": score.get("security", 7) * 10,
        "documentation": score.get("documentation", 5) * 10,
        "rating": "EXCELLENT" if overall >= 85 else "GOOD" if overall >= 70 else "NEEDS WORK",
    }


@router.delete("/api/projects/{project_id}")
async def delete_project(project_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Project).where(Project.id == project_id))
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    await db.delete(project)
    await db.flush()
    return {"status": "deleted", "project_id": project_id}
