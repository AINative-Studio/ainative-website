'use client';

/**
 * Agent Swarm Dashboard - Client Component
 * Main UI for orchestrating AI agent swarms to build applications
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Upload,
  FileText,
  Sparkles,
  GitBranch,
  Play,
  Eye,
  Loader2,
  CheckCircle,
  AlertCircle,
  Clock,
  ClipboardPaste,
  Wand2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { agentSwarmService, type AgentSwarmProject } from '@/lib/agent-swarm-service';
import { rlhfService } from '@/lib/rlhf-service';

// Project Card Component
const ProjectCard = ({ project }: { project: AgentSwarmProject }) => {
  return (
    <Card className="bg-surface-secondary border-border">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold mb-1">{project.name}</h3>
            <p className="text-sm text-gray-400">
              Status: <Badge variant="outline">{project.status}</Badge>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" className="border-gray-700">
              <Eye className="w-4 h-4 mr-1" />
              View Logs
            </Button>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Progress</span>
            <span className="text-sm font-medium">{project.progress}%</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-primary to-[#FCAE39] h-2 rounded-full transition-all"
              style={{ width: `${project.progress}%` }}
            ></div>
          </div>
        </div>

        {project.agents && project.agents.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {project.agents.map((agent, index) => (
              <div
                key={index}
                className="p-3 bg-vite-bg rounded-lg border border-border"
              >
                <div className="flex items-center gap-2 mb-2">
                  {agent.status === 'working' && (
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  )}
                  {agent.status === 'completed' && (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  )}
                  {agent.status === 'idle' && (
                    <Clock className="w-4 h-4 text-gray-500" />
                  )}
                  <span className="text-sm font-medium">{agent.name}</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-1">
                  <div
                    className="bg-primary h-1 rounded-full transition-all"
                    style={{ width: `${agent.progress}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Main Component
export default function AgentSwarmClient() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activeProjects, setActiveProjects] = useState<AgentSwarmProject[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [prdText, setPrdText] = useState('');
  const [activeTab, setActiveTab] = useState('upload');
  const [uploading, setUploading] = useState(false);
  const [healthStatus, setHealthStatus] = useState<string>('');

  useEffect(() => {
    checkHealth();
    loadProjects();
  }, []);

  const checkHealth = async () => {
    try {
      const health = await agentSwarmService.healthCheck();
      setHealthStatus(health.status);
    } catch (error) {
      console.error('Health check failed:', error);
      setHealthStatus('unavailable');
    }
  };

  const loadProjects = async () => {
    setLoading(true);
    try {
      const projects = await agentSwarmService.getAllProjects();
      setActiveProjects(projects);
    } catch (error) {
      console.error('Failed to load projects:', error);
      setActiveProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
      }

      // Validate file type
      const fileName = file.name.toLowerCase();
      const allowedExtensions = ['.pdf', '.md', '.markdown', '.txt', '.docx'];
      const hasValidExtension = allowedExtensions.some((ext) => fileName.endsWith(ext));

      if (!hasValidExtension) {
        alert('Only PDF, MD, Markdown, TXT, and DOCX files are supported');
        return;
      }

      setSelectedFile(file);
    }
  };

  const handleCreateProject = async () => {
    setUploading(true);
    try {
      let project: AgentSwarmProject;

      if (selectedFile) {
        // Upload PRD file
        project = await agentSwarmService.uploadPRDAndCreateProject(selectedFile, 'web_app', {
          features: ['user_authentication', 'crud_operations'],
          technologies: ['React', 'FastAPI'],
        });
      } else if (prdText.trim()) {
        // Create from pasted text
        project = await agentSwarmService.createProject({
          project_type: 'web_app',
          description: prdText,
          features: ['user_authentication'],
          technologies: ['React', 'FastAPI'],
        });
      } else {
        alert('Please provide a PRD file or paste PRD content');
        setUploading(false);
        return;
      }

      // Submit RLHF feedback
      await rlhfService.submitFeedback({
        prompt: 'Create agent swarm project',
        response: `Project created: ${project.id}`,
        feedback: 1,
        comment: 'Project creation successful',
      });

      // Reload projects
      await loadProjects();

      // Reset form
      setSelectedFile(null);
      setPrdText('');

      alert(`Project "${project.name}" created successfully!`);
    } catch (error) {
      console.error('Failed to create project:', error);
      alert('Failed to create project. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-3 text-lg">Loading Agent Swarm Dashboard...</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Agent Swarm Dashboard</h1>
            <p className="text-gray-400">
              Upload your PRD and let AI agents build it for you
            </p>
          </div>
          <div className="flex items-center gap-3">
            {healthStatus && (
              <Badge
                variant={healthStatus === 'healthy' ? 'default' : 'destructive'}
                className="px-3 py-1"
              >
                {healthStatus === 'healthy' ? '✓ Service Healthy' : '✗ Service Unavailable'}
              </Badge>
            )}
            <Link href="/dashboard/agent-swarm-wizard">
              <Button className="gap-2">
                <Wand2 className="w-4 h-4" />
                Launch Setup Wizard
              </Button>
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Create Project Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <Card className="bg-surface-secondary border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Create New Agent Swarm Project
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 bg-vite-bg">
                <TabsTrigger value="upload" className="flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  Upload PRD File
                </TabsTrigger>
                <TabsTrigger value="paste" className="flex items-center gap-2">
                  <ClipboardPaste className="w-4 h-4" />
                  Paste PRD Content
                </TabsTrigger>
              </TabsList>

              {/* Upload Tab */}
              <TabsContent value="upload" className="space-y-6 mt-6">
                <div className="border-2 border-dashed border-gray-700 rounded-lg p-12 text-center hover:border-primary transition-colors">
                  <input
                    type="file"
                    id="prd-upload"
                    accept=".pdf,.md,.markdown,.txt,.docx"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <label htmlFor="prd-upload" className="cursor-pointer">
                    <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-lg mb-2">
                      {selectedFile ? selectedFile.name : 'Drop PRD File Here'}
                    </p>
                    <p className="text-sm text-gray-400 mb-4">or click to browse</p>
                    <p className="text-xs text-gray-500">
                      Supported: PDF, MD, Markdown, TXT, DOCX (Max 10MB)
                    </p>
                  </label>
                </div>

                {selectedFile && (
                  <div className="flex items-center justify-between p-4 bg-vite-bg rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-medium">{selectedFile.name}</p>
                        <p className="text-sm text-gray-400">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>

              {/* Paste Tab */}
              <TabsContent value="paste" className="space-y-6 mt-6">
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">
                    Paste your PRD content (Markdown or Plain Text)
                  </label>
                  <textarea
                    value={prdText}
                    onChange={(e) => setPrdText(e.target.value)}
                    placeholder="# Product Requirements Document&#10;&#10;## Project Overview&#10;Describe your project here..."
                    className="w-full h-[400px] p-4 bg-vite-bg border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none font-mono text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    {prdText.length} characters • {prdText.split(/\s+/).filter((w) => w).length}{' '}
                    words
                  </p>
                </div>
              </TabsContent>
            </Tabs>

            <div className="mt-6">
              <Button
                onClick={handleCreateProject}
                disabled={uploading || (!selectedFile && !prdText.trim())}
                className="w-full bg-gradient-to-r from-primary to-[#FCAE39] h-12 text-base text-gray-900 font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Creating Project...
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 mr-2" />
                    Launch Agent Swarm
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Active Projects */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-8"
      >
        <h2 className="text-2xl font-bold mb-4">Active Projects</h2>
        {activeProjects.length === 0 ? (
          <Card className="bg-surface-secondary border-border">
            <CardContent className="py-12 text-center">
              <GitBranch className="w-12 h-12 mx-auto mb-4 text-gray-600" />
              <p className="text-lg text-gray-400 mb-2">No active projects</p>
              <p className="text-sm text-gray-500">
                Upload a PRD to start your first agent swarm project
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {activeProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
