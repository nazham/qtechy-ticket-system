export const TicketStatus = {
  Open: 'Open',
  InProgress: 'In Progress',
  Resolved: 'Resolved',
  Closed: 'Closed',
} as const;
export type TicketStatus = (typeof TicketStatus)[keyof typeof TicketStatus];

export const TicketCategory = {
  Bug: 'Bug',
  FeatureRequest: 'Feature Request',
  TechnicalIssue: 'Technical Issue',
  PaymentIssue: 'Payment Issue',
  AccountIssue: 'Account Issue',
  Other: 'Other',
} as const;
export type TicketCategory =
  (typeof TicketCategory)[keyof typeof TicketCategory];

export const TicketPriority = {
  Low: 'Low',
  Medium: 'Medium',
  High: 'High',
  Urgent: 'Urgent',
} as const;
export type TicketPriority =
  (typeof TicketPriority)[keyof typeof TicketPriority];
