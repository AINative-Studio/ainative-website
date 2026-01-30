'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Database,
  Key,
  Plus,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Loader2,
  ExternalLink,
  Eye,
  EyeOff,
  Package,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  zeroDBSetupService,
  type ZeroDBProject,
  type ApiKey as APIKey,
  type ZeroDBProjectStats as ProjectStats,
} from '@/lib/agent-swarm-wizard-service';

interface ZeroDBSetupStepProps {
  onComplete: (data: { apiKey: string; project: ZeroDBProject }) => void;
}

export default function ZeroDBSetupStep({ onComplete }: ZeroDBSetupStepProps) {
  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [projects, setProjects] = useState<ZeroDBProject[]>([]);
  const [projectStats, setProjectStats] = useState<ProjectStats | null>(null);
  const [selectedApiKey, setSelectedApiKey] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<ZeroDBProject | null>(null);
  const [newApiKeyName, setNewApiKeyName] = useState('');
  const [newApiKeyDescription, setNewApiKeyDescription] = useState('');
  const [createdApiKey, setCreatedApiKey] = useState<string | null>(null);
  const [showCreatedKey, setShowCreatedKey] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');
  const [isCreatingApiKey, setIsCreatingApiKey] = useState(false);
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [isLoadingKeys, setIsLoadingKeys] = useState(true);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateKeyForm, setShowCreateKeyForm] = useState(false);
  const [showCreateProjectForm, setShowCreateProjectForm] = useState(false);

  useEffect(() => {
    fetchApiKeys();
    fetchProjects();
    fetchProjectStats();
  }, []);

  const fetchApiKeys = async () => {
    setIsLoadingKeys(true);
    try {
      const data = await zeroDBSetupService.listApiKeys();
      setApiKeys(data.api_keys || []);
    } catch (err) {
      console.error('Failed to fetch API keys:', err);
    } finally {
      setIsLoadingKeys(false);
    }
  };

  const fetchProjects = async () => {
    setIsLoadingProjects(true);
    try {
      const data = await zeroDBSetupService.listProjects();
      setProjects(data as ZeroDBProject[]);
    } catch (err) {
      console.error('Failed to fetch projects:', err);
    } finally {
      setIsLoadingProjects(false);
    }
  };

  const fetchProjectStats = async () => {
    try {
      const data = await zeroDBSetupService.getProjectStats();
      setProjectStats(data);
    } catch (err) {
      console.error('Failed to fetch project stats:', err);
    }
  };

  const createApiKey = async () => {
    if (!newApiKeyName.trim()) {
      setError('Please enter a name for the API key');
      return;
    }

    setIsCreatingApiKey(true);
    setError(null);

    try {
      const data = await zeroDBSetupService.createApiKey(newApiKeyName, newApiKeyDescription);
      setCreatedApiKey(data.api_key);
      setSelectedApiKey(data.api_key);
      setNewApiKeyName('');
      setNewApiKeyDescription('');
      setShowCreateKeyForm(false);
      fetchApiKeys();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create API key. Please try again.';
      setError(errorMessage);
      console.error('Create API key error:', err);
    } finally {
      setIsCreatingApiKey(false);
    }
  };

  const createProject = async () => {
    if (!newProjectName.trim()) {
      setError('Please enter a name for the project');
      return;
    }

    setIsCreatingProject(true);
    setError(null);

    try {
      const data = await zeroDBSetupService.createProject(
        newProjectName,
        newProjectDescription,
        { tier: 'free', databaseEnabled: true, organizationId: null }
      );
      setSelectedProject(data);
      setNewProjectName('');
      setNewProjectDescription('');
      setShowCreateProjectForm(false);
      fetchProjects();
      fetchProjectStats();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create project. Please try again.';
      // Check for project limit error
      if (errorMessage.includes('403') || errorMessage.toLowerCase().includes('limit')) {
        setError('Project limit reached for your tier. Upgrade to create more projects.');
      } else {
        setError(errorMessage);
      }
      console.error('Create project error:', err);
    } finally {
      setIsCreatingProject(false);
    }
  };

  const copyApiKey = () => {
    if (createdApiKey) {
      navigator.clipboard.writeText(createdApiKey);
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    }
  };

  const handleContinue = () => {
    if (selectedApiKey && selectedProject) {
      onComplete({ apiKey: selectedApiKey, project: selectedProject });
    }
  };

  const isAtProjectLimit = projectStats && projectStats.total_projects >= 1; // Free tier limit

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-4xl mx-auto space-y-6"
    >
      {/* API Key Section */}
      <Card className="bg-[#161B22] border-[#2D333B]">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#8A63F4]/10">
              <Key className="h-6 w-6 text-[#D4B4FF]" />
            </div>
            <div>
              <CardTitle className="text-2xl text-white">ZeroDB API Key</CardTitle>
              <CardDescription className="text-gray-400 mt-1">
                Select an existing API key or create a new one
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {createdApiKey && (
            <Alert className="bg-yellow-500/10 border-yellow-500/30">
              <AlertCircle className="h-5 w-5 text-yellow-400" />
              <AlertTitle className="text-yellow-400 font-semibold">Save This Key</AlertTitle>
              <AlertDescription className="space-y-3">
                <p className="text-gray-300">
                  This is your API key. Copy it now - you will not be able to see it again!
                </p>
                <div className="flex items-center gap-2 p-3 bg-[#0D1117] rounded-lg border border-[#2D333B]">
                  <code className="flex-1 text-white font-mono text-sm break-all">
                    {showCreatedKey ? createdApiKey : '•'.repeat(50)}
                  </code>
                  <button
                    onClick={() => setShowCreatedKey(!showCreatedKey)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {showCreatedKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                  <Button onClick={copyApiKey} size="sm" variant="outline">
                    {copiedKey ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {isLoadingKeys ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-[#8AB4FF]" />
            </div>
          ) : apiKeys.length > 0 ? (
            <div className="space-y-3">
              <label className="text-white font-medium block">Select API Key</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {apiKeys.map((key) => (
                  <button
                    key={key.id}
                    onClick={() => setSelectedApiKey(key.prefix)}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      selectedApiKey === key.prefix
                        ? 'border-[#8A63F4] bg-[#8A63F4]/10'
                        : 'border-[#2D333B] bg-[#0D1117] hover:border-[#8A63F4]/40'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-semibold">{key.name}</span>
                      {selectedApiKey === key.prefix && (
                        <CheckCircle2 className="h-5 w-5 text-[#8A63F4]" />
                      )}
                    </div>
                    <code className="text-gray-400 text-sm font-mono">{key.prefix}...</code>
                    <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                      <span>Used {key.usage_count} times</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <Alert className="bg-[#4B6FED]/5 border-[#4B6FED]/20">
              <AlertCircle className="h-5 w-5 text-[#8AB4FF]" />
              <AlertDescription className="text-gray-300">
                No API keys found. Create one to continue.
              </AlertDescription>
            </Alert>
          )}

          {showCreateKeyForm ? (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="space-y-4 p-4 bg-[#0D1117] rounded-lg border border-[#2D333B]"
            >
              <div>
                <label className="text-white font-medium block mb-2">Key Name</label>
                <Input
                  value={newApiKeyName}
                  onChange={(e) => setNewApiKeyName(e.target.value)}
                  placeholder="agent-swarm-key"
                  className="bg-[#161B22] border-[#2D333B] text-white"
                />
              </div>
              <div>
                <label className="text-white font-medium block mb-2">Description (Optional)</label>
                <Input
                  value={newApiKeyDescription}
                  onChange={(e) => setNewApiKeyDescription(e.target.value)}
                  placeholder="API key for Agent Swarm project"
                  className="bg-[#161B22] border-[#2D333B] text-white"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={createApiKey}
                  disabled={isCreatingApiKey || !newApiKeyName.trim()}
                  className="flex-1 bg-[#8A63F4] hover:bg-[#7A53E4]"
                >
                  {isCreatingApiKey ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Key
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => setShowCreateKeyForm(false)}
                  variant="outline"
                  className="border-[#2D333B]"
                >
                  Cancel
                </Button>
              </div>
            </motion.div>
          ) : (
            <Button
              onClick={() => setShowCreateKeyForm(true)}
              variant="outline"
              className="w-full border-[#8A63F4]/30 hover:border-[#8A63F4] text-[#D4B4FF]"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create New API Key
            </Button>
          )}
        </CardContent>
      </Card>

      {/* ZeroDB Project Section */}
      <Card className="bg-[#161B22] border-[#2D333B]">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#4B6FED]/10">
              <Database className="h-6 w-6 text-[#8AB4FF]" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-2xl text-white">ZeroDB Project</CardTitle>
              <CardDescription className="text-gray-400 mt-1">
                Select or create a ZeroDB project for Agent Swarm
              </CardDescription>
            </div>
            {projectStats && (
              <Badge className="bg-[#4B6FED]/20 text-[#8AB4FF] border-[#4B6FED]/30">
                {projectStats.total_projects} / 1 Projects
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {isAtProjectLimit && !selectedProject && (
            <Alert className="bg-yellow-500/10 border-yellow-500/30">
              <AlertCircle className="h-5 w-5 text-yellow-400" />
              <AlertTitle className="text-yellow-400">Project Limit Reached</AlertTitle>
              <AlertDescription className="text-gray-300">
                <p>You've reached the free tier limit (1 project). You can:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Use an existing project</li>
                  <li>
                    <a
                      href="/pricing?upgrade=pro"
                      className="text-[#8AB4FF] hover:text-[#4B6FED] inline-flex items-center gap-1"
                    >
                      Upgrade to Pro (5 projects)
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </li>
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {isLoadingProjects ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-[#8AB4FF]" />
            </div>
          ) : projects.length > 0 ? (
            <div className="space-y-3">
              <label className="text-white font-medium block">Select Project</label>
              <div className="grid grid-cols-1 gap-3">
                {projects.map((project) => (
                  <button
                    key={project.id}
                    onClick={() => setSelectedProject(project)}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      selectedProject?.id === project.id
                        ? 'border-[#4B6FED] bg-[#4B6FED]/10'
                        : 'border-[#2D333B] bg-[#0D1117] hover:border-[#4B6FED]/40'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Package className="h-4 w-4 text-[#8AB4FF]" />
                          <span className="text-white font-semibold">{project.name}</span>
                          <Badge
                            className={`text-xs ${
                              project.status === 'ACTIVE'
                                ? 'bg-green-500/20 text-green-300 border-green-500/30'
                                : 'bg-gray-500/20 text-gray-300 border-gray-500/30'
                            }`}
                          >
                            {project.status}
                          </Badge>
                          <Badge className="bg-[#4B6FED]/20 text-[#8AB4FF] border-[#4B6FED]/30 text-xs">
                            {project.tier}
                          </Badge>
                        </div>
                        {project.description && (
                          <p className="text-gray-400 text-sm mt-1">{project.description}</p>
                        )}
                        {project.usage && (
                          <div className="flex gap-4 mt-2 text-xs text-gray-500">
                            <span>{project.usage.vectors_count} vectors</span>
                            <span>{project.usage.tables_count} tables</span>
                            <span>{project.usage.events_count} events</span>
                          </div>
                        )}
                      </div>
                      {selectedProject?.id === project.id && (
                        <CheckCircle2 className="h-5 w-5 text-[#4B6FED] flex-shrink-0" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <Alert className="bg-[#4B6FED]/5 border-[#4B6FED]/20">
              <AlertCircle className="h-5 w-5 text-[#8AB4FF]" />
              <AlertDescription className="text-gray-300">
                No projects found. Create one to continue.
              </AlertDescription>
            </Alert>
          )}

          {showCreateProjectForm ? (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="space-y-4 p-4 bg-[#0D1117] rounded-lg border border-[#2D333B]"
            >
              <div>
                <label className="text-white font-medium block mb-2">Project Name</label>
                <Input
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="my-agent-swarm-project"
                  className="bg-[#161B22] border-[#2D333B] text-white"
                />
              </div>
              <div>
                <label className="text-white font-medium block mb-2">Description (Optional)</label>
                <Textarea
                  value={newProjectDescription}
                  onChange={(e) => setNewProjectDescription(e.target.value)}
                  placeholder="ZeroDB project for Agent Swarm"
                  className="bg-[#161B22] border-[#2D333B] text-white"
                  rows={3}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={createProject}
                  disabled={isCreatingProject || !newProjectName.trim()}
                  className="flex-1 bg-[#4B6FED] hover:bg-[#3A56D3]"
                >
                  {isCreatingProject ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Project
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => setShowCreateProjectForm(false)}
                  variant="outline"
                  className="border-[#2D333B]"
                >
                  Cancel
                </Button>
              </div>
            </motion.div>
          ) : (
            !isAtProjectLimit && (
              <Button
                onClick={() => setShowCreateProjectForm(true)}
                variant="outline"
                className="w-full border-[#4B6FED]/30 hover:border-[#4B6FED] text-[#8AB4FF]"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create New Project
              </Button>
            )
          )}
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert className="bg-red-500/10 border-red-500/30">
          <AlertCircle className="h-5 w-5 text-red-400" />
          <AlertTitle className="text-red-400">Error</AlertTitle>
          <AlertDescription className="text-gray-300">{error}</AlertDescription>
        </Alert>
      )}

      {/* Continue Button */}
      {selectedApiKey && selectedProject && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Button
            onClick={handleContinue}
            className="w-full bg-gradient-to-r from-[#4B6FED] to-[#8A63F4] hover:from-[#3A56D3] hover:to-[#7A4FEB]"
            size="lg"
          >
            Continue to Next Step
            <CheckCircle2 className="ml-2 h-5 w-5" />
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
}
