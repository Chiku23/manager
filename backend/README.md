# Manager Platform — Backend API

An Express.js + Prisma ORM + PostgreSQL REST API serving the task management platform.

---

## Technical Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database ORM**: Prisma Client v5
- **Database Store**: PostgreSQL 18
- **Authentication**: JWT Access Token (header) + HTTP-only Cookie Refresh Token rotation
- **Validation Engine**: Zod schemas

---

## Project Structure
```
backend/
├── prisma/
│   ├── schema.prisma       # Database model declarations
│   └── seed.ts             # Dev environments database seeder
├── src/
│   ├── config/
│   │   └── env.ts          # Environment runtime configuration
│   ├── lib/
│   │   ├── prisma.ts       # Database connector singleton
│   │   └── jwt.ts          # Token signing/verification utils
│   ├── middleware/
│   │   ├── authenticate.ts # Auth JWT extraction barrier
│   │   ├── validate.ts      # Zod validation schema runner
│   │   └── error-handler.ts# Express error parser
│   ├── modules/
│   │   ├── auth/           # /api/auth endpoints
│   │   ├── workspaces/     # /api/workspaces endpoints
│   │   ├── projects/       # Project metadata endpoints
│   │   ├── sprints/        # Sprint flow controllers
│   │   ├── issues/         # Tasks/bugs reordering & tracking
│   │   ├── comments/       # Thread comments per issue
│   │   ├── labels/         # Multi-color issue tagging
│   │   ├── activity/       # Auditable issue timelines
│   │   └── dashboard/      # Dynamic summary endpoints
│   ├── routes.ts           # Central routes binder
│   └── index.ts            # Server bootstrap
```

---

## Getting Started

### 1. Installation
Install project dependencies:
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` and configure your credentials:
```bash
cp .env.example .env
```

Ensure your PostgreSQL instance is running and configuration details (`DATABASE_URL`, `JWT_SECRET`) are correct in `.env`.

### 3. Run Migrations & Seed Database
Deploy schemas to database and seed sample data:
```bash
npm run db:migrate
npm run db:seed
```

### 4. Running the server
Start development compiler watch server:
```bash
npm run dev
```
The backend API server boots up on `http://localhost:3000`.

---

## API Documentation Highlights

### Public Routes
- `POST /api/auth/register` — Create a new account
- `POST /api/auth/login` — Login with credentials, returns Access Token and sets cookie Refresh Token
- `POST /api/auth/refresh` — Rotate credentials, returns new Access Token
- `POST /api/auth/logout` — Invalidate user session and clear cookies

### Protected Routes (Require `Authorization: Bearer <JWT_Token>`)
- `GET /api/auth/me` — Read current user profile
- `GET /api/workspaces` — Fetch all workspaces membership
- `POST /api/workspaces/:workspaceId/projects` — Create a project
- `GET /api/projects/:projectId/sprints` — Read sprints list
- `PATCH /api/issues/:issueId/move` — Shift issue status or sprint
- `GET /api/workspaces/:workspaceId/dashboard/stats` — Stats count details
