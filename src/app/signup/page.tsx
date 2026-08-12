import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { SignUpForm } from "@/components/auth/SignUpForm";

export default function SignUpPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <Section>
          <Container>
            <h1 className="font-display text-display-xl uppercase text-foreground">
              Create your account
            </h1>
            <p className="mt-3 max-w-sm text-body text-muted">
              You&apos;ll need an account to save designs and place orders.
            </p>
            <div className="mt-8">
              <SignUpForm />
            </div>
          </Container>
        </Section>
      </main>
      <SiteFooter />
    </>
  );
}
