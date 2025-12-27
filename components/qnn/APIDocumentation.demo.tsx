/**
 * Demo/Test Page for API Documentation Component
 *
 * This file demonstrates how to integrate the APIDocumentation component
 * into your application. It can also be used for testing and development.
 *
 * Usage:
 * 1. Import this component in your routing setup
 * 2. Or copy the integration pattern shown here
 */

import APIDocumentation from './APIDocumentation';

export default function APIDocumentationDemo() {
  return (
    <div className="min-h-screen bg-background">
      {/* Page Header */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold">QNN API Documentation</h1>
          <p className="text-muted-foreground mt-2">
            Explore our comprehensive API reference with interactive examples
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <APIDocumentation />
      </div>

      {/* Footer */}
      <div className="border-t mt-12">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          <p>
            Need help? Contact our support team at{' '}
            <a href="mailto:support@ainative.com" className="text-purple-500 hover:underline">
              support@ainative.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Alternative: Minimal Integration
 *
 * For a simpler integration without the header/footer:
 */
export function APIDocumentationMinimal() {
  return (
    <div className="container mx-auto p-6">
      <APIDocumentation />
    </div>
  );
}

/**
 * Alternative: Dashboard Integration
 *
 * For integration within an existing dashboard layout:
 */
export function APIDocumentationDashboard() {
  return (
    <div className="space-y-6">
      {/* Dashboard content above */}
      <div className="bg-background rounded-lg border p-6">
        <APIDocumentation />
      </div>
      {/* Dashboard content below */}
    </div>
  );
}
