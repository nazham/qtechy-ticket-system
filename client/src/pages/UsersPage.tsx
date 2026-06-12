import {
  AlertTriangle,
  Calendar,
  Mail,
  RefreshCw,
  Search,
  Shield,
  Trash2,
  UserCheck,
  UserMinus,
  Users,
  X,
} from 'lucide-react';
import { useMemo, useState, useCallback } from 'react';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import {
  useGetUsersDirectoryQuery,
  usePromoteToAgentMutation,
  useDemoteToUserMutation,
  useDeleteUserMutation,
} from '../store/slices/userApi';
import type { UserWithMeta } from '../store/slices/userApi';
import { extractApiError } from '../api/utils';
import { toast } from 'react-toastify';
import ConfirmModal from '../components/shared/ConfirmModal';

// ─── Roles Constant ───────────────────────────────────────────────────────────

const ROLES = {
  ADMIN: 'admin',
  AGENT: 'agent',
  USER: 'user',
} as const;

// ─── Role Badge Config ──────────────────────────────────────────────────────────

const ROLE_CONFIG: Record<
  string,
  { label: string; bg: string; text: string; border: string; dot: string }
> = {
  [ROLES.ADMIN]: {
    label: 'Admin',
    bg: 'bg-purple-50',
    text: 'text-purple-800',
    border: 'border-purple-200',
    dot: 'bg-purple-500',
  },
  [ROLES.AGENT]: {
    label: 'Agent',
    bg: 'bg-blue-50',
    text: 'text-blue-800',
    border: 'border-blue-200',
    dot: 'bg-blue-500',
  },
  [ROLES.USER]: {
    label: 'User',
    bg: 'bg-emerald-50',
    text: 'text-emerald-800',
    border: 'border-emerald-200',
    dot: 'bg-emerald-500',
  },
};

function RoleBadge({ role }: { role: string }) {
  const config = ROLE_CONFIG[role] ?? ROLE_CONFIG[ROLES.USER];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${config.bg} ${config.text} ${config.border}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`}></span>
      {config.label}
    </span>
  );
}

// ─── Avatar Component ───────────────────────────────────────────────────────────

const AVATAR_COLORS: Record<string, string> = {
  [ROLES.ADMIN]: 'bg-purple-100 text-purple-700 border-purple-200',
  [ROLES.AGENT]: 'bg-blue-100 text-blue-700 border-blue-200',
  [ROLES.USER]: 'bg-emerald-100 text-emerald-700 border-emerald-200',
};

function UserAvatar({ name, role }: { name: string; role: string }) {
  const colorClass = AVATAR_COLORS[role] ?? AVATAR_COLORS[ROLES.USER];
  return (
    <div
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-sm font-bold shadow-sm ${colorClass}`}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

// ─── Date Formatter ─────────────────────────────────────────────────────────────

function formatJoinDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

// ─── Stats Card ─────────────────────────────────────────────────────────────────

interface StatCardProps {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  value: number;
}

function StatCard({ icon, iconBg, label, value }: StatCardProps) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-neutral-border bg-neutral-card p-4 shadow-sm transition-all duration-200 hover:shadow-md">
      <span
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${iconBg}`}
      >
        {icon}
      </span>
      <div>
        <p className="text-2xl font-bold text-neutral-text-primary">{value}</p>
        <p className="text-xs font-medium text-neutral-text-muted">{label}</p>
      </div>
    </div>
  );
}

// ─── Main Page Component ────────────────────────────────────────────────────────

export default function UsersPage() {
  useDocumentTitle('Users');

  const {
    data: users,
    isLoading,
    isError,
    error,
    isFetching,
    refetch,
  } = useGetUsersDirectoryQuery();

  const [promoteToAgent] = usePromoteToAgentMutation();
  const [demoteToUser] = useDemoteToUserMutation();
  const [deleteUser, { isLoading: isDeletingUser }] = useDeleteUserMutation();

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);

  // Modal state — shared for delete and demote confirmations
  const [modalAction, setModalAction] = useState<'delete' | 'demote' | null>(
    null
  );
  const [selectedUser, setSelectedUser] = useState<UserWithMeta | null>(null);

  // ── Computed filtered users & stats (Single Pass) ──
  const { filteredUsers, stats } = useMemo(() => {
    let admins = 0;
    let agents = 0;
    let regularUsers = 0;
    const filtered: UserWithMeta[] = [];

    for (const u of users ?? []) {
      if (u.role === ROLES.ADMIN) admins++;
      else if (u.role === ROLES.AGENT) agents++;
      else if (u.role === ROLES.USER) regularUsers++;

      const matchesSearch =
        !searchTerm ||
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === 'all' || u.role === roleFilter;

      if (matchesSearch && matchesRole) {
        filtered.push(u);
      }
    }

    return {
      filteredUsers: filtered,
      stats: {
        total: (users ?? []).length,
        admins,
        agents,
        regularUsers,
      },
    };
  }, [users, searchTerm, roleFilter]);

  const handlePromote = useCallback(
    async (user: UserWithMeta) => {
      setPendingUserId(user.id);
      try {
        await promoteToAgent(user.id).unwrap();
        toast.success(`${user.name} has been promoted to Agent!`);
      } catch (err) {
        toast.error(extractApiError(err, 'Failed to promote user'));
      } finally {
        setPendingUserId(null);
      }
    },
    [promoteToAgent]
  );

  const handleDemoteConfirm = useCallback(async () => {
    if (!selectedUser) return;
    setPendingUserId(selectedUser.id);
    try {
      await demoteToUser(selectedUser.id).unwrap();
      toast.success(`${selectedUser.name} has been demoted to User.`);
      setModalAction(null);
      setSelectedUser(null);
    } catch (err) {
      toast.error(extractApiError(err, 'Failed to demote agent'));
    } finally {
      setPendingUserId(null);
    }
  }, [selectedUser, demoteToUser]);

  const handleDeleteConfirm = useCallback(async () => {
    if (!selectedUser) return;
    try {
      await deleteUser(selectedUser.id).unwrap();
      toast.success(`User ${selectedUser.name} has been deleted.`);
      setModalAction(null);
      setSelectedUser(null);
    } catch (err) {
      toast.error(extractApiError(err, 'Failed to delete user'));
    }
  }, [selectedUser, deleteUser]);

  const closeModal = useCallback(() => {
    setModalAction(null);
    setSelectedUser(null);
  }, []);

  return (
    <>
      {/* ── Page Header ── */}
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-brand-accent-light">
            <Users className="size-5 text-brand-accent" />
          </span>
          <div>
            <h1 className="text-2xl font-bold text-neutral-text-primary">
              User Directory
            </h1>
            <p className="text-sm text-neutral-text-secondary">
              Manage and view all registered user accounts
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-ui-info-light px-3 py-1 text-xs font-medium text-ui-info-text">
            🔒 Admin Only
          </span>
          {users && (
            <span className="rounded-full border border-neutral-border bg-neutral-bg px-3 py-1 text-xs font-medium text-neutral-text-secondary">
              {users.length} total user{users.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      {/* ── Stats Grid ── */}
      {!isLoading && !isError && users && (
        <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard
            icon={<Users className="size-5 text-brand-accent" />}
            iconBg="bg-brand-accent-light"
            label="Total Users"
            value={stats.total}
          />
          <StatCard
            icon={<Shield className="size-5 text-purple-600" />}
            iconBg="bg-purple-100"
            label="Admins"
            value={stats.admins}
          />
          <StatCard
            icon={<UserCheck className="size-5 text-blue-600" />}
            iconBg="bg-blue-100"
            label="Agents"
            value={stats.agents}
          />
          <StatCard
            icon={<Users className="size-5 text-emerald-600" />}
            iconBg="bg-emerald-100"
            label="Users"
            value={stats.regularUsers}
          />
        </div>
      )}

      {/* ── Search & Filter Bar ── */}
      {!isLoading && !isError && users && (
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Search */}
          <div className="relative flex-1 sm:max-w-sm">
            <Search
              size={16}
              className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-neutral-text-muted"
            />
            <input
              id="user-search"
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pr-9 pl-9"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute top-1/2 right-3 -translate-y-1/2 text-neutral-text-muted transition-colors hover:text-neutral-text-primary"
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Role Filter */}
          <div className="flex items-center gap-2">
            {['all', ROLES.ADMIN, ROLES.AGENT, ROLES.USER].map((role) => (
              <button
                key={role}
                id={`role-filter-${role}`}
                onClick={() => setRoleFilter(role)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
                  roleFilter === role
                    ? 'bg-brand-accent text-white shadow-sm shadow-brand-accent/25'
                    : 'border border-neutral-border bg-neutral-card text-neutral-text-secondary hover:bg-neutral-card-hover hover:text-neutral-text-primary'
                }`}
              >
                {role === 'all'
                  ? 'All Roles'
                  : role.charAt(0).toUpperCase() + role.slice(1) + 's'}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Loading State ── */}
      {isLoading && (
        <div className="overflow-hidden rounded-2xl border border-neutral-border bg-neutral-card shadow-(--shadow-premium-card)">
          <div className="border-b border-neutral-border bg-neutral-bg/40 px-6 py-4">
            <div className="h-4 w-32 animate-pulse rounded bg-neutral-border"></div>
          </div>
          <div className="divide-y divide-neutral-border">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-5">
                <div className="h-9 w-9 animate-pulse rounded-full bg-neutral-border"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-40 animate-pulse rounded bg-neutral-border"></div>
                  <div className="h-3.5 w-52 animate-pulse rounded bg-neutral-border"></div>
                </div>
                <div className="hidden gap-4 sm:flex">
                  <div className="h-6 w-16 animate-pulse rounded-full bg-neutral-border"></div>
                  <div className="h-6 w-24 animate-pulse rounded bg-neutral-border"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Error State ── */}
      {isError && (
        <div className="rounded-2xl border border-ui-danger/20 bg-ui-danger-light/10 p-8 text-center shadow-(--shadow-premium-card)">
          <AlertTriangle
            className="mx-auto mb-4 animate-bounce text-ui-danger"
            size={48}
          />
          <h3 className="text-lg font-bold text-neutral-text-primary">
            {error
              ? extractApiError(error, 'Failed to load users')
              : 'Failed to load users'}
          </h3>
          <p className="mt-1 text-sm text-neutral-text-secondary">
            There was an error fetching the user directory. Please check your
            connection or try again.
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
      )}

      {/* ── Empty State ── */}
      {!isLoading && !isError && filteredUsers.length === 0 && (
        <div className="rounded-2xl border border-neutral-border bg-neutral-card p-12 text-center shadow-(--shadow-premium-card)">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-accent-light text-brand-accent">
            <Users size={28} />
          </div>
          <h3 className="text-lg font-bold text-neutral-text-primary">
            {searchTerm || roleFilter !== 'all'
              ? 'No users match your criteria'
              : 'No users found'}
          </h3>
          <p className="mx-auto mt-2 max-w-sm text-sm text-neutral-text-secondary">
            {searchTerm || roleFilter !== 'all'
              ? 'Try adjusting your search or filters.'
              : 'There are no registered users in the system yet.'}
          </p>
          {(searchTerm || roleFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setRoleFilter('all');
              }}
              className="mt-6 btn-secondary"
            >
              Clear Filters
            </button>
          )}
        </div>
      )}

      {/* ── Users Table ── */}
      {!isLoading && !isError && filteredUsers.length > 0 && (
        <div className="relative overflow-hidden rounded-2xl border border-neutral-border bg-neutral-card shadow-(--shadow-premium-card)">
          {/* Fetch overlay */}
          {isFetching && (
            <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-neutral-card/60 backdrop-blur-[1px]">
              <RefreshCw size={24} className="animate-spin text-brand-accent" />
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-neutral-border bg-neutral-bg/40 select-none">
                  <th className="px-5 py-3 text-xs font-semibold tracking-wider text-neutral-text-secondary uppercase">
                    User
                  </th>
                  <th className="hidden px-5 py-3 text-xs font-semibold tracking-wider text-neutral-text-secondary uppercase sm:table-cell">
                    Email
                  </th>
                  <th className="px-5 py-3 text-xs font-semibold tracking-wider text-neutral-text-secondary uppercase">
                    Role
                  </th>
                  <th className="hidden px-5 py-3 text-xs font-semibold tracking-wider text-neutral-text-secondary uppercase md:table-cell">
                    Join Date
                  </th>
                  <th className="px-5 py-3 text-right text-xs font-semibold tracking-wider text-neutral-text-secondary uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-border">
                {filteredUsers.map((user: UserWithMeta) => (
                  <tr
                    key={user.id}
                    className="group transition-all duration-150 hover:bg-brand-accent/2.5"
                  >
                    {/* User name + avatar */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <UserAvatar name={user.name} role={user.role} />
                        <div>
                          <p className="text-sm font-semibold text-neutral-text-primary">
                            {user.name}
                          </p>
                          {/* Mobile-only email under name */}
                          <p className="mt-0.5 text-xs text-neutral-text-muted sm:hidden">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Email (desktop) */}
                    <td className="hidden px-5 py-4 whitespace-nowrap sm:table-cell">
                      <div className="flex items-center gap-1.5">
                        <Mail
                          size={13}
                          className="shrink-0 text-neutral-text-muted"
                        />
                        <span className="text-sm text-neutral-text-secondary">
                          {user.email}
                        </span>
                      </div>
                    </td>

                    {/* Role badge */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <RoleBadge role={user.role} />
                    </td>

                    {/* Join date */}
                    <td className="hidden px-5 py-4 whitespace-nowrap md:table-cell">
                      <div className="flex items-center gap-1.5">
                        <Calendar
                          size={13}
                          className="shrink-0 text-neutral-text-muted"
                        />
                        <span className="text-sm text-neutral-text-secondary tabular-nums">
                          {formatJoinDate(user.createdAt)}
                        </span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        {user.role === ROLES.ADMIN ? (
                          <span className="text-xs text-neutral-text-muted italic select-none">
                            Protected
                          </span>
                        ) : (
                          <>
                            {user.role === ROLES.USER && (
                              <button
                                onClick={() => handlePromote(user)}
                                disabled={pendingUserId !== null}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-brand-accent/20 bg-brand-accent-light/50 px-3 py-1.5 text-xs font-semibold text-brand-accent transition-all duration-200 hover:bg-brand-accent hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                {pendingUserId === user.id ? (
                                  <RefreshCw
                                    size={14}
                                    className="animate-spin"
                                  />
                                ) : (
                                  <Shield size={14} />
                                )}
                                {pendingUserId === user.id
                                  ? 'Promoting...'
                                  : 'Promote to Agent'}
                              </button>
                            )}
                            {user.role === ROLES.AGENT && (
                              <button
                                onClick={() => {
                                  setSelectedUser(user);
                                  setModalAction('demote');
                                }}
                                disabled={pendingUserId !== null}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-ui-warning/20 bg-ui-warning-light/50 px-3 py-1.5 text-xs font-semibold text-ui-warning-text transition-all duration-200 hover:bg-ui-warning hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                {pendingUserId === user.id ? (
                                  <RefreshCw
                                    size={14}
                                    className="animate-spin"
                                  />
                                ) : (
                                  <UserMinus size={14} />
                                )}
                                {pendingUserId === user.id
                                  ? 'Demoting...'
                                  : 'Demote to User'}
                              </button>
                            )}

                            {/* Delete User Button */}
                            <button
                              onClick={() => {
                                setSelectedUser(user);
                                setModalAction('delete');
                              }}
                              disabled={
                                pendingUserId !== null || isDeletingUser
                              }
                              className="inline-flex items-center justify-center rounded-lg border border-ui-danger/20 bg-ui-danger-light/35 p-2 text-ui-danger transition-all duration-200 hover:bg-ui-danger hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                              title={`Delete ${user.name}`}
                              aria-label={`Delete user ${user.name}`}
                            >
                              <Trash2 size={14} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer summary */}
          <div className="border-t border-neutral-border bg-neutral-bg/20 px-5 py-3">
            <p className="text-xs text-neutral-text-muted">
              Showing{' '}
              <span className="font-medium text-neutral-text-primary">
                {filteredUsers.length}
              </span>{' '}
              of{' '}
              <span className="font-medium text-neutral-text-primary">
                {users?.length ?? 0}
              </span>{' '}
              user{(users?.length ?? 0) !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      )}

      {/* Confirmation modal — shared for delete and demote */}
      <ConfirmModal
        isOpen={modalAction === 'delete'}
        title="Delete User Account"
        description={
          <>
            Are you sure you want to delete the user{' '}
            <span className="font-semibold text-wrap break-all text-neutral-text-primary">
              {selectedUser?.name} ({selectedUser?.email})
            </span>
            ? This action is permanent and cannot be undone. The user will lose
            access immediately, and any tickets assigned to them will be
            unassigned.
          </>
        }
        confirmLabel="Delete"
        confirmVariant="danger"
        isLoading={isDeletingUser}
        onConfirm={handleDeleteConfirm}
        onCancel={closeModal}
      />
      <ConfirmModal
        isOpen={modalAction === 'demote'}
        title="Demote Agent to User"
        description={
          selectedUser && selectedUser.activeTicketsCount > 0 ? (
            <>
              <span className="font-semibold text-neutral-text-primary">
                {selectedUser.name}
              </span>{' '}
              is currently assigned to{' '}
              <span className="font-bold text-ui-warning-text">
                {selectedUser.activeTicketsCount} active ticket
                {selectedUser.activeTicketsCount !== 1 ? 's' : ''}
              </span>
              . Demoting them will automatically unassign these tickets. Do you
              want to proceed?
            </>
          ) : (
            <>
              Are you sure you want to demote{' '}
              <span className="font-semibold text-neutral-text-primary">
                {selectedUser?.name}
              </span>{' '}
              from Agent to User?
            </>
          )
        }
        confirmLabel="Demote"
        confirmVariant="danger"
        isLoading={pendingUserId !== null}
        onConfirm={handleDemoteConfirm}
        onCancel={closeModal}
      />
    </>
  );
}
