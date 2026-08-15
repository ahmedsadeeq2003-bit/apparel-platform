import Link from "next/link";
import { Wordmark } from "@/components/brand/Wordmark";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/layout/Container";
import { BRAND_NAME, BRAND_TAGLINE } from "@/lib/brand";

const COLUMNS: {
  heading: string;
  items: { label: string; href?: string }[];
}[] = [
  {
    heading: "Create",
    items: [
      { label: "Start designing", href: "/products" },
      { label: "Inspiration", href: "/inspiration" },
      { label: "How it works", href: "/#how-it-works" },
    ],
  },
  {
    heading: "Business",
    items: [
      { label: "Custom uniforms", href: "/#business" },
      { label: "Bulk orders" },
    ],
  },
  {
    heading: "Support",
    items: [
      { label: "Contact" },
      { label: "FAQ" },
      { label: "Delivery" },
      { label: "Returns" },
    ],
  },
  {
    heading: "Legal",
    items: [{ label: "Privacy" }, { label: "Terms" }],
  },
];

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border">
      <Container>
        <div className="flex flex-col gap-6 border-b border-border py-10 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-display-md uppercase text-foreground">
              Ready to design yours?
            </h2>
            <p className="mt-1 text-body-sm text-muted">
              Free to design. You only pay when you order.
            </p>
          </div>
          <Button href="/signup" variant="primary" className="self-start sm:self-auto">
            Start design
          </Button>
        </div>
        <div className="grid gap-10 py-16 sm:grid-cols-2 md:grid-cols-[1.3fr_1fr_1fr_1fr]">
          <div className="flex flex-col gap-3">
            <Wordmark />
            <p className="max-w-[220px] text-body-sm text-muted">{BRAND_TAGLINE}</p>
          </div>
          {COLUMNS.map((column) => (
            <div key={column.heading} className="flex flex-col gap-3">
              <h3 className="text-body-sm font-semibold text-foreground">
                {column.heading}
              </h3>
              <ul className="flex flex-col gap-2">
                {column.items.map((item) => (
                  <li key={item.label}>
                    {item.href ? (
                      <Link
                        href={item.href}
                        className="text-body-sm text-muted transition-colors hover:text-foreground"
                      >
                        {item.label}
                      </Link>
                    ) : (
                      <span className="text-body-sm text-muted">{item.label}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-border py-6">
          <p className="text-body-sm text-muted">
            © {year} {BRAND_NAME}
          </p>
        </div>
      </Container>
    </footer>
  );
}
