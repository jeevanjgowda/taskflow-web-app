import { randomUUID } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';

export type TaskPriority = 'Low' | 'Medium' | 'High';

export interface TaskRecord {
  id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  due_date: string | null;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateTaskPayload {
  title: unknown;
  description?: unknown;
  priority?: unknown;
  due_date?: unknown;
}

export interface UpdateTaskPayload {
  title?: unknown;
  description?: unknown;
  priority?: unknown;
  due_date?: unknown;
  is_completed?: unknown;
}

export class ValidationError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.name = 'ValidationError';
    this.statusCode = statusCode;
  }
}

const VALID_PRIORITIES = new Set<TaskPriority>(['Low', 'Medium', 'High']);
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'tasks.json');

let writeQueue: Promise<unknown> = Promise.resolve();

function runSerialized<T>(fn: () => Promise<T>): Promise<T> {
  const next = writeQueue.then(fn, fn);
  writeQueue = next.then(
    () => undefined,
    () => undefined,
  );
  return next;
}

function isValidDateString(value: string): boolean {
  if (!DATE_REGEX.test(value)) {
    return false;
  }
  const [yearStr, monthStr, dayStr] = value.split('-');
  const year = Number(yearStr);
  const month = Number(monthStr);
  const day = Number(dayStr);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

function validateTitle(raw: unknown): string {
  if (typeof raw !== 'string') {
    throw new ValidationError('Task title is required and must be a string.');
  }
  const trimmed = raw.trim();
  if (trimmed.length === 0) {
    throw new ValidationError('Task title cannot be empty.');
  }
  if (trimmed.length > 160) {
    throw new ValidationError('Task title must be 160 characters or fewer.');
  }
  return trimmed;
}

function validateDescription(raw: unknown): string {
  if (raw === undefined || raw === null) {
    return '';
  }
  if (typeof raw !== 'string') {
    throw new ValidationError('Task description must be a string.');
  }
  const trimmed = raw.trim();
  if (trimmed.length > 2000) {
    throw new ValidationError('Task description must be 2000 characters or fewer.');
  }
  return trimmed;
}

function validatePriority(raw: unknown, defaultValue: TaskPriority = 'Medium'): TaskPriority {
  if (raw === undefined || raw === null || raw === '') {
    return defaultValue;
  }
  if (typeof raw !== 'string' || !VALID_PRIORITIES.has(raw as TaskPriority)) {
    throw new ValidationError('Priority must be Low, Medium, or High.');
  }
  return raw as TaskPriority;
}

function validateDueDate(raw: unknown): string | null {
  if (raw === undefined || raw === null || raw === '') {
    return null;
  }
  if (typeof raw !== 'string') {
    throw new ValidationError('Due date must be a valid YYYY-MM-DD date string.');
  }
  const trimmed = raw.trim();
  if (!isValidDateString(trimmed)) {
    throw new ValidationError('Due date must be a valid YYYY-MM-DD calendar date.');
  }
  return trimmed;
}

export function assertValidUuid(id: string): void {
  if (!UUID_REGEX.test(id)) {
    throw new ValidationError('Invalid task ID format.');
  }
}

async function ensureStoreFile(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.writeFile(DATA_FILE, '[]\n', 'utf8');
  }
}

async function readAllFromDisk(): Promise<TaskRecord[]> {
  await ensureStoreFile();
  const content = await fs.readFile(DATA_FILE, 'utf8');
  try {
    const parsed: unknown = JSON.parse(content);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed as TaskRecord[];
  } catch {
    return [];
  }
}

async function writeAllToDisk(tasks: TaskRecord[]): Promise<void> {
  await ensureStoreFile();
  const tempFile = `${DATA_FILE}.${randomUUID()}.tmp`;
  await fs.writeFile(tempFile, JSON.stringify(tasks, null, 2) + '\n', 'utf8');
  await fs.rename(tempFile, DATA_FILE);
}

export async function listTasks(): Promise<TaskRecord[]> {
  return runSerialized(async () => {
    const tasks = await readAllFromDisk();
    return tasks.sort((a, b) => b.created_at.localeCompare(a.created_at));
  });
}

export async function getTaskById(id: string): Promise<TaskRecord | null> {
  assertValidUuid(id);
  return runSerialized(async () => {
    const tasks = await readAllFromDisk();
    return tasks.find((task) => task.id === id) ?? null;
  });
}

export async function createTask(payload: CreateTaskPayload): Promise<TaskRecord> {
  const title = validateTitle(payload.title);
  const description = validateDescription(payload.description);
  const priority = validatePriority(payload.priority, 'Medium');
  const due_date = validateDueDate(payload.due_date);
  const now = new Date().toISOString();

  const newTask: TaskRecord = {
    id: randomUUID(),
    title,
    description,
    priority,
    due_date,
    is_completed: false,
    created_at: now,
    updated_at: now,
  };

  return runSerialized(async () => {
    const tasks = await readAllFromDisk();
    tasks.unshift(newTask);
    await writeAllToDisk(tasks);
    return newTask;
  });
}

export async function updateTask(id: string, payload: UpdateTaskPayload): Promise<TaskRecord | null> {
  assertValidUuid(id);

  if (
    payload.title === undefined &&
    payload.description === undefined &&
    payload.priority === undefined &&
    payload.due_date === undefined &&
    payload.is_completed === undefined
  ) {
    throw new ValidationError('At least one updatable field must be provided.');
  }

  return runSerialized(async () => {
    const tasks = await readAllFromDisk();
    const index = tasks.findIndex((task) => task.id === id);
    if (index === -1) {
      return null;
    }

    const existing = tasks[index];
    const nextTitle = payload.title !== undefined ? validateTitle(payload.title) : existing.title;
    const nextDescription =
      payload.description !== undefined ? validateDescription(payload.description) : existing.description;
    const nextPriority =
      payload.priority !== undefined ? validatePriority(payload.priority, existing.priority) : existing.priority;
    const nextDueDate = payload.due_date !== undefined ? validateDueDate(payload.due_date) : existing.due_date;

    let nextCompleted = existing.is_completed;
    if (payload.is_completed !== undefined) {
      if (typeof payload.is_completed !== 'boolean') {
        throw new ValidationError('is_completed must be a boolean.');
      }
      nextCompleted = payload.is_completed;
    }

    const updated: TaskRecord = {
      ...existing,
      title: nextTitle,
      description: nextDescription,
      priority: nextPriority,
      due_date: nextDueDate,
      is_completed: nextCompleted,
      updated_at: new Date().toISOString(),
    };

    tasks[index] = updated;
    await writeAllToDisk(tasks);
    return updated;
  });
}

export async function deleteTask(id: string): Promise<boolean> {
  assertValidUuid(id);
  return runSerialized(async () => {
    const tasks = await readAllFromDisk();
    const nextTasks = tasks.filter((task) => task.id !== id);
    if (nextTasks.length === tasks.length) {
      return false;
    }
    await writeAllToDisk(nextTasks);
    return true;
  });
}
