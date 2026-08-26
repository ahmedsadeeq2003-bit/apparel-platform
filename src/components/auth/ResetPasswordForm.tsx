"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { motion, useReducedMotion } from "motion/react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { resetPasswordSchema, type ResetPasswordInput } from "@/lib/auth/schemas";
import { updatePassword } from "@/lib/auth/actions";

const EASE = [0.16, 1, 0.3, 1] as const;

/** Only ever rendered by /reset-password once that page has confirmed an
 * active (recovery) session exists -- this form doesn't re-check that
 * itself. On success there's no need to sign in again (the recovery session
 * from the email link is already a real session), so it just sends the
 * user on to /products. */
export function ResetPasswordForm() {
  const reduceMotion = useReducedMotion();
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInput>({ resolver: zodResolver(resetPasswordSchema) });

  const onSubmit = async (input: ResetPasswordInput) => {
    setFormError(null);
    const result = await updatePassword(input);
    if ("error" in result) {
      setFormError(result.error);
    } else {
      setSuccess(true);
      setTimeout(() => router.push("/products"), 1400);
    }
  };

  if (success) {
    return (
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE }}
        className="flex w-full max-w-sm flex-col gap-3"
        role="status"
      >
        <h2 className="font-display text-display-md text-foreground">Password updated.</h2>
        <p className="text-body text-muted">Taking you back in…</p>
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
          Almost done
        </span>
        <h2 className="font-display text-display-md text-foreground">Choose a new password.</h2>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} method="post" className="flex flex-col gap-4" noValidate>
        <Input
          label="New password"
          type="password"
          autoComplete="new-password"
          {...register("password")}
          error={errors.password?.message}
        />
        <Input
          label="Confirm new password"
          type="password"
          autoComplete="new-password"
          {...register("confirmPassword")}
          error={errors.confirmPassword?.message}
        />
        {formError && (
          <p className="text-body-sm text-danger" role="alert">
            {formError}
          </p>
        )}
        <Button type="submit" disabled={isSubmitting} className="mt-1">
          {isSubmitting ? "Updating…" : "Update password"}
        </Button>
      </form>
    </motion.div>
  );
}
