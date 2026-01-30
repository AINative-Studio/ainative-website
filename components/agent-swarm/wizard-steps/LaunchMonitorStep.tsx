'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Terminal,
    Rocket,
    CheckCircle,
    XCircle,
    Loader2,
    AlertCircle,
    Clock,
    ExternalLink,
    Github,
    RefreshCw,
    Activity,
    Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useAgentSwarmWebSocket } from '@/hooks/useAgentSwarmWebSocket';
import { agentSwarmAIService, type SprintPlan } from '@/lib/agent-swarm-wizard-service';

// ============================================================================
// Types
// ============================================================================

interface LaunchMonitorStepProps {
    projectId: string;
    sprintPlan: SprintPlan;
    onComplete: (result: { repoUrl: string; deploymentUrl?: string }) => void;
    onBack: () => void;
}

interface ExtendedAgentStatus {
    name: string;
    status: 'idle' | 'working' | 'completed' | 'failed';
    progress: number;
    currentTask?: string;
    icon: string;
}

type WorkflowStage =
    | 'initialization'
    | 'requirements_analysis'
    | 'architecture_design'
    | 'frontend_development'
    | 'backend_development'
    | 'integration'
    | 'security_scanning'
    | 'testing'
    | 'deployment_setup'
    | 'validation'
    | 'completion';

// ============================================================================
// Constants
// ============================================================================

const AGENT_CONFIGS: Record<string, { displayName: string; icon: string; color: string }> = {
    architect: { displayName: 'System Architect', icon: '🏗️', color: 'text-purple-400' },
    frontend_developer: { displayName: 'Frontend Developer', icon: '⚛️', color: 'text-blue-400' },
    backend_developer: { displayName: 'Backend Developer', icon: '⚙️', color: 'text-green-400' },
    qa_engineer: { displayName: 'QA Engineer', icon: '🧪', color: 'text-yellow-400' },
    devops_engineer: { displayName: 'DevOps Engineer', icon: '🚀', color: 'text-red-400' },
};

const STAGE_LABELS: Record<WorkflowStage, { label: string; emoji: string }> = {
    initialization: { label: 'Initializing', emoji: '🎬' },
    requirements_analysis: { label: 'Analyzing Requirements', emoji: '📋' },
    architecture_design: { label: 'Designing Architecture', emoji: '🏗️' },
    frontend_development: { label: 'Building Frontend', emoji: '⚛️' },
    backend_development: { label: 'Building Backend', emoji: '⚙️' },
    integration: { label: 'Integration', emoji: '🔗' },
    security_scanning: { label: 'Security Scanning', emoji: '🔒' },
    testing: { label: 'Running Tests', emoji: '🧪' },
    deployment_setup: { label: 'Deployment Setup', emoji: '🚀' },
    validation: { label: 'Validating', emoji: '✅' },
    completion: { label: 'Completed', emoji: '🎉' },
};

const STAGE_ORDER: WorkflowStage[] = [
    'initialization',
    'requirements_analysis',
    'architecture_design',
    'frontend_development',
    'backend_development',
    'integration',
    'security_scanning',
    'testing',
    'deployment_setup',
    'validation',
    'completion',
];

const LOG_TYPE_STYLES = {
    info: { color: 'text-blue-300', icon: '💡' },
    success: { color: 'text-green-300', icon: '✅' },
    error: { color: 'text-red-300', icon: '❌' },
    warning: { color: 'text-yellow-300', icon: '⚠️' },
    agent_status: { color: 'text-purple-300', icon: '🤖' },
};

// ============================================================================
// Main Component
// ============================================================================

export default function LaunchMonitorStep({
    projectId,
    sprintPlan,
    onComplete,
    onBack,
}: LaunchMonitorStepProps) {
    const [hasLaunched, setHasLaunched] = useState(false);
    const [isLaunching, setIsLaunching] = useState(false);
    const [overallProgress, setOverallProgress] = useState(0);
    const [currentStage, setCurrentStage] = useState<WorkflowStage>('initialization');
    const [completedStages, setCompletedStages] = useState<Set<WorkflowStage>>(new Set());
    const [projectCompleted, setProjectCompleted] = useState(false);
    const [projectFailed, setProjectFailed] = useState(false);
    const [repoUrl, setRepoUrl] = useState<string>('');
    const [deploymentUrl, setDeploymentUrl] = useState<string>('');
    const [errorMessage, setErrorMessage] = useState<string>('');

    // WebSocket connection
    const { logs, agents, connected, error: wsError, reconnectAttempts } = useAgentSwarmWebSocket({
        projectId,
        enabled: hasLaunched,
        onConnectionChange: (isConnected) => {
            console.log('WebSocket connection status:', isConnected);
        },
        onError: (err) => {
            console.error('WebSocket error:', err);
            setErrorMessage(err);
        },
    });

    // Convert agent map to array with display info
    const agentStatuses = useMemo<ExtendedAgentStatus[]>(() => {
        const result: ExtendedAgentStatus[] = [];

        Object.keys(AGENT_CONFIGS).forEach((agentKey) => {
            const agentData = agents.get(agentKey);
            const config = AGENT_CONFIGS[agentKey];

            result.push({
                name: config.displayName,
                status: agentData?.status || 'idle',
                progress: agentData?.progress || 0,
                currentTask: agentData?.currentTask,
                icon: config.icon,
            });
        });

        return result;
    }, [agents]);

    // Calculate estimated completion time
    const estimatedMinutes = useMemo(() => {
        const totalSprints = sprintPlan.total_sprints || 1;
        return Math.max(10, Math.min(totalSprints * 3, 30));
    }, [sprintPlan]);

    // Handle WebSocket messages for progress and stage updates
    // Using a ref to track processed logs and batching state updates
    const processedLogCount = useRef(0);

    useEffect(() => {
        if (logs.length === 0 || logs.length <= processedLogCount.current) return;

        // Process only new logs since last check
        const newLogs = logs.slice(processedLogCount.current);
        processedLogCount.current = logs.length;

        // Batch state updates using a microtask to avoid synchronous setState in effect
        queueMicrotask(() => {
            for (const logEntry of newLogs) {
                // Update overall progress from workflow messages
                if (logEntry.type === 'info' && logEntry.message.includes('Progress:')) {
                    const match = logEntry.message.match(/Progress:\s*(\d+)%/);
                    if (match) {
                        const progress = parseInt(match[1], 10);
                        setOverallProgress(progress);
                    }
                }

                // Check for completion
                if (logEntry.type === 'success' && logEntry.message.toLowerCase().includes('completed')) {
                    setProjectCompleted(true);
                    setOverallProgress(100);
                    setCurrentStage('completion');

                    // Extract URLs from message if present
                    const urlMatch = logEntry.message.match(/https:\/\/[^\s]+/g);
                    if (urlMatch) {
                        if (urlMatch[0].includes('github.com')) {
                            setRepoUrl(urlMatch[0]);
                        }
                        if (urlMatch[1]) {
                            setDeploymentUrl(urlMatch[1]);
                        }
                    }
                }

                // Check for errors
                if (logEntry.type === 'error') {
                    setProjectFailed(true);
                    setErrorMessage(logEntry.message);
                }
            }
        });
    }, [logs]);

    // Poll for project status (fallback if WebSocket isn't providing updates)
    useEffect(() => {
        if (!hasLaunched || projectCompleted || projectFailed) return;

        const pollInterval = setInterval(async () => {
            try {
                const status = await agentSwarmAIService.getProjectStatus(projectId);

                setOverallProgress(status.progress);
                setCurrentStage(status.current_stage as WorkflowStage);

                // Update completed stages
                const completed = new Set<WorkflowStage>();
                status.stages_completed.forEach((stage) => {
                    completed.add(stage as WorkflowStage);
                });
                setCompletedStages(completed);

                // Check for completion
                if (status.status === 'completed') {
                    setProjectCompleted(true);
                    if (status.completion_url) {
                        setRepoUrl(status.completion_url);
                    }
                    if (status.deployment_url) {
                        setDeploymentUrl(status.deployment_url);
                    }
                } else if (status.status === 'failed') {
                    setProjectFailed(true);
                    setErrorMessage(status.errors.join(', ') || 'Unknown error occurred');
                }
            } catch (error) {
                console.error('Error polling project status:', error);
            }
        }, 5000);

        return () => clearInterval(pollInterval);
    }, [hasLaunched, projectCompleted, projectFailed, projectId]);

    // Handle launch button click
    const handleLaunch = async () => {
        setIsLaunching(true);
        setHasLaunched(true);
        setErrorMessage('');

        // Simulate initial launch delay
        await new Promise((resolve) => setTimeout(resolve, 2000));

        setIsLaunching(false);
        setOverallProgress(5);
    };

    // Handle completion
    const handleComplete = () => {
        if (repoUrl) {
            onComplete({ repoUrl, deploymentUrl: deploymentUrl || undefined });
        }
    };

    // Handle retry
    const handleRetry = () => {
        setProjectFailed(false);
        setErrorMessage('');
        setHasLaunched(false);
        setOverallProgress(0);
        setCompletedStages(new Set());
        setCurrentStage('initialization');
    };

    // Format timestamp
    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('en-US', {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        });
    };

    // ========================================================================
    // Render: Pre-Launch State
    // ========================================================================

    if (!hasLaunched) {
        return (
            <div className="space-y-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <Card className="border-green-500/20 bg-gradient-to-br from-green-900/10 to-blue-900/10">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3">
                                <Rocket className="w-6 h-6 text-green-400" />
                                Ready to Launch Agent Swarm
                            </CardTitle>
                            <CardDescription className="text-gray-300">
                                Your agents are ready to build your application based on the sprint plan
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Summary */}
                            <div className="space-y-3">
                                <h3 className="text-sm font-semibold text-gray-300">What will be built:</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div className="p-4 bg-black/30 rounded-lg border border-gray-800">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Activity className="w-4 h-4 text-blue-400" />
                                            <span className="text-sm font-medium">Total Sprints</span>
                                        </div>
                                        <p className="text-2xl font-bold text-blue-400">
                                            {sprintPlan.total_sprints}
                                        </p>
                                    </div>
                                    <div className="p-4 bg-black/30 rounded-lg border border-gray-800">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Clock className="w-4 h-4 text-green-400" />
                                            <span className="text-sm font-medium">Duration</span>
                                        </div>
                                        <p className="text-2xl font-bold text-green-400">
                                            {sprintPlan.total_duration_weeks} weeks
                                        </p>
                                    </div>
                                </div>

                                <div className="p-4 bg-black/30 rounded-lg border border-gray-800">
                                    <h4 className="text-sm font-semibold text-gray-300 mb-2">Sprint 1 Goals:</h4>
                                    <ul className="space-y-1">
                                        {sprintPlan.sprints[0]?.goals.slice(0, 3).map((goal, idx) => (
                                            <li key={idx} className="text-sm text-gray-400 flex items-start gap-2">
                                                <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                                                <span>{goal}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            {/* Estimated time */}
                            <div className="p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                    <Zap className="w-5 h-5 text-yellow-400" />
                                    <span className="font-semibold">Estimated Completion Time</span>
                                </div>
                                <p className="text-2xl font-bold text-yellow-400">
                                    {estimatedMinutes} minutes
                                </p>
                                <p className="text-sm text-gray-400 mt-1">
                                    5 AI agents will work in parallel to build your application
                                </p>
                            </div>

                            {/* Launch button */}
                            <div className="flex gap-3">
                                <Button
                                    onClick={onBack}
                                    variant="outline"
                                    className="border-gray-700"
                                    disabled={isLaunching}
                                >
                                    Back to Sprint Plan
                                </Button>
                                <Button
                                    onClick={handleLaunch}
                                    disabled={isLaunching}
                                    className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-bold text-lg py-6"
                                >
                                    {isLaunching ? (
                                        <>
                                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                            Initializing Agents...
                                        </>
                                    ) : (
                                        <>
                                            <Rocket className="w-5 h-5 mr-2" />
                                            Launch Agent Swarm
                                        </>
                                    )}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        );
    }

    // ========================================================================
    // Render: Monitoring State
    // ========================================================================

    if (!projectCompleted && !projectFailed) {
        return (
            <div className="space-y-6">
                {/* Overall Progress */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <Card className="border-blue-500/20">
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Activity className="w-6 h-6 text-blue-400 animate-pulse" />
                                    Building Your Application
                                </div>
                                <Badge variant="outline" className="text-green-400 border-green-400">
                                    {connected ? (
                                        <>
                                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2" />
                                            Live
                                        </>
                                    ) : reconnectAttempts > 0 ? (
                                        <>
                                            <Loader2 className="w-3 h-3 animate-spin mr-2" />
                                            Reconnecting ({reconnectAttempts})
                                        </>
                                    ) : (
                                        <>
                                            <Loader2 className="w-3 h-3 animate-spin mr-2" />
                                            Connecting
                                        </>
                                    )}
                                </Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="font-semibold">Overall Progress</span>
                                    <span className="text-blue-400 font-bold">{overallProgress}%</span>
                                </div>
                                <Progress value={overallProgress} className="h-3" />
                            </div>

                            {/* Current Stage */}
                            <div className="p-4 bg-black/30 rounded-lg border border-gray-800">
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl">{STAGE_LABELS[currentStage]?.emoji || '⚙️'}</span>
                                    <div>
                                        <p className="text-sm text-gray-400">Current Stage</p>
                                        <p className="font-semibold text-lg">
                                            {STAGE_LABELS[currentStage]?.label || currentStage}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Stage Progress */}
                <Card className="border-gray-800">
                    <CardHeader>
                        <CardTitle className="text-lg">Workflow Stages</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {STAGE_ORDER.map((stage, idx) => {
                                const isCompleted = completedStages.has(stage);
                                const isCurrent = stage === currentStage;
                                const config = STAGE_LABELS[stage];

                                return (
                                    <motion.div
                                        key={stage}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className={`flex items-center gap-3 p-3 rounded-lg border ${
                                            isCompleted
                                                ? 'bg-green-900/20 border-green-500/30'
                                                : isCurrent
                                                ? 'bg-blue-900/20 border-blue-500/30'
                                                : 'bg-black/20 border-gray-800'
                                        }`}
                                    >
                                        {isCompleted ? (
                                            <CheckCircle className="w-5 h-5 text-green-400" />
                                        ) : isCurrent ? (
                                            <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
                                        ) : (
                                            <Clock className="w-5 h-5 text-gray-600" />
                                        )}
                                        <span className="text-lg">{config.emoji}</span>
                                        <span
                                            className={`flex-1 font-medium ${
                                                isCompleted
                                                    ? 'text-green-400'
                                                    : isCurrent
                                                    ? 'text-blue-400'
                                                    : 'text-gray-500'
                                            }`}
                                        >
                                            {config.label}
                                        </span>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* Agent Status Grid */}
                <Card className="border-gray-800">
                    <CardHeader>
                        <CardTitle className="text-lg">Agent Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {agentStatuses.map((agent, idx) => (
                                <motion.div
                                    key={agent.name}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className={`p-4 rounded-lg border ${
                                        agent.status === 'completed'
                                            ? 'bg-green-900/20 border-green-500/30'
                                            : agent.status === 'working'
                                            ? 'bg-blue-900/20 border-blue-500/30'
                                            : agent.status === 'failed'
                                            ? 'bg-red-900/20 border-red-500/30'
                                            : 'bg-black/20 border-gray-800'
                                    }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <span className="text-2xl">{agent.icon}</span>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h4 className="font-semibold text-sm">{agent.name}</h4>
                                                {agent.status === 'working' && (
                                                    <Loader2 className="w-3 h-3 animate-spin text-blue-400" />
                                                )}
                                                {agent.status === 'completed' && (
                                                    <CheckCircle className="w-3 h-3 text-green-400" />
                                                )}
                                                {agent.status === 'failed' && (
                                                    <XCircle className="w-3 h-3 text-red-400" />
                                                )}
                                            </div>
                                            {agent.currentTask && (
                                                <p className="text-xs text-gray-400 mb-2 line-clamp-2">
                                                    {agent.currentTask}
                                                </p>
                                            )}
                                            <div className="space-y-1">
                                                <div className="flex items-center justify-between text-xs">
                                                    <span className="text-gray-500 capitalize">{agent.status}</span>
                                                    <span className="font-semibold">{agent.progress}%</span>
                                                </div>
                                                <div className="w-full bg-gray-800 rounded-full h-1.5">
                                                    <motion.div
                                                        className={`h-1.5 rounded-full ${
                                                            agent.status === 'completed'
                                                                ? 'bg-green-400'
                                                                : agent.status === 'working'
                                                                ? 'bg-blue-400'
                                                                : agent.status === 'failed'
                                                                ? 'bg-red-400'
                                                                : 'bg-gray-600'
                                                        }`}
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${agent.progress}%` }}
                                                        transition={{ duration: 0.5 }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Live Log Terminal */}
                <Card className="border-gray-800">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Terminal className="w-5 h-5 text-green-400" />
                            Live Activity Log
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="bg-[#0D1117] font-mono text-xs h-[400px] overflow-y-auto p-4 space-y-1">
                            <AnimatePresence initial={false}>
                                {logs.length === 0 ? (
                                    <div className="text-gray-500 flex items-center gap-2">
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Waiting for agent activity...
                                    </div>
                                ) : (
                                    logs.map((log) => {
                                        const style = LOG_TYPE_STYLES[log.type];
                                        return (
                                            <motion.div
                                                key={log.id}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0 }}
                                                transition={{ duration: 0.2 }}
                                                className={`flex gap-2 ${style.color}`}
                                            >
                                                <span className="text-gray-600">
                                                    [{formatTime(log.timestamp)}]
                                                </span>
                                                <span>{log.emoji || style.icon}</span>
                                                <span className="flex-1">{log.message}</span>
                                            </motion.div>
                                        );
                                    })
                                )}
                            </AnimatePresence>
                        </div>
                    </CardContent>
                </Card>

                {/* Error Display */}
                {(wsError || errorMessage) && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <Card className="border-yellow-500/30 bg-yellow-900/10">
                            <CardContent className="p-4">
                                <div className="flex items-start gap-3">
                                    <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-yellow-400 mb-1">
                                            Connection Warning
                                        </h4>
                                        <p className="text-sm text-gray-300">
                                            {wsError || errorMessage}
                                        </p>
                                        {reconnectAttempts > 0 && (
                                            <p className="text-xs text-gray-400 mt-2">
                                                Attempting to reconnect... (Attempt {reconnectAttempts})
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </div>
        );
    }

    // ========================================================================
    // Render: Completion State
    // ========================================================================

    if (projectCompleted) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="space-y-6"
            >
                <Card className="border-green-500/30 bg-gradient-to-br from-green-900/20 to-blue-900/20">
                    <CardHeader>
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', delay: 0.2 }}
                            className="flex justify-center mb-4"
                        >
                            <div className="relative">
                                <div className="absolute inset-0 bg-green-400 blur-xl opacity-50 animate-pulse" />
                                <CheckCircle className="w-24 h-24 text-green-400 relative" />
                            </div>
                        </motion.div>
                        <CardTitle className="text-center text-3xl font-bold">
                            🎉 Project Completed Successfully!
                        </CardTitle>
                        <CardDescription className="text-center text-lg text-gray-300">
                            Your application has been built and is ready to use
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Repository Link */}
                        {repoUrl && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="p-4 bg-black/30 rounded-lg border border-green-500/30"
                            >
                                <div className="flex items-center gap-2 mb-2">
                                    <Github className="w-5 h-5 text-gray-300" />
                                    <span className="font-semibold">GitHub Repository</span>
                                </div>
                                <a
                                    href={repoUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors group"
                                >
                                    <span className="font-mono text-sm break-all">{repoUrl}</span>
                                    <ExternalLink className="w-4 h-4 flex-shrink-0 group-hover:translate-x-0.5 transition-transform" />
                                </a>
                            </motion.div>
                        )}

                        {/* Deployment Link */}
                        {deploymentUrl && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="p-4 bg-black/30 rounded-lg border border-blue-500/30"
                            >
                                <div className="flex items-center gap-2 mb-2">
                                    <Rocket className="w-5 h-5 text-gray-300" />
                                    <span className="font-semibold">Live Deployment</span>
                                </div>
                                <a
                                    href={deploymentUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors group"
                                >
                                    <span className="font-mono text-sm break-all">{deploymentUrl}</span>
                                    <ExternalLink className="w-4 h-4 flex-shrink-0 group-hover:translate-x-0.5 transition-transform" />
                                </a>
                            </motion.div>
                        )}

                        {/* Action Buttons */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="flex flex-col sm:flex-row gap-3 pt-4"
                        >
                            <Button
                                onClick={handleComplete}
                                className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-bold"
                            >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                View Project Details
                            </Button>
                            {repoUrl && (
                                <Button
                                    onClick={() => window.open(repoUrl, '_blank')}
                                    variant="outline"
                                    className="border-gray-700"
                                >
                                    <Github className="w-4 h-4 mr-2" />
                                    Open Repository
                                </Button>
                            )}
                        </motion.div>

                        {/* Stats */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.6 }}
                            className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-800"
                        >
                            <div className="text-center">
                                <p className="text-2xl font-bold text-green-400">{agentStatuses.length}</p>
                                <p className="text-xs text-gray-400">Agents</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-blue-400">{completedStages.size}</p>
                                <p className="text-xs text-gray-400">Stages</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-purple-400">{logs.length}</p>
                                <p className="text-xs text-gray-400">Log Entries</p>
                            </div>
                        </motion.div>
                    </CardContent>
                </Card>
            </motion.div>
        );
    }

    // ========================================================================
    // Render: Error State
    // ========================================================================

    if (projectFailed) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="space-y-6"
            >
                <Card className="border-red-500/30 bg-red-900/10">
                    <CardHeader>
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', delay: 0.2 }}
                            className="flex justify-center mb-4"
                        >
                            <XCircle className="w-24 h-24 text-red-400" />
                        </motion.div>
                        <CardTitle className="text-center text-2xl font-bold text-red-400">
                            Project Build Failed
                        </CardTitle>
                        <CardDescription className="text-center text-gray-300">
                            An error occurred during the build process
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Error Message */}
                        <div className="p-4 bg-black/50 rounded-lg border border-red-500/30">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                                <div className="flex-1">
                                    <h4 className="font-semibold text-red-400 mb-1">Error Details</h4>
                                    <p className="text-sm text-gray-300 font-mono">
                                        {errorMessage || 'Unknown error occurred'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Partial Progress */}
                        {overallProgress > 0 && (
                            <div className="space-y-2">
                                <p className="text-sm text-gray-400">
                                    Progress before failure: <span className="font-bold">{overallProgress}%</span>
                                </p>
                                <Progress value={overallProgress} className="h-2" />
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            <Button
                                onClick={handleRetry}
                                className="flex-1 bg-blue-600 hover:bg-blue-700"
                            >
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Retry Build
                            </Button>
                            <Button
                                onClick={onBack}
                                variant="outline"
                                className="border-gray-700"
                            >
                                Back to Sprint Plan
                            </Button>
                        </div>

                        {/* Last few logs */}
                        {logs.length > 0 && (
                            <div className="pt-4 border-t border-gray-800">
                                <h4 className="text-sm font-semibold text-gray-300 mb-3">Recent Activity:</h4>
                                <div className="bg-[#0D1117] font-mono text-xs p-3 rounded border border-gray-800 space-y-1 max-h-32 overflow-y-auto">
                                    {logs.slice(-10).map((log) => {
                                        const style = LOG_TYPE_STYLES[log.type];
                                        return (
                                            <div key={log.id} className={`${style.color} text-xs`}>
                                                <span className="text-gray-600">
                                                    [{formatTime(log.timestamp)}]
                                                </span>{' '}
                                                {log.message}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </motion.div>
        );
    }

    return null;
}
