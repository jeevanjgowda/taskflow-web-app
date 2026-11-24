import type {
  PriorityFilter,
  SortOption,
  StatusFilter,
  Task,
} from '../types/task.ts';

export function getTodayIsoDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function isTaskOverdue(task: Task, todayIso = getTodayIsoDate()): boolean {
  if (task.is_completed || !task.due_date) {
    return false;
  }
  return task.due_date < todayIso;
}

export function formatDueDate(dueDate: string | null): string {
  if (!dueDate) {
    return 'No due date';
  }
  const [yearStr, monthStr, dayStr] = dueDate.split('-');
  const date = new Date(Number(yearStr), Number(monthStr) - 1, Number(dayStr));
  if (Number.isNaN(date.getTime())) {
    return dueDate;
  }
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatCreatedAt(isoTimestamp: string): string {
  const date = new Date(isoTimestamp);
  if (Number.isNaN(date.getTime())) {
    return isoTimestamp;
  }
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function computeTaskCounts(tasks: Task[]) {
  const todayIso = getTodayIsoDate();
  let completed = 0;
  let pending = 0;
  let overdue = 0;

  for (const task of tasks) {
    if (task.is_completed) {
      completed += 1;
    } else {
      pending += 1;
      if (isTaskOverdue(task, todayIso)) {
        overdue += 1;
      }
    }
  }

  return {
    total: tasks.length,
    completed,
    pending,
    overdue,
  };
}

export function filterAndSortTasks(
  tasks: Task[],
  options: {
    searchQuery: string;
    priorityFilter: PriorityFilter;
    statusFilter: StatusFilter;
    sortBy: SortOption;
  },
): Task[] {
  const todayIso = getTodayIsoDate();
  const normalizedQuery = options.searchQuery.trim().toLowerCase();

  const filtered = tasks.filter((task) => {
    if (normalizedQuery && !task.title.toLowerCase().includes(normalizedQuery)) {
      return false;
    }

    if (options.priorityFilter !== 'All' && task.priority !== options.priorityFilter) {
      return false;
    }

    if (options.statusFilter === 'Completed' && !task.is_completed) {
      return false;
    }
    if (options.statusFilter === 'Pending' && task.is_completed) {
      return false;
    }
    if (options.statusFilter === 'Overdue' && !isTaskOverdue(task, todayIso)) {
      return false;
    }

    return true;
  });

  return filtered.sort((a, b) => {
    switch (options.sortBy) {
      case 'created_asc':
        return a.created_at.localeCompare(b.created_at);
      case 'created_desc':
        return b.created_at.localeCompare(a.created_at);
      case 'due_asc': {
        if (!a.due_date && !b.due_date) {
          return b.created_at.localeCompare(a.created_at);
        }
        if (!a.due_date) return 1;
        if (!b.due_date) return -1;
        const cmp = a.due_date.localeCompare(b.due_date);
        return cmp !== 0 ? cmp : b.created_at.localeCompare(a.created_at);
      }
      case 'due_desc': {
        if (!a.due_date && !b.due_date) {
          return b.created_at.localeCompare(a.created_at);
        }
        if (!a.due_date) return 1;
        if (!b.due_date) return -1;
        const cmp = b.due_date.localeCompare(a.due_date);
        return cmp !== 0 ? cmp : b.created_at.localeCompare(a.created_at);
      }
      default:
        return 0;
    }
  });
}
