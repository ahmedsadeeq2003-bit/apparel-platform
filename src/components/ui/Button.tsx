import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "dark";

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    "bg-accent text-accent-foreground hover:bg-accent/90 focus-visible:outline-accent",
  secondary:
    "border border-border text-foreground hover:border-accent hover:text-accent focus-visible:outline-accent",
  dark: "bg-foreground text-background hover:opacity-90 focus-visible:outline-foreground uppercase tracking-wide text-body-sm font-semibold",
};

const BASE_CLASSES =
  "inline-flex min-h-11 items-center justify-center whitespace-nowrap rounded-full px-6 text-body font-medium transition-[colors,transform] duration-150 active:scale-[0.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2";

type LinkButtonProps = {
  href: string;
  children: ReactNode;
  variant?: ButtonVariant;
  className?: string;
};

type NativeButtonProps = {
  href?: undefined;
  children: ReactNode;
  variant?: ButtonVariant;
  className?: string;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "className">;

export function Button(props: LinkButtonProps | NativeButtonProps) {
  const { children, variant = "primary", className = "" } = props;
  const classes = `${BASE_CLASSES} ${VARIANT_CLASSES[variant]} ${className}`;

  if (props.href) {
    return (
      <Link href={props.href} className={classes}>
        {children}
      </Link>
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- destructured only to exclude from `rest`
  const { href: _href, children: _children, variant: _variant, className: _className, ...rest } = props;

  return (
    <button className={classes} {...rest}>
      {children}
    </button>
  );
}
