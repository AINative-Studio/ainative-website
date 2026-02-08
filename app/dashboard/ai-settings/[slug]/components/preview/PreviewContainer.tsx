'use client';

import { motion } from 'framer-motion';
import { Download, Copy, Check } from 'lucide-react';
import { PreviewContainerProps } from '../../types.preview';
import { useState } from 'react';

/**
 * PreviewContainer Component
 *
 * Base wrapper for all preview components. Provides:
 * - Consistent border and background styling
 * - Metadata display (latency, tokens, cost)
 * - Optional download/copy actions
 * - Smooth animations
 *
 * Usage:
 * <PreviewContainer result={result} showDownload onDownload={...}>
 *   <YourPreviewContent />
 * </PreviewContainer>
 *
 * Refs: Issue #546
 */
export function PreviewContainer({
  result,
  children,
  showDownload = false,
  showCopy = false,
  onDownload,
  customActions,
}: PreviewContainerProps) {
  const [copied, setCopied] = useState(false);

  /**
   * Handle copy action with visual feedback
   */
  const handleCopy = () => {
    if (showCopy) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white/[0.02] border border-white/10 rounded-xl overflow-hidden"
    >
      {/* Metadata Header */}
      {(result.latency_ms !== undefined ||
        result.tokens_used !== undefined ||
        result.cost_credits !== undefined) && (
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-4 text-xs text-gray-500">
            {result.latency_ms !== undefined && (
              <span>Latency: {result.latency_ms}ms</span>
            )}
            {result.tokens_used !== undefined && (
              <span>Tokens: {result.tokens_used}</span>
            )}
            {result.cost_credits !== undefined && (
              <span>Cost: {result.cost_credits} credits</span>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {customActions}
            {showDownload && onDownload && (
              <button
                onClick={onDownload}
                className="p-1.5 rounded-md bg-white/5 hover:bg-white/10 transition-colors group"
                aria-label="Download result"
              >
                <Download className="w-3.5 h-3.5 text-gray-400 group-hover:text-white transition-colors" />
              </button>
            )}
            {showCopy && (
              <button
                onClick={handleCopy}
                className="p-1.5 rounded-md bg-white/5 hover:bg-white/10 transition-colors group"
                aria-label="Copy to clipboard"
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-green-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-gray-400 group-hover:text-white transition-colors" />
                )}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-5">{children}</div>
    </motion.div>
  );
}
