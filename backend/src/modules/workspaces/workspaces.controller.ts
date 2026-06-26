import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../lib/prisma';

export async function createWorkspace(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, slug } = req.body;
    const slugTaken = await prisma.workspace.findUnique({ where: { slug } });
    if (slugTaken) return res.status(409).json({ error: 'Slug already taken' });

    const workspace = await prisma.workspace.create({
      data: {
        name,
        slug,
        ownerId: req.user!.id,
        members: { create: { userId: req.user!.id, role: 'OWNER' } },
      },
    });
    return res.status(201).json({ workspace });
  } catch (error) {
    next(error);
  }
}

export async function listWorkspaces(req: Request, res: Response, next: NextFunction) {
  try {
    const memberships = await prisma.workspaceMember.findMany({
      where: { userId: req.user!.id },
      include: { workspace: true },
    });
    return res.json({ workspaces: memberships.map((m) => ({ ...m.workspace, role: m.role })) });
  } catch (error) {
    next(error);
  }
}

export async function getWorkspace(req: Request, res: Response, next: NextFunction) {
  try {
    const ws = await prisma.workspace.findUnique({ where: { id: req.params.workspaceId } });
    if (!ws) return res.status(404).json({ error: 'Workspace not found' });
    return res.json({ workspace: ws });
  } catch (error) {
    next(error);
  }
}

export async function updateWorkspace(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, slug } = req.body;
    const { workspaceId } = req.params;

    if (slug) {
      const taken = await prisma.workspace.findFirst({
        where: { slug, id: { not: workspaceId } },
      });
      if (taken) return res.status(409).json({ error: 'Slug already taken' });
    }

    const workspace = await prisma.workspace.update({
      where: { id: workspaceId },
      data: { name, slug },
    });
    return res.json({ workspace });
  } catch (error) {
    next(error);
  }
}

export async function deleteWorkspace(req: Request, res: Response, next: NextFunction) {
  try {
    await prisma.workspace.delete({ where: { id: req.params.workspaceId } });
    return res.json({ message: 'Workspace deleted' });
  } catch (error) {
    next(error);
  }
}

export async function listMembers(req: Request, res: Response, next: NextFunction) {
  try {
    const members = await prisma.workspaceMember.findMany({
      where: { workspaceId: req.params.workspaceId },
      include: { user: { select: { id: true, name: true, email: true, avatarUrl: true } } },
    });
    return res.json({ members });
  } catch (error) {
    next(error);
  }
}

export async function inviteMember(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, role } = req.body;
    const { workspaceId } = req.params;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: 'No user found with that email' });

    const exists = await prisma.workspaceMember.findUnique({
      where: { userId_workspaceId: { userId: user.id, workspaceId } },
    });
    if (exists) return res.status(409).json({ error: 'User is already a member' });

    const member = await prisma.workspaceMember.create({
      data: { userId: user.id, workspaceId, role },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
    return res.status(201).json({ member });
  } catch (error) {
    next(error);
  }
}

export async function updateMemberRole(req: Request, res: Response, next: NextFunction) {
  try {
    const { role } = req.body;
    const { workspaceId, userId } = req.params;

    const member = await prisma.workspaceMember.update({
      where: { userId_workspaceId: { userId, workspaceId } },
      data: { role },
    });
    return res.json({ member });
  } catch (error) {
    next(error);
  }
}

export async function removeMember(req: Request, res: Response, next: NextFunction) {
  try {
    const { workspaceId, userId } = req.params;
    await prisma.workspaceMember.delete({
      where: { userId_workspaceId: { userId, workspaceId } },
    });
    return res.json({ message: 'Member removed' });
  } catch (error) {
    next(error);
  }
}
