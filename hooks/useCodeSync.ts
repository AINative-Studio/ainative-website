/**
 * useCodeSync Hook
 * Synchronize code snippet display with video playback
 * Features: Show/hide code at timestamps, highlight lines, track active snippets
 */

import { useState, useEffect, useCallback } from 'react';
import { CodeSnippet } from '@/types/tutorial';

interface UseCodeSyncOptions {
  codeSnippets: CodeSnippet[];
  currentTime: number;
  enabled?: boolean;
}

interface UseCodeSyncReturn {
  activeSnippets: CodeSnippet[];
  getSnippetsByChapter: (chapterId: string) => CodeSnippet[];
  isSnippetActive: (snippetId: string) => boolean;
  getHighlightedLines: (snippetId: string) => number[];
  getSnippetProgress: (snippet: CodeSnippet) => number;
}

/**
 * Hook to synchronize code snippets with video playback
 */
export function useCodeSync({
  codeSnippets,
  currentTime,
  enabled = true,
}: UseCodeSyncOptions): UseCodeSyncReturn {
  const [activeSnippets, setActiveSnippets] = useState<CodeSnippet[]>([]);

  /**
   * Update active snippets based on current time
   */
  useEffect(() => {
    if (!enabled) {
      setActiveSnippets([]);
      return;
    }

    const active = codeSnippets.filter((snippet) => {
      // Snippet has start and end time
      if (snippet.endTime !== undefined) {
        return currentTime >= snippet.startTime && currentTime <= snippet.endTime;
      }
      // Snippet only has start time (visible from start onwards)
      return currentTime >= snippet.startTime;
    });

    setActiveSnippets(active);
  // Intentionally updating state based on time/snippet changes
   
  }, [currentTime, codeSnippets, enabled]);

  /**
   * Get all code snippets for a specific chapter
   */
  const getSnippetsByChapter = useCallback(
    (chapterId: string): CodeSnippet[] => {
      return codeSnippets.filter((snippet) => snippet.chapterId === chapterId);
    },
    [codeSnippets]
  );

  /**
   * Check if a specific snippet is currently active
   */
  const isSnippetActive = useCallback(
    (snippetId: string): boolean => {
      return activeSnippets.some((snippet) => snippet.id === snippetId);
    },
    [activeSnippets]
  );

  /**
   * Get highlighted lines for a snippet based on current time
   * This can be extended to support time-based line highlighting
   */
  const getHighlightedLines = useCallback(
    (snippetId: string): number[] => {
      const snippet = codeSnippets.find((s) => s.id === snippetId);
      if (!snippet || !isSnippetActive(snippetId)) {
        return [];
      }
      return snippet.highlightedLines || [];
    },
    [codeSnippets, isSnippetActive]
  );

  /**
   * Get progress through a snippet (0-100%)
   * Useful for animated line-by-line highlighting
   */
  const getSnippetProgress = useCallback(
    (snippet: CodeSnippet): number => {
      if (!snippet.endTime) {
        // No end time, so progress is binary (0 or 100)
        return currentTime >= snippet.startTime ? 100 : 0;
      }

      if (currentTime < snippet.startTime) {
        return 0;
      }

      if (currentTime > snippet.endTime) {
        return 100;
      }

      const duration = snippet.endTime - snippet.startTime;
      const elapsed = currentTime - snippet.startTime;
      return (elapsed / duration) * 100;
    },
    [currentTime]
  );

  return {
    activeSnippets,
    getSnippetsByChapter,
    isSnippetActive,
    getHighlightedLines,
    getSnippetProgress,
  };
}
