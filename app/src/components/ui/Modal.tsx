'use client';

import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'md',
  footer,
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  footer?: React.ReactNode;
}) {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen || typeof document === 'undefined') return null;

  const sizeClass = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' }[size];

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/50 backdrop-blur-sm p-4">
      <div
        className="absolute inset-0"
        onClick={onClose}
        aria-hidden
      />
      <div
        className={cn(
          'relative w-full rounded-2xl bg-white shadow-2xl border border-ink-100 max-h-[90vh] flex flex-col',
          sizeClass
        )}
        role="dialog"
        aria-modal
      >
        <div className="flex items-start justify-between gap-4 border-b border-ink-100 p-5 sm:p-6">
          <div>
            <h2 className="text-lg font-bold text-ink-900 tracking-tight">{title}</h2>
            {description && <p className="mt-1 text-xs text-ink-500">{description}</p>}
          </div>
          <button
            onClick={onClose}
            className="shrink-0 rounded-full p-1.5 text-ink-400 hover:bg-ink-100 hover:text-ink-700 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="overflow-y-auto p-5 sm:p-6">{children}</div>
        {footer && <div className="flex items-center justify-end gap-3 border-t border-ink-100 p-5 sm:p-6">{footer}</div>}
      </div>
    </div>,
    document.body
  );
}
