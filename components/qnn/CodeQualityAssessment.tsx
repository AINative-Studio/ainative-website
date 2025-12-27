import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  Code2,
  Upload,
  FileCode,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Download,
  Loader2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  BarChart3
} from 'lucide-react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip
} from 'recharts';
import {
  analyzeCodeMock,
  validateAnalysisRequest,
  formatApiError,
  type AnalysisResult,
  type CodeMetrics
} from '@/services/qnn/code-analysis';

// Types
interface LanguageOption {
  value: string;
  label: string;
  extension: string;
}

// Constants
const LANGUAGES: LanguageOption[] = [
  { value: 'python', label: 'Python', extension: 'py' },
  { value: 'javascript', label: 'JavaScript', extension: 'js' },
  { value: 'typescript', label: 'TypeScript', extension: 'ts' },
  { value: 'java', label: 'Java', extension: 'java' },
  { value: 'cpp', label: 'C++', extension: 'cpp' },
  { value: 'go', label: 'Go', extension: 'go' },
  { value: 'rust', label: 'Rust', extension: 'rs' },
];

const EXAMPLE_CODE: Record<string, string> = {
  python: `# Example Python function
def calculate_fibonacci(n: int) -> list[int]:
    """
    Calculate Fibonacci sequence up to n terms.

    Args:
        n: Number of terms to generate

    Returns:
        List of Fibonacci numbers
    """
    if n <= 0:
        return []
    elif n == 1:
        return [0]

    fib = [0, 1]
    for i in range(2, n):
        fib.append(fib[i-1] + fib[i-2])

    return fib

# Usage
result = calculate_fibonacci(10)
print(f"Fibonacci sequence: {result}")`,
  javascript: `// Example JavaScript class
class DataProcessor {
  constructor(data) {
    this.data = data;
    this.processed = false;
  }

  /**
   * Process the data and return results
   * @returns {Object} Processed results
   */
  process() {
    if (this.processed) {
      return this.results;
    }

    this.results = this.data
      .filter(item => item.isValid)
      .map(item => ({
        id: item.id,
        value: item.value * 2
      }));

    this.processed = true;
    return this.results;
  }
}`,
  typescript: `// Example TypeScript interface and function
interface User {
  id: string;
  name: string;
  email: string;
  age?: number;
}

/**
 * Validate user data
 * @param user - User object to validate
 * @returns True if valid, false otherwise
 */
function validateUser(user: User): boolean {
  if (!user.id || !user.name || !user.email) {
    return false;
  }

  const emailPattern = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
  return emailPattern.test(user.email);
}`,
};

export default function CodeQualityAssessment() {
  const [activeTab, setActiveTab] = useState('snippet');
  const [selectedLanguage, setSelectedLanguage] = useState('python');
  const [codeInput, setCodeInput] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedCode, setUploadedCode] = useState('');
  const [detectedLanguage, setDetectedLanguage] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showCode, setShowCode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Generate suggestions based on metrics
  const generateSuggestions = useCallback((metrics: CodeMetrics, language: string): string[] => {
    const suggestions: string[] = [];
    const commentRatio = metrics.comment_count / Math.max(metrics.line_count, 1);

    if (commentRatio < 0.1) {
      suggestions.push('Add more comments to improve code readability and maintainability');
    }

    if (metrics.avg_function_length > 20) {
      suggestions.push('Consider breaking down long functions into smaller, more focused functions');
    }

    if (metrics.function_count === 0 && metrics.line_count > 50) {
      suggestions.push('Organize code into functions for better structure and reusability');
    }

    if (metrics.class_count === 0 && metrics.line_count > 100) {
      suggestions.push('Consider using classes or modules to organize related functionality');
    }

    if (commentRatio > 0.5) {
      suggestions.push('Review excessive comments - ensure code is self-documenting where possible');
    }

    if (metrics.avg_function_length < 3 && metrics.function_count > 10) {
      suggestions.push('Some functions may be too granular - consider consolidating related logic');
    }

    return suggestions;
  }, []);

  // API call handler - uses mock implementation
  // Replace analyzeCodeMock with actual API call when backend is ready
  const analyzeCode = async (code: string, language: string): Promise<AnalysisResult> => {
    // Validate request before sending
    const validation = validateAnalysisRequest({ code, language });
    if (!validation.valid) {
      throw new Error(validation.errors.join('; '));
    }

    // Use mock implementation (replace with actual API call)
    return await analyzeCodeMock(code, language);

    // Example of actual API integration (uncomment when ready):
    // import { analyzeCode as apiAnalyzeCode } from '@/services/qnn/code-analysis';
    // return await apiAnalyzeCode({ code, language });
  };

  // Handle code analysis
  const handleAnalyze = async () => {
    const code = activeTab === 'snippet' ? codeInput : uploadedCode;
    const language = activeTab === 'snippet' ? selectedLanguage : detectedLanguage;

    if (!code.trim()) {
      setError('Please enter some code to analyze');
      return;
    }

    setError(null);
    setIsAnalyzing(true);

    try {
      const result = await analyzeCode(code, language);
      setAnalysisResult(result);
    } catch (err) {
      setError(formatApiError(err));
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadedFile(file);
    setError(null);

    // Detect language from extension
    const extension = file.name.split('.').pop()?.toLowerCase();
    const language = LANGUAGES.find(lang => lang.extension === extension);
    setDetectedLanguage(language?.value || 'python');

    // Read file content
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setUploadedCode(content);
    };
    reader.onerror = () => {
      setError('Failed to read file');
    };
    reader.readAsText(file);
  };

  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const file = e.dataTransfer.files?.[0];
    if (file) {
      const input = fileInputRef.current;
      if (input) {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        input.files = dataTransfer.files;
        handleFileUpload({ target: input } as any);
      }
    }
  };

  // Load example code
  const loadExample = () => {
    setCodeInput(EXAMPLE_CODE[selectedLanguage] || EXAMPLE_CODE.python);
  };

  // Export report
  const exportReport = () => {
    if (!analysisResult) return;

    const report = {
      timestamp: analysisResult.timestamp,
      language: analysisResult.language,
      quality_score: analysisResult.quality_score,
      metrics: analysisResult.features,
      suggestions: analysisResult.suggestions,
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `code-quality-report-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Get quality color
  const getQualityColor = (score: number): string => {
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Get quality background color
  const getQualityBg = (score: number): string => {
    if (score >= 0.8) return 'bg-green-500/10 border-green-500/20';
    if (score >= 0.6) return 'bg-yellow-500/10 border-yellow-500/20';
    return 'bg-red-500/10 border-red-500/20';
  };

  // Get quality label
  const getQualityLabel = (score: number): string => {
    if (score >= 0.8) return 'High Quality';
    if (score >= 0.6) return 'Medium Quality';
    return 'Needs Improvement';
  };

  // Prepare radar chart data
  const getRadarData = () => {
    if (!analysisResult?.normalized_features) return [];

    return [
      { metric: 'Code Size', value: analysisResult.normalized_features[0] * 100 },
      { metric: 'Comments', value: analysisResult.normalized_features[1] * 100 },
      { metric: 'Functions', value: analysisResult.normalized_features[2] * 100 },
      { metric: 'Classes', value: analysisResult.normalized_features[3] * 100 },
      { metric: 'Structure', value: analysisResult.normalized_features[4] * 100 },
      { metric: 'Quality', value: analysisResult.normalized_features[5] * 100 },
    ];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border border-primary/20 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-full bg-primary/10">
              <Code2 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle>Code Quality Assessment</CardTitle>
              <CardDescription>
                Analyze code quality using quantum neural networks for intelligent feature extraction
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="snippet" className="flex items-center gap-2">
            <FileCode className="h-4 w-4" />
            Analyze Code Snippet
          </TabsTrigger>
          <TabsTrigger value="file" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Analyze File
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Analyze Code Snippet */}
        <TabsContent value="snippet" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Enter Code Snippet</CardTitle>
              <CardDescription>
                Paste your code below or load an example to analyze its quality
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Language Selector */}
              <div className="flex items-end gap-4">
                <div className="flex-1">
                  <Label htmlFor="language">Programming Language</Label>
                  <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                    <SelectTrigger id="language">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LANGUAGES.map((lang) => (
                        <SelectItem key={lang.value} value={lang.value}>
                          {lang.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  variant="outline"
                  onClick={loadExample}
                  className="whitespace-nowrap"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Load Example
                </Button>
              </div>

              {/* Code Editor */}
              <div>
                <Label htmlFor="code">Code</Label>
                <Textarea
                  id="code"
                  value={codeInput}
                  onChange={(e) => setCodeInput(e.target.value)}
                  placeholder="// Enter your code here&#10;&#10;function example() {&#10;  console.log('Hello, world!');&#10;}"
                  className="font-mono text-sm min-h-[400px] resize-y"
                />
              </div>

              {/* Analyze Button */}
              <div className="flex items-center gap-4">
                <Button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || !codeInput.trim()}
                  className="bg-primary hover:bg-primary/90"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Analyze Code
                    </>
                  )}
                </Button>
                {codeInput.trim() && (
                  <span className="text-sm text-muted-foreground">
                    {codeInput.split('\n').filter(l => l.trim()).length} lines of code
                  </span>
                )}
              </div>

              {/* Error Display */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3"
                >
                  <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-red-900 dark:text-red-100">Analysis Error</p>
                    <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Analyze File */}
        <TabsContent value="file" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Upload Code File</CardTitle>
              <CardDescription>
                Upload a source code file for quality analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* File Upload Dropzone */}
              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className="border-2 border-dashed border-primary/20 rounded-lg p-8 text-center hover:border-primary/40 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={LANGUAGES.map(l => `.${l.extension}`).join(',')}
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-medium mb-2">
                  {uploadedFile ? uploadedFile.name : 'Drop a file here or click to browse'}
                </p>
                <p className="text-sm text-muted-foreground">
                  Supports: {LANGUAGES.map(l => l.extension.toUpperCase()).join(', ')}
                </p>
              </div>

              {/* Detected Language */}
              {uploadedFile && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-between p-4 bg-primary/5 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <FileCode className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Detected Language</p>
                      <p className="text-sm text-muted-foreground">
                        {LANGUAGES.find(l => l.value === detectedLanguage)?.label || 'Unknown'}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="font-mono">
                    .{LANGUAGES.find(l => l.value === detectedLanguage)?.extension}
                  </Badge>
                </motion.div>
              )}

              {/* Code Preview */}
              {uploadedCode && (
                <Collapsible open={showCode} onOpenChange={setShowCode}>
                  <CollapsibleTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                      <span className="flex items-center gap-2">
                        <FileCode className="h-4 w-4" />
                        View File Content
                      </span>
                      {showCode ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="mt-4 max-h-[300px] overflow-auto rounded-lg border">
                      <pre className="p-4 text-sm font-mono bg-muted/50">
                        {uploadedCode}
                      </pre>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              )}

              {/* Analyze Button */}
              <div className="flex items-center gap-4">
                <Button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || !uploadedCode}
                  className="bg-primary hover:bg-primary/90"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Analyze File
                    </>
                  )}
                </Button>
                {uploadedCode && (
                  <span className="text-sm text-muted-foreground">
                    {uploadedCode.split('\n').filter(l => l.trim()).length} lines of code
                  </span>
                )}
              </div>

              {/* Error Display */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3"
                >
                  <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-red-900 dark:text-red-100">Analysis Error</p>
                    <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Analysis Results */}
      <AnimatePresence>
        {analysisResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Quality Score Header */}
            <Card className={`border ${getQualityBg(analysisResult.quality_score)}`}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-3">
                      {analysisResult.quality_score >= 0.8 ? (
                        <CheckCircle2 className="h-8 w-8 text-green-600" />
                      ) : analysisResult.quality_score >= 0.6 ? (
                        <AlertCircle className="h-8 w-8 text-yellow-600" />
                      ) : (
                        <AlertCircle className="h-8 w-8 text-red-600" />
                      )}
                      <div>
                        <h3 className="text-2xl font-bold">
                          <span className={getQualityColor(analysisResult.quality_score)}>
                            {(analysisResult.quality_score * 100).toFixed(0)}%
                          </span>
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {getQualityLabel(analysisResult.quality_score)}
                        </p>
                      </div>
                    </div>
                    <Progress
                      value={analysisResult.quality_score * 100}
                      className="h-3"
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={exportReport}
                    className="ml-4"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export Report
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Metrics and Visualization Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Code Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Code Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Metric</TableHead>
                        <TableHead className="text-right">Value</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">File Size</TableCell>
                        <TableCell className="text-right font-mono">
                          {analysisResult.features.file_size_bytes} bytes
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Lines of Code</TableCell>
                        <TableCell className="text-right font-mono">
                          {analysisResult.features.line_count}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Comments</TableCell>
                        <TableCell className="text-right font-mono">
                          {analysisResult.features.comment_count}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Functions</TableCell>
                        <TableCell className="text-right font-mono">
                          {analysisResult.features.function_count}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Classes</TableCell>
                        <TableCell className="text-right font-mono">
                          {analysisResult.features.class_count}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Avg Function Length</TableCell>
                        <TableCell className="text-right font-mono">
                          {analysisResult.features.avg_function_length} lines
                        </TableCell>
                      </TableRow>
                      {analysisResult.features.comment_ratio !== undefined && (
                        <TableRow>
                          <TableCell className="font-medium">Comment Ratio</TableCell>
                          <TableCell className="text-right font-mono">
                            {(analysisResult.features.comment_ratio * 100).toFixed(1)}%
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Feature Vector Radar Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Feature Vector Visualization
                  </CardTitle>
                  <CardDescription>
                    Normalized code characteristics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RadarChart data={getRadarData()}>
                      <PolarGrid stroke="#e5e7eb" />
                      <PolarAngleAxis
                        dataKey="metric"
                        tick={{ fill: '#6b7280', fontSize: 12 }}
                      />
                      <PolarRadiusAxis
                        angle={90}
                        domain={[0, 100]}
                        tick={{ fill: '#6b7280', fontSize: 10 }}
                      />
                      <Radar
                        name="Code Features"
                        dataKey="value"
                        stroke="hsl(var(--primary))"
                        fill="hsl(var(--primary))"
                        fillOpacity={0.5}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          padding: '8px 12px',
                        }}
                        formatter={(value?: number) => `${(value ?? 0).toFixed(1)}%`}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Improvement Suggestions */}
            {analysisResult.suggestions && analysisResult.suggestions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Sparkles className="h-5 w-5" />
                    Improvement Suggestions
                  </CardTitle>
                  <CardDescription>
                    Recommendations to enhance code quality
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {analysisResult.suggestions.map((suggestion, index) => (
                      <motion.li
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg"
                      >
                        <div className="mt-0.5 flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-medium">
                          {index + 1}
                        </div>
                        <p className="text-sm leading-relaxed">{suggestion}</p>
                      </motion.li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* No Suggestions - High Quality */}
            {(!analysisResult.suggestions || analysisResult.suggestions.length === 0) && (
              <Card className="border-green-500/20 bg-green-500/5">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-8 w-8 text-green-600" />
                    <div>
                      <h3 className="font-semibold text-green-900 dark:text-green-100">
                        Excellent Code Quality!
                      </h3>
                      <p className="text-sm text-green-800 dark:text-green-200">
                        Your code follows best practices and maintains high quality standards.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
