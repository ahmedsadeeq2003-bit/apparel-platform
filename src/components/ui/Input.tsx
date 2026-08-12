import { forwardRef, useId } from "react";
import type { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  function Input({ label, error, id, className = "", ...rest }, ref) {
    const generatedId = useId();
    const inputId = id ?? generatedId;

    return (
      <div className="flex flex-col gap-2">
        <label htmlFor={inputId} className="text-body-sm text-muted">
          {label}
        </label>
        <input
          ref={ref}
          id={inputId}
          className={`min-h-11 rounded-sm border bg-surface px-4 text-body text-foreground outline-none transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
            error ? "border-danger" : "border-border"
          } ${className}`}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...rest}
        />
        {error && (
          <p id={`${inputId}-error`} className="text-body-sm text-danger">
            {error}
          </p>
        )}
      </div>
    );
  },
);
