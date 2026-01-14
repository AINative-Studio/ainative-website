'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, Zap } from 'lucide-react';

interface ExecutionTimerProps {
  status: 'analyzing' | 'building' | 'completed' | 'failed' | 'paused';
  startedAt?: Date;
  estimatedDurationSeconds?: number;
  onComplete?: () => void;
}

export default function ExecutionTimer({
  status,
  startedAt,
  estimatedDurationSeconds = 300,
  onComplete,
}: ExecutionTimerProps) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());

  const isRunning = status === 'building' || status === 'analyzing';
  const remainingSeconds = Math.max(0, estimatedDurationSeconds - elapsedSeconds);
  const progressPercentage = Math.min(100, (elapsedSeconds / estimatedDurationSeconds) * 100);

  const formatTime = (totalSeconds: number): string => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatCompletionTime = (): string => {
    if (!startedAt) return '--:--';

    const completionDate = new Date(startedAt.getTime() + estimatedDurationSeconds * 1000);
    const hours = completionDate.getHours();
    const minutes = completionDate.getMinutes();
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (!isRunning || !startedAt) {
      return;
    }

    const initialElapsed = Math.floor((Date.now() - startedAt.getTime()) / 1000);
    setElapsedSeconds(initialElapsed);

    const intervalId = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startedAt.getTime()) / 1000);
      setElapsedSeconds(elapsed);
      setCurrentTime(new Date());

      if (elapsed >= estimatedDurationSeconds && onComplete) {
        onComplete();
      }
    }, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, [isRunning, startedAt, estimatedDurationSeconds, onComplete]);

  if (!isRunning || !startedAt) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="bg-[#161B22] border border-gray-800 rounded-lg p-4 mb-4"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue-400" />
          <span className="text-sm font-semibold text-gray-200">Build Execution Timer</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <Zap className="w-3 h-3" />
          <span>ETA: {formatCompletionTime()}</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <div className="text-xs text-gray-400 mb-1">Elapsed</div>
          <div className="text-lg font-mono font-bold text-green-400">
            {formatTime(elapsedSeconds)}
          </div>
        </div>

        <div className="text-center">
          <div className="text-xs text-gray-400 mb-1">Remaining</div>
          <div className="text-lg font-mono font-bold text-yellow-400">
            {formatTime(remainingSeconds)}
          </div>
        </div>

        <div className="text-center">
          <div className="text-xs text-gray-400 mb-1">Progress</div>
          <div className="text-lg font-mono font-bold text-blue-400">
            {Math.round(progressPercentage)}%
          </div>
        </div>
      </div>

      <div className="relative">
        <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-500 via-blue-400 to-green-400"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{
              duration: 0.5,
              ease: 'easeInOut',
            }}
          />
        </div>

        <div className="flex items-center justify-between mt-1">
          <span className="text-xs text-gray-500">Start</span>
          <span className="text-xs text-gray-500">
            {progressPercentage >= 100 ? 'Completed' : 'In Progress'}
          </span>
          <span className="text-xs text-gray-500">End</span>
        </div>
      </div>

      {elapsedSeconds > estimatedDurationSeconds && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-3 p-2 bg-yellow-900/20 border border-yellow-800/30 rounded text-xs text-yellow-400"
        >
          Build is taking longer than expected. This is normal for complex projects.
        </motion.div>
      )}
    </motion.div>
  );
}
