import Link from "next/link";
import { Wordmark } from "@/components/brand/Wordmark";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/layout/Container";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/lib/auth/actions";

export async function SiteHeader() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-md">
      <Container>
        <div className="flex h-16 items-center justify-between gap-4 md:h-18">
          <Wordmark />
          <Link
            href="/#how-it-works"
            className="hidden text-body text-muted transition-colors hover:text-foreground md:inline"
          >
            How it works
          </Link>
          <div className="flex items-center gap-4">
            {user && (
              <form action={signOut}>
                <button
                  type="submit"
                  className="text-body text-muted transition-colors hover:text-foreground"
                >
                  Log out
                </button>
              </form>
            )}
            <Button href={user ? "/products" : "/signup"} variant="primary">
              {user ? "Browse shirts" : "Start designing"}
            </Button>
          </div>
        </div>
      </Container>
    </header>
  );
}
