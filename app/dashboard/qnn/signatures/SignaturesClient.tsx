'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Shield,
  ArrowLeft,
  Plus,
  RefreshCcw,
  FileSignature,
  ShieldCheck,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Trash2,
  Download,
  Copy,
  Eye
} from 'lucide-react';
import Link from 'next/link';
import QuantumSignatures from '@/components/qnn/QuantumSignatures';

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

interface Signature {
  id: string;
  modelId: string;
  modelName: string;
  signatureHash: string;
  signedAt: string;
  expiresAt: string;
  status: 'valid' | 'expired' | 'invalid';
  isVerified: boolean;
}

export default function SignaturesClient() {
  const [mounted, setMounted] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [signatures] = useState<Signature[]>([
    {
      id: 'sig-1',
      modelId: '1',
      modelName: 'Quantum Image Classifier',
      signatureHash: 'qsig_a3f8d9e2b1c4567890abcdef12345678',
      signedAt: '2025-01-15T10:30:00Z',
      expiresAt: '2025-07-15T10:30:00Z',
      status: 'valid',
      isVerified: true
    },
    {
      id: 'sig-2',
      modelId: '3',
      modelName: 'VQC Sentiment Model',
      signatureHash: 'qsig_b7e6c5d4a3f2100987654321fedcba98',
      signedAt: '2025-01-08T14:20:00Z',
      expiresAt: '2025-07-08T14:20:00Z',
      status: 'valid',
      isVerified: true
    },
    {
      id: 'sig-3',
      modelId: '4',
      modelName: 'Legacy Model v1',
      signatureHash: 'qsig_9f8e7d6c5b4a3210fedcba9876543210',
      signedAt: '2024-12-01T09:15:00Z',
      expiresAt: '2025-01-01T09:15:00Z',
      status: 'expired',
      isVerified: false
    }
  ]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  };

  const getStatusColor = (status: Signature['status']) => {
    switch (status) {
      case 'valid':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'expired':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'invalid':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusIcon = (status: Signature['status']) => {
    switch (status) {
      case 'valid':
        return <CheckCircle2 className="h-4 w-4 text-green-400" />;
      case 'expired':
        return <AlertTriangle className="h-4 w-4 text-orange-400" />;
      case 'invalid':
        return <AlertTriangle className="h-4 w-4 text-red-400" />;
      default:
        return <Shield className="h-4 w-4 text-gray-400" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const validSignatures = signatures.filter(s => s.status === 'valid');
  const expiredSignatures = signatures.filter(s => s.status === 'expired');
  const invalidSignatures = signatures.filter(s => s.status === 'invalid');

  return (
    <div className="space-y-8 p-8">
      {/* Header */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeUp}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/qnn">
              <Button variant="ghost" size="icon" className="rounded-full">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
                <Shield className="h-10 w-10 text-[#4B6FED]" />
                QNN Signatures
              </h1>
              <p className="text-muted-foreground">
                Manage quantum-resistant signatures for model authentication and integrity verification
              </p>
            </div>
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
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={stagger}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <motion.div variants={fadeUp}>
          <Card className="bg-surface-secondary border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Valid Signatures</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">{validSignatures.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Active and verified
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={fadeUp}>
          <Card className="bg-surface-secondary border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Expired Signatures</CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-400">{expiredSignatures.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Require renewal
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={fadeUp}>
          <Card className="bg-surface-secondary border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Models Signed</CardTitle>
              <Shield className="h-4 w-4 text-[#4B6FED]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{signatures.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                All time
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Signature Management Component */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeUp}
      >
        <QuantumSignatures />
      </motion.div>

      {/* Signatures List */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeUp}
      >
        <Card className="bg-surface-secondary border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileSignature className="h-5 w-5" />
                  Recent Signatures
                </CardTitle>
                <CardDescription>View and manage your model signatures</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {signatures.map((signature) => (
                <div
                  key={signature.id}
                  className="flex items-start justify-between p-4 bg-vite-bg rounded-lg border border-border hover:border-[#4B6FED]/30 transition-colors"
                >
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(signature.status)}
                      <p className="font-medium">{signature.modelName}</p>
                      <Badge className={getStatusColor(signature.status)}>
                        {signature.status}
                      </Badge>
                      {signature.isVerified && signature.status === 'valid' && (
                        <Badge className="bg-[#4B6FED]/20 text-[#4B6FED] border-[#4B6FED]/30">
                          <ShieldCheck className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Model ID: {signature.modelId}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Signed: {formatDate(signature.signedAt)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Expires: {formatDate(signature.expiresAt)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <code className="flex-1 p-2 bg-gray-900 text-green-400 rounded text-xs font-mono">
                        {signature.signatureHash}
                      </code>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => copyToClipboard(signature.signatureHash)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex gap-1 ml-4">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-300">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}

              {signatures.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">No signatures yet</p>
                  <p className="text-sm">Sign your first model to get started with quantum-resistant authentication</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Info Card */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeUp}
      >
        <Card className="bg-gradient-to-r from-[#4B6FED]/10 to-[#8A63F4]/10 border-[#4B6FED]/30">
          <CardContent className="flex items-center justify-between py-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-[#4B6FED]/20 rounded-lg">
                <Shield className="h-6 w-6 text-[#4B6FED]" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">About Quantum Signatures</h3>
                <p className="text-gray-400 text-sm">
                  Quantum-resistant cryptographic signatures ensure model integrity and authenticity using post-quantum algorithms
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Link href="/docs/qnn/signatures">
                <Button variant="outline" className="border-[#4B6FED] text-[#4B6FED]">
                  Learn More
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
