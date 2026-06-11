import {
  AlertTriangle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Layers,
  Plus,
  RefreshCw,
  Ticket as TicketIcon,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import type { GetTicketsResponse, Ticket } from '../../store/slices/ticketApi';
import { extractApiError } from '../../api/utils';

interface TicketTableProps {
  tickets?: Ticket[];
  pagination?: GetTicketsResponse['pagination'];
  isLoading: boolean;
  isError: boolean;
  error?: any;
  isFetching: boolean;
  refetch: () => void;
  showAssignedColumn: boolean;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  handleSort: (field: string) => void;
  handlePageChange: (newPage: number, totalPages?: number) => void;
  canCreate: boolean;
  onCreateClick: () => void;
  urlSearchTerm: string;
  statusFilter: string;
}

export default function TicketTable({
  tickets,
  pagination,
  isLoading,
  isError,
  error,
  isFetching,
  refetch,
  showAssignedColumn,
  sortBy,
  sortOrder,
  handleSort,
  handlePageChange,
  canCreate,
  onCreateClick,
  urlSearchTerm,
  statusFilter,
}: TicketTableProps) {
  // Sort Icon Helper function (called during render, not a React component)
  const renderSortIcon = (field: string) => {
    if (sortBy !== field) {
      return (
        <span className="ml-1 inline-flex flex-col opacity-0 group-hover:opacity-50">
          <ChevronUp size={12} className="-mb-1" />
          <ChevronDown size={12} />
        </span>
      );
    }
    return sortOrder === 'asc' ? (
      <ChevronUp size={14} className="ml-1 inline-block text-brand-accent" />
    ) : (
      <ChevronDown size={14} className="ml-1 inline-block text-brand-accent" />
    );
  };

  // Status Badge Helper
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Open':
        return 'bg-ui-info-light text-ui-info-text border border-ui-info/20';
      case 'In Progress':
        return 'bg-ui-warning-light text-ui-warning-text border border-ui-warning/20';
      case 'Resolved':
        return 'bg-ui-success-light text-ui-success-text border border-ui-success/20';
      case 'Closed':
      default:
        return 'bg-neutral-bg text-neutral-text-secondary border border-neutral-border';
    }
  };

  // Priority Badge Helper
  const renderPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'Urgent':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-ui-danger/20 bg-ui-danger-light px-2.5 py-0.5 text-xs font-semibold text-ui-danger-text">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-ui-danger opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-ui-danger"></span>
            </span>
            Urgent
          </span>
        );
      case 'High':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-orange-200 bg-orange-50 px-2.5 py-0.5 text-xs font-medium text-orange-800">
            <span className="h-1.5 w-1.5 rounded-full bg-orange-500"></span>
            High
          </span>
        );
      case 'Medium':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-ui-warning/20 bg-ui-warning-light px-2.5 py-0.5 text-xs font-medium text-ui-warning-text">
            <span className="h-1.5 w-1.5 rounded-full bg-ui-warning"></span>
            Medium
          </span>
        );
      case 'Low':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-ui-success/20 bg-ui-success-light px-2.5 py-0.5 text-xs font-medium text-ui-success-text">
            <span className="h-1.5 w-1.5 rounded-full bg-ui-success"></span>
            Low
          </span>
        );
    }
  };

  // Category Badge Helper
  const renderCategoryBadge = (category: string) => {
    let colorClass: string;
    switch (category) {
      case 'Bug':
        colorClass = 'bg-red-50 text-red-700 border-red-200';
        break;
      case 'Feature Request':
        colorClass = 'bg-indigo-50 text-indigo-700 border-indigo-200';
        break;
      case 'Technical Issue':
        colorClass = 'bg-violet-50 text-violet-700 border-violet-200';
        break;
      case 'Payment Issue':
        colorClass = 'bg-amber-50 text-amber-700 border-amber-200';
        break;
      case 'Account Issue':
        colorClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
        break;
      case 'Other':
      default:
        colorClass = 'bg-slate-50 text-slate-700 border-slate-200';
        break;
    }

    return (
      <span
        className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-semibold ${colorClass}`}
      >
        <Layers size={12} className="opacity-75" />
        {category}
      </span>
    );
  };

  // Render Skeleton rows for loading state
  if (isLoading) {
    return (
      <div className="overflow-hidden rounded-premium-card border border-neutral-border bg-neutral-card shadow-premium-card">
        <div className="border-b border-neutral-border bg-neutral-bg/40 px-6 py-4">
          <div className="h-4 w-32 animate-pulse rounded bg-neutral-border"></div>
        </div>
        <div className="divide-y divide-neutral-border">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="flex items-center justify-between px-6 py-5"
            >
              <div className="flex flex-1 items-center gap-4">
                <div className="h-8 w-16 animate-pulse rounded bg-neutral-border"></div>
                <div className="space-y-2">
                  <div className="h-4 w-48 animate-pulse rounded bg-neutral-border"></div>
                  <div className="h-3.5 w-24 animate-pulse rounded bg-neutral-border"></div>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="h-6 w-20 animate-pulse rounded-full bg-neutral-border"></div>
                <div className="h-6 w-20 animate-pulse rounded-full bg-neutral-border"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Render Error state
  if (isError) {
    return (
      <div className="rounded-premium-card border border-ui-danger/20 bg-ui-danger-light/10 p-8 text-center shadow-premium-card">
        <AlertTriangle
          className="mx-auto mb-4 animate-bounce text-ui-danger"
          size={48}
        />
        <h3 className="text-lg font-bold text-neutral-text-primary">
          {error ? extractApiError(error, 'Failed to load tickets') : 'Failed to load tickets'}
        </h3>
        <p className="mt-1 text-sm text-neutral-text-secondary">
          There was an error communicating with the server. Please check your
          network connection or try again.
        </p>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="mt-6 btn-primary inline-flex items-center gap-2"
        >
          <RefreshCw size={16} className={isFetching ? 'animate-spin' : ''} />
          {isFetching ? 'Retrying...' : 'Retry'}
        </button>
      </div>
    );
  }

  // Render Empty State
  if (!tickets || tickets.length === 0) {
    return (
      <div className="rounded-premium-card border border-neutral-border bg-neutral-card p-12 text-center shadow-premium-card">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-accent-light text-brand-accent">
          <TicketIcon size={28} />
        </div>
        <h3 className="text-lg font-bold text-neutral-text-primary">
          No tickets found
        </h3>
        <p className="mx-auto mt-2 max-w-sm text-sm text-neutral-text-secondary">
          {urlSearchTerm || statusFilter
            ? 'Try adjusting your search or filters to find what you are looking for.'
            : canCreate
              ? 'It looks like there are no support tickets registered in the system. Create a new ticket to get started.'
              : 'There are no support tickets registered in the system.'}
        </p>
        {canCreate && !urlSearchTerm && !statusFilter && (
          <button onClick={onCreateClick} className="mx-auto mt-6 btn-primary">
            <Plus size={16} />
            Create Ticket
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-premium-card border border-neutral-border bg-neutral-card shadow-premium-card">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-neutral-border bg-neutral-bg/40 select-none">
              <th
                className="group cursor-pointer px-3 py-2 text-xs font-semibold tracking-wider whitespace-nowrap text-neutral-text-secondary uppercase transition-colors hover:text-neutral-text-primary"
                onClick={() => handleSort('title')}
              >
                <div className="flex items-center gap-1">
                  Subject {renderSortIcon('title')}
                </div>
              </th>
              <th className="hidden px-3 py-2 text-xs font-semibold tracking-wider whitespace-nowrap text-neutral-text-secondary uppercase sm:table-cell">
                Created By
              </th>
              {showAssignedColumn && (
                <th className="hidden px-3 py-2 text-xs font-semibold tracking-wider whitespace-nowrap text-neutral-text-secondary uppercase md:table-cell">
                  Assigned To
                </th>
              )}
              <th
                className="group cursor-pointer px-3 py-2 text-xs font-semibold tracking-wider whitespace-nowrap text-neutral-text-secondary uppercase transition-colors hover:text-neutral-text-primary"
                onClick={() => handleSort('status')}
              >
                <div className="flex items-center gap-1">
                  Status {renderSortIcon('status')}
                </div>
              </th>
              <th
                className="group cursor-pointer px-3 py-2 text-xs font-semibold tracking-wider whitespace-nowrap text-neutral-text-secondary uppercase transition-colors hover:text-neutral-text-primary"
                onClick={() => handleSort('priority')}
              >
                <div className="flex items-center gap-1">
                  Priority {renderSortIcon('priority')}
                </div>
              </th>
              <th
                className="group hidden cursor-pointer px-3 py-2 text-xs font-semibold tracking-wider whitespace-nowrap text-neutral-text-secondary uppercase transition-colors hover:text-neutral-text-primary lg:table-cell"
                onClick={() => handleSort('category')}
              >
                <div className="flex items-center gap-1">
                  Category {renderSortIcon('category')}
                </div>
              </th>
              <th
                className="group hidden cursor-pointer px-3 py-2 text-center text-xs font-semibold tracking-wider whitespace-nowrap text-neutral-text-secondary uppercase transition-colors hover:text-neutral-text-primary lg:table-cell"
                onClick={() => handleSort('createdAt')}
              >
                <div className="flex items-center justify-center gap-1">
                  Date Created {renderSortIcon('createdAt')}
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-border">
            {tickets.map((ticket) => (
              <tr
                key={ticket._id}
                className="group border-b border-neutral-border/50 transition-all duration-150 hover:bg-brand-accent/2.5"
              >
                {/* Subject */}
                <td className="px-3 py-2">
                  <Link
                    to={`/tickets/${ticket._id}`}
                    className="text-sm font-semibold text-neutral-text-primary transition-colors hover:text-brand-accent-dark hover:underline"
                  >
                    {ticket.title}
                  </Link>
                  <div className="mt-0.5 line-clamp-1 max-w-xs text-xs text-neutral-text-muted">
                    {ticket.description}
                  </div>
                </td>

                {/* Created By */}
                <td className="hidden px-3 py-2 whitespace-nowrap sm:table-cell">
                  {typeof ticket.createdBy === 'object' && ticket.createdBy ? (
                    <div className="flex items-center gap-1.5">
                      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-accent-light text-[10px] font-bold text-brand-accent">
                        {ticket.createdBy.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-medium text-neutral-text-primary">
                          {ticket.createdBy.name}
                        </span>
                        <span className="text-[10px] text-neutral-text-muted">
                          {ticket.createdBy.email}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <span className="text-xs text-neutral-text-muted">—</span>
                  )}
                </td>

                {/* Assigned To */}
                {showAssignedColumn && (
                  <td className="hidden px-3 py-2 whitespace-nowrap md:table-cell">
                    {typeof ticket.assignedTo === 'object' &&
                    ticket.assignedTo ? (
                      <div className="flex items-center gap-1.5">
                        <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-indigo-100 bg-indigo-50 text-[10px] font-bold text-indigo-600">
                          {ticket.assignedTo.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-medium text-neutral-text-primary">
                            {ticket.assignedTo.name}
                          </span>
                          <span className="text-[10px] text-neutral-text-muted">
                            {ticket.assignedTo.email}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <span className="inline-flex items-center rounded bg-neutral-100 px-1.5 py-0.5 text-[9.5px] font-medium text-neutral-500">
                        Unassigned
                      </span>
                    )}
                  </td>
                )}

                {/* Status badge */}
                <td className="px-3 py-2 whitespace-nowrap">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${getStatusBadgeClass(ticket.status)}`}
                  >
                    {ticket.status}
                  </span>
                </td>

                {/* Priority badge */}
                <td className="px-3 py-2 whitespace-nowrap">
                  {renderPriorityBadge(ticket.priority)}
                </td>

                {/* Category */}
                <td className="hidden px-3 py-2 whitespace-nowrap lg:table-cell">
                  {renderCategoryBadge(ticket.category)}
                </td>

                {/* Date */}
                <td className="hidden px-3 py-2 text-center text-sm whitespace-nowrap text-neutral-text-secondary tabular-nums lg:table-cell">
                  {(() => {
                    const date = new Date(ticket.createdAt);
                    const now = new Date();
                    const isToday = date.toDateString() === now.toDateString();
                    const isCurrentYear =
                      date.getFullYear() === now.getFullYear();

                    if (isToday) {
                      return date.toLocaleTimeString(undefined, {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false,
                      });
                    }

                    return date.toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      ...(isCurrentYear
                        ? { hour: '2-digit', minute: '2-digit', hour12: false }
                        : { year: 'numeric' }),
                    });
                  })()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-between border-t border-neutral-border bg-neutral-bg/20 px-3 py-2">
          <div className="text-xs text-neutral-text-secondary">
            Showing{' '}
            <span className="font-medium text-neutral-text-primary">
              {(pagination.page - 1) * pagination.limit + 1}
            </span>{' '}
            to{' '}
            <span className="font-medium text-neutral-text-primary">
              {Math.min(pagination.page * pagination.limit, pagination.total)}
            </span>{' '}
            of{' '}
            <span className="font-medium text-neutral-text-primary">
              {pagination.total}
            </span>{' '}
            tickets
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() =>
                handlePageChange(pagination.page - 1, pagination.pages)
              }
              disabled={pagination.page === 1}
              className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-neutral-border bg-neutral-card text-neutral-text-secondary transition-colors hover:bg-neutral-bg hover:text-neutral-text-primary disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ChevronLeft size={14} />
            </button>
            <div className="flex items-center gap-0.5">
              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(
                (pageNum) => {
                  // Simple pagination (show limited pages around current)
                  if (
                    pagination.pages > 7 &&
                    pageNum !== 1 &&
                    pageNum !== pagination.pages &&
                    Math.abs(pageNum - pagination.page) > 1
                  ) {
                    if (pageNum === 2 || pageNum === pagination.pages - 1) {
                      return (
                        <span
                          key={pageNum}
                          className="px-0.5 text-xs text-neutral-text-muted"
                        >
                          ...
                        </span>
                      );
                    }
                    return null;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() =>
                        handlePageChange(pageNum, pagination.pages)
                      }
                      className={`inline-flex h-7 w-7 items-center justify-center rounded-md text-xs font-medium transition-colors ${
                        pagination.page === pageNum
                          ? 'bg-brand-accent text-white'
                          : 'text-neutral-text-secondary hover:bg-neutral-bg hover:text-neutral-text-primary'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                }
              )}
            </div>
            <button
              onClick={() =>
                handlePageChange(pagination.page + 1, pagination.pages)
              }
              disabled={pagination.page === pagination.pages}
              className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-neutral-border bg-neutral-card text-neutral-text-secondary transition-colors hover:bg-neutral-bg hover:text-neutral-text-primary disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
