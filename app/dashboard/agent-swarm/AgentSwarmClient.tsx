'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  RefreshCw,
  Upload,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Activity,
  Users,
  ThumbsUp,
  ThumbsDown,
  Star,
  Download,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import agentSwarmService, {
  type AgentSwarmProject,
  type AgentStatus,
  type ProjectLog,
  type CreateProjectRequest,
} from '@/lib/agent-swarm-service';
import rlhfService, { type FeedbackSummary } from '@/lib/rlhf-service';

const statusColors: Record<AgentSwarmProject['status'], string> = {
  analyzing: 'bg-blue-500',
  building: 'bg-yellow-500',
  completed: 'bg-green-500',
  failed: 'bg-red-500',
  paused: 'bg-gray-500',
};

const statusIcons: Record<AgentSwarmProject['status'], React.ReactNode> = {
  analyzing: <Activity className="h-4 w-4" />,
  building: <RefreshCw className="h-4 w-4 animate-spin" />,
  completed: <CheckCircle className="h-4 w-4" />,
  failed: <XCircle className="h-4 w-4" />,
  paused: <Pause className="h-4 w-4" />,
};

export default function AgentSwarmClient() {
  const [projects, setProjects] = useState<AgentSwarmProject[]>([]);
  const [selectedProject, setSelectedProject] = useState<AgentSwarmProject | null>(null);
  const [logs, setLogs] = useState<ProjectLog[]>([]);
  const [feedbackSummary, setFeedbackSummary] = useState<FeedbackSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('projects');

  // New project form state
  const [prdContent, setPrdContent] = useState('');
  const [projectType, setProjectType] = useState('web');
  const [isCreating, setIsCreating] = useState(false);

  // Feedback state
  const [selectedRating, setSelectedRating] = useState<number>(0);
  const [feedbackComment, setFeedbackComment] = useState('');

  useEffect(() => {
    loadProjects();
    loadFeedbackSummary();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      loadProjectLogs(selectedProject.id);
    }
  }, [selectedProject]);

  const loadProjects = async () => {
    try {
      setIsLoading(true);
      const projectList = await agentSwarmService.getAllProjects();
      setProjects(projectList);
      if (projectList.length > 0 && !selectedProject) {
        setSelectedProject(projectList[0]);
      }
    } catch (error) {
      console.error('Failed to load projects:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadProjectLogs = async (projectId: string) => {
    try {
      const projectLogs = await agentSwarmService.getProjectLogs(projectId);
      setLogs(projectLogs);
    } catch (error) {
      console.error('Failed to load logs:', error);
    }
  };

  const loadFeedbackSummary = async () => {
    try {
      const summary = await rlhfService.getFeedbackSummary();
      setFeedbackSummary(summary);
    } catch (error) {
      console.error('Failed to load feedback summary:', error);
    }
  };

  const handleCreateProject = async () => {
    if (!prdContent.trim()) return;

    try {
      setIsCreating(true);
      const projectConfig: CreateProjectRequest = {
        project_type: projectType,
        description: prdContent,
      };
      const newProject = await agentSwarmService.createProject(projectConfig);
      setProjects([newProject, ...projects]);
      setSelectedProject(newProject);
      setPrdContent('');
      setActiveTab('projects');
    } catch (error) {
      console.error('Failed to create project:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleStopProject = async (projectId: string) => {
    try {
      await agentSwarmService.stopProject(projectId);
      loadProjects();
    } catch (error) {
      console.error('Failed to stop project:', error);
    }
  };

  const handleRestartProject = async (projectId: string) => {
    try {
      await agentSwarmService.restartProject(projectId);
      loadProjects();
    } catch (error) {
      console.error('Failed to restart project:', error);
    }
  };

  const handleThumbsFeedback = async (thumbsUp: boolean) => {
    if (!selectedProject) return;
    try {
      await rlhfService.submitThumbsFeedback({
        interaction_id: selectedProject.id,
        thumbs_up: thumbsUp,
        comment: feedbackComment || undefined,
      });
      setFeedbackComment('');
      loadFeedbackSummary();
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    }
  };

  const handleRatingFeedback = async () => {
    if (!selectedProject || selectedRating === 0) return;
    try {
      await rlhfService.submitRatingFeedback({
        interaction_id: selectedProject.id,
        rating: selectedRating,
        comment: feedbackComment || undefined,
      });
      setSelectedRating(0);
      setFeedbackComment('');
      loadFeedbackSummary();
    } catch (error) {
      console.error('Failed to submit rating:', error);
    }
  };

  const renderAgentStatus = (agent: AgentStatus) => (
    <div key={agent.name} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
      <div className="flex items-center gap-3">
        <div className={`w-2 h-2 rounded-full ${
          agent.status === 'completed' ? 'bg-green-500' :
          agent.status === 'working' ? 'bg-yellow-500 animate-pulse' :
          agent.status === 'failed' ? 'bg-red-500' : 'bg-gray-500'
        }`} />
        <span className="font-medium">{agent.name}</span>
      </div>
      <div className="flex items-center gap-3">
        {agent.current_task && (
          <span className="text-sm text-muted-foreground">{agent.current_task}</span>
        )}
        <span className="text-sm font-medium">{agent.progress}%</span>
      </div>
    </div>
  );

  const renderLogEntry = (log: ProjectLog) => (
    <div
      key={log.id}
      className={`p-2 rounded text-sm ${
        log.level === 'error' ? 'bg-red-500/10 text-red-500' :
        log.level === 'warning' ? 'bg-yellow-500/10 text-yellow-500' :
        log.level === 'success' ? 'bg-green-500/10 text-green-500' :
        'bg-muted/50'
      }`}
    >
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">
          {new Date(log.timestamp).toLocaleTimeString()}
        </span>
        {log.agent && (
          <Badge variant="outline" className="text-xs">{log.agent}</Badge>
        )}
      </div>
      <p className="mt-1">{log.message}</p>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Agent Swarm Dashboard</h1>
          <p className="text-muted-foreground">
            Orchestrate and monitor multi-agent AI projects
          </p>
        </div>
        <Button onClick={loadProjects} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projects.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">
              {projects.filter(p => p.status === 'building' || p.status === 'analyzing').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {projects.filter(p => p.status === 'completed').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Feedback Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">
              {feedbackSummary ? `${(feedbackSummary.positive_rate * 100).toFixed(0)}%` : '-'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="create">Create New</TabsTrigger>
          <TabsTrigger value="feedback">RLHF Feedback</TabsTrigger>
        </TabsList>

        {/* Projects Tab */}
        <TabsContent value="projects" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Project List */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Projects</CardTitle>
                <CardDescription>Select a project to view details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : projects.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No projects yet. Create one to get started.
                  </p>
                ) : (
                  <AnimatePresence>
                    {projects.map((project) => (
                      <motion.div
                        key={project.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className={`p-3 rounded-lg cursor-pointer transition-colors ${
                          selectedProject?.id === project.id
                            ? 'bg-primary/10 border border-primary'
                            : 'bg-muted/50 hover:bg-muted'
                        }`}
                        onClick={() => setSelectedProject(project)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium truncate">{project.name}</span>
                          <Badge className={statusColors[project.status]}>
                            {statusIcons[project.status]}
                          </Badge>
                        </div>
                        <Progress value={project.progress} className="h-1" />
                        <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                          <span>{project.projectType}</span>
                          <span>{project.progress}%</span>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
              </CardContent>
            </Card>

            {/* Project Details */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>
                      {selectedProject?.name || 'Select a Project'}
                    </CardTitle>
                    {selectedProject && (
                      <CardDescription>
                        {selectedProject.description?.slice(0, 100)}...
                      </CardDescription>
                    )}
                  </div>
                  {selectedProject && (
                    <div className="flex gap-2">
                      {(selectedProject.status === 'building' || selectedProject.status === 'analyzing') && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStopProject(selectedProject.id)}
                        >
                          <Pause className="h-4 w-4 mr-1" />
                          Stop
                        </Button>
                      )}
                      {(selectedProject.status === 'paused' || selectedProject.status === 'failed') && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRestartProject(selectedProject.id)}
                        >
                          <Play className="h-4 w-4 mr-1" />
                          Restart
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {selectedProject ? (
                  <div className="space-y-6">
                    {/* Progress */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Overall Progress</span>
                        <span className="text-sm text-muted-foreground">{selectedProject.progress}%</span>
                      </div>
                      <Progress value={selectedProject.progress} className="h-2" />
                    </div>

                    {/* Agents */}
                    <div>
                      <h4 className="text-sm font-medium mb-3">Active Agents</h4>
                      <div className="space-y-2">
                        {selectedProject.agents.length > 0 ? (
                          selectedProject.agents.map(renderAgentStatus)
                        ) : (
                          <p className="text-muted-foreground text-sm">No agents assigned yet</p>
                        )}
                      </div>
                    </div>

                    {/* Logs */}
                    <div>
                      <h4 className="text-sm font-medium mb-3">Recent Logs</h4>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {logs.length > 0 ? (
                          logs.slice(0, 10).map(renderLogEntry)
                        ) : (
                          <p className="text-muted-foreground text-sm">No logs available</p>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <Users className="h-12 w-12 mb-4" />
                    <p>Select a project to view details</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Create Tab */}
        <TabsContent value="create">
          <Card>
            <CardHeader>
              <CardTitle>Create New Project</CardTitle>
              <CardDescription>
                Paste your PRD or project description to start orchestration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="projectType">Project Type</Label>
                  <Select value={projectType} onValueChange={setProjectType}>
                    <SelectTrigger id="projectType">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="web">Web Application</SelectItem>
                      <SelectItem value="api">API / Backend</SelectItem>
                      <SelectItem value="mobile">Mobile App</SelectItem>
                      <SelectItem value="cli">CLI Tool</SelectItem>
                      <SelectItem value="library">Library / Package</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="prdContent">PRD / Description</Label>
                <Textarea
                  id="prdContent"
                  placeholder="Paste your PRD content or describe your project..."
                  className="min-h-[200px]"
                  value={prdContent}
                  onChange={(e) => setPrdContent(e.target.value)}
                />
              </div>

              <Button
                onClick={handleCreateProject}
                disabled={!prdContent.trim() || isCreating}
                className="w-full"
              >
                {isCreating ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Creating Project...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Start Orchestration
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Feedback Tab */}
        <TabsContent value="feedback">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Feedback Form */}
            <Card>
              <CardHeader>
                <CardTitle>Submit Feedback</CardTitle>
                <CardDescription>
                  Help improve the AI agents with your feedback
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Thumbs */}
                <div>
                  <Label className="mb-2 block">Quick Feedback</Label>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleThumbsFeedback(true)}
                      disabled={!selectedProject}
                    >
                      <ThumbsUp className="h-4 w-4 mr-2" />
                      Good
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleThumbsFeedback(false)}
                      disabled={!selectedProject}
                    >
                      <ThumbsDown className="h-4 w-4 mr-2" />
                      Needs Improvement
                    </Button>
                  </div>
                </div>

                {/* Rating */}
                <div>
                  <Label className="mb-2 block">Rating</Label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setSelectedRating(star)}
                        className="p-1"
                      >
                        <Star
                          className={`h-6 w-6 ${
                            star <= selectedRating
                              ? 'fill-yellow-500 text-yellow-500'
                              : 'text-muted-foreground'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Comment */}
                <div>
                  <Label htmlFor="feedbackComment">Comment (Optional)</Label>
                  <Textarea
                    id="feedbackComment"
                    placeholder="Share additional feedback..."
                    value={feedbackComment}
                    onChange={(e) => setFeedbackComment(e.target.value)}
                  />
                </div>

                <Button
                  onClick={handleRatingFeedback}
                  disabled={!selectedProject || selectedRating === 0}
                  className="w-full"
                >
                  Submit Rating
                </Button>
              </CardContent>
            </Card>

            {/* Feedback Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Feedback Summary</CardTitle>
                <CardDescription>Overall feedback statistics</CardDescription>
              </CardHeader>
              <CardContent>
                {feedbackSummary ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-lg bg-muted/50">
                        <div className="text-2xl font-bold">{feedbackSummary.total_feedback}</div>
                        <div className="text-sm text-muted-foreground">Total Feedback</div>
                      </div>
                      <div className="p-4 rounded-lg bg-muted/50">
                        <div className="text-2xl font-bold text-green-500">
                          {(feedbackSummary.positive_rate * 100).toFixed(0)}%
                        </div>
                        <div className="text-sm text-muted-foreground">Positive Rate</div>
                      </div>
                      <div className="p-4 rounded-lg bg-muted/50">
                        <div className="text-2xl font-bold text-yellow-500">
                          {feedbackSummary.average_rating.toFixed(1)}
                        </div>
                        <div className="text-sm text-muted-foreground">Average Rating</div>
                      </div>
                      <div className="p-4 rounded-lg bg-muted/50">
                        <div className="text-2xl font-bold">
                          {feedbackSummary.feedback_by_type.thumbs +
                            feedbackSummary.feedback_by_type.rating +
                            feedbackSummary.feedback_by_type.comparison}
                        </div>
                        <div className="text-sm text-muted-foreground">This Period</div>
                      </div>
                    </div>

                    {/* Breakdown */}
                    <div>
                      <h4 className="text-sm font-medium mb-2">By Type</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Thumbs</span>
                          <span>{feedbackSummary.feedback_by_type.thumbs}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Ratings</span>
                          <span>{feedbackSummary.feedback_by_type.rating}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Comparisons</span>
                          <span>{feedbackSummary.feedback_by_type.comparison}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <Activity className="h-12 w-12 mb-4" />
                    <p>No feedback data available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
