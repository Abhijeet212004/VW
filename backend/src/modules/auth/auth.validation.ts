import { z } from 'zod';

export const registerUserSchema = z.object({
  body: z.object({
    clerkId: z.string().min(1, 'Clerk ID is required'),
    email: z.string().email('Invalid email address'),
    name: z.string().min(2, 'Name must be at least 2 characters'),
    phone: z.string().optional(),
    profilePhoto: z.string().url().optional(),
  }),
});

export const getUserSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid user ID'),
  }),
});

export const updateUserSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid user ID'),
  }),
  body: z.object({
    name: z.string().min(2).optional(),
    phone: z.string().optional(),
    profilePhoto: z.string().url().optional(),
  }),
});

export type RegisterUserInput = z.infer<typeof registerUserSchema>['body'];
export type UpdateUserInput = z.infer<typeof updateUserSchema>['body'];
