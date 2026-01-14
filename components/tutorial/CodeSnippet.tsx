'use client';

/**
 * CodeSnippet Component
 * Displays code with syntax highlighting and copy functionality
 * Syncs with video timestamps for line-by-line highlighting
 */

import React, { useState, useEffect, useRef } from 'react';
import { CodeSnippet as CodeSnippetType } from '@/types/tutorial';
import { Copy, Check, Code2 } from 'lucide-react';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';

// Import language support
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-go';
import 'prismjs/components/prism-rust';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-markup';

interface CodeSnippetProps {
  snippet: CodeSnippetType;
  currentTime: number;
  onTimestampClick?: (time: number) => void;
  className?: string;
}

export function CodeSnippet({
  snippet,
  currentTime,
  onTimestampClick,
  className = '',
}: CodeSnippetProps) {
  const [copied, setCopied] = useState(false);
  const codeRef = useRef<HTMLElement>(null);

  /**
   * Highlight code on mount and when language changes
   */
  useEffect(() => {
    if (codeRef.current) {
      Prism.highlightElement(codeRef.current);
    }
  }, [snippet.code, snippet.language]);

  /**
   * Copy code to clipboard
   */
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(snippet.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy code:', error);
    }
  };

  /**
   * Check if snippet is active based on timestamp
   */
  const isActive = (): boolean => {
    if (snippet.endTime) {
      return currentTime >= snippet.startTime && currentTime <= snippet.endTime;
    }
    return currentTime >= snippet.startTime;
  };

  /**
   * Get line numbers to highlight based on current time
   */
  const getHighlightedLines = (): number[] => {
    if (!isActive() || !snippet.highlightedLines) {
      return [];
    }
    return snippet.highlightedLines;
  };

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
      json: 'JSON',
      css: 'CSS',
      markup: 'HTML',
    };
    return labels[lang] || lang.toUpperCase();
  };

  /**
   * Split code into lines for highlighting
   */
  const renderCodeLines = () => {
    const lines = snippet.code.split('\n');
    const highlightedLines = getHighlightedLines();

    return lines.map((line, index) => {
      const lineNumber = index + 1;
      const isHighlighted = highlightedLines.includes(lineNumber);

      return (
        <div
          key={lineNumber}
          className={`code-line ${isHighlighted ? 'highlighted' : ''}`}
          data-line={lineNumber}
        >
          <span className="line-number">{lineNumber}</span>
          <span className="line-content">{line}</span>
        </div>
      );
    });
  };

  const active = isActive();

  return (
    <div className={`code-snippet ${active ? 'active' : ''} ${className}`}>
      <div className="code-snippet__header">
        <div className="code-snippet__info">
          <Code2 size={16} />
          {snippet.title && <h4 className="code-snippet__title">{snippet.title}</h4>}
          <span className="code-snippet__language">{getLanguageLabel(snippet.language)}</span>
        </div>

        <div className="code-snippet__actions">
          {onTimestampClick && (
            <button
              className="code-snippet__timestamp-btn"
              onClick={() => onTimestampClick(snippet.startTime)}
              title="Jump to timestamp"
            >
              {formatTime(snippet.startTime)}
            </button>
          )}
          <button
            className="code-snippet__copy-btn"
            onClick={handleCopy}
            aria-label={copied ? 'Copied' : 'Copy code'}
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            <span>{copied ? 'Copied!' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {snippet.description && (
        <div className="code-snippet__description">{snippet.description}</div>
      )}

      <div className="code-snippet__content">
        <pre className="code-snippet__pre">
          <code
            ref={codeRef}
            className={`language-${snippet.language}`}
          >
            {snippet.code}
          </code>
        </pre>
      </div>

      <style jsx>{`
        .code-snippet {
          border-radius: 8px;
          border: 1px solid var(--border);
          background: var(--card);
          overflow: hidden;
          margin-bottom: 1rem;
          transition: all 0.3s ease;
        }

        .code-snippet.active {
          border-color: var(--primary);
          box-shadow: 0 0 0 2px rgba(var(--primary-rgb), 0.1);
        }

        .code-snippet__header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem 1rem;
          background: var(--muted);
          border-bottom: 1px solid var(--border);
        }

        .code-snippet__info {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--foreground);
        }

        .code-snippet__title {
          font-size: 0.875rem;
          font-weight: 600;
          margin: 0;
        }

        .code-snippet__language {
          font-size: 0.75rem;
          padding: 0.125rem 0.5rem;
          background: var(--primary);
          color: white;
          border-radius: 4px;
          font-weight: 500;
        }

        .code-snippet__actions {
          display: flex;
          gap: 0.5rem;
        }

        .code-snippet__timestamp-btn,
        .code-snippet__copy-btn {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          padding: 0.375rem 0.75rem;
          font-size: 0.8125rem;
          border: 1px solid var(--border);
          background: var(--background);
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .code-snippet__timestamp-btn:hover,
        .code-snippet__copy-btn:hover {
          background: var(--accent);
          border-color: var(--primary);
        }

        .code-snippet__timestamp-btn {
          font-family: monospace;
          color: var(--muted-foreground);
        }

        .code-snippet__description {
          padding: 0.75rem 1rem;
          font-size: 0.875rem;
          color: var(--muted-foreground);
          background: var(--accent);
          border-bottom: 1px solid var(--border);
        }

        .code-snippet__content {
          overflow-x: auto;
          max-height: 500px;
          overflow-y: auto;
        }

        .code-snippet__pre {
          margin: 0;
          padding: 1rem;
          background: #2d2d2d !important;
          font-size: 0.875rem;
          line-height: 1.6;
        }

        .code-snippet__pre code {
          background: transparent !important;
          color: #ccc;
          font-family: 'Fira Code', 'Consolas', monospace;
        }

        .code-line {
          display: flex;
          padding: 0 0.5rem;
          transition: background 0.2s ease;
        }

        .code-line.highlighted {
          background: rgba(255, 255, 0, 0.1);
          border-left: 3px solid var(--primary);
          padding-left: calc(0.5rem - 3px);
        }

        .line-number {
          display: inline-block;
          width: 3rem;
          text-align: right;
          margin-right: 1rem;
          color: #666;
          user-select: none;
        }

        .line-content {
          flex: 1;
        }

        @media (max-width: 768px) {
          .code-snippet__header {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
          }

          .code-snippet__actions {
            width: 100%;
            justify-content: flex-end;
          }

          .line-number {
            width: 2rem;
            margin-right: 0.5rem;
          }
        }
      `}</style>
    </div>
  );
}

/**
 * Format time to MM:SS
 */
function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

export default CodeSnippet;
