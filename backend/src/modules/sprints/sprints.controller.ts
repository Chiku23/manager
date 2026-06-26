import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../lib/prisma';

export async function createSprint(req: Request, res: Response, next: NextFunction) {
  try {
    const { projectId } = req.params;
    const { name, goal, startDate, endDate } = req.body;

    const sprint = await prisma.sprint.create({
      data: {
        name,
        goal,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        projectId,
      },
    });
    return res.status(201).json({ sprint });
  } catch (error) {
    next(error);
  }
}

export async function listSprints(req: Request, res: Response, next: NextFunction) {
  try {
    const { projectId } = req.params;
    const sprints = await prisma.sprint.findMany({
      where: { projectId },
      include: { _count: { select: { issues: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return res.json({ sprints });
  } catch (error) {
    next(error);
  }
}

export async function getSprint(req: Request, res: Response, next: NextFunction) {
  try {
    const { sprintId } = req.params;
    const sprint = await prisma.sprint.findUnique({
      where: { id: sprintId },
      include: {
        issues: {
          include: {
            assignee: { select: { id: true, name: true, avatarUrl: true } },
            labels: { include: { label: true } },
          },
          orderBy: { order: 'asc' },
        },
      },
    });
    if (!sprint) return res.status(404).json({ error: 'Sprint not found' });
    return res.json({ sprint });
  } catch (error) {
    next(error);
  }
}

export async function updateSprint(req: Request, res: Response, next: NextFunction) {
  try {
    const { sprintId } = req.params;
    const { name, goal, startDate, endDate } = req.body;

    const sprint = await prisma.sprint.update({
      where: { id: sprintId },
      data: {
        name,
        goal,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
      },
    });
    return res.json({ sprint });
  } catch (error) {
    next(error);
  }
}

export async function startSprint(req: Request, res: Response, next: NextFunction) {
  try {
    const { projectId, sprintId } = req.params;

    const active = await prisma.sprint.findFirst({
      where: { projectId, status: 'ACTIVE' },
    });
    if (active) {
      return res.status(409).json({ error: 'A sprint is already active in this project' });
    }

    const sprint = await prisma.sprint.update({
      where: { id: sprintId },
      data: { status: 'ACTIVE', startDate: new Date() },
    });
    return res.json({ sprint });
  } catch (error) {
    next(error);
  }
}

export async function completeSprint(req: Request, res: Response, next: NextFunction) {
  try {
    const { sprintId } = req.params;

    // Move unfinished issues to backlog
    await prisma.issue.updateMany({
      where: { sprintId, status: { not: 'DONE' } },
      data: { sprintId: null },
    });

    const sprint = await prisma.sprint.update({
      where: { id: sprintId },
      data: { status: 'COMPLETED', endDate: new Date() },
    });
    return res.json({ sprint });
  } catch (error) {
    next(error);
  }
}

export async function deleteSprint(req: Request, res: Response, next: NextFunction) {
  try {
    const { sprintId } = req.params;

    // Move all sprint issues back to backlog
    await prisma.issue.updateMany({
      where: { sprintId },
      data: { sprintId: null },
    });

    await prisma.sprint.delete({ where: { id: sprintId } });
    return res.json({ message: 'Sprint deleted' });
  } catch (error) {
    next(error);
  }
}
