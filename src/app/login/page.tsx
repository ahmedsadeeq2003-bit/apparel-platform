import Link from "next/link";
import { Wordmark } from "@/components/brand/Wordmark";
import { LoginExperience } from "@/components/auth/LoginExperience";

/** Same bespoke-chrome pattern as /signup (no SiteHeader/SiteFooter) for
 * the same reason: this is meant to read as a focused moment, not another
 * marketing page. GrainOverlay lives inside LoginVisual (desktop-only)
 * rather than here, since /signup renders it site-wide across its whole
 * page -- this page's grain is scoped to the visual panel specifically. */
export default function LoginPage() {
  return (
    <div className="theme-editorial flex min-h-screen flex-col bg-background text-foreground">
      <header className="flex items-center justify-between px-6 py-5 md:px-10">
        <Wordmark />
        <Link
          href="/signup"
          className="text-body-sm font-medium text-muted transition-colors hover:text-foreground"
        >
          Sign up
        </Link>
      </header>
      <LoginExperience />
    </div>
  );
}
