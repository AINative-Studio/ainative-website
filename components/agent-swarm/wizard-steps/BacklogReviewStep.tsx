'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  List,
  CheckSquare,
  Link2,
  Loader2,
  AlertCircle,
  RefreshCw,
  CheckCircle2,
  ChevronRight,
  Target,
  TrendingUp,
  Package,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  agentSwarmAIService,
  type Backlog,
  type DataModel,
  AgentSwarmApiError,
} from '@/lib/agent-swarm-wizard-service';

interface BacklogReviewStepProps {
  projectId: string;
  prdContent: string;
  dataModel: DataModel;
  onComplete: (backlog: Backlog) => void;
  onBack: () => void;
}

const priorityConfig = {
  'must-have': {
    label: 'Must Have',
    color: 'bg-red-500/10 text-red-400 border-red-500/30',
    dotColor: 'bg-red-500',
  },
  'should-have': {
    label: 'Should Have',
    color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
    dotColor: 'bg-yellow-500',
  },
  'could-have': {
    label: 'Could Have',
    color: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    dotColor: 'bg-blue-500',
  },
  'wont-have': {
    label: "Won't Have",
    color: 'bg-gray-500/10 text-gray-400 border-gray-500/30',
    dotColor: 'bg-gray-500',
  },
};

export default function BacklogReviewStep({
  projectId,
  prdContent,
  dataModel,
  onComplete,
  onBack,
}: BacklogReviewStepProps) {
  const [backlog, setBacklog] = useState<Backlog | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRegenerating, setIsRegenerating] = useState(false);

  const generateBacklog = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await agentSwarmAIService.generateBacklog(
        projectId,
        prdContent,
        dataModel
      );
      setBacklog(response.backlog);
    } catch (err) {
      if (err instanceof AgentSwarmApiError) {
        setError(err.detail as string || 'Failed to generate backlog');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
      console.error('Backlog generation error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    generateBacklog();
  }, []);

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    await generateBacklog();
    setIsRegenerating(false);
  };

  const handleContinue = () => {
    if (backlog) {
      onComplete(backlog);
    }
  };

  // Calculate statistics
  const stats = backlog
    ? {
        totalStories: backlog.epics.reduce((sum, epic) => sum + epic.stories.length, 0),
        avgPointsPerStory:
          backlog.total_story_points /
          backlog.epics.reduce((sum, epic) => sum + epic.stories.length, 0),
        pointsByPriority: backlog.epics.reduce((acc, epic) => {
          const priority = epic.priority;
          acc[priority] = (acc[priority] || 0) + epic.total_points;
          return acc;
        }, {} as Record<string, number>),
      }
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-6xl mx-auto"
    >
      <Card className="bg-[#161B22] border-[#2D333B]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#4B6FED]/10">
                <BookOpen className="h-6 w-6 text-[#8AB4FF]" />
              </div>
              <div>
                <CardTitle className="text-2xl text-white">Product Backlog Review</CardTitle>
                <CardDescription className="text-gray-400 mt-1">
                  AI-generated epics and user stories from your PRD
                </CardDescription>
              </div>
            </div>
            {backlog && !isLoading && (
              <Button
                onClick={handleRegenerate}
                disabled={isRegenerating}
                variant="outline"
                className="border-[#2D333B] text-[#8AB4FF] hover:text-[#4B6FED] hover:border-[#4B6FED]"
              >
                {isRegenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Regenerating...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Regenerate
                  </>
                )}
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Loading State */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-16 space-y-4"
            >
              <Loader2 className="h-16 w-16 text-[#8AB4FF] animate-spin" />
              <div className="text-center space-y-2">
                <h3 className="text-white font-semibold text-lg">
                  Analyzing Requirements and Creating User Stories
                </h3>
                <p className="text-gray-400 text-sm max-w-md">
                  Our AI is breaking down your PRD into epics, user stories, and tasks. This may
                  take 20-30 seconds.
                </p>
              </div>
              <Progress value={undefined} className="w-64 h-2" />
            </motion.div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Alert className="bg-red-500/10 border-red-500/30">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <AlertTitle className="text-red-400">Generation Failed</AlertTitle>
                <AlertDescription className="space-y-3">
                  <p className="text-gray-300">{error}</p>
                  <Button
                    onClick={handleRegenerate}
                    disabled={isRegenerating}
                    className="bg-red-500/20 hover:bg-red-500/30 text-red-400"
                  >
                    {isRegenerating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Retrying...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Retry Generation
                      </>
                    )}
                  </Button>
                </AlertDescription>
              </Alert>
            </motion.div>
          )}

          {/* Success State */}
          {backlog && !isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-6"
            >
              {/* Summary Header */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-[#0D1117] border-[#2D333B]">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm">Total Points</p>
                        <p className="text-white text-2xl font-bold mt-1">
                          {backlog.total_story_points}
                        </p>
                      </div>
                      <Target className="h-8 w-8 text-[#8AB4FF]" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-[#0D1117] border-[#2D333B]">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm">Estimated Sprints</p>
                        <p className="text-white text-2xl font-bold mt-1">
                          {backlog.estimated_sprints}
                        </p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-[#8AB4FF]" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-[#0D1117] border-[#2D333B]">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm">Epic Count</p>
                        <p className="text-white text-2xl font-bold mt-1">
                          {backlog.epics.length}
                        </p>
                      </div>
                      <Package className="h-8 w-8 text-[#8AB4FF]" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-[#0D1117] border-[#2D333B]">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm">Total Stories</p>
                        <p className="text-white text-2xl font-bold mt-1">
                          {stats?.totalStories || 0}
                        </p>
                      </div>
                      <List className="h-8 w-8 text-[#8AB4FF]" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Statistics Panel */}
              {stats && (
                <Card className="bg-[#0D1117] border-[#2D333B]">
                  <CardHeader>
                    <CardTitle className="text-white text-lg">Points by Priority</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {Object.entries(stats.pointsByPriority).map(([priority, points]) => {
                      const config =
                        priorityConfig[priority as keyof typeof priorityConfig] ||
                        priorityConfig['could-have'];
                      const percentage =
                        (points / backlog.total_story_points) * 100;

                      return (
                        <div key={priority} className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <div className={`h-2 w-2 rounded-full ${config.dotColor}`} />
                              <span className="text-gray-300">{config.label}</span>
                            </div>
                            <span className="text-white font-medium">
                              {points} pts ({percentage.toFixed(0)}%)
                            </span>
                          </div>
                          <Progress value={percentage} className="h-2" />
                        </div>
                      );
                    })}
                    <div className="pt-2 border-t border-[#2D333B] mt-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Average Points per Story</span>
                        <span className="text-white font-medium">
                          {stats.avgPointsPerStory.toFixed(1)} pts
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Epics Accordion */}
              <Card className="bg-[#0D1117] border-[#2D333B]">
                <CardHeader>
                  <CardTitle className="text-white text-lg flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-[#8AB4FF]" />
                    Epics & User Stories
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Expand each epic to view user stories, acceptance criteria, and tasks
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Accordion type="multiple" className="space-y-4">
                    {backlog.epics.map((epic, epicIndex) => {
                      const config =
                        priorityConfig[epic.priority as keyof typeof priorityConfig] ||
                        priorityConfig['could-have'];

                      return (
                        <AccordionItem
                          key={epic.id}
                          value={`epic-${epic.id}`}
                          className="border border-[#2D333B] rounded-lg bg-[#161B22] px-4"
                        >
                          <AccordionTrigger className="hover:no-underline py-4">
                            <div className="flex items-center justify-between w-full pr-4">
                              <div className="flex items-center gap-3 text-left">
                                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#4B6FED]/10 text-[#8AB4FF] font-semibold text-sm">
                                  {epicIndex + 1}
                                </div>
                                <div>
                                  <h4 className="text-white font-semibold">{epic.title}</h4>
                                  <p className="text-gray-400 text-sm mt-1">
                                    {epic.description}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge className={config.color}>{config.label}</Badge>
                                <Badge className="bg-[#4B6FED]/20 text-[#8AB4FF] border-[#4B6FED]/30">
                                  {epic.total_points} pts
                                </Badge>
                                <Badge className="bg-gray-500/10 text-gray-400 border-gray-500/30">
                                  {epic.stories.length} stories
                                </Badge>
                              </div>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-4 pt-4">
                              {epic.stories.map((story) => (
                                <motion.div
                                  key={story.id}
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: 0.1 }}
                                  className="border border-[#2D333B] rounded-lg p-4 bg-[#0D1117] hover:border-[#4B6FED]/40 transition-colors"
                                >
                                  <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-start gap-3 flex-1">
                                      <div className="flex items-center justify-center w-6 h-6 rounded bg-[#4B6FED]/10 text-[#8AB4FF] font-semibold text-xs mt-0.5">
                                        {story.id}
                                      </div>
                                      <div className="flex-1">
                                        <h5 className="text-white font-medium mb-1">
                                          {story.title}
                                        </h5>
                                        <p className="text-gray-400 text-sm">
                                          {story.description}
                                        </p>
                                      </div>
                                    </div>
                                    <Badge className="bg-[#4B6FED]/20 text-[#8AB4FF] border-[#4B6FED]/30 ml-4">
                                      {story.story_points} pts
                                    </Badge>
                                  </div>

                                  {/* Acceptance Criteria */}
                                  {story.acceptance_criteria.length > 0 && (
                                    <div className="mb-3 pl-9">
                                      <div className="flex items-center gap-2 mb-2">
                                        <CheckSquare className="h-4 w-4 text-green-400" />
                                        <span className="text-green-400 text-sm font-medium">
                                          Acceptance Criteria
                                        </span>
                                      </div>
                                      <ul className="space-y-1">
                                        {story.acceptance_criteria.map((criterion, idx) => (
                                          <li
                                            key={idx}
                                            className="text-gray-300 text-sm flex items-start gap-2"
                                          >
                                            <ChevronRight className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                                            <span>{criterion}</span>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}

                                  {/* Tasks */}
                                  {story.tasks.length > 0 && (
                                    <div className="mb-3 pl-9">
                                      <div className="flex items-center gap-2 mb-2">
                                        <List className="h-4 w-4 text-blue-400" />
                                        <span className="text-blue-400 text-sm font-medium">
                                          Tasks
                                        </span>
                                      </div>
                                      <ul className="space-y-1">
                                        {story.tasks.map((task, idx) => (
                                          <li
                                            key={idx}
                                            className="text-gray-300 text-sm flex items-start gap-2"
                                          >
                                            <span className="text-gray-500">•</span>
                                            <span>{task}</span>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}

                                  {/* Dependencies */}
                                  {story.dependencies.length > 0 && (
                                    <div className="pl-9">
                                      <div className="flex items-center gap-2 mb-2">
                                        <Link2 className="h-4 w-4 text-yellow-400" />
                                        <span className="text-yellow-400 text-sm font-medium">
                                          Dependencies
                                        </span>
                                      </div>
                                      <div className="flex flex-wrap gap-2">
                                        {story.dependencies.map((depId) => (
                                          <Badge
                                            key={depId}
                                            className="bg-yellow-500/10 text-yellow-400 border-yellow-500/30"
                                          >
                                            Story #{depId}
                                          </Badge>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </motion.div>
                              ))}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      );
                    })}
                  </Accordion>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex items-center gap-4">
                <Button
                  onClick={onBack}
                  variant="outline"
                  className="border-[#2D333B] text-gray-400 hover:text-white hover:border-[#4B6FED]"
                >
                  Back
                </Button>
                <Button
                  onClick={handleContinue}
                  className="flex-1 bg-gradient-to-r from-[#4B6FED] to-[#8A63F4] hover:from-[#3A56D3] hover:to-[#7A4FEB]"
                  size="lg"
                >
                  Approve & Continue to Sprint Planning
                  <CheckCircle2 className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
