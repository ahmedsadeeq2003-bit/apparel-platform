import Link from "next/link";
import { Wordmark } from "@/components/brand/Wordmark";
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
