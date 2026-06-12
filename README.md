# QTechy Ticket System

> A full-stack support ticket management system with role-based access control (RBAC), real-time optimistic UI updates, and an admin-only panel for database management.

**Live Links**
| | URL |
|---|---|
| **Client (Vercel)** | https://qtechy-ticket-system.vercel.app/ |
| **Server (Render)** | https://qtechy-ticket-system-mh7m.onrender.com/api |
| **GitHub** | https://github.com/nazham/qtechy-ticket-system |

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Key Features & UI Pages](#key-features--ui-pages)
- [Prerequisites](#prerequisites)
- [Local Setup — Server](#local-setup--server)
- [Local Setup — Client](#local-setup--client)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Role-Based Access Control](#role-based-access-control)
- [Data Models](#data-models)
- [Seeding & Clean Sweep](#seeding--clean-sweep)
- [Deployment](#deployment)
- [Test Login Credentials](#test-login-credentials)
- [Scripts](#scripts)

---

## Tech Stack

### Server

| Layer      | Technology                         |
| ---------- | ---------------------------------- |
| Runtime    | Node.js 20                         |
| Language   | TypeScript 6                       |
| Framework  | Express 5                          |
| Database   | MongoDB (via Mongoose 9)           |
| Auth       | JWT (`jsonwebtoken`) + `bcryptjs`  |
| Validation | Zod 4                              |
| Security   | Helmet, CORS, `express-rate-limit` |
| Logging    | Morgan                             |

### Client

| Layer         | Technology                |
| ------------- | ------------------------- |
| Framework     | React 19 + Vite 8         |
| Language      | TypeScript 6              |
| State / API   | Redux Toolkit + RTK Query |
| Styling       | Tailwind CSS 4            |
| Routing       | React Router DOM 7        |
| Notifications | React Toastify            |

---

## Project Structure

```
qtechy-ticket-system/
├── client/                     # React + Vite frontend
│   ├── src/
│   │   ├── api/                # API utility functions
│   │   ├── components/
│   │   │   ├── layout/         # MainLayout, ProtectedRoute
│   │   │   ├── shared/         # Reusable shared UI (ConfirmModal.tsx)
│   │   │   └── tickets/        # Ticket-specific UI components
│   │   ├── constants/          # enums.ts, permissions.ts
│   │   ├── hooks/              # Custom React hooks
│   │   ├── pages/              # Route-level page components
│   │   │   ├── AdminPage.tsx
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── LoginPage.tsx
│   │   │   ├── RegisterPage.tsx
│   │   │   ├── TicketDetailsPage.tsx
│   │   │   ├── TicketsPage.tsx
│   │   │   ├── SettingsPage.tsx
│   │   │   ├── UnauthorizedPage.tsx
│   │   │   └── UsersPage.tsx
│   │   ├── store/
│   │   │   ├── apiSlice.ts     # RTK Query base (auto-logout on 401)
│   │   │   ├── store.ts
│   │   │   ├── hooks.ts
│   │   │   └── slices/
│   │   │       ├── authApi.ts  # login, register, getMe
│   │   │       ├── authSlice.ts
│   │   │       ├── ticketApi.ts # all ticket endpoints
│   │   │       ├── userApi.ts  # user management endpoints (directory, promote, demote, delete)
│   │   │       └── adminApi.ts  # seed, sweep
│   │   ├── routes.tsx
│   │   ├── App.tsx
│   │   └── index.css
│   └── package.json
│
└── server/                     # Express + Mongoose backend
    ├── src/
    │   ├── config/
    │   │   └── db.ts           # MongoDB connection (sanitizeFilter on)
    │   ├── constants/
    │   │   └── enums.ts        # UserRole, Permission, TicketStatus, etc.
    │   ├── controllers/        # authController, ticketController, userController, etc.
    │   ├── data/
    │   │   └── seedData.ts     # 52 tickets + 3 users (seed payload)
    │   ├── middleware/
    │   │   ├── authMiddleware.ts   # protect + authorizePermissions
    │   │   ├── errorHandler.ts
    │   │   ├── rateLimiter.ts      # 10 req / 15 min on auth routes
    │   │   └── validate.ts
    │   ├── models/
    │   │   ├── User.ts
    │   │   └── Ticket.ts
    │   ├── routes/
    │   │   ├── authRoutes.ts
    │   │   ├── ticketRoutes.ts
    │   │   ├── userRoutes.ts
    │   │   └── adminRoutes.ts
    │   ├── services/
    │   │   ├── authService.ts
    │   │   ├── ticketService.ts
    │   │   ├── userService.ts  # user directory and role operations
    │   │   └── adminService.ts
    │   ├── validators/         # Zod schemas (auth, ticket, user, shared)
    │   └── server.ts           # App entry point
    └── package.json
```

---

## Key Features & UI Pages

The QTechy Ticket System comes with a robust set of full-stack features, tailored for distinct user roles:

### 1. Interactive Dashboard

- **Ticket Status Statistics**: Get a quick overview of open, in-progress, resolved, and closed tickets.
- **Category Distribution (Donut Chart)**: Modern, responsive **Donut Chart** that highlights ticket distribution across categories (Bug, Feature Request, Technical Issue, Payment Issue, Account Issue, Other) in real time (migrated from the previous static bar chart).
- **Comprehensive Counts**: The dashboard metrics (like total user counts) now properly aggregate all registered accounts, including Admin roles.

### 2. User Directory & Management (`/users`) — _Admin Only_

- **Role-Based Access**: Restricted exclusively to Admins via permission-gated routing.
- **Directory Stat Cards**: Quick-glance counters for Total Users, Admins, Agents, and regular Users.
- **Search & Filter**: Find users instantly with name/email search or filter the directory list by specific roles.
- **Inline Operations**:
  - **Promote to Agent**: Seamlessly elevate standard users to support agents, giving them ticket-handling capabilities.
  - **Demote to User**: Revert agent status back to a standard user.
  - **Delete User**: Permanently delete user accounts from the database.
- **Robust Database Consistency**: Promoting, demoting, or deleting users triggers database-level updates. Specifically, deleting or demoting an Agent automatically unassigns them from all their tickets in an atomic MongoDB transaction.

### 3. Reusable ConfirmModal Component

- **Universal Confirmation UI**: A custom, accessible confirmation dialog that replaces default browser prompts and inline modal duplicates.
- **Dynamic Styling Variants**: Supports warning-based styling (`danger` for deletions/demotions) and general actions (`primary`).
- **Forced typed confirmation**: Includes support for typed inputs (e.g. typing `CONFIRM` or name confirmation) to prevent accidental destructive actions.
- **Visual Loading Indicator**: Displays progress animations and disables interaction during asynchronous API requests.

---

## Prerequisites

| Tool                             | Version |
| -------------------------------- | ------- |
| Node.js                          | ≥ 20    |
| npm                              | ≥ 10    |
| MongoDB Atlas (or local MongoDB) | any     |

---

## Local Setup — Server

```bash
# 1. Clone the repository
git clone https://github.com/nazham/qtechy-ticket-system.git
cd qtechy-ticket-system/server

# 2. Install dependencies
npm install

# 3. Create the env file
cp .env.example .env    # then fill in your values (see section below)

# 4. Start development server (hot-reload via ts-node-dev)
npm run dev
# → http://localhost:5001
```

---

## Local Setup — Client

```bash
cd ../client

# 1. Install dependencies
npm install

# 2. Create the env file
cp .env.example .env    # set VITE_API_URL

# 3. Start the dev server
npm run dev
# → http://localhost:5173
```

---

## Environment Variables

### Server — `/server/.env`

| Variable         | Required | Description                   | Example                                               |
| ---------------- | -------- | ----------------------------- | ----------------------------------------------------- |
| `MONGO_URI`      | ✅       | MongoDB connection string     | `mongodb+srv://user:pass@cluster0.mongodb.net/qtechy` |
| `PORT`           | ✅       | Port the server listens on    | `5001`                                                |
| `JWT_SECRET`     | ✅       | Secret key for signing JWTs   | `your_super_secret_key`                               |
| `JWT_EXPIRES_IN` | ✅       | JWT expiry duration           | `30d`                                                 |
| `NODE_ENV`       | ❌       | `development` or `production` | `development`                                         |

### Client — `/client/.env`

| Variable       | Required | Description                     | Example                     |
| -------------- | -------- | ------------------------------- | --------------------------- |
| `VITE_API_URL` | ✅       | Full base URL of the server API | `http://localhost:5001/api` |

> For production (Vercel), set `VITE_API_URL` to the live Render URL:
> `https://qtechy-ticket-system-mh7m.onrender.com/api`

---

## API Reference

All endpoints are prefixed with `/api`. The server runs on port `5001` locally.

### Health

| Method | Endpoint      | Auth | Description                                                     |
| ------ | ------------- | ---- | --------------------------------------------------------------- |
| `GET`  | `/api/health` | None | Returns `{ success: true, message: "API is running smoothly" }` |

### Auth — `/api/auth`

> Rate-limited to **10 requests per 15 minutes** per IP on login and register.

| Method | Endpoint         | Auth            | Body                        | Description                                                    |
| ------ | ---------------- | --------------- | --------------------------- | -------------------------------------------------------------- |
| `POST` | `/auth/register` | None            | `{ name, email, password }` | Register a new user account (default role: `User`)             |
| `POST` | `/auth/login`    | None            | `{ email, password }`       | Login; returns `{ success, data: { user, token } }`            |
| `GET`  | `/auth/me`       | 🔒 Bearer token | —                           | Returns the current authenticated user's profile + permissions |

### Tickets — `/api/tickets`

All ticket routes require authentication.

| Method   | Endpoint                | Permission                                 | Description                                                                                                                                                                            |
| -------- | ----------------------- | ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GET`    | `/tickets`              | All roles                                  | List tickets (RBAC-filtered: Admin → all, Agent → assigned, User → own). Supports query params: `page`, `limit`, `searchTerm`, `status`, `priority`, `category`, `sortBy`, `sortOrder` |
| `POST`   | `/tickets`              | `tickets:create` (Admin, User)             | Create a new ticket                                                                                                                                                                    |
| `GET`    | `/tickets/statistics`   | `dashboard:view`                           | Returns status counts, category distribution, recent activity                                                                                                                          |
| `GET`    | `/tickets/:id`          | All roles                                  | Get a single ticket with comments and status history                                                                                                                                   |
| `PUT`    | `/tickets/:id`          | `tickets:update` (Admin)                   | Update ticket fields (title, description, category, priority)                                                                                                                          |
| `DELETE` | `/tickets/:id`          | `tickets:delete` (Admin)                   | Delete a ticket                                                                                                                                                                        |
| `PUT`    | `/tickets/:id/assign`   | `tickets:assign` (Admin)                   | Assign ticket to an agent                                                                                                                                                              |
| `PUT`    | `/tickets/:id/status`   | `tickets:update-status` (Admin, Agent)     | Update ticket status                                                                                                                                                                   |
| `POST`   | `/tickets/:id/comments` | `tickets:add-comment` (Admin, Agent, User) | Add a comment to a ticket                                                                                                                                                              |

### Users — `/api/users`

All user management endpoints require the `users:manage` permission (Admin only).

| Method   | Endpoint             | Permission     | Description                                                                                              |
| -------- | -------------------- | -------------- | -------------------------------------------------------------------------------------------------------- |
| `GET`    | `/users`             | `users:manage` | List all users (optionally filter by `?role=Admin`, `?role=Agent`, or `?role=User`)                      |
| `GET`    | `/users/directory`   | `users:manage` | Get user list with active ticket counts for each user                                                    |
| `PUT`    | `/users/:id/promote` | `users:manage` | Promote a user to the `Agent` role                                                                       |
| `PUT`    | `/users/:id/demote`  | `users:manage` | Demote an `Agent` to the `User` role (automatically and atomicity-safely unassigns their active tickets) |
| `DELETE` | `/users/:id`         | `users:manage` | Permanently deletes a user (automatically and atomicity-safely unassigns their tickets)                  |

### Admin — `/api/admin`

> Admin-only. Requires `users:manage` permission.

| Method   | Endpoint       | Permission | Description                                                   |
| -------- | -------------- | ---------- | ------------------------------------------------------------- |
| `POST`   | `/admin/seed`  | Admin      | Wipes all data and inserts 52 seed tickets + 3 dummy accounts |
| `DELETE` | `/admin/sweep` | Admin      | Permanently deletes **all** tickets and user accounts         |

---

## Role-Based Access Control

Permissions are assigned per role in `server/src/constants/enums.ts` and mirrored on the client.

| Permission              | Admin | Agent | User |
| ----------------------- | :---: | :---: | :--: |
| `tickets:create`        |  ✅   |       |  ✅  |
| `tickets:view-all`      |  ✅   |       |      |
| `tickets:view-assigned` |       |  ✅   |      |
| `tickets:view-own`      |       |       |  ✅  |
| `tickets:assign`        |  ✅   |       |      |
| `tickets:update`        |  ✅   |       |      |
| `tickets:update-status` |  ✅   |  ✅   |      |
| `tickets:delete`        |  ✅   |       |      |
| `tickets:add-comment`   |  ✅   |  ✅   |  ✅  |
| `users:manage`          |  ✅   |       |      |
| `dashboard:view`        |  ✅   |  ✅   |  ✅  |
| `settings:view`         |  ✅   |  ✅   |      |

**Front-end routes by role:**

| Route          |  Admin   |     Agent     |   User    |
| -------------- | :------: | :-----------: | :-------: |
| `/dashboard`   |    ✅    |      ✅       |    ✅     |
| `/tickets`     | ✅ (All) | ✅ (Assigned) | ✅ (Mine) |
| `/tickets/:id` |    ✅    |      ✅       |    ✅     |
| `/settings`    |    ✅    |      ✅       |    ❌     |
| `/admin`       |    ✅    |      ❌       |    ❌     |
| `/users`       |    ✅    |      ❌       |    ❌     |

---

## Data Models

### User

| Field                     | Type   | Notes                                          |
| ------------------------- | ------ | ---------------------------------------------- |
| `name`                    | String | Required, 2–60 chars                           |
| `email`                   | String | Unique, lowercased                             |
| `password`                | String | bcrypt-hashed, min 6 chars                     |
| `role`                    | Enum   | `Admin` \| `Agent` \| `User` (default: `User`) |
| `createdAt` / `updatedAt` | Date   | Auto (Mongoose timestamps)                     |

> The `password` and `__v` fields are stripped from all JSON responses. A `permissions` array (derived from the role) is injected instead.

### Ticket

| Field                     | Type            | Notes                                                                                            |
| ------------------------- | --------------- | ------------------------------------------------------------------------------------------------ |
| `ticketNumber`            | String          | Unique, auto-generated (`TKT-XXXX`)                                                              |
| `title`                   | String          | Required                                                                                         |
| `description`             | String          | Required                                                                                         |
| `category`                | Enum            | `Bug` \| `Feature Request` \| `Technical Issue` \| `Payment Issue` \| `Account Issue` \| `Other` |
| `priority`                | Enum            | `Low` \| `Medium` \| `High` \| `Urgent`                                                          |
| `status`                  | Enum            | `Open` \| `In Progress` \| `Resolved` \| `Closed` (default: `Open`)                              |
| `assignedTo`              | ObjectId → User | Nullable                                                                                         |
| `createdBy`               | ObjectId → User | Required                                                                                         |
| `comments`                | Array           | `{ user, message, createdAt }`                                                                   |
| `statusHistory`           | Array           | `{ status, changedBy, changedAt }`                                                               |
| `createdAt` / `updatedAt` | Date            | Auto                                                                                             |

---

## Seeding & Clean Sweep

The Admin Panel (`/admin`) exposes two database operations:

### Seed Database (`POST /api/admin/seed`)

- Deletes **all** existing tickets and users first
- Inserts **3 dummy user accounts** (Admin, Agent, User)
- Inserts **52 realistic tickets** covering all categories, priorities, and statuses, each with comments and full status history
- Returns `{ usersCreated: 3, ticketsCreated: 52 }`

### Clean Sweep (`DELETE /api/admin/sweep`)

- Permanently deletes **every** ticket and user account
- Returns `{ ticketsDeleted: N, usersDeleted: N }`
- The UI requires typing `CONFIRM` before this action is allowed

Both operations are gated behind the `users:manage` permission (Admin only).

---

## Test Login Credentials

Use these accounts after hitting **Seed Database** from the Admin Panel, or if the live database already has seed data.

| Role      | Name        | Email              | Password               |
| --------- | ----------- | ------------------ | ---------------------- |
| **Admin** | Alex Carter | `admin@qtechy.dev` | `QTechy$SecurePass99!` |
| **Agent** | Jordan Lee  | `agent@qtechy.dev` | `QTechy$SecurePass99!` |
| **User**  | Sam Rivera  | `user@qtechy.dev`  | `QTechy$SecurePass99!` |

> Each role unlocks a different view of the app. Log in with the Admin account first to explore the full Admin Panel.

---

## Scripts

### Server

| Command                | Description                                                     |
| ---------------------- | --------------------------------------------------------------- |
| `npm run dev`          | Start dev server with hot-reload (`ts-node-dev`) on port `5001` |
| `npm run build`        | Compile TypeScript → `dist/`                                    |
| `npm run start`        | Run the compiled production build (`node dist/server.js`)       |
| `npm run format`       | Format `src/**/*.ts` with Prettier                              |
| `npm run format:check` | Check formatting without writing                                |

### Client

| Command                | Description                          |
| ---------------------- | ------------------------------------ |
| `npm run dev`          | Start Vite dev server on port `5173` |
| `npm run build`        | Type-check + production Vite build   |
| `npm run preview`      | Preview the production build locally |
| `npm run lint`         | Run ESLint                           |
| `npm run format`       | Format all files with Prettier       |
| `npm run format:check` | Check formatting without writing     |

---
