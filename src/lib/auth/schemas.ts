import { z } from "zod";

/** Permissive on purpose (digits, spaces, +()-, 7-20 chars) -- catches
 * obviously-invalid input (letters, way too short) without a phone-number
 * library the project doesn't already depend on. */
const PHONE_PATTERN = /^\+?[0-9\s()-]{7,20}$/;

export const signUpSchema = z.object({
  fullName: z.string().trim().min(1, "Enter your name"),
  email: z.string().trim().email("Enter a valid email"),
  phone: z.string().trim().regex(PHONE_PATTERN, "Enter a valid phone number"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  isDesigner: z.enum(["yes", "no"], {
    required_error: "Choose one so we know how to tailor your STITCH experience",
  }),
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
