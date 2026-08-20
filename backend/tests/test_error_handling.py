import pytest


@pytest.mark.asyncio
async def test_project_not_found(client):
    response = await client.get("/api/projects/nonexistent-id-12345")
    assert response.status_code == 404
    data = response.json()
    assert "detail" in data


@pytest.mark.asyncio
async def test_invalid_project_id(client):
    response = await client.get("/api/projects/!!!invalid!!!")
    assert response.status_code in (404, 422)


@pytest.mark.asyncio
async def test_create_project_missing_fields(client):
    response = await client.post("/api/projects", json={})
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_analyze_nonexistent_project(client):
    response = await client.post("/api/projects/fake-id-999/analyze")
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_plan_nonexistent_project(client):
    response = await client.post(
        "/api/projects/fake-id-999/plan",
        json={"description": "Add feature"},
    )
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_get_task_not_found(client):
    response = await client.get("/api/tasks/nonexistent-task-id")
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_task_events_not_found(client):
    response = await client.get("/api/tasks/fake-task/events")
    assert response.status_code == 404
