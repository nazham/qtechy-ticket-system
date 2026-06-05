// ─── User Roles ──────────────────────────────────────────────
export enum UserRole {
  Admin = "Admin",
  Agent = "Agent",
  User = "User",
}
export const USER_ROLES = Object.values(UserRole);

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
