"use client";

import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = "md",
  footer,
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  footer?: React.ReactNode;
}) {
  const titleId = useId();
  const descriptionId = useId();
  const panel = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  useEffect(() => {
    closeRef.current = onClose;
  }, [onClose]);
  useEffect(() => {
    if (!isOpen) return;
    const previous = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    const focusable = () =>
      Array.from(
        panel.current?.querySelectorAll<HTMLElement>(
          'a[href],button:not([disabled]),input:not([disabled]),textarea:not([disabled]),select:not([disabled]),[tabindex="0"]',
        ) ?? [],
      ).filter((element) => element.getClientRects().length > 0);
    const frame = requestAnimationFrame(() =>
      (
        panel.current?.querySelector<HTMLElement>("[data-autofocus]") ||
        focusable()[0] ||
        panel.current
      )?.focus(),
    );
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeRef.current();
      }
      if (event.key === "Tab") {
        const items = focusable();
        const first = items[0];
        const last = items[items.length - 1];
        if (!items.length) {
          event.preventDefault();
          panel.current?.focus();
        } else if (
          event.shiftKey &&
          (document.activeElement === first ||
            !panel.current?.contains(document.activeElement))
        ) {
          event.preventDefault();
          last.focus();
        } else if (
          !event.shiftKey &&
          (document.activeElement === last ||
            !panel.current?.contains(document.activeElement))
        ) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
      previous?.focus();
    };
  }, [isOpen]);
  if (!isOpen || typeof document === "undefined") return null;
  const width = {
    sm: "max-w-sm",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  }[size];
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/45 p-4 backdrop-blur-sm">
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />
      <div
        ref={panel}
        tabIndex={-1}
        className={cn(
          "relative flex max-h-[90dvh] w-full flex-col rounded-2xl border border-ink-200 bg-white shadow-2xl outline-none",
          width,
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
      >
        <div className="flex items-start justify-between gap-4 border-b border-ink-100 p-5 sm:p-6">
          <div>
            <h2
              id={titleId}
              className="text-xl font-semibold tracking-tight text-ink-900"
            >
              {title}
            </h2>
            {description && (
              <p
                id={descriptionId}
                className="mt-1.5 text-sm leading-6 text-ink-500"
              >
                {description}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-ink-400 hover:bg-ink-100"
          >
            <X size={19} />
          </button>
        </div>
        <div className="overflow-y-auto p-5 sm:p-6">{children}</div>
        {footer && (
          <div className="flex items-center justify-end gap-3 border-t border-ink-100 p-5 sm:p-6">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
