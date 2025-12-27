import React, { Component, ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

class QNNErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('QNN Error Boundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });

    // Log error to error reporting service (e.g., Sentry)
    // logErrorToService(error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  handleGoHome = () => {
    window.location.href = '/dashboard';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
          <Card className="max-w-2xl w-full border border-red-500/20 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader className="text-center">
              <div className="inline-flex p-4 rounded-full bg-red-500/10 mb-4 mx-auto">
                <AlertCircle className="h-12 w-12 text-red-600" />
              </div>
              <CardTitle className="text-2xl mb-2">Something Went Wrong</CardTitle>
              <CardDescription className="text-base">
                The QNN Dashboard encountered an unexpected error
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert className="border-red-500/20 bg-red-500/5">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription>
                  {this.state.error?.message || 'An unexpected error occurred'}
                </AlertDescription>
              </Alert>

              {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
                <details className="bg-gray-100 dark:bg-gray-900 rounded-lg p-4 text-sm">
                  <summary className="cursor-pointer font-semibold text-gray-800 dark:text-white mb-2">
                    Error Details (Development Only)
                  </summary>
                  <div className="space-y-2 text-xs">
                    <div>
                      <p className="font-semibold text-gray-700 dark:text-gray-300">Error Stack:</p>
                      <pre className="mt-1 overflow-x-auto bg-white dark:bg-gray-800 p-2 rounded text-red-600">
                        {this.state.error?.stack}
                      </pre>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-700 dark:text-gray-300">Component Stack:</p>
                      <pre className="mt-1 overflow-x-auto bg-white dark:bg-gray-800 p-2 rounded text-gray-600 dark:text-gray-400">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  </div>
                </details>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={this.handleReset}
                  className="flex-1 bg-primary hover:bg-primary/90 text-white"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Try Again
                </Button>
                <Button
                  onClick={this.handleGoHome}
                  variant="outline"
                  className="flex-1"
                >
                  <Home className="mr-2 h-4 w-4" />
                  Go to Dashboard
                </Button>
              </div>

              <div className="text-center text-sm text-gray-600 dark:text-gray-300">
                <p>If this problem persists, please contact support.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default QNNErrorBoundary;
