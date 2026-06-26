import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../lib/prisma';
import { ActivityType } from '@prisma/client';

const issueInclude = {
  assignee: { select: { id: true, name: true, email: true, avatarUrl: true } },
  reporter: { select: { id: true, name: true, email: true, avatarUrl: true } },
  labels: { include: { label: true } },
  _count: { select: { comments: true } },
};

async function logActivity(issueId: string, actorId: string, type: ActivityType, meta?: any) {
  try {
    await prisma.activity.create({
      data: {
        issueId,
        actorId,
        type,
        meta,
      },
    });
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
}

export async function createIssue(req: Request, res: Response, next: NextFunction) {
  try {
    const { projectId } = req.params;
    const body = req.body;

    // Get order value (max current order + 1000)
    const lastIssue = await prisma.issue.findFirst({
      where: { projectId, sprintId: body.sprintId || null },
      orderBy: { order: 'desc' },
    });
    const order = lastIssue ? lastIssue.order + 1000 : 1000;

    const issue = await prisma.issue.create({
      data: {
        ...body,
        projectId,
        order,
        reporterId: req.user!.id,
      },
      include: issueInclude,
    });

    await logActivity(issue.id, req.user!.id, 'ISSUE_CREATED', { title: issue.title });

    return res.status(201).json({ issue });
  } catch (error) {
    next(error);
  }
}

export async function listIssues(req: Request, res: Response, next: NextFunction) {
  try {
    const { projectId } = req.params;
    const { status, priority, type, assigneeId, sprintId, labelId } = req.query as any;

    const where: any = { projectId };
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (type) where.type = type;
    if (assigneeId) where.assigneeId = assigneeId === 'null' ? null : assigneeId;
    if (sprintId) where.sprintId = sprintId === 'null' ? null : sprintId;

    if (labelId) {
      where.labels = {
        some: { labelId },
      };
    }

    const issues = await prisma.issue.findMany({
      where,
      include: issueInclude,
      orderBy: { order: 'asc' },
    });

    return res.json({ issues });
  } catch (error) {
    next(error);
  }
}

export async function listBacklog(req: Request, res: Response, next: NextFunction) {
  try {
    const { projectId } = req.params;
    const issues = await prisma.issue.findMany({
      where: { projectId, sprintId: null },
      include: issueInclude,
      orderBy: { order: 'asc' },
    });
    return res.json({ issues });
  } catch (error) {
    next(error);
  }
}

export async function getIssue(req: Request, res: Response, next: NextFunction) {
  try {
    const { issueId } = req.params;
    const issue = await prisma.issue.findUnique({
      where: { id: issueId },
      include: {
        ...issueInclude,
        parent: { select: { id: true, title: true, type: true, status: true } },
        children: { include: issueInclude, orderBy: { order: 'asc' } },
      },
    });
    if (!issue) return res.status(404).json({ error: 'Issue not found' });
    return res.json({ issue });
  } catch (error) {
    next(error);
  }
}

export async function updateIssue(req: Request, res: Response, next: NextFunction) {
  try {
    const { issueId } = req.params;
    const current = await prisma.issue.findUniqueOrThrow({ where: { id: issueId } });

    const issue = await prisma.issue.update({
      where: { id: issueId },
      data: req.body,
      include: issueInclude,
    });

    // Check changes for activity log
    const userId = req.user!.id;
    if (req.body.status && req.body.status !== current.status) {
      await logActivity(issueId, userId, 'STATUS_CHANGED', { from: current.status, to: req.body.status });
    }
    if (req.body.assigneeId !== undefined && req.body.assigneeId !== current.assigneeId) {
      await logActivity(issueId, userId, 'ASSIGNEE_CHANGED', { to: req.body.assigneeId });
    }
    if (req.body.priority && req.body.priority !== current.priority) {
      await logActivity(issueId, userId, 'PRIORITY_CHANGED', { from: current.priority, to: req.body.priority });
    }
    if (req.body.sprintId !== undefined && req.body.sprintId !== current.sprintId) {
      await logActivity(issueId, userId, 'SPRINT_CHANGED', { from: current.sprintId, to: req.body.sprintId });
    }
    if (req.body.title && req.body.title !== current.title) {
      await logActivity(issueId, userId, 'ISSUE_UPDATED', { fields: ['title'] });
    }

    return res.json({ issue });
  } catch (error) {
    next(error);
  }
}

export async function moveIssue(req: Request, res: Response, next: NextFunction) {
  try {
    const { issueId } = req.params;
    const { sprintId } = req.body;

    const current = await prisma.issue.findUniqueOrThrow({ where: { id: issueId } });

    // Reorder inside the target sprint/backlog at the end
    const lastIssue = await prisma.issue.findFirst({
      where: { projectId: current.projectId, sprintId },
      orderBy: { order: 'desc' },
    });
    const order = lastIssue ? lastIssue.order + 1000 : 1000;

    const issue = await prisma.issue.update({
      where: { id: issueId },
      data: { sprintId, order },
      include: issueInclude,
    });

    await logActivity(issueId, req.user!.id, 'SPRINT_CHANGED', { from: current.sprintId, to: sprintId });

    return res.json({ issue });
  } catch (error) {
    next(error);
  }
}

export async function reorderIssue(req: Request, res: Response, next: NextFunction) {
  try {
    const { issueId } = req.params;
    const { order } = req.body;

    const issue = await prisma.issue.update({
      where: { id: issueId },
      data: { order },
      include: issueInclude,
    });

    return res.json({ issue });
  } catch (error) {
    next(error);
  }
}

export async function deleteIssue(req: Request, res: Response, next: NextFunction) {
  try {
    const { issueId } = req.params;
    await prisma.issue.delete({ where: { id: issueId } });
    return res.json({ message: 'Issue deleted' });
  } catch (error) {
    next(error);
  }
}
export { logActivity };
