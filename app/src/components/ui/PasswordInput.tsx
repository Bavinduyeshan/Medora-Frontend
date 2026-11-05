"use client";

import { forwardRef, useState } from "react";
import { Eye, EyeOff, KeyRound } from "lucide-react";
import { Input } from "./Field";

export const PasswordInput = forwardRef<
  HTMLInputElement,
  Omit<React.InputHTMLAttributes<HTMLInputElement>, "type">
>(({ className, ...props }, ref) => {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <KeyRound className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
      <Input
        {...props}
        ref={ref}
        type={visible ? "text" : "password"}
        className={`pl-11 pr-12 ${className || ""}`}
      />
      <button
        type="button"
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
        onClick={() => setVisible(!visible)}
        className="absolute right-1 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg text-ink-400 hover:text-brand-600"
      >
        {visible ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
});
PasswordInput.displayName = "PasswordInput";
