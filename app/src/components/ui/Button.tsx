'use client';

import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'dark';
type Size = 'sm' | 'md' | 'lg' | 'icon';

const VARIANT_CLASSES: Record<Variant, string> = {
  primary:
    'bg-brand-600 text-white hover:bg-brand-700 shadow-sm shadow-brand-950/20 focus-visible:ring-brand-500 disabled:bg-brand-300',
  secondary:
    'bg-brand-50 text-brand-700 hover:bg-brand-100 focus-visible:ring-brand-400 disabled:opacity-60',
  outline:
    'bg-white text-ink-800 border border-ink-200 hover:border-brand-200 hover:bg-brand-50/70 focus-visible:ring-brand-400 disabled:opacity-60',
  ghost: 'bg-transparent text-ink-600 hover:bg-brand-50 hover:text-brand-700 focus-visible:ring-brand-300',
  danger: 'bg-rose-600 text-white hover:bg-rose-700 focus-visible:ring-rose-500 disabled:bg-rose-300',
  dark: 'bg-ink-950 text-white hover:bg-ink-800 focus-visible:ring-ink-600 disabled:opacity-60',
};

const SIZE_CLASSES: Record<Size, string> = {
  sm: 'h-9 px-3.5 text-xs gap-1.5 rounded-full',
  md: 'h-10.5 px-4 text-sm gap-2 rounded-full',
  lg: 'h-12 px-6 text-sm gap-2 rounded-full',
  icon: 'h-10 w-10 rounded-full',
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, icon, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center font-bold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed whitespace-nowrap active:translate-y-px',
          VARIANT_CLASSES[variant],
          SIZE_CLASSES[size],
          className
        )}
        {...props}
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : icon}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';