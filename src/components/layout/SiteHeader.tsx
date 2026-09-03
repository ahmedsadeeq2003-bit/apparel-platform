import Link from "next/link";
import { Wordmark } from "@/components/brand/Wordmark";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/layout/Container";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/lib/auth/actions";

const NAV_LINKS = [
  { href: "/products", label: "Create" },
  { href: "/inspiration", label: "Inspiration" },
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#business", label: "Business" },
] as const;

export async function SiteHeader() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-md">
      <Container>
        <div className="flex h-16 items-center justify-between gap-3 md:h-18">
          <Wordmark />
          <nav className="hidden items-center gap-8 md:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-body text-muted transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-3 sm:gap-4">
            {user ? (
              <form action={signOut}>
                <button
                  type="submit"
                  className="text-body text-muted transition-colors hover:text-foreground"
                >
                  Log out
                </button>
              </form>
            ) : (
              <Link
                href="/login"
                className="text-body text-muted transition-colors hover:text-foreground"
              >
                Log in
              </Link>
            )}
            {/* Signed-in customers land in the Design Hub (their creative
                home, per the site's routing architecture), not /products --
                repurposing this one CTA slot rather than adding a separate
                nav item for it. Logged-out behavior is unchanged. */}
            <Button href={user ? "/design-hub" : "/signup"} variant="dark">
              {user ? "Design Hub" : "Sign up"}
            </Button>
          </div>
        </div>
      </Container>
    </header>
  );
}
