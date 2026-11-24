import { useState } from 'react';
import { ArrowDown, CheckSquare, Plus } from 'lucide-react';

interface HeroSectionProps {
  totalCount: number;
  pendingCount: number;
  overdueCount: number;
  completedCount: number;
  onCreateTask: () => void;
}

const HERO_IMAGE_SRC = '/src/assets/images/hero_taskflow_workspace_1795509379147.jpg';

export function HeroSection({
  totalCount,
  pendingCount,
  overdueCount,
  completedCount,
  onCreateTask,
}: HeroSectionProps) {
  const [imageError, setImageError] = useState(false);

  return (
    <section
      id="overview"
      className="mx-auto max-w-7xl px-4 sm:px-8 pt-10 pb-8 lg:pt-14 lg:pb-10"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch gap-8 lg:gap-12">
        <div className="lg:col-span-6 flex flex-col justify-center">
          <h1
            className="font-display font-bold tracking-tight text-slate-900 leading-[1.12] [text-wrap:balance]"
            style={{ fontSize: 'clamp(2.25rem, 4vw, 3.35rem)' }}
          >
            Organize daily tasks, priorities, and deadlines in one place.
          </h1>

          <p className="mt-5 text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl">
            TaskFlow is a structured to-do list management website for capturing work, setting priority levels, tracking overdue items, and exporting task reports as CSV.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={onCreateTask}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors duration-150 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              <span>Create New Task</span>
            </button>

            <a
              href="#workspace"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors duration-150 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            >
              <span>Open Task Workspace</span>
              <ArrowDown className="h-4 w-4 text-slate-400" aria-hidden="true" />
            </a>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500 border-t border-slate-200 pt-5 tabular-nums">
            <span>
              {totalCount === 0
                ? 'Ready for your first task'
                : `${pendingCount} pending · ${completedCount} completed`}
            </span>
            {overdueCount > 0 && (
              <>
                <span aria-hidden="true">·</span>
                <span className="font-medium text-red-700">
                  {overdueCount} overdue
                </span>
              </>
            )}
            <span aria-hidden="true">·</span>
            <span>Real-time REST API persistence</span>
          </div>
        </div>

        <div className="lg:col-span-6 flex">
          <div className="w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-100 min-h-[260px] lg:min-h-[360px]">
            {!imageError ? (
              <img
                src={HERO_IMAGE_SRC}
                alt="Sunlit modern studio desk with a physical planner and computer display showing a clean daily task schedule"
                referrerPolicy="no-referrer"
                onError={() => setImageError(true)}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-slate-100 via-white to-blue-50 p-8 text-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white">
                  <CheckSquare className="h-6 w-6" aria-hidden="true" />
                </span>
                <p className="mt-4 font-display text-base font-semibold text-slate-900">
                  TaskFlow Workspace
                </p>
                <p className="mt-1 text-xs text-slate-500 max-w-xs">
                  Structured task creation, priority tracking, and CSV export.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
