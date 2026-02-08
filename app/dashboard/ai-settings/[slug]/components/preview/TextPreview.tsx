'use client';

/**
 * TextPreview Component
 *
 * Displays plain text results from AI models with optional Markdown rendering.
 * Includes copy to clipboard functionality and preserves formatting.
 *
 * Related: Issue #546 - Add example prompts to model playground pages
 */

import React, { useState } from 'react';
import { Copy, Check, FileText, Type } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { TextResult } from '../../types.preview';

interface TextPreviewProps {
  result: TextResult;
  onCopy?: () => void;
}

/**
 * TextPreview Component
 *
 * Features:
 * - Plain text display with whitespace preservation
 * - Optional Markdown rendering (auto-detect)
 * - Copy to clipboard with success feedback
 * - Responsive design
 * - Dark mode compatible
 */
export function TextPreview({ result, onCopy }: TextPreviewProps) {
  const [copied, setCopied] = useState(false);
  const [renderMode, setRenderMode] = useState<'plain' | 'markdown'>('plain');

  /**
   * Copy text to clipboard
   */
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(result.output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      onCopy?.();
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  };

  /**
   * Check if text contains markdown syntax
   */
  const hasMarkdownSyntax = (text: string): boolean => {
    if (!text) return false;

    const markdownPatterns = [
      /^#+\s/m,                    // Headers
      /\*\*.*?\*\*/,                // Bold
      /\*.*?\*/,                    // Italic
      /\[.*?\]\(.*?\)/,             // Links
      /^[-*+]\s/m,                  // Lists
      /^>\s/m,                      // Blockquotes
      /```[\s\S]*?```/,             // Code blocks
      /`[^`]+`/,                    // Inline code
    ];

    return markdownPatterns.some(pattern => pattern.test(text));
  };

  const showMarkdownToggle = hasMarkdownSyntax(result.output);
  const isEmpty = !result.output || result.output.trim().length === 0;

  return (
    <div className="space-y-4">
      {/* Header with actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-300">Text Output</span>
          {result.streaming && (
            <span className="text-xs px-2 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded">
              Streaming
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Markdown toggle */}
          {showMarkdownToggle && (
            <div className="flex items-center border border-white/10 rounded-md overflow-hidden">
              <button
                onClick={() => setRenderMode('plain')}
                className={`px-3 py-1.5 text-xs transition-colors ${
                  renderMode === 'plain'
                    ? 'bg-white/10 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
                aria-label="Show plain text"
              >
                <Type className="w-3 h-3" />
              </button>
              <button
                onClick={() => setRenderMode('markdown')}
                className={`px-3 py-1.5 text-xs transition-colors ${
                  renderMode === 'markdown'
                    ? 'bg-white/10 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
                aria-label="Render as Markdown"
              >
                MD
              </button>
            </div>
          )}

          {/* Copy button */}
          <button
            onClick={handleCopy}
            disabled={isEmpty}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 hover:border-white/20 rounded-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label={copied ? 'Copied' : 'Copy text'}
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-green-400" />
                <span className="text-green-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Metadata */}
      {(result.latency_ms !== undefined || result.tokens_used !== undefined || result.cost_credits !== undefined) && (
        <div className="flex items-center gap-4 text-xs text-gray-500">
          {result.latency_ms !== undefined && (
            <span>Latency: {result.latency_ms}ms</span>
          )}
          {result.tokens_used !== undefined && (
            <span>Tokens: {result.tokens_used.toLocaleString()}</span>
          )}
          {result.cost_credits !== undefined && (
            <span>Cost: {result.cost_credits} credits</span>
          )}
        </div>
      )}

      {/* Content */}
      <div className="bg-white/[0.02] border border-white/10 rounded-lg overflow-hidden">
        {isEmpty ? (
          <div className="p-6 text-center text-gray-500 text-sm">
            No output generated
          </div>
        ) : renderMode === 'markdown' ? (
          <div className="p-5 prose prose-invert prose-sm max-w-none">
            <ReactMarkdown
              components={{
                // Style overrides for dark theme
                h1: ({ children }) => (
                  <h1 className="text-2xl font-bold text-white mb-4">{children}</h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-xl font-semibold text-white mb-3">{children}</h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-lg font-medium text-white mb-2">{children}</h3>
                ),
                p: ({ children }) => (
                  <p className="text-gray-300 mb-3 leading-relaxed">{children}</p>
                ),
                ul: ({ children }) => (
                  <ul className="list-disc list-inside text-gray-300 mb-3 space-y-1">{children}</ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal list-inside text-gray-300 mb-3 space-y-1">{children}</ol>
                ),
                li: ({ children }) => (
                  <li className="text-gray-300">{children}</li>
                ),
                code: ({ children, className }) => {
                  const isInline = !className;
                  return isInline ? (
                    <code className="px-1.5 py-0.5 bg-white/10 text-primary rounded text-sm font-mono">
                      {children}
                    </code>
                  ) : (
                    <code className={className}>{children}</code>
                  );
                },
                pre: ({ children }) => (
                  <pre className="bg-black/30 border border-white/10 rounded-lg p-4 overflow-x-auto mb-3">
                    {children}
                  </pre>
                ),
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-primary/50 pl-4 text-gray-400 italic mb-3">
                    {children}
                  </blockquote>
                ),
                a: ({ children, href }) => (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {children}
                  </a>
                ),
              }}
            >
              {result.output}
            </ReactMarkdown>
          </div>
        ) : (
          <div className="p-5">
            <pre className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap break-words font-sans">
              {result.output}
            </pre>
          </div>
        )}
      </div>

      {/* Error message */}
      {result.error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
          <p className="text-sm text-red-400">
            <span className="font-semibold">Error: </span>
            {result.error}
          </p>
        </div>
      )}

      <style jsx>{`
        .prose {
          max-width: none;
        }
      `}</style>
    </div>
  );
}

export default TextPreview;
