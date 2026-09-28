'use client';

import { useState } from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import { useMarkNotificationRead, useMyNotifications, useUnreadNotificationCount } from '@/hooks/useNotifications';
import { timeAgo, cn } from '@/lib/utils';
import { Spinner } from '@/components/ui/Feedback';

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const { data: unreadCount } = useUnreadNotificationCount();
  const { data: notifications, isLoading } = useMyNotifications();
  const markRead = useMarkNotificationRead();

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative flex h-10 w-10 items-center justify-center rounded-xl text-ink-500 hover:bg-ink-100 hover:text-ink-800 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {!!unreadCount && unreadCount > 0 && (
          <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-12 z-40 w-80 rounded-2xl border border-ink-100 bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-ink-100 px-4 py-3">
              <span className="text-sm font-bold text-ink-900">Notifications</span>
              {!!unreadCount && unreadCount > 0 && (
                <span className="text-[11px] font-semibold text-brand-600">{unreadCount} unread</span>
              )}
            </div>
            <div className="max-h-96 overflow-y-auto">
              {isLoading && (
                <div className="flex justify-center py-8">
                  <Spinner />
                </div>
              )}
              {!isLoading && (!notifications || notifications.content.length === 0) && (
                <p className="px-4 py-8 text-center text-xs text-ink-400">You&apos;re all caught up.</p>
              )}
              {notifications?.content.map((n) => (
                <button
                  key={n.id}
                  onClick={() => n.status !== 'READ' && markRead.mutate(n.id)}
                  className={cn(
                    'flex w-full flex-col gap-0.5 border-b border-ink-50 px-4 py-3 text-left transition-colors hover:bg-ink-50 last:border-0',
                    n.status !== 'READ' && 'bg-brand-50/40'
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-ink-800">{n.title}</span>
                    {n.status !== 'READ' && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />}
                  </div>
                  <p className="text-[11px] text-ink-500 line-clamp-2">{n.body}</p>
                  <span className="mt-0.5 text-[10px] text-ink-400">{timeAgo(n.createdAt)}</span>
                </button>
              ))}
            </div>
            {!!notifications?.content.length && (
              <div className="flex items-center justify-center gap-1.5 border-t border-ink-100 py-2 text-[11px] font-semibold text-ink-400">
                <CheckCheck className="h-3.5 w-3.5" /> Tap a notification to mark as read
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
