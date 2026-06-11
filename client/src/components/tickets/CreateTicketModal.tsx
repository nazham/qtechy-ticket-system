import { Loader2, X } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { toast } from 'react-toastify';
import { extractApiError } from '../../api/utils';
import { TicketCategory, TicketPriority } from '../../constants/enums';
import { useRoles } from '../../hooks/useRoles';
import { useGetUsersQuery } from '../../store/slices/authApi';
import { useCreateTicketMutation } from '../../store/slices/ticketApi';

interface CreateTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateTicketModal({
  isOpen,
  onClose,
}: CreateTicketModalProps) {
  const [createTicket, { isLoading }] = useCreateTicketMutation();

  const { isAdmin } = useRoles();

  const { data: assignees } = useGetUsersQuery(
    { role: 'agent' },
    { skip: !isAdmin || !isOpen }
  );

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TicketCategory>(TicketCategory.Bug);
  const [priority, setPriority] = useState<TicketPriority>(TicketPriority.Low);
  const [assignedTo, setAssignedTo] = useState('');

  // Form validation states
  const [errors, setErrors] = useState<{
    title?: string;
    description?: string;
  }>({});

  if (!isOpen) return null;

  const validate = () => {
    const newErrors: { title?: string; description?: string } = {};
    if (!title.trim()) {
      newErrors.title = 'Ticket title is required';
    } else if (title.trim().length < 5) {
      newErrors.title = 'Title must be at least 5 characters';
    }

    if (!description.trim()) {
      newErrors.description = 'Ticket description is required';
    } else if (description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    if (!validate()) return;

    try {
      await createTicket({
        title: title.trim(),
        description: description.trim(),
        category,
        priority,
        assignedTo: isAdmin && assignedTo ? assignedTo : null,
      }).unwrap();

      toast.success('Ticket created successfully!');
      // Reset form
      setTitle('');
      setDescription('');
      setCategory(TicketCategory.Bug);
      setPriority(TicketPriority.Low);
      setAssignedTo('');
      setErrors({});
      onClose();
    } catch (err) {
      toast.error(extractApiError(err, 'Failed to create ticket'));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={!isLoading ? onClose : undefined}
      />

      {/* Modal Container */}
      <div className="animate-in fade-in zoom-in-95 relative w-full max-w-lg transform rounded-premium-card border border-neutral-border bg-neutral-card p-6 shadow-2xl transition-all duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-border pb-4">
          <h2 className="text-xl font-bold text-neutral-text-primary">
            Create Support Ticket
          </h2>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="rounded-lg p-1.5 text-neutral-text-muted transition-colors hover:bg-neutral-bg hover:text-neutral-text-primary disabled:opacity-50"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Title */}
          <div>
            <label
              htmlFor="ticket-title"
              className="mb-1 block text-sm font-medium text-neutral-text-secondary"
            >
              Title
            </label>
            <input
              id="ticket-title"
              type="text"
              required
              disabled={isLoading}
              placeholder="Summary of the issue..."
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errors.title)
                  setErrors((prev) => ({ ...prev, title: undefined }));
              }}
              className="w-full rounded-lg border border-neutral-border bg-neutral-bg/30 px-3.5 py-2 text-sm text-neutral-text-primary placeholder-neutral-text-muted transition-colors outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent disabled:opacity-50"
            />
            {errors.title && (
              <p className="mt-1 text-xs font-medium text-ui-danger">
                {errors.title}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="ticket-description"
              className="mb-1 block text-sm font-medium text-neutral-text-secondary"
            >
              Description
            </label>
            <textarea
              id="ticket-description"
              required
              rows={4}
              disabled={isLoading}
              placeholder="Please provide steps to reproduce, errors encountered, or requested changes..."
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (errors.description)
                  setErrors((prev) => ({ ...prev, description: undefined }));
              }}
              className="w-full resize-none rounded-lg border border-neutral-border bg-neutral-bg/30 px-3.5 py-2 text-sm text-neutral-text-primary placeholder-neutral-text-muted transition-colors outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent disabled:opacity-50"
            />
            {errors.description && (
              <p className="mt-1 text-xs font-medium text-ui-danger">
                {errors.description}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Category */}
            <div>
              <label
                htmlFor="ticket-category"
                className="mb-1 block text-sm font-medium text-neutral-text-secondary"
              >
                Category
              </label>
              <select
                id="ticket-category"
                disabled={isLoading}
                value={category}
                onChange={(e) => setCategory(e.target.value as TicketCategory)}
                className="w-full rounded-lg border border-neutral-border bg-neutral-bg/30 px-3.5 py-2 text-sm text-neutral-text-primary transition-colors outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent disabled:opacity-50"
              >
                <option value={TicketCategory.Bug}>Bug</option>
                <option value={TicketCategory.FeatureRequest}>
                  Feature Request
                </option>
                <option value={TicketCategory.TechnicalIssue}>
                  Technical Issue
                </option>
                <option value={TicketCategory.PaymentIssue}>
                  Payment Issue
                </option>
                <option value={TicketCategory.AccountIssue}>
                  Account Issue
                </option>
                <option value={TicketCategory.Other}>Other</option>
              </select>
            </div>

            {/* Priority */}
            <div>
              <label
                htmlFor="ticket-priority"
                className="mb-1 block text-sm font-medium text-neutral-text-secondary"
              >
                Priority
              </label>
              <select
                id="ticket-priority"
                disabled={isLoading}
                value={priority}
                onChange={(e) => setPriority(e.target.value as TicketPriority)}
                className="w-full rounded-lg border border-neutral-border bg-neutral-bg/30 px-3.5 py-2 text-sm text-neutral-text-primary transition-colors outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent disabled:opacity-50"
              >
                <option value={TicketPriority.Low}>Low</option>
                <option value={TicketPriority.Medium}>Medium</option>
                <option value={TicketPriority.High}>High</option>
                <option value={TicketPriority.Urgent}>Urgent</option>
              </select>
            </div>
          </div>

          {/* Assignee (Admin Only) */}
          {isAdmin && (
            <div>
              <label
                htmlFor="ticket-assignee"
                className="mb-1 block text-sm font-medium text-neutral-text-secondary"
              >
                Assignee (Optional)
              </label>
              <select
                id="ticket-assignee"
                disabled={isLoading}
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="w-full rounded-lg border border-neutral-border bg-neutral-bg/30 px-3.5 py-2 text-sm text-neutral-text-primary transition-colors outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent disabled:opacity-50"
              >
                <option value="">Unassigned</option>
                {assignees?.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.role})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Footer Actions */}
          <div className="mt-6 flex justify-end gap-3 border-t border-neutral-border pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary min-w-[100px]"
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Creating...
                </>
              ) : (
                'Create'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
