'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  GitFork,
  Zap,
  BarChart2,
  Activity,
  Plus,
  Trash2,
  Play,
  Square,
  RefreshCw,
  Star,
  Search,
  CheckCircle,
  Clock,
  Target,
  DollarSign,
  TrendingUp,
  Shield,
  AlertCircle,
  ExternalLink,
  Code,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Slider } from '@/components/ui/slider';
import { Alert, AlertDescription } from '@/components/ui/alert';
import qnnService, {
  type Model,
  type Repository,
  type TrainingJob,
  type BenchmarkMetrics,
  type QuantumMetrics,
  type PerformanceMetrics,
  type ModelArchitecture,
  type TrainingConfig,
} from '@/lib/qnn-service';

const statusColors: Record<string, string> = {
  draft: 'bg-gray-500',
  ready: 'bg-blue-500',
  training: 'bg-yellow-500',
  trained: 'bg-green-500',
  deployed: 'bg-purple-500',
  archived: 'bg-gray-400',
  failed: 'bg-red-500',
};

const trainingStatusColors: Record<string, string> = {
  queued: 'bg-gray-500',
  initializing: 'bg-blue-400',
  training: 'bg-yellow-500',
  validating: 'bg-blue-500',
  completed: 'bg-green-500',
  failed: 'bg-red-500',
  stopped: 'bg-orange-500',
  paused: 'bg-gray-400',
};

export default function QNNDashboardClient() {
  const [activeTab, setActiveTab] = useState('models');
  const [models, setModels] = useState<Model[]>([]);
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [trainingJobs, setTrainingJobs] = useState<TrainingJob[]>([]);
  const [benchmarks, setBenchmarks] = useState<BenchmarkMetrics[]>([]);
  const [quantumMetrics, setQuantumMetrics] = useState<QuantumMetrics[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Create model dialog state
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newModelName, setNewModelName] = useState('');
  const [newModelDescription, setNewModelDescription] = useState('');
  const [newModelArchitecture, setNewModelArchitecture] = useState<ModelArchitecture>('quantum-transformer');
  const [selectedRepositoryId, setSelectedRepositoryId] = useState('');

  // Training dialog state
  const [isTrainingDialogOpen, setIsTrainingDialogOpen] = useState(false);
  const [selectedModelForTraining, setSelectedModelForTraining] = useState<Model | null>(null);
  const [trainingConfig, setTrainingConfig] = useState<Partial<TrainingConfig>>({
    epochs: 100,
    batchSize: 32,
    learningRate: 0.001,
    optimizer: 'adam',
    lossFunction: 'cross_entropy',
    validationSplit: 0.2,
    quantumCircuitDepth: 4,
    quantumEntanglement: 'circular',
    hardwareBackend: 'simulator',
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [modelsData, reposData, benchmarksData, qMetrics, pMetrics] = await Promise.all([
        qnnService.listModels().catch(() => []),
        qnnService.listRepositories().catch(() => ({ items: [], total: 0 })),
        qnnService.getBenchmarkMetrics().catch(() => []),
        qnnService.getQuantumMetrics().catch(() => []),
        qnnService.getPerformanceMetrics().catch(() => []),
      ]);
      setModels(modelsData);
      setRepositories(reposData.items || []);
      setBenchmarks(benchmarksData);
      setQuantumMetrics(qMetrics);
      setPerformanceMetrics(pMetrics);

      // Load training jobs for all models
      const jobs: TrainingJob[] = [];
      for (const model of modelsData) {
        if (model.trainingJobs) {
          jobs.push(...model.trainingJobs);
        }
      }
      setTrainingJobs(jobs);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError('Failed to load QNN dashboard data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateModel = async () => {
    if (!newModelName.trim() || !selectedRepositoryId) return;
    try {
      const model = await qnnService.createModel({
        name: newModelName,
        description: newModelDescription || undefined,
        repositoryId: selectedRepositoryId,
        architecture: newModelArchitecture,
      });
      setModels([model, ...models]);
      setIsCreateDialogOpen(false);
      resetCreateForm();
    } catch (err) {
      console.error('Failed to create model:', err);
      setError('Failed to create model. Please try again.');
    }
  };

  const handleDeleteModel = async (modelId: string) => {
    try {
      await qnnService.deleteModel(modelId);
      setModels(models.filter((m) => m.id !== modelId));
    } catch (err) {
      console.error('Failed to delete model:', err);
      setError('Failed to delete model. Please try again.');
    }
  };

  const handleStartTraining = async () => {
    if (!selectedModelForTraining) return;
    try {
      const job = await qnnService.startTraining({
        modelId: selectedModelForTraining.id,
        config: trainingConfig as TrainingConfig,
      });
      setTrainingJobs([job, ...trainingJobs]);
      setIsTrainingDialogOpen(false);
      setSelectedModelForTraining(null);
    } catch (err) {
      console.error('Failed to start training:', err);
      setError('Failed to start training. Please try again.');
    }
  };

  const handleStopTraining = async (trainingId: string) => {
    try {
      await qnnService.stopTraining(trainingId);
      loadDashboardData();
    } catch (err) {
      console.error('Failed to stop training:', err);
    }
  };

  const handleRunBenchmark = async (modelId: string) => {
    try {
      const result = await qnnService.runBenchmark({
        modelId,
        dataset: 'default',
        batchSize: 32,
        iterations: 100,
      });
      if (result.metrics) {
        setBenchmarks([result.metrics, ...benchmarks]);
      }
    } catch (err) {
      console.error('Failed to run benchmark:', err);
      setError('Failed to run benchmark. Please try again.');
    }
  };

  const handleSearchRepositories = async () => {
    if (!searchQuery.trim()) return;
    try {
      setIsLoading(true);
      const result = await qnnService.searchRepositories({
        query: searchQuery,
        sort: 'stars',
        order: 'desc',
      });
      setRepositories(result.items || []);
    } catch (err) {
      console.error('Failed to search repositories:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const resetCreateForm = () => {
    setNewModelName('');
    setNewModelDescription('');
    setNewModelArchitecture('quantum-transformer');
    setSelectedRepositoryId('');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <Card className="border border-primary/20 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-600/20">
                  <Brain className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Quantum Neural Network Dashboard</CardTitle>
                  <CardDescription>
                    Manage models, train quantum networks, and monitor performance
                  </CardDescription>
                </div>
              </div>
              <Button onClick={loadDashboardData} variant="outline" disabled={isLoading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Error Alert */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quick Stats */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-4 gap-4"
        >
          <motion.div variants={itemVariants}>
            <Card className="border border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardDescription className="text-xs">Total Models</CardDescription>
                  <Brain className="h-4 w-4 text-primary" />
                </div>
                <CardTitle className="text-3xl text-primary">{models.length}</CardTitle>
              </CardHeader>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="border border-primary/20 bg-gradient-to-br from-blue-500/5 to-blue-600/10">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardDescription className="text-xs">Active Training</CardDescription>
                  <Zap className="h-4 w-4 text-blue-600" />
                </div>
                <CardTitle className="text-3xl text-blue-600">
                  {trainingJobs.filter((j) => j.status === 'training').length}
                </CardTitle>
              </CardHeader>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="border border-primary/20 bg-gradient-to-br from-emerald-500/5 to-emerald-600/10">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardDescription className="text-xs">Benchmarks Run</CardDescription>
                  <BarChart2 className="h-4 w-4 text-emerald-600" />
                </div>
                <CardTitle className="text-3xl text-emerald-600">{benchmarks.length}</CardTitle>
              </CardHeader>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="border border-primary/20 bg-gradient-to-br from-amber-500/5 to-amber-600/10">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardDescription className="text-xs">Repositories</CardDescription>
                  <GitFork className="h-4 w-4 text-amber-600" />
                </div>
                <CardTitle className="text-3xl text-amber-600">{repositories.length}</CardTitle>
              </CardHeader>
            </Card>
          </motion.div>
        </motion.div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="models" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Models
            </TabsTrigger>
            <TabsTrigger value="repositories" className="flex items-center gap-2">
              <GitFork className="h-4 w-4" />
              Repositories
            </TabsTrigger>
            <TabsTrigger value="training" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Training
            </TabsTrigger>
            <TabsTrigger value="benchmarks" className="flex items-center gap-2">
              <BarChart2 className="h-4 w-4" />
              Benchmarks
            </TabsTrigger>
            <TabsTrigger value="monitoring" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Monitoring
            </TabsTrigger>
          </TabsList>

          {/* Models Tab */}
          <TabsContent value="models" className="space-y-6">
            <Card className="border border-primary/20 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Model Management</CardTitle>
                    <CardDescription>Create and manage your quantum neural network models</CardDescription>
                  </div>
                  <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-primary hover:bg-primary/90 text-white">
                        <Plus className="mr-2 h-4 w-4" />
                        Create Model
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                      <DialogHeader>
                        <DialogTitle>Create New QNN Model</DialogTitle>
                        <DialogDescription>
                          Configure your quantum neural network model settings.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="model-name">Model Name</Label>
                          <Input
                            id="model-name"
                            placeholder="e.g., quantum-classifier-v1"
                            value={newModelName}
                            onChange={(e) => setNewModelName(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="model-description">Description</Label>
                          <Textarea
                            id="model-description"
                            placeholder="Describe your model's purpose..."
                            value={newModelDescription}
                            onChange={(e) => setNewModelDescription(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="architecture">Architecture</Label>
                          <Select
                            value={newModelArchitecture}
                            onValueChange={(v) => setNewModelArchitecture(v as ModelArchitecture)}
                          >
                            <SelectTrigger id="architecture">
                              <SelectValue placeholder="Select architecture" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="quantum-cnn">Quantum CNN</SelectItem>
                              <SelectItem value="quantum-rnn">Quantum RNN</SelectItem>
                              <SelectItem value="quantum-transformer">Quantum Transformer</SelectItem>
                              <SelectItem value="hybrid-quantum-classical">Hybrid Quantum-Classical</SelectItem>
                              <SelectItem value="variational-quantum-classifier">Variational Quantum Classifier</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="repository">Repository</Label>
                          <Select value={selectedRepositoryId} onValueChange={setSelectedRepositoryId}>
                            <SelectTrigger id="repository">
                              <SelectValue placeholder="Select repository" />
                            </SelectTrigger>
                            <SelectContent>
                              {repositories.map((repo) => (
                                <SelectItem key={repo.id} value={repo.id}>
                                  {repo.fullName || repo.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button
                          onClick={handleCreateModel}
                          disabled={!newModelName.trim() || !selectedRepositoryId}
                          className="bg-primary hover:bg-primary/90 text-white"
                        >
                          Create Model
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {models.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="inline-flex p-4 rounded-full bg-gradient-to-br from-purple-500/10 to-blue-600/10 mb-4">
                      <Brain className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">No Models Yet</h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md mx-auto">
                      Create your first quantum neural network model to get started
                    </p>
                    <Button
                      onClick={() => setIsCreateDialogOpen(true)}
                      className="bg-primary hover:bg-primary/90 text-white"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Create Your First Model
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {models.map((model) => (
                      <Card
                        key={model.id}
                        className="border border-primary/20 bg-white/80 dark:bg-gray-800/80 hover:border-primary/40 transition-all"
                      >
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-lg flex items-center gap-2">
                                <Brain className="h-4 w-4 text-primary" />
                                {model.name}
                              </CardTitle>
                              <Badge className={`mt-2 ${statusColors[model.status]} text-white text-xs`}>
                                {model.status}
                              </Badge>
                            </div>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="hover:bg-red-500/10 hover:text-red-600">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Model</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete &quot;{model.name}&quot;? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteModel(model.id)}
                                    className="bg-red-600 hover:bg-red-700 text-white"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                          <CardDescription className="line-clamp-2 mt-2">
                            {model.description || 'No description'}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">Architecture:</span>
                            <Badge variant="outline">{model.architecture}</Badge>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">Version:</span>
                            <span>{model.version}</span>
                          </div>
                          <div className="flex gap-2 pt-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1"
                              onClick={() => {
                                setSelectedModelForTraining(model);
                                setIsTrainingDialogOpen(true);
                              }}
                            >
                              <Play className="h-4 w-4 mr-1" />
                              Train
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1"
                              onClick={() => handleRunBenchmark(model.id)}
                            >
                              <BarChart2 className="h-4 w-4 mr-1" />
                              Benchmark
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Repositories Tab */}
          <TabsContent value="repositories" className="space-y-6">
            <Card className="border border-primary/20 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Repository Selection</CardTitle>
                <CardDescription>Search and select repositories for training</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 mb-6">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search GitHub repositories..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearchRepositories()}
                      className="pl-10"
                    />
                  </div>
                  <Button onClick={handleSearchRepositories}>
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </Button>
                </div>

                {repositories.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="inline-flex p-4 rounded-full bg-primary/10 mb-4">
                      <GitFork className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">No Repositories Found</h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Search for GitHub repositories to train your models
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {repositories.map((repo) => (
                      <Card
                        key={repo.id}
                        className="border border-primary/20 hover:border-primary/40 transition-all cursor-pointer"
                      >
                        <CardHeader>
                          <div className="flex items-start gap-3">
                            <Code className="h-5 w-5 text-primary mt-1" />
                            <div className="flex-1">
                              <CardTitle className="text-lg">{repo.name}</CardTitle>
                              <CardDescription className="line-clamp-2">
                                {repo.description || 'No description'}
                              </CardDescription>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 text-yellow-500" />
                              <span>{repo.stars?.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <GitFork className="h-4 w-4" />
                              <span>{repo.forks?.toLocaleString()}</span>
                            </div>
                            {repo.language && (
                              <Badge variant="secondary">{repo.language}</Badge>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1"
                              onClick={() => qnnService.analyzeRepository(repo.id)}
                            >
                              Analyze
                            </Button>
                            <Button variant="outline" size="icon" asChild>
                              <a href={repo.url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Training Tab */}
          <TabsContent value="training" className="space-y-6">
            <Card className="border border-primary/20 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Training Jobs</CardTitle>
                <CardDescription>Monitor active and completed training sessions</CardDescription>
              </CardHeader>
              <CardContent>
                {trainingJobs.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="inline-flex p-4 rounded-full bg-primary/10 mb-4">
                      <Zap className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">No Training Jobs</h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Start training a model to see jobs here
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {trainingJobs.map((job) => (
                      <Card key={job.id} className="border border-primary/20">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Badge className={`${trainingStatusColors[job.status]} text-white`}>
                                {job.status}
                              </Badge>
                              <span className="font-medium">Model: {job.modelId}</span>
                            </div>
                            {job.status === 'training' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleStopTraining(job.id)}
                              >
                                <Square className="h-4 w-4 mr-1" />
                                Stop
                              </Button>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div>
                              <div className="flex justify-between text-sm mb-2">
                                <span>Progress</span>
                                <span>Epoch {job.metrics?.epoch || 0}/{job.config.epochs}</span>
                              </div>
                              <Progress value={((job.metrics?.epoch || 0) / job.config.epochs) * 100} />
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <span className="text-gray-500">Loss:</span>
                                <span className="ml-2 font-medium">{job.metrics?.loss?.toFixed(4) || '-'}</span>
                              </div>
                              <div>
                                <span className="text-gray-500">Accuracy:</span>
                                <span className="ml-2 font-medium">{job.metrics?.accuracy ? `${(job.metrics.accuracy * 100).toFixed(1)}%` : '-'}</span>
                              </div>
                              <div>
                                <span className="text-gray-500">Val Loss:</span>
                                <span className="ml-2 font-medium">{job.metrics?.valLoss?.toFixed(4) || '-'}</span>
                              </div>
                              <div>
                                <span className="text-gray-500">Duration:</span>
                                <span className="ml-2 font-medium">{job.duration ? `${Math.round(job.duration / 60)}m` : '-'}</span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Benchmarks Tab */}
          <TabsContent value="benchmarks" className="space-y-6">
            <Card className="border border-primary/20 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Benchmarking Dashboard</CardTitle>
                <CardDescription>Compare quantum vs classical model performance</CardDescription>
              </CardHeader>
              <CardContent>
                {benchmarks.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="inline-flex p-4 rounded-full bg-gradient-to-br from-purple-500/10 to-blue-600/10 mb-4">
                      <BarChart2 className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">No Benchmark Data Yet</h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md mx-auto">
                      Run benchmarks on your models to compare performance
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <Card className="border border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <CardDescription className="text-xs">Avg Accuracy</CardDescription>
                            <Target className="h-4 w-4 text-primary" />
                          </div>
                          <CardTitle className="text-3xl text-primary">
                            {benchmarks.length > 0
                              ? `${(benchmarks.reduce((sum, b) => sum + b.metrics.accuracy, 0) / benchmarks.length * 100).toFixed(1)}%`
                              : '-'}
                          </CardTitle>
                        </CardHeader>
                      </Card>
                      <Card className="border border-primary/20 bg-gradient-to-br from-blue-500/5 to-blue-600/10">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <CardDescription className="text-xs">Avg Inference</CardDescription>
                            <Clock className="h-4 w-4 text-blue-600" />
                          </div>
                          <CardTitle className="text-3xl text-blue-600">
                            {benchmarks.length > 0
                              ? `${(benchmarks.reduce((sum, b) => sum + b.metrics.inferenceTime, 0) / benchmarks.length).toFixed(1)}ms`
                              : '-'}
                          </CardTitle>
                        </CardHeader>
                      </Card>
                      <Card className="border border-primary/20 bg-gradient-to-br from-emerald-500/5 to-emerald-600/10">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <CardDescription className="text-xs">Quantum Fidelity</CardDescription>
                            <Shield className="h-4 w-4 text-emerald-600" />
                          </div>
                          <CardTitle className="text-3xl text-emerald-600">
                            {benchmarks.length > 0
                              ? `${(benchmarks.reduce((sum, b) => sum + b.quantumMetrics.fidelity, 0) / benchmarks.length * 100).toFixed(1)}%`
                              : '-'}
                          </CardTitle>
                        </CardHeader>
                      </Card>
                      <Card className="border border-primary/20 bg-gradient-to-br from-amber-500/5 to-amber-600/10">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <CardDescription className="text-xs">Quantum Advantage</CardDescription>
                            <TrendingUp className="h-4 w-4 text-amber-600" />
                          </div>
                          <CardTitle className="text-3xl text-amber-600">
                            {benchmarks.length > 0
                              ? `${(benchmarks.reduce((sum, b) => sum + b.quantumMetrics.quantumAdvantage, 0) / benchmarks.length).toFixed(1)}x`
                              : '-'}
                          </CardTitle>
                        </CardHeader>
                      </Card>
                    </div>

                    {/* Benchmark Results */}
                    <div className="space-y-4">
                      {benchmarks.map((benchmark) => (
                        <Card key={benchmark.benchmarkId} className="border border-primary/20">
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-lg">Benchmark: {benchmark.dataset}</CardTitle>
                              <Badge variant="outline">{new Date(benchmark.timestamp).toLocaleDateString()}</Badge>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <div>
                                <p className="text-sm text-gray-500">Accuracy</p>
                                <p className="text-lg font-semibold text-primary">{(benchmark.metrics.accuracy * 100).toFixed(1)}%</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-500">F1 Score</p>
                                <p className="text-lg font-semibold">{(benchmark.metrics.f1Score * 100).toFixed(1)}%</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-500">Inference Time</p>
                                <p className="text-lg font-semibold">{benchmark.metrics.inferenceTime.toFixed(2)}ms</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-500">Throughput</p>
                                <p className="text-lg font-semibold">{benchmark.metrics.throughput.toFixed(0)}/s</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Monitoring Tab */}
          <TabsContent value="monitoring" className="space-y-6">
            <Card className="border border-primary/20 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Quantum Monitoring</CardTitle>
                <CardDescription>Real-time quantum state and circuit metrics</CardDescription>
              </CardHeader>
              <CardContent>
                {quantumMetrics.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="inline-flex p-4 rounded-full bg-primary/10 mb-4">
                      <Activity className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">No Metrics Available</h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Run training or inference to see quantum metrics
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Latest Quantum State */}
                    {quantumMetrics[0] && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Card className="border border-primary/20">
                          <CardHeader className="pb-2">
                            <CardDescription className="text-xs">Entanglement</CardDescription>
                            <CardTitle className="text-2xl text-primary">
                              {(quantumMetrics[0].quantumState.entanglement * 100).toFixed(1)}%
                            </CardTitle>
                          </CardHeader>
                        </Card>
                        <Card className="border border-primary/20">
                          <CardHeader className="pb-2">
                            <CardDescription className="text-xs">Coherence</CardDescription>
                            <CardTitle className="text-2xl text-blue-600">
                              {(quantumMetrics[0].quantumState.coherence * 100).toFixed(1)}%
                            </CardTitle>
                          </CardHeader>
                        </Card>
                        <Card className="border border-primary/20">
                          <CardHeader className="pb-2">
                            <CardDescription className="text-xs">Fidelity</CardDescription>
                            <CardTitle className="text-2xl text-emerald-600">
                              {(quantumMetrics[0].quantumState.fidelity * 100).toFixed(1)}%
                            </CardTitle>
                          </CardHeader>
                        </Card>
                        <Card className="border border-primary/20">
                          <CardHeader className="pb-2">
                            <CardDescription className="text-xs">Purity</CardDescription>
                            <CardTitle className="text-2xl text-amber-600">
                              {(quantumMetrics[0].quantumState.purity * 100).toFixed(1)}%
                            </CardTitle>
                          </CardHeader>
                        </Card>
                      </div>
                    )}

                    {/* Circuit Metrics */}
                    {quantumMetrics[0]?.circuitMetrics && (
                      <Card className="border border-primary/20">
                        <CardHeader>
                          <CardTitle className="text-lg">Circuit Metrics</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                              <p className="text-sm text-gray-500">Circuit Depth</p>
                              <p className="text-lg font-semibold">{quantumMetrics[0].circuitMetrics.depth}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Circuit Width</p>
                              <p className="text-lg font-semibold">{quantumMetrics[0].circuitMetrics.width}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Gate Count</p>
                              <p className="text-lg font-semibold">{quantumMetrics[0].circuitMetrics.gateCount}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">2-Qubit Gates</p>
                              <p className="text-lg font-semibold">{quantumMetrics[0].circuitMetrics.twoQubitGates}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Resource Usage */}
                    {quantumMetrics[0]?.resourceUsage && (
                      <Card className="border border-primary/20">
                        <CardHeader>
                          <CardTitle className="text-lg">Resource Usage</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div>
                              <div className="flex justify-between text-sm mb-2">
                                <span>Qubits Used</span>
                                <span>{quantumMetrics[0].resourceUsage.qubitsUsed} / {quantumMetrics[0].resourceUsage.qubitsAvailable}</span>
                              </div>
                              <Progress
                                value={(quantumMetrics[0].resourceUsage.qubitsUsed / quantumMetrics[0].resourceUsage.qubitsAvailable) * 100}
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-gray-500">Circuit Execution:</span>
                                <span className="ml-2 font-medium">{quantumMetrics[0].resourceUsage.circuitExecutionTime.toFixed(2)}ms</span>
                              </div>
                              <div>
                                <span className="text-gray-500">Classical Compute:</span>
                                <span className="ml-2 font-medium">{quantumMetrics[0].resourceUsage.classicalComputeTime.toFixed(2)}ms</span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            {performanceMetrics.length > 0 && (
              <Card className="border border-primary/20 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                  <CardDescription>Inference latency and resource utilization</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <Card className="border border-primary/20">
                      <CardHeader className="pb-2">
                        <CardDescription className="text-xs">P50 Latency</CardDescription>
                        <CardTitle className="text-2xl">{performanceMetrics[0].inference.latencyP50.toFixed(2)}ms</CardTitle>
                      </CardHeader>
                    </Card>
                    <Card className="border border-primary/20">
                      <CardHeader className="pb-2">
                        <CardDescription className="text-xs">P95 Latency</CardDescription>
                        <CardTitle className="text-2xl">{performanceMetrics[0].inference.latencyP95.toFixed(2)}ms</CardTitle>
                      </CardHeader>
                    </Card>
                    <Card className="border border-primary/20">
                      <CardHeader className="pb-2">
                        <CardDescription className="text-xs">P99 Latency</CardDescription>
                        <CardTitle className="text-2xl">{performanceMetrics[0].inference.latencyP99.toFixed(2)}ms</CardTitle>
                      </CardHeader>
                    </Card>
                    <Card className="border border-primary/20">
                      <CardHeader className="pb-2">
                        <CardDescription className="text-xs">Throughput</CardDescription>
                        <CardTitle className="text-2xl">{performanceMetrics[0].inference.throughput.toFixed(0)}/s</CardTitle>
                      </CardHeader>
                    </Card>
                    <Card className="border border-primary/20">
                      <CardHeader className="pb-2">
                        <CardDescription className="text-xs">Error Rate</CardDescription>
                        <CardTitle className="text-2xl">{(performanceMetrics[0].inference.errorRate * 100).toFixed(2)}%</CardTitle>
                      </CardHeader>
                    </Card>
                    <Card className="border border-primary/20">
                      <CardHeader className="pb-2">
                        <CardDescription className="text-xs">Total Cost</CardDescription>
                        <CardTitle className="text-2xl">${performanceMetrics[0].costs.totalCost.toFixed(4)}</CardTitle>
                      </CardHeader>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Training Dialog */}
        <Dialog open={isTrainingDialogOpen} onOpenChange={setIsTrainingDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Configure Training</DialogTitle>
              <DialogDescription>
                Set up training parameters for {selectedModelForTraining?.name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="epochs">Epochs</Label>
                  <Input
                    id="epochs"
                    type="number"
                    value={trainingConfig.epochs}
                    onChange={(e) => setTrainingConfig({ ...trainingConfig, epochs: parseInt(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="batchSize">Batch Size</Label>
                  <Input
                    id="batchSize"
                    type="number"
                    value={trainingConfig.batchSize}
                    onChange={(e) => setTrainingConfig({ ...trainingConfig, batchSize: parseInt(e.target.value) })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Learning Rate: {trainingConfig.learningRate}</Label>
                <Slider
                  value={[trainingConfig.learningRate || 0.001]}
                  onValueChange={([value]) => setTrainingConfig({ ...trainingConfig, learningRate: value })}
                  min={0.0001}
                  max={0.1}
                  step={0.0001}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="optimizer">Optimizer</Label>
                  <Select
                    value={trainingConfig.optimizer}
                    onValueChange={(v) => setTrainingConfig({ ...trainingConfig, optimizer: v as TrainingConfig['optimizer'] })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="adam">Adam</SelectItem>
                      <SelectItem value="sgd">SGD</SelectItem>
                      <SelectItem value="rmsprop">RMSprop</SelectItem>
                      <SelectItem value="adamw">AdamW</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lossFunction">Loss Function</Label>
                  <Select
                    value={trainingConfig.lossFunction}
                    onValueChange={(v) => setTrainingConfig({ ...trainingConfig, lossFunction: v as TrainingConfig['lossFunction'] })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cross_entropy">Cross Entropy</SelectItem>
                      <SelectItem value="mse">MSE</SelectItem>
                      <SelectItem value="mae">MAE</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Validation Split: {(trainingConfig.validationSplit || 0.2) * 100}%</Label>
                <Slider
                  value={[(trainingConfig.validationSplit || 0.2) * 100]}
                  onValueChange={([value]) => setTrainingConfig({ ...trainingConfig, validationSplit: value / 100 })}
                  min={5}
                  max={30}
                  step={5}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="circuitDepth">Quantum Circuit Depth</Label>
                  <Input
                    id="circuitDepth"
                    type="number"
                    value={trainingConfig.quantumCircuitDepth}
                    onChange={(e) => setTrainingConfig({ ...trainingConfig, quantumCircuitDepth: parseInt(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="entanglement">Entanglement</Label>
                  <Select
                    value={trainingConfig.quantumEntanglement}
                    onValueChange={(v) => setTrainingConfig({ ...trainingConfig, quantumEntanglement: v as TrainingConfig['quantumEntanglement'] })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="linear">Linear</SelectItem>
                      <SelectItem value="circular">Circular</SelectItem>
                      <SelectItem value="full">Full</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="hardwareBackend">Hardware Backend</Label>
                <Select
                  value={trainingConfig.hardwareBackend}
                  onValueChange={(v) => setTrainingConfig({ ...trainingConfig, hardwareBackend: v as TrainingConfig['hardwareBackend'] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="simulator">Simulator</SelectItem>
                    <SelectItem value="ibmq">IBM Quantum</SelectItem>
                    <SelectItem value="aws_braket">AWS Braket</SelectItem>
                    <SelectItem value="google_quantum">Google Quantum</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsTrainingDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleStartTraining} className="bg-primary hover:bg-primary/90 text-white">
                <Play className="h-4 w-4 mr-2" />
                Start Training
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
