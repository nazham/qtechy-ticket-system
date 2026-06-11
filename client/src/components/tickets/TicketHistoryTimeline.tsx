import { Clock } from 'lucide-react';
import type { Ticket } from '../../store/slices/ticketApi';
import { format } from 'date-fns';

interface TicketHistoryTimelineProps {
  statusHistory: Ticket['statusHistory'];
}

const getTimelineDotColors = (status: string) => {
  switch (status) {
    case 'Open':
      return 'bg-amber-50 ring-amber-200/60 text-amber-600';
    case 'In Progress':
      return 'bg-blue-50 ring-blue-200/60 text-blue-600';
    case 'Resolved':
      return 'bg-emerald-50 ring-emerald-200/60 text-emerald-600';
    case 'Closed':
      return 'bg-neutral-50 ring-neutral-200/60 text-neutral-500';
    default:
      return 'bg-brand-accent-light ring-indigo-200 text-brand-accent';
  }
};

export default function TicketHistoryTimeline({
  statusHistory,
}: TicketHistoryTimelineProps) {
  if (!statusHistory || statusHistory.length === 0) {
    return (
      <div className="text-sm text-neutral-text-muted italic">
        No history available.
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col space-y-4 overflow-y-auto pr-1">
      {statusHistory.map((item, idx) => {
        const changedByName =
          typeof item.changedBy === 'string'
            ? 'Unknown User'
            : item.changedBy?.name || 'Unknown User';

        const date = new Date(item.changedAt);

        const dotColorClass = getTimelineDotColors(item.status);

        return (
          <div key={item._id || idx} className="relative flex gap-4">
            {/* Timeline line */}
            {idx !== statusHistory.length - 1 && (
              <div className="absolute top-8 left-3.5 -ml-px h-full w-[2px] bg-neutral-border" />
            )}

            <div
              className={`relative mt-1 flex h-7 w-7 flex-none items-center justify-center rounded-full shadow-sm ring-1 ${dotColorClass}`}
            >
              <Clock size={12} />
            </div>

            <div className="flex-auto rounded-premium-card border border-neutral-border bg-neutral-card p-3 shadow-sm">
              <div className="flex justify-between gap-2 text-sm">
                <div className="font-medium text-neutral-text-primary">
                  Status changed to{' '}
                  <span className="text-brand-500 font-bold">
                    {item.status}
                  </span>
                </div>
                <time
                  dateTime={item.changedAt}
                  className="flex-none text-xs text-neutral-text-muted"
                >
                  {format(date, 'MMM d, yyyy h:mm a')}
                </time>
              </div>
              <p className="mt-1 text-xs text-neutral-text-secondary">
                by {changedByName}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
