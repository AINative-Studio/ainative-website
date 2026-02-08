'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Check, ChevronDown, ChevronUp, Info, CheckCircle2 } from 'lucide-react';
import { EmbeddingResult } from '../../types.preview';
import { PreviewContainer } from './PreviewContainer';

/**
 * EmbeddingPreview Component
 *
 * Displays vector embeddings with:
 * - Vector dimensions display
 * - Preview of first 10 values
 * - Expandable full JSON view
 * - Copy full embeddings button
 * - Normalization indicator
 * - Multiple vectors support
 *
 * Efficiently handles large vectors (1000+ dimensions).
 *
 * Usage:
 * <EmbeddingPreview result={embeddingResult} />
 *
 * Refs: Issue #546
 */

interface EmbeddingPreviewProps {
  result: EmbeddingResult;
}

const PREVIEW_LENGTH = 10;

export function EmbeddingPreview({ result }: EmbeddingPreviewProps) {
  const [expandedVectors, setExpandedVectors] = useState<Set<number>>(new Set());
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  /**
   * Toggle expanded state for a specific vector
   */
  const toggleExpanded = (index: number) => {
    setExpandedVectors((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  /**
   * Copy a single vector to clipboard
   */
  const handleCopyVector = (vector: number[], index: number) => {
    const jsonString = JSON.stringify(vector, null, 2);
    navigator.clipboard.writeText(jsonString);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  /**
   * Copy all embeddings to clipboard
   */
  const handleCopyAll = () => {
    const jsonString = JSON.stringify(
      {
        embeddings: result.embeddings,
        dimensions: result.dimensions,
        normalized: result.normalized,
        input_texts: result.input_texts,
      },
      null,
      2
    );
    navigator.clipboard.writeText(jsonString);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  /**
   * Format number with appropriate precision
   */
  const formatValue = (value: number): string => {
    return value.toFixed(6);
  };

  /**
   * Get color for value based on magnitude
   */
  const getValueColor = (value: number): string => {
    const abs = Math.abs(value);
    if (abs > 0.5) return 'text-green-400';
    if (abs > 0.3) return 'text-blue-400';
    if (abs > 0.1) return 'text-gray-300';
    return 'text-gray-500';
  };

  return (
    <PreviewContainer
      result={result}
      customActions={
        <button
          onClick={handleCopyAll}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-white/5 hover:bg-white/10 transition-colors group text-xs"
          aria-label="Copy all embeddings"
        >
          {copiedAll ? (
            <>
              <Check className="w-3.5 h-3.5 text-green-400" />
              <span className="text-green-400">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-gray-400 group-hover:text-white transition-colors" />
              <span className="text-gray-400 group-hover:text-white transition-colors">
                Copy JSON
              </span>
            </>
          )}
        </button>
      }
    >
      {/* Summary Header */}
      <div className="mb-5 p-4 bg-white/[0.02] border border-white/10 rounded-lg space-y-3">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-white">Vector Embeddings</h3>
              <span className="px-2 py-0.5 bg-primary/20 text-primary text-xs rounded-full">
                {result.embeddings.length} {result.embeddings.length === 1 ? 'vector' : 'vectors'}
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs text-gray-400">
              <span>Dimensions: {result.dimensions}</span>
              {result.normalized !== undefined && (
                <div className="flex items-center gap-1.5">
                  {result.normalized ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                      <span className="text-green-400">Normalized</span>
                    </>
                  ) : (
                    <>
                      <Info className="w-3.5 h-3.5 text-gray-400" />
                      <span>Not normalized</span>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Normalization Info */}
        {result.normalized && (
          <div className="flex items-start gap-2 p-2.5 bg-green-500/10 border border-green-500/20 rounded-md">
            <Info className="w-3.5 h-3.5 text-green-400 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-green-300">
              Vectors are normalized to unit length (L2 norm = 1), suitable for cosine similarity.
            </p>
          </div>
        )}
      </div>

      {/* Vectors */}
      <div className="space-y-4">
        {result.embeddings.map((vector, index) => {
          const isExpanded = expandedVectors.has(index);
          const previewValues = vector.slice(0, PREVIEW_LENGTH);
          const isCopied = copiedIndex === index;

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
              className="bg-white/[0.02] border border-white/10 rounded-lg overflow-hidden"
            >
              {/* Vector Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-white/[0.02]">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-white">
                      Vector {index + 1}
                    </span>
                    <span className="px-2 py-0.5 bg-white/5 text-gray-400 text-xs rounded">
                      {vector.length}D
                    </span>
                  </div>
                  {result.input_texts[index] && (
                    <p className="text-xs text-gray-400 line-clamp-1">
                      "{result.input_texts[index]}"
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {/* Copy Button */}
                  <button
                    onClick={() => handleCopyVector(vector, index)}
                    className="p-1.5 rounded-md bg-white/5 hover:bg-white/10 transition-colors group"
                    aria-label={`Copy vector ${index + 1}`}
                  >
                    {isCopied ? (
                      <Check className="w-3.5 h-3.5 text-green-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-gray-400 group-hover:text-white transition-colors" />
                    )}
                  </button>

                  {/* Expand/Collapse Button */}
                  <button
                    onClick={() => toggleExpanded(index)}
                    className="p-1.5 rounded-md bg-white/5 hover:bg-white/10 transition-colors group"
                    aria-label={isExpanded ? 'Show less' : 'Show more'}
                  >
                    {isExpanded ? (
                      <ChevronUp className="w-3.5 h-3.5 text-gray-400 group-hover:text-white transition-colors" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5 text-gray-400 group-hover:text-white transition-colors" />
                    )}
                  </button>
                </div>
              </div>

              {/* Vector Values */}
              <div className="p-4">
                {/* Preview (First 10 values) */}
                {!isExpanded && (
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-2">
                      {previewValues.map((value, i) => (
                        <span
                          key={i}
                          className={`px-2 py-1 bg-white/5 rounded text-xs font-mono ${getValueColor(
                            value
                          )}`}
                          title={`Index ${i}: ${value}`}
                        >
                          {formatValue(value)}
                        </span>
                      ))}
                      {vector.length > PREVIEW_LENGTH && (
                        <span className="px-2 py-1 bg-white/5 rounded text-xs text-gray-500">
                          ... +{vector.length - PREVIEW_LENGTH} more
                        </span>
                      )}
                    </div>
                    {vector.length > PREVIEW_LENGTH && (
                      <button
                        onClick={() => toggleExpanded(index)}
                        className="text-xs text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
                      >
                        Show all {vector.length} values
                        <ChevronDown className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                )}

                {/* Full Vector (Expanded) */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="bg-black/20 rounded-lg p-4 max-h-96 overflow-y-auto">
                        <pre className="text-xs font-mono text-gray-300">
                          <code>
                            {JSON.stringify(vector, null, 2)}
                          </code>
                        </pre>
                      </div>
                      <button
                        onClick={() => toggleExpanded(index)}
                        className="mt-3 text-xs text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
                      >
                        Show less
                        <ChevronUp className="w-3 h-3" />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Usage Tips */}
      <div className="mt-5 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
        <div className="flex items-start gap-2">
          <Info className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
          <div className="space-y-1">
            <p className="text-xs font-medium text-blue-300">Usage Tips</p>
            <ul className="text-xs text-blue-300/80 space-y-1 list-disc list-inside">
              <li>Use these vectors for semantic search and similarity matching</li>
              <li>Store vectors in a vector database like Pinecone or Weaviate</li>
              <li>Calculate cosine similarity between vectors for semantic comparison</li>
            </ul>
          </div>
        </div>
      </div>
    </PreviewContainer>
  );
}
