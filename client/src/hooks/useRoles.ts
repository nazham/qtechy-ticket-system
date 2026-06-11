import { useAppSelector } from '../store/hooks';
import { selectUser } from '../store/slices/authSlice';

export const isStaffRole = (role?: string) => {
  const r = role?.toLowerCase();
  return r === 'admin' || r === 'agent';
};

export const isAdminRole = (role?: string) => role?.toLowerCase() === 'admin';
export const isAgentRole = (role?: string) => role?.toLowerCase() === 'agent';
export const isUserRole = (role?: string) => role?.toLowerCase() === 'user';

export const useRoles = () => {
  const user = useAppSelector(selectUser);
  const role = user?.role;

  return {
    isAdmin: isAdminRole(role),
    isAgent: isAgentRole(role),
    isStaff: isStaffRole(role),
    isUser: isUserRole(role),
  };
};
