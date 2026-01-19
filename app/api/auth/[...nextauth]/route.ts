import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { withRateLimit } from '@/middleware/rateLimit';

const handler = NextAuth(authOptions);

// Apply rate limiting to auth endpoints (5 requests/minute)
export const GET = withRateLimit(handler, { tier: 'auth' });
export const POST = withRateLimit(handler, { tier: 'auth' });
