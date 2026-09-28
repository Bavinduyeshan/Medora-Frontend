import { http, unwrap } from '../http';
import type { NotificationDto, NotificationType, PageResponse } from '../../types/api';

export const notificationsApi = {
  send: (payload: {
    userId: string;
    type: NotificationType;
    title: string;
    body: string;
    deepLink?: string;
    scheduledFor?: string | null;
  }) => unwrap<NotificationDto>(http.post('/api/notifications/send', payload)),

  my: (page = 0, size = 20) =>
    unwrap<PageResponse<NotificationDto>>(http.get('/api/notifications/my', { params: { page, size } })),

  unreadCount: async () => {
    const data = await unwrap<{ unreadCount: number }>(http.get('/api/notifications/unread-count'));
    return data.unreadCount ?? 0;
  },

  markRead: (id: string) => unwrap<NotificationDto>(http.put(`/api/notifications/${id}/read`)),
};
