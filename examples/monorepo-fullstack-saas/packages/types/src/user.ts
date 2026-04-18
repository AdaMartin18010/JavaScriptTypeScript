import { z } from "zod";

export const userSchema = z.object({
  id: z.string().cuid(),
  email: z.string().email(),
  name: z.string().min(1).max(100).nullable().optional(),
  role: z.enum(["USER", "ADMIN"]),
  createdAt: z.coerce.date(),
});

export const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100).optional(),
  password: z.string().min(8).max(100),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export type User = z.infer<typeof userSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
