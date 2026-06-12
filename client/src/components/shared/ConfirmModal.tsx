import { useState } from 'react';
import { AlertTriangle, Loader2, Package, X } from 'lucide-react';

export interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  description: string | React.ReactNode;
  confirmLabel: string;
  confirmVariant: 'danger' | 'primary';
  /** If set, the user must type this exact string to enable the confirm button */
  requireTyped?: string;
  isLoading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  isOpen,
  title,
  description,
  confirmLabel,
  confirmVariant,
  requireTyped,
  isLoading,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const [typed, setTyped] = useState('');

  if (!isOpen) return null;

  const canConfirm = requireTyped ? typed === requireTyped : true;

  const confirmClass =
    confirmVariant === 'danger'
      ? 'inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-[10px] bg-ui-danger text-white font-semibold text-sm transition-all duration-200 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed'
      : 'btn-primary px-5 py-2.5';

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        backgroundColor: 'rgba(3,7,18,0.7)',
        backdropFilter: 'blur(4px)',
      }}
      onClick={(e) => e.target === e.currentTarget && !isLoading && onCancel()}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-neutral-border bg-neutral-card shadow-2xl"
        style={{ animation: 'modalIn 0.2s cubic-bezier(0.34,1.56,0.64,1)' }}
      >
        {/* Header */}
        <div className="flex items-start gap-4 border-b border-neutral-border px-6 pt-6 pb-5">
          {confirmVariant === 'danger' ? (
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-ui-danger-light">
              <AlertTriangle className="size-5 text-ui-danger" />
            </span>
          ) : (
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-accent-light">
              <Package className="size-5 text-brand-accent" />
            </span>
          )}
          <div className="flex-1">
            <h3 className="text-base font-semibold text-neutral-text-primary">
              {title}
            </h3>
            <div className="mt-1 text-sm text-neutral-text-secondary">
              {description}
            </div>
          </div>
          <button
            onClick={() => {
              setTyped('');
              onCancel();
            }}
            disabled={isLoading}
            className="rounded-lg p-1.5 text-neutral-text-muted transition-colors hover:bg-neutral-bg hover:text-neutral-text-primary disabled:opacity-50"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          {requireTyped && (
            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-text-secondary">
                Type{' '}
                <span className="font-mono font-bold text-neutral-text-primary">
                  {requireTyped}
                </span>{' '}
                to confirm
              </label>
              <input
                type="text"
                value={typed}
                onChange={(e) => setTyped(e.target.value)}
                placeholder={requireTyped}
                className="input-field"
                autoFocus
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t border-neutral-border px-6 py-4">
          <button
            onClick={() => {
              setTyped('');
              onCancel();
            }}
            disabled={isLoading}
            className="btn-secondary px-5 py-2.5"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={!canConfirm || isLoading}
            className={confirmClass}
          >
            {isLoading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Processing…
              </>
            ) : (
              confirmLabel
            )}
          </button>
        </div>
      </div>

      {/* Modal animation keyframe */}
      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.92) translateY(8px); }
          to   { opacity: 1; transform: scale(1)    translateY(0);   }
        }
      `}</style>
    </div>
  );
}
