import { CheckCircle2, Clock, Ticket, Users } from 'lucide-react';
import { useAppSelector } from '../store/hooks';
import { selectUser } from '../store/slices/authSlice';

const STATS_CONFIG = [
  {
    label: 'Open Tickets',
    value: '—',
    icon: <Ticket size={22} />,
    colorClass: 'bg-ui-info/10 text-ui-info',
  },
  {
    label: 'In Progress',
    value: '—',
    icon: <Clock size={22} />,
    colorClass: 'bg-ui-warning/10 text-ui-warning',
  },
  {
    label: 'Resolved',
    value: '—',
    icon: <CheckCircle2 size={22} />,
    colorClass: 'bg-ui-success/10 text-ui-success',
  },
  {
    label: 'Total Users',
    value: '—',
    icon: <Users size={22} />,
    colorClass: 'bg-brand-accent/10 text-brand-accent',
  },
];

export default function DashboardPage() {
  const user = useAppSelector(selectUser);

  return (
    <div>
      {/* Welcome header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-text-primary">
          Welcome back{user ? `, ${user.name}` : ''}! 👋
        </h1>
        <p className="mt-2 text-sm text-neutral-text-secondary">
          Here's a summary of the current status of your tickets.
        </p>
        {user && (
          <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-brand-accent-light px-3 py-1 text-xs font-semibold text-brand-accent shadow-xs">
            <span>Role:</span>
            <span className="capitalize">{user.role}</span>
          </div>
        )}
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {STATS_CONFIG.map((stat) => (
          <div
            key={stat.label}
            className="flex items-center gap-4 rounded-premium-card border border-neutral-border bg-neutral-card p-6 shadow-premium-card transition-all duration-300 hover:border-brand-accent/20 hover:shadow-md"
          >
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${stat.colorClass}`}
            >
              {stat.icon}
            </div>
            <div>
              <p className="text-2xl font-bold text-neutral-text-primary">
                {stat.value}
              </p>
              <p className="text-sm font-medium text-neutral-text-secondary">
                {stat.label}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
