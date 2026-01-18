'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Play, RefreshCw, Settings, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  StreamingProgress,
  ToolExecutionStatus,
  LongOperationIndicator,
  ErrorDisplay,
} from '@/components/ui/progress/';
import { useMockOperationProgress } from '@/hooks/useOperationProgress';
import { useProgressToast } from '@/hooks/useProgressToast';
import type { OperationProgress } from '@/types/progress';

export default function ProgressIndicatorsDemoClient() {
  const [activeDemo, setActiveDemo] = React.useState<string | null>(null);
  const [mockProgress, setMockProgress] = React.useState<OperationProgress | null>(null);
  const {
    showSuccessToast,
    showErrorToast,
    showWarningToast,
    showInfoToast,
    showProgressUpdateToast,
  } = useProgressToast();

  // Demo scenarios
  const scenarios = {
    quickOperation: {
      id: 'quick-op',
      name: 'Quick Operation (2s)',
      duration: 2000,
      steps: 3,
      type: 'api_call' as const,
    },
    normalOperation: {
      id: 'normal-op',
      name: 'Normal Operation (5s)',
      duration: 5000,
      steps: 5,
      type: 'tool_execution' as const,
    },
    longOperation: {
      id: 'long-op',
      name: 'Long Operation (10s)',
      duration: 10000,
      steps: 8,
      type: 'batch_processing' as const,
    },
    veryLongOperation: {
      id: 'very-long-op',
      name: 'Very Long Operation (65s)',
      duration: 65000,
      steps: 12,
      type: 'model_inference' as const,
    },
  };

  const runDemo = (scenarioKey: keyof typeof scenarios) => {
    const scenario = scenarios[scenarioKey];
    setActiveDemo(scenario.id);

    // Simulate operation with mock progress
    const startTime = Date.now();
    let currentStep = 0;

    const initialProgress: OperationProgress = {
      operationId: scenario.id,
      type: scenario.type,
      status: 'running',
      progress: 0,
      message: 'Starting operation...',
      startTime,
      totalSteps: scenario.steps,
      currentStep: 0,
      logs: [
        {
          timestamp: startTime,
          level: 'info',
          message: 'Operation initialized',
        },
      ],
    };

    setMockProgress(initialProgress);

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progressPercent = Math.min((elapsed / scenario.duration) * 100, 100);
      const newStep = Math.min(
        Math.floor((elapsed / scenario.duration) * scenario.steps),
        scenario.steps
      );

      if (newStep > currentStep) {
        currentStep = newStep;
      }

      setMockProgress((prev) => {
        if (!prev) return prev;

        const newLogs = [...prev.logs];
        if (newStep > prev.currentStep!) {
          newLogs.push({
            timestamp: Date.now(),
            level: 'info',
            message: `Completed step ${newStep} of ${scenario.steps}`,
          });
        }

        return {
          ...prev,
          progress: progressPercent,
          currentStep: newStep,
          message: `Processing step ${newStep} of ${scenario.steps}...`,
          estimatedTimeRemaining: scenario.duration - elapsed,
          logs: newLogs,
        };
      });

      if (elapsed >= scenario.duration) {
        clearInterval(interval);
        setMockProgress((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            status: 'success',
            progress: 100,
            currentStep: scenario.steps,
            message: 'Operation completed successfully',
            endTime: Date.now(),
            logs: [
              ...prev.logs,
              {
                timestamp: Date.now(),
                level: 'info',
                message: 'Operation completed',
              },
            ],
          };
        });

        showSuccessToast(
          scenario.id,
          'Operation Completed',
          `${scenario.name} finished successfully`,
          scenario.duration
        );
      }
    }, 100);
  };

  const simulateError = () => {
    const errorProgress: OperationProgress = {
      operationId: 'error-demo',
      type: 'api_call',
      status: 'error',
      progress: 45,
      message: 'Failed to connect to API endpoint',
      startTime: Date.now() - 5000,
      endTime: Date.now(),
      totalSteps: 5,
      currentStep: 2,
      logs: [
        {
          timestamp: Date.now() - 5000,
          level: 'info',
          message: 'Starting API call',
        },
        {
          timestamp: Date.now() - 3000,
          level: 'warn',
          message: 'Connection timeout detected',
        },
        {
          timestamp: Date.now(),
          level: 'error',
          message: 'Failed to establish connection',
        },
      ],
      error: {
        code: 'NETWORK_ERROR',
        message: 'Unable to connect to the API endpoint. Please check your network connection.',
        details: 'Connection timeout after 30 seconds',
        recoverable: true,
      },
      metadata: {
        endpoint: 'https://api.ainative.studio/v1/operations',
      },
    };

    setMockProgress(errorProgress);
    setActiveDemo('error-demo');

    showErrorToast(
      'error-demo',
      'Operation Failed',
      'Network error occurred. Click retry to try again.',
      () => runDemo('normalOperation')
    );
  };

  const demoToastNotifications = () => {
    showInfoToast('toast-demo-1', 'Processing 3/10 files...', 'Working on document batch');

    setTimeout(() => {
      showWarningToast(
        'toast-demo-2',
        'This is taking longer than usual...',
        'The operation is still running but may need attention'
      );
    }, 2000);

    setTimeout(() => {
      showSuccessToast('toast-demo-3', 'All files processed', undefined, 8500);
    }, 4000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 text-white">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <Badge className="mb-4 bg-blue-600 text-white">Live Demo</Badge>
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Streaming Progress Indicators
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Preventing "silent hanging" user experience with real-time operation feedback
          </p>
          <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-500">
            <Info className="h-4 w-4" />
            <span>Based on Gemini CLI issues #16985 & #16982</span>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Card className="p-6 bg-gray-900/50 border-gray-800">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Play className="h-5 w-5 text-blue-400" />
              Quick Demo Controls
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(scenarios).map(([key, scenario]) => (
                <Button
                  key={key}
                  variant="outline"
                  onClick={() => runDemo(key as keyof typeof scenarios)}
                  className="justify-start"
                  disabled={activeDemo === scenario.id && mockProgress?.status === 'running'}
                >
                  <Play className="h-4 w-4 mr-2" />
                  {scenario.name}
                </Button>
              ))}
              <Button
                variant="outline"
                onClick={simulateError}
                className="justify-start border-red-500/50 text-red-400 hover:bg-red-950/30"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Simulate Error
              </Button>
              <Button
                variant="outline"
                onClick={demoToastNotifications}
                className="justify-start border-purple-500/50 text-purple-400 hover:bg-purple-950/30"
              >
                <Settings className="h-4 w-4 mr-2" />
                Demo Toast Notifications
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* Main Demo Area */}
        <Tabs defaultValue="streaming" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-gray-900/50">
            <TabsTrigger value="streaming">Streaming Progress</TabsTrigger>
            <TabsTrigger value="tool">Tool Execution</TabsTrigger>
            <TabsTrigger value="long">Long Operation</TabsTrigger>
            <TabsTrigger value="error">Error Display</TabsTrigger>
          </TabsList>

          {/* Streaming Progress Tab */}
          <TabsContent value="streaming" className="space-y-6">
            <Card className="p-6 bg-gray-900/50 border-gray-800">
              <h3 className="text-xl font-semibold mb-4">StreamingProgress Component</h3>
              <p className="text-gray-400 mb-6">
                Real-time progress updates with logs, time estimates, and step tracking
              </p>

              {mockProgress && activeDemo && mockProgress.status === 'running' ? (
                <div className="space-y-4">
                  <StreamingProgress
                    operationId={activeDemo}
                    progress={mockProgress}
                    showLogs={true}
                    showEstimate={true}
                    onCancel={() => {
                      setActiveDemo(null);
                      setMockProgress(null);
                    }}
                  />

                  <div className="mt-4 p-4 rounded-md bg-blue-950/30 border border-blue-900/50">
                    <h4 className="text-sm font-semibold text-blue-300 mb-2">
                      Current State (for debugging)
                    </h4>
                    <pre className="text-xs text-gray-400 overflow-x-auto">
                      {JSON.stringify(
                        {
                          status: mockProgress.status,
                          progress: Math.round(mockProgress.progress),
                          step: `${mockProgress.currentStep}/${mockProgress.totalSteps}`,
                          message: mockProgress.message,
                        },
                        null,
                        2
                      )}
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <p>Click a demo button above to see the StreamingProgress component in action</p>
                </div>
              )}
            </Card>

            {/* Compact variant */}
            <Card className="p-6 bg-gray-900/50 border-gray-800">
              <h3 className="text-xl font-semibold mb-4">Compact Variant</h3>
              <p className="text-gray-400 mb-6">
                Minimal display suitable for status bars or inline indicators
              </p>

              {mockProgress && activeDemo ? (
                <StreamingProgress
                  operationId={activeDemo}
                  progress={mockProgress}
                  compact={true}
                  showLogs={false}
                />
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>Start a demo to see compact progress</p>
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Tool Execution Tab */}
          <TabsContent value="tool" className="space-y-6">
            <Card className="p-6 bg-gray-900/50 border-gray-800">
              <h3 className="text-xl font-semibold mb-4">ToolExecutionStatus Component</h3>
              <p className="text-gray-400 mb-6">
                Visual status for tool/command execution with auto-hide on success
              </p>

              {mockProgress && activeDemo ? (
                <ToolExecutionStatus
                  operationId={activeDemo}
                  toolName="Data Processing Tool"
                  progress={mockProgress}
                  showDetails={true}
                  autoHideOnSuccess={false}
                />
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <p>Start a demo to see tool execution status</p>
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Long Operation Tab */}
          <TabsContent value="long" className="space-y-6">
            <Card className="p-6 bg-gray-900/50 border-gray-800">
              <h3 className="text-xl font-semibold mb-4">LongOperationIndicator Component</h3>
              <p className="text-gray-400 mb-6">
                Fixed position indicator for operations taking 5+ seconds. Shows warning after 60s.
              </p>

              <div className="space-y-4">
                <div className="p-4 rounded-md bg-yellow-950/30 border border-yellow-900/50">
                  <p className="text-sm text-yellow-300">
                    <strong>Note:</strong> The LongOperationIndicator appears in the bottom-right
                    corner when an operation runs for more than 5 seconds. Try the "Very Long
                    Operation (65s)" demo to see the warning state.
                  </p>
                </div>

                <div className="text-center py-8">
                  <Button
                    onClick={() => runDemo('veryLongOperation')}
                    size="lg"
                    className="bg-blue-600 hover:bg-blue-700"
                    disabled={activeDemo === 'very-long-op' && mockProgress?.status === 'running'}
                  >
                    <Play className="h-5 w-5 mr-2" />
                    Run 65-Second Operation
                  </Button>
                </div>

                {mockProgress && activeDemo === 'very-long-op' && (
                  <LongOperationIndicator
                    operationId={activeDemo}
                    progress={mockProgress}
                    threshold={5000}
                    warningThreshold={60000}
                    showTimeElapsed={true}
                    showCancel={true}
                  />
                )}
              </div>
            </Card>
          </TabsContent>

          {/* Error Display Tab */}
          <TabsContent value="error" className="space-y-6">
            <Card className="p-6 bg-gray-900/50 border-gray-800">
              <h3 className="text-xl font-semibold mb-4">ErrorDisplay Component</h3>
              <p className="text-gray-400 mb-6">
                User-friendly error messages with actionable feedback and recovery options
              </p>

              <div className="space-y-4">
                <Button onClick={simulateError} variant="outline" className="mb-4">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Simulate Error Scenario
                </Button>

                {mockProgress?.status === 'error' && mockProgress.error && (
                  <ErrorDisplay
                    error={mockProgress.error}
                    operation={{
                      operationId: mockProgress.operationId,
                      type: mockProgress.type,
                      message: mockProgress.message,
                    }}
                    showStack={true}
                    showRetry={true}
                    onRetry={() => {
                      runDemo('normalOperation');
                    }}
                    onDismiss={() => {
                      setMockProgress(null);
                      setActiveDemo(null);
                    }}
                  />
                )}

                {(!mockProgress || mockProgress.status !== 'error') && (
                  <div className="text-center py-12 text-gray-500">
                    <p>Click "Simulate Error Scenario" to see error handling</p>
                  </div>
                )}
              </div>
            </Card>

            {/* Error Types Examples */}
            <Card className="p-6 bg-gray-900/50 border-gray-800">
              <h3 className="text-xl font-semibold mb-4">Error Type Examples</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    code: 'NETWORK_ERROR',
                    message: 'Connection failed',
                    recoverable: true,
                  },
                  {
                    code: 'AUTH_FAILED',
                    message: 'Authentication required',
                    recoverable: true,
                  },
                  {
                    code: 'RATE_LIMIT',
                    message: 'Too many requests',
                    recoverable: true,
                  },
                  {
                    code: 'CRITICAL_ERROR',
                    message: 'System failure',
                    recoverable: false,
                  },
                ].map((errorType) => (
                  <Button
                    key={errorType.code}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const errorProgress: OperationProgress = {
                        operationId: `error-${errorType.code}`,
                        type: 'api_call',
                        status: 'error',
                        progress: 30,
                        message: 'Operation failed',
                        startTime: Date.now() - 3000,
                        endTime: Date.now(),
                        totalSteps: 5,
                        currentStep: 2,
                        logs: [
                          {
                            timestamp: Date.now(),
                            level: 'error',
                            message: errorType.message,
                          },
                        ],
                        error: {
                          code: errorType.code,
                          message: errorType.message,
                          recoverable: errorType.recoverable,
                        },
                      };
                      setMockProgress(errorProgress);
                      setActiveDemo(`error-${errorType.code}`);
                    }}
                  >
                    {errorType.code}
                  </Button>
                ))}
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Accessibility Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-12"
        >
          <Card className="p-6 bg-gray-900/50 border-gray-800">
            <h2 className="text-xl font-semibold mb-4">Accessibility Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-semibold text-blue-400 mb-2">ARIA Live Regions</h3>
                <p className="text-sm text-gray-400">
                  All progress components use <code className="text-blue-300">aria-live</code> for
                  screen reader announcements
                </p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-blue-400 mb-2">Keyboard Navigation</h3>
                <p className="text-sm text-gray-400">
                  All interactive elements are keyboard accessible with proper focus management
                </p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-blue-400 mb-2">Color Contrast</h3>
                <p className="text-sm text-gray-400">
                  Color-blind friendly status indicators with WCAG AA compliant contrast ratios
                </p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-blue-400 mb-2">Semantic HTML</h3>
                <p className="text-sm text-gray-400">
                  Proper use of <code className="text-blue-300">role</code>,{' '}
                  <code className="text-blue-300">aria-label</code>, and semantic elements
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
