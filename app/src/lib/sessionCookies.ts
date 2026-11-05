import Cookies from "js-cookie";

// Cookie-based (not localStorage) so that Next.js middleware can read the
// session on the edge to guard /patient, /doctor, /hospital, /admin routes.
//
// SECURITY NOTE: because this SPA calls the API Gateway directly from the
// browser (no Next.js backend-for-frontend), the access/refresh tokens must
// be readable by client JS to attach Authorization headers, so they are
// **not** httpOnly. This mirrors localStorage-based JWT storage in terms of
// XSS exposure. For a hardened deployment, add a Next.js Route Handler that
// proxies API calls and stores tokens in httpOnly cookies instead - see
// README "Security hardening" section.

export const COOKIE_NAMES = {
  accessToken: "hp_at",
  refreshToken: "hp_rt",
  role: "hp_role",
  userId: "hp_uid",
} as const;

const COOKIE_OPTIONS: Cookies.CookieAttributes = {
  sameSite: "lax",
  secure:
    typeof window !== "undefined" && window.location.protocol === "https:",
  path: "/",
  expires: 7,
};

export const sessionCookies = {
  get accessToken() {
    return Cookies.get(COOKIE_NAMES.accessToken) || null;
  },
  get refreshToken() {
    return Cookies.get(COOKIE_NAMES.refreshToken) || null;
  },
  get role() {
    return Cookies.get(COOKIE_NAMES.role) || null;
  },
  get userId() {
    return Cookies.get(COOKIE_NAMES.userId) || null;
  },
  setSession(params: {
    accessToken: string;
    refreshToken: string;
    role: string;
    userId: string;
  }) {
    Cookies.set(COOKIE_NAMES.accessToken, params.accessToken, COOKIE_OPTIONS);
    Cookies.set(COOKIE_NAMES.refreshToken, params.refreshToken, COOKIE_OPTIONS);
    Cookies.set(COOKIE_NAMES.role, params.role, COOKIE_OPTIONS);
    Cookies.set(COOKIE_NAMES.userId, params.userId, COOKIE_OPTIONS);
  },
  setTokens(tokens: { accessToken: string; refreshToken: string }) {
    Cookies.set(COOKIE_NAMES.accessToken, tokens.accessToken, COOKIE_OPTIONS);
    Cookies.set(COOKIE_NAMES.refreshToken, tokens.refreshToken, COOKIE_OPTIONS);
  },
  setAccessToken(token: string) {
    Cookies.set(COOKIE_NAMES.accessToken, token, COOKIE_OPTIONS);
  },
  clear() {
    Object.values(COOKIE_NAMES).forEach((name) =>
      Cookies.remove(name, { path: "/" }),
    );
  },
};
