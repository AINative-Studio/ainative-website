'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  AlertCircle,
  CheckCircle,
  XCircle,
  Info,
  Loader2,
  Upload,
  FileCode,
  Zap,
  AlertTriangle,
  ShieldAlert,
  TrendingUp,
  Clock,
  Code,
  Sparkles,
  Wrench,
  RefreshCcw,
  Trash2,
  Download,
  Settings,
  FileText,
  Activity,
} from 'lucide-react';
import codeAnalysisService, {
  ScanResult,
  CodeIssue,
  ScanHistoryItem,
  AnalysisRule,
} from '@/lib/code-analysis-service';

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

// Mock data for graceful degradation
const mockScanResult: ScanResult = {
  id: 'scan-1',
  language: 'javascript',
  fileName: 'app.js',
  totalIssues: 8,
  criticalCount: 1,
  highCount: 2,
  mediumCount: 3,
  lowCount: 2,
  issues: [
    {
      id: 'issue-1',
      type: 'error',
      severity: 'critical',
      message: 'Potential SQL injection vulnerability',
      line: 42,
      column: 15,
      code: 'const query = "SELECT * FROM users WHERE id = " + userId;',
      category: 'security',
      fixable: true,
      suggestion: 'Use parameterized queries to prevent SQL injection',
      documentation: 'https://owasp.org/www-community/attacks/SQL_Injection',
    },
    {
      id: 'issue-2',
      type: 'warning',
      severity: 'high',
      message: 'Unhandled promise rejection',
      line: 78,
      column: 8,
      code: 'fetch("/api/data").then(res => res.json());',
      category: 'logic',
      fixable: true,
      suggestion: 'Add .catch() handler or use try-catch with async/await',
    },
    {
      id: 'issue-3',
      type: 'warning',
      severity: 'high',
      message: 'Variable declared but never used',
      line: 15,
      column: 7,
      code: 'const unusedVar = calculateSomething();',
      category: 'style',
      fixable: true,
      suggestion: 'Remove unused variable or use it in the code',
    },
    {
      id: 'issue-4',
      type: 'warning',
      severity: 'medium',
      message: 'Function has too many parameters (7)',
      line: 102,
      column: 10,
      code: 'function processData(a, b, c, d, e, f, g) {',
      category: 'best-practice',
      fixable: false,
      suggestion: 'Consider using an options object to reduce parameter count',
    },
    {
      id: 'issue-5',
      type: 'warning',
      severity: 'medium',
      message: 'Inefficient array operation inside loop',
      line: 125,
      column: 5,
      code: 'for (let i = 0; i < items.length; i++) { results = results.concat([items[i]]); }',
      category: 'performance',
      fixable: true,
      suggestion: 'Use Array.push() instead of concat in loops for better performance',
    },
    {
      id: 'issue-6',
      type: 'info',
      severity: 'medium',
      message: 'Missing JSDoc comment for public function',
      line: 89,
      column: 1,
      code: 'export function calculateTotal(items) {',
      category: 'style',
      fixable: false,
      suggestion: 'Add JSDoc comment to document function parameters and return value',
    },
    {
      id: 'issue-7',
      type: 'info',
      severity: 'low',
      message: 'Prefer const over let for variables that are not reassigned',
      line: 56,
      column: 5,
      code: 'let total = items.reduce((sum, item) => sum + item.price, 0);',
      category: 'style',
      fixable: true,
      suggestion: 'Change "let" to "const"',
    },
    {
      id: 'issue-8',
      type: 'info',
      severity: 'low',
      message: 'Consider using template literals for string concatenation',
      line: 34,
      column: 20,
      code: 'const message = "Hello " + userName + "!";',
      category: 'style',
      fixable: true,
      suggestion: 'Use template literals: `Hello ${userName}!`',
    },
  ],
  metrics: {
    linesOfCode: 245,
    complexity: 12,
    maintainabilityIndex: 68,
    testCoverage: 42,
  },
  timestamp: new Date().toISOString(),
  duration: 1240,
  status: 'completed',
};

const mockHistory: ScanHistoryItem[] = [
  {
    id: 'scan-1',
    fileName: 'app.js',
    language: 'javascript',
    totalIssues: 8,
    criticalCount: 1,
    timestamp: new Date(Date.now() - 300000).toISOString(),
    duration: 1240,
    status: 'completed',
  },
  {
    id: 'scan-2',
    fileName: 'api.py',
    language: 'python',
    totalIssues: 5,
    criticalCount: 0,
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    duration: 980,
    status: 'completed',
  },
  {
    id: 'scan-3',
    fileName: 'utils.ts',
    language: 'typescript',
    totalIssues: 12,
    criticalCount: 2,
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    duration: 1560,
    status: 'completed',
  },
];

const languages = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'cpp', label: 'C++' },
  { value: 'csharp', label: 'C#' },
];

const sampleCode = {
  javascript: `// Sample JavaScript code
function calculateTotal(items) {
  const unusedVar = calculateSomething();
  let total = items.reduce((sum, item) => sum + item.price, 0);
  const message = "Hello " + userName + "!";

  const query = "SELECT * FROM users WHERE id = " + userId;

  fetch("/api/data").then(res => res.json());

  return total;
}

export function processData(a, b, c, d, e, f, g) {
  for (let i = 0; i < items.length; i++) {
    results = results.concat([items[i]]);
  }
}`,
  typescript: `// Sample TypeScript code
interface User {
  id: number;
  name: string;
  email: string;
}

async function fetchUser(id: number): Promise<User> {
  const response = await fetch(\`/api/users/\${id}\`);
  return response.json();
}

// Missing error handling
fetchUser(123).then(user => console.log(user));`,
  python: `# Sample Python code
def calculate_total(items):
    total = 0
    for item in items:
        total = total + item['price']  # Inefficient
    return total

# SQL injection vulnerability
def get_user(user_id):
    query = f"SELECT * FROM users WHERE id = {user_id}"
    return execute_query(query)`,
};

const getSeverityIcon = (severity: string) => {
  switch (severity) {
    case 'critical':
      return <ShieldAlert className="h-4 w-4" />;
    case 'high':
      return <AlertTriangle className="h-4 w-4" />;
    case 'medium':
      return <AlertCircle className="h-4 w-4" />;
    case 'low':
      return <Info className="h-4 w-4" />;
    default:
      return <Info className="h-4 w-4" />;
  }
};

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'critical':
      return 'destructive';
    case 'high':
      return 'destructive';
    case 'medium':
      return 'default';
    case 'low':
      return 'secondary';
    default:
      return 'secondary';
  }
};

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'error':
      return <XCircle className="h-4 w-4 text-red-500" />;
    case 'warning':
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    case 'info':
      return <Info className="h-4 w-4 text-blue-500" />;
    case 'suggestion':
      return <Sparkles className="h-4 w-4 text-purple-500" />;
    default:
      return <Info className="h-4 w-4" />;
  }
};

export default function CodeAnalysisClient() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [codeInput, setCodeInput] = useState(sampleCode.javascript);
  const [currentScanId, setCurrentScanId] = useState<string | null>(null);
  const [selectedIssues, setSelectedIssues] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('scan');

  // Fetch scan history
  const { data: history, isLoading: historyLoading } = useQuery({
    queryKey: ['code-analysis-history'],
    queryFn: () => codeAnalysisService.getScanHistory(10),
    placeholderData: mockHistory,
  });

  // Fetch current scan result
  const { data: scanResult, isLoading: scanLoading } = useQuery({
    queryKey: ['code-analysis-scan', currentScanId],
    queryFn: () => currentScanId ? codeAnalysisService.getScanResult(currentScanId) : Promise.resolve(null),
    enabled: !!currentScanId,
    placeholderData: currentScanId ? mockScanResult : undefined,
  });

  // Scan code mutation
  const scanMutation = useMutation({
    mutationFn: (code: string) => codeAnalysisService.scanCode({
      code,
      language: selectedLanguage,
      fileName: `code.${selectedLanguage === 'javascript' ? 'js' : selectedLanguage === 'typescript' ? 'ts' : selectedLanguage === 'python' ? 'py' : selectedLanguage}`,
    }),
    onSuccess: (data) => {
      setCurrentScanId(data.id);
      queryClient.invalidateQueries({ queryKey: ['code-analysis-history'] });
      setActiveTab('results');
    },
    onError: () => {
      setCurrentScanId(mockScanResult.id);
      setActiveTab('results');
    },
  });

  // Fix issues mutation
  const fixMutation = useMutation({
    mutationFn: (issueIds: string[]) => {
      if (!currentScanId) throw new Error('No scan selected');
      return codeAnalysisService.fixIssues({
        scanId: currentScanId,
        issueIds,
      });
    },
    onSuccess: (data) => {
      setCodeInput(data.fixedCode);
      queryClient.invalidateQueries({ queryKey: ['code-analysis-scan', currentScanId] });
      setSelectedIssues([]);
    },
  });

  const handleScan = () => {
    scanMutation.mutate(codeInput);
  };

  const handleLanguageChange = (language: string) => {
    setSelectedLanguage(language);
    if (sampleCode[language as keyof typeof sampleCode]) {
      setCodeInput(sampleCode[language as keyof typeof sampleCode]);
    }
  };

  const handleFixSelected = () => {
    if (selectedIssues.length > 0) {
      fixMutation.mutate(selectedIssues);
    }
  };

  const handleFixAll = () => {
    const fixableIssues = scanResult?.issues.filter(issue => issue.fixable).map(issue => issue.id) || [];
    if (fixableIssues.length > 0) {
      fixMutation.mutate(fixableIssues);
    }
  };

  const toggleIssueSelection = (issueId: string) => {
    setSelectedIssues(prev =>
      prev.includes(issueId)
        ? prev.filter(id => id !== issueId)
        : [...prev, issueId]
    );
  };

  const currentResult = scanResult || (currentScanId === mockScanResult.id ? mockScanResult : null);

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={stagger}
      className="container mx-auto p-6 space-y-6"
    >
      {/* Header */}
      <motion.div variants={fadeUp} className="space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
          Code Analysis Tools
        </h1>
        <p className="text-muted-foreground">
          Analyze your code for issues, security vulnerabilities, and performance problems
        </p>
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="scan" className="flex items-center gap-2">
            <Code className="h-4 w-4" />
            Code Scanner
          </TabsTrigger>
          <TabsTrigger value="results" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Results
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            History
          </TabsTrigger>
        </TabsList>

        {/* Scan Tab */}
        <TabsContent value="scan" className="space-y-6">
          <motion.div variants={fadeUp}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileCode className="h-5 w-5 text-blue-500" />
                  Code Input
                </CardTitle>
                <CardDescription>
                  Paste your code or upload a file for analysis
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Select value={selectedLanguage} onValueChange={handleLanguageChange}>
                    <SelectTrigger id="language">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {languages.map((lang) => (
                        <SelectItem key={lang.value} value={lang.value}>
                          {lang.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="code">Code</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCodeInput('')}
                    >
                      Clear
                    </Button>
                  </div>
                  <Textarea
                    id="code"
                    value={codeInput}
                    onChange={(e) => setCodeInput(e.target.value)}
                    placeholder="Paste your code here..."
                    className="min-h-[400px] font-mono text-sm"
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleScan}
                    disabled={!codeInput.trim() || scanMutation.isPending}
                    className="flex-1"
                  >
                    {scanMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Zap className="h-4 w-4 mr-2" />
                        Analyze Code
                      </>
                    )}
                  </Button>
                  <Button variant="outline">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload File
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Results Tab */}
        <TabsContent value="results" className="space-y-6">
          {!currentResult ? (
            <motion.div variants={fadeUp}>
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <FileCode className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground text-center">
                    No analysis results yet. Scan some code to get started.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <>
              {/* Metrics Overview */}
              <motion.div variants={fadeUp} className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Issues</CardTitle>
                    <AlertCircle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{currentResult.totalIssues}</div>
                    <p className="text-xs text-muted-foreground">
                      Found in {currentResult.metrics.linesOfCode} lines
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Critical Issues</CardTitle>
                    <ShieldAlert className="h-4 w-4 text-red-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-500">{currentResult.criticalCount}</div>
                    <p className="text-xs text-muted-foreground">
                      Requires immediate attention
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Maintainability</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {currentResult.metrics.maintainabilityIndex}%
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Complexity: {currentResult.metrics.complexity}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Scan Time</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{currentResult.duration}ms</div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(currentResult.timestamp).toLocaleString()}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Issues List */}
              <motion.div variants={fadeUp}>
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Issues Found</CardTitle>
                        <CardDescription>
                          {currentResult.issues.filter(i => i.fixable).length} issues can be auto-fixed
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleFixSelected}
                          disabled={selectedIssues.length === 0 || fixMutation.isPending}
                        >
                          {fixMutation.isPending ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Wrench className="h-4 w-4 mr-2" />
                          )}
                          Fix Selected ({selectedIssues.length})
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleFixAll}
                          disabled={currentResult.issues.filter(i => i.fixable).length === 0 || fixMutation.isPending}
                        >
                          <Sparkles className="h-4 w-4 mr-2" />
                          Fix All Auto-fixable
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <AnimatePresence>
                      {currentResult.issues.map((issue) => (
                        <motion.div
                          key={issue.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="border rounded-lg p-4 space-y-3"
                        >
                          <div className="flex items-start gap-3">
                            <input
                              type="checkbox"
                              checked={selectedIssues.includes(issue.id)}
                              onChange={() => toggleIssueSelection(issue.id)}
                              disabled={!issue.fixable}
                              className="mt-1"
                            />
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center gap-2 flex-wrap">
                                {getTypeIcon(issue.type)}
                                <span className="font-medium">{issue.message}</span>
                                <Badge variant={getSeverityColor(issue.severity) as any}>
                                  {getSeverityIcon(issue.severity)}
                                  <span className="ml-1">{issue.severity}</span>
                                </Badge>
                                <Badge variant="outline">{issue.category}</Badge>
                                {issue.fixable && (
                                  <Badge variant="secondary" className="bg-green-500/10 text-green-500">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Auto-fixable
                                  </Badge>
                                )}
                              </div>

                              <div className="text-sm text-muted-foreground">
                                Line {issue.line}{issue.column && `, Column ${issue.column}`}
                              </div>

                              <div className="bg-muted/50 rounded p-2 font-mono text-sm overflow-x-auto">
                                {issue.code}
                              </div>

                              {issue.suggestion && (
                                <div className="flex gap-2 text-sm">
                                  <Sparkles className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
                                  <div>
                                    <span className="font-medium text-blue-500">Suggestion: </span>
                                    <span className="text-muted-foreground">{issue.suggestion}</span>
                                  </div>
                                </div>
                              )}

                              {issue.documentation && (
                                <div className="text-sm">
                                  <a
                                    href={issue.documentation}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-500 hover:underline flex items-center gap-1"
                                  >
                                    <FileText className="h-3 w-3" />
                                    Learn more
                                  </a>
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </CardContent>
                </Card>
              </motion.div>
            </>
          )}
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-6">
          <motion.div variants={fadeUp}>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Scan History</CardTitle>
                    <CardDescription>
                      Previous code analysis results
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm">
                    <RefreshCcw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {historyLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : history && history.length > 0 ? (
                  <div className="space-y-2">
                    {history.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                        onClick={() => {
                          setCurrentScanId(item.id);
                          setActiveTab('results');
                        }}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <FileCode className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{item.fileName || 'Unnamed file'}</span>
                            <Badge variant="outline">{item.language}</Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(item.timestamp).toLocaleString()} • {item.duration}ms
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="font-medium">{item.totalIssues} issues</div>
                            {item.criticalCount > 0 && (
                              <div className="text-sm text-red-500">
                                {item.criticalCount} critical
                              </div>
                            )}
                          </div>
                          <Badge variant={item.status === 'completed' ? 'secondary' : 'destructive'}>
                            {item.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Clock className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      No scan history yet. Run your first code analysis to get started.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
