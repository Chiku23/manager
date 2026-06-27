# Manager API Specification & Angular Integration Guide

This guide provides the complete API contracts, request/response models, and TypeScript interfaces needed to build the Angular API service layer.

---

## 🔑 Global Connection & Authentication

- **Base URL**: `http://localhost:3000/api`
- **Content Type**: `application/json`
- **Access Tokens**: Sent via `Authorization: Bearer <token>` header on all protected routes.
- **Refresh Tokens**: Automatically set and handled via HTTP-Only cookies. Must configure Angular's `HttpClient` with `{ withCredentials: true }` on auth requests.

---

## 📦 TypeScript Interfaces (Angular Models)

Create a `src/app/models/` folder in Angular and define these core types:

```typescript
// user.model.ts
export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  createdAt?: string;
}

// workspace.model.ts
export interface Workspace {
  id: string;
  name: string;
  slug: string;
  ownerId: string;
  role?: 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';
  createdAt: string;
}

export interface WorkspaceMember {
  id: string;
  userId: string;
  workspaceId: string;
  role: 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';
  joinedAt: string;
  user: User;
}

// project.model.ts
export interface Project {
  id: string;
  workspaceId: string;
  name: string;
  key: string;
  description: string | null;
  color: string;
  archivedAt: string | null;
  createdAt: string;
  _count?: {
    issues: number;
    members: number;
  };
}

export interface ProjectMember {
  id: string;
  userId: string;
  projectId: string;
  role: 'ADMIN' | 'MEMBER' | 'VIEWER';
  joinedAt: string;
  user: User;
}

// sprint.model.ts
export interface Sprint {
  id: string;
  projectId: string;
  name: string;
  goal: string | null;
  status: 'PLANNED' | 'ACTIVE' | 'COMPLETED';
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  issues?: Issue[];
  _count?: {
    issues: number;
  };
}

// issue.model.ts
export type IssueType = 'TASK' | 'BUG' | 'STORY' | 'EPIC';
export type IssueStatus = 'BACKLOG' | 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';
export type IssuePriority = 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface Issue {
  id: string;
  projectId: string;
  sprintId: string | null;
  parentId: string | null;
  title: string;
  description: string | null;
  type: IssueType;
  status: IssueStatus;
  priority: IssuePriority;
  storyPoints: number | null;
  order: number;
  assigneeId: string | null;
  reporterId: string;
  createdAt: string;
  updatedAt: string;
  assignee?: User | null;
  reporter?: User;
  labels?: { label: Label }[];
  parent?: { id: string; title: string; type: IssueType; status: IssueStatus } | null;
  children?: Issue[];
  _count?: {
    comments: number;
  };
}

// comment.model.ts
export interface Comment {
  id: string;
  issueId: string;
  authorId: string;
  body: string;
  createdAt: string;
  updatedAt: string;
  author: User;
}

// label.model.ts
export interface Label {
  id: string;
  projectId: string;
  name: string;
  color: string;
}

// activity.model.ts
export interface Activity {
  id: string;
  issueId: string;
  actorId: string;
  type: 'ISSUE_CREATED' | 'ISSUE_UPDATED' | 'STATUS_CHANGED' | 'ASSIGNEE_CHANGED' | 'PRIORITY_CHANGED' | 'SPRINT_CHANGED' | 'COMMENT_ADDED' | 'LABEL_ADDED' | 'LABEL_REMOVED';
  meta: any;
  createdAt: string;
  actor: User;
  issue?: { id: string; title: string; type: string; projectId: string };
}
```

---

## 📡 Endpoint Specifications

### 1. Authentication Services (`/api/auth`)

#### Register User
- **Method / Path**: `POST /auth/register`
- **Request Body**:
  ```typescript
  { name: string; email: string; password: string } // min password len: 8
  ```
- **Response (201)**:
  ```typescript
  { user: User; accessToken: string }
  ```

#### Login User
- **Method / Path**: `POST /auth/login`
- **Request Body**:
  ```typescript
  { email: string; password: string }
  ```
- **Response (200)**:
  ```typescript
  { user: User; accessToken: string }
  ```

#### Refresh Token Rotation
- **Method / Path**: `POST /auth/refresh`
- **Note**: Cookie `refresh_token` must be forwarded automatically.
- **Response (200)**:
  ```typescript
  { accessToken: string }
  ```

#### Logout User
- **Method / Path**: `POST /auth/logout`
- **Response (200)**:
  ```typescript
  { message: string }
  ```

#### Get Current User Profile
- **Method / Path**: `GET /auth/me`
- **Response (200)**:
  ```typescript
  { user: User }
  ```

#### Update Profile Details
- **Method / Path**: `PATCH /auth/me`
- **Request Body**:
  ```typescript
  { name?: string; avatarUrl?: string }
  ```
- **Response (200)**:
  ```typescript
  { user: User }
  ```

---

### 2. Workspace Management (`/api/workspaces`)

#### Create Workspace
- **Method / Path**: `POST /workspaces`
- **Request Body**:
  ```typescript
  { name: string; slug: string } // Slug must be lowercase alphanumeric with hyphens
  ```
- **Response (201)**:
  ```typescript
  { workspace: Workspace }
  ```

#### List Workspaces
- **Method / Path**: `GET /workspaces`
- **Response (200)**:
  ```typescript
  { workspaces: Workspace[] }
  ```

#### Get Workspace Details
- **Method / Path**: `GET /workspaces/:workspaceId`
- **Response (200)**:
  ```typescript
  { workspace: Workspace }
  ```

#### Update Workspace
- **Method / Path**: `PATCH /workspaces/:workspaceId`
- **Request Body**:
  ```typescript
  { name?: string; slug?: string }
  ```
- **Response (200)**:
  ```typescript
  { workspace: Workspace }
  ```

#### Delete Workspace
- **Method / Path**: `DELETE /workspaces/:workspaceId`
- **Response (200)**:
  ```typescript
  { message: string }
  ```

#### List Workspace Members
- **Method / Path**: `GET /workspaces/:workspaceId/members`
- **Response (200)**:
  ```typescript
  { members: WorkspaceMember[] }
  ```

#### Invite Member
- **Method / Path**: `POST /workspaces/:workspaceId/members/invite`
- **Request Body**:
  ```typescript
  { email: string; role: 'ADMIN' | 'MEMBER' | 'VIEWER' }
  ```
- **Response (201)**:
  ```typescript
  { member: WorkspaceMember }
  ```

#### Update Member Role
- **Method / Path**: `PATCH /workspaces/:workspaceId/members/:userId`
- **Request Body**:
  ```typescript
  { role: 'ADMIN' | 'MEMBER' | 'VIEWER' }
  ```
- **Response (200)**:
  ```typescript
  { member: WorkspaceMember }
  ```

#### Remove Member
- **Method / Path**: `DELETE /workspaces/:workspaceId/members/:userId`
- **Response (200)**:
  ```typescript
  { message: string }
  ```

---

### 3. Project Management (`/api`)

#### Create Project
- **Method / Path**: `POST /workspaces/:workspaceId/projects`
- **Request Body**:
  ```typescript
  { name: string; key: string; description?: string; color?: string }
  ```
- **Response (201)**:
  ```typescript
  { project: Project }
  ```

#### List Projects
- **Method / Path**: `GET /workspaces/:workspaceId/projects`
- **Response (200)**:
  ```typescript
  { projects: Project[] }
  ```

#### Get Project details
- **Method / Path**: `GET /workspaces/:workspaceId/projects/:projectId`
- **Response (200)**:
  ```typescript
  { project: Project & { members: ProjectMember[] } }
  ```

#### Update Project
- **Method / Path**: `PATCH /workspaces/:workspaceId/projects/:projectId`
- **Request Body**:
  ```typescript
  { name?: string; description?: string; color?: string }
  ```
- **Response (200)**:
  ```typescript
  { project: Project }
  ```

#### Toggle Archive Project
- **Method / Path**: `PATCH /workspaces/:workspaceId/projects/:projectId/archive`
- **Response (200)**:
  ```typescript
  { project: Project }
  ```

#### Delete Project
- **Method / Path**: `DELETE /workspaces/:workspaceId/projects/:projectId`
- **Response (200)**:
  ```typescript
  { message: string }
  ```

#### List Project Members
- **Method / Path**: `GET /projects/:projectId/members`
- **Response (200)**:
  ```typescript
  { members: ProjectMember[] }
  ```

#### Add Project Member
- **Method / Path**: `POST /projects/:projectId/members`
- **Request Body**:
  ```typescript
  { userId: string; role: 'ADMIN' | 'MEMBER' | 'VIEWER' }
  ```
- **Response (201)**:
  ```typescript
  { member: ProjectMember }
  ```

---

### 4. Sprint Flows (`/api`)

#### Create Sprint
- **Method / Path**: `POST /projects/:projectId/sprints`
- **Request Body**:
  ```typescript
  { name: string; goal?: string; startDate?: string; endDate?: string }
  ```
- **Response (201)**:
  ```typescript
  { sprint: Sprint }
  ```

#### List Sprints
- **Method / Path**: `GET /projects/:projectId/sprints`
- **Response (200)**:
  ```typescript
  { sprints: (Sprint & { _count: { issues: number } })[] }
  ```

#### Get Sprint + Issues (Active Board)
- **Method / Path**: `GET /projects/:projectId/sprints/:sprintId`
- **Response (200)**:
  ```typescript
  { sprint: Sprint & { issues: Issue[] } }
  ```

#### Update Sprint
- **Method / Path**: `PATCH /projects/:projectId/sprints/:sprintId`
- **Request Body**:
  ```typescript
  { name?: string; goal?: string; startDate?: string; endDate?: string }
  ```
- **Response (200)**:
  ```typescript
  { sprint: Sprint }
  ```

#### Start Sprint
- **Method / Path**: `POST /projects/:projectId/sprints/:sprintId/start`
- **Response (200)**:
  ```typescript
  { sprint: Sprint } // Sets status to ACTIVE
  ```

#### Complete Sprint
- **Method / Path**: `POST /projects/:projectId/sprints/:sprintId/complete`
- **Response (200)**:
  ```typescript
  { sprint: Sprint } // Sets status to COMPLETED, relocates non-DONE issues to backlog
  ```

---

### 5. Issues & Tasks (`/api`)

#### Create Issue
- **Method / Path**: `POST /projects/:projectId/issues`
- **Request Body**:
  ```typescript
  {
    title: string;
    description?: string;
    type?: IssueType;
    status?: IssueStatus;
    priority?: IssuePriority;
    storyPoints?: number | null;
    sprintId?: string | null;
    assigneeId?: string | null;
    parentId?: string | null;
  }
  ```
- **Response (201)**:
  ```typescript
  { issue: Issue }
  ```

#### List & Filter Issues
- **Method / Path**: `GET /projects/:projectId/issues`
- **Query Parameters**:
  - `status`: `'BACKLOG' | 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE'`
  - `priority`: `'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW'`
  - `type`: `'TASK' | 'BUG' | 'STORY' | 'EPIC'`
  - `assigneeId`: `string` (or `'null'`)
  - `sprintId`: `string` (or `'null'`)
  - `labelId`: `string`
- **Response (200)**:
  ```typescript
  { issues: Issue[] }
  ```

#### Get Unscheduled Backlog Issues
- **Method / Path**: `GET /projects/:projectId/issues/backlog`
- **Response (200)**:
  ```typescript
  { issues: Issue[] }
  ```

#### Get Detailed Issue Info
- **Method / Path**: `GET /issues/:issueId`
- **Response (200)**:
  ```typescript
  { issue: Issue & { parent: Issue | null; children: Issue[] } }
  ```

#### Update Issue Fields
- **Method / Path**: `PATCH /issues/:issueId`
- **Request Body**:
  ```typescript
  {
    title?: string;
    description?: string | null;
    type?: IssueType;
    status?: IssueStatus;
    priority?: IssuePriority;
    storyPoints?: number | null;
    sprintId?: string | null;
    assigneeId?: string | null;
    parentId?: string | null;
  }
  ```
- **Response (200)**:
  ```typescript
  { issue: Issue }
  ```

#### Move Sprint Allocation
- **Method / Path**: `PATCH /issues/:issueId/move`
- **Request Body**:
  ```typescript
  { sprintId: string | null }
  ```
- **Response (200)**:
  ```typescript
  { issue: Issue }
  ```

#### Reorder Issue Priority Order (Drag and Drop)
- **Method / Path**: `PATCH /issues/:issueId/reorder`
- **Request Body**:
  ```typescript
  { order: number } // Float sorting order
  ```
- **Response (200)**:
  ```typescript
  { issue: Issue }
  ```

---

### 6. Comments Thread (`/api`)

#### Get Comments list
- **Method / Path**: `GET /issues/:issueId/comments`
- **Response (200)**:
  ```typescript
  { comments: Comment[] }
  ```

#### Add Comment
- **Method / Path**: `POST /issues/:issueId/comments`
- **Request Body**:
  ```typescript
  { body: string }
  ```
- **Response (201)**:
  ```typescript
  { comment: Comment }
  ```

---

### 7. Tags & Labels (`/api`)

#### List Labels
- **Method / Path**: `GET /projects/:projectId/labels`
- **Response (200)**:
  ```typescript
  { labels: Label[] }
  ```

#### Create Label
- **Method / Path**: `POST /projects/:projectId/labels`
- **Request Body**:
  ```typescript
  { name: string; color: string } // Color format: "#ffffff"
  ```
- **Response (201)**:
  ```typescript
  { label: Label }
  ```

#### Attach Label to Issue
- **Method / Path**: `POST /issues/:issueId/labels/:labelId`
- **Response (201)**:
  ```typescript
  { issueLabel: { issueId: string; labelId: string; label: Label } }
  ```

#### Detach Label from Issue
- **Method / Path**: `DELETE /issues/:issueId/labels/:labelId`
- **Response (200)**:
  ```typescript
  { message: string }
  ```

---

### 8. Dashboard Analytics & Feeds (`/api`)

#### Get Workspace Status Counts
- **Method / Path**: `GET /workspaces/:workspaceId/dashboard/stats`
- **Response (200)**:
  ```typescript
  {
    stats: {
      issues: { BACKLOG: number; TODO: number; IN_PROGRESS: number; IN_REVIEW: number; DONE: number };
      totalIssues: number;
      projectsCount: number;
      membersCount: number;
    }
  }
  ```

#### Get My Assigned Issues
- **Method / Path**: `GET /workspaces/:workspaceId/dashboard/my-issues`
- **Response (200)**:
  ```typescript
  {
    issues: (Issue & {
      project: { id: string; name: string; key: string; color: string };
      sprint: { id: string; name: string } | null;
    })[]
  }
  ```

#### Get Workspace Activities Feed
- **Method / Path**: `GET /workspaces/:workspaceId/dashboard/activity`
- **Response (200)**:
  ```typescript
  { activities: Activity[] }
  ```
