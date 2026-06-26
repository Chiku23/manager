import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../lib/prisma';

export async function getDashboardStats(req: Request, res: Response, next: NextFunction) {
  try {
    const { workspaceId } = req.params;

    // Fetch counts of issues grouped by status within projects belonging to this workspace
    const counts = await prisma.issue.groupBy({
      by: ['status'],
      where: {
        project: {
          workspaceId,
        },
      },
      _count: {
        status: true,
      },
    });

    const stats = {
      BACKLOG: 0,
      TODO: 0,
      IN_PROGRESS: 0,
      IN_REVIEW: 0,
      DONE: 0,
    };

    counts.forEach((c) => {
      if (c.status in stats) {
        stats[c.status as keyof typeof stats] = c._count.status;
      }
    });

    // Total projects count
    const projectsCount = await prisma.project.count({
      where: { workspaceId },
    });

    // Total members count
    const membersCount = await prisma.workspaceMember.count({
      where: { workspaceId },
    });

    return res.json({
      stats: {
        issues: stats,
        totalIssues: Object.values(stats).reduce((a, b) => a + b, 0),
        projectsCount,
        membersCount,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getMyIssues(req: Request, res: Response, next: NextFunction) {
  try {
    const { workspaceId } = req.params;
    const userId = req.user!.id;

    const issues = await prisma.issue.findMany({
      where: {
        assigneeId: userId,
        project: {
          workspaceId,
        },
      },
      include: {
        project: { select: { id: true, name: true, key: true, color: true } },
        sprint: { select: { id: true, name: true } },
        labels: { include: { label: true } },
      },
      orderBy: [
        { priority: 'asc' }, // Or order
        { updatedAt: 'desc' },
      ],
    });

    return res.json({ issues });
  } catch (error) {
    next(error);
  }
}

export async function getWorkspaceActivity(req: Request, res: Response, next: NextFunction) {
  try {
    const { workspaceId } = req.params;

    const activities = await prisma.activity.findMany({
      where: {
        issue: {
          project: {
            workspaceId,
          },
        },
      },
      include: {
        actor: { select: { id: true, name: true, email: true, avatarUrl: true } },
        issue: { select: { id: true, title: true, type: true, projectId: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 20, // Limit to recent 20 activities
    });

    return res.json({ activities });
  } catch (error) {
    next(error);
  }
}
