import NextAuth, { DefaultSession, DefaultUser } from 'next-auth';
import { JWT as DefaultJWT } from 'next-auth/jwt';

declare module 'next-auth' {
  /**
   * Extended session interface with custom user properties
   * Supports cross-subdomain SSO across *.ainative.studio
   */
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      image?: string;
      role: string;
    } & DefaultSession['user'];
    accessToken?: string;
    error?: string;
  }

  /**
   * Extended user interface with custom properties
   */
  interface User extends DefaultUser {
    id: string;
    role?: string;
    email: string;
    name: string;
    image?: string;
  }
}

declare module 'next-auth/jwt' {
  /**
   * Extended JWT token interface with custom claims
   * Includes OAuth token refresh fields
   */
  interface JWT extends DefaultJWT {
    id: string;
    role: string;
    accessToken?: string;
    refreshToken?: string;
    provider?: string;
    expiresAt?: number;
    error?: string;
  }
}
