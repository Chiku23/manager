# manager-ui — Frontend UI Plan

Angular 21 · Tailwind CSS v4 · Light/Dark Mode

---

## Overview

`manager-ui` is the primary web frontend for the Manager platform. It is a Single Page Application (SPA) built with Angular 21, using Tailwind CSS v4 for styling and supporting full Light/Dark mode toggling.

---

## Design System

### Theme

| Token         | Light                  | Dark                   |
|---------------|------------------------|------------------------|
| Background    | `gray-50`              | `gray-950`             |
| Surface       | `white`                | `gray-900`             |
| Surface-Raised| `gray-100`             | `gray-800`             |
| Border        | `gray-200`             | `gray-700`             |
| Text Primary  | `gray-900`             | `gray-50`              |
| Text Muted    | `gray-500`             | `gray-400`             |
| Accent/Brand  | `violet-600`           | `violet-400`           |
| Danger        | `red-500`              | `red-400`              |
| Success       | `emerald-500`          | `emerald-400`          |
| Warning       | `amber-500`            | `amber-400`            |

### Typography
- Font: **Inter** (Google Fonts)
- Scale: Tailwind default (`text-xs` → `text-4xl`)

### Spacing & Layout
- Sidebar width: `64` (16rem)
- Header height: `14` (3.5rem)
- Content padding: `6` (1.5rem)
- Card radius: `rounded-xl`

---

## Layout Architecture

```
┌─────────────────────────────────────────────────────────┐
│  Global Header (fixed, full-width)                      │
│  [Logo] [Search] [Notifications] [Avatar] [Theme Toggle]│
├───────────────┬─────────────────────────────────────────┤
│               │                                         │
│  Sidebar      │  Main Content Area (router-outlet)      │
│  (fixed left) │                                         │
│               │                                         │
│  • Workspaces │                                         │
│  • Projects   │                                         │
│  • My Issues  │                                         │
│  • Boards     │                                         │
│  • Backlog    │                                         │
│  • Reports    │                                         │
│  • Settings   │                                         │
│               │                                         │
└───────────────┴─────────────────────────────────────────┘
```

---

## Pages & Routes

| Route                          | Component             | Description                              |
|--------------------------------|-----------------------|------------------------------------------|
| `/`                            | `DashboardPage`       | Overview: stats, recent activity, quick links |
| `/projects`                    | `ProjectsPage`        | All projects list with filter/sort       |
| `/projects/:id`                | `ProjectDetailPage`   | Project home with board/backlog tabs     |
| `/projects/:id/board`          | `BoardPage`           | Kanban board with draggable columns      |
| `/projects/:id/backlog`        | `BacklogPage`         | Sprint backlog and issue list            |
| `/projects/:id/timeline`       | `TimelinePage`        | Gantt-style timeline view                |
| `/issues`                      | `IssuesPage`          | Global issue list with filters           |
| `/issues/:id`                  | `IssueDetailPage`     | Full issue view with comments, activity  |
| `/sprints`                     | `SprintsPage`         | Sprint management                        |
| `/reports`                     | `ReportsPage`         | Velocity, burndown, cycle time charts    |
| `/settings`                    | `SettingsPage`        | Workspace & project settings             |
| `/settings/members`            | `MembersPage`         | Team members and role management         |
| `/profile`                     | `ProfilePage`         | User profile and preferences             |
| `/login`                       | `LoginPage`           | Authentication (future)                  |

---

## Component Tree

```
AppComponent
├── GlobalHeaderComponent
│   ├── SearchBarComponent
│   ├── NotificationBellComponent
│   └── UserAvatarMenuComponent
├── SidebarComponent
│   ├── WorkspaceSwitcherComponent
│   ├── NavGroupComponent (Projects)
│   ├── NavGroupComponent (My Work)
│   └── NavGroupComponent (Settings)
└── router-outlet
    ├── DashboardPageComponent
    │   ├── StatCardComponent (×4)
    │   ├── RecentActivityFeedComponent
    │   └── QuickCreateComponent
    ├── ProjectsPageComponent
    │   └── ProjectCardComponent (×N)
    ├── BoardPageComponent
    │   └── KanbanColumnComponent (×N)
    │       └── IssueCardComponent (×N)
    ├── BacklogPageComponent
    │   └── IssueRowComponent (×N)
    ├── IssueDetailPageComponent
    │   ├── IssueSidebarComponent (metadata panel)
    │   ├── DescriptionEditorComponent
    │   └── CommentThreadComponent
    ├── TimelinePageComponent
    └── ReportsPageComponent
        ├── BurndownChartComponent
        └── VelocityChartComponent
```

---

## UI Pages — Detailed Breakdown

### 1. Dashboard
- Stat cards: Total Issues, Open, In Progress, Completed (with trend indicator)
- Recent Activity feed (issue updates, comments, sprint changes)
- My Open Issues table
- Quick-create issue button (floating action / header button)

### 2. Projects List
- Grid of project cards (icon, name, description, progress bar, member avatars)
- Filter by status (Active / Archived), sort by Name / Last Updated
- "New Project" button → slide-over modal

### 3. Kanban Board
- Columns: **Backlog | To Do | In Progress | In Review | Done**
- Draggable issue cards (future — structure only for now)
- Column headers show WIP count and optional WIP limit badge
- Issue cards: title, priority badge, assignee avatar, issue ID, label chips

### 4. Backlog
- Sprint section (collapsible) with Start Sprint button
- Unassigned backlog section
- Issue rows: checkbox, ID, title, type icon, priority, status badge, assignee, story points

### 5. Issue Detail (Slide-over or full page)
- Left: Title (editable), Description (rich-text area), Comment thread, Activity log
- Right sidebar: Status, Assignee, Reporter, Priority, Labels, Sprint, Story Points, Created/Updated dates

### 6. Timeline
- Horizontal Gantt-style grid, weeks across the top
- Issues/epics as colour-coded bars per row
- Group by Epic or Assignee

### 7. Reports
- Burndown chart (line graph)
- Velocity chart (bar chart per sprint)
- Cycle time distribution

### 8. Settings
- Workspace name, avatar, slug
- Project settings: columns, issue types, labels, priorities
- Member management: invite, role assignment, remove

---

## Shared Components

| Component             | Purpose                                                |
|-----------------------|--------------------------------------------------------|
| `ButtonComponent`     | Primary, Secondary, Danger, Ghost variants             |
| `BadgeComponent`      | Status, Priority, Label badges                         |
| `AvatarComponent`     | User avatar with fallback initials                     |
| `ModalComponent`      | Accessible dialog overlay                              |
| `SlideoverComponent`  | Right-side panel (issue detail, create forms)          |
| `DropdownComponent`   | Select menus, context menus                            |
| `ToastComponent`      | Success/error/info notifications                       |
| `EmptyStateComponent` | Illustrated empty states with CTA                      |
| `LoadingSpinnerComponent` | Inline and full-page loading states              |
| `SearchInputComponent`| Debounced global search input                          |
| `PriorityIconComponent` | Urgent/High/Medium/Low icons with colour             |
| `IssueTypeIconComponent` | Bug/Story/Task/Epic icons                          |

---

## Feature Flags (Future Phases)

| Feature             | Phase |
|---------------------|-------|
| Rich text editor    | 2     |
| File attachments    | 2     |
| Real-time updates   | 3     |
| Integrations (Slack, GitHub) | 3 |
| AI issue summariser | 4     |
| Mobile responsive   | 2     |

---

## Development

```bash
npm install
npm start           # http://localhost:4200
npm run build       # Production build
```

Tailwind v4 is configured via `@import 'tailwindcss'` in `styles.css`.  
Dark mode is controlled by the `dark` class on the `<html>` element, toggled by the header button.

---

## File Structure (Planned)

```
src/
├── app/
│   ├── layout/
│   │   ├── header/
│   │   └── sidebar/
│   ├── pages/
│   │   ├── dashboard/
│   │   ├── projects/
│   │   ├── board/
│   │   ├── backlog/
│   │   ├── issue-detail/
│   │   ├── timeline/
│   │   ├── reports/
│   │   └── settings/
│   ├── shared/
│   │   └── components/   (Button, Badge, Avatar, Modal, etc.)
│   ├── app.routes.ts
│   ├── app.ts
│   └── app.html
├── styles.css
└── index.html
```
