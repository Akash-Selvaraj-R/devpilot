import pytest


@pytest.mark.asyncio
async def test_health_check(client):
    response = await client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "DevPilot Backend"


@pytest.mark.asyncio
async def test_create_project(client):
    payload = {
        "name": "Test Project",
        "repo_url": "https://github.com/test/repo.git",
        "branch": "main",
    }
    response = await client.post("/api/projects", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Test Project"
    assert data["repo_url"] == "https://github.com/test/repo.git"
    assert data["branch"] == "main"
    assert data["status"] == "created"
    assert "id" in data
    assert "created_at" in data
    assert "updated_at" in data
    assert data["task_count"] == 0


@pytest.mark.asyncio
async def test_list_projects(client):
    await client.post(
        "/api/projects",
        json={
            "name": "Project A",
            "repo_url": "https://github.com/test/a.git",
        },
    )
    await client.post(
        "/api/projects",
        json={
            "name": "Project B",
            "repo_url": "https://github.com/test/b.git",
        },
    )

    response = await client.get("/api/projects")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 2
    names = {p["name"] for p in data}
    assert "Project A" in names
    assert "Project B" in names


@pytest.mark.asyncio
async def test_get_project(client):
    create_resp = await client.post(
        "/api/projects",
        json={
            "name": "Get Me",
            "repo_url": "https://github.com/test/get.git",
        },
    )
    project_id = create_resp.json()["id"]

    response = await client.get(f"/api/projects/{project_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == project_id
    assert data["name"] == "Get Me"


@pytest.mark.asyncio
async def test_create_project_invalid(client):
    response = await client.post("/api/projects", json={"name": "Missing repo"})
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_create_project_default_branch(client):
    payload = {
        "name": "Default Branch Project",
        "repo_url": "https://github.com/test/default.git",
    }
    response = await client.post("/api/projects", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["branch"] == "main"
