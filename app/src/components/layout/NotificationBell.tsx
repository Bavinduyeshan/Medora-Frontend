"use client";

import { useState } from "react";
import { Bell, CheckCheck } from "lucide-react";
import {
  useMarkNotificationRead,
  useMyNotifications,
  useUnreadNotificationCount,
} from "@/hooks/useNotifications";
import { timeAgo, cn } from "@/lib/utils";
import { EmptyState, ErrorState, Spinner } from "@/components/ui/Feedback";
import { Modal } from "@/components/ui/Modal";

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const { data: unreadCount } = useUnreadNotificationCount();
  const {
    data: notifications,
    isLoading,
    error,
    refetch,
  } = useMyNotifications();
  const markRead = useMarkNotificationRead();
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-ink-500 transition-colors hover:bg-ink-50"
        aria-label={
          unreadCount ? `Notifications, ${unreadCount} unread` : "Notifications"
        }
        aria-haspopup="dialog"
      >
        <Bell size={20} />
        {!!unreadCount && (
          <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-600 px-1 text-[10px] font-semibold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>
      <Modal
        isOpen={open}
        onClose={() => setOpen(false)}
        title="Notifications"
        description={
          unreadCount
            ? `${unreadCount} unread updates from your care workspace.`
            : "Updates from your care workspace."
        }
      >
        {isLoading && (
          <div className="flex justify-center py-10">
            <Spinner />
          </div>
        )}
        {error && (
          <ErrorState
            message="We couldn’t load your notifications."
            onRetry={() => refetch()}
          />
        )}
        {!isLoading && !error && !notifications?.content.length && (
          <EmptyState
            icon={CheckCheck}
            title="You’re all caught up"
            description="New updates from your care team will appear here."
          />
        )}
        {markRead.isError && (
          <p
            role="alert"
            className="mb-3 rounded-lg bg-rose-50 p-3 text-sm text-rose-700"
          >
            Couldn’t mark that update as read. Please try again.
          </p>
        )}
        <div className="space-y-2">
          {notifications?.content.map((item) => (
            <button
              key={item.id}
              disabled={markRead.isPending}
              onClick={() => item.status !== "READ" && markRead.mutate(item.id)}
              className={cn(
                "flex w-full flex-col gap-1.5 rounded-xl border border-ink-100 p-4 text-left transition-colors hover:bg-ink-50",
                item.status !== "READ" && "border-brand-100 bg-brand-50/40",
              )}
            >
              <span className="flex w-full items-center justify-between gap-3">
                <span className="text-sm font-semibold text-ink-800">
                  {item.title}
                </span>
                {item.status !== "READ" && (
                  <span className="h-2 w-2 shrink-0 rounded-full bg-brand-500" />
                )}
              </span>
              <span className="text-sm leading-6 text-ink-500">
                {item.body}
              </span>
              <span className="mt-1 text-xs text-ink-400">
                {timeAgo(item.createdAt)}
                {item.status !== "READ" && " · Select to mark as read"}
              </span>
            </button>
          ))}
        </div>
      </Modal>
    </>
  );
}
