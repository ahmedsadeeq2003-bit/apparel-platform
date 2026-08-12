"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  loginSchema,
  magicLinkSchema,
  signUpSchema,
  type LoginInput,
  type MagicLinkInput,
  type SignUpInput,
} from "@/lib/auth/schemas";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

export async function signUpWithPassword(
  input: SignUpInput,
): Promise<{ error: string }> {
  const parsed = signUpSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Check the fields above and try again." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { full_name: parsed.data.fullName },
      emailRedirectTo: `${siteUrl}/auth/callback`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  redirect("/products");
}

export async function signInWithPassword(
  input: LoginInput,
): Promise<{ error: string }> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Check the fields above and try again." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return { error: error.message };
  }

  redirect("/products");
}

export async function signInWithMagicLink(
  input: MagicLinkInput,
): Promise<{ error: string } | { success: true }> {
  const parsed = magicLinkSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Enter a valid email." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data.email,
    options: { emailRedirectTo: `${siteUrl}/auth/callback` },
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

export async function signOut(): Promise<never> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
