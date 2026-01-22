'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import EvaluationDashboard from '@/components/qnn/EvaluationDashboard';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function EvaluationClient() {
  return (
    <div className="space-y-6 p-6">
      {/* Header with back navigation */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        className="flex items-center gap-4"
      >
        <Link href="/dashboard/qnn">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Model Evaluation</h1>
          <p className="text-muted-foreground text-sm">
            Evaluate trained models with comprehensive performance metrics
          </p>
        </div>
      </motion.div>

      {/* Main Evaluation Dashboard */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeUp}
      >
        <EvaluationDashboard />
      </motion.div>
    </div>
  );
}
