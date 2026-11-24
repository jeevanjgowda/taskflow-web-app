import { CheckSquare } from 'lucide-react';

interface WebsiteSectionsProps {
  onAddNewTask: () => void;
}

const CAPABILITIES = [
  {
    number: '01.',
    title: 'Full Task Lifecycle Management',
    description:
      'Create tasks with titles, detailed descriptions, priority levels, and calendar due dates. Edit any detail inline or via the structured editor, and confirm deletions before removing records.',
    spanClass: 'md:col-span-7',
  },
  {
    number: '02.',
    title: 'Priority & Overdue Visibility',
    description:
      'Classify tasks as Low, Medium, or High priority and spot overdue deadlines automatically against today’s date.',
    spanClass: 'md:col-span-5',
  },
  {
    number: '03.',
    title: 'Instant Search, Filtering & Sorting',
    description:
      'Filter across Pending, Completed, Overdue, and priority levels, search by title, and sort chronologically by creation or due date.',
    spanClass: 'md:col-span-5',
  },
  {
    number: '04.',
    title: 'Portable CSV Export',
    description:
      'Download your currently filtered and sorted task list as an RFC 4180 compliant CSV file ready for Excel, Google Sheets, or team reporting.',
    spanClass: 'md:col-span-7',
  },
];

const WORKFLOW_STEPS = [
  {
    step: 'Step 1',
    title: 'Capture & Prioritize',
    detail:
      'Add tasks with clear titles, supporting notes, Low/Medium/High priority, and due dates saved directly through the TaskFlow API.',
  },
  {
    step: 'Step 2',
    title: 'Filter & Track Deadlines',
    detail:
      'Switch between All, Pending, Completed, and Overdue views or search by title to focus on what needs attention today.',
  },
  {
    step: 'Step 3',
    title: 'Complete & Export',
    detail:
      'Check off finished items in one click, keep your completion rate current, and export filtered task lists to CSV anytime.',
  },
];

export function WebsiteSections({ onAddNewTask }: WebsiteSectionsProps) {
  return (
    <>
      <section
        id="features"
        className="border-t border-slate-200 bg-white py-16"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-8">
          <div className="max-w-2xl">
            <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 [text-wrap:balance]">
              Built for clear, dependable task management.
            </h2>
            <p className="mt-3 text-base text-slate-600 leading-relaxed">
              Every control in TaskFlow maps directly to a persistent REST API endpoint with strict input validation and zero clutter.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-12 gap-5">
            {CAPABILITIES.map((item) => (
              <div
                key={item.number}
                className={`${item.spanClass} rounded-xl border border-slate-200 bg-slate-50/50 p-6 sm:p-7`}
              >
                <div className="font-mono text-xs font-semibold text-blue-600">
                  {item.number}
                </div>
                <h3 className="mt-2 font-display text-lg font-semibold text-slate-900">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="workflow"
        className="border-t border-slate-200 bg-slate-50 py-16"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div className="max-w-2xl">
              <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                How TaskFlow works
              </h2>
              <p className="mt-2 text-base text-slate-600">
                A straightforward three-step workflow from adding a task to exporting completed records.
              </p>
            </div>
            <button
              type="button"
              onClick={onAddNewTask}
              className="self-start sm:self-auto rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 transition-colors duration-150 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            >
              Add a Task Now
            </button>
          </div>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
            {WORKFLOW_STEPS.map((item) => (
              <div
                key={item.step}
                className="rounded-xl border border-slate-200 bg-white p-6"
              >
                <div className="text-xs font-semibold text-slate-500">
                  {item.step}
                </div>
                <h3 className="mt-2 font-display text-base font-semibold text-slate-900">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                  {item.detail}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white py-10">
        <div className="mx-auto flex max-w-7xl flex-col sm:flex-row items-start sm:items-center justify-between gap-6 px-4 sm:px-8">
          <div className="flex items-center gap-2.5 text-slate-900">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-600 text-white">
              <CheckSquare className="h-3.5 w-3.5" aria-hidden="true" />
            </span>
            <span className="font-display text-base font-bold tracking-tight">
              TaskFlow
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-sm text-slate-600">
            <a href="#overview" className="hover:text-slate-900 whitespace-nowrap">
              Overview
            </a>
            <a href="#workspace" className="hover:text-slate-900 whitespace-nowrap">
              Workspace
            </a>
            <a href="#features" className="hover:text-slate-900 whitespace-nowrap">
              Features
            </a>
            <a href="#workflow" className="hover:text-slate-900 whitespace-nowrap">
              Workflow
            </a>
          </div>

          <p className="text-xs text-slate-500">
            &copy; {new Date().getFullYear()} TaskFlow. To-Do List Management Website.
          </p>
        </div>
      </footer>
    </>
  );
}
