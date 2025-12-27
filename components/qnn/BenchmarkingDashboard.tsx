import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BarChart2,
  TrendingUp,
  Zap,
  DollarSign,
  Clock,
  Target,
  Play,
  RefreshCw
} from 'lucide-react';

interface BenchmarkMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  inferenceSpeed: number; // ms
  trainingTime: number; // minutes
  costPerInference: number; // USD
  quantumSpeedup: number; // percentage
}

interface BenchmarkComparison {
  model: string;
  classical: BenchmarkMetrics;
  quantum: BenchmarkMetrics;
}

export default function BenchmarkingDashboard() {
  const [isRunningBenchmark, setIsRunningBenchmark] = useState(false);
  const [benchmarkData] = useState<BenchmarkComparison[]>([]);

  const handleRunBenchmark = async () => {
    setIsRunningBenchmark(true);
    // This will be connected to API by Agent 1
    console.log('Running benchmark...');
    setTimeout(() => {
      setIsRunningBenchmark(false);
    }, 3000);
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border border-primary/20 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-primary/10">
                <BarChart2 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>Benchmarking Dashboard</CardTitle>
                <CardDescription>
                  Compare quantum vs classical performance metrics
                </CardDescription>
              </div>
            </div>
            <Button
              onClick={handleRunBenchmark}
              disabled={isRunningBenchmark}
              className="bg-primary hover:bg-primary/90 text-white"
            >
              {isRunningBenchmark ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="mr-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </motion.div>
                  Running...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Run Benchmark
                </>
              )}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {benchmarkData.length === 0 ? (
        <Card className="border border-primary/20 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <CardContent className="py-12">
            <div className="text-center">
              <div className="inline-flex p-4 rounded-full bg-gradient-to-br from-purple-500/10 to-blue-600/10 mb-4">
                <BarChart2 className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No Benchmark Data Yet</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md mx-auto">
                Run your first benchmark to compare quantum vs classical model performance
              </p>
              <Button
                onClick={handleRunBenchmark}
                disabled={isRunningBenchmark}
                className="bg-primary hover:bg-primary/90 text-white"
              >
                <Play className="mr-2 h-4 w-4" />
                Run First Benchmark
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          {/* Key Metrics Cards */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="border border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardDescription className="text-xs">Avg Accuracy</CardDescription>
                  <Target className="h-4 w-4 text-primary" />
                </div>
                <CardTitle className="text-3xl text-primary">98.5%</CardTitle>
                <div className="flex items-center gap-1 text-xs text-green-600">
                  <TrendingUp className="h-3 w-3" />
                  <span>+12% vs Classical</span>
                </div>
              </CardHeader>
            </Card>

            <Card className="border border-primary/20 bg-gradient-to-br from-blue-500/5 to-blue-600/10">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardDescription className="text-xs">Inference Speed</CardDescription>
                  <Zap className="h-4 w-4 text-blue-600" />
                </div>
                <CardTitle className="text-3xl text-blue-600">2.3ms</CardTitle>
                <div className="flex items-center gap-1 text-xs text-green-600">
                  <TrendingUp className="h-3 w-3" />
                  <span>15% faster</span>
                </div>
              </CardHeader>
            </Card>

            <Card className="border border-primary/20 bg-gradient-to-br from-emerald-500/5 to-emerald-600/10">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardDescription className="text-xs">Cost Efficiency</CardDescription>
                  <DollarSign className="h-4 w-4 text-emerald-600" />
                </div>
                <CardTitle className="text-3xl text-emerald-600">$0.003</CardTitle>
                <div className="flex items-center gap-1 text-xs text-green-600">
                  <TrendingUp className="h-3 w-3" />
                  <span>-8% cost</span>
                </div>
              </CardHeader>
            </Card>

            <Card className="border border-primary/20 bg-gradient-to-br from-amber-500/5 to-amber-600/10">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardDescription className="text-xs">Training Time</CardDescription>
                  <Clock className="h-4 w-4 text-amber-600" />
                </div>
                <CardTitle className="text-3xl text-amber-600">18min</CardTitle>
                <div className="flex items-center gap-1 text-xs text-green-600">
                  <TrendingUp className="h-3 w-3" />
                  <span>-25% time</span>
                </div>
              </CardHeader>
            </Card>
          </motion.div>

          {/* Detailed Comparison */}
          <motion.div variants={itemVariants}>
            <Card className="border border-primary/20 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg">Performance Comparison</CardTitle>
                <CardDescription>Quantum vs Classical Model Metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="accuracy" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="accuracy">Accuracy</TabsTrigger>
                    <TabsTrigger value="speed">Speed</TabsTrigger>
                    <TabsTrigger value="cost">Cost</TabsTrigger>
                    <TabsTrigger value="training">Training</TabsTrigger>
                  </TabsList>

                  <TabsContent value="accuracy" className="space-y-4 pt-6">
                    <div className="space-y-6">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge className="bg-primary/10 text-primary border-primary/20">
                              Quantum
                            </Badge>
                            <span className="text-sm font-semibold">98.5%</span>
                          </div>
                        </div>
                        <Progress value={98.5} className="h-3" />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">Classical</Badge>
                            <span className="text-sm font-semibold">86.3%</span>
                          </div>
                        </div>
                        <Progress value={86.3} className="h-3 [&>div]:bg-gray-400" />
                      </div>

                      <Card className="border border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
                        <CardContent className="pt-6">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-full bg-primary/20">
                              <TrendingUp className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-semibold text-sm">12.2% Improvement</p>
                              <p className="text-xs text-gray-600 dark:text-gray-300">
                                Quantum model shows superior accuracy
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="speed" className="space-y-4 pt-6">
                    <div className="space-y-6">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge className="bg-primary/10 text-primary border-primary/20">
                              Quantum
                            </Badge>
                            <span className="text-sm font-semibold">2.3ms</span>
                          </div>
                        </div>
                        <Progress value={23} className="h-3" />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">Classical</Badge>
                            <span className="text-sm font-semibold">2.7ms</span>
                          </div>
                        </div>
                        <Progress value={27} className="h-3 [&>div]:bg-gray-400" />
                      </div>

                      <Card className="border border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
                        <CardContent className="pt-6">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-full bg-primary/20">
                              <Zap className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-semibold text-sm">15% Faster Inference</p>
                              <p className="text-xs text-gray-600 dark:text-gray-300">
                                Quantum acceleration delivers speed boost
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="cost" className="space-y-4 pt-6">
                    <div className="space-y-6">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge className="bg-primary/10 text-primary border-primary/20">
                              Quantum
                            </Badge>
                            <span className="text-sm font-semibold">$0.003/inference</span>
                          </div>
                        </div>
                        <Progress value={30} className="h-3" />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">Classical</Badge>
                            <span className="text-sm font-semibold">$0.0033/inference</span>
                          </div>
                        </div>
                        <Progress value={33} className="h-3 [&>div]:bg-gray-400" />
                      </div>

                      <Card className="border border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
                        <CardContent className="pt-6">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-full bg-primary/20">
                              <DollarSign className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-semibold text-sm">8% Cost Reduction</p>
                              <p className="text-xs text-gray-600 dark:text-gray-300">
                                Lower operational costs with quantum
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="training" className="space-y-4 pt-6">
                    <div className="space-y-6">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge className="bg-primary/10 text-primary border-primary/20">
                              Quantum
                            </Badge>
                            <span className="text-sm font-semibold">18 minutes</span>
                          </div>
                        </div>
                        <Progress value={75} className="h-3" />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">Classical</Badge>
                            <span className="text-sm font-semibold">24 minutes</span>
                          </div>
                        </div>
                        <Progress value={100} className="h-3 [&>div]:bg-gray-400" />
                      </div>

                      <Card className="border border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
                        <CardContent className="pt-6">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-full bg-primary/20">
                              <Clock className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-semibold text-sm">25% Faster Training</p>
                              <p className="text-xs text-gray-600 dark:text-gray-300">
                                Reduced time to production
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </motion.div>

          {/* Additional Metrics */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border border-primary/20 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-sm">Precision</CardTitle>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-primary">97.8%</span>
                  <Badge className="bg-green-500/10 text-green-600 border-green-500/20 text-xs">
                    +9%
                  </Badge>
                </div>
              </CardHeader>
            </Card>

            <Card className="border border-primary/20 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-sm">Recall</CardTitle>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-primary">96.2%</span>
                  <Badge className="bg-green-500/10 text-green-600 border-green-500/20 text-xs">
                    +7%
                  </Badge>
                </div>
              </CardHeader>
            </Card>

            <Card className="border border-primary/20 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-sm">F1 Score</CardTitle>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-primary">97.0%</span>
                  <Badge className="bg-green-500/10 text-green-600 border-green-500/20 text-xs">
                    +8%
                  </Badge>
                </div>
              </CardHeader>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
