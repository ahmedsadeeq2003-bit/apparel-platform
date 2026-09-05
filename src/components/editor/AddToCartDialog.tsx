"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "@phosphor-icons/react";
import { Button } from "@/components/ui/Button";
import { SIZES } from "@/lib/editor/cart";

export function AddToCartDialog({
  productColorName,
  onConfirm,
  onClose,
}: {
  productColorName: string;
  onConfirm: (size: string, quantity: number) => void;
  onClose: () => void;
}) {
  const [size, setSize] = useState<string>("M");
  const [quantity, setQuantity] = useState(1);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeButtonRef.current?.focus();
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-to-cart-heading"
        className="w-full max-w-sm rounded-sm border border-border bg-background p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 id="add-to-cart-heading" className="font-display text-display-md text-foreground">
            Add to cart
          </h2>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted hover:bg-surface hover:text-foreground"
          >
            <X size={16} />
          </button>
        </div>
        <p className="mt-1 text-body-sm text-muted">{productColorName}</p>

        <label className="mt-6 flex flex-col gap-2">
          <span className="text-[0.7rem] font-medium uppercase tracking-wide text-muted">Size</span>
          <div className="flex flex-wrap gap-2">
            {SIZES.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setSize(value)}
                aria-pressed={size === value}
                className={`h-10 w-12 rounded-sm border text-body-sm font-medium transition-colors ${
                  size === value
                    ? "border-accent bg-accent text-accent-foreground"
                    : "border-border text-foreground hover:border-accent"
                }`}
              >
                {value}
              </button>
            ))}
          </div>
        </label>

        <label className="mt-5 flex flex-col gap-2">
          <span className="text-[0.7rem] font-medium uppercase tracking-wide text-muted">Quantity</span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="flex h-10 w-10 items-center justify-center rounded-sm border border-border text-foreground hover:border-accent"
              aria-label="Decrease quantity"
            >
              −
            </button>
            <span className="w-8 text-center text-body font-medium text-foreground">{quantity}</span>
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.min(20, q + 1))}
              className="flex h-10 w-10 items-center justify-center rounded-sm border border-border text-foreground hover:border-accent"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
        </label>

        <Button
          variant="primary"
          className="mt-6 w-full uppercase tracking-wide text-body-sm font-semibold"
          onClick={() => onConfirm(size, quantity)}
        >
          Add to cart
        </Button>
        <p className="mt-3 text-center text-[0.7rem] text-muted">
          Pricing is calculated at checkout.
        </p>
      </div>
    </div>
  );
}
