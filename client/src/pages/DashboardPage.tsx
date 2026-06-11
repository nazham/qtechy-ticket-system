import {
  Archive,
  CheckCircle2,
  Clock,
  Ticket,
  Users,
  AlertTriangle,
  Layers,
  Inbox,
} from 'lucide-react';
import { useAppSelector } from '../store/hooks';
import { selectUser } from '../store/slices/authSlice';

import { useGetTicketStatisticsQuery } from '../store/slices/ticketApi';
import { useHasPermission } from '../hooks/useHasPermission';
import { Permission } from '../constants/permissions';

const MetricValue = ({
  loading,
  value,
}: {
  loading: boolean;
  value: number | string;
}) => {
  if (loading) {
    return <div className="h-8 w-16 animate-pulse rounded bg-neutral-border" />;
  }
  return <>{value}</>;
};

export default function DashboardPage() {
  const user = useAppSelector(selectUser);
  const {
    data: statsData,
    isLoading,
    isFetching,
  } = useGetTicketStatisticsQuery();
  const loading = isLoading || isFetching;

  const hasCategoryData =
    statsData?.categoryDistribution &&
    Object.values(statsData.categoryDistribution).some((count) => count > 0);

  const STATS_CONFIG = [
    {
      label: 'Open Tickets',
      value: statsData?.ticketsByStatus.open ?? 0,
      icon: <Ticket size={22} />,
      colorClass: 'bg-ui-info/10 text-ui-info',
    },
    {
      label: 'In Progress',
      value: statsData?.ticketsByStatus.inProgress ?? 0,
      icon: <Clock size={22} />,
      colorClass: 'bg-ui-warning/10 text-ui-warning',
    },
    {
      label: 'Resolved',
      value: statsData?.ticketsByStatus.resolved ?? 0,
      icon: <CheckCircle2 size={22} />,
      colorClass: 'bg-ui-success/10 text-ui-success',
    },
    {
      label: 'Closed Tickets',
      value: statsData?.ticketsByStatus.closed ?? 0,
      icon: <Archive size={22} />,
      colorClass: 'bg-neutral-text-secondary/10 text-neutral-text-secondary',
    },
  ];

  const canManageUsers = useHasPermission(Permission.ManageUsers);
  const isAgent =
    useHasPermission(Permission.ViewAssignedTickets) && !canManageUsers;

  const renderRecentActivityFeed = () => {
    if (!statsData?.recentTickets) return null;
    return (
      <div className="flex h-full flex-col rounded-premium-card border border-neutral-border bg-neutral-card p-6 shadow-premium-card">
        <h3 className="mb-6 flex items-center gap-2 text-lg font-bold text-neutral-text-primary">
          <Clock size={18} className="text-brand-accent" />
          Recent Activity Feed
        </h3>
        <div className="flex flex-1 flex-col justify-center">
          {loading ? (
            <div className="relative space-y-6 border-l border-neutral-border py-2 pl-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="relative space-y-2">
                  <span className="absolute top-1.5 left-[-31px] flex h-4 w-4 items-center justify-center rounded-full border-4 border-neutral-card bg-neutral-border" />
                  <div className="h-4 w-1/3 animate-pulse rounded bg-neutral-border" />
                  <div className="h-3 w-1/4 animate-pulse rounded bg-neutral-border" />
                </div>
              ))}
            </div>
          ) : statsData.recentTickets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Clock
                size={36}
                className="mb-3 text-neutral-text-muted opacity-40"
              />
              <p className="text-sm font-semibold text-neutral-text-secondary">
                No recent activity
              </p>
              <p className="mt-1 text-xs text-neutral-text-muted">
                Updates will appear here as tickets are created or changed.
              </p>
            </div>
          ) : (
            <div className="max-h-[380px] overflow-y-auto pr-1">
              <div className="relative space-y-6 border-l border-neutral-border py-2 pl-6">
                {statsData.recentTickets.map((ticket) => {
                  let badgeColor =
                    'bg-ui-info/10 text-ui-info border border-ui-info/20';
                  if (ticket.status === 'In Progress') {
                    badgeColor =
                      'bg-ui-warning/10 text-ui-warning border border-ui-warning/20';
                  } else if (ticket.status === 'Resolved') {
                    badgeColor =
                      'bg-ui-success/10 text-ui-success border border-ui-success/20';
                  } else if (ticket.status === 'Closed') {
                    badgeColor =
                      'bg-neutral-text-secondary/10 text-neutral-text-secondary border border-neutral-border';
                  }

                  return (
                    <div key={ticket._id} className="group relative">
                      <span className="absolute top-1.5 left-[-31px] flex h-4 w-4 items-center justify-center rounded-full border-2 border-brand-accent bg-neutral-card transition-all duration-300 group-hover:scale-110 group-hover:bg-brand-accent" />
                      <div className="flex flex-col justify-between gap-2 md:flex-row md:items-center">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-bold text-brand-accent">
                              {ticket.ticketNumber}
                            </span>
                            <h4 className="text-sm font-semibold text-neutral-text-primary transition-colors group-hover:text-brand-accent">
                              {ticket.title}
                            </h4>
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${badgeColor}`}
                            >
                              {ticket.status}
                            </span>
                          </div>
                          <p className="mt-1 text-sm text-neutral-text-secondary">
                            {ticket.lastActivity}
                          </p>
                        </div>
                        <span className="self-start text-xs text-neutral-text-muted md:self-center">
                          {new Date(ticket.updatedAt).toLocaleDateString(
                            undefined,
                            {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            }
                          )}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (canManageUsers) {
    STATS_CONFIG.push({
      label: 'Total Users',
      value: statsData?.totalUsers ?? 0,
      icon: <Users size={22} />,
      colorClass: 'bg-brand-accent/10 text-brand-accent',
    });
  }

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
      <div
        className={`grid grid-cols-1 gap-6 sm:grid-cols-2 ${STATS_CONFIG.length === 5 ? 'lg:grid-cols-5' : 'lg:grid-cols-4'}`}
      >
        {STATS_CONFIG.map((stat) => (
          <div
            key={stat.label}
            className="group flex items-center gap-4 rounded-premium-card border border-neutral-border bg-neutral-card p-6 shadow-premium-card transition-all duration-300 hover:border-brand-accent/20 hover:shadow-md"
          >
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110 ${stat.colorClass}`}
            >
              {stat.icon}
            </div>
            <div>
              <div className="text-2xl font-bold text-neutral-text-primary">
                <MetricValue loading={loading} value={stat.value} />
              </div>
              <p className="text-sm font-medium text-neutral-text-secondary">
                {stat.label}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Admin specific widgets */}
      {canManageUsers && (
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Triage Backlog & Urgent Escalations Cards */}
          <div className="flex flex-col gap-6 lg:col-span-1">
            {/* Triage Backlog Card */}
            <div className="group flex flex-1 flex-col justify-center rounded-premium-card border border-neutral-border bg-neutral-card p-6 shadow-premium-card transition-all duration-300 hover:border-brand-accent/20 hover:shadow-md">
              <div className="flex items-center gap-4">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110 ${
                    !loading && statsData?.triageBacklog === 0
                      ? 'bg-ui-success/10 text-ui-success'
                      : 'bg-ui-warning/10 text-ui-warning'
                  }`}
                >
                  {!loading && statsData?.triageBacklog === 0 ? (
                    <CheckCircle2 size={22} />
                  ) : (
                    <Inbox size={22} />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <div className="text-2xl font-bold text-neutral-text-primary">
                      <MetricValue
                        loading={loading}
                        value={statsData?.triageBacklog ?? 0}
                      />
                    </div>
                    {!loading && statsData?.triageBacklog === 0 && (
                      <span className="rounded-full bg-ui-success/10 px-2 py-0.5 text-[10px] font-bold text-ui-success">
                        All Triaged
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-semibold text-neutral-text-secondary">
                    Triage Backlog
                  </p>
                  <p className="text-xs text-neutral-text-muted">
                    Unassigned Open/In Progress
                  </p>
                </div>
              </div>
            </div>

            {/* Urgent Escalations Card */}
            <div className="group flex flex-1 flex-col justify-center rounded-premium-card border border-neutral-border bg-neutral-card p-6 shadow-premium-card transition-all duration-300 hover:border-brand-accent/20 hover:shadow-md">
              <div className="flex items-center gap-4">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110 ${
                    !loading && statsData?.urgentFocus === 0
                      ? 'bg-ui-success/10 text-ui-success'
                      : 'bg-ui-danger/10 text-ui-danger'
                  }`}
                >
                  {!loading && statsData?.urgentFocus === 0 ? (
                    <CheckCircle2 size={22} />
                  ) : (
                    <AlertTriangle size={22} className="animate-pulse" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <div className="text-2xl font-bold text-neutral-text-primary">
                      <MetricValue
                        loading={loading}
                        value={statsData?.urgentFocus ?? 0}
                      />
                    </div>
                    {!loading && statsData?.urgentFocus === 0 && (
                      <span className="rounded-full bg-ui-success/10 px-2 py-0.5 text-[10px] font-bold text-ui-success">
                        All Clear
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-semibold text-neutral-text-secondary">
                    Urgent Escalations
                  </p>
                  <p className="text-xs text-neutral-text-muted">
                    High/Urgent Open/In Progress
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Ticket Distribution by Category */}
          <div className="flex flex-col rounded-premium-card border border-neutral-border bg-neutral-card p-6 shadow-premium-card lg:col-span-2">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-neutral-text-primary">
              <Layers size={18} className="text-brand-accent" />
              Ticket Distribution by Category
            </h3>
            <div className="flex flex-1 flex-col justify-center">
              {loading ? (
                <div className="space-y-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="space-y-2">
                      <div className="h-4 w-1/4 animate-pulse rounded bg-neutral-border" />
                      <div className="h-3 w-full animate-pulse rounded bg-neutral-border" />
                    </div>
                  ))}
                </div>
              ) : !hasCategoryData ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Layers
                    size={36}
                    className="mb-3 text-neutral-text-muted opacity-40"
                  />
                  <p className="text-sm font-semibold text-neutral-text-secondary">
                    No categories recorded yet
                  </p>
                  <p className="mt-1 text-xs text-neutral-text-muted">
                    Once tickets are added, their category distribution will
                    show here.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {statsData?.categoryDistribution &&
                    Object.entries(statsData.categoryDistribution)
                      .filter(([, count]) => count > 0)
                      .sort((a, b) => b[1] - a[1])
                      .slice(0, 5)
                      .map(([category, count]) => {
                        const maxCount = Math.max(
                          ...Object.values(
                            statsData.categoryDistribution || {}
                          ).filter((c) => c > 0),
                          1
                        );
                        const percentage = Math.round((count / maxCount) * 100);
                        return (
                          <div
                            key={category}
                            className="group/item -mx-2 rounded-lg px-2 py-1.5 transition-colors duration-200 hover:bg-neutral-border/20"
                          >
                            <div className="mb-1 flex justify-between text-xs font-semibold text-neutral-text-secondary">
                              <span>{category}</span>
                              <span>
                                {count} ticket{count !== 1 ? 's' : ''}
                              </span>
                            </div>
                            <div className="h-2 w-full rounded-full bg-neutral-border">
                              <div
                                className="h-2 rounded-full bg-brand-accent transition-all duration-500 group-hover/item:bg-brand-accent-hover"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Agent specific widgets */}
      {isAgent && (
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Priority Focus */}
          <div className="lg:col-span-1">
            <div
              className={`group flex h-full flex-col justify-between rounded-premium-card border border-neutral-border bg-neutral-card p-6 shadow-premium-card transition-all duration-300 hover:shadow-md ${
                !loading && statsData?.urgentFocus === 0
                  ? 'hover:border-ui-success/30'
                  : 'hover:border-ui-danger/30'
              }`}
            >
              <div>
                <div className="flex items-center gap-4">
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110 ${
                      !loading && statsData?.urgentFocus === 0
                        ? 'bg-ui-success/10 text-ui-success'
                        : 'bg-ui-danger/10 text-ui-danger'
                    }`}
                  >
                    {!loading && statsData?.urgentFocus === 0 ? (
                      <CheckCircle2 size={22} />
                    ) : (
                      <AlertTriangle size={22} className="animate-pulse" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="text-2xl font-bold text-neutral-text-primary">
                        <MetricValue
                          loading={loading}
                          value={statsData?.urgentFocus ?? 0}
                        />
                      </div>
                      {!loading && statsData?.urgentFocus === 0 && (
                        <span className="rounded-full bg-ui-success/10 px-2 py-0.5 text-[10px] font-bold text-ui-success">
                          All Clear
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-medium text-neutral-text-secondary">
                      Priority Focus (The "Fire" Queue)
                    </p>
                  </div>
                </div>
                <p className="mt-4 border-t border-neutral-border pt-4 text-xs leading-relaxed text-neutral-text-secondary">
                  {!loading && statsData?.urgentFocus === 0
                    ? 'Excellent! You have no high or urgent priority tickets in your queue.'
                    : 'These are High or Urgent priority tickets assigned to you that need immediate resolution.'}
                </p>
              </div>
            </div>
          </div>

          {/* Recent Activity Feed */}
          <div className="lg:col-span-2">{renderRecentActivityFeed()}</div>
        </div>
      )}

      {/* User specific widgets */}
      {!canManageUsers && !isAgent && statsData?.recentTickets && (
        <div className="mt-8">{renderRecentActivityFeed()}</div>
      )}
    </div>
  );
}
