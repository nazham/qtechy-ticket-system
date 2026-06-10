import { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAppSelector } from '../../store/hooks';
import {
  selectIsAuthenticated,
  selectIsInitializing,
  selectUser,
} from '../../store/slices/authSlice';
import type { PermissionValue } from '../../constants/permissions';

interface ProtectedRouteProps {
  /** Permission required to access this route. If omitted, any authenticated user can access. */
  requiredPermission?: PermissionValue | PermissionValue[];
  /** Mode to match permissions: 'every' (all must match) or 'some' (any must match). Defaults to 'every'. */
  mode?: 'every' | 'some';
}

export default function ProtectedRoute({
  requiredPermission,
  mode = 'every',
}: ProtectedRouteProps) {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const user = useAppSelector(selectUser);
  const isInitializing = useAppSelector(selectIsInitializing);
  const location = useLocation();

  const isAuthorized =
    !requiredPermission ||
    (user &&
      (Array.isArray(requiredPermission)
        ? mode === 'every'
          ? requiredPermission.every((p) => user.permissions.includes(p))
          : requiredPermission.some((p) => user.permissions.includes(p))
        : user.permissions.includes(requiredPermission)));

  useEffect(() => {
    if (isAuthenticated && user && !isAuthorized) {
      toast.error('Access Denied: You do not have the required permissions.', {
        toastId: 'access-denied',
      });
    }
  }, [isAuthenticated, user, isAuthorized]);

  // Show a loading spinner during initial session rehydration from token
  if (isInitializing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-dark-base text-dark-text-primary">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-brand-accent border-t-transparent"></div>
          <p className="mt-4 text-sm font-medium text-dark-text-secondary">
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
  if (!isAuthorized) {
    return <Navigate to="/unauthorized" replace />;
  }

  // ── Authorized ──────────────────────────────────────────────────────────
  return <Outlet />;
}
