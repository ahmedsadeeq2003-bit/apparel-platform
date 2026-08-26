"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { forgotPasswordSchema, type ForgotPasswordInput } from "@/lib/auth/schemas";
import { requestPasswordReset } from "@/lib/auth/actions";

const EASE = [0.16, 1, 0.3, 1] as const;

/** Secondary flow, not a primary brand moment like /signup or /login -- a
 * single centered field reusing the shared ui/Input rather than
 * reimplementing the floating-label treatment a third time. Always shows
 * the same success state regardless of whether the email is registered
 * (the server action mirrors this), so this can't be used to enumerate
 * accounts. */
export function ForgotPasswordForm() {
  const reduceMotion = useReducedMotion();
  const [formError, setFormError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({ resolver: zodResolver(forgotPasswordSchema) });

  const onSubmit = async (input: ForgotPasswordInput) => {
    setFormError(null);
    const result = await requestPasswordReset(input);
    if ("error" in result) {
      setFormError(result.error);
    } else {
      setSentTo(input.email);
    }
  };

  if (sentTo) {
    return (
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE }}
        className="flex w-full max-w-sm flex-col gap-3"
        role="status"
      >
        <h2 className="font-display text-display-md text-foreground">Check your inbox.</h2>
        <p className="text-body text-muted">
          If <span className="font-medium text-foreground">{sentTo}</span>{" "}
          has a STITCH account, we&apos;ve sent a link to reset the password.
        </p>
        <Link href="/login" className="mt-2 text-body-sm font-medium text-foreground underline underline-offset-4 hover:text-accent">
          Back to log in
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
      className="flex w-full max-w-sm flex-col gap-6"
    >
      <div className="flex flex-col gap-1">
        <span className="text-label font-semibold uppercase tracking-[0.18em] text-muted">
          Reset your password
        </span>
        <h2 className="font-display text-display-md text-foreground">Forgot something?</h2>
        <p className="mt-2 text-body text-muted">
          Enter the email on your account and we&apos;ll send a link to reset your password.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} method="post" className="flex flex-col gap-4" noValidate>
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          {...register("email")}
          error={errors.email?.message}
        />
        {formError && (
          <p className="text-body-sm text-danger" role="alert">
            {formError}
          </p>
        )}
        <Button type="submit" disabled={isSubmitting} className="mt-1">
          {isSubmitting ? "Sending…" : "Send reset link"}
        </Button>
      </form>

      <p className="text-body-sm text-muted">
        Remembered it?{" "}
        <Link href="/login" className="text-foreground underline underline-offset-4 hover:text-accent">
          Back to log in
        </Link>
      </p>
    </motion.div>
  );
}
