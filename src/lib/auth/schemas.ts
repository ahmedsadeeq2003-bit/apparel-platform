import { z } from "zod";

export const signUpSchema = z.object({
  fullName: z.string().trim().min(1, "Enter your name").optional(),
  email: z.string().trim().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email"),
  password: z.string().min(1, "Enter your password"),
});

export const magicLinkSchema = z.object({
  email: z.string().trim().email("Enter a valid email"),
});

export type SignUpInput = z.infer<typeof signUpSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type MagicLinkInput = z.infer<typeof magicLinkSchema>;
