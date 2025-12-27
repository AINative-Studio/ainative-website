import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Atom,
  Waves,
  GitMerge,
  Cpu,
  Activity,
  Zap,
  TrendingUp,
  Gauge
} from 'lucide-react';

interface QuantumMetrics {
  qubitCount: number;
  coherenceTime: number; // microseconds
  gateErrorRate: number; // percentage
  entanglementLevel: number; // percentage
  quantumVolume: number;
  circuitDepth: number;
}

export default function QuantumVisualization() {
  const [metrics] = useState<QuantumMetrics>({
    qubitCount: 8,
    coherenceTime: 120,
    gateErrorRate: 0.05,
    entanglementLevel: 92,
    quantumVolume: 64,
    circuitDepth: 12
  });

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
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-full bg-gradient-to-br from-purple-500/10 to-blue-600/10">
              <Atom className="h-6 w-6 text-primary animate-spin-slow" />
            </div>
            <div>
              <CardTitle>Quantum Monitoring</CardTitle>
              <CardDescription>
                Real-time quantum circuit performance and quantum metrics
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* Key Quantum Metrics */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border border-primary/20 bg-gradient-to-br from-purple-500/5 to-purple-600/10">
            <CardHeader>
              <div className="flex items-center justify-between mb-3">
                <CardDescription className="text-xs">Qubit Count</CardDescription>
                <Cpu className="h-4 w-4 text-purple-600" />
              </div>
              <div className="flex items-baseline gap-2">
                <CardTitle className="text-4xl text-purple-600">{metrics.qubitCount}</CardTitle>
                <span className="text-sm text-gray-600 dark:text-gray-300">qubits</span>
              </div>
              <Badge className="bg-purple-500/10 text-purple-600 border-purple-500/20 text-xs mt-2">
                High Performance
              </Badge>
            </CardHeader>
          </Card>

          <Card className="border border-primary/20 bg-gradient-to-br from-blue-500/5 to-blue-600/10">
            <CardHeader>
              <div className="flex items-center justify-between mb-3">
                <CardDescription className="text-xs">Coherence Time</CardDescription>
                <Activity className="h-4 w-4 text-blue-600" />
              </div>
              <div className="flex items-baseline gap-2">
                <CardTitle className="text-4xl text-blue-600">{metrics.coherenceTime}</CardTitle>
                <span className="text-sm text-gray-600 dark:text-gray-300">μs</span>
              </div>
              <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20 text-xs mt-2">
                Excellent
              </Badge>
            </CardHeader>
          </Card>

          <Card className="border border-primary/20 bg-gradient-to-br from-emerald-500/5 to-emerald-600/10">
            <CardHeader>
              <div className="flex items-center justify-between mb-3">
                <CardDescription className="text-xs">Quantum Volume</CardDescription>
                <Gauge className="h-4 w-4 text-emerald-600" />
              </div>
              <div className="flex items-baseline gap-2">
                <CardTitle className="text-4xl text-emerald-600">{metrics.quantumVolume}</CardTitle>
                <span className="text-sm text-gray-600 dark:text-gray-300">QV</span>
              </div>
              <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs mt-2">
                Production Ready
              </Badge>
            </CardHeader>
          </Card>
        </motion.div>

        {/* Detailed Metrics */}
        <motion.div variants={itemVariants}>
          <Card className="border border-primary/20 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg">Quantum Performance Metrics</CardTitle>
              <CardDescription>Detailed quantum circuit characteristics</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="quantum-properties" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="quantum-properties">Properties</TabsTrigger>
                  <TabsTrigger value="circuit-analysis">Circuit</TabsTrigger>
                  <TabsTrigger value="performance">Performance</TabsTrigger>
                </TabsList>

                <TabsContent value="quantum-properties" className="space-y-6 pt-6">
                  {/* Superposition */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 rounded-full bg-primary/10">
                        <Atom className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-semibold text-sm">Superposition State</h4>
                          <span className="text-sm font-semibold text-primary">Active</span>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-300">
                          Qubits in simultaneous states for parallel computation
                        </p>
                      </div>
                    </div>
                    <Progress value={100} className="h-2" />
                  </div>

                  {/* Entanglement */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 rounded-full bg-primary/10">
                        <GitMerge className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-semibold text-sm">Entanglement Level</h4>
                          <span className="text-sm font-semibold text-primary">
                            {metrics.entanglementLevel}%
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-300">
                          Quantum correlation between qubits for enhanced performance
                        </p>
                      </div>
                    </div>
                    <Progress value={metrics.entanglementLevel} className="h-2" />
                  </div>

                  {/* Interference */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 rounded-full bg-primary/10">
                        <Waves className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-semibold text-sm">Quantum Interference</h4>
                          <span className="text-sm font-semibold text-primary">Optimal</span>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-300">
                          Constructive interference amplifying correct solutions
                        </p>
                      </div>
                    </div>
                    <Progress value={95} className="h-2" />
                  </div>

                  <Card className="border border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 mt-4">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-primary/20">
                          <TrendingUp className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm">Quantum Advantage Active</p>
                          <p className="text-xs text-gray-600 dark:text-gray-300">
                            All quantum properties optimized for maximum performance
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="circuit-analysis" className="space-y-6 pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="border border-primary/10">
                      <CardHeader className="pb-3">
                        <CardDescription className="text-xs">Circuit Depth</CardDescription>
                        <CardTitle className="text-3xl">{metrics.circuitDepth}</CardTitle>
                        <p className="text-xs text-gray-600 dark:text-gray-300">
                          layers
                        </p>
                      </CardHeader>
                    </Card>

                    <Card className="border border-primary/10">
                      <CardHeader className="pb-3">
                        <CardDescription className="text-xs">Gate Error Rate</CardDescription>
                        <CardTitle className="text-3xl text-emerald-600">
                          {metrics.gateErrorRate}%
                        </CardTitle>
                        <p className="text-xs text-gray-600 dark:text-gray-300">
                          error margin
                        </p>
                      </CardHeader>
                    </Card>
                  </div>

                  {/* Circuit Visualization Placeholder */}
                  <Card className="border border-primary/20 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
                    <CardContent className="py-12">
                      <div className="text-center">
                        <div className="inline-flex p-4 rounded-full bg-primary/10 mb-4">
                          <Cpu className="h-8 w-8 text-primary" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">Quantum Circuit Diagram</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                          Visual representation of quantum gates and operations
                        </p>
                        <div className="max-w-2xl mx-auto">
                          <div className="aspect-video bg-white dark:bg-gray-800 rounded-lg border-2 border-dashed border-primary/20 flex items-center justify-center">
                            <div className="text-center">
                              <Zap className="h-12 w-12 text-primary mx-auto mb-2 opacity-50" />
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                Circuit visualization coming soon
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="performance" className="space-y-4 pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="border border-primary/10">
                      <CardHeader className="pb-3">
                        <CardDescription className="text-xs flex items-center gap-1">
                          <Zap className="h-3 w-3" />
                          Speed Boost
                        </CardDescription>
                        <CardTitle className="text-3xl text-primary">15%</CardTitle>
                        <Badge className="bg-green-500/10 text-green-600 border-green-500/20 text-xs">
                          vs Classical
                        </Badge>
                      </CardHeader>
                    </Card>

                    <Card className="border border-primary/10">
                      <CardHeader className="pb-3">
                        <CardDescription className="text-xs flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" />
                          Accuracy Gain
                        </CardDescription>
                        <CardTitle className="text-3xl text-primary">12%</CardTitle>
                        <Badge className="bg-green-500/10 text-green-600 border-green-500/20 text-xs">
                          Improvement
                        </Badge>
                      </CardHeader>
                    </Card>

                    <Card className="border border-primary/10">
                      <CardHeader className="pb-3">
                        <CardDescription className="text-xs flex items-center gap-1">
                          <Activity className="h-3 w-3" />
                          Efficiency
                        </CardDescription>
                        <CardTitle className="text-3xl text-primary">98%</CardTitle>
                        <Badge className="bg-green-500/10 text-green-600 border-green-500/20 text-xs">
                          Optimal
                        </Badge>
                      </CardHeader>
                    </Card>
                  </div>

                  <Card className="border border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
                    <CardHeader>
                      <CardTitle className="text-sm">Quantum Processing Unit Status</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-300">QPU Temperature</span>
                        <Badge variant="secondary">15 mK</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-300">System Uptime</span>
                        <Badge variant="secondary">99.9%</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-300">Queue Position</span>
                        <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                          Active
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border border-primary/20 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="text-sm">Resource Utilization</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-300">QPU Usage</span>
                          <span className="font-semibold">78%</span>
                        </div>
                        <Progress value={78} className="h-2" />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-300">Memory</span>
                          <span className="font-semibold">64%</span>
                        </div>
                        <Progress value={64} className="h-2" />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-300">Network</span>
                          <span className="font-semibold">42%</span>
                        </div>
                        <Progress value={42} className="h-2" />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}
