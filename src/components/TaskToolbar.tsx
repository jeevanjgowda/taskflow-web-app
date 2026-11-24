import { ArrowUpDown, Download, Search, X } from 'lucide-react';
import type { PriorityFilter, SortOption, StatusFilter } from '../types/task.ts';

interface TaskToolbarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  priorityFilter: PriorityFilter;
  onPriorityFilterChange: (value: PriorityFilter) => void;
  statusFilter: StatusFilter;
  onStatusFilterChange: (value: StatusFilter) => void;
  sortBy: SortOption;
  onSortChange: (value: SortOption) => void;
  onExportCsv: () => void;
  resultCount: number;
  totalCount: number;
}

const STATUS_OPTIONS: StatusFilter[] = ['All', 'Pending', 'Completed', 'Overdue'];
const PRIORITY_OPTIONS: PriorityFilter[] = ['All', 'High', 'Medium', 'Low'];

export function TaskToolbar({
  searchQuery,
  onSearchChange,
  priorityFilter,
  onPriorityFilterChange,
  statusFilter,
  onStatusFilterChange,
  sortBy,
  onSortChange,
  onExportCsv,
  resultCount,
  totalCount,
}: TaskToolbarProps) {
  return (
    <div className="flex flex-col gap-4 border-b border-slate-200 bg-white px-5 py-4 rounded-t-xl">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search tasks by title..."
            aria-label="Search tasks by title"
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-9 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              aria-label="Clear search query"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div
            role="group"
            aria-label="Filter by completion status"
            className="inline-flex items-center gap-1 rounded-lg bg-slate-100 p-1"
          >
            {STATUS_OPTIONS.map((status) => {
              const active = statusFilter === status;
              return (
                <button
                  key={status}
                  type="button"
                  onClick={() => onStatusFilterChange(status)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors duration-150 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                    active
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {status}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="priority-filter" className="text-xs font-medium text-slate-500 whitespace-nowrap">
              Priority
            </label>
            <select
              id="priority-filter"
              value={priorityFilter}
              onChange={(e) => onPriorityFilterChange(e.target.value as PriorityFilter)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
            >
              {PRIORITY_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option === 'All' ? 'All Priorities' : option}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <ArrowUpDown className="h-3.5 w-3.5 text-slate-400 shrink-0" aria-hidden="true" />
            <label htmlFor="task-sort" className="sr-only">
              Sort tasks
            </label>
            <select
              id="task-sort"
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as SortOption)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
            >
              <option value="created_desc">Created: Newest first</option>
              <option value="created_asc">Created: Oldest first</option>
              <option value="due_asc">Due date: Earliest first</option>
              <option value="due_desc">Due date: Latest first</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 text-xs text-slate-500">
        <span className="tabular-nums">
          Showing {resultCount} of {totalCount} {totalCount === 1 ? 'task' : 'tasks'}
        </span>

        <button
          type="button"
          onClick={onExportCsv}
          disabled={resultCount === 0}
          aria-label="Export current task list as CSV"
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-45 disabled:pointer-events-none transition-colors duration-150 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
        >
          <Download className="h-3.5 w-3.5 text-slate-500" aria-hidden="true" />
          <span>Export CSV</span>
        </button>
      </div>
    </div>
  );
}
