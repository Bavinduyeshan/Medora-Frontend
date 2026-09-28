import { http, unwrap } from '../http';
import { sessionCookies } from '../sessionCookies';
import type { AuthTokensDto, LoginPayload, RegisterPayload, UserDto } from '../../types/api';

export const authApi = {
  register: async (payload: RegisterPayload) => {
    const tokens = await unwrap<AuthTokensDto>(http.post('/api/auth/register', payload));
    return tokens.user as UserDto;
  },

  login: (payload: LoginPayload) => unwrap<AuthTokensDto>(http.post('/api/auth/login', payload)),

  refresh: (refreshToken: string) =>
    unwrap<AuthTokensDto>(http.post('/api/auth/refresh', { refreshToken })),

  verifyEmail: (token: string) => unwrap<void>(http.get(`/api/auth/verify-email`, { params: { token } })),

  forgotPassword: (email: string) => unwrap<void>(http.post('/api/auth/forgot-password', { email })),

  resetPassword: (token: string, newPassword: string) =>
    unwrap<void>(http.post('/api/auth/reset-password', { token, newPassword })),

  logout: () => unwrap<void>(http.post('/api/auth/logout', { refreshToken: sessionCookies.refreshToken })),

  me: () => unwrap<UserDto>(http.get('/api/users/me')),
};
