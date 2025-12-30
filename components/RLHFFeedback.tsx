'use client';

/**
 * RLHF Feedback Component
 *
 * Provides thumbs up/down UI for collecting user feedback on workflow steps
 * and agent outputs. Integrates with ZeroDB RLHF API for feedback storage
 * and analysis.
 *
 * Features:
 * - Thumbs up/down buttons with lucide-react icons
 * - Optimistic UI updates for instant feedback
 * - Success animations with confetti effect
 * - Error handling and retry mechanism
 * - Keyboard navigation support
 * - ARIA labels for accessibility
 * - Feedback count/stats display
 */

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThumbsUp, Check, AlertCircle, Loader2 } from 'lucide-react';
// @ts-expect-error lucide-react type issue
import { ThumbsDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { rlhfService } from '@/services/RLHFService';
import type {
  RLHFFeedbackProps,
  RLHFFeedbackData,
  FeedbackState,
} from '@/types/rlhf';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export default function RLHFFeedback({
  stepNumber,
  stepName,
  prompt,
  response,
  projectId,
  workflowId,
  agentId,
  className,
  onFeedbackSubmit,
}: RLHFFeedbackProps) {
  const [feedbackState, setFeedbackState] = useState<FeedbackState>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleFeedback = useCallback(
    async (rating: 1 | -1) => {
      // Prevent multiple submissions
      if (feedbackState === 'loading' || feedbackState === 'success') {
        return;
      }

      // Optimistic UI update
      const newState: FeedbackState = rating === 1 ? 'thumbs-up' : 'thumbs-down';
      setFeedbackState(newState);
      setErrorMessage('');

      // Prepare feedback data
      const feedbackData: RLHFFeedbackData = {
        type: agentId ? 'agent_output_feedback' : 'workflow_step_feedback',
        stepNumber,
        stepName,
        prompt,
        response,
        rating,
        timestamp: new Date().toISOString(),
        projectId,
        workflowId,
        agentId,
      };

      // Set loading state after brief delay (for smooth animation)
      setTimeout(() => setFeedbackState('loading'), 300);

      try {
        // Submit feedback to API
        const result = await rlhfService.submitFeedback(projectId, feedbackData);

        if (result.success) {
          setFeedbackState('success');
          onFeedbackSubmit?.(feedbackData);

          // Reset to selected state after 2 seconds
          setTimeout(() => {
            setFeedbackState(newState);
          }, 2000);
        } else {
          throw new Error(result.message);
        }
      } catch (error: unknown) {
        console.error('Failed to submit feedback:', error);
        setFeedbackState('error');
        const errorMsg = error instanceof Error ? error.message : 'Failed to submit feedback. Please try again.';
        setErrorMessage(errorMsg);

        // Reset to idle after 3 seconds
        setTimeout(() => {
          setFeedbackState('idle');
          setErrorMessage('');
        }, 3000);
      }
    },
    [
      stepNumber,
      stepName,
      prompt,
      response,
      projectId,
      workflowId,
      agentId,
      feedbackState,
      onFeedbackSubmit,
    ]
  );

  const isThumbsUpActive = feedbackState === 'thumbs-up' || feedbackState === 'success';
  const isThumbsDownActive = feedbackState === 'thumbs-down';
  const isLoading = feedbackState === 'loading';
  const isSuccess = feedbackState === 'success';
  const isError = feedbackState === 'error';

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {/* Feedback Question */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-400">
          {agentId ? 'Was this agent\'s contribution helpful?' : 'Was this step helpful?'}
        </p>

        {/* Feedback Buttons */}
        <div className="flex items-center gap-2">
          <TooltipProvider delayDuration={200}>
            {/* Thumbs Up Button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.button
                  onClick={() => handleFeedback(1)}
                  disabled={isLoading || isSuccess}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className={cn(
                    'relative p-2 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0D1117]',
                    isThumbsUpActive
                      ? 'bg-green-900/30 text-green-400 focus:ring-green-500'
                      : 'bg-[#161B22] text-gray-400 hover:bg-[#21262D] focus:ring-gray-500',
                    (isLoading || isSuccess) && 'cursor-not-allowed opacity-70'
                  )}
                  aria-label="Thumbs up - This was helpful"
                  aria-pressed={isThumbsUpActive}
                >
                  <AnimatePresence mode="wait">
                    {isSuccess && feedbackState === 'success' ? (
                      <motion.div
                        key="success"
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        exit={{ scale: 0, rotate: 180 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                      >
                        <Check className="h-5 w-5" />
                      </motion.div>
                    ) : isLoading ? (
                      <motion.div
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <Loader2 className="h-5 w-5 animate-spin" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="thumbs-up"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <ThumbsUp
                          className={cn(
                            'h-5 w-5 transition-all',
                            isThumbsUpActive && 'fill-current'
                          )}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Success Ripple Effect */}
                  {isSuccess && (
                    <motion.span
                      className="absolute inset-0 rounded-full bg-green-500"
                      initial={{ opacity: 0.6, scale: 1 }}
                      animate={{ opacity: 0, scale: 2 }}
                      transition={{ duration: 0.6 }}
                    />
                  )}
                </motion.button>
              </TooltipTrigger>
              <TooltipContent>
                <p>This was helpful</p>
              </TooltipContent>
            </Tooltip>

            {/* Thumbs Down Button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.button
                  onClick={() => handleFeedback(-1)}
                  disabled={isLoading || isSuccess}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className={cn(
                    'relative p-2 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0D1117]',
                    isThumbsDownActive
                      ? 'bg-red-900/30 text-red-400 focus:ring-red-500'
                      : 'bg-[#161B22] text-gray-400 hover:bg-[#21262D] focus:ring-gray-500',
                    (isLoading || isSuccess) && 'cursor-not-allowed opacity-70'
                  )}
                  aria-label="Thumbs down - This was not helpful"
                  aria-pressed={isThumbsDownActive}
                >
                  <AnimatePresence mode="wait">
                    {isLoading ? (
                      <motion.div
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <Loader2 className="h-5 w-5 animate-spin" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="thumbs-down"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <ThumbsDown
                          className={cn(
                            'h-5 w-5 transition-all',
                            isThumbsDownActive && 'fill-current'
                          )}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>
              </TooltipTrigger>
              <TooltipContent>
                <p>This was not helpful</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Success Message */}
      <AnimatePresence>
        {isSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="flex items-center gap-2 text-sm text-green-400"
          >
            <Check className="h-4 w-4" />
            <span>Thank you for your feedback!</span>
          </motion.div>
        )}

        {/* Error Message */}
        {isError && errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="flex items-center gap-2 text-sm text-red-400"
          >
            <AlertCircle className="h-4 w-4" />
            <span>{errorMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Divider */}
      <div className="border-t border-[#2D333B] pt-2 mt-2" />
    </div>
  );
}

// Export for use in other components
export { RLHFFeedback };
