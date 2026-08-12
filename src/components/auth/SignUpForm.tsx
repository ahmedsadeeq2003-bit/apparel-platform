"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { signUpSchema, type SignUpInput } from "@/lib/auth/schemas";
import { signUpWithPassword } from "@/lib/auth/actions";

export function SignUpForm() {
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpInput>({ resolver: zodResolver(signUpSchema) });

  const onSubmit = async (input: SignUpInput) => {
    setFormError(null);
    const result = await signUpWithPassword(input);
    if (result?.error) {
      setFormError(result.error);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex max-w-sm flex-col gap-4"
    >
      <Input
        label="Full name"
        autoComplete="name"
        {...register("fullName")}
        error={errors.fullName?.message}
      />
      <Input
        label="Email"
        type="email"
        autoComplete="email"
        {...register("email")}
        error={errors.email?.message}
      />
      <Input
        label="Password"
        type="password"
        autoComplete="new-password"
        {...register("password")}
        error={errors.password?.message}
      />
      {formError && <p className="text-body-sm text-danger">{formError}</p>}
      <Button type="submit" variant="primary" disabled={isSubmitting}>
        {isSubmitting ? "Creating account…" : "Create account"}
      </Button>
      <p className="text-body-sm text-muted">
        Already have an account?{" "}
        <Link href="/login" className="text-foreground hover:text-accent">
          Log in
        </Link>
      </p>
    </form>
  );
}
