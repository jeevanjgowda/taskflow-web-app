import { useCallback, useEffect, useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import {
  createTask,
  deleteTask,
  fetchTasks,
  updateTask,
} from './api/tasks.ts';
import { DeleteConfirmModal } from './components/DeleteConfirmModal.tsx';
import { HeroSection } from './components/HeroSection.tsx';
import { Navbar } from './components/Navbar.tsx';
import { SummaryCards } from './components/SummaryCards.tsx';
import { TaskModal } from './components/TaskModal.tsx';
import { TaskTable } from './components/TaskTable.tsx';
import { TaskToolbar } from './components/TaskToolbar.tsx';
import { WebsiteSections } from './components/WebsiteSections.tsx';
import type {
  PriorityFilter,
  SidebarView,
  SortOption,
  StatusFilter,
  Task,
  TaskPriority,
} from './types/task.ts';
import { downloadTasksCsv } from './utils/csvExport.ts';
import {
  computeTaskCounts,
  filterAndSortTasks,
} from './utils/taskHelpers.ts';

const WORKSPACE_TABS: Array<{ id: SidebarView; label: string }> = [
  { id: 'all', label: 'All Tasks' },
  { id: 'pending', label: 'Pending Tasks' },
  { id: 'completed', label: 'Completed Tasks' },
];

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const [activeView, setActiveView] = useState<SidebarView>('all');

  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('All');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All');
  const [sortBy, setSortBy] = useState<SortOption>('created_desc');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [submittingModal, setSubmittingModal] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [togglingTaskIds, setTogglingTaskIds] = useState<Set<string>>(new Set());

  const loadAllTasks = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const data = await fetchTasks();
      setTasks(data);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to load tasks.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAllTasks();
  }, [loadAllTasks]);

  const counts = useMemo(() => computeTaskCounts(tasks), [tasks]);

  const filteredTasks = useMemo(
    () =>
      filterAndSortTasks(tasks, {
        searchQuery,
        priorityFilter,
        statusFilter,
        sortBy,
      }),
    [tasks, searchQuery, priorityFilter, statusFilter, sortBy],
  );

  const handleSelectWorkspaceTab = (view: SidebarView) => {
    setActiveView(view);
    if (view === 'pending') {
      setStatusFilter('Pending');
    } else if (view === 'completed') {
      setStatusFilter('Completed');
    } else {
      setStatusFilter('All');
    }
  };

  const handleSelectStatusFromCardsOrToolbar = (filter: StatusFilter) => {
    setStatusFilter(filter);
    if (filter === 'Pending') {
      setActiveView('pending');
    } else if (filter === 'Completed') {
      setActiveView('completed');
    } else {
      setActiveView('all');
    }
  };

  const handleSelectSummaryCard = (filter: StatusFilter) => {
    handleSelectStatusFromCardsOrToolbar(filter);
    const el = document.getElementById('workspace');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleOpenCreateModal = () => {
    setEditingTask(null);
    setModalError(null);
    setModalOpen(true);
  };

  const handleOpenEditModal = (task: Task) => {
    setEditingTask(task);
    setModalError(null);
    setModalOpen(true);
  };

  const handleModalSubmit = async (values: {
    title: string;
    description: string;
    priority: TaskPriority;
    due_date: string | null;
    is_completed: boolean;
  }) => {
    setSubmittingModal(true);
    setModalError(null);
    try {
      if (editingTask) {
        const updated = await updateTask(editingTask.id, values);
        setTasks((prev) =>
          prev.map((item) => (item.id === updated.id ? updated : item)),
        );
      } else {
        const created = await createTask({
          title: values.title,
          description: values.description,
          priority: values.priority,
          due_date: values.due_date,
        });
        setTasks((prev) => [created, ...prev]);
      }
      setModalOpen(false);
    } catch (err) {
      setModalError(err instanceof Error ? err.message : 'Unable to save task.');
    } finally {
      setSubmittingModal(false);
    }
  };

  const handleToggleComplete = async (task: Task) => {
    setActionError(null);
    setTogglingTaskIds((prev) => new Set(prev).add(task.id));
    try {
      const updated = await updateTask(task.id, {
        is_completed: !task.is_completed,
      });
      setTasks((prev) =>
        prev.map((item) => (item.id === updated.id ? updated : item)),
      );
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : 'Failed to update task status.',
      );
    } finally {
      setTogglingTaskIds((prev) => {
        const next = new Set(prev);
        next.delete(task.id);
        return next;
      });
    }
  };

  const handleConfirmDelete = async () => {
    if (!taskToDelete) return;
    setDeletingTask(true);
    setDeleteError(null);
    try {
      await deleteTask(taskToDelete.id);
      setTasks((prev) => prev.filter((item) => item.id !== taskToDelete.id));
      setTaskToDelete(null);
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Failed to delete task.');
    } finally {
      setDeletingTask(false);
    }
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setPriorityFilter('All');
    setStatusFilter('All');
    setActiveView('all');
  };

  const getTabCount = (tab: SidebarView): number => {
    if (tab === 'pending') return counts.pending;
    if (tab === 'completed') return counts.completed;
    return counts.total;
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar onAddNewTask={handleOpenCreateModal} />

      <main className="flex-1">
        <HeroSection
          totalCount={counts.total}
          pendingCount={counts.pending}
          overdueCount={counts.overdue}
          completedCount={counts.completed}
          onCreateTask={handleOpenCreateModal}
        />

        <div className="mx-auto max-w-7xl px-4 sm:px-8 pb-10">
          <SummaryCards
            counts={counts}
            activeStatusFilter={statusFilter}
            onSelectStatusFilter={handleSelectSummaryCard}
          />
        </div>

        <section
          id="workspace"
          aria-label="Interactive TaskFlow workspace"
          className="mx-auto max-w-7xl px-4 sm:px-8 pb-16 scroll-mt-20 space-y-5"
        >
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl font-bold tracking-tight text-slate-900">
                Task Workspace
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Create, search, filter, sort, complete, edit, delete, or export your tasks to CSV.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div
                role="tablist"
                aria-label="Task views"
                className="inline-flex items-center gap-1 rounded-lg bg-slate-200/70 p-1"
              >
                {WORKSPACE_TABS.map((tab) => {
                  const isActive = activeView === tab.id && statusFilter !== 'Overdue';
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      onClick={() => handleSelectWorkspaceTab(tab.id)}
                      className={`inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium transition-colors duration-150 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                        isActive
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <span>{tab.label}</span>
                      <span className="font-mono tabular-nums text-slate-400">
                        {getTabCount(tab.id)}
                      </span>
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={handleOpenCreateModal}
                className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-medium text-white hover:bg-blue-700 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
              >
                <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                <span>New Task</span>
              </button>
            </div>
          </div>

          {actionError && (
            <div
              role="alert"
              className="flex items-center justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              <span>{actionError}</span>
              <button
                type="button"
                onClick={() => setActionError(null)}
                className="text-xs font-semibold underline hover:text-red-900 whitespace-nowrap shrink-0"
              >
                Dismiss
              </button>
            </div>
          )}

          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
            <TaskToolbar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              priorityFilter={priorityFilter}
              onPriorityFilterChange={setPriorityFilter}
              statusFilter={statusFilter}
              onStatusFilterChange={handleSelectStatusFromCardsOrToolbar}
              sortBy={sortBy}
              onSortChange={setSortBy}
              onExportCsv={() => downloadTasksCsv(filteredTasks, activeView)}
              resultCount={filteredTasks.length}
              totalCount={tasks.length}
            />

            <TaskTable
              tasks={filteredTasks}
              totalTaskCount={tasks.length}
              loading={loading}
              error={loadError}
              togglingTaskIds={togglingTaskIds}
              onRetry={() => void loadAllTasks()}
              onCreateNew={handleOpenCreateModal}
              onClearFilters={handleClearFilters}
              onToggleComplete={(task) => void handleToggleComplete(task)}
              onEditTask={handleOpenEditModal}
              onRequestDelete={(task) => {
                setDeleteError(null);
                setTaskToDelete(task);
              }}
            />
          </div>
        </section>

        <WebsiteSections onAddNewTask={handleOpenCreateModal} />
      </main>

      <TaskModal
        open={modalOpen}
        editingTask={editingTask}
        submitting={submittingModal}
        serverError={modalError}
        onClose={() => setModalOpen(false)}
        onSubmit={(values) => void handleModalSubmit(values)}
      />

      <DeleteConfirmModal
        task={taskToDelete}
        deleting={deletingTask}
        error={deleteError}
        onCancel={() => setTaskToDelete(null)}
        onConfirm={() => void handleConfirmDelete()}
      />
    </div>
  );
}
