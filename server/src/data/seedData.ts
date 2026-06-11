/**
 * Seed data for QTechy Ticket System.
 * Strictly conforms to Ticket and User schemas / enums.
 */
import { Types } from "mongoose";
import {
  TicketCategory,
  TicketPriority,
  TicketStatus,
  UserRole,
} from "../constants/enums";

// ─── Seed Users ──────────────────────────────────────────────────────────────
// Passwords are plain-text here; adminService hashes them before insert.
export const SEED_USERS = [
  {
    _id: new Types.ObjectId("000000000000000000000001"),
    name: "Alex Carter",
    email: "admin@qtechy.dev",
    password: "Password123!",
    role: UserRole.Admin,
  },
  {
    _id: new Types.ObjectId("000000000000000000000002"),
    name: "Jordan Lee",
    email: "agent@qtechy.dev",
    password: "Password123!",
    role: UserRole.Agent,
  },
  {
    _id: new Types.ObjectId("000000000000000000000003"),
    name: "Sam Rivera",
    email: "user@qtechy.dev",
    password: "Password123!",
    role: UserRole.User,
  },
];

const ADMIN_ID = SEED_USERS[0]._id;
const AGENT_ID = SEED_USERS[1]._id;
const USER_ID = SEED_USERS[2]._id;

// ─── Ticket Counter ───────────────────────────────────────────────────────────
let ticketSeq = 1;
const nextTicketNumber = () => `TKT-${String(ticketSeq++).padStart(4, "0")}`;

// ─── Helper Types ─────────────────────────────────────────────────────────────
interface SeedComment {
  user: Types.ObjectId;
  message: string;
  createdAt: Date;
}

interface SeedStatusHistory {
  status: TicketStatus;
  changedBy: Types.ObjectId;
  changedAt: Date;
}

interface SeedTicket {
  _id: Types.ObjectId;
  ticketNumber: string;
  title: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  assignedTo: Types.ObjectId | null;
  createdBy: Types.ObjectId;
  comments: SeedComment[];
  statusHistory: SeedStatusHistory[];
  createdAt: Date;
  updatedAt: Date;
}

// ─── Date helpers ─────────────────────────────────────────────────────────────
const daysAgo = (n: number) => new Date(Date.now() - n * 86_400_000);

// ─── Status history builders ──────────────────────────────────────────────────
const openHistory = (createdAt: Date): SeedStatusHistory[] => [
  { status: TicketStatus.Open, changedBy: ADMIN_ID, changedAt: createdAt },
];

const inProgressHistory = (createdAt: Date): SeedStatusHistory[] => [
  { status: TicketStatus.Open, changedBy: ADMIN_ID, changedAt: createdAt },
  { status: TicketStatus.InProgress, changedBy: AGENT_ID, changedAt: new Date(createdAt.getTime() + 3_600_000) },
];

const resolvedHistory = (createdAt: Date): SeedStatusHistory[] => [
  { status: TicketStatus.Open, changedBy: ADMIN_ID, changedAt: createdAt },
  { status: TicketStatus.InProgress, changedBy: AGENT_ID, changedAt: new Date(createdAt.getTime() + 3_600_000) },
  { status: TicketStatus.Resolved, changedBy: AGENT_ID, changedAt: new Date(createdAt.getTime() + 86_400_000) },
];

const closedHistory = (createdAt: Date): SeedStatusHistory[] => [
  { status: TicketStatus.Open, changedBy: ADMIN_ID, changedAt: createdAt },
  { status: TicketStatus.InProgress, changedBy: AGENT_ID, changedAt: new Date(createdAt.getTime() + 3_600_000) },
  { status: TicketStatus.Resolved, changedBy: AGENT_ID, changedAt: new Date(createdAt.getTime() + 86_400_000) },
  { status: TicketStatus.Closed, changedBy: ADMIN_ID, changedAt: new Date(createdAt.getTime() + 172_800_000) },
];

// ─── Seed Tickets ─────────────────────────────────────────────────────────────
export const SEED_TICKETS: SeedTicket[] = [
  // ── BUGS (10) ────────────────────────────────────────────────────────────────
  {
    _id: new Types.ObjectId(),
    ticketNumber: nextTicketNumber(),
    title: "Login page crashes on Safari 17",
    description:
      "When users attempt to log in using Safari 17 on macOS Sonoma, the browser tab crashes immediately after form submission. The issue does not reproduce on Chrome or Firefox. Console shows a `TypeError: undefined is not an object` related to the auth response handler.",
    category: TicketCategory.Bug,
    priority: TicketPriority.Urgent,
    status: TicketStatus.InProgress,
    assignedTo: AGENT_ID,
    createdBy: USER_ID,
    createdAt: daysAgo(12),
    updatedAt: daysAgo(10),
    comments: [
      { user: AGENT_ID, message: "Reproduced locally. Looks like a Safari-specific issue with optional chaining on null auth response. Working on a fix.", createdAt: daysAgo(11) },
      { user: USER_ID, message: "Any ETA on this? Several clients are affected.", createdAt: daysAgo(10) },
      { user: AGENT_ID, message: "Fix is in review. Should be deployed by EOD.", createdAt: daysAgo(9) },
    ],
    statusHistory: inProgressHistory(daysAgo(12)),
  },
  {
    _id: new Types.ObjectId(),
    ticketNumber: nextTicketNumber(),
    title: "Ticket list pagination resets on filter change",
    description:
      "When a user applies a status or priority filter while on page 3+ of the ticket list, the displayed page indicator resets to 1 but the data continues to load from the previous page offset. This causes duplicate entries and skipped records.",
    category: TicketCategory.Bug,
    priority: TicketPriority.High,
    status: TicketStatus.Open,
    assignedTo: null,
    createdBy: USER_ID,
    createdAt: daysAgo(8),
    updatedAt: daysAgo(8),
    comments: [
      { user: ADMIN_ID, message: "Confirmed. The pagination state is not being reset when query params change. Assigning to triage.", createdAt: daysAgo(7) },
    ],
    statusHistory: openHistory(daysAgo(8)),
  },
  {
    _id: new Types.ObjectId(),
    ticketNumber: nextTicketNumber(),
    title: "Email notifications not sent on ticket assignment",
    description:
      "Since the v2.3 deployment, agents are no longer receiving email notifications when tickets are assigned to them. The notification service logs show no outbound SMTP calls being made, suggesting the event hook was removed or broken during the refactor.",
    category: TicketCategory.Bug,
    priority: TicketPriority.High,
    status: TicketStatus.InProgress,
    assignedTo: AGENT_ID,
    createdBy: ADMIN_ID,
    createdAt: daysAgo(15),
    updatedAt: daysAgo(13),
    comments: [
      { user: AGENT_ID, message: "Checked the event bus — the `ticket.assigned` event is being emitted but the email handler is not subscribed.", createdAt: daysAgo(14) },
      { user: ADMIN_ID, message: "Good find. The handler was accidentally removed during the notification refactor. Re-adding it now.", createdAt: daysAgo(13) },
    ],
    statusHistory: inProgressHistory(daysAgo(15)),
  },
  {
    _id: new Types.ObjectId(),
    ticketNumber: nextTicketNumber(),
    title: "Dashboard statistics show incorrect open ticket count",
    description:
      "The 'Open Tickets' card on the dashboard displays a count that is consistently 2-3 higher than the actual number of open tickets in the database. Refreshing does not fix it. The discrepancy seems to increase over time.",
    category: TicketCategory.Bug,
    priority: TicketPriority.Medium,
    status: TicketStatus.Resolved,
    assignedTo: AGENT_ID,
    createdBy: USER_ID,
    createdAt: daysAgo(20),
    updatedAt: daysAgo(18),
    comments: [
      { user: AGENT_ID, message: "Root cause found: deleted tickets were not being excluded from the aggregation query. Fixed.", createdAt: daysAgo(19) },
      { user: USER_ID, message: "Count looks correct now. Thanks!", createdAt: daysAgo(18) },
    ],
    statusHistory: resolvedHistory(daysAgo(20)),
  },
  {
    _id: new Types.ObjectId(),
    ticketNumber: nextTicketNumber(),
    title: "File attachment upload silently fails for PDFs over 5MB",
    description:
      "Users attempting to upload PDF attachments larger than 5MB see a loading spinner that disappears without error. The file is not uploaded. No error is shown in the UI and no error is logged server-side. Smaller files work fine.",
    category: TicketCategory.Bug,
    priority: TicketPriority.Medium,
    status: TicketStatus.Open,
    assignedTo: null,
    createdBy: USER_ID,
    createdAt: daysAgo(5),
    updatedAt: daysAgo(5),
    comments: [],
    statusHistory: openHistory(daysAgo(5)),
  },
  {
    _id: new Types.ObjectId(),
    ticketNumber: nextTicketNumber(),
    title: "Dark mode toggle state lost on page refresh",
    description:
      "The dark mode preference is stored in component state rather than localStorage or a cookie. As a result, refreshing the page always resets to light mode, requiring the user to toggle it again each session.",
    category: TicketCategory.Bug,
    priority: TicketPriority.Low,
    status: TicketStatus.Closed,
    assignedTo: AGENT_ID,
    createdBy: USER_ID,
    createdAt: daysAgo(30),
    updatedAt: daysAgo(25),
    comments: [
      { user: AGENT_ID, message: "Fixed by persisting the preference to localStorage and reading it on app init.", createdAt: daysAgo(27) },
      { user: USER_ID, message: "Works perfectly now. Thank you!", createdAt: daysAgo(25) },
    ],
    statusHistory: closedHistory(daysAgo(30)),
  },
  {
    _id: new Types.ObjectId(),
    ticketNumber: nextTicketNumber(),
    title: "Search results do not highlight matching terms",
    description:
      "When searching for a keyword in the ticket list, the matching text in ticket titles is not highlighted. Users have to manually scan results to find why a ticket matched. The API returns the correct results; the display layer is missing highlight logic.",
    category: TicketCategory.Bug,
    priority: TicketPriority.Low,
    status: TicketStatus.Open,
    assignedTo: null,
    createdBy: USER_ID,
    createdAt: daysAgo(3),
    updatedAt: daysAgo(3),
    comments: [],
    statusHistory: openHistory(daysAgo(3)),
  },
  {
    _id: new Types.ObjectId(),
    ticketNumber: nextTicketNumber(),
    title: "Agent cannot view ticket comments after reassignment",
    description:
      "When a ticket is reassigned from Agent A to Agent B, Agent B can see the ticket in their queue but comments from before the reassignment are not visible. The API is returning comments correctly — the client is filtering by assignedTo incorrectly.",
    category: TicketCategory.Bug,
    priority: TicketPriority.High,
    status: TicketStatus.InProgress,
    assignedTo: AGENT_ID,
    createdBy: ADMIN_ID,
    createdAt: daysAgo(6),
    updatedAt: daysAgo(5),
    comments: [
      { user: AGENT_ID, message: "Confirmed. The comment filter in the detail view is comparing the wrong field. Patch in progress.", createdAt: daysAgo(5) },
    ],
    statusHistory: inProgressHistory(daysAgo(6)),
  },
  {
    _id: new Types.ObjectId(),
    ticketNumber: nextTicketNumber(),
    title: "Ticket creation form does not clear after successful submission",
    description:
      "After successfully creating a ticket, the create form fields (title, description, category, priority) remain populated. Users must manually clear each field before creating another ticket, which is especially frustrating for bulk creation workflows.",
    category: TicketCategory.Bug,
    priority: TicketPriority.Low,
    status: TicketStatus.Resolved,
    assignedTo: AGENT_ID,
    createdBy: USER_ID,
    createdAt: daysAgo(18),
    updatedAt: daysAgo(16),
    comments: [
      { user: AGENT_ID, message: "Fixed by calling `form.reset()` inside the `onSuccess` callback of the mutation.", createdAt: daysAgo(17) },
    ],
    statusHistory: resolvedHistory(daysAgo(18)),
  },
  {
    _id: new Types.ObjectId(),
    ticketNumber: nextTicketNumber(),
    title: "Timezone mismatch causes wrong 'created at' display",
    description:
      "Ticket creation timestamps are stored in UTC but displayed using the server's local timezone without conversion. Users in UTC+5:30 see ticket times that are 5.5 hours behind the actual creation time.",
    category: TicketCategory.Bug,
    priority: TicketPriority.Medium,
    status: TicketStatus.Open,
    assignedTo: null,
    createdBy: USER_ID,
    createdAt: daysAgo(2),
    updatedAt: daysAgo(2),
    comments: [
      { user: ADMIN_ID, message: "All date rendering should use `toLocaleDateString` with the user's locale. Will address in next sprint.", createdAt: daysAgo(1) },
    ],
    statusHistory: openHistory(daysAgo(2)),
  },

  // ── FEATURE REQUESTS (10) ─────────────────────────────────────────────────────
  {
    _id: new Types.ObjectId(),
    ticketNumber: nextTicketNumber(),
    title: "Add bulk ticket assignment for agents",
    description:
      "Admins frequently need to assign dozens of tickets to a specific agent after a sprint planning session. Currently, each ticket must be opened and assigned individually. A bulk select + assign workflow on the tickets list would save significant time.",
    category: TicketCategory.FeatureRequest,
    priority: TicketPriority.High,
    status: TicketStatus.Open,
    assignedTo: null,
    createdBy: USER_ID,
    createdAt: daysAgo(10),
    updatedAt: daysAgo(10),
    comments: [
      { user: ADMIN_ID, message: "Great idea. This is on our Q3 roadmap. Upvotes will help prioritize.", createdAt: daysAgo(9) },
    ],
    statusHistory: openHistory(daysAgo(10)),
  },
  {
    _id: new Types.ObjectId(),
    ticketNumber: nextTicketNumber(),
    title: "Export tickets to CSV / Excel",
    description:
      "Finance and management teams need to export ticket data for monthly reporting in spreadsheet format. The current system only supports viewing tickets in the web UI. An export button on the ticket list that generates a CSV would meet this need.",
    category: TicketCategory.FeatureRequest,
    priority: TicketPriority.Medium,
    status: TicketStatus.InProgress,
    assignedTo: AGENT_ID,
    createdBy: USER_ID,
    createdAt: daysAgo(25),
    updatedAt: daysAgo(22),
    comments: [
      { user: AGENT_ID, message: "Implementing using the `papaparse` library for CSV generation on the client side.", createdAt: daysAgo(23) },
      { user: USER_ID, message: "Will this support filtering? E.g., export only Open tickets from this month?", createdAt: daysAgo(22) },
      { user: AGENT_ID, message: "Yes, the export will respect the currently applied filters.", createdAt: daysAgo(21) },
    ],
    statusHistory: inProgressHistory(daysAgo(25)),
  },
  {
    _id: new Types.ObjectId(),
    ticketNumber: nextTicketNumber(),
    title: "Add SLA countdown timer on ticket cards",
    description:
      "Support managers need to quickly identify tickets approaching their SLA deadline. Adding a visible countdown timer (e.g., '2h 15m remaining') on ticket cards, color-coded red when under 1 hour, would enable proactive escalation.",
    category: TicketCategory.FeatureRequest,
    priority: TicketPriority.High,
    status: TicketStatus.Open,
    assignedTo: null,
    createdBy: ADMIN_ID,
    createdAt: daysAgo(7),
    updatedAt: daysAgo(7),
    comments: [],
    statusHistory: openHistory(daysAgo(7)),
  },
  {
    _id: new Types.ObjectId(),
    ticketNumber: nextTicketNumber(),
    title: "Integrate Slack notifications for critical tickets",
    description:
      "When a ticket is created with Urgent priority, support team members should receive an immediate Slack message in the #support-alerts channel. Currently, agents only learn of urgent tickets by checking the dashboard, which introduces response delays.",
    category: TicketCategory.FeatureRequest,
    priority: TicketPriority.High,
    status: TicketStatus.Open,
    assignedTo: null,
    createdBy: ADMIN_ID,
    createdAt: daysAgo(4),
    updatedAt: daysAgo(4),
    comments: [
      { user: USER_ID, message: "This would be a game-changer for our on-call team. +1.", createdAt: daysAgo(3) },
    ],
    statusHistory: openHistory(daysAgo(4)),
  },
  {
    _id: new Types.ObjectId(),
    ticketNumber: nextTicketNumber(),
    title: "Add ticket merge functionality",
    description:
      "Duplicate tickets are frequently created by different users reporting the same underlying issue. An admin or agent should be able to merge duplicate tickets, combining their comments and status history under one canonical ticket.",
    category: TicketCategory.FeatureRequest,
    priority: TicketPriority.Medium,
    status: TicketStatus.Open,
    assignedTo: null,
    createdBy: ADMIN_ID,
    createdAt: daysAgo(14),
    updatedAt: daysAgo(14),
    comments: [],
    statusHistory: openHistory(daysAgo(14)),
  },
  {
    _id: new Types.ObjectId(),
    ticketNumber: nextTicketNumber(),
    title: "Add rich text / markdown support in ticket descriptions",
    description:
      "Support agents often need to include code snippets, bullet lists, and bold/italic formatting in ticket descriptions and comments. A Markdown editor with preview would greatly improve the quality of communication between users and agents.",
    category: TicketCategory.FeatureRequest,
    priority: TicketPriority.Low,
    status: TicketStatus.Open,
    assignedTo: null,
    createdBy: USER_ID,
    createdAt: daysAgo(11),
    updatedAt: daysAgo(11),
    comments: [
      { user: ADMIN_ID, message: "We'll evaluate `react-md-editor` as a drop-in solution. Low priority for now.", createdAt: daysAgo(10) },
    ],
    statusHistory: openHistory(daysAgo(11)),
  },
  {
    _id: new Types.ObjectId(),
    ticketNumber: nextTicketNumber(),
    title: "Custom ticket fields per category",
    description:
      "Different ticket categories have different data requirements. Bug reports need a browser/OS field and reproduction steps; Payment Issues need a transaction ID. Allow admins to configure custom fields per category in the settings panel.",
    category: TicketCategory.FeatureRequest,
    priority: TicketPriority.Medium,
    status: TicketStatus.Open,
    assignedTo: null,
    createdBy: ADMIN_ID,
    createdAt: daysAgo(9),
    updatedAt: daysAgo(9),
    comments: [],
    statusHistory: openHistory(daysAgo(9)),
  },
  {
    _id: new Types.ObjectId(),
    ticketNumber: nextTicketNumber(),
    title: "Implement two-factor authentication (2FA)",
    description:
      "Enterprise customers require 2FA to comply with their internal security policies. Adding TOTP-based 2FA (compatible with Google Authenticator and Authy) would unblock several enterprise deals currently in the pipeline.",
    category: TicketCategory.FeatureRequest,
    priority: TicketPriority.Urgent,
    status: TicketStatus.InProgress,
    assignedTo: AGENT_ID,
    createdBy: ADMIN_ID,
    createdAt: daysAgo(22),
    updatedAt: daysAgo(19),
    comments: [
      { user: AGENT_ID, message: "Using `speakeasy` for TOTP and `qrcode` for setup QR generation.", createdAt: daysAgo(21) },
      { user: ADMIN_ID, message: "Make sure to also implement backup recovery codes.", createdAt: daysAgo(20) },
    ],
    statusHistory: inProgressHistory(daysAgo(22)),
  },
  {
    _id: new Types.ObjectId(),
    ticketNumber: nextTicketNumber(),
    title: "Ticket templates for common issue types",
    description:
      "Users frequently create tickets for repetitive issues (password reset, billing query, onboarding help). Allowing admins to create ticket templates that pre-fill the title, description, category and priority would reduce friction and improve data quality.",
    category: TicketCategory.FeatureRequest,
    priority: TicketPriority.Low,
    status: TicketStatus.Open,
    assignedTo: null,
    createdBy: USER_ID,
    createdAt: daysAgo(6),
    updatedAt: daysAgo(6),
    comments: [],
    statusHistory: openHistory(daysAgo(6)),
  },
  {
    _id: new Types.ObjectId(),
    ticketNumber: nextTicketNumber(),
    title: "Mobile app for iOS and Android",
    description:
      "Field support agents need to view and update tickets while away from their desks. A React Native mobile app with push notifications, ticket list, detail view, status updates and comment support would enable true mobile-first support workflows.",
    category: TicketCategory.FeatureRequest,
    priority: TicketPriority.Medium,
    status: TicketStatus.Open,
    assignedTo: null,
    createdBy: ADMIN_ID,
    createdAt: daysAgo(28),
    updatedAt: daysAgo(28),
    comments: [
      { user: ADMIN_ID, message: "Adding to the long-term product roadmap. Will revisit after the web app reaches feature parity.", createdAt: daysAgo(27) },
    ],
    statusHistory: openHistory(daysAgo(28)),
  },

  // ── TECHNICAL ISSUES (10) ──────────────────────────────────────────────────
  {
    _id: new Types.ObjectId(),
    ticketNumber: nextTicketNumber(),
    title: "API response time exceeds 3s on ticket list endpoint",
    description:
      "The `GET /api/tickets` endpoint has degraded over the past two weeks, now taking 3-6 seconds to respond under normal load. Database query profiling shows a missing index on the `status` + `createdAt` compound field is causing a full collection scan.",
    category: TicketCategory.TechnicalIssue,
    priority: TicketPriority.High,
    status: TicketStatus.Resolved,
    assignedTo: AGENT_ID,
    createdBy: ADMIN_ID,
    createdAt: daysAgo(16),
    updatedAt: daysAgo(14),
    comments: [
      { user: AGENT_ID, message: "Added the compound index in a migration. Response times are now under 200ms in testing.", createdAt: daysAgo(15) },
      { user: ADMIN_ID, message: "Confirmed in production. Great catch and fast turnaround.", createdAt: daysAgo(14) },
    ],
    statusHistory: resolvedHistory(daysAgo(16)),
  },
  {
    _id: new Types.ObjectId(),
    ticketNumber: nextTicketNumber(),
    title: "Memory leak in the Node.js server after 48h uptime",
    description:
      "The production server's memory usage climbs from ~150MB at startup to over 2GB after 48 hours of continuous operation, eventually causing OOM crashes. Heap snapshots suggest uncollected event listener references in the WebSocket connection manager.",
    category: TicketCategory.TechnicalIssue,
    priority: TicketPriority.Urgent,
    status: TicketStatus.InProgress,
    assignedTo: AGENT_ID,
    createdBy: ADMIN_ID,
    createdAt: daysAgo(9),
    updatedAt: daysAgo(7),
    comments: [
      { user: AGENT_ID, message: "Profiling with `clinic.js` confirmed the leak is in the `ConnectionManager.on('disconnect')` handler. Listeners are not being removed on connection close.", createdAt: daysAgo(8) },
      { user: ADMIN_ID, message: "This is P0. Loop in the backend lead.", createdAt: daysAgo(7) },
    ],
    statusHistory: inProgressHistory(daysAgo(9)),
  },
  {
    _id: new Types.ObjectId(),
    ticketNumber: nextTicketNumber(),
    title: "JWT tokens not expiring correctly",
    description:
      "User sessions remain valid long after the configured `JWT_EXPIRES_IN` value. Investigation shows the `expiresIn` option is being read from an environment variable that defaults to `undefined` when not set, causing tokens to have no expiry.",
    category: TicketCategory.TechnicalIssue,
    priority: TicketPriority.Urgent,
    status: TicketStatus.Resolved,
    assignedTo: AGENT_ID,
    createdBy: ADMIN_ID,
    createdAt: daysAgo(35),
    updatedAt: daysAgo(32),
    comments: [
      { user: AGENT_ID, message: "Added a startup assertion that throws if `JWT_EXPIRES_IN` is not set. Also hardcoded a fallback of `7d`.", createdAt: daysAgo(34) },
      { user: ADMIN_ID, message: "Good. Also invalidate all existing tokens by rotating the JWT_SECRET.", createdAt: daysAgo(33) },
    ],
    statusHistory: resolvedHistory(daysAgo(35)),
  },
  {
    _id: new Types.ObjectId(),
    ticketNumber: nextTicketNumber(),
    title: "Database connection pool exhausted under load",
    description:
      "During peak hours (09:00-11:00 UTC), the application throws `MongoServerError: connection pool exhausted` errors. The current pool size is set to 5, which is insufficient for the concurrent request volume. Requests queue and time out after 30 seconds.",
    category: TicketCategory.TechnicalIssue,
    priority: TicketPriority.High,
    status: TicketStatus.Closed,
    assignedTo: AGENT_ID,
    createdBy: ADMIN_ID,
    createdAt: daysAgo(40),
    updatedAt: daysAgo(36),
    comments: [
      { user: AGENT_ID, message: "Increased `maxPoolSize` to 50 in the Mongoose connection options. Will monitor.", createdAt: daysAgo(39) },
      { user: ADMIN_ID, message: "Peak hour errors have stopped. Closing.", createdAt: daysAgo(36) },
    ],
    statusHistory: closedHistory(daysAgo(40)),
  },
  {
    _id: new Types.ObjectId(),
    ticketNumber: nextTicketNumber(),
    title: "CORS errors blocking frontend on staging environment",
    description:
      "The staging frontend at `https://staging.qtechy.dev` cannot reach the staging API at `https://api-staging.qtechy.dev` due to CORS policy errors. The CORS allow-list in the server config only contains the production domain.",
    category: TicketCategory.TechnicalIssue,
    priority: TicketPriority.Medium,
    status: TicketStatus.Resolved,
    assignedTo: AGENT_ID,
    createdBy: ADMIN_ID,
    createdAt: daysAgo(19),
    updatedAt: daysAgo(17),
    comments: [
      { user: AGENT_ID, message: "Added `https://staging.qtechy.dev` to the CORS origin array. Staging is now accessible.", createdAt: daysAgo(18) },
    ],
    statusHistory: resolvedHistory(daysAgo(19)),
  },
  {
    _id: new Types.ObjectId(),
    ticketNumber: nextTicketNumber(),
    title: "Redis cache invalidation not working after ticket updates",
    description:
      "Ticket detail pages are served from a Redis cache with a 10-minute TTL. When an agent updates a ticket's status, the cache is not being invalidated, so users continue to see the old status for up to 10 minutes.",
    category: TicketCategory.TechnicalIssue,
    priority: TicketPriority.Medium,
    status: TicketStatus.Open,
    assignedTo: null,
    createdBy: ADMIN_ID,
    createdAt: daysAgo(5),
    updatedAt: daysAgo(5),
    comments: [],
    statusHistory: openHistory(daysAgo(5)),
  },
  {
    _id: new Types.ObjectId(),
    ticketNumber: nextTicketNumber(),
    title: "CI/CD pipeline failing on TypeScript strict mode checks",
    description:
      "After upgrading TypeScript from 5.3 to 5.5, the CI pipeline fails with 23 new type errors introduced by stricter checks. These are primarily `exactOptionalPropertyTypes` violations in the API response interfaces.",
    category: TicketCategory.TechnicalIssue,
    priority: TicketPriority.Medium,
    status: TicketStatus.InProgress,
    assignedTo: AGENT_ID,
    createdBy: ADMIN_ID,
    createdAt: daysAgo(3),
    updatedAt: daysAgo(2),
    comments: [
      { user: AGENT_ID, message: "Fixing the violations file by file. About halfway through. No logic changes needed — just type annotations.", createdAt: daysAgo(2) },
    ],
    statusHistory: inProgressHistory(daysAgo(3)),
  },
  {
    _id: new Types.ObjectId(),
    ticketNumber: nextTicketNumber(),
    title: "Rate limiting not applied to auth endpoints",
    description:
      "The `/api/auth/login` and `/api/auth/register` endpoints have no rate limiting. Automated testing confirmed 1000 login attempts per minute can be made from a single IP without throttling, creating a brute-force vulnerability.",
    category: TicketCategory.TechnicalIssue,
    priority: TicketPriority.Urgent,
    status: TicketStatus.Resolved,
    assignedTo: AGENT_ID,
    createdBy: ADMIN_ID,
    createdAt: daysAgo(13),
    updatedAt: daysAgo(11),
    comments: [
      { user: AGENT_ID, message: "Applied `express-rate-limit` middleware to auth routes: 10 requests/15 minutes per IP with a 429 response.", createdAt: daysAgo(12) },
      { user: ADMIN_ID, message: "Verified. Also added a CAPTCHA challenge after 3 failed attempts.", createdAt: daysAgo(11) },
    ],
    statusHistory: resolvedHistory(daysAgo(13)),
  },
  {
    _id: new Types.ObjectId(),
    ticketNumber: nextTicketNumber(),
    title: "Mongoose schema not validating on update operations",
    description:
      "Mongoose `runValidators` is not set to `true` for `findByIdAndUpdate` calls, meaning invalid data (e.g., empty strings, out-of-enum values) can be saved to the database via PUT endpoints, bypassing schema constraints.",
    category: TicketCategory.TechnicalIssue,
    priority: TicketPriority.High,
    status: TicketStatus.Open,
    assignedTo: null,
    createdBy: ADMIN_ID,
    createdAt: daysAgo(4),
    updatedAt: daysAgo(4),
    comments: [],
    statusHistory: openHistory(daysAgo(4)),
  },
  {
    _id: new Types.ObjectId(),
    ticketNumber: nextTicketNumber(),
    title: "Docker container exits on startup due to missing env vars",
    description:
      "The production Docker container exits immediately with code 1 when `MONGO_URI` or `JWT_SECRET` env vars are not provided. The error is not surfaced clearly; the container just stops. A startup env-var validation layer with clear error messages is needed.",
    category: TicketCategory.TechnicalIssue,
    priority: TicketPriority.Medium,
    status: TicketStatus.Closed,
    assignedTo: AGENT_ID,
    createdBy: ADMIN_ID,
    createdAt: daysAgo(45),
    updatedAt: daysAgo(42),
    comments: [
      { user: AGENT_ID, message: "Added a startup validation function that checks all required env vars and logs clear error messages before exiting.", createdAt: daysAgo(44) },
      { user: ADMIN_ID, message: "Deploy worked cleanly. Closing.", createdAt: daysAgo(42) },
    ],
    statusHistory: closedHistory(daysAgo(45)),
  },

  // ── PAYMENT ISSUES (8) ────────────────────────────────────────────────────
  {
    _id: new Types.ObjectId(),
    ticketNumber: nextTicketNumber(),
    title: "Subscription renewal charge failed without warning",
    description:
      "My annual subscription renewal was attempted without any advance notice email. The charge failed because my card had expired, and my account was immediately downgraded. I should have received at least a 14-day warning before renewal.",
    category: TicketCategory.PaymentIssue,
    priority: TicketPriority.High,
    status: TicketStatus.Resolved,
    assignedTo: AGENT_ID,
    createdBy: USER_ID,
    createdAt: daysAgo(8),
    updatedAt: daysAgo(6),
    comments: [
      { user: AGENT_ID, message: "Confirmed the renewal reminder emails were disabled due to a misconfiguration. We've sent you a 30-day grace period and fixed the email settings.", createdAt: daysAgo(7) },
      { user: USER_ID, message: "Thank you! I've updated my card and the account is back to Pro.", createdAt: daysAgo(6) },
    ],
    statusHistory: resolvedHistory(daysAgo(8)),
  },
  {
    _id: new Types.ObjectId(),
    ticketNumber: nextTicketNumber(),
    title: "Double charge for Pro plan upgrade",
    description:
      "I was charged twice when upgrading from the Free tier to Pro. My bank statement shows two identical transactions of $49.00 on the same date. My transaction ID is TXN-20240601-8821. Please refund the duplicate charge immediately.",
    category: TicketCategory.PaymentIssue,
    priority: TicketPriority.Urgent,
    status: TicketStatus.InProgress,
    assignedTo: AGENT_ID,
    createdBy: USER_ID,
    createdAt: daysAgo(2),
    updatedAt: daysAgo(1),
    comments: [
      { user: AGENT_ID, message: "Located both transactions. A refund has been initiated for the duplicate $49.00 charge. It will appear on your statement within 3-5 business days.", createdAt: daysAgo(1) },
      { user: USER_ID, message: "Thank you for acting quickly. I'll watch for the refund.", createdAt: daysAgo(1) },
    ],
    statusHistory: inProgressHistory(daysAgo(2)),
  },
  {
    _id: new Types.ObjectId(),
    ticketNumber: nextTicketNumber(),
    title: "Invoice PDF showing incorrect company name",
    description:
      "All invoices generated for our account show 'Acme Corp' as the company name instead of 'Rivera Solutions LLC'. We updated our billing profile three months ago but the change has not been reflected on any invoices since then.",
    category: TicketCategory.PaymentIssue,
    priority: TicketPriority.Medium,
    status: TicketStatus.Open,
    assignedTo: null,
    createdBy: USER_ID,
    createdAt: daysAgo(3),
    updatedAt: daysAgo(3),
    comments: [],
    statusHistory: openHistory(daysAgo(3)),
  },
  {
    _id: new Types.ObjectId(),
    ticketNumber: nextTicketNumber(),
    title: "Coupon code not applying correct discount",
    description:
      "The promo code SAVE30 is supposed to apply a 30% discount but only applies 10% at checkout. I've tried multiple browsers and incognito mode. The code was confirmed valid by your marketing team but the discount calculation appears to be wrong.",
    category: TicketCategory.PaymentIssue,
    priority: TicketPriority.Medium,
    status: TicketStatus.Resolved,
    assignedTo: AGENT_ID,
    createdBy: USER_ID,
    createdAt: daysAgo(17),
    updatedAt: daysAgo(15),
    comments: [
      { user: AGENT_ID, message: "Found the issue: the SAVE30 coupon was configured with a 10% value in the Stripe dashboard due to a data entry error. Corrected and the difference has been credited to your account.", createdAt: daysAgo(16) },
    ],
    statusHistory: resolvedHistory(daysAgo(17)),
  },
  {
    _id: new Types.ObjectId(),
    ticketNumber: nextTicketNumber(),
    title: "Cannot add a second payment method to account",
    description:
      "The billing portal only allows one payment method. When I try to add a backup credit card, I get the error 'Maximum payment methods reached'. Our account should support multiple payment methods for redundancy.",
    category: TicketCategory.PaymentIssue,
    priority: TicketPriority.Low,
    status: TicketStatus.Open,
    assignedTo: null,
    createdBy: USER_ID,
    createdAt: daysAgo(6),
    updatedAt: daysAgo(6),
    comments: [
      { user: ADMIN_ID, message: "This is a known limitation of the current billing provider integration. Multi-card support is on the roadmap for Q4.", createdAt: daysAgo(5) },
    ],
    statusHistory: openHistory(daysAgo(6)),
  },
  {
    _id: new Types.ObjectId(),
    ticketNumber: nextTicketNumber(),
    title: "VAT not calculated for EU customers at checkout",
    description:
      "EU-based customers are not having VAT added to their invoices, which creates compliance risk for them. The checkout should detect EU billing addresses and apply the correct country-specific VAT rate.",
    category: TicketCategory.PaymentIssue,
    priority: TicketPriority.High,
    status: TicketStatus.InProgress,
    assignedTo: AGENT_ID,
    createdBy: ADMIN_ID,
    createdAt: daysAgo(11),
    updatedAt: daysAgo(9),
    comments: [
      { user: AGENT_ID, message: "Integrating the `vatapi.com` service to lookup VAT rates by country code at checkout.", createdAt: daysAgo(10) },
    ],
    statusHistory: inProgressHistory(daysAgo(11)),
  },
  {
    _id: new Types.ObjectId(),
    ticketNumber: nextTicketNumber(),
    title: "Refund not processed after account cancellation",
    description:
      "I cancelled my Pro subscription 12 days ago and was told I'd receive a pro-rated refund within 7 days. No refund has appeared yet. My cancellation confirmation number is CAN-20240523-441.",
    category: TicketCategory.PaymentIssue,
    priority: TicketPriority.High,
    status: TicketStatus.Resolved,
    assignedTo: AGENT_ID,
    createdBy: USER_ID,
    createdAt: daysAgo(12),
    updatedAt: daysAgo(10),
    comments: [
      { user: AGENT_ID, message: "Found that the refund task was stuck in 'pending' state due to a Stripe webhook failure. Manually triggered the refund. You should see it within 2 business days.", createdAt: daysAgo(11) },
      { user: USER_ID, message: "Refund received. Thank you.", createdAt: daysAgo(10) },
    ],
    statusHistory: resolvedHistory(daysAgo(12)),
  },
  {
    _id: new Types.ObjectId(),
    ticketNumber: nextTicketNumber(),
    title: "Annual plan billed monthly instead of once per year",
    description:
      "I signed up for the annual plan but I am being charged monthly. Over 4 months I have been charged $49.00 × 4 = $196, when the annual plan should be a single charge of $399. Please correct the billing cycle and refund the overcharge.",
    category: TicketCategory.PaymentIssue,
    priority: TicketPriority.Urgent,
    status: TicketStatus.Closed,
    assignedTo: AGENT_ID,
    createdBy: USER_ID,
    createdAt: daysAgo(50),
    updatedAt: daysAgo(46),
    comments: [
      { user: AGENT_ID, message: "A bug in the plan migration script assigned the wrong Stripe price ID. Corrected the subscription and issued a refund of $196.", createdAt: daysAgo(49) },
      { user: USER_ID, message: "Refund confirmed. Subscription now shows annual. Thank you!", createdAt: daysAgo(47) },
      { user: ADMIN_ID, message: "Fixed the migration script to prevent recurrence. Closing.", createdAt: daysAgo(46) },
    ],
    statusHistory: closedHistory(daysAgo(50)),
  },

  // ── ACCOUNT ISSUES (7) ────────────────────────────────────────────────────
  {
    _id: new Types.ObjectId(),
    ticketNumber: nextTicketNumber(),
    title: "Cannot reset password — reset email not arriving",
    description:
      "I requested a password reset 3 times over 2 days and have not received the email. I have checked spam, junk, and promotions folders. My email address is confirmed in the account settings. The reset confirmation page shows 'Email sent' but nothing arrives.",
    category: TicketCategory.AccountIssue,
    priority: TicketPriority.High,
    status: TicketStatus.Resolved,
    assignedTo: AGENT_ID,
    createdBy: USER_ID,
    createdAt: daysAgo(7),
    updatedAt: daysAgo(5),
    comments: [
      { user: AGENT_ID, message: "Found that your email domain has strict DMARC rules blocking our sender domain. We've updated our SPF record. Please try the reset again.", createdAt: daysAgo(6) },
      { user: USER_ID, message: "Reset email arrived and I've regained access. Thank you!", createdAt: daysAgo(5) },
    ],
    statusHistory: resolvedHistory(daysAgo(7)),
  },
  {
    _id: new Types.ObjectId(),
    ticketNumber: nextTicketNumber(),
    title: "Account locked after 3 incorrect password attempts",
    description:
      "My account was locked after I accidentally entered the wrong password 3 times. The lockout duration is listed as '30 minutes' but my account has been locked for over 2 hours. I need immediate access restored.",
    category: TicketCategory.AccountIssue,
    priority: TicketPriority.High,
    status: TicketStatus.Closed,
    assignedTo: AGENT_ID,
    createdBy: USER_ID,
    createdAt: daysAgo(21),
    updatedAt: daysAgo(19),
    comments: [
      { user: AGENT_ID, message: "Manually unlocked the account. The 30-minute timer had a bug where it used seconds instead of milliseconds. Fix deployed.", createdAt: daysAgo(20) },
    ],
    statusHistory: closedHistory(daysAgo(21)),
  },
  {
    _id: new Types.ObjectId(),
    ticketNumber: nextTicketNumber(),
    title: "Profile picture upload not persisting after save",
    description:
      "When I upload a new profile picture and click Save, the image appears correctly in the preview. However, after refreshing or returning to the profile page, the old image is still shown. The upload API returns a 200 response.",
    category: TicketCategory.AccountIssue,
    priority: TicketPriority.Medium,
    status: TicketStatus.InProgress,
    assignedTo: AGENT_ID,
    createdBy: USER_ID,
    createdAt: daysAgo(5),
    updatedAt: daysAgo(4),
    comments: [
      { user: AGENT_ID, message: "Reproduced. The S3 upload URL is being generated correctly, but the profile `avatarUrl` field is not being updated in the database after upload. Fixing.", createdAt: daysAgo(4) },
    ],
    statusHistory: inProgressHistory(daysAgo(5)),
  },
  {
    _id: new Types.ObjectId(),
    ticketNumber: nextTicketNumber(),
    title: "Email address change not reflected across all services",
    description:
      "I changed my email address in account settings but continue to receive notifications at my old address. The new address only receives marketing emails. It appears the notification service was not updated with the new email.",
    category: TicketCategory.AccountIssue,
    priority: TicketPriority.Medium,
    status: TicketStatus.Open,
    assignedTo: null,
    createdBy: USER_ID,
    createdAt: daysAgo(4),
    updatedAt: daysAgo(4),
    comments: [],
    statusHistory: openHistory(daysAgo(4)),
  },
  {
    _id: new Types.ObjectId(),
    ticketNumber: nextTicketNumber(),
    title: "Team member invitation link expired immediately",
    description:
      "I sent a team invitation to a colleague but the link expired before they could click it. The invitation email says the link is valid for 7 days, but my colleague received the error 'Invitation expired or invalid' within an hour of receiving the email.",
    category: TicketCategory.AccountIssue,
    priority: TicketPriority.Medium,
    status: TicketStatus.Resolved,
    assignedTo: AGENT_ID,
    createdBy: USER_ID,
    createdAt: daysAgo(10),
    updatedAt: daysAgo(8),
    comments: [
      { user: AGENT_ID, message: "Bug found: invitation token TTL was set to 3600 seconds (1 hour) rather than 604800 seconds (7 days) in the config. Fixed and re-sent the invitation.", createdAt: daysAgo(9) },
    ],
    statusHistory: resolvedHistory(daysAgo(10)),
  },
  {
    _id: new Types.ObjectId(),
    ticketNumber: nextTicketNumber(),
    title: "Cannot delete account — button not responding",
    description:
      "The 'Delete Account' button in account settings is non-functional. Clicking it shows a brief loading state then returns to the settings page with no action taken and no error message. Network tab shows no request being made.",
    category: TicketCategory.AccountIssue,
    priority: TicketPriority.Low,
    status: TicketStatus.Open,
    assignedTo: null,
    createdBy: USER_ID,
    createdAt: daysAgo(2),
    updatedAt: daysAgo(2),
    comments: [],
    statusHistory: openHistory(daysAgo(2)),
  },
  {
    _id: new Types.ObjectId(),
    ticketNumber: nextTicketNumber(),
    title: "SSO login with Google fails for accounts with + in email",
    description:
      "Users with Gmail addresses containing a '+' alias (e.g., user+work@gmail.com) cannot log in via Google SSO. The OAuth callback fails with a 400 error. Standard email/password login works fine for these accounts.",
    category: TicketCategory.AccountIssue,
    priority: TicketPriority.High,
    status: TicketStatus.Open,
    assignedTo: null,
    createdBy: USER_ID,
    createdAt: daysAgo(1),
    updatedAt: daysAgo(1),
    comments: [
      { user: ADMIN_ID, message: "Raised with the auth team. The `+` in the email is likely not being URL-encoded before the OAuth redirect. Investigating.", createdAt: daysAgo(1) },
    ],
    statusHistory: openHistory(daysAgo(1)),
  },

  // ── OTHER (7) ──────────────────────────────────────────────────────────────
  {
    _id: new Types.ObjectId(),
    ticketNumber: nextTicketNumber(),
    title: "Documentation for API authentication is outdated",
    description:
      "The public API documentation still references the deprecated API key authentication method. The system migrated to JWT Bearer tokens 6 months ago. Developers integrating with the API are confused and waste hours following outdated instructions.",
    category: TicketCategory.Other,
    priority: TicketPriority.Medium,
    status: TicketStatus.InProgress,
    assignedTo: AGENT_ID,
    createdBy: USER_ID,
    createdAt: daysAgo(14),
    updatedAt: daysAgo(12),
    comments: [
      { user: AGENT_ID, message: "Updating the authentication section in the Docusaurus site. Will also add a migration guide for developers coming from the API key system.", createdAt: daysAgo(13) },
    ],
    statusHistory: inProgressHistory(daysAgo(14)),
  },
  {
    _id: new Types.ObjectId(),
    ticketNumber: nextTicketNumber(),
    title: "Onboarding tutorial skips the 'Create Ticket' step",
    description:
      "New users who complete the onboarding tutorial are never shown how to create their first ticket. The tutorial jumps from 'View Dashboard' directly to 'View Settings', leaving users unsure of the core workflow.",
    category: TicketCategory.Other,
    priority: TicketPriority.Low,
    status: TicketStatus.Resolved,
    assignedTo: AGENT_ID,
    createdBy: USER_ID,
    createdAt: daysAgo(26),
    updatedAt: daysAgo(23),
    comments: [
      { user: AGENT_ID, message: "Added a 'Create your first ticket' step between the Dashboard and Settings steps. Tutorial flow updated.", createdAt: daysAgo(25) },
    ],
    statusHistory: resolvedHistory(daysAgo(26)),
  },
  {
    _id: new Types.ObjectId(),
    ticketNumber: nextTicketNumber(),
    title: "Keyboard shortcuts conflict with browser defaults",
    description:
      "The app's keyboard shortcut `Ctrl+F` for the ticket search bar conflicts with the browser's native find-in-page shortcut. Users trying to search within the ticket list accidentally trigger the browser's native search overlay.",
    category: TicketCategory.Other,
    priority: TicketPriority.Low,
    status: TicketStatus.Open,
    assignedTo: null,
    createdBy: USER_ID,
    createdAt: daysAgo(8),
    updatedAt: daysAgo(8),
    comments: [
      { user: ADMIN_ID, message: "Will remap to `Ctrl+K` (command palette style) to avoid conflicts. Update pending design review.", createdAt: daysAgo(7) },
    ],
    statusHistory: openHistory(daysAgo(8)),
  },
  {
    _id: new Types.ObjectId(),
    ticketNumber: nextTicketNumber(),
    title: "Accessibility: screen reader not announcing ticket status changes",
    description:
      "When an agent updates a ticket's status using the dropdown, the change is visually reflected but screen readers receive no ARIA live region announcement. Users relying on assistive technology cannot confirm that their action was successful.",
    category: TicketCategory.Other,
    priority: TicketPriority.Medium,
    status: TicketStatus.Open,
    assignedTo: null,
    createdBy: USER_ID,
    createdAt: daysAgo(6),
    updatedAt: daysAgo(6),
    comments: [],
    statusHistory: openHistory(daysAgo(6)),
  },
  {
    _id: new Types.ObjectId(),
    ticketNumber: nextTicketNumber(),
    title: "Ticket status badge colors indistinguishable for color-blind users",
    description:
      "The 'Open' (green) and 'In Progress' (yellow-green) status badges are nearly identical for users with deuteranopia (green-color blindness). Replacing color as the sole differentiator with icons or patterns would improve accessibility.",
    category: TicketCategory.Other,
    priority: TicketPriority.Medium,
    status: TicketStatus.InProgress,
    assignedTo: AGENT_ID,
    createdBy: USER_ID,
    createdAt: daysAgo(9),
    updatedAt: daysAgo(7),
    comments: [
      { user: AGENT_ID, message: "Adding distinct icons to each badge (circle for Open, clock for In Progress, checkmark for Resolved, lock for Closed) so they are distinguishable beyond color alone.", createdAt: daysAgo(8) },
    ],
    statusHistory: inProgressHistory(daysAgo(9)),
  },
  {
    _id: new Types.ObjectId(),
    ticketNumber: nextTicketNumber(),
    title: "Add print-friendly stylesheet for ticket reports",
    description:
      "When printing a ticket detail page using `Ctrl+P`, the sidebar navigation, header, and action buttons are included in the print output, wasting paper and making printed reports hard to read. A `@media print` CSS stylesheet is needed.",
    category: TicketCategory.Other,
    priority: TicketPriority.Low,
    status: TicketStatus.Open,
    assignedTo: null,
    createdBy: USER_ID,
    createdAt: daysAgo(3),
    updatedAt: daysAgo(3),
    comments: [],
    statusHistory: openHistory(daysAgo(3)),
  },
  {
    _id: new Types.ObjectId(),
    ticketNumber: nextTicketNumber(),
    title: "Request: official status page for system incidents",
    description:
      "During last month's outage, we had no visibility into whether the issue was on our side or QTechy's infrastructure. A public status page (similar to statuspage.io) would allow customers to check incident status and subscribe to updates.",
    category: TicketCategory.Other,
    priority: TicketPriority.Medium,
    status: TicketStatus.Closed,
    assignedTo: AGENT_ID,
    createdBy: USER_ID,
    createdAt: daysAgo(60),
    updatedAt: daysAgo(55),
    comments: [
      { user: ADMIN_ID, message: "We have launched a status page at status.qtechy.dev. Subscribers will receive email and SMS alerts for any incidents.", createdAt: daysAgo(58) },
      { user: USER_ID, message: "Subscribed! This is exactly what we needed.", createdAt: daysAgo(55) },
    ],
    statusHistory: closedHistory(daysAgo(60)),
  },
];
