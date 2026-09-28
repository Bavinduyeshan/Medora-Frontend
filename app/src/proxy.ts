import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const ROLE_PREFIX: Record<string, string> = {
  PATIENT: '/patient',
  DOCTOR: '/doctor',
  HOSPITAL_ADMIN: '/hospital',
  RECEPTIONIST: '/hospital',
  LAB_TECHNICIAN: '/hospital',
  ADMIN: '/admin',
};

const GUARDED_PREFIXES = ['/patient', '/doctor', '/hospital', '/admin'];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isGuarded = GUARDED_PREFIXES.some((p) => pathname.startsWith(p));
  if (!isGuarded) return NextResponse.next();

  const accessToken = request.cookies.get('hp_at')?.value;
  const role = request.cookies.get('hp_role')?.value;

  if (!accessToken || !role) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  const allowedPrefix = ROLE_PREFIX[role];
  if (allowedPrefix && !pathname.startsWith(allowedPrefix)) {
    return NextResponse.redirect(new URL(allowedPrefix, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/patient/:path*', '/doctor/:path*', '/hospital/:path*', '/admin/:path*'],
};
