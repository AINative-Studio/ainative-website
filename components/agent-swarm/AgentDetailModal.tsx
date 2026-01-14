'use client';

/**
 * AgentDetailModal Component
 *
 * Displays comprehensive agent information in a modal including:
 * - Agent Profile: name, specialization, tasks assigned/completed/remaining
 * - Current Activity: current issue, files being modified, time on task
 * - Task History: completed tasks, time per task, PRs created
 * - Performance Metrics: average time, success rate, LOC written
 */

import { motion } from 'framer-motion';
import {
    Clock,
    CheckCircle2,
    AlertCircle,
    FileCode,
    GitMerge,
    ExternalLink,
    Activity,
    TrendingUp,
    Code,
    Timer,
    ChevronRight,
} from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { AgentStatusIndicator } from './AgentStatusIndicator';
import type { AgentDetailModalProps, CompletedTask } from '@/types/agent-team.types';

/**
 * Format minutes to human-readable duration
 */
function formatDuration(minutes: number): string {
    if (minutes < 60) {
        return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

/**
 * Format date to relative time
 */
function formatRelativeTime(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;

    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
}

/**
 * TaskHistoryItem displays a single completed task
 */
function TaskHistoryItem({ task }: { task: CompletedTask }) {
    return (
        <motion.div
            className="p-3 rounded-lg bg-[#0D1117] border border-gray-800 hover:border-gray-700 transition-colors"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            data-testid={`task-history-item-${task.id}`}
        >
            <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span className="text-sm font-medium text-white">
                        {task.name}
                    </span>
                </div>
                <span className="text-xs text-gray-500">
                    {formatRelativeTime(task.completedAt)}
                </span>
            </div>

            <div className="flex items-center gap-4 text-xs text-gray-400">
                <span className="flex items-center gap-1">
                    <Timer className="w-3 h-3" />
                    {formatDuration(task.durationMinutes)}
                </span>
                <span className="flex items-center gap-1">
                    <FileCode className="w-3 h-3" />
                    {task.filesModified} files
                </span>
                <span className="flex items-center gap-1">
                    <Code className="w-3 h-3" />
                    {task.linesOfCode} LOC
                </span>
            </div>

            {task.pullRequestUrl && (
                <a
                    href={task.pullRequestUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 mt-2 text-xs text-[#8AB4FF] hover:underline"
                >
                    <GitMerge className="w-3 h-3" />
                    View Pull Request
                    <ExternalLink className="w-3 h-3" />
                </a>
            )}
        </motion.div>
    );
}

/**
 * MetricCard displays a single performance metric
 */
function MetricCard({
    label,
    value,
    icon: Icon,
    color = 'text-[#8AB4FF]',
}: {
    label: string;
    value: string | number;
    icon: typeof Activity;
    color?: string;
}) {
    return (
        <div
            className="p-3 rounded-lg bg-[#0D1117] border border-gray-800"
            data-testid={`metric-${label.toLowerCase().replace(/\s+/g, '-')}`}
        >
            <div className="flex items-center gap-2 mb-1">
                <Icon className={cn('w-4 h-4', color)} />
                <span className="text-xs text-gray-500">{label}</span>
            </div>
            <p className="text-lg font-semibold text-white">{value}</p>
        </div>
    );
}

/**
 * AgentDetailModal displays comprehensive information about an agent
 */
export function AgentDetailModal({
    agent,
    isOpen,
    onClose,
}: AgentDetailModalProps) {
    if (!agent) return null;

    const { role, runtime, activity, taskHistory, performance } = agent;
    const Icon = role.icon;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent
                className="max-w-2xl bg-[#161B22] border-gray-800 text-white overflow-hidden"
                data-testid="agent-detail-modal"
            >
                <DialogHeader className="pb-4 border-b border-gray-800">
                    {/* Agent header with icon, name, and status */}
                    <div className="flex items-start gap-4">
                        <div
                            className={cn(
                                'p-3 rounded-xl',
                                `bg-gradient-to-br ${role.color}/20`
                            )}
                        >
                            <Icon className="w-8 h-8 text-[#8AB4FF]" />
                        </div>

                        <div className="flex-1">
                            <DialogTitle className="text-xl font-bold text-white flex items-center gap-3">
                                {role.name}
                                <AgentStatusIndicator
                                    status={runtime.status}
                                    size="sm"
                                    showLabel={true}
                                />
                            </DialogTitle>
                            <DialogDescription className="text-gray-400 mt-1">
                                {role.specialization}
                            </DialogDescription>

                            {/* Capabilities badges */}
                            <div className="flex flex-wrap gap-1.5 mt-2">
                                {role.capabilities.map((capability) => (
                                    <Badge
                                        key={capability}
                                        variant="secondary"
                                        className="bg-[#0D1117] text-gray-300 text-xs"
                                    >
                                        {capability}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    </div>
                </DialogHeader>

                <Tabs defaultValue="activity" className="mt-4">
                    <TabsList className="bg-[#0D1117] border border-gray-800 w-full justify-start">
                        <TabsTrigger
                            value="activity"
                            className="data-[state=active]:bg-[#4B6FED]/20"
                        >
                            <Activity className="w-4 h-4 mr-2" />
                            Current Activity
                        </TabsTrigger>
                        <TabsTrigger
                            value="history"
                            className="data-[state=active]:bg-[#4B6FED]/20"
                        >
                            <Clock className="w-4 h-4 mr-2" />
                            Task History
                        </TabsTrigger>
                        <TabsTrigger
                            value="metrics"
                            className="data-[state=active]:bg-[#4B6FED]/20"
                        >
                            <TrendingUp className="w-4 h-4 mr-2" />
                            Performance
                        </TabsTrigger>
                    </TabsList>

                    {/* Current Activity Tab */}
                    <TabsContent value="activity" className="mt-4 space-y-4">
                        {/* Task progress summary */}
                        <div className="p-4 rounded-lg bg-[#0D1117] border border-gray-800">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-sm text-gray-400">
                                    Task Progress
                                </span>
                                <span className="text-sm font-medium text-white">
                                    {runtime.completedTasks} / {runtime.totalTasks} tasks
                                </span>
                            </div>
                            <Progress
                                value={runtime.progress}
                                className="h-2"
                            />
                            <div className="flex justify-between mt-2 text-xs text-gray-500">
                                <span>{runtime.progress}% complete</span>
                                <span>
                                    {runtime.totalTasks - runtime.completedTasks} remaining
                                </span>
                            </div>
                        </div>

                        {/* Current task details */}
                        <div className="p-4 rounded-lg bg-[#0D1117] border border-gray-800">
                            <h4 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                                <ChevronRight className="w-4 h-4 text-[#8AB4FF]" />
                                Current Task
                            </h4>

                            {runtime.currentTask ? (
                                <div className="space-y-3">
                                    <p className="text-white">
                                        {runtime.currentTask}
                                    </p>

                                    {activity.issueNumber && (
                                        <a
                                            href={activity.issueUrl || '#'}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 text-sm text-[#8AB4FF] hover:underline"
                                        >
                                            <AlertCircle className="w-4 h-4" />
                                            Issue #{activity.issueNumber}: {activity.issueTitle}
                                            <ExternalLink className="w-3 h-3" />
                                        </a>
                                    )}

                                    <div className="flex items-center gap-4 text-sm text-gray-400">
                                        <span className="flex items-center gap-1">
                                            <Timer className="w-4 h-4" />
                                            Time on task: {formatDuration(activity.timeOnTaskMinutes)}
                                        </span>
                                        {activity.estimatedRemainingMinutes !== null && (
                                            <span>
                                                Est. remaining: {formatDuration(activity.estimatedRemainingMinutes)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <p className="text-gray-500 italic">
                                    No active task
                                </p>
                            )}
                        </div>

                        {/* Files being modified */}
                        {activity.filesBeingModified.length > 0 && (
                            <div className="p-4 rounded-lg bg-[#0D1117] border border-gray-800">
                                <h4 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                                    <FileCode className="w-4 h-4 text-[#8AB4FF]" />
                                    Files Being Modified ({activity.filesBeingModified.length})
                                </h4>
                                <div className="space-y-2 max-h-40 overflow-y-auto">
                                    {activity.filesBeingModified.map((file, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between text-sm"
                                        >
                                            <code className="text-gray-300 bg-[#161B22] px-2 py-1 rounded">
                                                {file.path}
                                            </code>
                                            <Badge
                                                variant="outline"
                                                className={cn(
                                                    'text-xs',
                                                    file.type === 'create' && 'border-green-500/50 text-green-400',
                                                    file.type === 'modify' && 'border-yellow-500/50 text-yellow-400',
                                                    file.type === 'delete' && 'border-red-500/50 text-red-400'
                                                )}
                                            >
                                                {file.type}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </TabsContent>

                    {/* Task History Tab */}
                    <TabsContent value="history" className="mt-4">
                        <ScrollArea className="h-[300px] pr-4">
                            {taskHistory.length > 0 ? (
                                <div className="space-y-3">
                                    {taskHistory.map((task) => (
                                        <TaskHistoryItem key={task.id} task={task} />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                    <p>No completed tasks yet</p>
                                </div>
                            )}
                        </ScrollArea>
                    </TabsContent>

                    {/* Performance Metrics Tab */}
                    <TabsContent value="metrics" className="mt-4">
                        <div className="grid grid-cols-2 gap-3">
                            <MetricCard
                                label="Avg Task Time"
                                value={formatDuration(performance.averageTaskTimeMinutes)}
                                icon={Timer}
                            />
                            <MetricCard
                                label="Success Rate"
                                value={`${performance.successRate}%`}
                                icon={TrendingUp}
                                color={performance.successRate >= 90 ? 'text-green-500' : 'text-yellow-500'}
                            />
                            <MetricCard
                                label="Lines of Code"
                                value={performance.totalLinesOfCode.toLocaleString()}
                                icon={Code}
                            />
                            <MetricCard
                                label="Files Modified"
                                value={performance.totalFilesModified}
                                icon={FileCode}
                            />
                            <MetricCard
                                label="PRs Created"
                                value={performance.totalPullRequestsCreated}
                                icon={GitMerge}
                            />
                            <MetricCard
                                label="Tasks Today"
                                value={performance.tasksCompletedToday}
                                icon={Activity}
                            />
                        </div>

                        {/* Weekly summary */}
                        <div className="mt-4 p-4 rounded-lg bg-[#0D1117] border border-gray-800">
                            <h4 className="text-sm font-medium text-gray-300 mb-2">
                                This Week
                            </h4>
                            <p className="text-2xl font-bold text-white">
                                {performance.tasksCompletedThisWeek} tasks completed
                            </p>
                        </div>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}

export default AgentDetailModal;
