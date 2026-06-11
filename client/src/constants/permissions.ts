export const Permission = {
  CreateTicket: 'tickets:create',
  ViewAllTickets: 'tickets:view-all',
  ViewAssignedTickets: 'tickets:view-assigned',
  ViewOwnTickets: 'tickets:view-own',
  AssignTicket: 'tickets:assign',
  UpdateTicketStatus: 'tickets:update-status',
  AddComment: 'tickets:add-comment',
  ManageUsers: 'users:manage',
  ViewSettings: 'settings:view',
  ViewDashboard: 'dashboard:view',
  UpdateTicket: 'tickets:update',
  DeleteTicket: 'tickets:delete',
} as const;

export type PermissionValue = (typeof Permission)[keyof typeof Permission];
