import { z } from 'zod';

export const createLabelSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(50),
    color: z.string().regex(/^#[0-9a-fA-F]{6}$/).default('#6b7280'),
  }),
});

export const updateLabelSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(50).optional(),
    color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  }),
});
