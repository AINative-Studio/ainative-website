'use client';

/**
 * ChapterNavigation Component
 * Sidebar with chapter list, timestamps, and progress indicators
 */

import React, { useEffect, useRef } from 'react';
import { Chapter } from '@/types/tutorial';
import { Check, Play, Clock } from 'lucide-react';

interface ChapterNavigationProps {
  chapters: Chapter[];
  currentChapter: string | null;
  completedChapters: string[];
  currentTime: number;
  onChapterClick: (chapter: Chapter) => void;
  className?: string;
}

export function ChapterNavigation({
  chapters,
  currentChapter,
  completedChapters,
  currentTime,
  onChapterClick,
  className = '',
}: ChapterNavigationProps) {
  const activeChapterRef = useRef<HTMLButtonElement>(null);

  /**
   * Scroll to active chapter
   */
  useEffect(() => {
    if (activeChapterRef.current) {
      activeChapterRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [currentChapter]);

  /**
   * Format time to MM:SS or HH:MM:SS
   */
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  /**
   * Calculate chapter duration
   */
  const getChapterDuration = (chapter: Chapter): string => {
    const duration = chapter.endTime - chapter.startTime;
    return formatTime(duration);
  };

  /**
   * Check if chapter is active
   */
  const isChapterActive = (chapter: Chapter): boolean => {
    return currentTime >= chapter.startTime && currentTime < chapter.endTime;
  };

  /**
   * Get chapter progress percentage
   */
  const getChapterProgress = (chapter: Chapter): number => {
    if (completedChapters.includes(chapter.id)) return 100;
    if (!isChapterActive(chapter)) return 0;

    const duration = chapter.endTime - chapter.startTime;
    const elapsed = currentTime - chapter.startTime;
    return Math.min((elapsed / duration) * 100, 100);
  };

  return (
    <div className={`chapter-navigation ${className}`}>
      <div className="chapter-navigation__header">
        <h3 className="chapter-navigation__title">Chapters</h3>
        <div className="chapter-navigation__progress">
          <span className="chapter-navigation__progress-text">
            {completedChapters.length} of {chapters.length} completed
          </span>
          <div className="chapter-navigation__progress-bar">
            <div
              className="chapter-navigation__progress-fill"
              style={{ width: `${(completedChapters.length / chapters.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className="chapter-navigation__list">
        {chapters.map((chapter, index) => {
          const isActive = chapter.id === currentChapter;
          const isCompleted = completedChapters.includes(chapter.id);
          const progress = getChapterProgress(chapter);

          return (
            <button
              key={chapter.id}
              ref={isActive ? activeChapterRef : null}
              className={`chapter-navigation__item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
              onClick={() => onChapterClick(chapter)}
              aria-label={`Chapter ${index + 1}: ${chapter.title}`}
            >
              <div className="chapter-navigation__item-header">
                <div className="chapter-navigation__item-icon">
                  {isCompleted ? (
                    <Check size={16} className="text-green-500" />
                  ) : isActive ? (
                    <Play size={16} className="text-blue-500" />
                  ) : (
                    <span className="chapter-navigation__item-number">{index + 1}</span>
                  )}
                </div>

                <div className="chapter-navigation__item-content">
                  <h4 className="chapter-navigation__item-title">{chapter.title}</h4>
                  {chapter.description && (
                    <p className="chapter-navigation__item-description">{chapter.description}</p>
                  )}
                </div>

                <div className="chapter-navigation__item-meta">
                  <div className="chapter-navigation__item-time">
                    <Clock size={12} />
                    <span>{getChapterDuration(chapter)}</span>
                  </div>
                  <span className="chapter-navigation__item-timestamp">
                    {formatTime(chapter.startTime)}
                  </span>
                </div>
              </div>

              {/* Progress bar for active chapter */}
              {isActive && progress > 0 && progress < 100 && (
                <div className="chapter-navigation__item-progress">
                  <div
                    className="chapter-navigation__item-progress-fill"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              )}
            </button>
          );
        })}
      </div>

      <style jsx>{`
        .chapter-navigation {
          background: var(--background);
          border-radius: 8px;
          border: 1px solid var(--border);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          height: 100%;
        }

        .chapter-navigation__header {
          padding: 1.5rem;
          border-bottom: 1px solid var(--border);
        }

        .chapter-navigation__title {
          font-size: 1.125rem;
          font-weight: 600;
          margin-bottom: 1rem;
        }

        .chapter-navigation__progress-text {
          font-size: 0.875rem;
          color: var(--muted-foreground);
          display: block;
          margin-bottom: 0.5rem;
        }

        .chapter-navigation__progress-bar {
          height: 4px;
          background: var(--secondary);
          border-radius: 2px;
          overflow: hidden;
        }

        .chapter-navigation__progress-fill {
          height: 100%;
          background: var(--primary);
          transition: width 0.3s ease;
        }

        .chapter-navigation__list {
          overflow-y: auto;
          flex: 1;
        }

        .chapter-navigation__item {
          width: 100%;
          text-align: left;
          padding: 1rem 1.5rem;
          border: none;
          background: transparent;
          cursor: pointer;
          transition: background 0.2s ease;
          border-bottom: 1px solid var(--border);
        }

        .chapter-navigation__item:hover {
          background: var(--accent);
        }

        .chapter-navigation__item.active {
          background: var(--accent);
          border-left: 3px solid var(--primary);
        }

        .chapter-navigation__item.completed {
          opacity: 0.8;
        }

        .chapter-navigation__item-header {
          display: flex;
          gap: 0.75rem;
          align-items: flex-start;
        }

        .chapter-navigation__item-icon {
          flex-shrink: 0;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: var(--secondary);
        }

        .chapter-navigation__item.active .chapter-navigation__item-icon {
          background: var(--primary);
          color: white;
        }

        .chapter-navigation__item-number {
          font-size: 0.875rem;
          font-weight: 600;
        }

        .chapter-navigation__item-content {
          flex: 1;
          min-width: 0;
        }

        .chapter-navigation__item-title {
          font-size: 0.9375rem;
          font-weight: 500;
          margin-bottom: 0.25rem;
          line-height: 1.4;
        }

        .chapter-navigation__item-description {
          font-size: 0.8125rem;
          color: var(--muted-foreground);
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .chapter-navigation__item-meta {
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 0.25rem;
        }

        .chapter-navigation__item-time {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.75rem;
          color: var(--muted-foreground);
        }

        .chapter-navigation__item-timestamp {
          font-size: 0.75rem;
          color: var(--muted-foreground);
          font-family: monospace;
        }

        .chapter-navigation__item-progress {
          margin-top: 0.5rem;
          height: 2px;
          background: var(--secondary);
          border-radius: 1px;
          overflow: hidden;
        }

        .chapter-navigation__item-progress-fill {
          height: 100%;
          background: var(--primary);
          transition: width 0.1s linear;
        }

        @media (max-width: 768px) {
          .chapter-navigation__item-description {
            display: none;
          }

          .chapter-navigation__item-header {
            gap: 0.5rem;
          }
        }
      `}</style>
    </div>
  );
}

export default ChapterNavigation;
