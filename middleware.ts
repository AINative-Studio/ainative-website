import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Cookie name for SSO token (must match authCookies.ts)
const AUTH_COOKIE_NAME = 'ainative_access_token';

// Routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/account',
  '/plan',
  '/billing',
  '/purchase-credits',
  '/profile',
  '/settings',
  '/notifications',
  '/credit-history',
  '/refills',
  '/developer-settings',
];

// Routes that should redirect to dashboard if already authenticated
const authRoutes = ['/login', '/signup'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the path is a protected route
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Check if the path is an auth route
  const isAuthRoute = authRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Get the auth token from our custom SSO cookie
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;

  // Redirect unauthenticated users from protected routes to login
  if (isProtectedRoute && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users from auth routes to dashboard
  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/account/:path*',
    '/plan/:path*',
    '/billing/:path*',
    '/purchase-credits/:path*',
    '/profile/:path*',
    '/settings/:path*',
    '/notifications/:path*',
    '/credit-history/:path*',
    '/refills/:path*',
    '/developer-settings/:path*',
    '/login',
    '/signup',
  ],
};
