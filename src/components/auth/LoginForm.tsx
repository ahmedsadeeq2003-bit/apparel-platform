"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  loginSchema,
  magicLinkSchema,
  type LoginInput,
  type MagicLinkInput,
} from "@/lib/auth/schemas";
import { signInWithMagicLink, signInWithPassword } from "@/lib/auth/actions";

type Mode = "password" | "magic-link";

export function LoginForm() {
  const [mode, setMode] = useState<Mode>("password");
  const [formError, setFormError] = useState<string | null>(null);
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  const passwordForm = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });
  const magicLinkForm = useForm<MagicLinkInput>({
    resolver: zodResolver(magicLinkSchema),
  });

  const onPasswordSubmit = async (input: LoginInput) => {
    setFormError(null);
    const result = await signInWithPassword(input);
    if (result?.error) {
      setFormError(result.error);
    }
  };

  const onMagicLinkSubmit = async (input: MagicLinkInput) => {
    setFormError(null);
    const result = await signInWithMagicLink(input);
    if ("error" in result) {
      setFormError(result.error);
    } else {
      setMagicLinkSent(true);
    }
  };

  const switchMode = (next: Mode) => {
    setMode(next);
    setFormError(null);
    setMagicLinkSent(false);
  };

  return (
    <div className="flex max-w-sm flex-col gap-6">
      <div className="flex gap-2 text-body-sm">
        <button
          type="button"
          onClick={() => switchMode("password")}
          className={
            mode === "password" ? "text-foreground" : "text-muted hover:text-foreground"
          }
        >
          Password
        </button>
        <span className="text-muted">·</span>
        <button
          type="button"
          onClick={() => switchMode("magic-link")}
          className={
            mode === "magic-link" ? "text-foreground" : "text-muted hover:text-foreground"
          }
        >
          Email link
        </button>
      </div>

      {mode === "password" ? (
        <form
          onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
          className="flex flex-col gap-4"
        >
          <Input
            label="Email"
            type="email"
            autoComplete="email"
            {...passwordForm.register("email")}
            error={passwordForm.formState.errors.email?.message}
          />
          <Input
            label="Password"
            type="password"
            autoComplete="current-password"
            {...passwordForm.register("password")}
            error={passwordForm.formState.errors.password?.message}
          />
          {formError && <p className="text-body-sm text-danger">{formError}</p>}
          <Button
            type="submit"
            variant="primary"
            disabled={passwordForm.formState.isSubmitting}
          >
            {passwordForm.formState.isSubmitting ? "Logging in…" : "Log in"}
          </Button>
        </form>
      ) : magicLinkSent ? (
        <p className="text-body text-foreground">
          Check your email for a login link.
        </p>
      ) : (
        <form
          onSubmit={magicLinkForm.handleSubmit(onMagicLinkSubmit)}
          className="flex flex-col gap-4"
        >
          <Input
            label="Email"
            type="email"
            autoComplete="email"
            {...magicLinkForm.register("email")}
            error={magicLinkForm.formState.errors.email?.message}
          />
          {formError && <p className="text-body-sm text-danger">{formError}</p>}
          <Button
            type="submit"
            variant="primary"
            disabled={magicLinkForm.formState.isSubmitting}
          >
            {magicLinkForm.formState.isSubmitting
              ? "Sending link…"
              : "Send login link"}
          </Button>
        </form>
      )}

      <p className="text-body-sm text-muted">
        New here?{" "}
        <Link href="/signup" className="text-foreground hover:text-accent">
          Create an account
        </Link>
      </p>
    </div>
  );
}
