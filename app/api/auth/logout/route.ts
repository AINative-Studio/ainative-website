import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/**
 * Server-side logout route
 * Clears all auth cookies and redirects to login page
 */
export async function GET() {
  const cookieStore = await cookies();

  // Clear the SSO auth cookie
  cookieStore.delete('ainative_access_token');
  cookieStore.delete('ainative_user');

  // Clear NextAuth session cookies
  cookieStore.delete('next-auth.session-token');
  cookieStore.delete('next-auth.callback-url');
  cookieStore.delete('next-auth.csrf-token');
  cookieStore.delete('__Secure-next-auth.session-token');
  cookieStore.delete('__Secure-next-auth.callback-url');

  // Redirect to login page
  return NextResponse.redirect(new URL('/login', process.env.NEXTAUTH_URL || 'http://localhost:3000'));
}

export async function POST() {
  return GET();
}
