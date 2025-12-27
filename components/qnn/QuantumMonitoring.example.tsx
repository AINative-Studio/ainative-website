/**
 * Example usage of the Quantum System Monitoring Dashboard
 * This file demonstrates various ways to integrate and customize the component
 */

import QuantumMonitoring from './QuantumMonitoring';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Example 1: Basic usage
export function BasicMonitoringExample() {
  return (
    <div className="container mx-auto p-6">
      <QuantumMonitoring />
    </div>
  );
}

// Example 2: With custom header
export function MonitoringWithHeaderExample() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Custom header */}
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">QNN Operations Center</CardTitle>
          <CardDescription>
            Monitor and manage quantum computing resources in real-time
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Monitoring dashboard */}
      <QuantumMonitoring />
    </div>
  );
}

// Example 3: In a tabbed interface
export function TabbedMonitoringExample() {
  return (
    <div className="container mx-auto p-6">
      <Tabs defaultValue="monitoring" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
          <TabsTrigger value="jobs">Jobs</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="monitoring" className="mt-6">
          <QuantumMonitoring />
        </TabsContent>

        <TabsContent value="jobs">
          <Card>
            <CardHeader>
              <CardTitle>Job Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Job management interface...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Analytics dashboard...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Configuration settings...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Example 4: With error boundary
import { Component, ReactNode } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class MonitoringErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Monitoring dashboard error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="container mx-auto p-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-3">
                <p className="font-medium">Failed to load monitoring dashboard</p>
                <p className="text-sm">{this.state.error?.message}</p>
                <Button
                  variant="outline"
                  onClick={() => window.location.reload()}
                >
                  Reload Page
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      );
    }

    return this.props.children;
  }
}

export function MonitoringWithErrorBoundaryExample() {
  return (
    <MonitoringErrorBoundary>
      <div className="container mx-auto p-6">
        <QuantumMonitoring />
      </div>
    </MonitoringErrorBoundary>
  );
}

// Example 5: With custom styling
export function CustomStyledMonitoringExample() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="container mx-auto p-6">
        <div className="mb-6 p-6 rounded-lg border border-primary/20 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Quantum System Monitor
          </h1>
          <p className="text-muted-foreground">
            Real-time insights into your quantum computing infrastructure
          </p>
        </div>
        <QuantumMonitoring />
      </div>
    </div>
  );
}

// Example 6: Minimal layout
export function MinimalMonitoringExample() {
  return <QuantumMonitoring />;
}

// Example 7: Full-page dashboard
export function FullPageMonitoringExample() {
  return (
    <div className="flex flex-col h-screen">
      {/* Top navigation bar */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 flex">
            <a className="mr-6 flex items-center space-x-2" href="/">
              <span className="font-bold">QNN Monitoring</span>
            </a>
          </div>
        </div>
      </header>

      {/* Main content area with scroll */}
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto p-6">
          <QuantumMonitoring />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-4">
        <div className="container text-center text-sm text-muted-foreground">
          AINative Studio - Quantum Neural Network Platform
        </div>
      </footer>
    </div>
  );
}

// Example 8: With Next.js App Router
// In Next.js, routing is file-based. Place QuantumMonitoring in:
// - app/dashboard/page.tsx
// - app/monitoring/page.tsx
// - app/system-health/page.tsx
// Each page would simply import and render: <QuantumMonitoring />

// Example 9: Conditional rendering based on user role
export function RoleBasedMonitoringExample() {
  // This would typically come from authentication context
  const userRole = 'admin'; // or 'user', 'viewer', etc.

  if (userRole !== 'admin' && userRole !== 'operator') {
    return (
      <div className="container mx-auto p-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You don't have permission to view the monitoring dashboard.
            Please contact your administrator.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <QuantumMonitoring />
    </div>
  );
}

// Example 10: With lazy loading
import { lazy, Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const LazyQuantumMonitoring = lazy(() => import('./QuantumMonitoring'));

function MonitoringLoadingSkeleton() {
  return (
    <div className="space-y-6 p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-3">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function LazyLoadedMonitoringExample() {
  return (
    <div className="container mx-auto">
      <Suspense fallback={<MonitoringLoadingSkeleton />}>
        <LazyQuantumMonitoring />
      </Suspense>
    </div>
  );
}

// Export all examples
export default {
  BasicMonitoringExample,
  MonitoringWithHeaderExample,
  TabbedMonitoringExample,
  MonitoringWithErrorBoundaryExample,
  CustomStyledMonitoringExample,
  MinimalMonitoringExample,
  FullPageMonitoringExample,
  RoleBasedMonitoringExample,
  LazyLoadedMonitoringExample,
};
