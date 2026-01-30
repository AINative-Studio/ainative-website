'use client';

import * as React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Target,
  AlertTriangle,
  CheckCircle,
  Rocket,
  ChevronDown,
  ChevronUp,
  Clock,
  TrendingUp,
  Package,
  Settings,
  RefreshCw,
  Loader2,
  ArrowRight,
  ArrowLeft,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Backlog,
  SprintPlan,
  agentSwarmAIService,
} from '@/lib/agent-swarm-wizard-service';

interface SprintPlanReviewStepProps {
  projectId: string;
  backlog: Backlog;
  onComplete: (sprintPlan: SprintPlan) => void;
  onBack: () => void;
}

const SPRINT_LENGTH_OPTIONS = [
  { value: 1, label: '1 week' },
  { value: 2, label: '2 weeks' },
  { value: 3, label: '3 weeks' },
  { value: 4, label: '4 weeks' },
];

export default function SprintPlanReviewStep({
  projectId,
  backlog,
  onComplete,
  onBack,
}: SprintPlanReviewStepProps) {
  const [sprintPlan, setSprintPlan] = useState<SprintPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedSprints, setExpandedSprints] = useState<Set<number>>(new Set());
  const [showConfig, setShowConfig] = useState(false);

  // Configuration state
  const [sprintLength, setSprintLength] = useState(2);
  const [teamVelocity, setTeamVelocity] = useState(20);

  // Auto-generate on mount
  useEffect(() => {
    generateSprintPlan();
  }, []);

  const generateSprintPlan = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await agentSwarmAIService.generateSprintPlan(
        projectId,
        backlog,
        {
          sprintLengthWeeks: sprintLength,
          teamVelocity: teamVelocity,
        }
      );

      setSprintPlan(response.sprint_plan);
      // Expand first sprint by default
      setExpandedSprints(new Set([1]));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate sprint plan';
      setError(errorMessage);
      console.error('Sprint plan generation error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    await generateSprintPlan();
    setIsRegenerating(false);
    setShowConfig(false);
  };

  const toggleSprint = (sprintNumber: number) => {
    setExpandedSprints((prev) => {
      const next = new Set(prev);
      if (next.has(sprintNumber)) {
        next.delete(sprintNumber);
      } else {
        next.add(sprintNumber);
      }
      return next;
    });
  };

  const getCapacityStatus = (totalPoints: number, velocity: number): 'good' | 'at-capacity' | 'overloaded' => {
    const utilization = totalPoints / velocity;
    if (utilization < 0.85) return 'good';
    if (utilization <= 1.0) return 'at-capacity';
    return 'overloaded';
  };

  const getCapacityColor = (status: 'good' | 'at-capacity' | 'overloaded'): string => {
    switch (status) {
      case 'good':
        return 'text-green-400 bg-green-500/10 border-green-500/30';
      case 'at-capacity':
        return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
      case 'overloaded':
        return 'text-red-400 bg-red-500/10 border-red-500/30';
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleLaunchAgents = () => {
    if (sprintPlan) {
      onComplete(sprintPlan);
    }
  };

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full max-w-7xl mx-auto"
      >
        <Card className="bg-[#161B22] border-[#2D333B]">
          <CardContent className="py-20">
            <div className="flex flex-col items-center justify-center space-y-6">
              <div className="relative">
                <Loader2 className="h-16 w-16 text-[#8AB4FF] animate-spin" />
                <motion.div
                  className="absolute inset-0 rounded-full bg-[#4B6FED] opacity-20"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.2, 0.4, 0.2],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-xl font-semibold text-white">Planning Sprints</h3>
                <p className="text-gray-400">
                  Analyzing backlog and team velocity to create optimal sprint plan...
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  if (error && !sprintPlan) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full max-w-7xl mx-auto"
      >
        <Card className="bg-[#161B22] border-[#2D333B]">
          <CardContent className="py-10">
            <Alert className="bg-red-500/10 border-red-500/30">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              <AlertTitle className="text-red-400">Generation Failed</AlertTitle>
              <AlertDescription className="text-gray-300 mt-2">
                {error}
              </AlertDescription>
            </Alert>
            <div className="flex gap-3 mt-6">
              <Button
                onClick={onBack}
                variant="outline"
                className="border-[#2D333B] text-gray-300 hover:text-white"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go Back
              </Button>
              <Button
                onClick={generateSprintPlan}
                className="bg-[#4B6FED] hover:bg-[#3A56D3]"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  if (!sprintPlan) return null;

  const velocityUtilizationValue = parseInt(sprintPlan.velocity_utilization.replace('%', ''));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-7xl mx-auto space-y-6"
    >
      {/* Header Card */}
      <Card className="bg-[#161B22] border-[#2D333B]">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#4B6FED]/10">
                <Calendar className="h-6 w-6 text-[#8AB4FF]" />
              </div>
              <div>
                <CardTitle className="text-2xl text-white">Sprint Plan Review</CardTitle>
                <CardDescription className="text-gray-400 mt-1">
                  Review your sprint execution plan and timeline
                </CardDescription>
              </div>
            </div>
            <Button
              onClick={() => setShowConfig(!showConfig)}
              variant="outline"
              size="sm"
              className="border-[#2D333B] text-gray-300 hover:text-white"
            >
              <Settings className="mr-2 h-4 w-4" />
              Configure
            </Button>
          </div>

          {/* Configuration Panel */}
          <AnimatePresence>
            {showConfig && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-6 pt-6 border-t border-[#2D333B]"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-white">Sprint Length</Label>
                    <Select
                      value={sprintLength.toString()}
                      onValueChange={(v) => setSprintLength(parseInt(v))}
                    >
                      <SelectTrigger className="bg-[#0D1117] border-[#2D333B] text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#161B22] border-[#2D333B]">
                        {SPRINT_LENGTH_OPTIONS.map((option) => (
                          <SelectItem
                            key={option.value}
                            value={option.value.toString()}
                            className="text-white hover:bg-[#0D1117]"
                          >
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white">Team Velocity (story points per sprint)</Label>
                    <Input
                      type="number"
                      value={teamVelocity}
                      onChange={(e) => setTeamVelocity(parseInt(e.target.value) || 20)}
                      min={1}
                      max={100}
                      className="bg-[#0D1117] border-[#2D333B] text-white"
                    />
                  </div>
                </div>
                <Button
                  onClick={handleRegenerate}
                  disabled={isRegenerating}
                  className="mt-4 bg-[#4B6FED] hover:bg-[#3A56D3]"
                >
                  {isRegenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Regenerating...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Regenerate Plan
                    </>
                  )}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </CardHeader>

        {/* Overview Stats */}
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-[#0D1117] border border-[#2D333B] rounded-lg">
              <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                <Clock className="h-4 w-4" />
                Duration
              </div>
              <div className="text-2xl font-bold text-white">
                {sprintPlan.total_duration_weeks} weeks
              </div>
            </div>
            <div className="p-4 bg-[#0D1117] border border-[#2D333B] rounded-lg">
              <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                <Target className="h-4 w-4" />
                Total Sprints
              </div>
              <div className="text-2xl font-bold text-white">
                {sprintPlan.total_sprints}
              </div>
            </div>
            <div className="p-4 bg-[#0D1117] border border-[#2D333B] rounded-lg">
              <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                <TrendingUp className="h-4 w-4" />
                Velocity
              </div>
              <div className="text-2xl font-bold text-[#8AB4FF]">
                {sprintPlan.velocity_utilization}
              </div>
            </div>
            <div className="p-4 bg-[#0D1117] border border-[#2D333B] rounded-lg">
              <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                <Package className="h-4 w-4" />
                Deployment
              </div>
              <div className="text-sm font-medium text-white mt-1">
                {sprintPlan.deployment_strategy}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timeline Visualization */}
      <Card className="bg-[#161B22] border-[#2D333B] overflow-hidden">
        <CardHeader>
          <CardTitle className="text-xl text-white flex items-center gap-2">
            <Zap className="h-5 w-5 text-[#8AB4FF]" />
            Sprint Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Horizontal Timeline */}
          <div className="relative py-8 overflow-x-auto">
            <div className="flex items-center gap-4 min-w-max px-4">
              {sprintPlan.sprints.map((sprint, index) => {
                const capacityStatus = getCapacityStatus(sprint.total_points, teamVelocity);
                const isExpanded = expandedSprints.has(sprint.number);

                return (
                  <React.Fragment key={sprint.number}>
                    {/* Sprint Card */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="relative"
                    >
                      <div
                        className={`w-48 p-4 rounded-lg border-2 cursor-pointer transition-all hover:scale-105 ${
                          isExpanded
                            ? 'border-[#4B6FED] bg-[#4B6FED]/10'
                            : 'border-[#2D333B] bg-[#0D1117] hover:border-[#4B6FED]/40'
                        }`}
                        onClick={() => toggleSprint(sprint.number)}
                      >
                        {/* Sprint Header */}
                        <div className="flex items-center justify-between mb-2">
                          <Badge className="bg-[#4B6FED]/20 text-[#8AB4FF] border-[#4B6FED]/30">
                            Sprint {sprint.number}
                          </Badge>
                          <div className={`p-1 rounded-full ${getCapacityColor(capacityStatus)}`}>
                            {capacityStatus === 'good' && <CheckCircle className="h-4 w-4" />}
                            {capacityStatus === 'at-capacity' && <Target className="h-4 w-4" />}
                            {capacityStatus === 'overloaded' && <AlertTriangle className="h-4 w-4" />}
                          </div>
                        </div>

                        {/* Sprint Duration */}
                        <div className="text-white font-semibold text-sm mb-3 line-clamp-2">
                          {sprint.title.replace(`Sprint ${sprint.number}: `, '')}
                        </div>

                        {/* Date Range */}
                        <div className="flex items-center gap-1 text-xs text-gray-400 mb-2">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDate(sprint.start_date)}</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-400 mb-3">
                          <ArrowRight className="h-3 w-3" />
                          <span>{formatDate(sprint.end_date)}</span>
                        </div>

                        {/* Story Points */}
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-400">Story Points</span>
                          <span className="font-bold text-[#8AB4FF]">
                            {sprint.total_points}
                          </span>
                        </div>

                        {/* Expand Indicator */}
                        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                          <motion.div
                            animate={{ y: [0, 4, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            className="bg-[#4B6FED] rounded-full p-1"
                          >
                            {isExpanded ? (
                              <ChevronUp className="h-3 w-3 text-white" />
                            ) : (
                              <ChevronDown className="h-3 w-3 text-white" />
                            )}
                          </motion.div>
                        </div>
                      </div>

                      {/* Connection Line */}
                      {index < sprintPlan.sprints.length - 1 && (
                        <motion.div
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: 1 }}
                          transition={{ delay: index * 0.1 + 0.2, duration: 0.5 }}
                          className="absolute top-1/2 -right-4 w-8 h-[2px] bg-gradient-to-r from-[#4B6FED] to-[#8A63F4] origin-left"
                        >
                          <motion.div
                            className="absolute right-0 top-1/2 transform -translate-y-1/2"
                            animate={{ x: [0, 4, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            <div className="w-2 h-2 rounded-full bg-[#8A63F4]" />
                          </motion.div>
                        </motion.div>
                      )}
                    </motion.div>
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* Current Date Indicator (if applicable) */}
          <div className="flex items-center gap-2 text-xs text-gray-500 mt-4">
            <div className="w-3 h-3 rounded-full bg-[#8A63F4]" />
            <span>Click on a sprint to view details</span>
          </div>
        </CardContent>
      </Card>

      {/* Sprint Details Cards */}
      <AnimatePresence>
        {sprintPlan.sprints.map((sprint) => {
          const isExpanded = expandedSprints.has(sprint.number);
          const capacityStatus = getCapacityStatus(sprint.total_points, teamVelocity);

          return (
            isExpanded && (
              <motion.div
                key={`details-${sprint.number}`}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="bg-[#161B22] border-[#2D333B]">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-xl text-white flex items-center gap-2">
                          <Badge className="bg-[#4B6FED]/20 text-[#8AB4FF] border-[#4B6FED]/30">
                            Sprint {sprint.number}
                          </Badge>
                          {sprint.title.replace(`Sprint ${sprint.number}: `, '')}
                        </CardTitle>
                        <CardDescription className="text-gray-400 mt-2">
                          {sprint.duration_weeks} week{sprint.duration_weeks > 1 ? 's' : ''} • {formatDate(sprint.start_date)} - {formatDate(sprint.end_date)}
                        </CardDescription>
                      </div>
                      <Badge className={`${getCapacityColor(capacityStatus)} border`}>
                        {sprint.total_points} / {teamVelocity} points
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Goals */}
                    <div>
                      <h4 className="text-white font-semibold flex items-center gap-2 mb-3">
                        <Target className="h-4 w-4 text-[#8AB4FF]" />
                        Sprint Goals
                      </h4>
                      <ul className="space-y-2">
                        {sprint.goals.map((goal, index) => (
                          <motion.li
                            key={index}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-start gap-2 text-gray-300"
                          >
                            <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                            <span>{goal}</span>
                          </motion.li>
                        ))}
                      </ul>
                    </div>

                    {/* Stories */}
                    <div>
                      <h4 className="text-white font-semibold flex items-center gap-2 mb-3">
                        <Package className="h-4 w-4 text-[#8AB4FF]" />
                        User Stories ({sprint.stories.length})
                      </h4>
                      <div className="space-y-2">
                        {sprint.stories.map((story, index) => (
                          <motion.div
                            key={story.story_id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="p-3 bg-[#0D1117] border border-[#2D333B] rounded-lg"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <Badge variant="outline" className="text-xs border-[#4B6FED]/30 text-[#8AB4FF]">
                                    {story.epic}
                                  </Badge>
                                  <span className="text-sm text-gray-300">{story.title}</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge className="bg-[#4B6FED]/20 text-[#8AB4FF] border-[#4B6FED]/30">
                                  {story.points} pts
                                </Badge>
                                <Badge
                                  className={
                                    story.priority === 'must-have'
                                      ? 'bg-red-500/20 text-red-400 border-red-500/30'
                                      : story.priority === 'should-have'
                                      ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                                      : 'bg-green-500/20 text-green-400 border-green-500/30'
                                  }
                                >
                                  {story.priority}
                                </Badge>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* Risks */}
                    {sprint.risks.length > 0 && (
                      <div>
                        <h4 className="text-white font-semibold flex items-center gap-2 mb-3">
                          <AlertTriangle className="h-4 w-4 text-yellow-400" />
                          Potential Risks
                        </h4>
                        <ul className="space-y-2">
                          {sprint.risks.map((risk, index) => (
                            <motion.li
                              key={index}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className="flex items-start gap-2 text-gray-300"
                            >
                              <AlertTriangle className="h-4 w-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                              <span>{risk}</span>
                            </motion.li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Deliverables */}
                    <div>
                      <h4 className="text-white font-semibold flex items-center gap-2 mb-3">
                        <CheckCircle className="h-4 w-4 text-green-400" />
                        Expected Deliverables
                      </h4>
                      <ul className="space-y-2">
                        {sprint.deliverables.map((deliverable, index) => (
                          <motion.li
                            key={index}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-start gap-2 text-gray-300"
                          >
                            <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                            <span>{deliverable}</span>
                          </motion.li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          );
        })}
      </AnimatePresence>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex gap-3"
      >
        <Button
          onClick={onBack}
          variant="outline"
          size="lg"
          className="border-[#2D333B] text-gray-300 hover:text-white"
        >
          <ArrowLeft className="mr-2 h-5 w-5" />
          Back to Backlog
        </Button>

        <Button
          onClick={handleLaunchAgents}
          size="lg"
          className="flex-1 bg-gradient-to-r from-[#4B6FED] via-[#8A63F4] to-[#4B6FED] hover:from-[#3A56D3] hover:via-[#7A4FEB] hover:to-[#3A56D3] text-white shadow-lg shadow-[#4B6FED]/20 relative overflow-hidden group"
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            animate={{
              x: ['-200%', '200%'],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
          <span className="relative flex items-center gap-2">
            <Rocket className="h-5 w-5" />
            Launch Agent Swarm
            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </span>
        </Button>
      </motion.div>

      {/* Final Confirmation Alert */}
      <Alert className="bg-[#4B6FED]/5 border-[#4B6FED]/20">
        <Rocket className="h-5 w-5 text-[#8AB4FF]" />
        <AlertTitle className="text-white">Ready to Launch</AlertTitle>
        <AlertDescription className="text-gray-300">
          Once you click Launch, the Agent Swarm will begin building your application following this sprint plan.
          You'll be able to monitor progress in real-time on the next screen.
        </AlertDescription>
      </Alert>
    </motion.div>
  );
}
