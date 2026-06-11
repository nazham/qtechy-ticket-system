import { AlertTriangle, Loader2, X } from 'lucide-react';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
  ticketNumber?: string;
}

export default function ConfirmDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
  ticketNumber,
}: ConfirmDeleteModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={!isLoading ? onClose : undefined}
      />

      {/* Modal Container */}
      <div className="animate-in fade-in zoom-in-95 relative w-full max-w-md transform rounded-premium-card border border-neutral-border bg-neutral-card p-6 shadow-2xl transition-all duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-4 right-4 rounded-lg p-1.5 text-neutral-text-muted transition-colors hover:bg-neutral-bg hover:text-neutral-text-primary disabled:opacity-50"
          aria-label="Close modal"
        >
          <X size={20} />
        </button>

        {/* Content */}
        <div className="mt-2 flex flex-col items-center text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-ui-danger-light text-ui-danger">
            <AlertTriangle size={24} />
          </div>
          <h3 className="text-lg font-bold text-neutral-text-primary">
            Delete Support Ticket
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-neutral-text-secondary">
            Are you sure you want to delete ticket{' '}
            <span className="font-semibold text-neutral-text-primary">
              #{ticketNumber}
            </span>
            ? This action is permanent and cannot be undone. All conversation
            history will be lost.
          </p>
        </div>

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
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="btn-danger flex min-w-[100px] items-center justify-center gap-1.5"
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Deleting...
              </>
            ) : (
              'Delete'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
