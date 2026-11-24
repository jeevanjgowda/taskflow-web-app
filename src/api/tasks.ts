import type { CreateTaskInput, Task, UpdateTaskInput } from '../types/task.ts';

async function parseJsonResponse<T>(response: Response): Promise<T> {
  const text = await response.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error('Unexpected response format from server.');
    }
  }

  if (!response.ok) {
    const message =
      data && typeof data === 'object' && 'error' in data && typeof data.error === 'string'
        ? data.error
        : `Request failed with status ${response.status}.`;
    throw new Error(message);
  }

  return data as T;
}

export async function fetchTasks(): Promise<Task[]> {
  const response = await fetch('/api/tasks', {
    method: 'GET',
    headers: { Accept: 'application/json' },
  });
  return parseJsonResponse<Task[]>(response);
}

export async function fetchTaskById(id: string): Promise<Task> {
  const response = await fetch(`/api/tasks/${encodeURIComponent(id)}`, {
    method: 'GET',
    headers: { Accept: 'application/json' },
  });
  return parseJsonResponse<Task>(response);
}

export async function createTask(input: CreateTaskInput): Promise<Task> {
  const response = await fetch('/api/tasks', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(input),
  });
  return parseJsonResponse<Task>(response);
}

export async function updateTask(id: string, input: UpdateTaskInput): Promise<Task> {
  const response = await fetch(`/api/tasks/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(input),
  });
  return parseJsonResponse<Task>(response);
}

export async function deleteTask(id: string): Promise<{ deleted: boolean; id: string }> {
  const response = await fetch(`/api/tasks/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: { Accept: 'application/json' },
  });
  return parseJsonResponse<{ deleted: boolean; id: string }>(response);
}
