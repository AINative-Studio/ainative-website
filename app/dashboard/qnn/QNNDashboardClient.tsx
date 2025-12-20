'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
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
import { Progress } from '@/components/ui/progress';
import {
  Cpu,
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
  RefreshCcw,
  Code,
  BarChart2,
  Save,
  Upload,
  Download,
  Sparkles,
  Server,
  ChevronRight,
  TrendingUp,
  HardDrive,
} from 'lucide-react';
import quantumService, {
  QuantumJob,
  QuantumBackend,
  QuantumCircuit,
  CreateJobRequest,
  CreateCircuitRequest,
} from '@/lib/quantum-service';

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
const mockBackends: QuantumBackend[] = [
  {
    id: 'sim-1',
    name: 'AerSimulator',
    provider: 'simulator',
    type: 'simulator',
    status: 'online',
    qubits: 32,
    connectivity: [],
    features: ['noise-model', 'density-matrix', 'statevector'],
    queueDepth: 0,
    avgWaitTime: 0,
    costPerShot: 0,
    description: 'High-performance quantum circuit simulator',
    capabilities: {
      maxQubits: 32,
      maxShots: 100000,
      supportedGates: ['x', 'y', 'z', 'h', 'cx', 'cz', 'rx', 'ry', 'rz', 'u1', 'u2', 'u3'],
      hasErrorCorrection: false,
      fidelity: 1.0,
    },
  },
  {
    id: 'ibm-1',
    name: 'IBM Quantum Eagle',
    provider: 'ibm',
    type: 'hardware',
    status: 'online',
    qubits: 127,
    connectivity: [],
    features: ['error-mitigation', 'dynamic-circuits'],
    queueDepth: 15,
    avgWaitTime: 300,
    costPerShot: 0.001,
    description: '127-qubit quantum processor with advanced error mitigation',
    capabilities: {
      maxQubits: 127,
      maxShots: 10000,
      supportedGates: ['x', 'y', 'z', 'h', 'cx', 'rz', 'sx'],
      hasErrorCorrection: true,
      fidelity: 0.99,
    },
  },
  {
    id: 'ionq-1',
    name: 'IonQ Aria',
    provider: 'ionq',
    type: 'hardware',
    status: 'online',
    qubits: 25,
    connectivity: [],
    features: ['all-to-all-connectivity', 'high-fidelity'],
    queueDepth: 8,
    avgWaitTime: 180,
    costPerShot: 0.003,
    description: 'Trapped ion quantum computer with all-to-all connectivity',
    capabilities: {
      maxQubits: 25,
      maxShots: 10000,
      supportedGates: ['x', 'y', 'z', 'h', 'cx', 'rx', 'ry', 'rz'],
      hasErrorCorrection: false,
      fidelity: 0.995,
    },
  },
];

const mockJobs: QuantumJob[] = [
  {
    id: 'job-1',
    name: 'Bell State Circuit',
    status: 'completed',
    backendId: 'sim-1',
    backendName: 'AerSimulator',
    backendType: 'simulator',
    qubits: 2,
    shots: 1000,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    startedAt: new Date(Date.now() - 3590000).toISOString(),
    completedAt: new Date(Date.now() - 3580000).toISOString(),
    duration: 1.2,
    results: {
      counts: { '00': 501, '11': 499 },
      probabilities: { '00': 0.501, '11': 0.499 },
      measurements: [],
      metadata: {
        executionTime: 1.2,
        queueTime: 0.1,
        circuitDepth: 2,
        gateCount: 3,
      },
    },
    estimatedCost: 0,
    actualCost: 0,
  },
  {
    id: 'job-2',
    name: 'Quantum Fourier Transform',
    status: 'running',
    backendId: 'ibm-1',
    backendName: 'IBM Quantum Eagle',
    backendType: 'hardware',
    qubits: 8,
    shots: 5000,
    createdAt: new Date(Date.now() - 600000).toISOString(),
    startedAt: new Date(Date.now() - 300000).toISOString(),
    duration: 0,
    estimatedCost: 5.0,
  },
  {
    id: 'job-3',
    name: "Grover's Algorithm",
    status: 'queued',
    backendId: 'ionq-1',
    backendName: 'IonQ Aria',
    backendType: 'hardware',
    qubits: 4,
    shots: 2000,
    createdAt: new Date(Date.now() - 120000).toISOString(),
    duration: 0,
    estimatedCost: 6.0,
  },
];

const mockCircuits: QuantumCircuit[] = [
  {
    id: 'circuit-1',
    name: 'Bell State',
    description: 'Creates a maximally entangled Bell state',
    qubits: 2,
    depth: 2,
    gates: [],
    code: `OPENQASM 2.0;
include "qelib1.inc";
qreg q[2];
creg c[2];
h q[0];
cx q[0],q[1];
measure q -> c;`,
    codeFormat: 'qasm',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
    tags: ['entanglement', 'basic'],
    isPublic: true,
  },
  {
    id: 'circuit-2',
    name: 'Quantum Fourier Transform',
    description: '8-qubit QFT circuit',
    qubits: 8,
    depth: 28,
    gates: [],
    code: `# QFT implementation
qc = QuantumCircuit(8)
# QFT gates...
qc.measure_all()`,
    codeFormat: 'qiskit',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    updatedAt: new Date(Date.now() - 172800000).toISOString(),
    tags: ['qft', 'algorithm'],
    isPublic: false,
  },
];

const exampleCircuits = [
  {
    name: 'Bell State',
    description: 'Create entanglement between 2 qubits',
    qubits: 2,
    code: `OPENQASM 2.0;
include "qelib1.inc";
qreg q[2];
creg c[2];
h q[0];
cx q[0],q[1];
measure q -> c;`,
  },
  {
    name: 'Superposition',
    description: 'Put a qubit in superposition',
    qubits: 1,
    code: `OPENQASM 2.0;
include "qelib1.inc";
qreg q[1];
creg c[1];
h q[0];
measure q -> c;`,
  },
  {
    name: 'GHZ State',
    description: '3-qubit maximally entangled state',
    qubits: 3,
    code: `OPENQASM 2.0;
include "qelib1.inc";
qreg q[3];
creg c[3];
h q[0];
cx q[0],q[1];
cx q[0],q[2];
measure q -> c;`,
  },
];

export default function QNNDashboardClient() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [selectedBackend, setSelectedBackend] = useState<string>('');
  const [selectedCircuit, setSelectedCircuit] = useState<string>('');
  const [circuitCode, setCircuitCode] = useState<string>('');
  const [circuitFormat, setCircuitFormat] = useState<'qasm' | 'qiskit' | 'cirq' | 'quil'>('qasm');
  const [jobName, setJobName] = useState<string>('');
  const [qubits, setQubits] = useState<number>(2);
  const [shots, setShots] = useState<number>(1000);
  const [activeTab, setActiveTab] = useState<string>('jobs');
  const [selectedJob, setSelectedJob] = useState<QuantumJob | null>(null);
  const [showJobDetails, setShowJobDetails] = useState(false);
  const [showCircuitDialog, setShowCircuitDialog] = useState(false);
  const [newCircuitName, setNewCircuitName] = useState('');
  const [newCircuitDescription, setNewCircuitDescription] = useState('');
  const [useMockData, setUseMockData] = useState(false);

  // Fetch backends
  const { data: backends = [], isLoading: backendsLoading } = useQuery({
    queryKey: ['quantum-backends'],
    queryFn: async () => {
      try {
        return await quantumService.getBackends();
      } catch (error) {
        console.warn('Failed to load backends, using mock data:', error);
        setUseMockData(true);
        return mockBackends;
      }
    },
    refetchInterval: 30000,
  });

  // Fetch jobs
  const { data: jobs = [], isLoading: jobsLoading, refetch: refetchJobs } = useQuery({
    queryKey: ['quantum-jobs'],
    queryFn: async () => {
      if (useMockData) return mockJobs;
      try {
        return await quantumService.getJobs();
      } catch (error) {
        console.warn('Failed to load jobs, using mock data:', error);
        setUseMockData(true);
        return mockJobs;
      }
    },
    refetchInterval: 5000,
  });

  // Fetch circuits
  const { data: circuits = [], isLoading: circuitsLoading } = useQuery({
    queryKey: ['quantum-circuits'],
    queryFn: async () => {
      if (useMockData) return mockCircuits;
      try {
        return await quantumService.getCircuits();
      } catch (error) {
        console.warn('Failed to load circuits, using mock data:', error);
        setUseMockData(true);
        return mockCircuits;
      }
    },
  });

  // Create job mutation
  const createJobMutation = useMutation({
    mutationFn: async (request: CreateJobRequest) => {
      if (useMockData) {
        const newJob: QuantumJob = {
          id: `job-${Date.now()}`,
          name: request.name,
          status: 'queued',
          backendId: request.backendId,
          backendName: backends.find(b => b.id === request.backendId)?.name || 'Unknown',
          backendType: backends.find(b => b.id === request.backendId)?.type || 'simulator',
          qubits: request.qubits,
          shots: request.shots,
          createdAt: new Date().toISOString(),
          estimatedCost: backends.find(b => b.id === request.backendId)?.costPerShot
            ? (backends.find(b => b.id === request.backendId)!.costPerShot! * request.shots)
            : 0,
        };
        return newJob;
      }
      return await quantumService.createJob(request);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quantum-jobs'] });
      setJobName('');
      setCircuitCode('');
    },
  });

  // Create circuit mutation
  const createCircuitMutation = useMutation({
    mutationFn: async (request: CreateCircuitRequest) => {
      if (useMockData) {
        const newCircuit: QuantumCircuit = {
          id: `circuit-${Date.now()}`,
          name: request.name,
          description: request.description || '',
          qubits: request.qubits,
          depth: 0,
          gates: [],
          code: request.code,
          codeFormat: request.codeFormat,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          tags: request.tags || [],
          isPublic: request.isPublic || false,
        };
        return newCircuit;
      }
      return await quantumService.createCircuit(request);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quantum-circuits'] });
      setShowCircuitDialog(false);
      setNewCircuitName('');
      setNewCircuitDescription('');
    },
  });

  // Delete job mutation
  const deleteJobMutation = useMutation({
    mutationFn: async (jobId: string) => {
      if (useMockData) {
        return { success: true };
      }
      return await quantumService.deleteJob(jobId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quantum-jobs'] });
    },
  });

  // Set default backend when backends load
  useEffect(() => {
    if (backends.length > 0 && !selectedBackend) {
      setSelectedBackend(backends[0].id);
    }
  }, [backends, selectedBackend]);

  // Load selected circuit
  useEffect(() => {
    if (selectedCircuit && selectedCircuit !== 'custom') {
      const circuit = circuits.find(c => c.id === selectedCircuit);
      if (circuit) {
        setCircuitCode(circuit.code);
        setCircuitFormat(circuit.codeFormat);
        setQubits(circuit.qubits);
      }
    }
  }, [selectedCircuit, circuits]);

  const handleSubmitJob = () => {
    if (!selectedBackend || !circuitCode) {
      return;
    }

    createJobMutation.mutate({
      name: jobName || `Job ${new Date().toLocaleString()}`,
      backendId: selectedBackend,
      circuitCode,
      codeFormat: circuitFormat,
      qubits,
      shots,
    });
  };

  const handleSaveCircuit = () => {
    if (!newCircuitName || !circuitCode) {
      return;
    }

    createCircuitMutation.mutate({
      name: newCircuitName,
      description: newCircuitDescription,
      code: circuitCode,
      codeFormat: circuitFormat,
      qubits,
      tags: [],
      isPublic: false,
    });
  };

  const handleLoadExample = (example: typeof exampleCircuits[0]) => {
    setCircuitCode(example.code);
    setQubits(example.qubits);
    setCircuitFormat('qasm');
    setSelectedCircuit('custom');
  };

  const getStatusBadge = (status: QuantumJob['status']) => {
    const variants: Record<QuantumJob['status'], { variant: 'default' | 'secondary' | 'destructive' | 'outline', icon: React.ReactNode }> = {
      pending: { variant: 'secondary', icon: <Clock className="h-3 w-3 mr-1" /> },
      queued: { variant: 'secondary', icon: <Clock className="h-3 w-3 mr-1" /> },
      running: { variant: 'default', icon: <Loader2 className="h-3 w-3 mr-1 animate-spin" /> },
      completed: { variant: 'outline', icon: <CheckCircle className="h-3 w-3 mr-1 text-green-500" /> },
      failed: { variant: 'destructive', icon: <XCircle className="h-3 w-3 mr-1" /> },
      cancelled: { variant: 'outline', icon: <XCircle className="h-3 w-3 mr-1" /> },
    };

    const { variant, icon } = variants[status];
    return (
      <Badge variant={variant} className="flex items-center">
        {icon}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getBackendBadge = (type: 'simulator' | 'hardware') => {
    return type === 'hardware' ? (
      <Badge variant="default" className="flex items-center">
        <Cpu className="h-3 w-3 mr-1" />
        Hardware
      </Badge>
    ) : (
      <Badge variant="secondary" className="flex items-center">
        <Server className="h-3 w-3 mr-1" />
        Simulator
      </Badge>
    );
  };

  const renderJobResults = (job: QuantumJob) => {
    if (!job.results) return null;

    const { counts, probabilities } = job.results;
    const maxCount = Math.max(...Object.values(counts));

    return (
      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-medium mb-3">Measurement Results</h4>
          <div className="space-y-2">
            {Object.entries(counts).map(([state, count]) => {
              const probability = probabilities[state] || 0;
              const percentage = (count / job.shots) * 100;

              return (
                <div key={state} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-mono">|{state}⟩</span>
                    <span className="text-muted-foreground">
                      {count} ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <Progress value={(count / maxCount) * 100} className="h-2" />
                </div>
              );
            })}
          </div>
        </div>

        <Separator />

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Execution Time</p>
            <p className="font-medium">{job.results.metadata.executionTime.toFixed(2)}s</p>
          </div>
          <div>
            <p className="text-muted-foreground">Circuit Depth</p>
            <p className="font-medium">{job.results.metadata.circuitDepth}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Gate Count</p>
            <p className="font-medium">{job.results.metadata.gateCount}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Queue Time</p>
            <p className="font-medium">{job.results.metadata.queueTime.toFixed(2)}s</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={stagger}
      className="space-y-8 p-8"
    >
      <motion.div variants={fadeUp}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">
              Quantum Computing
            </h1>
            <p className="text-muted-foreground mt-2">
              Execute quantum circuits on simulators and real quantum hardware
            </p>
          </div>
          {useMockData && (
            <Badge variant="outline" className="flex items-center">
              <AlertCircle className="h-3 w-3 mr-1" />
              Using Mock Data
            </Badge>
          )}
        </div>
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="jobs">
            <Activity className="h-4 w-4 mr-2" />
            Jobs
          </TabsTrigger>
          <TabsTrigger value="circuit-builder">
            <Code className="h-4 w-4 mr-2" />
            Circuit Builder
          </TabsTrigger>
          <TabsTrigger value="backends">
            <Server className="h-4 w-4 mr-2" />
            Backends
          </TabsTrigger>
        </TabsList>

        <TabsContent value="jobs" className="space-y-6">
          <motion.div variants={fadeUp}>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Job Queue</CardTitle>
                    <CardDescription>Track your quantum computing jobs</CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => refetchJobs()}
                    disabled={jobsLoading}
                  >
                    <RefreshCcw className={`h-4 w-4 mr-2 ${jobsLoading ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {jobsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : jobs.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No jobs yet. Submit a circuit to get started!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {jobs.map((job) => (
                      <motion.div
                        key={job.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="border rounded-lg p-4 hover:border-primary/50 transition-colors cursor-pointer"
                        onClick={() => {
                          setSelectedJob(job);
                          setShowJobDetails(true);
                        }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-3">
                              <h3 className="font-medium">{job.name}</h3>
                              {getStatusBadge(job.status)}
                              {getBackendBadge(job.backendType)}
                            </div>
                            <div className="text-sm text-muted-foreground space-y-1">
                              <div className="flex items-center gap-4">
                                <span className="flex items-center">
                                  <Server className="h-3 w-3 mr-1" />
                                  {job.backendName}
                                </span>
                                <span className="flex items-center">
                                  <Cpu className="h-3 w-3 mr-1" />
                                  {job.qubits} qubits
                                </span>
                                <span className="flex items-center">
                                  <BarChart2 className="h-3 w-3 mr-1" />
                                  {job.shots} shots
                                </span>
                                {job.duration !== undefined && job.duration > 0 && (
                                  <span className="flex items-center">
                                    <Clock className="h-3 w-3 mr-1" />
                                    {job.duration.toFixed(2)}s
                                  </span>
                                )}
                              </div>
                              <p className="text-xs">
                                Created {new Date(job.createdAt).toLocaleString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {job.status === 'completed' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedJob(job);
                                  setShowJobDetails(true);
                                }}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View Results
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteJobMutation.mutate(job.id);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="circuit-builder" className="space-y-6">
          <motion.div variants={fadeUp} className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Circuit Configuration</CardTitle>
                <CardDescription>Configure and submit quantum circuits</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Job Name</Label>
                  <Input
                    placeholder="e.g., Bell State Experiment"
                    value={jobName}
                    onChange={(e) => setJobName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Backend</Label>
                  <Select value={selectedBackend} onValueChange={setSelectedBackend}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select backend" />
                    </SelectTrigger>
                    <SelectContent>
                      {backends.map((backend) => (
                        <SelectItem key={backend.id} value={backend.id}>
                          <div className="flex items-center gap-2">
                            {backend.type === 'hardware' ? (
                              <Cpu className="h-4 w-4" />
                            ) : (
                              <Server className="h-4 w-4" />
                            )}
                            <span>{backend.name}</span>
                            <Badge variant={backend.status === 'online' ? 'outline' : 'secondary'}>
                              {backend.qubits} qubits
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedBackend && backends.find(b => b.id === selectedBackend) && (
                    <p className="text-xs text-muted-foreground">
                      {backends.find(b => b.id === selectedBackend)!.description}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Qubits</Label>
                    <Input
                      type="number"
                      min={1}
                      max={32}
                      value={qubits}
                      onChange={(e) => setQubits(parseInt(e.target.value) || 2)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Shots</Label>
                    <Input
                      type="number"
                      min={100}
                      max={100000}
                      step={100}
                      value={shots}
                      onChange={(e) => setShots(parseInt(e.target.value) || 1000)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Load Saved Circuit</Label>
                  <Select value={selectedCircuit} onValueChange={setSelectedCircuit}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a circuit or write custom" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="custom">Custom Circuit</SelectItem>
                      {circuits.map((circuit) => (
                        <SelectItem key={circuit.id} value={circuit.id}>
                          {circuit.name} ({circuit.qubits} qubits)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Circuit Code</Label>
                    <Select value={circuitFormat} onValueChange={(v) => setCircuitFormat(v as any)}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="qasm">QASM</SelectItem>
                        <SelectItem value="qiskit">Qiskit</SelectItem>
                        <SelectItem value="cirq">Cirq</SelectItem>
                        <SelectItem value="quil">Quil</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Textarea
                    placeholder="Enter quantum circuit code..."
                    value={circuitCode}
                    onChange={(e) => setCircuitCode(e.target.value)}
                    className="font-mono text-sm h-64"
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleSubmitJob}
                    disabled={!selectedBackend || !circuitCode || createJobMutation.isPending}
                    className="flex-1"
                  >
                    {createJobMutation.isPending ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Play className="h-4 w-4 mr-2" />
                    )}
                    Submit Job
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowCircuitDialog(true)}
                    disabled={!circuitCode}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Circuit
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Example Circuits</CardTitle>
                <CardDescription>Quick start with pre-built circuits</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {exampleCircuits.map((example) => (
                  <div
                    key={example.name}
                    className="border rounded-lg p-4 hover:border-primary/50 transition-colors cursor-pointer"
                    onClick={() => handleLoadExample(example)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h4 className="font-medium">{example.name}</h4>
                        <p className="text-sm text-muted-foreground">{example.description}</p>
                        <Badge variant="secondary">{example.qubits} qubits</Badge>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </div>
                ))}

                <Separator className="my-4" />

                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Saved Circuits</h4>
                  {circuits.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No saved circuits yet</p>
                  ) : (
                    <div className="space-y-2">
                      {circuits.map((circuit) => (
                        <div
                          key={circuit.id}
                          className="border rounded p-3 hover:border-primary/50 transition-colors cursor-pointer"
                          onClick={() => setSelectedCircuit(circuit.id)}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-sm">{circuit.name}</p>
                              <p className="text-xs text-muted-foreground">{circuit.description}</p>
                            </div>
                            <Badge variant="outline">{circuit.qubits}q</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="backends" className="space-y-6">
          <motion.div variants={fadeUp}>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {backends.map((backend) => (
                <motion.div
                  key={backend.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <Card className={selectedBackend === backend.id ? 'border-primary' : ''}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle className="text-lg">{backend.name}</CardTitle>
                          <CardDescription className="text-xs">{backend.provider.toUpperCase()}</CardDescription>
                        </div>
                        {getBackendBadge(backend.type)}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground">{backend.description}</p>

                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-muted-foreground">Qubits</p>
                          <p className="font-medium">{backend.qubits}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Status</p>
                          <Badge variant={backend.status === 'online' ? 'outline' : 'secondary'}>
                            {backend.status}
                          </Badge>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Queue</p>
                          <p className="font-medium">{backend.queueDepth} jobs</p>
                        </div>
                        {backend.capabilities.fidelity && (
                          <div>
                            <p className="text-muted-foreground">Fidelity</p>
                            <p className="font-medium">{(backend.capabilities.fidelity * 100).toFixed(1)}%</p>
                          </div>
                        )}
                      </div>

                      <Separator />

                      <div className="space-y-2">
                        <p className="text-sm font-medium">Features</p>
                        <div className="flex flex-wrap gap-1">
                          {backend.features.map((feature) => (
                            <Badge key={feature} variant="secondary" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <Button
                        variant={selectedBackend === backend.id ? 'default' : 'outline'}
                        className="w-full"
                        onClick={() => {
                          setSelectedBackend(backend.id);
                          setActiveTab('circuit-builder');
                        }}
                        disabled={backend.status !== 'online'}
                      >
                        {selectedBackend === backend.id ? 'Selected' : 'Select Backend'}
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </TabsContent>
      </Tabs>

      {/* Job Details Dialog */}
      <Dialog open={showJobDetails} onOpenChange={setShowJobDetails}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedJob?.name}</DialogTitle>
            <DialogDescription>Job details and results</DialogDescription>
          </DialogHeader>
          {selectedJob && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <div className="mt-1">{getStatusBadge(selectedJob.status)}</div>
                </div>
                <div>
                  <p className="text-muted-foreground">Backend</p>
                  <div className="mt-1">{getBackendBadge(selectedJob.backendType)}</div>
                </div>
                <div>
                  <p className="text-muted-foreground">Qubits</p>
                  <p className="font-medium mt-1">{selectedJob.qubits}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Shots</p>
                  <p className="font-medium mt-1">{selectedJob.shots}</p>
                </div>
                {selectedJob.estimatedCost !== undefined && (
                  <div>
                    <p className="text-muted-foreground">Cost</p>
                    <p className="font-medium mt-1">${selectedJob.estimatedCost.toFixed(2)}</p>
                  </div>
                )}
                <div>
                  <p className="text-muted-foreground">Created</p>
                  <p className="font-medium mt-1">
                    {new Date(selectedJob.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              {selectedJob.circuitCode && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Circuit Code</p>
                    <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
                      <code>{selectedJob.circuitCode}</code>
                    </pre>
                  </div>
                </>
              )}

              {selectedJob.results && (
                <>
                  <Separator />
                  {renderJobResults(selectedJob)}
                </>
              )}

              {selectedJob.error && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-destructive">Error</p>
                    <p className="text-sm bg-destructive/10 p-4 rounded-lg">{selectedJob.error}</p>
                  </div>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Save Circuit Dialog */}
      <Dialog open={showCircuitDialog} onOpenChange={setShowCircuitDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Circuit</DialogTitle>
            <DialogDescription>Save this circuit for future use</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Circuit Name</Label>
              <Input
                placeholder="e.g., My Bell State"
                value={newCircuitName}
                onChange={(e) => setNewCircuitName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Description (Optional)</Label>
              <Textarea
                placeholder="Describe what this circuit does..."
                value={newCircuitDescription}
                onChange={(e) => setNewCircuitDescription(e.target.value)}
              />
            </div>
            <Button
              onClick={handleSaveCircuit}
              disabled={!newCircuitName || createCircuitMutation.isPending}
              className="w-full"
            >
              {createCircuitMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save Circuit
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
