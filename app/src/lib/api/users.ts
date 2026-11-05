import { adapters } from "./adapters";
import { http, unwrap } from "../http";
import type {
  AccountStatus,
  AuthTokensDto,
  PageResponse,
  UserDto,
} from "../../types/api";

function pageFromArray<T>(
  content: T[],
  page: number,
  size: number,
): PageResponse<T> {
  const start = page * size;
  const paged = content.slice(start, start + size);
  const totalPages = Math.max(1, Math.ceil(content.length / size));
  return {
    content: paged,
    totalElements: content.length,
    totalPages,
    number: page,
    size,
    first: page === 0,
    last: page >= totalPages - 1,
  };
}

export const usersApi = {
  me: () => unwrap<UserDto>(http.get("/api/users/me"), adapters.user),

  list: async (page = 0, size = 20) => {
    const users = await unwrap<UserDto[]>(
      http.get("/api/users"),
      adapters.user,
    );
    return pageFromArray(users, page, size);
  },

  getById: (id: string) =>
    unwrap<UserDto>(http.get(`/api/users/${id}`), adapters.user),

  updateStatus: (id: string, status: AccountStatus) =>
    unwrap<void>(http.put(`/api/users/${id}/status`, { status })),

  adminCreate: async (payload: {
    username: string;
    email: string;
    password: string;
    role: string;
    tenantId?: string | null;
  }) => {
    const tokens = await unwrap<AuthTokensDto>(
      http.post("/api/users/admin/create", payload),
      adapters.auth,
    );
    return tokens.user as UserDto;
  },

  assignTenant: (id: string, tenantId: string) =>
    unwrap<void>(http.put(`/api/users/${id}/tenant`, { tenantId })),

  listByTenant: (tenantId: string) =>
    unwrap<UserDto[]>(http.get(`/api/users/tenant/${tenantId}`), adapters.user),

  remove: (id: string) => unwrap<void>(http.delete(`/api/users/${id}`)),
};
