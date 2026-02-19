'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Play,
  Trash2,
  CheckCircle,
  XCircle,
  Loader2,
  Code,
  Terminal,
  Clock,
  Cpu,
  History,
  Send,
  Copy,
  FileJson,
  Settings,
  AlertCircle,
} from 'lucide-react';
import sandboxService, {
  SandboxEnvironment,
  Sandbox,
  ExecutionResult,
  ExecutionRequest,
} from '@/lib/sandbox-service';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const stagger = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};


const sampleCode: Record<string, string> = {
  'python-3.11': `# Python AI Example
import json

def analyze_sentiment(text):
    """Simple sentiment analyzer"""
    positive_words = ['good', 'great', 'excellent', 'amazing', 'wonderful']
    negative_words = ['bad', 'terrible', 'awful', 'poor', 'horrible']

    text_lower = text.lower()
    pos_count = sum(word in text_lower for word in positive_words)
    neg_count = sum(word in text_lower for word in negative_words)

    if pos_count > neg_count:
        return {"sentiment": "positive", "score": pos_count - neg_count}
    elif neg_count > pos_count:
        return {"sentiment": "negative", "score": neg_count - pos_count}
    else:
        return {"sentiment": "neutral", "score": 0}

# Test the function
text = "This is a great and excellent product!"
result = analyze_sentiment(text)
print(json.dumps(result, indent=2))`,

  'node-20': `// Node.js AI Example
const analyzeText = (text) => {
  const words = text.toLowerCase().split(/\\s+/);
  const wordCount = words.length;
  const uniqueWords = new Set(words).size;
  const avgWordLength = words.reduce((sum, w) => sum + w.length, 0) / wordCount;

  return {
    wordCount,
    uniqueWords,
    diversity: (uniqueWords / wordCount).toFixed(2),
    avgWordLength: avgWordLength.toFixed(2)
  };
};

// Test the function
const text = "AI Native Studio provides powerful tools for AI development";
const result = analyzeText(text);
console.log(JSON.stringify(result, null, 2));`,

  'rust-1.75': `// Rust Performance Example
use std::time::Instant;

fn fibonacci(n: u64) -> u64 {
    match n {
        0 => 0,
        1 => 1,
        _ => fibonacci(n - 1) + fibonacci(n - 2),
    }
}

fn main() {
    let start = Instant::now();
    let n = 20;
    let result = fibonacci(n);
    let duration = start.elapsed();

    println!("{{");
    println!("  \\"n\\": {},", n);
    println!("  \\"result\\": {},", result);
    println!("  \\"time_ms\\": {}", duration.as_millis());
    println!("}}");
}`,
};

const httpMethods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

export default function APISandboxClient() {
  const queryClient = useQueryClient();
  const [userEmail, setUserEmail] = useState<string>('anonymous');

  const [selectedEnvironment, setSelectedEnvironment] = useState<string>('python-3.11');
  const [currentSandbox, setCurrentSandbox] = useState<Sandbox | null>(null);
  const [code, setCode] = useState<string>(sampleCode['python-3.11']);
  const [executionResults, setExecutionResults] = useState<ExecutionResult[]>([]);

  // Get user email from localStorage after mount
  useEffect(() => {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        setUserEmail(user.email || 'anonymous');
      }
    } catch {
      // Ignore parse errors
    }
  }, []);

  // Request builder state
  const [httpMethod, setHttpMethod] = useState<string>('POST');
  const [endpoint, setEndpoint] = useState<string>('/v1/completions');
  const [requestHeaders, setRequestHeaders] = useState<string>('{\n  "Content-Type": "application/json"\n}');
  const [requestBody, setRequestBody] = useState<string>('{\n  "model": "gpt-4",\n  "messages": []\n}');

  // Fetch environments
  const {
    data: environments,
    isLoading: isLoadingEnvironments,
    error: environmentsError,
    isError: isEnvironmentsError
  } = useQuery({
    queryKey: ['sandbox-environments'],
    queryFn: () => sandboxService.listEnvironments(),
    retry: 2,
  });

  // Create sandbox mutation
  const createSandboxMutation = useMutation({
    mutationFn: (environmentId: string) => sandboxService.createSandbox({
      environmentId,
      name: `Sandbox ${new Date().toLocaleTimeString()}`,
    }),
    onSuccess: (data) => {
      setCurrentSandbox(data);
      queryClient.invalidateQueries({ queryKey: ['sandboxes'] });
    },
    onError: (error: Error) => {
      console.error('Failed to create sandbox:', error);
      setCurrentSandbox(null);
    },
  });

  // Execute code mutation
  const executeCodeMutation = useMutation({
    mutationFn: (request: ExecutionRequest) => {
      if (!currentSandbox) {
        throw new Error('No active sandbox');
      }
      return sandboxService.execute(currentSandbox.id, request);
    },
    onSuccess: (result) => {
      setExecutionResults((prev) => [result, ...prev].slice(0, 10));
    },
    onError: (error: Error) => {
      console.error('Failed to execute code:', error);
      // Add failed execution to results for visibility
      const errorResult: ExecutionResult = {
        executionId: `error-${Date.now()}`,
        status: 'failed',
        error: error.message || 'Execution failed',
        exitCode: 1,
        executionTime: 0,
        timestamp: new Date().toISOString(),
      };
      setExecutionResults((prev) => [errorResult, ...prev].slice(0, 10));
    },
  });

  // Delete sandbox mutation
  const deleteSandboxMutation = useMutation({
    mutationFn: (sandboxId: string) => sandboxService.deleteSandbox(sandboxId),
    onSuccess: () => {
      setCurrentSandbox(null);
      setExecutionResults([]);
      queryClient.invalidateQueries({ queryKey: ['sandboxes'] });
    },
    onError: (error: Error) => {
      console.error('Failed to delete sandbox:', error);
    },
  });

  const handleEnvironmentChange = (envId: string) => {
    setSelectedEnvironment(envId);
    setCode(sampleCode[envId] || '// Start coding here...');

    // Create new sandbox for the selected environment
    if (currentSandbox) {
      deleteSandboxMutation.mutate(currentSandbox.id);
    }
    createSandboxMutation.mutate(envId);
  };

  const handleExecute = () => {
    executeCodeMutation.mutate({ code });
  };

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const getStatusIcon = (status: ExecutionResult['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'running':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case 'timeout':
        return <Clock className="h-4 w-4 text-orange-500" />;
    }
  };

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="visible"
      className="container mx-auto p-6 space-y-6"
    >
      {/* Header */}
      <motion.div variants={fadeUp}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Terminal className="h-8 w-8 text-primary" />
              API Sandbox
            </h1>
            <p className="text-muted-foreground mt-2">
              Test and experiment with AI Native APIs in a secure sandbox environment
            </p>
          </div>

          {currentSandbox && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => deleteSandboxMutation.mutate(currentSandbox.id)}
              disabled={deleteSandboxMutation.isPending}
            >
              {deleteSandboxMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Delete Sandbox
            </Button>
          )}
        </div>
      </motion.div>

      {/* Environment Selector */}
      <motion.div variants={fadeUp}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Environment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {/* Error state for environments */}
              {isEnvironmentsError && (
                <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-destructive mb-1">
                        Failed to Load Environments
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {environmentsError instanceof Error
                          ? environmentsError.message
                          : 'Unable to connect to the sandbox service. Please try again later.'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Error state for sandbox creation */}
              {createSandboxMutation.isError && (
                <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-destructive mb-1">
                        Failed to Create Sandbox
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {createSandboxMutation.error instanceof Error
                          ? createSandboxMutation.error.message
                          : 'Unable to create sandbox environment. Please try again.'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid gap-2">
                <Label htmlFor="environment">Select Environment</Label>
                {isLoadingEnvironments ? (
                  <div className="flex items-center justify-center h-10 rounded-md border bg-muted/50">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    <span className="ml-2 text-sm text-muted-foreground">
                      Loading environments...
                    </span>
                  </div>
                ) : (
                  <Select
                    value={selectedEnvironment}
                    onValueChange={handleEnvironmentChange}
                    disabled={isLoadingEnvironments || createSandboxMutation.isPending || isEnvironmentsError}
                  >
                    <SelectTrigger id="environment">
                      <SelectValue placeholder="Select environment..." />
                    </SelectTrigger>
                    <SelectContent>
                      {environments?.map((env) => (
                        <SelectItem key={env.id} value={env.id}>
                          <div className="flex items-center gap-2">
                            <Code className="h-4 w-4" />
                            <div>
                              <div className="font-medium">{env.name}</div>
                              <div className="text-xs text-muted-foreground">
                                {env.description}
                              </div>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {createSandboxMutation.isPending && (
                <div className="rounded-lg border p-3 bg-blue-500/10 border-blue-500/30">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                    <span className="text-sm font-medium">Creating sandbox...</span>
                  </div>
                </div>
              )}

              {currentSandbox && !createSandboxMutation.isPending && (
                <div className="rounded-lg border p-3 bg-muted/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-sm font-medium">Sandbox Active</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      ID: {currentSandbox.id.slice(0, 8)}...
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Code Editor */}
        <motion.div variants={fadeUp}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  Code Editor
                </div>
                <Button
                  onClick={handleExecute}
                  disabled={
                    !currentSandbox ||
                    executeCodeMutation.isPending ||
                    !code.trim()
                  }
                  size="sm"
                >
                  {executeCodeMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Play className="h-4 w-4 mr-2" />
                  )}
                  Execute
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Write your code here..."
                className="min-h-[400px] font-mono text-sm"
                disabled={!currentSandbox}
              />
            </CardContent>
          </Card>
        </motion.div>

        {/* Response Viewer */}
        <motion.div variants={fadeUp}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileJson className="h-5 w-5" />
                Response
              </CardTitle>
            </CardHeader>
            <CardContent>
              {executionResults.length > 0 ? (
                <div className="space-y-4">
                  {executionResults[0] && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(executionResults[0].status)}
                          <span className="text-sm font-medium capitalize">
                            {executionResults[0].status}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopyToClipboard(
                            executionResults[0].output || executionResults[0].error || ''
                          )}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="rounded-lg border bg-muted/50 p-3 space-y-2">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Clock className="h-3 w-3" />
                            {executionResults[0].executionTime.toFixed(2)}ms
                          </div>
                          {executionResults[0].memoryUsed && (
                            <div className="flex items-center gap-2">
                              <Cpu className="h-3 w-3" />
                              {executionResults[0].memoryUsed.toFixed(2)}MB
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="rounded-lg border bg-black/5 dark:bg-white/5 p-4 overflow-x-auto">
                        <pre className="text-xs font-mono">
                          {executionResults[0].status === 'failed'
                            ? executionResults[0].error
                            : executionResults[0].output}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center h-[400px] text-muted-foreground">
                  <div className="text-center space-y-2">
                    <Terminal className="h-12 w-12 mx-auto opacity-20" />
                    <p className="text-sm">No execution results yet</p>
                    <p className="text-xs">Run code to see output</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Request Builder */}
      <motion.div variants={fadeUp}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              HTTP Request Builder
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="grid grid-cols-4 gap-4">
                <div className="col-span-1">
                  <Label htmlFor="method">Method</Label>
                  <Select value={httpMethod} onValueChange={setHttpMethod}>
                    <SelectTrigger id="method">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {httpMethods.map((method) => (
                        <SelectItem key={method} value={method}>
                          {method}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-3">
                  <Label htmlFor="endpoint">Endpoint</Label>
                  <Input
                    id="endpoint"
                    value={endpoint}
                    onChange={(e) => setEndpoint(e.target.value)}
                    placeholder="/v1/completions"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="headers">Headers (JSON)</Label>
                  <Textarea
                    id="headers"
                    value={requestHeaders}
                    onChange={(e) => setRequestHeaders(e.target.value)}
                    className="font-mono text-sm h-32"
                  />
                </div>
                <div>
                  <Label htmlFor="body">Body (JSON)</Label>
                  <Textarea
                    id="body"
                    value={requestBody}
                    onChange={(e) => setRequestBody(e.target.value)}
                    className="font-mono text-sm h-32"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Execution History */}
      {executionResults.length > 1 && (
        <motion.div variants={fadeUp}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Execution History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {executionResults.slice(1).map((result, index) => (
                  <div
                    key={result.executionId}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {getStatusIcon(result.status)}
                      <div className="text-sm">
                        <div className="font-medium">
                          Execution #{executionResults.length - index - 1}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(result.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {result.executionTime.toFixed(2)}ms
                      </div>
                      {result.memoryUsed && (
                        <div className="flex items-center gap-1">
                          <Cpu className="h-3 w-3" />
                          {result.memoryUsed.toFixed(2)}MB
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}
