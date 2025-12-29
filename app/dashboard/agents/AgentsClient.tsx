'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
  Eye,
  Edit,
  RefreshCcw,
  Terminal,
  BarChart2,
  MessageSquare,
  Workflow,
  Wrench,
  Code,
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

// Mock data for graceful degradation
const mockTemplates: AgentTemplate[] = [
  {
    id: 'template-1',
    name: 'Customer Support Agent',
    description: 'Intelligent agent for handling customer inquiries and support tickets',
    category: 'customer-service',
    icon: 'MessageSquare',
    defaultConfig: {
      model: 'claude-3-5-sonnet-20241022',
      temperature: 0.7,
      maxTokens: 4096,
      systemPrompt: 'You are a helpful customer support agent. Provide clear, empathetic, and accurate responses.',
      tools: ['web-search', 'knowledge-base', 'ticket-system'],
      capabilities: ['conversation', 'ticket-management', 'escalation'],
    },
    tags: ['customer-service', 'conversational', 'support'],
  },
  {
    id: 'template-2',
    name: 'Code Assistant',
    description: 'AI-powered coding assistant for development tasks',
    category: 'development',
    icon: 'Code',
    defaultConfig: {
      model: 'claude-3-5-sonnet-20241022',
      temperature: 0.3,
      maxTokens: 8192,
      systemPrompt: 'You are an expert software engineer. Write clean, efficient, and well-documented code.',
      tools: ['code-analysis', 'github', 'documentation'],
      capabilities: ['code-generation', 'debugging', 'review'],
    },
    tags: ['development', 'coding', 'automation'],
  },
  {
    id: 'template-3',
    name: 'Data Analyst',
    description: 'Analyze data, generate insights, and create visualizations',
    category: 'data-analysis',
    icon: 'BarChart2',
    defaultConfig: {
      model: 'claude-3-5-sonnet-20241022',
      temperature: 0.5,
      maxTokens: 8192,
      systemPrompt: 'You are a data analyst. Analyze data thoroughly and provide actionable insights.',
      tools: ['data-query', 'visualization', 'statistical-analysis'],
      capabilities: ['data-analysis', 'visualization', 'reporting'],
    },
    tags: ['data-analysis', 'analytics', 'reporting'],
  },
  {
    id: 'template-4',
    name: 'Workflow Automation',
    description: 'Automate complex workflows and business processes',
    category: 'productivity',
    icon: 'Workflow',
    defaultConfig: {
      model: 'claude-3-5-sonnet-20241022',
      temperature: 0.4,
      maxTokens: 4096,
      systemPrompt: 'You are a workflow automation expert. Streamline processes and ensure efficiency.',
      tools: ['api-integration', 'email', 'slack', 'calendar'],
      capabilities: ['automation', 'integration', 'scheduling'],
    },
    tags: ['automation', 'workflow', 'productivity'],
  },
];

const mockAgents: Agent[] = [
  {
    id: 'agent-1',
    name: 'Support Bot Alpha',
    description: 'Main customer support agent',
    type: 'conversational',
    status: 'idle',
    config: {
      model: 'claude-3-5-sonnet-20241022',
      temperature: 0.7,
      maxTokens: 4096,
      systemPrompt: 'You are a helpful customer support agent.',
      tools: ['web-search', 'knowledge-base'],
      capabilities: ['conversation', 'ticket-management'],
    },
    templateId: 'template-1',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    lastRunAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    runCount: 156,
  },
  {
    id: 'agent-2',
    name: 'Code Review Assistant',
    description: 'Automated code review and suggestions',
    type: 'task-based',
    status: 'running',
    config: {
      model: 'claude-3-5-sonnet-20241022',
      temperature: 0.3,
      maxTokens: 8192,
      systemPrompt: 'You are an expert code reviewer.',
      tools: ['github', 'code-analysis'],
      capabilities: ['code-review', 'static-analysis'],
    },
    templateId: 'template-2',
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    lastRunAt: new Date().toISOString(),
    runCount: 89,
  },
  {
    id: 'agent-3',
    name: 'Data Pipeline Monitor',
    description: 'Monitor and analyze data pipelines',
    type: 'workflow',
    status: 'idle',
    config: {
      model: 'claude-3-5-sonnet-20241022',
      temperature: 0.5,
      maxTokens: 8192,
      systemPrompt: 'You monitor data pipelines and provide insights.',
      tools: ['data-query', 'visualization'],
      capabilities: ['monitoring', 'alerting', 'analysis'],
    },
    templateId: 'template-3',
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    lastRunAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    runCount: 342,
  },
];

const mockRuns: AgentRun[] = [
  {
    id: 'run-1',
    agentId: 'agent-1',
    agentName: 'Support Bot Alpha',
    status: 'completed',
    input: 'How do I reset my password?',
    output: 'To reset your password, please follow these steps: 1. Click on "Forgot Password" on the login page...',
    startedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    completedAt: new Date(Date.now() - 2 * 60 * 60 * 1000 + 3000).toISOString(),
    duration: 3000,
    tokensUsed: 245,
    cost: 0.0012,
  },
  {
    id: 'run-2',
    agentId: 'agent-2',
    agentName: 'Code Review Assistant',
    status: 'running',
    input: 'Review the authentication module',
    startedAt: new Date().toISOString(),
    tokensUsed: 1024,
  },
  {
    id: 'run-3',
    agentId: 'agent-3',
    agentName: 'Data Pipeline Monitor',
    status: 'failed',
    input: 'Check pipeline status',
    error: 'Connection timeout to database',
    startedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    completedAt: new Date(Date.now() - 5 * 60 * 60 * 1000 + 15000).toISOString(),
    duration: 15000,
  },
];

const mockLogs: AgentLog[] = [
  {
    id: 'log-1',
    agentId: 'agent-1',
    runId: 'run-1',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    level: 'info',
    message: 'Agent started successfully',
  },
  {
    id: 'log-2',
    agentId: 'agent-1',
    runId: 'run-1',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000 + 1000).toISOString(),
    level: 'info',
    message: 'Processing user query',
    metadata: { input_length: 26 },
  },
  {
    id: 'log-3',
    agentId: 'agent-1',
    runId: 'run-1',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000 + 2000).toISOString(),
    level: 'info',
    message: 'Generated response',
    metadata: { tokens_used: 245 },
  },
  {
    id: 'log-4',
    agentId: 'agent-3',
    runId: 'run-3',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    level: 'error',
    message: 'Database connection failed',
    metadata: { error: 'ETIMEDOUT' },
  },
];

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

  // Queries with mock fallback
  const { data: agents = mockAgents, isLoading: agentsLoading } = useQuery({
    queryKey: ['agents'],
    queryFn: async () => {
      try {
        return await agentService.getAgents();
      } catch (error) {
        console.warn('Using mock agents data:', error);
        return mockAgents;
      }
    },
    refetchInterval: 5000, // Poll every 5 seconds for real-time updates
  });

  const { data: templates = mockTemplates } = useQuery({
    queryKey: ['agent-templates'],
    queryFn: async () => {
      try {
        return await agentService.getTemplates();
      } catch (error) {
        console.warn('Using mock templates:', error);
        return mockTemplates;
      }
    },
  });

  const { data: runs = mockRuns } = useQuery({
    queryKey: ['agent-runs', selectedAgent?.id],
    queryFn: async () => {
      if (!selectedAgent) return mockRuns;
      try {
        return await agentService.getAgentRuns(selectedAgent.id);
      } catch (error) {
        console.warn('Using mock runs:', error);
        return mockRuns.filter(r => r.agentId === selectedAgent.id);
      }
    },
    enabled: !!selectedAgent,
    refetchInterval: 3000,
  });

  const { data: logs = mockLogs } = useQuery({
    queryKey: ['agent-logs', selectedAgent?.id, selectedRun?.id],
    queryFn: async () => {
      if (!selectedAgent) return mockLogs;
      try {
        return await agentService.getAgentLogs(selectedAgent.id, selectedRun?.id);
      } catch (error) {
        console.warn('Using mock logs:', error);
        return mockLogs.filter(l =>
          l.agentId === selectedAgent.id &&
          (!selectedRun || l.runId === selectedRun.id)
        );
      }
    },
    enabled: !!selectedAgent && showLogsDialog,
  });

  // Mutations
  const createAgentMutation = useMutation({
    mutationFn: async (request: CreateAgentRequest) => {
      try {
        return await agentService.createAgent(request);
      } catch (error) {
        console.warn('Mock creating agent:', error);
        const newAgent: Agent = {
          id: `agent-${Date.now()}`,
          name: request.name,
          description: request.description || '',
          type: request.type,
          status: 'idle',
          config: request.config,
          templateId: request.templateId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          runCount: 0,
        };
        return newAgent;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
      setShowCreateDialog(false);
      resetCreateForm();
    },
  });

  const deleteAgentMutation = useMutation({
    mutationFn: async (agentId: string) => {
      try {
        return await agentService.deleteAgent(agentId);
      } catch (error) {
        console.warn('Mock deleting agent:', error);
        return { success: true };
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
      setSelectedAgent(null);
    },
  });

  const runAgentMutation = useMutation({
    mutationFn: async ({ agentId, request }: { agentId: string; request: RunAgentRequest }) => {
      try {
        return await agentService.runAgent(agentId, request);
      } catch (error) {
        console.warn('Mock running agent:', error);
        const newRun: AgentRun = {
          id: `run-${Date.now()}`,
          agentId,
          agentName: selectedAgent?.name || '',
          status: 'running',
          input: request.input,
          startedAt: new Date().toISOString(),
        };
        return newRun;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent-runs'] });
      queryClient.invalidateQueries({ queryKey: ['agents'] });
      setShowRunDialog(false);
      setRunInput('');
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
    const variants = {
      running: 'default',
      idle: 'secondary',
      paused: 'outline',
      failed: 'destructive',
      stopped: 'outline',
    };
    return (
      <Badge variant={variants[status] as any}>
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
                  <Select value={agentType} onValueChange={(v: any) => setAgentType(v)}>
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
                </div>
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
                      {runs.length === 0 ? (
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
                {logs.length === 0 ? (
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
