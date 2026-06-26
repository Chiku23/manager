/// <reference types="node" />
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clean DB
  await prisma.refreshToken.deleteMany({});
  await prisma.activity.deleteMany({});
  await prisma.comment.deleteMany({});
  await prisma.issueLabel.deleteMany({});
  await prisma.label.deleteMany({});
  await prisma.issue.deleteMany({});
  await prisma.sprint.deleteMany({});
  await prisma.projectMember.deleteMany({});
  await prisma.project.deleteMany({});
  await prisma.workspaceMember.deleteMany({});
  await prisma.workspace.deleteMany({});
  await prisma.user.deleteMany({});

  const passwordHash = await bcrypt.hash('password123', 12);

  // Users
  const user1 = await prisma.user.create({
    data: {
      name: 'John Doe',
      email: 'john@example.com',
      passwordHash,
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=128&h=128&fit=crop&crop=faces',
    },
  });

  const user2 = await prisma.user.create({
    data: {
      name: 'Jane Smith',
      email: 'jane@example.com',
      passwordHash,
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=128&h=128&fit=crop&crop=faces',
    },
  });

  const user3 = await prisma.user.create({
    data: {
      name: 'Chiku Dev',
      email: 'chiku@example.com',
      passwordHash,
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=128&h=128&fit=crop&crop=faces',
    },
  });

  console.log('Users created:', [user1.email, user2.email, user3.email]);

  // Workspaces
  const workspace = await prisma.workspace.create({
    data: {
      name: 'Acme Corporation',
      slug: 'acme-corp',
      ownerId: user1.id,
    },
  });

  await prisma.workspaceMember.createMany({
    data: [
      { userId: user1.id, workspaceId: workspace.id, role: 'OWNER' },
      { userId: user2.id, workspaceId: workspace.id, role: 'ADMIN' },
      { userId: user3.id, workspaceId: workspace.id, role: 'MEMBER' },
    ],
  });

  console.log('Workspace created:', workspace.name);

  // Projects
  const project = await prisma.project.create({
    data: {
      name: 'Project Alpha',
      key: 'ALF',
      description: 'Acme primary software build',
      color: '#7c3aed',
      workspaceId: workspace.id,
    },
  });

  await prisma.projectMember.createMany({
    data: [
      { userId: user1.id, projectId: project.id, role: 'ADMIN' },
      { userId: user2.id, projectId: project.id, role: 'MEMBER' },
      { userId: user3.id, projectId: project.id, role: 'MEMBER' },
    ],
  });

  console.log('Project created:', project.name);

  // Sprints
  const sprint1 = await prisma.sprint.create({
    data: {
      name: 'Sprint 1',
      goal: 'Deliver landing page & authentication module',
      status: 'ACTIVE',
      startDate: new Date(),
      endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      projectId: project.id,
    },
  });

  const sprint2 = await prisma.sprint.create({
    data: {
      name: 'Sprint 2',
      goal: 'Dashboard integration and analytics pipeline',
      status: 'PLANNED',
      projectId: project.id,
    },
  });

  console.log('Sprints created:', [sprint1.name, sprint2.name]);

  // Labels
  const labelBug = await prisma.label.create({
    data: { name: 'bug', color: '#ef4444', projectId: project.id },
  });
  const labelFeature = await prisma.label.create({
    data: { name: 'feature', color: '#3b82f6', projectId: project.id },
  });
  const labelFrontend = await prisma.label.create({
    data: { name: 'frontend', color: '#10b981', projectId: project.id },
  });

  // Issues
  const epic = await prisma.issue.create({
    data: {
      title: 'Authentication & Profile Management Epic',
      description: 'Epic tracking security and auth features',
      type: 'EPIC',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      reporterId: user1.id,
      assigneeId: user2.id,
      projectId: project.id,
      order: 1000,
    },
  });

  const issue1 = await prisma.issue.create({
    data: {
      title: 'Implement JSON Web Token auth endpoints',
      description: 'Create login, registration, and refresh token endpoints with rotation',
      type: 'STORY',
      status: 'DONE',
      priority: 'URGENT',
      storyPoints: 5,
      reporterId: user1.id,
      assigneeId: user3.id,
      projectId: project.id,
      sprintId: sprint1.id,
      parentId: epic.id,
      order: 2000,
    },
  });

  const issue2 = await prisma.issue.create({
    data: {
      title: 'Fix CSRF and secure cookie transport',
      description: 'Ensure cookie credentials use strict flags',
      type: 'BUG',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      storyPoints: 3,
      reporterId: user2.id,
      assigneeId: user1.id,
      projectId: project.id,
      sprintId: sprint1.id,
      order: 3000,
    },
  });

  const issue3 = await prisma.issue.create({
    data: {
      title: 'Design responsive Dashboard shell layout',
      description: 'Add header, collapsible sidebars, and dark mode toggles',
      type: 'TASK',
      status: 'TODO',
      priority: 'MEDIUM',
      storyPoints: 8,
      reporterId: user3.id,
      assigneeId: user3.id,
      projectId: project.id,
      sprintId: sprint1.id,
      order: 4000,
    },
  });

  const issue4 = await prisma.issue.create({
    data: {
      title: 'Setup PostgreSQL migrations',
      description: 'Migrate initial schemas for users, projects, and comments',
      type: 'TASK',
      status: 'BACKLOG',
      priority: 'MEDIUM',
      storyPoints: 3,
      reporterId: user1.id,
      projectId: project.id,
      order: 5000,
    },
  });

  console.log('Issues created.');

  // Attach Labels
  await prisma.issueLabel.createMany({
    data: [
      { issueId: issue1.id, labelId: labelFeature.id },
      { issueId: issue2.id, labelId: labelBug.id },
      { issueId: issue3.id, labelId: labelFrontend.id },
      { issueId: issue3.id, labelId: labelFeature.id },
    ],
  });

  // Comments
  await prisma.comment.create({
    data: {
      body: 'I have successfully tested token rotation locally. Works great.',
      issueId: issue1.id,
      authorId: user3.id,
    },
  });

  await prisma.comment.create({
    data: {
      body: 'Ensure secure flag is only active in production configs.',
      issueId: issue2.id,
      authorId: user1.id,
    },
  });

  // Activity Log
  await prisma.activity.createMany({
    data: [
      {
        issueId: issue1.id,
        actorId: user3.id,
        type: 'ISSUE_CREATED',
        meta: { title: 'Implement JSON Web Token auth endpoints' },
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
      {
        issueId: issue1.id,
        actorId: user3.id,
        type: 'STATUS_CHANGED',
        meta: { from: 'TODO', to: 'DONE' },
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
      {
        issueId: issue2.id,
        actorId: user1.id,
        type: 'STATUS_CHANGED',
        meta: { from: 'TODO', to: 'IN_PROGRESS' },
      },
    ],
  });

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
