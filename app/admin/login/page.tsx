/**
 * Admin Login Page - Server Component
 *
 * Phase 1 - Priority Pages
 * Issue #479: Migrate Admin Dashboard to Next.js
 *
 * TODO: Implement AdminLoginClient component
 * - Email/password authentication
 * - Admin role verification
 * - Error handling
 * - Loading states
 * - Redirect logic
 */

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Login',
  description: 'Administrator login portal - AINative Studio',
  robots: 'noindex, nofollow', // Prevent search indexing for security
};

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center px-4">
      <div className="text-center text-white">
        <h1 className="text-3xl font-bold mb-4">Admin Login</h1>
        <p className="text-gray-400 mb-8">Component implementation pending...</p>
        <p className="text-sm text-gray-500">
          See: docs/admin/component-specs-priority1.md
        </p>
      </div>
    </div>
  );
}
