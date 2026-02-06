'use client';

import * as React from 'react';
import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  X,
  Eye,
  EyeOff,
  Pencil,
  File,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

interface PRDUploadStepProps {
  onComplete: (prdContent: string) => void;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes
const ACCEPTED_FILE_TYPES = ['.pdf', '.md', '.txt', '.docx'];

export default function PRDUploadStep({ onComplete }: PRDUploadStepProps) {
  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload');
  const [prdContent, setPrdContent] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return `File size exceeds 10MB limit. Your file is ${(file.size / (1024 * 1024)).toFixed(2)}MB`;
    }

    // Check file type
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!ACCEPTED_FILE_TYPES.includes(fileExtension)) {
      return `File type not supported. Please upload ${ACCEPTED_FILE_TYPES.join(', ')} files only`;
    }

    return null;
  };

  const parseFileContent = async (file: File): Promise<string> => {
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();

    if (fileExtension === '.txt' || fileExtension === '.md') {
      return await file.text();
    } else if (fileExtension === '.pdf') {
      // For PDF parsing, we'd normally use a library like pdf-parse
      // For now, show a placeholder message
      return `[PDF file uploaded: ${file.name}]\n\nNote: PDF content parsing requires server-side processing. Please use the paste method for now, or the backend will process this file.`;
    } else if (fileExtension === '.docx') {
      // For DOCX parsing, we'd normally use a library like mammoth
      return `[DOCX file uploaded: ${file.name}]\n\nNote: DOCX content parsing requires server-side processing. Please use the paste method for now, or the backend will process this file.`;
    }

    return '';
  };

  const processFile = async (file: File) => {
    setError(null);
    const validationError = validateFile(file);

    if (validationError) {
      setError(validationError);
      return;
    }

    setIsProcessing(true);
    setUploadedFile(file);

    try {
      const content = await parseFileContent(file);
      setPrdContent(content);
    } catch (err) {
      setError('Failed to parse file content. Please try again or use the paste method.');
      console.error('File parsing error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      await processFile(files[0]);
    }
  }, []);

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await processFile(files[0]);
    }
  };

  const removeFile = () => {
    setUploadedFile(null);
    setPrdContent('');
    setError(null);
  };

  const handleContinue = () => {
    if (prdContent.trim()) {
      onComplete(prdContent);
    }
  };

  const wordCount = prdContent.trim().split(/\s+/).filter(Boolean).length;
  const charCount = prdContent.length;
  const lineCount = prdContent.split('\n').length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-4xl mx-auto"
    >
      <Card className="bg-[#161B22] border-[#2D333B]">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#4B6FED]/10">
              <FileText className="h-6 w-6 text-[#8AB4FF]" />
            </div>
            <div>
              <CardTitle className="text-2xl text-white">Upload Product Requirements</CardTitle>
              <CardDescription className="text-gray-400 mt-1">
                Upload your PRD document or paste the content directly
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'upload' | 'paste')}>
            <TabsList className="grid w-full grid-cols-2 bg-[#0D1117] border border-[#2D333B]">
              <TabsTrigger
                value="upload"
                className="data-[state=active]:bg-[#4B6FED] data-[state=active]:text-white"
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload File
              </TabsTrigger>
              <TabsTrigger
                value="paste"
                className="data-[state=active]:bg-[#4B6FED] data-[state=active]:text-white"
              >
                <Pencil className="mr-2 h-4 w-4" />
                Paste Content
              </TabsTrigger>
            </TabsList>

            {/* Upload Tab */}
            <TabsContent value="upload" className="space-y-4 mt-6">
              {uploadedFile ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <Alert className="bg-green-500/10 border-green-500/30">
                    <CheckCircle2 className="h-5 w-5 text-green-400" />
                    <AlertTitle className="text-green-400">File Uploaded Successfully</AlertTitle>
                    <AlertDescription className="space-y-3">
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2">
                          <File className="h-4 w-4 text-gray-400" />
                          <span className="text-white font-medium">{uploadedFile.name}</span>
                          <Badge className="bg-[#4B6FED]/20 text-[#8AB4FF] border-[#4B6FED]/30">
                            {(uploadedFile.size / 1024).toFixed(2)} KB
                          </Badge>
                        </div>
                        <Button
                          onClick={removeFile}
                          size="sm"
                          variant="ghost"
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <span>{wordCount} words</span>
                        <span>•</span>
                        <span>{charCount} characters</span>
                        <span>•</span>
                        <span>{lineCount} lines</span>
                      </div>
                    </AlertDescription>
                  </Alert>

                  {prdContent && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-white font-medium">Content Preview</label>
                        <Button
                          onClick={() => setShowPreview(!showPreview)}
                          size="sm"
                          variant="ghost"
                          className="text-[#8AB4FF] hover:text-[#4B6FED]"
                        >
                          {showPreview ? (
                            <>
                              <EyeOff className="mr-2 h-4 w-4" />
                              Hide Preview
                            </>
                          ) : (
                            <>
                              <Eye className="mr-2 h-4 w-4" />
                              Show Preview
                            </>
                          )}
                        </Button>
                      </div>
                      {showPreview && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="p-4 bg-[#0D1117] border border-[#2D333B] rounded-lg max-h-96 overflow-y-auto"
                        >
                          <pre className="text-gray-300 text-sm whitespace-pre-wrap font-mono">
                            {prdContent}
                          </pre>
                        </motion.div>
                      )}
                    </div>
                  )}
                </motion.div>
              ) : (
                <div
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  className={`relative border-2 border-dashed rounded-lg p-12 transition-all ${
                    isDragging
                      ? 'border-[#4B6FED] bg-[#4B6FED]/10'
                      : 'border-[#2D333B] bg-[#0D1117] hover:border-[#4B6FED]/40'
                  }`}
                >
                  <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    accept={ACCEPTED_FILE_TYPES.join(',')}
                    onChange={handleFileInput}
                    disabled={isProcessing}
                  />
                  <label
                    htmlFor="file-upload"
                    className="flex flex-col items-center justify-center cursor-pointer"
                  >
                    {isProcessing ? (
                      <Loader2 className="h-16 w-16 text-[#8AB4FF] animate-spin mb-4" />
                    ) : (
                      <Upload className="h-16 w-16 text-[#8AB4FF] mb-4" />
                    )}
                    <p className="text-white font-semibold text-lg mb-2">
                      {isDragging ? 'Drop file here' : 'Drop your PRD here or click to browse'}
                    </p>
                    <p className="text-gray-400 text-sm mb-4">
                      Supported formats: PDF, Markdown, Text, DOCX (max 10MB)
                    </p>
                    <Button
                      type="button"
                      disabled={isProcessing}
                      className="bg-[#4B6FED] hover:bg-[#3A56D3]"
                    >
                      {isProcessing ? 'Processing...' : 'Choose File'}
                    </Button>
                  </label>
                </div>
              )}
            </TabsContent>

            {/* Paste Tab */}
            <TabsContent value="paste" className="space-y-4 mt-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-white font-medium">PRD Content</label>
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <span>{wordCount} words</span>
                    <span>•</span>
                    <span>{charCount} characters</span>
                    <span>•</span>
                    <span>{lineCount} lines</span>
                  </div>
                </div>
                <Textarea
                  value={prdContent}
                  onChange={(e) => setPrdContent(e.target.value)}
                  placeholder="Paste your Product Requirements Document here...

Example:
# Project Overview
Build a task management application with the following features:

## Core Features
- User authentication (email/password)
- Task creation, editing, and deletion
- Task categorization and tagging
- Due dates and reminders
- Team collaboration

## Technical Requirements
- Frontend: React with TypeScript
- Backend: Node.js with Express
- Database: PostgreSQL
- Authentication: JWT
..."
                  className="bg-[#0D1117] border-[#2D333B] text-white font-mono text-sm min-h-[400px] resize-y"
                />
                <p className="text-gray-500 text-xs">
                  Markdown formatting is supported. Paste your complete PRD for best results.
                </p>
              </div>

              {prdContent.trim() && (
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => setShowPreview(!showPreview)}
                    size="sm"
                    variant="outline"
                    className="border-[#2D333B] text-[#8AB4FF] hover:text-[#4B6FED] hover:border-[#4B6FED]"
                  >
                    {showPreview ? (
                      <>
                        <EyeOff className="mr-2 h-4 w-4" />
                        Hide Markdown Preview
                      </>
                    ) : (
                      <>
                        <Eye className="mr-2 h-4 w-4" />
                        Show Markdown Preview
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => setPrdContent('')}
                    size="sm"
                    variant="ghost"
                    className="text-gray-400 hover:text-red-400"
                  >
                    <X className="mr-2 h-4 w-4" />
                    Clear
                  </Button>
                </div>
              )}

              {showPreview && prdContent.trim() && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="p-6 bg-[#0D1117] border border-[#2D333B] rounded-lg"
                >
                  <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                    <Eye className="h-4 w-4 text-[#8AB4FF]" />
                    Markdown Preview
                  </h4>
                  <div className="prose prose-invert max-w-none">
                    <div className="text-gray-300 text-sm whitespace-pre-wrap">
                      {/* In a real implementation, you'd use a markdown renderer like react-markdown */}
                      {prdContent}
                    </div>
                  </div>
                </motion.div>
              )}
            </TabsContent>
          </Tabs>

          {/* Error Display */}
          {error && (
            <Alert className="bg-red-500/10 border-red-500/30">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <AlertTitle className="text-red-400">Upload Failed</AlertTitle>
              <AlertDescription className="text-gray-300">{error}</AlertDescription>
            </Alert>
          )}

          {/* Continue Button */}
          {prdContent.trim() && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Alert className="bg-[#4B6FED]/5 border-[#4B6FED]/20 mb-4">
                <CheckCircle2 className="h-5 w-5 text-[#8AB4FF]" />
                <AlertDescription className="text-gray-300">
                  Your PRD is ready! Click continue to let Agent Swarm analyze and generate your project plan.
                </AlertDescription>
              </Alert>
              <Button
                onClick={handleContinue}
                disabled={!prdContent.trim()}
                className="w-full bg-gradient-to-r from-[#4B6FED] to-[#8A63F4] hover:from-[#3A56D3] hover:to-[#7A4FEB]"
                size="lg"
              >
                Continue to Next Step
                <CheckCircle2 className="ml-2 h-5 w-5" />
              </Button>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
