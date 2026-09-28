import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

const fieldBase =
  'w-full rounded-2xl border border-ink-200/80 bg-white px-4 py-3 text-sm text-ink-950 placeholder:text-ink-400 shadow-sm shadow-ink-950/[0.02] transition-all focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/15 disabled:bg-ink-50 disabled:text-ink-400';

export const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => <input ref={ref} className={cn(fieldBase, className)} {...props} />
);
Input.displayName = 'Input';

export const Textarea = forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea ref={ref} className={cn(fieldBase, 'min-h-[96px] resize-y', className)} {...props} />
  )
);
Textarea.displayName = 'Textarea';

export const Select = forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => (
    <select ref={ref} className={cn(fieldBase, 'pr-8 appearance-none bg-no-repeat', className)} {...props}>
      {children}
    </select>
  )
);
Select.displayName = 'Select';

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
  return (
    <label className={cn('block space-y-1.5', className)}>
      <span className="text-xs font-bold text-ink-700">
        {label}
        {required && <span className="text-brand-600"> *</span>}
      </span>
      {children}
      {hint && !error && <span className="block text-[11px] text-ink-400">{hint}</span>}
      {error && <span className="block text-[11px] font-semibold text-rose-600">{error}</span>}
    </label>
  );
}