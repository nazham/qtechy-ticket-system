import { useState } from 'react';
import {
  Plus,
  AlertTriangle,
  RefreshCw,
  Ticket,
  Calendar,
  Layers,
} from 'lucide-react';
import { useGetTicketsQuery } from '../store/slices/ticketApi';
import { useHasPermission } from '../hooks/useHasPermission';
import { Permission } from '../constants/permissions';
import CreateTicketModal from '../components/tickets/CreateTicketModal';

export default function TicketsPage() {
  const {
    data: tickets,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useGetTicketsQuery();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const canCreate = useHasPermission(Permission.CreateTicket);

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

  // Render Skeleton rows for loading state
  const renderSkeleton = () => (
    <div className="overflow-hidden rounded-premium-card border border-neutral-border bg-neutral-card shadow-premium-card">
      <div className="border-b border-neutral-border bg-neutral-bg/40 px-6 py-4">
        <div className="h-4 w-32 animate-pulse rounded bg-neutral-border"></div>
      </div>
      <div className="divide-y divide-neutral-border">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center justify-between px-6 py-5">
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

  // Render Error state
  const renderError = () => (
    <div className="rounded-premium-card border border-ui-danger/20 bg-ui-danger-light/10 p-8 text-center shadow-premium-card">
      <AlertTriangle
        className="mx-auto mb-4 animate-bounce text-ui-danger"
        size={48}
      />
      <h3 className="text-lg font-bold text-neutral-text-primary">
        Failed to load tickets
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

  // Render Empty State
  const renderEmptyState = () => (
    <div className="rounded-premium-card border border-neutral-border bg-neutral-card p-12 text-center shadow-premium-card">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-accent-light text-brand-accent">
        <Ticket size={28} />
      </div>
      <h3 className="text-lg font-bold text-neutral-text-primary">
        No tickets found
      </h3>
      <p className="mx-auto mt-2 max-w-sm text-sm text-neutral-text-secondary">
        {canCreate
          ? 'It looks like there are no support tickets registered in the system. Create a new ticket to get started.'
          : 'There are no support tickets registered in the system.'}
      </p>
      {canCreate && (
        <button
          onClick={() => setIsModalOpen(true)}
          className="mt-6 btn-primary"
        >
          <Plus size={16} />
          Create Ticket
        </button>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-neutral-text-primary">
            Tickets
          </h1>
          <p className="mt-1.5 text-sm text-neutral-text-secondary">
            View, track, and manage customer support requests.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {tickets && tickets.length > 0 && (
            <button
              onClick={() => refetch()}
              disabled={isFetching}
              title="Refresh tickets list"
              className="btn-secondary p-2.5"
              aria-label="Refresh tickets"
            >
              <RefreshCw
                size={18}
                className={isFetching ? 'animate-spin' : ''}
              />
            </button>
          )}
          {canCreate && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="btn-primary"
            >
              <Plus size={18} />
              Create Ticket
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        renderSkeleton()
      ) : isError ? (
        renderError()
      ) : !tickets || tickets.length === 0 ? (
        renderEmptyState()
      ) : (
        /* Data Table Card Wrapper */
        <div className="overflow-hidden rounded-premium-card border border-neutral-border bg-neutral-card shadow-premium-card">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-neutral-border bg-neutral-bg/40">
                  <th className="px-6 py-4 text-xs font-semibold tracking-wider text-neutral-text-secondary uppercase">
                    Ticket ID
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold tracking-wider text-neutral-text-secondary uppercase">
                    Subject & Creator
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold tracking-wider text-neutral-text-secondary uppercase">
                    Status
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold tracking-wider text-neutral-text-secondary uppercase">
                    Priority
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold tracking-wider text-neutral-text-secondary uppercase">
                    Category
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold tracking-wider text-neutral-text-secondary uppercase">
                    Date Created
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-border">
                {tickets.map((ticket) => (
                  <tr
                    key={ticket._id}
                    className="transition-colors hover:bg-neutral-card-hover/40"
                  >
                    {/* Ticket ID */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="rounded-md bg-brand-accent-light px-2 py-1 font-mono text-xs font-semibold text-brand-accent">
                        #
                        {ticket._id
                          .substring(ticket._id.length - 6)
                          .toUpperCase()}
                      </span>
                    </td>

                    {/* Title & Creator */}
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-semibold text-neutral-text-primary">
                          {ticket.title}
                        </div>
                        <div className="mt-0.5 text-xs text-neutral-text-muted">
                          {ticket.description.length > 60
                            ? `${ticket.description.substring(0, 60)}...`
                            : ticket.description}
                        </div>
                      </div>
                    </td>

                    {/* Status badge */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${getStatusBadgeClass(ticket.status)}`}
                      >
                        {ticket.status}
                      </span>
                    </td>

                    {/* Priority badge */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {renderPriorityBadge(ticket.priority)}
                    </td>

                    {/* Category */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-sm font-medium text-neutral-text-secondary">
                        <Layers size={14} className="text-neutral-text-muted" />
                        {ticket.category}
                      </div>
                    </td>

                    {/* Date */}
                    <td className="px-6 py-4 text-sm whitespace-nowrap text-neutral-text-secondary">
                      <div className="flex items-center gap-1.5">
                        <Calendar
                          size={14}
                          className="text-neutral-text-muted"
                        />
                        {new Date(ticket.createdAt).toLocaleDateString(
                          undefined,
                          {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          }
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Modal Popup */}
      {canCreate && (
        <CreateTicketModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}
