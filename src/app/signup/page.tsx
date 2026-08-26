import Link from "next/link";
import { redirect } from "next/navigation";
import { Wordmark } from "@/components/brand/Wordmark";
import { GrainOverlay } from "@/components/marketing/GrainOverlay";
import { SignUpVisual } from "@/components/auth/SignUpVisual";
import { SignUpForm } from "@/components/auth/SignUpForm";
import { createClient } from "@/lib/supabase/server";

/** Deliberately not SiteHeader/SiteFooter -- this is meant to read as the
 * start of a focused creative-onboarding moment, not another marketing
 * page with the full nav, matching how /editor/new already runs its own
 * bespoke chrome rather than the site header. Only a wordmark (still links
 * home) and a way back to /login, same as the homepage's real Wordmark
 * component, no separate brand mark invented for this page. */
export default async function SignUpPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    redirect("/products");
  }

  return (
    <div className="theme-editorial flex min-h-screen flex-col bg-background text-foreground">
      <GrainOverlay />
      <header className="flex items-center justify-between px-6 py-5 md:px-10">
        <Wordmark />
        <Link
          href="/login"
          className="text-body-sm font-medium text-muted transition-colors hover:text-foreground"
        >
          Log in
        </Link>
      </header>
      <main className="grid flex-1 lg:grid-cols-2">
        <SignUpVisual />
        <div className="flex items-center justify-center px-6 py-12 md:px-10 lg:px-16 xl:px-20">
          <SignUpForm />
        </div>
      </main>
    </div>
  );
}
