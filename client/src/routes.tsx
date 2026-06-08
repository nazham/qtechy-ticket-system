/* eslint-disable react-refresh/only-export-components */
import {
  createBrowserRouter,
  createRoutesFromElements,
  Navigate,
  Route,
  useLocation,
} from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import ProtectedRoute from './components/layout/ProtectedRoute';
import AdminPage from './pages/AdminPage';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import SettingsPage from './pages/SettingsPage';
import TicketsPage from './pages/TicketsPage';
import UnauthorizedPage from './pages/UnauthorizedPage';
import UsersPage from './pages/UsersPage';
import { useAppSelector } from './store/hooks';
import { selectIsAuthenticated, selectUser } from './store/slices/authSlice';

function CatchAllRedirect() {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const user = useAppSelector(selectUser);
  const location = useLocation();

  if (isAuthenticated && user) {
    return <Navigate to="/dashboard" replace />;
  }
  return <Navigate to="/login" replace state={{ from: location }} />;
}

export const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      {/* ── Public Routes ──────────────────────────────────────────── */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* ── Protected Routes (all authenticated users) ─────────────── */}
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/tickets" element={<TicketsPage />} />
        </Route>
      </Route>

      {/* ── Admin-Only Routes ──────────────────────────────────────── */}
      <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
        <Route element={<MainLayout />}>
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/users" element={<UsersPage />} />
        </Route>
      </Route>

      {/* ── Agent + Admin Routes ───────────────────────────────────── */}
      <Route element={<ProtectedRoute allowedRoles={['admin', 'agent']} />}>
        <Route element={<MainLayout />}>
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Route>

      {/* ── Catch-all ──────────────────────────────────────────────── */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<CatchAllRedirect />} />
    </>
  )
);
