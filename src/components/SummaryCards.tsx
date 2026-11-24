import { AlertTriangle, CheckCircle2, Clock, Layers } from 'lucide-react';
import type { StatusFilter } from '../types/task.ts';

interface SummaryCardsProps {
  counts: {
    total: number;
    completed: number;
    pending: number;
    overdue: number;
  };
  activeStatusFilter: StatusFilter;
  onSelectStatusFilter: (filter: StatusFilter) => void;
}

export function SummaryCards({
  counts,
  activeStatusFilter,
  onSelectStatusFilter,
}: SummaryCardsProps) {
  const cards: Array<{
    title: string;
    value: number;
    subtitle: string;
    filterValue: StatusFilter;
    icon: typeof Layers;
    toneClass: string;
    iconClass: string;
  }> = [
    {
      title: 'Total Tasks',
      value: counts.total,
      subtitle: 'All tracked items',
      filterValue: 'All',
      icon: Layers,
      toneClass: 'text-slate-900',
      iconClass: 'text-slate-500',
    },
    {
      title: 'Completed Tasks',
      value: counts.completed,
      subtitle: 'Finished items',
      filterValue: 'Completed',
      icon: CheckCircle2,
      toneClass: 'text-emerald-700',
      iconClass: 'text-emerald-600',
    },
    {
      title: 'Pending Tasks',
      value: counts.pending,
      subtitle: 'In progress or queued',
      filterValue: 'Pending',
      icon: Clock,
      toneClass: 'text-amber-700',
      iconClass: 'text-amber-600',
    },
    {
      title: 'Overdue Tasks',
      value: counts.overdue,
      subtitle: counts.overdue > 0 ? 'Past due date' : 'On schedule',
      filterValue: 'Overdue',
      icon: AlertTriangle,
      toneClass: counts.overdue > 0 ? 'text-red-700' : 'text-slate-900',
      iconClass: counts.overdue > 0 ? 'text-red-600' : 'text-slate-400',
    },
  ];

  return (
    <section aria-label="Task summary metrics" className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        const isSelected = activeStatusFilter === card.filterValue;

        return (
          <button
            key={card.title}
            type="button"
            onClick={() => onSelectStatusFilter(card.filterValue)}
            className={`text-left rounded-xl bg-white p-5 border transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
              isSelected
                ? 'border-blue-600 bg-blue-50/30'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-medium text-slate-600 whitespace-nowrap">
                {card.title}
              </span>
              <Icon className={`h-4 w-4 shrink-0 ${card.iconClass}`} aria-hidden="true" />
            </div>
            <div className={`mt-3 font-display text-3xl font-bold tracking-tight tabular-nums ${card.toneClass}`}>
              {card.value}
            </div>
            <p className="mt-1 text-xs text-slate-500">{card.subtitle}</p>
          </button>
        );
      })}
    </section>
  );
}
