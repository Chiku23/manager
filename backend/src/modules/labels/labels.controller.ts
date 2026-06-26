import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../lib/prisma';
import { logActivity } from '../issues/issues.controller';

export async function listLabels(req: Request, res: Response, next: NextFunction) {
  try {
    const { projectId } = req.params;
    const labels = await prisma.label.findMany({
      where: { projectId },
    });
    return res.json({ labels });
  } catch (error) {
    next(error);
  }
}

export async function createLabel(req: Request, res: Response, next: NextFunction) {
  try {
    const { projectId } = req.params;
    const { name, color } = req.body;

    const label = await prisma.label.create({
      data: {
        name,
        color,
        projectId,
      },
    });
    return res.status(201).json({ label });
  } catch (error) {
    next(error);
  }
}

export async function updateLabel(req: Request, res: Response, next: NextFunction) {
  try {
    const { labelId } = req.params;
    const label = await prisma.label.update({
      where: { id: labelId },
      data: req.body,
    });
    return res.json({ label });
  } catch (error) {
    next(error);
  }
}

export async function deleteLabel(req: Request, res: Response, next: NextFunction) {
  try {
    const { labelId } = req.params;
    await prisma.label.delete({ where: { id: labelId } });
    return res.json({ message: 'Label deleted' });
  } catch (error) {
    next(error);
  }
}

export async function attachLabel(req: Request, res: Response, next: NextFunction) {
  try {
    const { issueId, labelId } = req.params;

    const issueLabel = await prisma.issueLabel.create({
      data: { issueId, labelId },
      include: { label: true },
    });

    await logActivity(issueId, req.user!.id, 'LABEL_ADDED', { labelName: issueLabel.label.name });

    return res.status(201).json({ issueLabel });
  } catch (error) {
    next(error);
  }
}

export async function detachLabel(req: Request, res: Response, next: NextFunction) {
  try {
    const { issueId, labelId } = req.params;

    const deleted = await prisma.issueLabel.delete({
      where: { issueId_labelId: { issueId, labelId } },
      include: { label: true },
    });

    await logActivity(issueId, req.user!.id, 'LABEL_REMOVED', { labelName: deleted.label.name });

    return res.json({ message: 'Label detached' });
  } catch (error) {
    next(error);
  }
}
