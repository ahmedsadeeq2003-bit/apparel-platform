import Link from "next/link";
import { redirect } from "next/navigation";
import { Wordmark } from "@/components/brand/Wordmark";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import { createClient } from "@/lib/supabase/server";

/** Same bespoke-chrome pattern as /login and /signup (no SiteHeader/
 * SiteFooter). Single centered column -- this is a utility step in the
 * login flow, not a page that needs its own visual panel. */
export default async function ForgotPasswordPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    redirect("/products");
  }

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
        <ForgotPasswordForm />
      </main>
    </div>
  );
}
