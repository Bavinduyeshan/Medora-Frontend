"use client";

import { createContext, forwardRef, useContext, useId } from "react";
import { cn } from "@/lib/utils";

const FieldContext = createContext<{
  id: string;
  descriptionId?: string;
  invalid?: boolean;
} | null>(null);
const fieldBase =
  "w-full min-w-0 rounded-xl border border-ink-200/80 bg-white px-4 py-3 text-base text-ink-950 placeholder:text-ink-400 shadow-sm shadow-ink-950/[0.02] transition-all focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/15 disabled:bg-ink-50 disabled:text-ink-400";
function useFieldProps() {
  const field = useContext(FieldContext);
  return {
    id: field?.id,
    "aria-describedby": field?.descriptionId,
    "aria-invalid": field?.invalid || undefined,
  };
}
export const Input = forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => {
  const fieldProps = useFieldProps();
  return (
    <input
      {...fieldProps}
      {...props}
      ref={ref}
      className={cn(fieldBase, className)}
    />
  );
});
Input.displayName = "Input";
export const Textarea = forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => {
  const fieldProps = useFieldProps();
  return (
    <textarea
      {...fieldProps}
      {...props}
      ref={ref}
      className={cn(fieldBase, "min-h-[110px] resize-y", className)}
    />
  );
});
Textarea.displayName = "Textarea";
export const Select = forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, ...props }, ref) => {
  const fieldProps = useFieldProps();
  return (
    <select
      {...fieldProps}
      {...props}
      ref={ref}
      className={cn(fieldBase, "pr-8", className)}
    >
      {children}
    </select>
  );
});
Select.displayName = "Select";
export function Field({
  label,
  hint,
  error,
  required,
  children,
  className,
}: {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  const id = useId();
  const descriptionId = hint || error ? `${id}-description` : undefined;
  return (
    <FieldContext.Provider value={{ id, descriptionId, invalid: !!error }}>
      <div className={cn("min-w-0 space-y-2", className)}>
        <label htmlFor={id} className="block text-sm font-medium text-ink-700">
          {label}
          {required && (
            <span className="text-brand-600" aria-hidden="true">
              {" "}
              *
            </span>
          )}
        </label>
        {children}
        {hint && !error && (
          <p id={descriptionId} className="text-xs leading-5 text-ink-500">
            {hint}
          </p>
        )}
        {error && (
          <p
            id={descriptionId}
            role="alert"
            className="text-xs font-medium text-rose-600"
          >
            {error}
          </p>
        )}
      </div>
    </FieldContext.Provider>
  );
}
