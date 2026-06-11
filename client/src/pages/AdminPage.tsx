import { useState } from 'react';
import { toast } from 'react-toastify';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import {
  useSeedDatabaseMutation,
  useSweepDatabaseMutation,
} from '../store/slices/adminApi';

// ─── Sub-components ────────────────────────────────────────────────────────────

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  confirmVariant: 'danger' | 'primary';
  /** If set, the user must type this exact string to enable the confirm button */
  requireTyped?: string;
  isLoading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

function ConfirmModal({
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
      style={{ backgroundColor: 'rgba(3,7,18,0.7)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => e.target === e.currentTarget && onCancel()}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-neutral-border bg-neutral-card shadow-2xl"
        style={{ animation: 'modalIn 0.2s cubic-bezier(0.34,1.56,0.64,1)' }}
      >
        {/* Header */}
        <div className="flex items-start gap-4 border-b border-neutral-border px-6 pt-6 pb-5">
          {confirmVariant === 'danger' ? (
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-ui-danger-light">
              <svg className="size-5 text-ui-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
            </span>
          ) : (
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-accent-light">
              <svg className="size-5 text-brand-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7M4 7h16M4 7l2-3h12l2 3" />
              </svg>
            </span>
          )}
          <div>
            <h3 className="text-base font-semibold text-neutral-text-primary">{title}</h3>
            <p className="mt-1 text-sm text-neutral-text-secondary">{description}</p>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          {requireTyped && (
            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-text-secondary">
                Type <span className="font-mono font-bold text-neutral-text-primary">{requireTyped}</span> to confirm
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
            onClick={() => { setTyped(''); onCancel(); }}
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
                <svg className="size-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Processing…
              </>
            ) : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Admin Card ────────────────────────────────────────────────────────────────

interface AdminCardProps {
  icon: React.ReactNode;
  iconBg: string;
  badge?: string;
  badgeBg: string;
  badgeText: string;
  title: string;
  description: string;
  infoItems: { label: string; value: string }[];
  actionLabel: string;
  actionIcon: React.ReactNode;
  actionClass: string;
  onAction: () => void;
  isLoading: boolean;
  borderAccent?: string;
  lastResult?: React.ReactNode;
}

function AdminCard({
  icon,
  iconBg,
  badge,
  badgeBg,
  badgeText,
  title,
  description,
  infoItems,
  actionLabel,
  actionIcon,
  actionClass,
  onAction,
  isLoading,
  borderAccent = '',
  lastResult,
}: AdminCardProps) {
  return (
    <div
      className={`relative flex flex-col overflow-hidden rounded-2xl border bg-neutral-card shadow-(--shadow-premium-card) transition-all duration-300 hover:shadow-lg ${borderAccent}`}
      style={{ borderColor: borderAccent ? undefined : 'var(--color-neutral-border)' }}
    >
      {/* Top stripe */}
      {borderAccent && (
        <div className={`h-1 w-full ${borderAccent.replace('border-', 'bg-').split(' ')[0]}`} />
      )}

      <div className="flex flex-1 flex-col p-6">
        {/* Card header */}
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className={`flex size-12 shrink-0 items-center justify-center rounded-xl ${iconBg}`}>
              {icon}
            </span>
            <div>
              <h2 className="text-base font-semibold text-neutral-text-primary">{title}</h2>
              <p className="mt-0.5 text-xs text-neutral-text-muted">{description}</p>
            </div>
          </div>
          {badge && (
            <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${badgeBg} ${badgeText}`}>
              {badge}
            </span>
          )}
        </div>

        {/* Info grid */}
        <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {infoItems.map((item, idx) => (
            <div
              key={`${item.label}-${idx}`}
              className="rounded-xl border border-neutral-border bg-neutral-bg p-3"
            >
              <p className="text-xs font-medium text-neutral-text-muted">{item.label}</p>
              <p className="mt-0.5 text-sm font-semibold text-neutral-text-primary">{item.value}</p>
            </div>
          ))}
        </div>

        {/* Last result */}
        {lastResult && (
          <div className="mb-5">{lastResult}</div>
        )}

        {/* Action */}
        <div className="mt-auto">
          <button
            id={`admin-action-${title.toLowerCase().replace(/\s+/g, '-')}`}
            onClick={onAction}
            disabled={isLoading}
            className={actionClass}
          >
            {isLoading ? (
              <>
                <svg className="size-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Processing…
              </>
            ) : (
              <>
                {actionIcon}
                {actionLabel}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Result Banner ──────────────────────────────────────────────────────────────

interface ResultBannerProps {
  variant: 'success' | 'danger';
  items: { label: string; value: number }[];
}

function ResultBanner({ variant, items }: ResultBannerProps) {
  const colors =
    variant === 'success'
      ? 'bg-ui-success-light border-ui-success text-ui-success-text'
      : 'bg-ui-danger-light border-ui-danger text-ui-danger-text';

  return (
    <div className={`flex flex-wrap items-center gap-4 rounded-xl border p-3.5 ${colors}`}>
      <svg
        className={`size-4 shrink-0 ${variant === 'success' ? 'text-ui-success' : 'text-ui-danger'}`}
        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
      >
        {variant === 'success' ? (
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        ) : (
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        )}
      </svg>
      <p className="text-xs font-semibold">
        {items.map((it, idx) => (
          <span key={`${it.label}-${idx}`}>
            {idx > 0 && ' · '}
            <span className="font-bold">{it.value}</span> {it.label}
          </span>
        ))}
      </p>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

type ModalState = 'seed' | 'sweep' | null;

interface SeedResultData { usersCreated: number; ticketsCreated: number }
interface SweepResultData { ticketsDeleted: number; usersDeleted: number }

export default function AdminPage() {
  useDocumentTitle('Admin Panel');

  const [activeModal, setActiveModal] = useState<ModalState>(null);
  const [seedResult, setSeedResult] = useState<SeedResultData | null>(null);
  const [sweepResult, setSweepResult] = useState<SweepResultData | null>(null);

  const [seedDatabase, { isLoading: isSeeding }] = useSeedDatabaseMutation();
  const [sweepDatabase, { isLoading: isSweeping }] = useSweepDatabaseMutation();

  const handleSeed = async () => {
    try {
      const response = await seedDatabase().unwrap();
      setSeedResult(response.data);
      setSweepResult(null);
      setActiveModal(null);
      toast.success(
        `✅ ${response.data.ticketsCreated} tickets & ${response.data.usersCreated} users seeded successfully!`
      );
    } catch {
      setActiveModal(null);
      toast.error('Seed failed. Check the server logs.');
    }
  };

  const handleSweep = async () => {
    try {
      const response = await sweepDatabase().unwrap();
      setSweepResult(response.data);
      setSeedResult(null);
      setActiveModal(null);
      toast.success(
        `🧹 Database swept — ${response.data.ticketsDeleted} tickets & ${response.data.usersDeleted} users deleted.`
      );
    } catch {
      setActiveModal(null);
      toast.error('Sweep failed. Check the server logs.');
    }
  };

  return (
    <>
      {/* ── Page header ── */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-brand-accent-light">
            <svg className="size-5 text-brand-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </span>
          <div>
            <h1 className="text-2xl font-bold text-neutral-text-primary">Admin Panel</h1>
            <p className="text-sm text-neutral-text-secondary">
              System administration &amp; database management utilities
            </p>
          </div>
        </div>

        {/* Breadcrumb / info strip */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-ui-info-light px-3 py-1 text-xs font-medium text-ui-info-text">
            🔒 Admin Only
          </span>
          <span className="rounded-full bg-neutral-bg border border-neutral-border px-3 py-1 text-xs font-medium text-neutral-text-secondary">
            Changes take effect immediately
          </span>
        </div>
      </div>

      {/* ── Credential Info Card ── */}
      <div className="mb-6 rounded-2xl border border-brand-accent-light bg-brand-accent-light/30 p-5">
        <div className="flex items-start gap-3">
          <svg className="mt-0.5 size-5 shrink-0 text-brand-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-sm font-semibold text-brand-accent-dark">Seed Credentials</p>
            <p className="mt-1 text-xs text-neutral-text-secondary">
              All seeded accounts use password <span className="font-mono font-bold text-neutral-text-primary">Password123!</span>
            </p>
            <div className="mt-3 flex flex-wrap gap-3">
              {[
                { role: 'Admin', email: 'admin@qtechy.dev', color: 'bg-purple-100 text-purple-800' },
                { role: 'Agent', email: 'agent@qtechy.dev', color: 'bg-blue-100 text-blue-800' },
                { role: 'User', email: 'user@qtechy.dev', color: 'bg-emerald-100 text-emerald-800' },
              ].map((account) => (
                <div
                  key={account.role}
                  className="flex items-center gap-2 rounded-lg border border-neutral-border bg-neutral-card px-3 py-1.5"
                >
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${account.color}`}>
                    {account.role}
                  </span>
                  <span className="font-mono text-xs text-neutral-text-secondary">{account.email}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Action Cards grid ── */}
      <div className="grid gap-6 lg:grid-cols-2">

        {/* ── Seed Card ── */}
        <AdminCard
          icon={
            <svg className="size-6 text-brand-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7M4 7h16M4 7l2-3h12l2 3M9 11v6m6-6v6" />
            </svg>
          }
          iconBg="bg-brand-accent-light"
          badge="52 tickets · 3 users"
          badgeBg="bg-brand-accent-light"
          badgeText="text-brand-accent-dark"
          title="Seed Database"
          description="Populate the database with realistic dummy data for testing and development."
          infoItems={[
            { label: 'Tickets', value: '52 realistic' },
            { label: 'Users', value: '3 (all roles)' },
            { label: 'Comments', value: '60+ entries' },
          ]}
          actionLabel="Seed Database"
          actionIcon={
            <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          }
          actionClass="btn-primary w-full py-2.5"
          onAction={() => setActiveModal('seed')}
          isLoading={isSeeding}
          lastResult={
            seedResult ? (
              <ResultBanner
                variant="success"
                items={[
                  { label: 'tickets created', value: seedResult.ticketsCreated },
                  { label: 'users created', value: seedResult.usersCreated },
                ]}
              />
            ) : null
          }
        />

        {/* ── Sweep Card ── */}
        <AdminCard
          icon={
            <svg className="size-6 text-ui-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          }
          iconBg="bg-ui-danger-light"
          badge="⚠ Destructive"
          badgeBg="bg-ui-danger-light"
          badgeText="text-ui-danger-text"
          title="Clean Sweep"
          description="Permanently delete all tickets and user accounts from the database. This action cannot be undone."
          infoItems={[
            { label: 'Deletes', value: 'All tickets' },
            { label: 'Deletes', value: 'All users' },
            { label: 'Reversible', value: 'No' },
          ]}
          actionLabel="Clean Sweep DB"
          actionIcon={
            <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          }
          actionClass="inline-flex w-full items-center justify-center gap-2 rounded-[10px] border border-ui-danger bg-ui-danger-light py-2.5 text-sm font-semibold text-ui-danger transition-all duration-200 hover:bg-ui-danger hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          onAction={() => setActiveModal('sweep')}
          isLoading={isSweeping}
          borderAccent="border-ui-danger/30"
          lastResult={
            sweepResult ? (
              <ResultBanner
                variant="danger"
                items={[
                  { label: 'tickets deleted', value: sweepResult.ticketsDeleted },
                  { label: 'users deleted', value: sweepResult.usersDeleted },
                ]}
              />
            ) : null
          }
        />
      </div>

      {/* ── Seed Modal ── */}
      <ConfirmModal
        isOpen={activeModal === 'seed'}
        title="Seed the Database?"
        description="This will wipe all existing tickets and users, then insert 52 realistic tickets and 3 dummy accounts (Admin, Agent, User). Any data currently in the database will be lost."
        confirmLabel="Yes, Seed Database"
        confirmVariant="primary"
        isLoading={isSeeding}
        onConfirm={handleSeed}
        onCancel={() => setActiveModal(null)}
      />

      {/* ── Sweep Modal ── */}
      <ConfirmModal
        isOpen={activeModal === 'sweep'}
        title="Clean Sweep — Are you sure?"
        description="This will permanently delete ALL tickets and ALL user accounts from the database. This cannot be undone. Type CONFIRM below to proceed."
        confirmLabel="Sweep Everything"
        confirmVariant="danger"
        requireTyped="CONFIRM"
        isLoading={isSweeping}
        onConfirm={handleSweep}
        onCancel={() => setActiveModal(null)}
      />

      {/* Modal animation keyframe */}
      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.92) translateY(8px); }
          to   { opacity: 1; transform: scale(1)    translateY(0);   }
        }
      `}</style>
    </>
  );
}
