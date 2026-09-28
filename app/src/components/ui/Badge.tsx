import { cn } from '@/lib/utils';

type Tone = 'brand' | 'neutral' | 'success' | 'warning' | 'danger' | 'info';

const TONE_CLASSES: Record<Tone, string> = {
  brand: 'bg-brand-50 text-brand-700 ring-brand-600/20',
  neutral: 'bg-ink-100 text-ink-600 ring-ink-500/10',
  success: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  warning: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  danger: 'bg-rose-50 text-rose-700 ring-rose-600/20',
  info: 'bg-sky-50 text-sky-700 ring-sky-600/20',
};

export function Badge({
  tone = 'neutral',
  className,
  children,
  dot,
}: {
  tone?: Tone;
  className?: string;
  children: React.ReactNode;
  dot?: boolean;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset',
        TONE_CLASSES[tone],
        className
      )}
    >
      {dot && <span className={cn('h-1.5 w-1.5 rounded-full', TONE_CLASSES[tone].split(' ')[1].replace('text', 'bg'))} />}
      {children}
    </span>
  );
}
