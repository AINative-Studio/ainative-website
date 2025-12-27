import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Activity, TrendingUp, Clock, CheckCircle2, AlertCircle, PlayCircle, Terminal } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface TrainingJob {
  id: string;
  modelName: string;
  status: 'running' | 'completed' | 'failed' | 'queued';
  progress: number;
  currentEpoch: number;
  totalEpochs: number;
  startedAt: Date;
  metrics: {
    loss: number;
    accuracy: number;
    valLoss?: number;
    valAccuracy?: number;
  };
  logs?: string[];
}

export default function TrainingHistory() {
  const [trainingJobs] = useState<TrainingJob[]>([]);
  const [selectedJob, setSelectedJob] = useState<string | null>(null);

  const getStatusIcon = (status: TrainingJob['status']) => {
    switch (status) {
      case 'running':
        return <PlayCircle className="h-4 w-4 text-blue-600 animate-pulse" />;
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'queued':
        return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: TrainingJob['status']) => {
    switch (status) {
      case 'running':
        return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'completed':
        return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'failed':
        return 'bg-red-500/10 text-red-600 border-red-500/20';
      case 'queued':
        return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const selectedJobData = trainingJobs.find(job => job.id === selectedJob);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border border-primary/20 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-full bg-primary/10">
              <Activity className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle>Training History</CardTitle>
              <CardDescription>
                Monitor progress and view metrics for all training jobs
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {trainingJobs.length === 0 ? (
        <Card className="border border-primary/20 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <CardContent className="py-12">
            <div className="text-center">
              <div className="inline-flex p-4 rounded-full bg-gradient-to-br from-purple-500/10 to-blue-600/10 mb-4">
                <Activity className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No Training Jobs Yet</h3>
              <p className="text-gray-600 dark:text-gray-300 max-w-md mx-auto">
                Start training a model to see progress and metrics here
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Training Jobs List */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-4"
          >
            {trainingJobs.map((job) => (
              <motion.div key={job.id} variants={itemVariants}>
                <Card
                  className={`border cursor-pointer transition-all duration-300 ${
                    selectedJob === job.id
                      ? 'border-primary bg-primary/5 dark:bg-primary/10'
                      : 'border-primary/20 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:border-primary/40'
                  }`}
                  onClick={() => setSelectedJob(job.id)}
                >
                  <CardHeader>
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg mb-2">{job.modelName}</CardTitle>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(job.status)}
                            <Badge className={`text-xs ${getStatusColor(job.status)}`}>
                              {job.status}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      {job.status === 'running' && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-300">
                              Epoch {job.currentEpoch}/{job.totalEpochs}
                            </span>
                            <span className="font-semibold text-primary">{job.progress}%</span>
                          </div>
                          <Progress value={job.progress} className="h-2" />
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="space-y-1">
                          <p className="text-gray-600 dark:text-gray-300">Loss</p>
                          <p className="font-semibold">{job.metrics.loss.toFixed(4)}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-gray-600 dark:text-gray-300">Accuracy</p>
                          <p className="font-semibold text-primary">
                            {(job.metrics.accuracy * 100).toFixed(2)}%
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
                        <Clock className="h-3 w-3" />
                        <span>Started {formatDistanceToNow(job.startedAt, { addSuffix: true })}</span>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* Detailed View */}
          {selectedJobData ? (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <Card className="border border-primary/20 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg">{selectedJobData.modelName}</CardTitle>
                  <CardDescription>Training Details & Metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="metrics" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="metrics">Metrics</TabsTrigger>
                      <TabsTrigger value="logs">Logs</TabsTrigger>
                    </TabsList>

                    <TabsContent value="metrics" className="space-y-4 pt-4">
                      {/* Current Progress */}
                      {selectedJobData.status === 'running' && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-semibold">Training Progress</span>
                            <span className="text-primary">{selectedJobData.progress}%</span>
                          </div>
                          <Progress value={selectedJobData.progress} className="h-3" />
                          <p className="text-xs text-gray-600 dark:text-gray-300">
                            Epoch {selectedJobData.currentEpoch} of {selectedJobData.totalEpochs}
                          </p>
                        </div>
                      )}

                      {/* Training Metrics */}
                      <div className="grid grid-cols-2 gap-4">
                        <Card className="border border-primary/10">
                          <CardHeader className="pb-3">
                            <CardDescription className="text-xs">Training Loss</CardDescription>
                            <CardTitle className="text-2xl">
                              {selectedJobData.metrics.loss.toFixed(4)}
                            </CardTitle>
                          </CardHeader>
                        </Card>

                        <Card className="border border-primary/10">
                          <CardHeader className="pb-3">
                            <CardDescription className="text-xs">Training Accuracy</CardDescription>
                            <CardTitle className="text-2xl text-primary">
                              {(selectedJobData.metrics.accuracy * 100).toFixed(2)}%
                            </CardTitle>
                          </CardHeader>
                        </Card>

                        {selectedJobData.metrics.valLoss !== undefined && (
                          <Card className="border border-primary/10">
                            <CardHeader className="pb-3">
                              <CardDescription className="text-xs">Validation Loss</CardDescription>
                              <CardTitle className="text-2xl">
                                {selectedJobData.metrics.valLoss.toFixed(4)}
                              </CardTitle>
                            </CardHeader>
                          </Card>
                        )}

                        {selectedJobData.metrics.valAccuracy !== undefined && (
                          <Card className="border border-primary/10">
                            <CardHeader className="pb-3">
                              <CardDescription className="text-xs">Validation Accuracy</CardDescription>
                              <CardTitle className="text-2xl text-primary">
                                {(selectedJobData.metrics.valAccuracy * 100).toFixed(2)}%
                              </CardTitle>
                            </CardHeader>
                          </Card>
                        )}
                      </div>

                      {/* Performance Indicator */}
                      <Card className="border border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
                        <CardContent className="pt-6">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-full bg-primary/20">
                              <TrendingUp className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-semibold text-sm">Performance Trend</p>
                              <p className="text-xs text-gray-600 dark:text-gray-300">
                                Model accuracy improving steadily
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="logs" className="pt-4">
                      <Card className="border border-primary/10 bg-gray-900">
                        <CardHeader className="pb-3">
                          <div className="flex items-center gap-2">
                            <Terminal className="h-4 w-4 text-green-400" />
                            <CardTitle className="text-sm text-green-400">Training Logs</CardTitle>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <ScrollArea className="h-[400px] w-full">
                            {selectedJobData.logs && selectedJobData.logs.length > 0 ? (
                              <div className="space-y-1 font-mono text-xs text-green-400">
                                {selectedJobData.logs.map((log, idx) => (
                                  <div key={idx} className="hover:bg-gray-800/50 px-2 py-1 rounded">
                                    {log}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-gray-400 text-center py-8">No logs available</p>
                            )}
                          </ScrollArea>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <Card className="border border-primary/20 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardContent className="py-12">
                <div className="text-center text-gray-600 dark:text-gray-300">
                  <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Select a training job to view details</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
