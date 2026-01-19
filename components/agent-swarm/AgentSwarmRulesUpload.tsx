'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, CheckCircle, XCircle, AlertCircle, Download, Eye, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import apiClient from '@/lib/api-client';

interface Rule {
  id: string;
  name: string;
  category: string;
  content: string;
  enabled: boolean;
  created_at: string;
}

interface RulesFile {
  id: string;
  filename: string;
  content: string;
  parsed_rules: Rule[];
  uploaded_at: string;
  status: 'pending' | 'validated' | 'active' | 'error';
}

const DEFAULT_RULES_TEMPLATE = `# Agent Swarm Custom Rules
# This file defines custom rules and guidelines for your agent swarm project

## Coding Standards
- Language: TypeScript, Python, Go
- Style Guide: Airbnb (JavaScript), PEP 8 (Python), Effective Go
- Formatting: Prettier, Black, gofmt

## Testing Requirements
- Methodology: TDD/BDD (Given/When/Then)
- Coverage: Minimum 80% code coverage
- No Mocks: Use real API calls and database connections
- Test Types: Unit, Integration, E2E tests required

## Architecture Patterns
- Backend: Microservices with API Gateway
- Frontend: Component-based architecture
- Database: ZeroDB as primary data store
- Authentication: JWT-based auth with refresh tokens

## Data Services
- All data operations MUST use ZeroDB APIs
- Use UnifiedDatabaseService for CRUD operations
- Use VectorService for embeddings and semantic search
- Use MemoryService for caching and sessions

## Security Requirements
- Input validation on all endpoints
- SQL injection prevention (parameterized queries)
- XSS protection (sanitize user input)
- CSRF protection for state-changing operations
- Rate limiting on public endpoints

## Performance Requirements
- API response time: < 200ms (p95)
- Database queries: < 50ms (p95)
- Page load time: < 2 seconds
- Lighthouse score: > 90

## Documentation
- JSDoc/docstrings for all public functions
- README.md with setup instructions
- API documentation (OpenAPI/Swagger)
- Architecture diagrams (Mermaid/PlantUML)

## Git Workflow
- Branch naming: feature/*, bugfix/*, hotfix/*
- Commit messages: Conventional Commits format
- Pull requests: Required for all changes
- Code review: At least 1 approval required

## Deployment
- CI/CD: GitHub Actions or Railway
- Environments: dev, staging, production
- Container: Docker with multi-stage builds
- Orchestration: Kubernetes or Railway

## Custom Project Rules
# Add your project-specific rules below:

`;

export function AgentSwarmRulesUpload() {
  const [uploadedFiles, setUploadedFiles] = useState<RulesFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<RulesFile | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!file.name.endsWith('.md') && !file.name.endsWith('.txt')) {
      alert('Please upload a Markdown (.md) or Text (.txt) file');
      return;
    }

    setIsUploading(true);

    try {
      const content = await file.text();

      // Upload to backend for validation
      const response = await apiClient.post<RulesFile>('/v1/public/agent-swarms/rules/upload', {
        filename: file.name,
        content: content
      });

      const rulesFile: RulesFile = response.data;
      setUploadedFiles(prev => [rulesFile, ...prev]);

      alert('Rules file uploaded and validated successfully!');
    } catch (error: unknown) {
      console.error('Failed to upload rules file:', error);
      const errorMessage = error instanceof Error
        ? error.message
        : 'Unknown error';
      alert(`Upload failed: ${errorMessage}`);
    } finally {
      setIsUploading(false);
    }
  };

  const downloadTemplate = () => {
    const blob = new Blob([DEFAULT_RULES_TEMPLATE], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'agent-swarm-rules-template.md';
    a.click();
    URL.revokeObjectURL(url);
  };

  const activateRules = async (fileId: string) => {
    try {
      await apiClient.post(`/v1/public/agent-swarms/rules/${fileId}/activate`);

      setUploadedFiles(prev => prev.map(file =>
        file.id === fileId
          ? { ...file, status: 'active' }
          : { ...file, status: file.status === 'active' ? 'validated' : file.status }
      ));

      alert('Rules activated! All new agent swarm projects will use these rules.');
    } catch {
      alert('Failed to activate rules');
    }
  };

  const deleteRules = async (fileId: string) => {
    if (!confirm('Are you sure you want to delete this rules file?')) return;

    try {
      await apiClient.delete(`/v1/public/agent-swarms/rules/${fileId}`);
      setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
    } catch {
      alert('Failed to delete rules file');
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-[#161B22] border-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Custom Agent Swarm Rules
          </CardTitle>
          <CardDescription>
            Upload a custom rules file to enforce your coding standards, testing requirements, and architectural patterns across all agent-generated code.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="upload">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upload">Upload Rules</TabsTrigger>
              <TabsTrigger value="manage">Manage Rules</TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="space-y-4">
              {/* Download Template Button */}
              <div className="flex justify-end">
                <Button
                  onClick={downloadTemplate}
                  variant="outline"
                  className="border-gray-700"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Template
                </Button>
              </div>

              {/* Upload Area */}
              <div
                className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                  dragActive
                    ? 'border-primary bg-primary/10'
                    : 'border-gray-700 hover:border-gray-600'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />

                {isUploading ? (
                  <div className="space-y-2">
                    <div className="w-8 h-8 mx-auto border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-gray-400">Uploading and validating...</p>
                  </div>
                ) : (
                  <>
                    <p className="text-lg font-medium mb-2">
                      Drag & drop your rules file here
                    </p>
                    <p className="text-sm text-gray-400 mb-4">
                      Supports .md and .txt files
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      accept=".md,.txt"
                      onChange={handleFileSelect}
                    />
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-gradient-to-r from-primary to-[#FCAE39]"
                    >
                      Select File
                    </Button>
                  </>
                )}
              </div>

              {/* Rules Format Guide */}
              <Card className="bg-vite-bg border-gray-800">
                <CardHeader>
                  <CardTitle className="text-sm">Rules File Format</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-gray-400">
                  <p>Your rules file should be in Markdown format with the following sections:</p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li><strong>Coding Standards</strong>: Language, style guide, formatting</li>
                    <li><strong>Testing Requirements</strong>: TDD/BDD, coverage, no mocks policy</li>
                    <li><strong>Architecture Patterns</strong>: Backend, frontend, database choices</li>
                    <li><strong>Data Services</strong>: ZeroDB API usage requirements</li>
                    <li><strong>Security Requirements</strong>: Input validation, auth, rate limiting</li>
                    <li><strong>Performance Requirements</strong>: Response times, benchmarks</li>
                    <li><strong>Documentation</strong>: Required docs and formats</li>
                    <li><strong>Git Workflow</strong>: Branch naming, commit format</li>
                    <li><strong>Deployment</strong>: CI/CD, environments, containers</li>
                  </ul>
                  <p className="mt-4">
                    <AlertCircle className="w-4 h-4 inline mr-1" />
                    Download the template above to see a complete example.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="manage" className="space-y-4">
              {uploadedFiles.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No rules files uploaded yet</p>
                  <p className="text-sm mt-2">Upload a rules file to get started</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {uploadedFiles.map((file) => (
                    <motion.div
                      key={file.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-vite-bg border border-gray-800 rounded-lg p-4"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <FileText className="w-5 h-5 text-primary" />
                            <h3 className="font-medium">{file.filename}</h3>
                            <StatusBadge status={file.status} />
                          </div>
                          <p className="text-sm text-gray-400 mt-1">
                            Uploaded {new Date(file.uploaded_at).toLocaleDateString()} • {file.parsed_rules.length} rules
                          </p>

                          {file.status === 'active' && (
                            <p className="text-sm text-green-500 mt-2 flex items-center gap-1">
                              <CheckCircle className="w-4 h-4" />
                              Active rules applied to all new projects
                            </p>
                          )}
                        </div>

                        <div className="flex gap-2">
                          <Button
                            onClick={() => {
                              setSelectedFile(file);
                              setShowPreview(true);
                            }}
                            variant="outline"
                            size="sm"
                            className="border-gray-700"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>

                          {file.status !== 'active' && (
                            <Button
                              onClick={() => activateRules(file.id)}
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                            >
                              Activate
                            </Button>
                          )}

                          <Button
                            onClick={() => deleteRules(file.id)}
                            variant="outline"
                            size="sm"
                            className="border-red-800 text-red-500 hover:bg-red-900/20"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Parsed Rules Summary */}
                      {file.parsed_rules.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-800">
                          <p className="text-sm font-medium mb-2">Detected Rules:</p>
                          <div className="grid grid-cols-2 gap-2">
                            {file.parsed_rules.slice(0, 6).map((rule) => (
                              <div key={rule.id} className="text-xs bg-gray-800/50 rounded px-2 py-1">
                                <span className="text-gray-500">{rule.category}:</span> {rule.name}
                              </div>
                            ))}
                          </div>
                          {file.parsed_rules.length > 6 && (
                            <p className="text-xs text-gray-500 mt-2">
                              +{file.parsed_rules.length - 6} more rules
                            </p>
                          )}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Preview Modal */}
      <AnimatePresence>
        {showPreview && selectedFile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
            onClick={() => setShowPreview(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-[#161B22] border border-gray-800 rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b border-gray-800 flex justify-between items-center">
                <h2 className="font-bold">{selectedFile.filename}</h2>
                <Button
                  onClick={() => setShowPreview(false)}
                  variant="outline"
                  size="sm"
                >
                  Close
                </Button>
              </div>
              <div className="p-6 overflow-y-auto max-h-[calc(80vh-80px)]">
                <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono">
                  {selectedFile.content}
                </pre>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatusBadge({ status }: { status: RulesFile['status'] }) {
  const config = {
    pending: { color: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30', icon: AlertCircle, label: 'Validating' },
    validated: { color: 'bg-blue-500/20 text-blue-500 border-blue-500/30', icon: CheckCircle, label: 'Validated' },
    active: { color: 'bg-green-500/20 text-green-500 border-green-500/30', icon: CheckCircle, label: 'Active' },
    error: { color: 'bg-red-500/20 text-red-500 border-red-500/30', icon: XCircle, label: 'Error' },
  };

  const { color, icon: Icon, label } = config[status];

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs border ${color}`}>
      <Icon className="w-3 h-3" />
      {label}
    </span>
  );
}
