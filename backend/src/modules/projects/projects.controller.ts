import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../lib/prisma';

const projectSelect = {
  id: true,
  name: true,
  key: true,
  description: true,
  color: true,
  archivedAt: true,
  createdAt: true,
  workspaceId: true,
  _count: { select: { issues: true, members: true } },
};

export async function createProject(req: Request, res: Response, next: NextFunction) {
  try {
    const { workspaceId } = req.params;
    const { name, key, description, color } = req.body;

    const keyTaken = await prisma.project.findUnique({
      where: { workspaceId_key: { workspaceId, key } },
    });
    if (keyTaken) {
      return res.status(409).json({ error: 'Project key already in use in this workspace' });
    }

    const project = await prisma.project.create({
      data: {
        name,
        key,
        description,
        color,
        workspaceId,
        members: { create: { userId: req.user!.id, role: 'ADMIN' } },
      },
      select: projectSelect,
    });
    return res.status(201).json({ project });
  } catch (error) {
    next(error);
  }
}

export async function listProjects(req: Request, res: Response, next: NextFunction) {
  try {
    const { workspaceId } = req.params;
    const projects = await prisma.project.findMany({
      where: {
        workspaceId,
        members: { some: { userId: req.user!.id } },
      },
      select: projectSelect,
      orderBy: { createdAt: 'desc' },
    });
    return res.json({ projects });
  } catch (error) {
    next(error);
  }
}

export async function getProject(req: Request, res: Response, next: NextFunction) {
  try {
    const { projectId } = req.params;
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: {
        ...projectSelect,
        members: {
          include: {
            user: { select: { id: true, name: true, email: true, avatarUrl: true } },
          },
        },
      },
    });
    if (!project) return res.status(404).json({ error: 'Project not found' });
    return res.json({ project });
  } catch (error) {
    next(error);
  }
}

export async function updateProject(req: Request, res: Response, next: NextFunction) {
  try {
    const { projectId } = req.params;
    const project = await prisma.project.update({
      where: { id: projectId },
      data: req.body,
      select: projectSelect,
    });
    return res.json({ project });
  } catch (error) {
    next(error);
  }
}

export async function archiveProject(req: Request, res: Response, next: NextFunction) {
  try {
    const { projectId } = req.params;
    const project = await prisma.project.findUniqueOrThrow({ where: { id: projectId } });
    const updated = await prisma.project.update({
      where: { id: project.id },
      data: { archivedAt: project.archivedAt ? null : new Date() },
      select: projectSelect,
    });
    return res.json({ project: updated });
  } catch (error) {
    next(error);
  }
}

export async function deleteProject(req: Request, res: Response, next: NextFunction) {
  try {
    const { projectId } = req.params;
    await prisma.project.delete({ where: { id: projectId } });
    return res.json({ message: 'Project deleted' });
  } catch (error) {
    next(error);
  }
}

export async function listProjectMembers(req: Request, res: Response, next: NextFunction) {
  try {
    const { projectId } = req.params;
    const members = await prisma.projectMember.findMany({
      where: { projectId },
      include: { user: { select: { id: true, name: true, email: true, avatarUrl: true } } },
    });
    return res.json({ members });
  } catch (error) {
    next(error);
  }
}

export async function addProjectMember(req: Request, res: Response, next: NextFunction) {
  try {
    const { projectId } = req.params;
    const { userId, role } = req.body;

    const member = await prisma.projectMember.create({
      data: { projectId, userId, role },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
    return res.status(201).json({ member });
  } catch (error) {
    next(error);
  }
}

export async function updateProjectMember(req: Request, res: Response, next: NextFunction) {
  try {
    const { projectId, userId } = req.params;
    const { role } = req.body;

    const member = await prisma.projectMember.update({
      where: { userId_projectId: { userId, projectId } },
      data: { role },
    });
    return res.json({ member });
  } catch (error) {
    next(error);
  }
}

export async function removeProjectMember(req: Request, res: Response, next: NextFunction) {
  try {
    const { projectId, userId } = req.params;
    await prisma.projectMember.delete({
      where: { userId_projectId: { userId, projectId } },
    });
    return res.json({ message: 'Member removed' });
  } catch (error) {
    next(error);
  }
}
