'use client';

/**
 * CodePreview Component
 *
 * Displays code results from AI models with syntax highlighting.
 * Adapted from components/tutorial/CodeSnippet.tsx for preview use.
 *
 * Features:
 * - Syntax highlighting using react-syntax-highlighter
 * - Language detection and badge display
 * - Line numbers
 * - Copy to clipboard
 * - Dark theme compatible
 *
 * Related: Issue #546 - Add example prompts to model playground pages
 */

import React, { useState, useMemo } from 'react';
import { Copy, Check, Code2, FileCode } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { CodeResult, detectLanguage } from '../../types.preview';

interface CodePreviewProps {
  result: CodeResult;
  onCopy?: () => void;
}

/**
 * CodePreview Component
 *
 * Displays syntax-highlighted code with copy functionality.
 * Uses react-syntax-highlighter with Prism for highlighting.
 */
export function CodePreview({ result, onCopy }: CodePreviewProps) {
  const [copied, setCopied] = useState(false);

  /**
   * Detect or use provided language
   */
  const language = useMemo(() => {
    if (result.language) return result.language;
    return detectLanguage(result.output);
  }, [result.language, result.output]);

  /**
   * Format language name for display
   */
  const getLanguageLabel = (lang: string): string => {
    const labels: Record<string, string> = {
      javascript: 'JavaScript',
      typescript: 'TypeScript',
      jsx: 'React JSX',
      tsx: 'React TSX',
      python: 'Python',
      java: 'Java',
      go: 'Go',
      rust: 'Rust',
      sql: 'SQL',
      bash: 'Bash',
      shell: 'Shell',
      json: 'JSON',
      css: 'CSS',
      html: 'HTML',
      markup: 'HTML',
      c: 'C',
      cpp: 'C++',
      csharp: 'C#',
      php: 'PHP',
      ruby: 'Ruby',
      swift: 'Swift',
      kotlin: 'Kotlin',
      r: 'R',
      matlab: 'MATLAB',
      scala: 'Scala',
      perl: 'Perl',
      dart: 'Dart',
      yaml: 'YAML',
      xml: 'XML',
      markdown: 'Markdown',
      text: 'Text',
    };
    return labels[lang.toLowerCase()] || lang.toUpperCase();
  };

  /**
   * Copy code to clipboard
   */
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(result.output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      onCopy?.();
    } catch (error) {
      console.error('Failed to copy code:', error);
    }
  };

  const isEmpty = !result.output || result.output.trim().length === 0;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between bg-white/[0.02] border border-white/10 rounded-t-lg px-4 py-3">
        <div className="flex items-center gap-3">
          <Code2 className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-300">Code Output</span>

          {/* Language badge */}
          <span className="px-2 py-0.5 bg-primary/20 text-primary border border-primary/30 rounded text-xs font-medium">
            {getLanguageLabel(language)}
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Copy button */}
          <button
            onClick={handleCopy}
            disabled={isEmpty}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 hover:border-white/20 rounded-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label={copied ? 'Copied' : 'Copy code'}
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
        <div className="flex items-center gap-4 text-xs text-gray-500 px-4">
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

      {/* Code content */}
      <div className="bg-white/[0.02] border border-white/10 rounded-b-lg overflow-hidden">
        {isEmpty ? (
          <div className="p-6 text-center text-gray-500 text-sm">
            No code generated
          </div>
        ) : result.highlighted_html ? (
          // Use pre-rendered HTML if provided by API
          <div
            className="code-preview-html overflow-x-auto"
            dangerouslySetInnerHTML={{ __html: result.highlighted_html }}
          />
        ) : (
          // Use react-syntax-highlighter for client-side rendering
          <div className="code-preview-wrapper overflow-x-auto max-h-[600px]">
            <SyntaxHighlighter
              language={language}
              style={tomorrow}
              showLineNumbers={true}
              wrapLines={false}
              customStyle={{
                margin: 0,
                padding: '1rem',
                background: '#2d2d2d',
                fontSize: '0.875rem',
                lineHeight: '1.6',
              }}
              codeTagProps={{
                style: {
                  fontFamily: "'Fira Code', 'Consolas', 'Monaco', monospace",
                },
              }}
              lineNumberStyle={{
                minWidth: '3em',
                paddingRight: '1em',
                color: '#666',
                userSelect: 'none',
              }}
            >
              {result.output}
            </SyntaxHighlighter>
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
        .code-preview-wrapper {
          border-radius: 0 0 0.5rem 0.5rem;
        }

        .code-preview-html {
          padding: 1rem;
          background: #2d2d2d;
          font-size: 0.875rem;
          line-height: 1.6;
        }

        .code-preview-html pre {
          margin: 0;
          background: transparent !important;
        }

        .code-preview-html code {
          font-family: 'Fira Code', 'Consolas', 'Monaco', monospace;
        }

        /* Custom scrollbar for code blocks */
        .code-preview-wrapper::-webkit-scrollbar,
        .code-preview-html::-webkit-scrollbar {
          height: 8px;
          width: 8px;
        }

        .code-preview-wrapper::-webkit-scrollbar-track,
        .code-preview-html::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.2);
        }

        .code-preview-wrapper::-webkit-scrollbar-thumb,
        .code-preview-html::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 4px;
        }

        .code-preview-wrapper::-webkit-scrollbar-thumb:hover,
        .code-preview-html::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      `}</style>
    </div>
  );
}

export default CodePreview;
