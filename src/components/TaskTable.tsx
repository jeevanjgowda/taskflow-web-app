import {
  AlertCircle,
  Check,
  Edit3,
  Flag,
  Plus,
  Trash2,
} from 'lucide-react';
import type { Task, TaskPriority } from '../types/task.ts';
import {
  formatCreatedAt,
  formatDueDate,
  isTaskOverdue,
} from '../utils/taskHelpers.ts';

interface TaskTableProps {
  tasks: Task[];
  totalTaskCount: number;
  loading: boolean;
  error: string | null;
  togglingTaskIds: Set<string>;
  onRetry: () => void;
  onCreateNew: () => void;
  onClearFilters: () => void;
  onToggleComplete: (task: Task) => void;
  onEditTask: (task: Task) => void;
  onRequestDelete: (task: Task) => void;
}

function getPriorityDisplay(priority: TaskPriority): {
  label: string;
  className: string;
} {
  switch (priority) {
    case 'High':
      return { label: 'High', className: 'text-red-700' };
    case 'Medium':
      return { label: 'Medium', className: 'text-amber-700' };
    case 'Low':
      return { label: 'Low', className: 'text-emerald-700' };
  }
}

export function TaskTable({
  tasks,
  totalTaskCount,
  loading,
  error,
  togglingTaskIds,
  onRetry,
  onCreateNew,
  onClearFilters,
  onToggleComplete,
  onEditTask,
  onRequestDelete,
}: TaskTableProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-b-xl divide-y divide-slate-200" aria-busy="true" aria-label="Loading tasks">
        {[0, 1, 2, 3].map((row) => (
          <div key={row} className="flex items-center justify-between gap-4 px-5 py-4 animate-pulse">
            <div className="flex items-center gap-3 flex-1">
              <div className="h-5 w-5 rounded bg-slate-200" />
              <div className="space-y-2 flex-1 max-w-md">
                <div className="h-4 w-2/3 rounded bg-slate-200" />
                <div className="h-3 w-1/2 rounded bg-slate-100" />
              </div>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <div className="h-4 w-16 rounded bg-slate-100" />
              <div className="h-4 w-24 rounded bg-slate-100" />
              <div className="h-4 w-20 rounded bg-slate-100" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-b-xl px-6 py-12 text-center">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-red-600">
          <AlertCircle className="h-5 w-5" aria-hidden="true" />
        </div>
        <h3 className="mt-3 font-display text-base font-semibold text-slate-900">
          Unable to load tasks
        </h3>
        <p className="mt-1 text-sm text-slate-600 max-w-md mx-auto">{error}</p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  if (totalTaskCount === 0) {
    return (
      <div className="bg-white rounded-b-xl px-6 py-14 text-center">
        <h3 className="font-display text-base font-semibold text-slate-900">
          No tasks created yet
        </h3>
        <p className="mt-1.5 text-sm text-slate-500 max-w-sm mx-auto">
          Create your first task with a priority level and due date to start organizing your workflow.
        </p>
        <button
          type="button"
          onClick={onCreateNew}
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          <span>Add New Task</span>
        </button>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="bg-white rounded-b-xl px-6 py-14 text-center">
        <h3 className="font-display text-base font-semibold text-slate-900">
          No matching tasks
        </h3>
        <p className="mt-1.5 text-sm text-slate-500 max-w-sm mx-auto">
          Adjust your search query or clear the active priority and status filters.
        </p>
        <button
          type="button"
          onClick={onClearFilters}
          className="mt-5 inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
        >
          Clear Filters
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-b-xl overflow-x-auto">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50/70 text-xs font-medium text-slate-500">
            <th scope="col" className="w-12 py-3 pl-5 pr-2">
              <span className="sr-only">Complete</span>
            </th>
            <th scope="col" className="py-3 px-3">Task</th>
            <th scope="col" className="py-3 px-3 whitespace-nowrap">Priority</th>
            <th scope="col" className="py-3 px-3 whitespace-nowrap">Due Date</th>
            <th scope="col" className="py-3 px-3 whitespace-nowrap hidden xl:table-cell">Created</th>
            <th scope="col" className="py-3 px-3 whitespace-nowrap">Status</th>
            <th scope="col" className="py-3 pl-3 pr-5 text-right whitespace-nowrap">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 text-sm">
          {tasks.map((task) => {
            const overdue = isTaskOverdue(task);
            const priorityMeta = getPriorityDisplay(task.priority);
            const isToggling = togglingTaskIds.has(task.id);

            return (
              <tr
                key={task.id}
                className="group transition-colors duration-150 hover:bg-slate-50/80"
              >
                <td className="py-3.5 pl-5 pr-2 align-top">
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={task.is_completed}
                    aria-label={
                      task.is_completed
                        ? `Mark "${task.title}" as pending`
                        : `Mark "${task.title}" as completed`
                    }
                    disabled={isToggling}
                    onClick={() => onToggleComplete(task)}
                    className={`mt-0.5 flex h-5 w-5 items-center justify-center rounded border transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-1 ${
                      task.is_completed
                        ? 'border-blue-600 bg-blue-600 text-white'
                        : 'border-slate-300 bg-white hover:border-blue-600'
                    } ${isToggling ? 'opacity-50 cursor-wait' : ''}`}
                  >
                    {task.is_completed && <Check className="h-3.5 w-3.5 stroke-[2.5]" aria-hidden="true" />}
                  </button>
                </td>

                <td className="py-3.5 px-3 align-top max-w-md">
                  <div
                    className={`font-medium leading-snug ${
                      task.is_completed ? 'text-slate-400 line-through' : 'text-slate-900'
                    }`}
                  >
                    {task.title}
                  </div>
                  {task.description && (
                    <p
                      className={`mt-1 text-xs leading-relaxed line-clamp-2 ${
                        task.is_completed ? 'text-slate-400' : 'text-slate-500'
                      }`}
                    >
                      {task.description}
                    </p>
                  )}
                </td>

                <td className="py-3.5 px-3 align-top whitespace-nowrap">
                  <span
                    className={`inline-flex items-center gap-1.5 text-xs font-medium ${priorityMeta.className}`}
                  >
                    <Flag className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    <span>{priorityMeta.label}</span>
                  </span>
                </td>

                <td className="py-3.5 px-3 align-top whitespace-nowrap">
                  <div
                    className={`font-mono text-xs tabular-nums ${
                      overdue
                        ? 'text-red-700 font-semibold'
                        : task.due_date
                        ? 'text-slate-700'
                        : 'text-slate-400'
                    }`}
                  >
                    {formatDueDate(task.due_date)}
                  </div>
                  {overdue && (
                    <div className="mt-0.5 text-xs font-medium text-red-600">
                      Overdue
                    </div>
                  )}
                </td>

                <td className="py-3.5 px-3 align-top whitespace-nowrap hidden xl:table-cell">
                  <span className="font-mono text-xs tabular-nums text-slate-500">
                    {formatCreatedAt(task.created_at)}
                  </span>
                </td>

                <td className="py-3.5 px-3 align-top whitespace-nowrap">
                  <span
                    className={`text-xs font-medium ${
                      task.is_completed
                        ? 'text-emerald-700'
                        : overdue
                        ? 'text-red-700'
                        : 'text-slate-600'
                    }`}
                  >
                    {task.is_completed
                      ? 'Completed'
                      : overdue
                      ? 'Overdue'
                      : 'Pending'}
                  </span>
                </td>

                <td className="py-3.5 pl-3 pr-5 align-top text-right whitespace-nowrap">
                  <div className="inline-flex items-center justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => onEditTask(task)}
                      aria-label={`Edit "${task.title}"`}
                      className="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                    >
                      <Edit3 className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onRequestDelete(task)}
                      aria-label={`Delete "${task.title}"`}
                      className="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Delete</span>
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
