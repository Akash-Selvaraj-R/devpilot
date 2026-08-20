import type { Project, Task, AgentEvent, CodeChange, TestRun, Report, RunRecord, EngineeringHealth } from '../types';

const API_BASE = '/api';

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${url}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new ApiError(response.status, error.detail || 'Request failed');
  }

  return response.json();
}

export async function createProject(data: {
  name: string;
  repo_url: string;
  branch?: string;
}): Promise<Project> {
  return request<Project>('/projects', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getProjects(): Promise<Project[]> {
  return request<Project[]>('/projects');
}

export async function getProject(id: string): Promise<Project> {
  return request<Project>(`/projects/${id}`);
}

export async function deleteProject(id: string): Promise<void> {
  await request(`/projects/${id}`, { method: 'DELETE' });
}

export async function analyzeProject(projectId: string): Promise<Task> {
  return request<Task>(`/projects/${projectId}/analyze`, {
    method: 'POST',
  });
}

export async function planProject(projectId: string, description: string): Promise<Task> {
  return request<Task>(`/projects/${projectId}/plan`, {
    method: 'POST',
    body: JSON.stringify({ description }),
  });
}

export async function implementProject(projectId: string, taskId: string): Promise<Task> {
  return request<Task>(`/projects/${projectId}/implement`, {
    method: 'POST',
    body: JSON.stringify({ task_id: taskId }),
  });
}

export async function testProject(projectId: string, taskId: string): Promise<Task> {
  return request<Task>(`/projects/${projectId}/test`, {
    method: 'POST',
    body: JSON.stringify({ task_id: taskId }),
  });
}

export async function debugProject(projectId: string, taskId: string): Promise<Task> {
  return request<Task>(`/projects/${projectId}/debug`, {
    method: 'POST',
    body: JSON.stringify({ task_id: taskId }),
  });
}

export async function generateReport(projectId: string, taskId: string): Promise<Task> {
  return request<Task>(`/projects/${projectId}/report`, {
    method: 'POST',
    body: JSON.stringify({ task_id: taskId }),
  });
}

export async function getTask(taskId: string): Promise<Task> {
  return request<Task>(`/tasks/${taskId}`);
}

export async function getTaskCodeChanges(taskId: string): Promise<CodeChange[]> {
  return request<CodeChange[]>(`/tasks/${taskId}/changes`);
}

export async function getTaskTestRuns(taskId: string): Promise<TestRun[]> {
  return request<TestRun[]>(`/tasks/${taskId}/tests`);
}

export async function getTaskReport(taskId: string): Promise<Report> {
  return request<Report>(`/tasks/${taskId}/report`);
}

export async function getProjectTasks(projectId: string): Promise<Task[]> {
  return request<Task[]>(`/projects/${projectId}/tasks`);
}

export async function getProjectCodeChanges(projectId: string): Promise<CodeChange[]> {
  return request<CodeChange[]>(`/projects/${projectId}/changes`);
}

export async function getProjectTestRuns(projectId: string): Promise<TestRun[]> {
  return request<TestRun[]>(`/projects/${projectId}/tests`);
}

export async function getProjectReports(projectId: string): Promise<Report[]> {
  return request<Report[]>(`/projects/${projectId}/reports`);
}

export async function getProjectRunHistory(projectId: string): Promise<RunRecord[]> {
  return request<RunRecord[]>(`/projects/${projectId}/runs`);
}

export async function getRunDetail(runId: string): Promise<RunRecord> {
  return request<RunRecord>(`/runs/${runId}`);
}

export async function getEngineeringHealth(projectId: string): Promise<EngineeringHealth> {
  return request<EngineeringHealth>(`/projects/${projectId}/health`);
}

export function getTaskEvents(taskId: string): EventSource {
  return new EventSource(`${API_BASE}/tasks/${taskId}/events`);
}

export async function getTaskEventsHistory(taskId: string): Promise<AgentEvent[]> {
  return request<AgentEvent[]>(`/tasks/${taskId}/events`);
}
