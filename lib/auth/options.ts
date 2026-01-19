import { NextAuthOptions } from 'next-auth';
import GitHubProvider from 'next-auth/providers/github';
import CredentialsProvider from 'next-auth/providers/credentials';

/**
 * NextAuth Configuration with Cross-Subdomain SSO Support
 *
 * This configuration enables OAuth login with GitHub and supports
 * session sharing across all *.ainative.studio subdomains.
 *
 * Key Features:
 * - GitHub OAuth with automatic token refresh
 * - Cross-subdomain session cookies
 * - CSRF protection
 * - Secure cookie settings (httpOnly, sameSite, secure)
 * - Token rotation for enhanced security
 */

const isProd = process.env.NODE_ENV === 'production';
const isDev = process.env.NODE_ENV === 'development';

export const authOptions: NextAuthOptions = {
  // OAuth Providers
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID ?? '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET ?? '',
      // Request additional scopes for GitHub API access
      authorization: {
        params: {
          scope: 'read:user user:email',
        },
      },
    }),
    // Credentials provider for email/password (for migration/fallback)
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // TODO: Replace with actual database lookup via API call
        // In production, validate against backend API
        try {
          const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.ainative.studio';
          const response = await fetch(`${apiUrl}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });

          if (!response.ok) {
            return null;
          }

          const user = await response.json();
          return user;
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      },
    }),
  ],

  // Session Configuration
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // Update session every 24 hours
  },

  // JWT Configuration
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  // Custom Pages
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
    verifyRequest: '/auth/verify-request',
    newUser: '/dashboard',
  },

  // Callbacks for session/token management
  callbacks: {
    /**
     * JWT Callback - Add custom claims to token
     * This runs whenever a JWT is created or updated
     */
    async jwt({ token, user, account, trigger }) {
      // Initial sign in
      if (user) {
        token.id = user.id;
        token.role = user.role || 'user';
      }

      // OAuth sign in - store access token for API calls
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.provider = account.provider;
        token.expiresAt = account.expires_at;
      }

      // Token refresh logic for GitHub OAuth
      if (token.provider === 'github' && token.expiresAt) {
        const expiresAt = token.expiresAt as number;
        const now = Math.floor(Date.now() / 1000);

        // Refresh token 5 minutes before expiration
        if (now > expiresAt - 300 && token.refreshToken) {
          try {
            const response = await fetch('https://github.com/login/oauth/access_token', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
              },
              body: JSON.stringify({
                client_id: process.env.GITHUB_CLIENT_ID,
                client_secret: process.env.GITHUB_CLIENT_SECRET,
                grant_type: 'refresh_token',
                refresh_token: token.refreshToken,
              }),
            });

            const refreshedTokens = await response.json();

            if (!response.ok) {
              throw refreshedTokens;
            }

            token.accessToken = refreshedTokens.access_token;
            token.expiresAt = Math.floor(Date.now() / 1000) + refreshedTokens.expires_in;

            if (refreshedTokens.refresh_token) {
              token.refreshToken = refreshedTokens.refresh_token;
            }
          } catch (error) {
            console.error('Token refresh failed:', error);
            // Return token as-is, user will be prompted to re-authenticate
            token.error = 'RefreshAccessTokenError';
          }
        }
      }

      return token;
    },

    /**
     * Session Callback - Expose token data to client
     * This runs whenever getSession() or useSession() is called
     */
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.accessToken = token.accessToken as string;

        // Don't expose error to client, but log it
        if (token.error) {
          console.error('Session has token error:', token.error);
        }
      }
      return session;
    },

    /**
     * Redirect Callback - Control where users are sent after auth
     * Supports cross-subdomain redirects within *.ainative.studio
     */
    async redirect({ url, baseUrl }) {
      // Allow relative URLs
      if (url.startsWith('/')) return `${baseUrl}${url}`;

      // Allow same origin redirects
      const urlObj = new URL(url);
      const baseUrlObj = new URL(baseUrl);

      // Allow redirects to any *.ainative.studio subdomain
      if (urlObj.hostname.endsWith('.ainative.studio') ||
          urlObj.hostname === 'ainative.studio') {
        return url;
      }

      // Allow same origin
      if (urlObj.origin === baseUrlObj.origin) {
        return url;
      }

      // Default redirect to dashboard
      return `${baseUrl}/dashboard`;
    },

    /**
     * SignIn Callback - Control whether sign in is allowed
     * Can be used to implement allowlists, blocklists, etc.
     */
    async signIn({ user, account, profile }) {
      // Allow all sign ins for now
      // TODO: Implement custom sign-in logic (email verification, allowlist, etc.)
      return true;
    },
  },

  // Cookie Configuration for Cross-Subdomain SSO
  cookies: {
    sessionToken: {
      name: isProd ? '__Secure-next-auth.session-token' : 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        // Cross-subdomain cookie - works for all *.ainative.studio domains
        domain: isProd ? '.ainative.studio' : undefined,
        secure: isProd, // Only send over HTTPS in production
      },
    },
    callbackUrl: {
      name: isProd ? '__Secure-next-auth.callback-url' : 'next-auth.callback-url',
      options: {
        sameSite: 'lax',
        path: '/',
        domain: isProd ? '.ainative.studio' : undefined,
        secure: isProd,
      },
    },
    csrfToken: {
      name: isProd ? '__Host-next-auth.csrf-token' : 'next-auth.csrf-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: isProd,
      },
    },
  },

  // Events - Log auth activity for monitoring
  events: {
    async signIn({ user, account, profile, isNewUser }) {
      console.log('[AUTH] Sign in:', {
        userId: user.id,
        provider: account?.provider,
        isNewUser,
      });
    },
    async signOut({ session, token }) {
      console.log('[AUTH] Sign out:', { userId: token?.id });
    },
    async createUser({ user }) {
      console.log('[AUTH] User created:', { userId: user.id });
    },
    async linkAccount({ user, account, profile }) {
      console.log('[AUTH] Account linked:', {
        userId: user.id,
        provider: account.provider,
      });
    },
  },

  // Security
  useSecureCookies: isProd,

  // Debug mode in development
  debug: isDev,
};
