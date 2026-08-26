"use client";

import { Controller, type Control, type FieldError } from "react-hook-form";
import { motion, useReducedMotion } from "motion/react";
import { PaintBrush, Sparkle } from "@phosphor-icons/react";
import type { SignUpInput } from "@/lib/auth/schemas";

const EASE = [0.16, 1, 0.3, 1] as const;
const OVERSHOOT = [0.34, 1.56, 0.64, 1] as const;

const OPTIONS = [
  { value: "yes" as const, label: "Yes -- I make art", icon: PaintBrush },
  { value: "no" as const, label: "No -- I want to create", icon: Sparkle },
];

/** Two large interactive choices standing in for a radio group -- a real
 * `<input type="radio">` per option (visually hidden, not display:none, so
 * it stays keyboard/screen-reader accessible and keeps react-hook-form's
 * native validation working) drives a custom-styled label that pops when
 * selected. Colors swap via plain Tailwind classes (Framer Motion can't
 * meaningfully tween `var(--color-x)` custom properties); the scale/icon
 * "pop" is real Motion, reserved for the one moment this field is asking
 * for a deliberate, obvious state change. */
export function DesignerToggle({
  control,
  error,
}: {
  control: Control<SignUpInput>;
  error?: FieldError;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <Controller
      name="isDesigner"
      control={control}
      render={({ field }) => (
        <fieldset>
          <legend className="mb-3 text-body-sm font-medium text-foreground">
            Are you a graphic designer?
          </legend>
          <div role="radiogroup" aria-label="Are you a graphic designer?" className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {OPTIONS.map((option) => {
              const selected = field.value === option.value;
              const Icon = option.icon;
              return (
                <label key={option.value} className="relative block cursor-pointer">
                  <input
                    type="radio"
                    name={field.name}
                    value={option.value}
                    checked={selected}
                    onChange={() => field.onChange(option.value)}
                    onBlur={field.onBlur}
                    className="peer sr-only"
                  />
                  <div
                    className={`flex items-center gap-3 rounded-sm border px-4 py-3.5 transition-colors duration-200 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent ${
                      selected
                        ? "border-foreground bg-foreground text-background"
                        : "border-border bg-background text-foreground hover:border-foreground/40"
                    }`}
                  >
                    <motion.span
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                      style={{
                        backgroundColor: selected ? "var(--color-background)" : "transparent",
                      }}
                      animate={reduceMotion ? undefined : { scale: selected ? [0.7, 1.1, 1] : 1 }}
                      transition={{ duration: 0.4, ease: OVERSHOOT }}
                    >
                      <Icon size={18} weight={selected ? "fill" : "regular"} className={selected ? "text-foreground" : undefined} />
                    </motion.span>
                    <span className="text-body-sm font-semibold uppercase tracking-wide">{option.label}</span>
                  </div>
                </label>
              );
            })}
          </div>
          {error && (
            <motion.p
              initial={reduceMotion ? false : { opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: EASE }}
              className="mt-2 text-body-sm text-danger"
              role="alert"
            >
              {error.message}
            </motion.p>
          )}
        </fieldset>
      )}
    />
  );
}
