import { Ticket, RefreshCw, Layers, AlertTriangle } from 'lucide-react';
import type { TicketStatistics } from '../../store/slices/ticketApi';

interface TicketStatsGridProps {
  stats?: TicketStatistics;
}

export default function TicketStatsGrid({ stats }: TicketStatsGridProps) {
  if (!stats) return null;

  return (
    <div className="animate-in fade-in slide-in-from-top-4 grid grid-cols-1 gap-2 duration-300 sm:grid-cols-2 lg:grid-cols-4">
      {/* Card 1: Open */}
      <div className="relative overflow-hidden rounded-premium-card border border-neutral-border bg-neutral-card p-2.5 shadow-premium-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[9px] font-semibold tracking-wider text-neutral-text-muted uppercase">
              Open Tickets
            </p>
            <h3 className="text-lg font-bold text-neutral-text-primary">
              {stats.ticketsByStatus.open}
            </h3>
          </div>
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-accent-light text-brand-accent">
            <Ticket size={14} />
          </div>
        </div>
        <div className="absolute bottom-0 left-0 h-0.5 w-full bg-brand-accent" />
      </div>

      {/* Card 2: In Progress */}
      <div className="relative overflow-hidden rounded-premium-card border border-neutral-border bg-neutral-card p-2.5 shadow-premium-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[9px] font-semibold tracking-wider text-neutral-text-muted uppercase">
              In Progress
            </p>
            <h3 className="text-lg font-bold text-neutral-text-primary">
              {stats.ticketsByStatus.inProgress}
            </h3>
          </div>
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-ui-warning-light text-ui-warning">
            <RefreshCw size={14} />
          </div>
        </div>
        <div className="absolute bottom-0 left-0 h-0.5 w-full bg-ui-warning" />
      </div>

      {/* Card 3: Resolved */}
      <div className="relative overflow-hidden rounded-premium-card border border-neutral-border bg-neutral-card p-2.5 shadow-premium-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[9px] font-semibold tracking-wider text-neutral-text-muted uppercase">
              Resolved
            </p>
            <h3 className="text-lg font-bold text-neutral-text-primary">
              {stats.ticketsByStatus.resolved}
            </h3>
          </div>
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-ui-success-light text-ui-success">
            <Layers size={14} />
          </div>
        </div>
        <div className="absolute bottom-0 left-0 h-0.5 w-full bg-ui-success" />
      </div>

      {/* Card 4: Urgent Focus */}
      <div className="relative overflow-hidden rounded-premium-card border border-neutral-border bg-neutral-card p-2.5 shadow-premium-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[9px] font-semibold tracking-wider text-neutral-text-muted uppercase">
              Urgent focus
            </p>
            <h3 className="text-lg font-bold text-neutral-text-primary">
              {stats.urgentEscalations ?? 0}
            </h3>
          </div>
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-ui-danger-light text-ui-danger">
            <AlertTriangle size={14} className="animate-pulse" />
          </div>
        </div>
        <div className="absolute bottom-0 left-0 h-0.5 w-full bg-ui-danger" />
      </div>
    </div>
  );
}
