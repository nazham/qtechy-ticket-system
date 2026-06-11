import { format } from 'date-fns';
import {
  AlertCircle,
  ArrowLeft,
  ChevronDown,
  Edit,
  Flag,
  Hash,
  Layers,
  Trash2,
  User,
} from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { extractApiError } from '../api/utils';
import CategoryBadge from '../components/tickets/CategoryBadge';
import ConfirmDeleteModal from '../components/tickets/ConfirmDeleteModal';
import TicketComments from '../components/tickets/TicketComments';
import TicketFormModal from '../components/tickets/TicketFormModal';
import TicketHistoryTimeline from '../components/tickets/TicketHistoryTimeline';
import { TicketPriority, TicketStatus } from '../constants/enums';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useRoles } from '../hooks/useRoles';
import { useGetUsersQuery } from '../store/slices/authApi';
import {
  useAssignTicketMutation,
  useDeleteTicketMutation,
  useGetTicketQuery,
  useUpdateTicketStatusMutation,
  type Ticket,
} from '../store/slices/ticketApi';

export default function TicketDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    data: ticket,
    isLoading,
    error,
  } = useGetTicketQuery(id as string, {
    skip: !id,
  });

  let pageTitle = 'Ticket Details';
  if (isLoading) {
    pageTitle = 'Loading Ticket...';
  } else if (error || !ticket) {
    pageTitle = error
      ? extractApiError(error, 'Failed to Load Ticket')
      : 'Ticket Not Found';
  } else if (ticket) {
    pageTitle = `Ticket #${ticket.ticketNumber}: ${ticket.title}`;
  }

  useDocumentTitle(pageTitle);

  const [updateStatus, { isLoading: isUpdatingStatus }] =
    useUpdateTicketStatusMutation();
  const [assignTicket, { isLoading: isAssigning }] = useAssignTicketMutation();
  const [deleteTicket, { isLoading: isDeleting }] = useDeleteTicketMutation();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const { isAdmin, isStaff } = useRoles();

  const { data: assignees } = useGetUsersQuery(
    { role: 'agent' },
    { skip: !isAdmin }
  );

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="border-brand-500 h-8 w-8 animate-spin rounded-full border-4 border-t-transparent"></div>
      </div>
    );
  }

  if (error || !ticket) {
    const errorMessage = error
      ? extractApiError(error, 'Failed to load ticket')
      : 'Ticket not found';

    return (
      <div className="flex h-64 flex-col items-center justify-center gap-4 text-red-500">
        <AlertCircle size={32} />
        <h2 className="px-4 text-center text-xl font-bold">{errorMessage}</h2>
        <button onClick={() => navigate('/tickets')} className="btn-secondary">
          Go back to tickets
        </button>
      </div>
    );
  }

  const handleStatusChange = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    if (!isStaff) return;
    const newStatus = e.target.value as Ticket['status'];
    if (!ticket.assignedTo && newStatus !== TicketStatus.Closed) {
      toast.error('Ticket must be assigned to an Agent before updating status');
      return;
    }
    try {
      await updateStatus({
        id: ticket._id,
        status: newStatus,
      }).unwrap();
    } catch (err) {
      toast.error(extractApiError(err, 'Failed to update status'));
    }
  };

  const handleAssigneeChange = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    if (!isAdmin) return;
    try {
      const value = e.target.value === '' ? null : e.target.value;
      await assignTicket({ id: ticket._id, assignedTo: value }).unwrap();
    } catch (err) {
      toast.error(extractApiError(err, 'Failed to update assignee'));
    }
  };

  const handleDeleteConfirm = async () => {
    if (!ticket) return;
    try {
      await deleteTicket(ticket._id).unwrap();
      toast.success('Ticket deleted successfully');
      setIsDeleteModalOpen(false);
      navigate('/tickets');
    } catch (err) {
      toast.error(extractApiError(err, 'Failed to delete ticket'));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case TicketStatus.Open:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case TicketStatus.InProgress:
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case TicketStatus.Resolved:
        return 'bg-green-100 text-green-800 border-green-200';
      case TicketStatus.Closed:
        return 'bg-neutral-100 text-neutral-800 border-neutral-200';
      default:
        return 'bg-neutral-100 text-neutral-800 border-neutral-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case TicketPriority.Urgent:
        return 'bg-red-100 text-red-800 border-red-200';
      case TicketPriority.High:
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case TicketPriority.Medium:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case TicketPriority.Low:
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-neutral-100 text-neutral-800 border-neutral-200';
    }
  };

  const assigneeName =
    typeof ticket.assignedTo === 'object' && ticket.assignedTo !== null
      ? ticket.assignedTo.name
      : 'Unassigned';
  const assigneeId =
    typeof ticket.assignedTo === 'object' && ticket.assignedTo !== null
      ? ticket.assignedTo._id
      : typeof ticket.assignedTo === 'string'
        ? ticket.assignedTo
        : '';

  const creatorName =
    typeof ticket.createdBy === 'object' ? ticket.createdBy.name : 'Unknown';

  return (
    <div className="flex min-h-0 flex-col gap-4 lg:h-[calc(100vh-5.5rem)] lg:flex-row lg:overflow-hidden">
      {/* Main Content Area */}
      <div className="flex min-h-0 flex-1 flex-col gap-4 lg:h-full lg:overflow-hidden">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/tickets')}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-neutral-border bg-neutral-card text-neutral-text-secondary shadow-sm transition-all hover:scale-105 hover:border-brand-accent/30 hover:bg-neutral-card-hover hover:text-brand-accent"
            >
              <ArrowLeft size={16} />
            </button>
            <div className="flex flex-col">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="rounded bg-brand-accent-light px-2 py-0.5 text-xs font-bold text-brand-accent">
                  #{ticket.ticketNumber}
                </span>
                <h1 className="text-2xl font-bold tracking-tight text-neutral-text-primary">
                  {ticket.title}
                </h1>
              </div>
              <div className="mt-1.5 flex items-center gap-2 text-sm text-neutral-text-secondary">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-accent-light text-[10px] font-bold text-brand-accent select-none">
                  {creatorName.charAt(0).toUpperCase()}
                </div>
                <span>
                  Opened by{' '}
                  <span className="font-semibold text-neutral-text-primary">
                    {creatorName}
                  </span>{' '}
                  on{' '}
                  <span className="font-medium">
                    {format(new Date(ticket.createdAt), 'MMM d, yyyy')}
                  </span>
                </span>
              </div>
            </div>
          </div>

          {/* Action buttons (Edit & Delete) */}
          {isAdmin && (
            <div className="flex items-center gap-2 self-end sm:self-center">
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="btn-secondary flex items-center gap-1 px-3 py-1.5 text-xs"
              >
                <Edit size={14} />
                Edit
              </button>
              <button
                onClick={() => setIsDeleteModalOpen(true)}
                className="btn-danger flex items-center gap-1 px-3 py-1.5 text-xs"
                disabled={isDeleting}
              >
                <Trash2 size={14} />
                Delete
              </button>
            </div>
          )}
        </div>

        {/* Description Card */}
        <div className="flex max-h-[240px] min-h-[120px] shrink-0 flex-col overflow-hidden rounded-premium-card border border-neutral-border bg-neutral-card p-6 shadow-premium-card transition-all duration-300 hover:shadow-lg">
          <div className="mb-3 flex shrink-0 items-center justify-between border-b border-neutral-border pb-2">
            <h2 className="text-lg font-bold text-neutral-text-primary">
              Description
            </h2>
            <CategoryBadge category={ticket.category} />
          </div>
          <div className="flex-1 overflow-y-auto pr-1">
            <p className="text-sm leading-relaxed whitespace-pre-wrap text-neutral-text-secondary">
              {ticket.description}
            </p>
          </div>
        </div>

        {/* Comments Section */}
        <div className="flex min-h-[300px] flex-1 flex-col overflow-hidden rounded-premium-card border border-neutral-border bg-neutral-card shadow-premium-card transition-all duration-300 hover:shadow-lg">
          <h2 className="shrink-0 border-b border-neutral-border bg-neutral-50/50 p-4 text-lg font-semibold text-neutral-text-primary">
            Conversation
          </h2>
          <div className="min-h-0 flex-1 overflow-hidden">
            <TicketComments ticketId={ticket._id} comments={ticket.comments} />
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="flex min-h-0 w-full shrink-0 flex-col gap-4 pr-1 pb-4 lg:h-full lg:w-80 lg:overflow-hidden">
        {/* Meta Data Card */}
        <div className="rounded-premium-card border border-neutral-border bg-neutral-card p-5 shadow-premium-card">
          <h3 className="mb-4 text-xs font-bold tracking-wider text-neutral-text-muted uppercase">
            Ticket Settings
          </h3>

          <div className="divide-y divide-neutral-border">
            {/* Assignee Row */}
            <div className="py-3 first:pt-0">
              <div className="mb-2 flex items-center gap-2 text-xs font-semibold tracking-wider text-neutral-text-muted uppercase">
                <User size={12} className="text-neutral-text-muted" />
                <span>Assignee</span>
              </div>
              {isAdmin ? (
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold shadow-sm transition-all duration-300 select-none ${
                      !assigneeId
                        ? 'border border-neutral-200 bg-neutral-100 text-neutral-400'
                        : 'border border-brand-accent bg-brand-accent-light text-brand-accent'
                    }`}
                  >
                    {assigneeName.charAt(0).toUpperCase()}
                  </div>
                  <div className="relative flex-1">
                    <select
                      value={assigneeId}
                      onChange={handleAssigneeChange}
                      disabled={isAssigning}
                      className="w-full appearance-none rounded-lg border border-neutral-border bg-neutral-card p-2.5 pr-8 text-sm font-medium transition-all hover:border-neutral-text-muted focus:border-brand-accent focus:ring-2 focus:ring-brand-accent-light focus:outline-none"
                    >
                      <option value="">Unassigned</option>
                      {assignees?.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.name} ({user.role})
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                      <ChevronDown
                        size={16}
                        className="text-neutral-text-secondary"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 rounded-lg border border-neutral-border/50 bg-neutral-bg/30 p-2">
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold shadow-sm select-none ${
                      assigneeName === 'Unassigned'
                        ? 'border border-neutral-200 bg-neutral-100 text-neutral-400'
                        : 'border border-brand-accent bg-brand-accent-light text-brand-accent'
                    }`}
                  >
                    {assigneeName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-neutral-text-primary">
                      {assigneeName}
                    </span>
                    <span className="text-[10px] font-bold tracking-wider text-neutral-text-muted uppercase">
                      {assigneeName === 'Unassigned'
                        ? 'Action Required'
                        : 'Assigned Agent'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Status Row */}
            <div className="py-3">
              <div className="mb-2 flex items-center gap-2 text-xs font-semibold tracking-wider text-neutral-text-muted uppercase">
                <Hash size={12} className="text-neutral-text-muted" />
                <span>Status</span>
              </div>
              {isStaff ? (
                <div className="relative">
                  <select
                    value={ticket.status}
                    onChange={handleStatusChange}
                    disabled={isUpdatingStatus}
                    className={`w-full appearance-none rounded-lg border border-neutral-border bg-neutral-card p-2.5 pr-8 text-sm font-semibold transition-all focus:border-brand-accent focus:ring-2 focus:ring-brand-accent-light focus:outline-none ${getStatusColor(ticket.status)}`}
                  >
                    <option
                      value={TicketStatus.Open}
                      disabled={
                        !ticket.assignedTo &&
                        ticket.status !== TicketStatus.Open
                      }
                    >
                      Open
                    </option>
                    <option
                      value={TicketStatus.InProgress}
                      disabled={
                        !ticket.assignedTo &&
                        ticket.status !== TicketStatus.InProgress
                      }
                    >
                      In Progress
                    </option>
                    <option
                      value={TicketStatus.Resolved}
                      disabled={
                        !ticket.assignedTo &&
                        ticket.status !== TicketStatus.Resolved
                      }
                    >
                      Resolved
                    </option>
                    <option value={TicketStatus.Closed}>Closed</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                    <ChevronDown
                      size={16}
                      className="text-neutral-text-secondary"
                    />
                  </div>
                </div>
              ) : (
                <span
                  className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${getStatusColor(ticket.status)}`}
                >
                  {ticket.status}
                </span>
              )}
            </div>

            {/* Priority Row */}
            <div className="py-3">
              <div className="mb-2 flex items-center gap-2 text-xs font-semibold tracking-wider text-neutral-text-muted uppercase">
                <Flag size={12} className="text-neutral-text-muted" />
                <span>Priority</span>
              </div>
              <span
                className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${getPriorityColor(ticket.priority)}`}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-current" />
                {ticket.priority}
              </span>
            </div>

            {/* Category Row */}
            <div className="py-3 last:pb-0">
              <div className="mb-2 flex items-center gap-2 text-xs font-semibold tracking-wider text-neutral-text-muted uppercase">
                <Layers size={12} className="text-neutral-text-muted" />
                <span>Category</span>
              </div>
              <CategoryBadge category={ticket.category} />
            </div>
          </div>
        </div>

        {/* Timeline Card */}
        <div className="flex min-h-[250px] flex-1 flex-col overflow-hidden rounded-premium-card border border-neutral-border bg-neutral-card p-5 shadow-premium-card transition-all duration-300 hover:shadow-lg">
          <h3 className="mb-4 shrink-0 text-sm font-bold tracking-wider text-neutral-text-muted uppercase">
            Status History
          </h3>
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <TicketHistoryTimeline statusHistory={ticket.statusHistory} />
          </div>
        </div>
      </div>

      {/* Edit Ticket Modal */}
      {isAdmin && (
        <TicketFormModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          ticket={ticket}
        />
      )}

      {/* Delete Confirmation Modal */}
      {isAdmin && (
        <ConfirmDeleteModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDeleteConfirm}
          isLoading={isDeleting}
          ticketNumber={ticket.ticketNumber}
        />
      )}
    </div>
  );
}
