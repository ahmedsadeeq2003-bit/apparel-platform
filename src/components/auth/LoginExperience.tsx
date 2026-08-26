"use client";

import { useState } from "react";
import { LoginVisual } from "@/components/auth/LoginVisual";
import { LoginForm } from "@/components/auth/LoginForm";

/** Owns the one piece of state LoginVisual and LoginForm need to share --
 * whether a field in the form currently has focus -- so the visual panel
 * can recede in response. Kept in a tiny client wrapper rather than lifted
 * into page.tsx (a Server Component, can't hold state) or a full context
 * (only one boolean, one consumer pair; a context would be more machinery
 * than the problem needs). */
export function LoginExperience() {
  const [formFocused, setFormFocused] = useState(false);

  return (
    <main className="grid flex-1 lg:grid-cols-2">
      <LoginVisual formFocused={formFocused} />
      <div className="flex items-center justify-center px-6 py-10 md:px-10 lg:px-16 xl:px-20">
        <LoginForm onFocusChange={setFormFocused} />
      </div>
    </main>
  );
}
