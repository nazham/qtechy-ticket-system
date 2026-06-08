import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAppSelector } from '../../store/hooks';
import {
  selectIsAuthenticated,
  selectIsInitializing,
  selectUser,
  type User,
} from '../../store/slices/authSlice';

interface ProtectedRouteProps {
  /** Roles permitted to access this route. If omitted, any authenticated user can access. */
  allowedRoles?: User['role'][];
}

export default function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const user = useAppSelector(selectUser);
  const isInitializing = useAppSelector(selectIsInitializing);
  const location = useLocation();

  // Show a loading spinner during initial session rehydration from token
  if (isInitializing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-gray-900 via-gray-800 to-indigo-900">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
          <p className="mt-3 text-sm font-medium text-indigo-200">
            Rehydrating session...
          </p>
        </div>
      </div>
    );
  }

  // ── Gate 1: Authentication ──────────────────────────────────────────────
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // ── Gate 2: Authorization ───────────────────────────────────────────────
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // ── Authorized ──────────────────────────────────────────────────────────
  return <Outlet />;
}
