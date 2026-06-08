import {
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  ShieldCheck,
  Ticket,
  Users,
  X,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { logout, selectUser, type User } from '../../store/slices/authSlice';

interface NavItem {
  label: string;
  to: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  roles?: User['role'][];
}

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    to: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Tickets',
    to: '/tickets',
    icon: Ticket,
  },
  {
    label: 'Users',
    to: '/users',
    icon: Users,
    roles: ['admin'],
  },
  {
    label: 'Admin Panel',
    to: '/admin',
    icon: ShieldCheck,
    roles: ['admin'],
  },
  {
    label: 'Settings',
    to: '/settings',
    icon: Settings,
    roles: ['admin', 'agent'],
  },
];

export default function MainLayout() {
  const user = useAppSelector(selectUser);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  // Mobile drawer open state
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Desktop collapsed state, persisted in localStorage
  const [collapsed, setCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebar_collapsed');
    return saved === 'true';
  });

  useEffect(() => {
    localStorage.setItem('sidebar_collapsed', String(collapsed));
  }, [collapsed]);

  const handleLogout = () => {
    dispatch(logout());
    toast.info('Logged out successfully.');
    navigate('/login');
  };

  // Filter nav items by the current user's role
  const visibleNavItems = navItems.filter(
    (item) => !item.roles || (user && item.roles.includes(user.role))
  );

  return (
    <div className="flex h-screen bg-neutral-bg text-neutral-text-primary">
      {/* ── Mobile Sidebar Drawer Overlay ─────────────────────────────────── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-dark-border bg-dark-surface text-dark-text-primary transition-all duration-300 ease-in-out lg:static lg:z-auto lg:translate-x-0 ${
          sidebarOpen
            ? 'w-64 translate-x-0'
            : '-translate-x-full lg:translate-x-0'
        } ${collapsed ? 'lg:w-20' : 'lg:w-64'}`}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between border-b border-dark-border px-5">
          <div className="flex items-center gap-3 overflow-hidden">
            {!collapsed && (
              <>
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-accent font-bold text-white shadow-md shadow-brand-accent/20">
                  QT
                </div>
                <h1 className="text-lg font-semibold tracking-tight whitespace-nowrap text-white">
                  <span className="text-brand-accent">QTechy</span> Tickets
                </h1>
              </>
            )}
          </div>

          {/* Desktop Collapse Toggle Hamburger */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={`hidden h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-dark-text-secondary transition-all duration-200 hover:bg-dark-border hover:text-dark-text-primary lg:flex ${
              collapsed ? 'sidebar-tooltip mx-auto' : ''
            }`}
            data-tooltip={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <Menu size={20} />
          </button>

          {/* Mobile Drawer Close Button */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="text-dark-text-secondary hover:text-dark-text-primary lg:hidden"
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="mt-6 flex flex-1 flex-col gap-1.5 px-3">
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setSidebarOpen(false)}
                data-tooltip={collapsed ? item.label : undefined}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-brand-accent text-white shadow-md shadow-brand-accent/25'
                      : 'text-dark-text-secondary hover:bg-dark-border hover:text-dark-text-primary'
                  } ${collapsed ? 'sidebar-tooltip justify-center' : ''}`
                }
              >
                <Icon size={20} className="shrink-0" />
                <span
                  className={`transition-all duration-300 ${
                    collapsed
                      ? 'pointer-events-none w-0 opacity-0'
                      : 'w-auto opacity-100'
                  } whitespace-nowrap`}
                >
                  {item.label}
                </span>
              </NavLink>
            );
          })}
        </nav>

        {/* Footer Actions (Logout) */}
        <div className="flex flex-col gap-1.5 border-t border-dark-border p-3">
          <button
            onClick={handleLogout}
            data-tooltip={collapsed ? 'Logout' : undefined}
            className={`flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-dark-text-secondary transition-all duration-200 hover:bg-dark-border hover:text-dark-text-primary ${
              collapsed ? 'sidebar-tooltip justify-center' : ''
            }`}
          >
            <LogOut size={20} className="shrink-0" />
            <span
              className={`transition-all duration-300 ${
                collapsed
                  ? 'pointer-events-none w-0 opacity-0'
                  : 'w-auto opacity-100'
              } whitespace-nowrap`}
            >
              Logout
            </span>
          </button>
        </div>
      </aside>

      {/* ── Main Content Area ───────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-16 items-center justify-between border-b border-neutral-border bg-neutral-card px-6 shadow-xs">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-neutral-text-secondary hover:text-neutral-text-primary lg:hidden"
            aria-label="Open sidebar"
          >
            <Menu size={24} />
          </button>

          <div className="flex-1" />

          {/* User Info */}
          {user && (
            <div className="flex items-center gap-3">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-semibold text-neutral-text-primary">
                  {user.name}
                </p>
                <p className="text-xs text-neutral-text-muted capitalize">
                  {user.role}
                </p>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-accent-light text-sm font-bold text-brand-accent shadow-sm">
                {user.name.charAt(0).toUpperCase()}
              </div>
            </div>
          )}
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-8">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
