'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Cpu,
  Activity,
  Layers,
  Play,
  Pause,
  RefreshCcw,
  Plus,
  BarChart2,
  Zap,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  ArrowUpRight,
  Shield
} from 'lucide-react';
import Link from 'next/link';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const stagger = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

interface Model {
  id: string;
  name: string;
  architecture: string;
  status: 'draft' | 'ready' | 'training' | 'trained' | 'deployed' | 'failed';
  accuracy?: number;
  lastUpdated: string;
}

interface TrainingJob {
  id: string;
  modelName: string;
  status: 'queued' | 'training' | 'completed' | 'failed';
  progress: number;
  epoch: number;
  totalEpochs: number;
  startedAt: string;
}

interface QuantumMetrics {
  fidelity: number;
  coherence: number;
  entanglement: number;
  circuitDepth: number;
}

export default function QNNDashboardClient() {
  const [mounted, setMounted] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Mock data - in production this would come from QNNApiClient
  const [models] = useState<Model[]>([
    {
      id: '1',
      name: 'Quantum Image Classifier',
      architecture: 'quantum-cnn',
      status: 'deployed',
      accuracy: 94.5,
      lastUpdated: '2025-01-10'
    },
    {
      id: '2',
      name: 'Hybrid Text Analyzer',
      architecture: 'hybrid-quantum-classical',
      status: 'training',
      accuracy: 87.2,
      lastUpdated: '2025-01-12'
    },
    {
      id: '3',
      name: 'VQC Sentiment Model',
      architecture: 'variational-quantum-classifier',
      status: 'ready',
      accuracy: 91.8,
      lastUpdated: '2025-01-08'
    }
  ]);

  const [trainingJobs] = useState<TrainingJob[]>([
    {
      id: 'job-1',
      modelName: 'Hybrid Text Analyzer',
      status: 'training',
      progress: 65,
      epoch: 13,
      totalEpochs: 20,
      startedAt: '2025-01-12T10:30:00Z'
    },
    {
      id: 'job-2',
      modelName: 'New Transformer Model',
      status: 'queued',
      progress: 0,
      epoch: 0,
      totalEpochs: 50,
      startedAt: '2025-01-12T14:00:00Z'
    }
  ]);

  const [quantumMetrics] = useState<QuantumMetrics>({
    fidelity: 0.987,
    coherence: 0.923,
    entanglement: 0.856,
    circuitDepth: 12
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  };

  const getStatusColor = (status: Model['status']) => {
    switch (status) {
      case 'deployed':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'trained':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'training':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'ready':
        return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
      case 'failed':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusIcon = (status: TrainingJob['status']) => {
    switch (status) {
      case 'training':
        return <Activity className="h-4 w-4 animate-pulse text-yellow-400" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-400" />;
      case 'queued':
        return <Clock className="h-4 w-4 text-gray-400" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-8">
      {/* Header */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeUp}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold mb-2">QNN Dashboard</h1>
            <p className="text-muted-foreground">
              Manage your Quantum Neural Network models and training jobs
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="gap-2"
            >
              <RefreshCcw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button className="bg-[#4B6FED] hover:bg-[#4B6FED]/80 gap-2">
              <Plus className="h-4 w-4" />
              New Model
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={stagger}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <motion.div variants={fadeUp}>
          <Card className="bg-[#161B22] border-[#2D333B]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Models</CardTitle>
              <Layers className="h-4 w-4 text-[#4B6FED]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{models.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {models.filter(m => m.status === 'deployed').length} deployed
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={fadeUp}>
          <Card className="bg-[#161B22] border-[#2D333B]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Training</CardTitle>
              <Activity className="h-4 w-4 text-[#4B6FED]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {trainingJobs.filter(j => j.status === 'training').length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {trainingJobs.filter(j => j.status === 'queued').length} queued
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={fadeUp}>
          <Card className="bg-[#161B22] border-[#2D333B]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Quantum Fidelity</CardTitle>
              <Zap className="h-4 w-4 text-[#4B6FED]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(quantumMetrics.fidelity * 100).toFixed(1)}%
              </div>
              <Progress value={quantumMetrics.fidelity * 100} className="mt-2 h-1.5" />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={fadeUp}>
          <Card className="bg-[#161B22] border-[#2D333B]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Accuracy</CardTitle>
              <BarChart2 className="h-4 w-4 text-[#4B6FED]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(models.reduce((sum, m) => sum + (m.accuracy || 0), 0) / models.length).toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Across all models
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Models and Training Jobs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Models List */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
        >
          <Card className="bg-[#161B22] border-[#2D333B]">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Cpu className="h-5 w-5" />
                    Models
                  </CardTitle>
                  <CardDescription>Your quantum neural network models</CardDescription>
                </div>
                <Link href="/products/qnn">
                  <Button variant="ghost" size="sm" className="gap-1">
                    View All
                    <ArrowUpRight className="h-3 w-3" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {models.map((model) => (
                  <div
                    key={model.id}
                    className="flex items-center justify-between p-3 bg-vite-bg rounded-lg border border-[#2D333B]"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{model.name}</p>
                        <Badge className={getStatusColor(model.status)}>
                          {model.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {model.architecture}
                      </p>
                    </div>
                    <div className="text-right">
                      {model.accuracy && (
                        <p className="font-medium text-green-400">{model.accuracy}%</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {new Date(model.lastUpdated).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Training Jobs */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
        >
          <Card className="bg-[#161B22] border-[#2D333B]">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Training Jobs
                  </CardTitle>
                  <CardDescription>Active and queued training jobs</CardDescription>
                </div>
                <Button variant="ghost" size="sm" className="gap-1">
                  View History
                  <ArrowUpRight className="h-3 w-3" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {trainingJobs.map((job) => (
                  <div
                    key={job.id}
                    className="p-3 bg-vite-bg rounded-lg border border-[#2D333B]"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(job.status)}
                        <p className="font-medium">{job.modelName}</p>
                      </div>
                      <div className="flex gap-1">
                        {job.status === 'training' && (
                          <>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Pause className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        {job.status === 'queued' && (
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Play className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                    {job.status === 'training' && (
                      <>
                        <Progress value={job.progress} className="h-2 mb-2" />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Epoch {job.epoch}/{job.totalEpochs}</span>
                          <span>{job.progress}% complete</span>
                        </div>
                      </>
                    )}
                    {job.status === 'queued' && (
                      <p className="text-xs text-muted-foreground">
                        Waiting in queue...
                      </p>
                    )}
                  </div>
                ))}
                {trainingJobs.length === 0 && (
                  <div className="text-center py-6 text-muted-foreground">
                    <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No active training jobs</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Quantum Metrics */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeUp}
      >
        <Card className="bg-[#161B22] border-[#2D333B]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Quantum Metrics Overview
            </CardTitle>
            <CardDescription>
              Real-time quantum system performance metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Fidelity</span>
                  <span className="font-medium">{(quantumMetrics.fidelity * 100).toFixed(1)}%</span>
                </div>
                <Progress value={quantumMetrics.fidelity * 100} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Coherence</span>
                  <span className="font-medium">{(quantumMetrics.coherence * 100).toFixed(1)}%</span>
                </div>
                <Progress value={quantumMetrics.coherence * 100} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Entanglement</span>
                  <span className="font-medium">{(quantumMetrics.entanglement * 100).toFixed(1)}%</span>
                </div>
                <Progress value={quantumMetrics.entanglement * 100} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Circuit Depth</span>
                  <span className="font-medium">{quantumMetrics.circuitDepth} layers</span>
                </div>
                <div className="h-2 bg-[#2D333B] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#4B6FED]"
                    style={{ width: `${(quantumMetrics.circuitDepth / 20) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Signatures Quick Action */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
        >
          <Card className="bg-gradient-to-r from-purple-500/10 to-[#4B6FED]/10 border-purple-500/30">
            <CardContent className="flex items-center justify-between py-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-500/20 rounded-lg">
                  <Shield className="h-6 w-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Manage Model Signatures</h3>
                  <p className="text-gray-400 text-sm">
                    Sign, verify, and secure your models with quantum-resistant signatures
                  </p>
                </div>
              </div>
              <Link href="/dashboard/qnn/signatures">
                <Button className="bg-purple-500 hover:bg-purple-500/80">
                  View Signatures
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>

        {/* Create Model Quick Action */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
        >
          <Card className="bg-gradient-to-r from-[#4B6FED]/10 to-[#8A63F4]/10 border-[#4B6FED]/30">
            <CardContent className="flex items-center justify-between py-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-[#4B6FED]/20 rounded-lg">
                  <Cpu className="h-6 w-6 text-[#4B6FED]" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Ready to train a new model?</h3>
                  <p className="text-gray-400 text-sm">
                    Create and train quantum neural networks with our visual builder
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Link href="/products/qnn">
                  <Button variant="outline" className="border-[#4B6FED] text-[#4B6FED]">
                    Learn More
                  </Button>
                </Link>
                <Button className="bg-[#4B6FED] hover:bg-[#4B6FED]/80">
                  Create Model
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
