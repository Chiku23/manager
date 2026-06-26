# Manager — Project Management Platform

A modern, full-featured project management application inspired by Jira, Shortcut, and Zoho Projects. Built for teams to plan, track, and ship software with clarity.

---

## Project Structure

```
manager/
├── manager-ui/     # Angular 21 frontend (Tailwind CSS v4)
├── backend/        # Reserved (API server — TBD)
└── README.md
```

---

## Key Features (Planned)

- **Workspaces & Projects** — Organize work across teams and initiatives
- **Issue Tracker** — Create, assign, and track bugs, tasks, stories, and epics
- **Board Views** — Kanban board, List view, and Timeline (Gantt-style)
- **Sprints** — Agile sprint planning and backlog management
- **Dashboards** — Custom widgets, charts, and activity feeds
- **Roles & Permissions** — Fine-grained access control per project
- **Notifications** — Real-time alerts and in-app notification centre
- **Search** — Global full-text search across issues, projects, and users

---

## Tech Stack

| Layer     | Technology           | Status       |
|-----------|----------------------|--------------|
| Frontend  | Angular 21 + Tailwind CSS v4 | 🚧 In Progress |
| Backend   | TBD                  | ⏳ Pending   |
| Database  | TBD                  | ⏳ Pending   |
| Auth      | TBD                  | ⏳ Pending   |
| Realtime  | TBD                  | ⏳ Pending   |

> **Note:** Backend technology and database decisions are deferred. The focus for now is building out the complete UI layer.

---

## Getting Started

### Frontend (manager-ui)

```bash
cd manager-ui
npm install
npm start          # Starts dev server at http://localhost:4200
```

See [`manager-ui/README.md`](./manager-ui/README.md) for the full UI architecture and page plan.

---

## Contributing

This is a solo/early-stage project. Contribution guidelines will be added once the architecture stabilises.

---

## License

[MIT](./LICENSE)
