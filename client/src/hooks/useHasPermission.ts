import { useAppSelector } from '../store/hooks';
import { selectUser } from '../store/slices/authSlice';
import type { PermissionValue } from '../constants/permissions';

/**
 * Custom hook to check if the logged-in user has a specific permission or set of permissions.
 */
export function useHasPermission(permission: PermissionValue): boolean;
export function useHasPermission(
  permissions: PermissionValue[],
  mode?: 'every' | 'some'
): boolean;
export function useHasPermission(
  permissionOrPermissions: PermissionValue | PermissionValue[],
  mode: 'every' | 'some' = 'every'
): boolean {
  const user = useAppSelector(selectUser);
  if (!user?.permissions) return false;

  if (Array.isArray(permissionOrPermissions)) {
    return mode === 'every'
      ? permissionOrPermissions.every((p) => user.permissions.includes(p))
      : permissionOrPermissions.some((p) => user.permissions.includes(p));
  }
  return user.permissions.includes(permissionOrPermissions);
}
