import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <Section>
          <Container>
            <h1 className="font-display text-display-xl uppercase text-foreground">
              Log in
            </h1>
            <div className="mt-8">
              <LoginForm />
            </div>
          </Container>
        </Section>
      </main>
      <SiteFooter />
    </>
  );
}
