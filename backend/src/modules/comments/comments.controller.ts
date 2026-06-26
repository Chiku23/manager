import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../lib/prisma';
import { logActivity } from '../issues/issues.controller';

export async function listComments(req: Request, res: Response, next: NextFunction) {
  try {
    const { issueId } = req.params;
    const comments = await prisma.comment.findMany({
      where: { issueId },
      include: {
        author: { select: { id: true, name: true, email: true, avatarUrl: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
    return res.json({ comments });
  } catch (error) {
    next(error);
  }
}

export async function createComment(req: Request, res: Response, next: NextFunction) {
  try {
    const { issueId } = req.params;
    const { body } = req.body;

    const comment = await prisma.comment.create({
      data: {
        body,
        issueId,
        authorId: req.user!.id,
      },
      include: {
        author: { select: { id: true, name: true, email: true, avatarUrl: true } },
      },
    });

    await logActivity(issueId, req.user!.id, 'COMMENT_ADDED', { commentId: comment.id });

    return res.status(201).json({ comment });
  } catch (error) {
    next(error);
  }
}

export async function updateComment(req: Request, res: Response, next: NextFunction) {
  try {
    const { commentId } = req.params;
    const current = await prisma.comment.findUniqueOrThrow({ where: { id: commentId } });

    if (current.authorId !== req.user!.id) {
      return res.status(403).json({ error: 'You can only edit your own comments' });
    }

    const comment = await prisma.comment.update({
      where: { id: commentId },
      data: { body: req.body.body },
      include: {
        author: { select: { id: true, name: true, email: true, avatarUrl: true } },
      },
    });

    return res.json({ comment });
  } catch (error) {
    next(error);
  }
}

export async function deleteComment(req: Request, res: Response, next: NextFunction) {
  try {
    const { commentId } = req.params;
    const current = await prisma.comment.findUniqueOrThrow({ where: { id: commentId } });

    if (current.authorId !== req.user!.id) {
      return res.status(403).json({ error: 'You can only delete your own comments' });
    }

    await prisma.comment.delete({ where: { id: commentId } });
    return res.json({ message: 'Comment deleted' });
  } catch (error) {
    next(error);
  }
}
