'use client';

/**
 * Review Command Component
 * Main interface for code review functionality
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Shield,
  Zap,
  Code2,
  FileText,
  Download,
  Share2,
  Play,
  AlertTriangle,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { reviewService } from '@/lib/review-service';
import { ReviewConfig, ReviewResult, ReviewType } from '@/lib/types/review';
import { ReviewResultsDisplay } from './ReviewResultsDisplay';

export function ReviewCommand() {
  const [reviewType, setReviewType] = useState<ReviewType>('all');
  const [files, setFiles] = useState<string>('');
  const [gitDiff, setGitDiff] = useState(false);
  const [sinceCommit, setSinceCommit] = useState('');
  const [isReviewing, setIsReviewing] = useState(false);
  const [reviewResult, setReviewResult] = useState<ReviewResult | null>(null);

  // Review options
  const [checkSecrets, setCheckSecrets] = useState(true);
  const [owaspCheck, setOwaspCheck] = useState(true);
  const [autoFix, setAutoFix] = useState(false);
  const [strictMode, setStrictMode] = useState(false);

  const handleReview = async () => {
    setIsReviewing(true);
    setReviewResult(null);

    const config: ReviewConfig = {
      type: reviewType,
      files: files ? files.split(',').map((f) => f.trim()) : undefined,
      gitDiff,
      sinceCommit: sinceCommit || undefined,
      options: {
        security: {
          checkSecrets,
          owaspCheck,
          cweCheck: true,
        },
        performance: {
          checkBundleSize: true,
          checkRenderTime: true,
          checkMemory: true,
        },
        style: {
          autoFix,
          strictMode,
        },
      },
    };

    try {
      const result = await reviewService.performReview(config);
      setReviewResult(result);
    } catch (error) {
      console.error('Review failed:', error);
    } finally {
      setIsReviewing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Improvement';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code2 className="h-6 w-6" />
            Code Review Command
          </CardTitle>
          <CardDescription>
            AI-powered code analysis for security, performance, and style
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="configure" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="configure">Configure</TabsTrigger>
              <TabsTrigger value="results" disabled={!reviewResult}>
                Results
              </TabsTrigger>
            </TabsList>

            <TabsContent value="configure" className="space-y-6">
              {/* Review Type Selection */}
              <div className="space-y-2">
                <Label>Review Type</Label>
                <Select
                  value={reviewType}
                  onValueChange={(value) => setReviewType(value as ReviewType)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        All Reviews
                      </div>
                    </SelectItem>
                    <SelectItem value="security">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Security
                      </div>
                    </SelectItem>
                    <SelectItem value="performance">
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4" />
                        Performance
                      </div>
                    </SelectItem>
                    <SelectItem value="style">
                      <div className="flex items-center gap-2">
                        <Code2 className="h-4 w-4" />
                        Style
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* File Selection */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="git-diff"
                    checked={gitDiff}
                    onCheckedChange={(checked) => setGitDiff(checked as boolean)}
                  />
                  <Label htmlFor="git-diff">Review Git Diff (uncommitted changes)</Label>
                </div>

                {!gitDiff && (
                  <div className="space-y-2">
                    <Label htmlFor="files">Files to Review (comma-separated)</Label>
                    <Input
                      id="files"
                      placeholder="src/components/App.tsx, src/lib/utils.ts"
                      value={files}
                      onChange={(e) => setFiles(e.target.value)}
                    />
                  </div>
                )}

                {gitDiff && (
                  <div className="space-y-2">
                    <Label htmlFor="since-commit">Since Commit (optional)</Label>
                    <Input
                      id="since-commit"
                      placeholder="HEAD~1 or commit hash"
                      value={sinceCommit}
                      onChange={(e) => setSinceCommit(e.target.value)}
                    />
                  </div>
                )}
              </div>

              {/* Review Options */}
              <div className="space-y-4">
                <Label>Review Options</Label>

                {(reviewType === 'security' || reviewType === 'all') && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Security Options
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="check-secrets"
                          checked={checkSecrets}
                          onCheckedChange={(checked) => setCheckSecrets(checked as boolean)}
                        />
                        <Label htmlFor="check-secrets">Check for hardcoded secrets</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="owasp-check"
                          checked={owaspCheck}
                          onCheckedChange={(checked) => setOwaspCheck(checked as boolean)}
                        />
                        <Label htmlFor="owasp-check">OWASP Top 10 compliance</Label>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {(reviewType === 'style' || reviewType === 'all') && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Code2 className="h-4 w-4" />
                        Style Options
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="auto-fix"
                          checked={autoFix}
                          onCheckedChange={(checked) => setAutoFix(checked as boolean)}
                        />
                        <Label htmlFor="auto-fix">Auto-fix where possible</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="strict-mode"
                          checked={strictMode}
                          onCheckedChange={(checked) => setStrictMode(checked as boolean)}
                        />
                        <Label htmlFor="strict-mode">Strict mode</Label>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  onClick={handleReview}
                  disabled={isReviewing || (!gitDiff && !files)}
                  className="flex-1"
                >
                  {isReviewing ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Reviewing...
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-4 w-4" />
                      Start Review
                    </>
                  )}
                </Button>
              </div>

              {/* Quick Commands Reference */}
              <Card className="bg-muted/50">
                <CardHeader>
                  <CardTitle className="text-sm">Quick Commands</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm font-mono">
                  <div>/review [file] - Review single file</div>
                  <div>/review --type security - Security review</div>
                  <div>/review --git-diff - Review uncommitted changes</div>
                  <div>/review --since HEAD~1 - Review since commit</div>
                  <div>/review --export pdf - Export review report</div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="results" className="space-y-6">
              {reviewResult && (
                <>
                  {/* Overall Score */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Review Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm text-muted-foreground">Overall Score</div>
                          <div
                            className={`text-4xl font-bold ${getScoreColor(
                              reviewResult.overallScore
                            )}`}
                          >
                            {reviewResult.overallScore}
                            <span className="text-lg">/100</span>
                          </div>
                          <div className="text-sm font-medium">
                            {getScoreLabel(reviewResult.overallScore)}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Download className="mr-2 h-4 w-4" />
                            Export
                          </Button>
                          <Button variant="outline" size="sm">
                            <Share2 className="mr-2 h-4 w-4" />
                            Share
                          </Button>
                        </div>
                      </div>

                      <Progress value={reviewResult.overallScore} className="h-2" />

                      <div className="grid grid-cols-3 gap-4">
                        {reviewResult.security && (
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm">
                              <Shield className="h-4 w-4" />
                              Security
                            </div>
                            <div
                              className={`text-2xl font-bold ${getScoreColor(
                                reviewResult.security.score
                              )}`}
                            >
                              {reviewResult.security.score}
                            </div>
                          </div>
                        )}
                        {reviewResult.performance && (
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm">
                              <Zap className="h-4 w-4" />
                              Performance
                            </div>
                            <div
                              className={`text-2xl font-bold ${getScoreColor(
                                reviewResult.performance.score
                              )}`}
                            >
                              {reviewResult.performance.score}
                            </div>
                          </div>
                        )}
                        {reviewResult.style && (
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm">
                              <Code2 className="h-4 w-4" />
                              Style
                            </div>
                            <div
                              className={`text-2xl font-bold ${getScoreColor(
                                reviewResult.style.score
                              )}`}
                            >
                              {reviewResult.style.score}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 text-sm text-muted-foreground">
                        <span>Files reviewed: {reviewResult.files.length}</span>
                        <span>•</span>
                        <span>Duration: {reviewResult.duration}ms</span>
                        <span>•</span>
                        <span>
                          {new Date(reviewResult.timestamp).toLocaleString()}
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Detailed Results */}
                  <ReviewResultsDisplay result={reviewResult} />
                </>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
