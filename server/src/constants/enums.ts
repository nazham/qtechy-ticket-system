// ─── User Roles ──────────────────────────────────────────────
export enum UserRole {
  Admin = "Admin",
  Agent = "Agent",
  User = "User",
}
export const USER_ROLES = Object.values(UserRole);

// ─── Granular Permissions ─────────────────────────────────────
export enum Permission {
  CreateTicket = "tickets:create",
  ViewAllTickets = "tickets:view-all",
  ViewAssignedTickets = "tickets:view-assigned",
  ViewOwnTickets = "tickets:view-own",
  AssignTicket = "tickets:assign",
  UpdateTicketStatus = "tickets:update-status",
  AddComment = "tickets:add-comment",
  ManageUsers = "users:manage",
  ViewSettings = "settings:view",
  ViewDashboard = "dashboard:view",
  UpdateTicket = "tickets:update",
  DeleteTicket = "tickets:delete",
}

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.Admin]: [
    Permission.CreateTicket,
    Permission.ViewAllTickets,
    Permission.AssignTicket,
    Permission.UpdateTicketStatus,
    Permission.AddComment,
    Permission.ManageUsers,
    Permission.ViewSettings,
    Permission.ViewDashboard,
    Permission.UpdateTicket,
    Permission.DeleteTicket,
  ],
  [UserRole.Agent]: [
    Permission.ViewAssignedTickets,
    Permission.UpdateTicketStatus,
    Permission.AddComment,
    Permission.ViewSettings,
    Permission.ViewDashboard,
  ],
  [UserRole.User]: [
    Permission.CreateTicket,
    Permission.ViewOwnTickets,
    Permission.AddComment,
    Permission.ViewDashboard,
  ],
};

// ─── Ticket Status ───────────────────────────────────────────
export enum TicketStatus {
  Open = "Open",
  InProgress = "In Progress",
  Resolved = "Resolved",
  Closed = "Closed",
}
export const TICKET_STATUSES = Object.values(TicketStatus);

// ─── Ticket Category ────────────────────────────────────────
export enum TicketCategory {
  Bug = "Bug",
  FeatureRequest = "Feature Request",
  TechnicalIssue = "Technical Issue",
  PaymentIssue = "Payment Issue",
  AccountIssue = "Account Issue",
  Other = "Other",
}
export const TICKET_CATEGORIES = Object.values(TicketCategory);

// ─── Ticket Priority ────────────────────────────────────────
export enum TicketPriority {
  Low = "Low",
  Medium = "Medium",
  High = "High",
  Urgent = "Urgent",
}
export const TICKET_PRIORITIES = Object.values(TicketPriority);
