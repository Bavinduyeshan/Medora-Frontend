"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useActiveWorkspace } from "@/hooks/useActiveWorkspace";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api/auth";
import { registerSessionExpiredHandler } from "@/lib/http";
import { sessionCookies } from "@/lib/sessionCookies";
import { roleHomePath } from "@/lib/utils";
import type { LoginPayload, RegisterPayload, UserDto } from "@/types/api";

interface AuthContextValue {
  user: UserDto | null;
  status: "loading" | "authenticated" | "unauthenticated";
  login: (payload: LoginPayload) => Promise<UserDto>;
  register: (payload: RegisterPayload) => Promise<UserDto>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const clearPrivateState = useCallback(() => {
    queryClient.clear();
    useActiveWorkspace.getState().checkOut();
  }, [queryClient]);
  const [user, setUser] = useState<UserDto | null>(null);
  const [status, setStatus] = useState<AuthContextValue["status"]>("loading");

  const hydrate = useCallback(async () => {
    const token = sessionCookies.accessToken;
    if (!token) {
      setUser(null);
      setStatus("unauthenticated");
      return;
    }
    try {
      const me = await authApi.me();
      if (sessionCookies.refreshToken && sessionCookies.accessToken)
        sessionCookies.setSession({
          accessToken: sessionCookies.accessToken,
          refreshToken: sessionCookies.refreshToken,
          role: me.role,
          userId: me.id,
        });
      if (useActiveWorkspace.getState().ownerUserId !== me.id)
        useActiveWorkspace.getState().checkOut();
      setUser(me);
      setStatus("authenticated");
    } catch {
      sessionCookies.clear();
      clearPrivateState();
      setUser(null);
      setStatus("unauthenticated");
    }
  }, [clearPrivateState]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time session hydration on mount is the standard pattern here
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    return registerSessionExpiredHandler(() => {
      clearPrivateState();
      setUser(null);
      setStatus("unauthenticated");
      router.push("/login?reason=session-expired");
    });
  }, [router, clearPrivateState]);

  const login = useCallback(
    async (payload: LoginPayload) => {
      const tokens = await authApi.login(payload);
      clearPrivateState();
      // Stash the access token first so the /api/users/me call below (if
      // needed) is authenticated - the http client reads it from this cookie.
      sessionCookies.setAccessToken(tokens.accessToken);
      const me = tokens.user ?? (await authApi.me());
      sessionCookies.setSession({
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        role: me.role,
        userId: me.id,
      });
      setUser(me);
      setStatus("authenticated");
      return me;
    },
    [clearPrivateState],
  );

  const register = useCallback(
    async (payload: RegisterPayload) => {
      const tokens = await authApi.register(payload);
      clearPrivateState();
      sessionCookies.setTokens(tokens);
      const me = tokens.user ?? (await authApi.me());
      sessionCookies.setSession({ ...tokens, role: me.role, userId: me.id });
      setUser(me);
      setStatus("authenticated");
      return me;
    },
    [clearPrivateState],
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // best-effort; still clear local session
    }
    sessionCookies.clear();
    clearPrivateState();
    setUser(null);
    setStatus("unauthenticated");
    router.push("/login");
  }, [router, clearPrivateState]);

  const value = useMemo(
    () => ({ user, status, login, register, logout, refreshUser: hydrate }),
    [user, status, login, register, logout, hydrate],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export { roleHomePath };
