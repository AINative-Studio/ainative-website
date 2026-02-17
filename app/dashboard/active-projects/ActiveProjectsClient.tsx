'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Activity,
  Pause,
  Play,
  Square,
  Clock,
  CheckCircle,
  AlertCircle,
  Users,
  FolderOpen,
  Loader2,
  TrendingUp,
  BarChart3,
} from 'lucide-react';
import {
  activeProjectsService,
  ActiveProject,
  ActivityFeedItem,
} from '@/lib/active-projects-service';
import { formatDistanceToNow } from 'date-fns';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const stagger = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

// Status badge configurations
const STATUS_CONFIG = {
  active: {
    label: 'Active',
    icon: Activity,
    className: 'bg-green-500/10 text-green-500 border-green-500/20',
  },
  paused: {
    label: 'Paused',
    icon: Pause,
    className: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  },
  stopped: {
    label: 'Stopped',
    icon: Square,
    className: 'bg-red-500/10 text-red-500 border-red-500/20',
  },
  completed: {
    label: 'Completed',
    icon: CheckCircle,
    className: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  },
};

export default function ActiveProjectsClient() {
  const queryClient = useQueryClient();
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    action: 'pause' | 'resume' | 'stop' | null;
    project: ActiveProject | null;
  }>({
    open: false,
    action: null,
    project: null,
  });

  // Fetch summary
  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ['active-projects-summary'],
    queryFn: activeProjectsService.getSummary,
  });

  // Fetch projects
  const { data: projects, isLoading: projectsLoading } = useQuery({
    queryKey: ['active-projects'],
    queryFn: activeProjectsService.listProjects,
  });

  // Fetch activity feed
  const { data: activityFeed, isLoading: activityLoading } = useQuery({
    queryKey: ['active-projects-activity'],
    queryFn: () => activeProjectsService.getActivityFeed(20),
  });

  // Pause project mutation
  const pauseMutation = useMutation({
    mutationFn: (projectId: string) => activeProjectsService.pauseProject(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-projects'] });
      queryClient.invalidateQueries({ queryKey: ['active-projects-summary'] });
      queryClient.invalidateQueries({ queryKey: ['active-projects-activity'] });
      setConfirmDialog({ open: false, action: null, project: null });
    },
  });

  // Resume project mutation
  const resumeMutation = useMutation({
    mutationFn: (projectId: string) => activeProjectsService.resumeProject(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-projects'] });
      queryClient.invalidateQueries({ queryKey: ['active-projects-summary'] });
      queryClient.invalidateQueries({ queryKey: ['active-projects-activity'] });
      setConfirmDialog({ open: false, action: null, project: null });
    },
  });

  // Stop project mutation
  const stopMutation = useMutation({
    mutationFn: (projectId: string) => activeProjectsService.stopProject(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-projects'] });
      queryClient.invalidateQueries({ queryKey: ['active-projects-summary'] });
      queryClient.invalidateQueries({ queryKey: ['active-projects-activity'] });
      setConfirmDialog({ open: false, action: null, project: null });
    },
  });

  const handleProjectAction = (
    action: 'pause' | 'resume' | 'stop',
    project: ActiveProject
  ) => {
    setConfirmDialog({ open: true, action, project });
  };

  const confirmAction = () => {
    if (!confirmDialog.project || !confirmDialog.action) return;

    const { project, action } = confirmDialog;
    switch (action) {
      case 'pause':
        pauseMutation.mutate(project.id);
        break;
      case 'resume':
        resumeMutation.mutate(project.id);
        break;
      case 'stop':
        stopMutation.mutate(project.id);
        break;
    }
  };

  const isLoading = summaryLoading || projectsLoading;
  const isMutating =
    pauseMutation.isPending || resumeMutation.isPending || stopMutation.isPending;

  return (
    <div className="min-h-screen bg-[#161B22] p-6">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={stagger}
        className="mx-auto max-w-7xl space-y-6"
      >
        {/* Header */}
        <motion.div variants={fadeUp} className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Active Projects</h1>
            <p className="mt-2 text-gray-400">
              Monitor and manage your active AI projects
            </p>
          </div>
          <Activity className="h-8 w-8 text-blue-500" />
        </motion.div>

        {/* Summary Cards */}
        <motion.div variants={fadeUp}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {summaryLoading ? (
              <>
                {[...Array(5)].map((_, i) => (
                  <Card key={i} className="border-[#2D333B] bg-[#0D1117]">
                    <CardContent className="p-6">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="mt-2 h-8 w-16" />
                    </CardContent>
                  </Card>
                ))}
              </>
            ) : (
              <>
                <Card className="border-[#2D333B] bg-[#0D1117]">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-400">Total Projects</p>
                        <p className="mt-1 text-2xl font-bold text-white">
                          {summary?.total_projects ?? 0}
                        </p>
                      </div>
                      <FolderOpen className="h-8 w-8 text-blue-500/60" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-[#2D333B] bg-[#0D1117]">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-400">Active</p>
                        <p className="mt-1 text-2xl font-bold text-green-500">
                          {summary?.active_projects ?? 0}
                        </p>
                      </div>
                      <Activity className="h-8 w-8 text-green-500/60" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-[#2D333B] bg-[#0D1117]">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-400">Paused</p>
                        <p className="mt-1 text-2xl font-bold text-yellow-500">
                          {summary?.paused_projects ?? 0}
                        </p>
                      </div>
                      <Pause className="h-8 w-8 text-yellow-500/60" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-[#2D333B] bg-[#0D1117]">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-400">Completed</p>
                        <p className="mt-1 text-2xl font-bold text-blue-500">
                          {summary?.completed_projects ?? 0}
                        </p>
                      </div>
                      <CheckCircle className="h-8 w-8 text-blue-500/60" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-[#2D333B] bg-[#0D1117]">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-400">Total Agents</p>
                        <p className="mt-1 text-2xl font-bold text-purple-500">
                          {summary?.total_agents ?? 0}
                        </p>
                      </div>
                      <Users className="h-8 w-8 text-purple-500/60" />
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Projects List */}
          <motion.div variants={fadeUp} className="lg:col-span-2">
            <Card className="border-[#2D333B] bg-[#0D1117]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <BarChart3 className="h-5 w-5" />
                  Projects
                </CardTitle>
              </CardHeader>
              <CardContent>
                {projectsLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div
                        key={i}
                        className="rounded-lg border border-[#2D333B] bg-[#161B22] p-4"
                      >
                        <Skeleton className="h-5 w-48" />
                        <Skeleton className="mt-2 h-4 w-full" />
                        <div className="mt-4 flex gap-2">
                          <Skeleton className="h-8 w-20" />
                          <Skeleton className="h-8 w-20" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : projects && projects.length > 0 ? (
                  <div className="space-y-4">
                    <AnimatePresence mode="popLayout">
                      {projects.map((project) => {
                        const statusConfig = STATUS_CONFIG[project.status];
                        const StatusIcon = statusConfig.icon;

                        return (
                          <motion.div
                            key={project.id}
                            layout
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="rounded-lg border border-[#2D333B] bg-[#161B22] p-4 transition-colors hover:border-[#3D444B]"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3">
                                  <h3 className="font-semibold text-white">
                                    {project.name}
                                  </h3>
                                  <Badge
                                    variant="outline"
                                    className={statusConfig.className}
                                  >
                                    <StatusIcon className="mr-1 h-3 w-3" />
                                    {statusConfig.label}
                                  </Badge>
                                </div>
                                {project.description && (
                                  <p className="mt-1 text-sm text-gray-400">
                                    {project.description}
                                  </p>
                                )}
                                <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
                                  <div className="flex items-center gap-1">
                                    <Users className="h-3 w-3" />
                                    {project.agent_count} agents
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    Created{' '}
                                    {formatDistanceToNow(new Date(project.created_at), {
                                      addSuffix: true,
                                    })}
                                  </div>
                                </div>
                              </div>

                              {/* Action Buttons */}
                              <div className="ml-4 flex gap-2">
                                {project.status === 'active' && (
                                  <>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() =>
                                        handleProjectAction('pause', project)
                                      }
                                      disabled={isMutating}
                                      className="border-yellow-500/20 text-yellow-500 hover:bg-yellow-500/10"
                                    >
                                      <Pause className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() =>
                                        handleProjectAction('stop', project)
                                      }
                                      disabled={isMutating}
                                      className="border-red-500/20 text-red-500 hover:bg-red-500/10"
                                    >
                                      <Square className="h-4 w-4" />
                                    </Button>
                                  </>
                                )}
                                {project.status === 'paused' && (
                                  <>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() =>
                                        handleProjectAction('resume', project)
                                      }
                                      disabled={isMutating}
                                      className="border-green-500/20 text-green-500 hover:bg-green-500/10"
                                    >
                                      <Play className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() =>
                                        handleProjectAction('stop', project)
                                      }
                                      disabled={isMutating}
                                      className="border-red-500/20 text-red-500 hover:bg-red-500/10"
                                    >
                                      <Square className="h-4 w-4" />
                                    </Button>
                                  </>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                ) : (
                  <div className="py-12 text-center">
                    <FolderOpen className="mx-auto h-12 w-12 text-gray-600" />
                    <p className="mt-4 text-gray-400">No active projects found</p>
                    <p className="mt-1 text-sm text-gray-500">
                      Your projects will appear here once created
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Activity Feed */}
          <motion.div variants={fadeUp}>
            <Card className="border-[#2D333B] bg-[#0D1117]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <TrendingUp className="h-5 w-5" />
                  Activity Feed
                </CardTitle>
              </CardHeader>
              <CardContent>
                {activityLoading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="border-l-2 border-[#2D333B] pl-4">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="mt-2 h-3 w-full" />
                        <Skeleton className="mt-1 h-3 w-20" />
                      </div>
                    ))}
                  </div>
                ) : activityFeed && activityFeed.length > 0 ? (
                  <div className="max-h-[600px] space-y-4 overflow-y-auto pr-2">
                    {activityFeed.map((item) => (
                      <div
                        key={item.id}
                        className="border-l-2 border-blue-500/30 pl-4"
                      >
                        <div className="flex items-start gap-2">
                          <Activity className="mt-0.5 h-4 w-4 text-blue-500" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-white">
                              {item.project_name}
                            </p>
                            <p className="mt-1 text-xs text-gray-400">
                              {item.description}
                            </p>
                            <p className="mt-1 text-xs text-gray-500">
                              {formatDistanceToNow(new Date(item.created_at), {
                                addSuffix: true,
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <Activity className="mx-auto h-8 w-8 text-gray-600" />
                    <p className="mt-2 text-sm text-gray-400">No activity yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Confirmation Dialog */}
        <Dialog open={confirmDialog.open} onOpenChange={(open) => !isMutating && setConfirmDialog({ open, action: null, project: null })}>
          <DialogContent className="border-[#2D333B] bg-[#0D1117]">
            <DialogHeader>
              <DialogTitle className="text-white">
                {confirmDialog.action === 'pause' && 'Pause Project'}
                {confirmDialog.action === 'resume' && 'Resume Project'}
                {confirmDialog.action === 'stop' && 'Stop Project'}
              </DialogTitle>
              <DialogDescription className="text-gray-400">
                {confirmDialog.action === 'pause' &&
                  'Are you sure you want to pause this project? You can resume it later.'}
                {confirmDialog.action === 'resume' &&
                  'Are you sure you want to resume this project?'}
                {confirmDialog.action === 'stop' &&
                  'Are you sure you want to stop this project? This action cannot be undone.'}
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4 rounded-lg border border-[#2D333B] bg-[#161B22] p-3">
              <p className="font-medium text-white">
                {confirmDialog.project?.name}
              </p>
              {confirmDialog.project?.description && (
                <p className="mt-1 text-sm text-gray-400">
                  {confirmDialog.project.description}
                </p>
              )}
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() =>
                  setConfirmDialog({ open: false, action: null, project: null })
                }
                disabled={isMutating}
                className="border-[#2D333B] text-gray-400 hover:bg-[#161B22]"
              >
                Cancel
              </Button>
              <Button
                onClick={confirmAction}
                disabled={isMutating}
                className={
                  confirmDialog.action === 'stop'
                    ? 'bg-red-500 hover:bg-red-600'
                    : confirmDialog.action === 'pause'
                    ? 'bg-yellow-500 hover:bg-yellow-600'
                    : 'bg-green-500 hover:bg-green-600'
                }
              >
                {isMutating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    {confirmDialog.action === 'pause' && 'Pause Project'}
                    {confirmDialog.action === 'resume' && 'Resume Project'}
                    {confirmDialog.action === 'stop' && 'Stop Project'}
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>
    </div>
  );
}
