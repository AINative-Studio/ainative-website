'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
  Bot,
  Play,
  Pause,
  Square,
  Trash2,
  Plus,
  Settings,
  Activity,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader2,
  Zap,
  RefreshCcw,
  Terminal,
  Wrench,
  Sparkles,
} from 'lucide-react';
import agentService, {
  Agent,
  AgentTemplate,
  AgentRun,
  AgentLog,
  CreateAgentRequest,
  RunAgentRequest,
} from '@/lib/agent-service';

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

export default function AgentsClient() {
  const queryClient = useQueryClient();
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [selectedRun, setSelectedRun] = useState<AgentRun | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showRunDialog, setShowRunDialog] = useState(false);
  const [showLogsDialog, setShowLogsDialog] = useState(false);
  const [runInput, setRunInput] = useState('');

  // Create agent form state
  const [newAgentName, setNewAgentName] = useState('');
  const [newAgentDescription, setNewAgentDescription] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<AgentTemplate | null>(null);
  const [agentType, setAgentType] = useState<'conversational' | 'task-based' | 'workflow' | 'custom'>('conversational');

  // Queries - Real backend API calls with proper error handling
  const {
    data: agents = [],
    isLoading: agentsLoading,
    isError: agentsError,
    error: agentsErrorMessage
  } = useQuery({
    queryKey: ['agents'],
    queryFn: async () => {
      return await agentService.getAgents();
    },
    refetchInterval: 5000, // Poll every 5 seconds for real-time updates
    retry: 2,
    retryDelay: 1000,
  });

  const {
    data: templates = [],
    isError: templatesError,
    error: templatesErrorMessage
  } = useQuery({
    queryKey: ['agent-templates'],
    queryFn: async () => {
      return await agentService.getTemplates();
    },
    retry: 2,
    retryDelay: 1000,
  });

  const {
    data: runs = [],
    isError: runsError,
    error: runsErrorMessage
  } = useQuery({
    queryKey: ['agent-runs', selectedAgent?.id],
    queryFn: async () => {
      if (!selectedAgent) return [];
      return await agentService.getAgentRuns(selectedAgent.id);
    },
    enabled: !!selectedAgent,
    refetchInterval: 3000,
    retry: 2,
    retryDelay: 1000,
  });

  const {
    data: logs = [],
    isError: logsError,
    error: logsErrorMessage
  } = useQuery({
    queryKey: ['agent-logs', selectedAgent?.id, selectedRun?.id],
    queryFn: async () => {
      if (!selectedAgent) return [];
      return await agentService.getAgentLogs(selectedAgent.id, selectedRun?.id);
    },
    enabled: !!selectedAgent && showLogsDialog,
    retry: 2,
    retryDelay: 1000,
  });

  // Mutations - Real backend API calls with proper error handling
  const createAgentMutation = useMutation({
    mutationFn: async (request: CreateAgentRequest) => {
      return await agentService.createAgent(request);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
      setShowCreateDialog(false);
      resetCreateForm();
    },
    onError: (error: Error) => {
      console.error('Failed to create agent:', error);
      // Error is displayed via the UI (mutation.isError state)
    },
  });

  const deleteAgentMutation = useMutation({
    mutationFn: async (agentId: string) => {
      return await agentService.deleteAgent(agentId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
      setSelectedAgent(null);
    },
    onError: (error: Error) => {
      console.error('Failed to delete agent:', error);
      // Error is displayed via the UI (mutation.isError state)
    },
  });

  const runAgentMutation = useMutation({
    mutationFn: async ({ agentId, request }: { agentId: string; request: RunAgentRequest }) => {
      return await agentService.runAgent(agentId, request);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent-runs'] });
      queryClient.invalidateQueries({ queryKey: ['agents'] });
      setShowRunDialog(false);
      setRunInput('');
    },
    onError: (error: Error) => {
      console.error('Failed to run agent:', error);
      // Error is displayed via the UI (mutation.isError state)
    },
  });

  const resetCreateForm = () => {
    setNewAgentName('');
    setNewAgentDescription('');
    setSelectedTemplate(null);
    setAgentType('conversational');
  };

  const handleCreateAgent = () => {
    if (!newAgentName.trim()) return;

    const request: CreateAgentRequest = {
      name: newAgentName,
      description: newAgentDescription,
      type: agentType,
      templateId: selectedTemplate?.id,
      config: selectedTemplate?.defaultConfig || {
        model: 'claude-3-5-sonnet-20241022',
        temperature: 0.7,
        maxTokens: 4096,
      },
    };

    createAgentMutation.mutate(request);
  };

  const handleRunAgent = () => {
    if (!selectedAgent || !runInput.trim()) return;

    runAgentMutation.mutate({
      agentId: selectedAgent.id,
      request: { input: runInput },
    });
  };

  const handleDeleteAgent = (agentId: string) => {
    if (confirm('Are you sure you want to delete this agent?')) {
      deleteAgentMutation.mutate(agentId);
    }
  };

  const getStatusIcon = (status: Agent['status']) => {
    switch (status) {
      case 'running':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case 'idle':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'paused':
        return <Pause className="h-4 w-4 text-yellow-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'stopped':
        return <Square className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: Agent['status']) => {
    const variants: Record<Agent['status'], 'default' | 'secondary' | 'outline' | 'destructive'> = {
      running: 'default',
      idle: 'secondary',
      paused: 'outline',
      failed: 'destructive',
      stopped: 'outline',
    };
    return (
      <Badge variant={variants[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getRunStatusBadge = (status: AgentRun['status']) => {
    const colors = {
      running: 'bg-blue-500',
      completed: 'bg-green-500',
      failed: 'bg-red-500',
      pending: 'bg-yellow-500',
      cancelled: 'bg-gray-500',
    };
    return (
      <Badge className={colors[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getLogLevelColor = (level: AgentLog['level']) => {
    switch (level) {
      case 'error':
        return 'text-red-500';
      case 'warning':
        return 'text-yellow-500';
      case 'info':
        return 'text-blue-500';
      case 'debug':
        return 'text-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 p-8">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={stagger}
        className="max-w-7xl mx-auto space-y-8"
      >
        {/* Header */}
        <motion.div variants={fadeUp} className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-3">
              <Bot className="h-10 w-10 text-purple-600" />
              Agent Framework
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Create, configure, and manage AI agents with advanced capabilities
            </p>
          </div>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                <Plus className="h-4 w-4 mr-2" />
                Create Agent
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Agent</DialogTitle>
                <DialogDescription>
                  Configure your AI agent from a template or create a custom one
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="agent-name">Agent Name</Label>
                  <Input
                    id="agent-name"
                    placeholder="e.g., Customer Support Bot"
                    value={newAgentName}
                    onChange={(e) => setNewAgentName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="agent-description">Description (Optional)</Label>
                  <Textarea
                    id="agent-description"
                    placeholder="Describe what this agent does..."
                    value={newAgentDescription}
                    onChange={(e) => setNewAgentDescription(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="agent-type">Agent Type</Label>
                  <Select value={agentType} onValueChange={(v) => setAgentType(v as typeof agentType)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="conversational">Conversational</SelectItem>
                      <SelectItem value="task-based">Task-Based</SelectItem>
                      <SelectItem value="workflow">Workflow</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Choose a Template (Optional)</Label>
                  {templatesError ? (
                    <div className="text-center py-6 text-red-500">
                      <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                      <p className="text-sm">Failed to load templates</p>
                      <p className="text-xs mt-1 text-gray-600 dark:text-gray-400">
                        {templatesErrorMessage?.message || 'An error occurred'}
                      </p>
                    </div>
                  ) : templates.length === 0 ? (
                    <div className="text-center py-6 text-gray-500">
                      <p className="text-sm">No templates available</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      {templates.map((template) => (
                        <Card
                          key={template.id}
                          className={`cursor-pointer transition-all hover:shadow-lg ${
                            selectedTemplate?.id === template.id
                              ? 'border-purple-500 bg-purple-50 dark:bg-purple-950'
                              : ''
                          }`}
                          onClick={() => setSelectedTemplate(template)}
                        >
                          <CardHeader className="pb-3">
                            <CardTitle className="text-sm flex items-center gap-2">
                              <Sparkles className="h-4 w-4" />
                              {template.name}
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              {template.description}
                            </p>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {template.tags.slice(0, 2).map((tag) => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
                {createAgentMutation.isError && (
                  <div className="p-3 bg-red-50 dark:bg-red-950 rounded-lg border border-red-200 dark:border-red-800">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-red-700 dark:text-red-300">
                          Failed to create agent
                        </p>
                        <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                          {(createAgentMutation.error as Error)?.message || 'An error occurred'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateAgent}
                    disabled={!newAgentName.trim() || createAgentMutation.isPending}
                  >
                    {createAgentMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      'Create Agent'
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </motion.div>

        {/* Stats Cards */}
        <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Agents</p>
                  <p className="text-3xl font-bold mt-1">{agents.length}</p>
                </div>
                <Bot className="h-10 w-10 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Active Agents</p>
                  <p className="text-3xl font-bold mt-1">
                    {agents.filter((a) => a.status === 'running').length}
                  </p>
                </div>
                <Activity className="h-10 w-10 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Runs</p>
                  <p className="text-3xl font-bold mt-1">
                    {agents.reduce((sum, a) => sum + a.runCount, 0)}
                  </p>
                </div>
                <Zap className="h-10 w-10 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Templates</p>
                  <p className="text-3xl font-bold mt-1">{templates.length}</p>
                </div>
                <Sparkles className="h-10 w-10 text-pink-600" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Content */}
        <motion.div variants={fadeUp} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Agent List */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                Your Agents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[600px] overflow-y-auto pr-4">
                {agentsLoading ? (
                  <div className="flex items-center justify-center h-40">
                    <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
                  </div>
                ) : agentsError ? (
                  <div className="text-center py-12 text-red-500">
                    <AlertCircle className="h-12 w-12 mx-auto mb-4" />
                    <p className="font-semibold">Failed to load agents</p>
                    <p className="text-sm mt-2 text-gray-600 dark:text-gray-400">
                      {agentsErrorMessage?.message || 'An error occurred while fetching agents'}
                    </p>
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => queryClient.invalidateQueries({ queryKey: ['agents'] })}
                    >
                      <RefreshCcw className="h-4 w-4 mr-2" />
                      Retry
                    </Button>
                  </div>
                ) : agents.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No agents yet</p>
                    <p className="text-sm">Create your first agent to get started</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {agents.map((agent) => (
                      <Card
                        key={agent.id}
                        className={`cursor-pointer transition-all hover:shadow-md ${
                          selectedAgent?.id === agent.id
                            ? 'border-purple-500 bg-purple-50 dark:bg-purple-950'
                            : ''
                        }`}
                        onClick={() => setSelectedAgent(agent)}
                      >
                        <CardContent className="pt-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <h3 className="font-semibold flex items-center gap-2">
                                {getStatusIcon(agent.status)}
                                {agent.name}
                              </h3>
                              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                {agent.description || 'No description'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center justify-between mt-3">
                            {getStatusBadge(agent.status)}
                            <span className="text-xs text-gray-500">
                              {agent.runCount} runs
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Agent Details */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  {selectedAgent ? selectedAgent.name : 'Select an Agent'}
                </CardTitle>
                {selectedAgent && (
                  <div className="flex items-center gap-2">
                    <Dialog open={showRunDialog} onOpenChange={setShowRunDialog}>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline">
                          <Play className="h-4 w-4 mr-2" />
                          Run
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Run Agent</DialogTitle>
                          <DialogDescription>
                            Provide input for {selectedAgent.name}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="run-input">Input</Label>
                            <Textarea
                              id="run-input"
                              placeholder="Enter your prompt or task..."
                              value={runInput}
                              onChange={(e) => setRunInput(e.target.value)}
                              rows={5}
                            />
                          </div>
                          {runAgentMutation.isError && (
                            <div className="p-3 bg-red-50 dark:bg-red-950 rounded-lg border border-red-200 dark:border-red-800">
                              <div className="flex items-start gap-2">
                                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                                <div>
                                  <p className="text-sm font-semibold text-red-700 dark:text-red-300">
                                    Failed to run agent
                                  </p>
                                  <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                                    {(runAgentMutation.error as Error)?.message || 'An error occurred'}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setShowRunDialog(false)}>
                              Cancel
                            </Button>
                            <Button
                              onClick={handleRunAgent}
                              disabled={!runInput.trim() || runAgentMutation.isPending}
                            >
                              {runAgentMutation.isPending ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  Running...
                                </>
                              ) : (
                                <>
                                  <Play className="h-4 w-4 mr-2" />
                                  Run Agent
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowLogsDialog(true)}
                    >
                      <Terminal className="h-4 w-4 mr-2" />
                      Logs
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteAgent(selectedAgent.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {!selectedAgent ? (
                <div className="text-center py-20 text-gray-500">
                  <Bot className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p>Select an agent to view details</p>
                </div>
              ) : (
                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="config">Configuration</TabsTrigger>
                    <TabsTrigger value="runs">Run History</TabsTrigger>
                  </TabsList>
                  <TabsContent value="overview" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-gray-600 dark:text-gray-400">Type</Label>
                        <p className="font-semibold capitalize">{selectedAgent.type}</p>
                      </div>
                      <div>
                        <Label className="text-gray-600 dark:text-gray-400">Status</Label>
                        <div className="mt-1">{getStatusBadge(selectedAgent.status)}</div>
                      </div>
                      <div>
                        <Label className="text-gray-600 dark:text-gray-400">Total Runs</Label>
                        <p className="font-semibold">{selectedAgent.runCount}</p>
                      </div>
                      <div>
                        <Label className="text-gray-600 dark:text-gray-400">Last Run</Label>
                        <p className="font-semibold">
                          {selectedAgent.lastRunAt
                            ? new Date(selectedAgent.lastRunAt).toLocaleString()
                            : 'Never'}
                        </p>
                      </div>
                      <div className="col-span-2">
                        <Label className="text-gray-600 dark:text-gray-400">Created</Label>
                        <p className="font-semibold">
                          {new Date(selectedAgent.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <Separator />
                    <div>
                      <Label className="text-gray-600 dark:text-gray-400">Description</Label>
                      <p className="mt-1">
                        {selectedAgent.description || 'No description provided'}
                      </p>
                    </div>
                  </TabsContent>
                  <TabsContent value="config" className="space-y-4">
                    <div className="space-y-3">
                      <div>
                        <Label className="text-gray-600 dark:text-gray-400">Model</Label>
                        <p className="font-mono text-sm">{selectedAgent.config.model || 'N/A'}</p>
                      </div>
                      <div>
                        <Label className="text-gray-600 dark:text-gray-400">Temperature</Label>
                        <p className="font-mono text-sm">
                          {selectedAgent.config.temperature ?? 'N/A'}
                        </p>
                      </div>
                      <div>
                        <Label className="text-gray-600 dark:text-gray-400">Max Tokens</Label>
                        <p className="font-mono text-sm">
                          {selectedAgent.config.maxTokens ?? 'N/A'}
                        </p>
                      </div>
                      <div>
                        <Label className="text-gray-600 dark:text-gray-400">System Prompt</Label>
                        <div className="mt-1 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                          <p className="text-sm font-mono whitespace-pre-wrap">
                            {selectedAgent.config.systemPrompt || 'No system prompt configured'}
                          </p>
                        </div>
                      </div>
                      {selectedAgent.config.tools && selectedAgent.config.tools.length > 0 && (
                        <div>
                          <Label className="text-gray-600 dark:text-gray-400">Tools</Label>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {selectedAgent.config.tools.map((tool) => (
                              <Badge key={tool} variant="secondary">
                                <Wrench className="h-3 w-3 mr-1" />
                                {tool}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {selectedAgent.config.capabilities &&
                        selectedAgent.config.capabilities.length > 0 && (
                          <div>
                            <Label className="text-gray-600 dark:text-gray-400">
                              Capabilities
                            </Label>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {selectedAgent.config.capabilities.map((cap) => (
                                <Badge key={cap} variant="outline">
                                  <Zap className="h-3 w-3 mr-1" />
                                  {cap}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                    </div>
                  </TabsContent>
                  <TabsContent value="runs">
                    <div className="h-[400px] overflow-y-auto pr-4">
                      {runsError ? (
                        <div className="text-center py-12 text-red-500">
                          <AlertCircle className="h-12 w-12 mx-auto mb-4" />
                          <p className="font-semibold">Failed to load run history</p>
                          <p className="text-sm mt-2 text-gray-600 dark:text-gray-400">
                            {runsErrorMessage?.message || 'An error occurred while fetching runs'}
                          </p>
                          <Button
                            variant="outline"
                            className="mt-4"
                            onClick={() => queryClient.invalidateQueries({ queryKey: ['agent-runs'] })}
                          >
                            <RefreshCcw className="h-4 w-4 mr-2" />
                            Retry
                          </Button>
                        </div>
                      ) : runs.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                          <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>No runs yet</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {runs.map((run) => (
                            <Card
                              key={run.id}
                              className="cursor-pointer hover:shadow-md transition-shadow"
                              onClick={() => {
                                setSelectedRun(run);
                                setShowLogsDialog(true);
                              }}
                            >
                              <CardContent className="pt-4">
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      {getRunStatusBadge(run.status)}
                                      <span className="text-xs text-gray-500">
                                        {new Date(run.startedAt).toLocaleString()}
                                      </span>
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                                      {run.input || 'No input'}
                                    </p>
                                  </div>
                                </div>
                                {run.completedAt && (
                                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                    <span className="flex items-center gap-1">
                                      <Clock className="h-3 w-3" />
                                      {run.duration ? `${(run.duration / 1000).toFixed(2)}s` : 'N/A'}
                                    </span>
                                    {run.tokensUsed && (
                                      <span className="flex items-center gap-1">
                                        <Zap className="h-3 w-3" />
                                        {run.tokensUsed} tokens
                                      </span>
                                    )}
                                  </div>
                                )}
                                {run.error && (
                                  <div className="mt-2 p-2 bg-red-50 dark:bg-red-950 rounded text-xs text-red-600 dark:text-red-400">
                                    {run.error}
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Logs Dialog */}
        <Dialog open={showLogsDialog} onOpenChange={setShowLogsDialog}>
          <DialogContent className="max-w-4xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Terminal className="h-5 w-5" />
                Agent Logs
                {selectedRun && (
                  <Badge variant="outline" className="ml-2">
                    Run #{selectedRun.id.slice(-8)}
                  </Badge>
                )}
              </DialogTitle>
              <DialogDescription>
                {selectedAgent?.name} - Real-time execution logs
              </DialogDescription>
            </DialogHeader>
            <div className="h-[500px] w-full overflow-y-auto">
              <div className="space-y-2 font-mono text-sm">
                {logsError ? (
                  <div className="text-center py-12 text-red-500">
                    <AlertCircle className="h-12 w-12 mx-auto mb-4" />
                    <p className="font-semibold">Failed to load logs</p>
                    <p className="text-sm mt-2 text-gray-600 dark:text-gray-400">
                      {logsErrorMessage?.message || 'An error occurred while fetching logs'}
                    </p>
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => queryClient.invalidateQueries({ queryKey: ['agent-logs'] })}
                    >
                      <RefreshCcw className="h-4 w-4 mr-2" />
                      Retry
                    </Button>
                  </div>
                ) : logs.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Terminal className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No logs available</p>
                  </div>
                ) : (
                  logs.map((log) => (
                    <div
                      key={log.id}
                      className="p-3 bg-gray-50 dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700"
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-xs text-gray-500 whitespace-nowrap">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </span>
                        <span className={`text-xs font-semibold uppercase ${getLogLevelColor(log.level)}`}>
                          [{log.level}]
                        </span>
                        <span className="flex-1 text-gray-800 dark:text-gray-200">
                          {log.message}
                        </span>
                      </div>
                      {log.metadata && Object.keys(log.metadata).length > 0 && (
                        <div className="mt-2 pl-20 text-xs text-gray-600 dark:text-gray-400">
                          <pre>{JSON.stringify(log.metadata, null, 2)}</pre>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>
    </div>
  );
}
