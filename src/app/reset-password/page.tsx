import Link from "next/link";
import { Wordmark } from "@/components/brand/Wordmark";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { createClient } from "@/lib/supabase/server";

/** Reached only via the reset-password email link, which routes through
 * /auth/callback?next=/reset-password -- by the time the browser lands
 * here, that route has already exchanged the code for a recovery session
 * (or redirected to /login?error=... if the link was invalid/expired). If
 * there's no session here regardless (direct navigation, cookies blocked,
 * the session having since expired), show a dead-end state instead of a
 * form that would just fail on submit. */
export default async function ResetPasswordPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="theme-editorial flex min-h-screen flex-col bg-background text-foreground">
      <header className="flex items-center justify-between px-6 py-5 md:px-10">
        <Wordmark />
        <Link
          href="/login"
          className="text-body-sm font-medium text-muted transition-colors hover:text-foreground"
        >
          Log in
        </Link>
      </header>
      <main className="flex flex-1 items-center justify-center px-6 py-10 md:px-10">
        {user ? (
          <ResetPasswordForm />
        ) : (
          <div className="flex w-full max-w-sm flex-col gap-3">
            <h2 className="font-display text-display-md text-foreground">Link expired.</h2>
            <p className="text-body text-muted">
              This password reset link is invalid or has expired. Request a new one to continue.
            </p>
            <Link
              href="/forgot-password"
              className="mt-2 text-body-sm font-medium text-foreground underline underline-offset-4 hover:text-accent"
            >
              Send a new link
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
