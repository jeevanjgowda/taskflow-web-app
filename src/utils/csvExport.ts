import type { Task } from '../types/task.ts';
import { getTodayIsoDate, isTaskOverdue } from './taskHelpers.ts';

const FORMULA_PREFIX_REGEX = /^[=+\-@\t\r]/;

function sanitizeAndEscapeCsvField(rawValue: string | null | undefined): string {
  const value = rawValue ?? '';
  const neutralized = FORMULA_PREFIX_REGEX.test(value) ? `'${value}` : value;
  const escaped = neutralized.replace(/"/g, '""');

  if (/[",\r\n]/.test(escaped) || escaped !== neutralized || neutralized !== value) {
    return `"${escaped}"`;
  }
  return escaped;
}

export function buildTasksCsv(tasks: Task[]): string {
  const todayIso = getTodayIsoDate();
  const headers = [
    'ID',
    'Title',
    'Description',
    'Priority',
    'Due Date',
    'Status',
    'Created At',
    'Updated At',
  ];

  const rows = tasks.map((task) => {
    const status = task.is_completed
      ? 'Completed'
      : isTaskOverdue(task, todayIso)
      ? 'Overdue'
      : 'Pending';

    return [
      task.id,
      task.title,
      task.description,
      task.priority,
      task.due_date ?? '',
      status,
      task.created_at,
      task.updated_at,
    ]
      .map(sanitizeAndEscapeCsvField)
      .join(',');
  });

  return '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
}

export function downloadTasksCsv(tasks: Task[], viewSlug = 'tasks'): void {
  if (tasks.length === 0) {
    return;
  }

  const csvContent = buildTasksCsv(tasks);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const safeSlug = viewSlug.toLowerCase().replace(/[^a-z0-9-]+/g, '-');
  const filename = `taskflow-${safeSlug}-${getTodayIsoDate()}.csv`;

  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  window.setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 1000);
}
