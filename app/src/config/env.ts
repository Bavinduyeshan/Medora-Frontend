export const env = {
  apiBaseUrl: (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080').replace(/\/+$/, ''),
  apiTimeoutMs: Number(process.env.NEXT_PUBLIC_API_TIMEOUT_MS) || 15000,
  appName: process.env.NEXT_PUBLIC_APP_NAME || 'Medora',
};