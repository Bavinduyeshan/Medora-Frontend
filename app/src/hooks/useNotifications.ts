'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notificationsApi } from '@/lib/api/notifications';
import { useAuth } from '@/context/AuthContext';

export function useUnreadNotificationCount() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['notifications-unread-count'],
    queryFn: () => notificationsApi.unreadCount(),
    enabled: !!user,
    refetchInterval: 30_000,
  });
}

export function useMyNotifications() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['notifications-my'],
    queryFn: () => notificationsApi.my(),
    enabled: !!user,
  });
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationsApi.markRead(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications-my'] });
      qc.invalidateQueries({ queryKey: ['notifications-unread-count'] });
    },
  });
}
