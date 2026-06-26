import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../lib/prisma';

export async function getIssueActivity(req: Request, res: Response, next: NextFunction) {
  try {
    const { issueId } = req.params;
    const activities = await prisma.activity.findMany({
      where: { issueId },
      include: {
        actor: { select: { id: true, name: true, email: true, avatarUrl: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return res.json({ activities });
  } catch (error) {
    next(error);
  }
}
