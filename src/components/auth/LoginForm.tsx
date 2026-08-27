"use client";

import { useActionState, useId, forwardRef, useState } from "react";
import type { InputHTMLAttributes } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { motion, useReducedMotion, type Variants } from "motion/react";
import { ArrowRight, GoogleLogo } from "@phosphor-icons/react";
import { loginSchema, magicLinkSchema, type LoginInput, type MagicLinkInput } from "@/lib/auth/schemas";
import { signInWithMagicLink, signInWithOAuth, signInWithPassword } from "@/lib/auth/actions";

const EASE = [0.16, 1, 0.3, 1] as const;

const CONTAINER: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.15 } },
};

const ITEM: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
};

type Mode = "password" | "magic-link";

/** Same floating-label treatment /signup established (placeholder=" " +
 * :not(:placeholder-shown), an animated focus underline) -- reimplemented
 * here rather than imported, since /signup is explicitly not to be touched
 * and its version is a local, unexported component. Adds onFocus/onBlur
 * passthrough so the page can react to focus, which /signup's version
 * doesn't need. */
const LoginField = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string }
>(function LoginField({ label, error, id, className = "", onFocus, onBlur, ...rest }, ref) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="group relative">
        <input
          ref={ref}
          id={inputId}
          placeholder=" "
          onFocus={onFocus}
          onBlur={onBlur}
          className={`peer min-h-14 w-full rounded-sm border bg-background px-4 pt-5 pb-1.5 text-body text-foreground outline-none transition-colors focus-visible:outline-none ${
            error ? "border-danger" : "border-border focus:border-foreground"
          } ${className}`}
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
      </div>
      {error && (
        <p id={`${inputId}-error`} className="text-body-sm text-danger" role="alert">
          {error}
        </p>
      )}
    </div>
  );
});

/** Same visual treatment as /signup's OAuth buttons -- reimplemented for
 * the same reason as LoginField above (not importing from the untouched
 * /signup file). Calls the exact same signInWithOAuth server action;
 * Supabase OAuth doesn't distinguish "signing up" from "logging in", so
 * there's no separate login-flavored OAuth call to write. */
function OAuthButton({
  provider,
  label,
  icon: Icon,
  next,
}: {
  provider: "google";
  label: string;
  icon: typeof GoogleLogo;
  next?: string;
}) {
  const [state, formAction, isPending] = useActionState(
    async () => signInWithOAuth(provider, next),
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

export function LoginForm({
  onFocusChange,
  next,
  initialError,
}: {
  onFocusChange: (focused: boolean) => void;
  next?: string;
  initialError?: string;
}) {
  const reduceMotion = useReducedMotion();
  const [mode, setMode] = useState<Mode>("password");
  const [formError, setFormError] = useState<string | null>(initialError ?? null);
  const [magicLinkSent, setMagicLinkSent] = useState<string | null>(null);

  const passwordForm = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });
  const magicLinkForm = useForm<MagicLinkInput>({ resolver: zodResolver(magicLinkSchema) });

  const handleFocus = () => onFocusChange(true);

  const emailField = passwordForm.register("email");
  const passwordField = passwordForm.register("password");
  const magicLinkEmailField = magicLinkForm.register("email");

  const onPasswordSubmit = async (input: LoginInput) => {
    setFormError(null);
    const result = await signInWithPassword(input, next);
    if (result?.error) setFormError(result.error);
  };

  const onMagicLinkSubmit = async (input: MagicLinkInput) => {
    setFormError(null);
    const result = await signInWithMagicLink(input, next);
    if ("error" in result) {
      setFormError(result.error);
    } else {
      setMagicLinkSent(input.email);
    }
  };

  const switchMode = (next: Mode) => {
    setMode(next);
    setFormError(null);
    setMagicLinkSent(null);
  };

  return (
    <motion.div
      className="flex w-full max-w-sm flex-col gap-6"
      initial={reduceMotion ? false : "hidden"}
      animate="show"
      variants={CONTAINER}
    >
      <motion.div variants={ITEM} className="flex flex-col gap-1">
        <span className="text-label font-semibold uppercase tracking-[0.18em] text-muted">
          Your STITCH account
        </span>
        <h2 className="font-display text-display-md text-foreground">Let&rsquo;s make something.</h2>
      </motion.div>

      <motion.div variants={ITEM} className="flex gap-4 text-body-sm">
        <button
          type="button"
          onClick={() => switchMode("password")}
          aria-pressed={mode === "password"}
          className={`font-medium transition-colors ${mode === "password" ? "text-foreground" : "text-muted hover:text-foreground"}`}
        >
          Password
        </button>
        <span aria-hidden className="text-border">
          /
        </span>
        <button
          type="button"
          onClick={() => switchMode("magic-link")}
          aria-pressed={mode === "magic-link"}
          className={`font-medium transition-colors ${mode === "magic-link" ? "text-foreground" : "text-muted hover:text-foreground"}`}
        >
          Email link
        </button>
      </motion.div>

      {mode === "password" ? (
        <motion.form variants={ITEM} method="post" onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="flex flex-col gap-4" noValidate>
          <LoginField
            label="Email"
            type="email"
            autoComplete="email"
            onFocus={handleFocus}
            {...emailField}
            onBlur={(e) => {
              emailField.onBlur(e);
              onFocusChange(false);
            }}
            error={passwordForm.formState.errors.email?.message}
          />
          <LoginField
            label="Password"
            type="password"
            autoComplete="current-password"
            onFocus={handleFocus}
            {...passwordField}
            onBlur={(e) => {
              passwordField.onBlur(e);
              onFocusChange(false);
            }}
            error={passwordForm.formState.errors.password?.message}
          />
          <Link
            href="/forgot-password"
            className="-mt-2 self-end text-body-sm font-medium text-muted underline underline-offset-4 hover:text-foreground"
          >
            Forgot password?
          </Link>
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
            disabled={passwordForm.formState.isSubmitting}
            whileHover={reduceMotion ? undefined : { scale: 1.015 }}
            whileTap={reduceMotion ? undefined : { scale: 0.97 }}
            transition={{ duration: 0.15, ease: EASE }}
            className="mt-1 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-accent px-6 text-body-sm font-semibold uppercase tracking-wide text-accent-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {passwordForm.formState.isSubmitting ? "Signing you in…" : "Sign in"}
            {!passwordForm.formState.isSubmitting && <ArrowRight size={16} weight="bold" aria-hidden />}
          </motion.button>
        </motion.form>
      ) : magicLinkSent ? (
        <motion.p
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="text-body text-foreground"
          role="status"
        >
          Check <span className="font-medium">{magicLinkSent}</span>{" "}
          for your sign-in link.
        </motion.p>
      ) : (
        <motion.form variants={ITEM} method="post" onSubmit={magicLinkForm.handleSubmit(onMagicLinkSubmit)} className="flex flex-col gap-4" noValidate>
          <LoginField
            label="Email"
            type="email"
            autoComplete="email"
            onFocus={handleFocus}
            {...magicLinkEmailField}
            onBlur={(e) => {
              magicLinkEmailField.onBlur(e);
              onFocusChange(false);
            }}
            error={magicLinkForm.formState.errors.email?.message}
          />
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
            disabled={magicLinkForm.formState.isSubmitting}
            whileHover={reduceMotion ? undefined : { scale: 1.015 }}
            whileTap={reduceMotion ? undefined : { scale: 0.97 }}
            transition={{ duration: 0.15, ease: EASE }}
            className="mt-1 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-accent px-6 text-body-sm font-semibold uppercase tracking-wide text-accent-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {magicLinkForm.formState.isSubmitting ? "Sending link…" : "Send sign-in link"}
            {!magicLinkForm.formState.isSubmitting && <ArrowRight size={16} weight="bold" aria-hidden />}
          </motion.button>
        </motion.form>
      )}

      <motion.div variants={ITEM} className="flex items-center gap-4">
        <span className="h-px flex-1 bg-border" aria-hidden />
        <span className="text-body-sm text-muted">or</span>
        <span className="h-px flex-1 bg-border" aria-hidden />
      </motion.div>

      <motion.div variants={ITEM} className="grid grid-cols-1 gap-3">
        <OAuthButton provider="google" label="Continue with Google" icon={GoogleLogo} next={next} />
      </motion.div>

      <motion.p variants={ITEM} className="text-body-sm text-muted">
        New here?{" "}
        <Link
          href={next ? `/signup?next=${encodeURIComponent(next)}` : "/signup"}
          className="text-foreground underline underline-offset-4 hover:text-accent"
        >
          Create an account
        </Link>
      </motion.p>
    </motion.div>
  );
}
