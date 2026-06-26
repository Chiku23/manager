import { z } from 'zod';

export const createIssueSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(255),
    description: z.string().max(4000).optional(),
    type: z.enum(['TASK', 'BUG', 'STORY', 'EPIC']).default('TASK'),
    status: z.enum(['BACKLOG', 'TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE']).default('BACKLOG'),
    priority: z.enum(['URGENT', 'HIGH', 'MEDIUM', 'LOW']).default('MEDIUM'),
    storyPoints: z.number().int().min(0).nullable().optional(),
    sprintId: z.string().nullable().optional(),
    assigneeId: z.string().nullable().optional(),
    parentId: z.string().nullable().optional(),
  }),
});

export const updateIssueSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(255).optional(),
    description: z.string().max(4000).nullable().optional(),
    type: z.enum(['TASK', 'BUG', 'STORY', 'EPIC']).optional(),
    status: z.enum(['BACKLOG', 'TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE']).optional(),
    priority: z.enum(['URGENT', 'HIGH', 'MEDIUM', 'LOW']).optional(),
    storyPoints: z.number().int().min(0).nullable().optional(),
    sprintId: z.string().nullable().optional(),
    assigneeId: z.string().nullable().optional(),
    parentId: z.string().nullable().optional(),
  }),
});

export const listIssuesSchema = z.object({
  query: z.object({
    status: z.enum(['BACKLOG', 'TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE']).optional(),
    priority: z.enum(['URGENT', 'HIGH', 'MEDIUM', 'LOW']).optional(),
    type: z.enum(['TASK', 'BUG', 'STORY', 'EPIC']).optional(),
    assigneeId: z.string().optional(),
    sprintId: z.string().optional(),
    labelId: z.string().optional(),
  }),
});

export const moveIssueSchema = z.object({
  body: z.object({
    sprintId: z.string().nullable(),
  }),
});

export const reorderIssueSchema = z.object({
  body: z.object({
    order: z.number(),
  }),
});
