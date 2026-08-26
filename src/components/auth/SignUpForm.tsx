"use client";

import { useActionState, useId, useState, forwardRef } from "react";
import type { InputHTMLAttributes } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { motion, useReducedMotion, type Variants } from "motion/react";
import { ArrowRight, Eye, EyeSlash, GoogleLogo } from "@phosphor-icons/react";
import { signUpSchema, type SignUpInput } from "@/lib/auth/schemas";
import { signUpWithPassword, signInWithOAuth, resendVerificationEmail } from "@/lib/auth/actions";
import { DesignerToggle } from "@/components/auth/DesignerToggle";

const EASE = [0.16, 1, 0.3, 1] as const;

const CONTAINER: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};

const ITEM: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
};

/** Floating label via the classic `placeholder=" "` + `:not(:placeholder-
 * shown)` CSS trick -- the label position/size responds to focus and to
 * having a value with a plain CSS transition, no extra state needed to
 * track "is this field active." An animated underline (scale-x, from the
 * peer's focus state) is the one additional flourish. Distinct from the
 * shared ui/Input component on purpose -- that one is also used by /login,
 * which this task doesn't touch. */
const SignupField = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string; trailing?: React.ReactNode }
>(function SignupField({ label, error, trailing, id, className = "", ...rest }, ref) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="group relative">
        <input
          ref={ref}
          id={inputId}
          placeholder=" "
          className={`peer min-h-14 w-full rounded-sm border bg-background px-4 pt-5 pb-1.5 text-body text-foreground outline-none transition-colors focus-visible:outline-none ${
            error ? "border-danger" : "border-border focus:border-foreground"
          } ${trailing ? "pr-11" : ""} ${className}`}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...rest}
        />
        <label
          htmlFor={inputId}
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-body text-muted transition-all duration-200 ease-out peer-focus:top-3.5 peer-focus:translate-y-0 peer-focus:text-[0.7rem] peer-focus:tracking-wide peer-[:not(:placeholder-shown)]:top-3.5 peer-[:not(:placeholder-shown)]:translate-y-0 peer-[:not(:placeholder-shown)]:text-[0.7rem] peer-[:not(:placeholder-shown)]:tracking-wide"
        >
          {label}
        </label>
        <span className="pointer-events-none absolute inset-x-4 bottom-0 h-px origin-left scale-x-0 bg-foreground transition-transform duration-300 ease-out peer-focus:scale-x-100" />
        {trailing && <div className="absolute right-3 top-1/2 -translate-y-1/2">{trailing}</div>}
      </div>
      {error && (
        <p id={`${inputId}-error`} className="text-body-sm text-danger" role="alert">
          {error}
        </p>
      )}
    </div>
  );
});

function OAuthButton({
  provider,
  label,
  icon: Icon,
}: {
  provider: "google";
  label: string;
  icon: typeof GoogleLogo;
}) {
  // useActionState (not a plain <form action={fn}>) because
  // signInWithOAuth's real failure path returns { error }, which a
  // successful redirect never reaches -- <form action> requires a
  // void-returning function, but this one has a meaningful result to show
  // (e.g. "provider not enabled") when it doesn't redirect.
  const [state, formAction, isPending] = useActionState(
    async () => signInWithOAuth(provider),
    null as { error: string } | null,
  );

  return (
    <div className="flex flex-col gap-1.5">
      <form action={formAction}>
        <motion.button
          type="submit"
          disabled={isPending}
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.15, ease: EASE }}
          className="flex min-h-12 w-full items-center justify-center gap-2.5 rounded-full border border-border bg-background text-body-sm font-medium text-foreground transition-colors hover:border-foreground disabled:opacity-60"
        >
          <Icon size={18} weight="bold" aria-hidden />
          {isPending ? "Redirecting…" : label}
        </motion.button>
      </form>
      {state?.error && (
        <p className="text-body-sm text-danger" role="alert">
          {state.error}
        </p>
      )}
    </div>
  );
}

function ConfirmationState({ email }: { email: string }) {
  const reduceMotion = useReducedMotion();
  const [resendState, setResendState] = useState<"idle" | "sent" | "error">("idle");
  const [isResending, setIsResending] = useState(false);

  const handleResend = async () => {
    setIsResending(true);
    const result = await resendVerificationEmail(email);
    setResendState("error" in result ? "error" : "sent");
    setIsResending(false);
  };

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
      className="flex max-w-sm flex-col gap-3"
      role="status"
    >
      <span className="text-label font-semibold uppercase tracking-[0.18em] text-accent">
        One last stitch
      </span>
      <h2 className="font-display text-display-md text-foreground">Check your inbox.</h2>
      <p className="text-body text-muted">
        We sent a confirmation link to <span className="font-medium text-foreground">{email}</span>.{" "}
        Open it to activate your account -- then you&apos;re in.
      </p>
      <p className="text-body-sm text-muted">
        Didn&apos;t get it?{" "}
        <button
          type="button"
          onClick={handleResend}
          disabled={isResending || resendState === "sent"}
          className="font-medium text-foreground underline underline-offset-4 hover:text-accent disabled:opacity-60"
        >
          {resendState === "sent" ? "Sent -- check again" : isResending ? "Sending…" : "Resend the link"}
        </button>
      </p>
      {resendState === "error" && (
        <p className="text-body-sm text-danger" role="alert">
          Couldn&apos;t resend that. Try again in a moment.
        </p>
      )}
      <Link href="/login" className="mt-2 text-body-sm font-medium text-foreground underline underline-offset-4 hover:text-accent">
        Back to log in
      </Link>
    </motion.div>
  );
}

export function SignUpForm() {
  const reduceMotion = useReducedMotion();
  const [formError, setFormError] = useState<string | null>(null);
  const [confirmationEmail, setConfirmationEmail] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpInput>({ resolver: zodResolver(signUpSchema) });

  const onSubmit = async (input: SignUpInput) => {
    setFormError(null);
    const result = await signUpWithPassword(input);
    if (result && "error" in result) {
      setFormError(result.error);
    } else if (result && "needsConfirmation" in result) {
      setConfirmationEmail(input.email);
    }
  };

  if (confirmationEmail) {
    return <ConfirmationState email={confirmationEmail} />;
  }

  return (
    <motion.div
      className="flex w-full max-w-sm flex-col gap-6"
      initial={reduceMotion ? false : "hidden"}
      animate="show"
      variants={CONTAINER}
    >
      <motion.div variants={ITEM} className="flex flex-col gap-1">
        <span className="text-label font-semibold uppercase tracking-[0.18em] text-muted">
          Tell us who you are
        </span>
        <h2 className="font-display text-display-md text-foreground">Create your account</h2>
      </motion.div>

      {/* method="post" is a deliberate defense-in-depth fallback, not
          decorative -- this form submits via onSubmit/handleSubmit (which
          calls preventDefault()), so the browser's native submission never
          normally runs. But if that JS handler somehow doesn't attach in
          time (slow network, an extension, or -- confirmed while testing
          this -- a dev-mode Fast Refresh recompile mid-interaction), an
          unset method defaults to GET, which would put the password in the
          URL (browser history, server logs). Same safety net React itself
          auto-adds to the OAuth forms below (their action={fn} prop gets a
          `javascript:throw` fallback for exactly this reason); this form
          uses onSubmit instead of action, so it needs its own. */}
      <motion.form
        variants={ITEM}
        method="post"
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
        noValidate
      >
        <SignupField
          label="Full name"
          autoComplete="name"
          {...register("fullName")}
          error={errors.fullName?.message}
        />
        <SignupField
          label="Email"
          type="email"
          autoComplete="email"
          {...register("email")}
          error={errors.email?.message}
        />
        <SignupField
          label="Phone number"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          {...register("phone")}
          error={errors.phone?.message}
        />
        <SignupField
          label="Password"
          type={showPassword ? "text" : "password"}
          autoComplete="new-password"
          {...register("password")}
          error={errors.password?.message}
          trailing={
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="flex h-7 w-7 items-center justify-center text-muted transition-colors hover:text-foreground"
              aria-label={showPassword ? "Hide password" : "Show password"}
              aria-pressed={showPassword}
            >
              {showPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
            </button>
          }
        />

        <DesignerToggle control={control} error={errors.isDesigner} />

        {formError && (
          <motion.p
            initial={reduceMotion ? false : { opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-body-sm text-danger"
            role="alert"
          >
            {formError}
          </motion.p>
        )}

        <motion.button
          type="submit"
          disabled={isSubmitting}
          whileHover={reduceMotion ? undefined : { scale: 1.015 }}
          whileTap={reduceMotion ? undefined : { scale: 0.97 }}
          transition={{ duration: 0.15, ease: EASE }}
          className="mt-2 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-accent px-6 text-body-sm font-semibold uppercase tracking-wide text-accent-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {isSubmitting ? "Creating your account…" : "Start creating"}
          {!isSubmitting && <ArrowRight size={16} weight="bold" aria-hidden />}
        </motion.button>
      </motion.form>

      <motion.div variants={ITEM} className="flex items-center gap-4">
        <span className="h-px flex-1 bg-border" aria-hidden />
        <span className="text-body-sm text-muted">or</span>
        <span className="h-px flex-1 bg-border" aria-hidden />
      </motion.div>

      <motion.div variants={ITEM} className="grid grid-cols-1 gap-3">
        <OAuthButton provider="google" label="Continue with Google" icon={GoogleLogo} />
      </motion.div>

      <motion.p variants={ITEM} className="text-body-sm text-muted">
        Already have an account?{" "}
        <Link href="/login" className="text-foreground underline underline-offset-4 hover:text-accent">
          Log in
        </Link>
      </motion.p>
    </motion.div>
  );
}
