'use client';

/**
 * ProgressTracker Component
 * Displays tutorial completion progress, notes, and bookmarks
 */

import React, { useState } from 'react';
import { TutorialProgress, Note, Bookmark } from '@/types/tutorial';
import { Award, BookMarked, FileText, Download, Trash2, Clock } from 'lucide-react';

interface ProgressTrackerProps {
  progress: TutorialProgress;
  totalChapters: number;
  onNoteDelete: (noteId: string) => void;
  onBookmarkDelete: (bookmarkId: string) => void;
  onBookmarkClick: (timestamp: number) => void;
  onExportNotes: () => void;
  className?: string;
}

export function ProgressTracker({
  progress,
  totalChapters,
  onNoteDelete,
  onBookmarkDelete,
  onBookmarkClick,
  onExportNotes,
  className = '',
}: ProgressTrackerProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'notes' | 'bookmarks'>('overview');

  /**
   * Format timestamp to readable time
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
   * Format date to readable format
   */
  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  /**
   * Get completion status message
   */
  const getStatusMessage = (): string => {
    if (progress.certificateEarned) {
      return 'Congratulations! Tutorial completed!';
    }
    if (progress.completionPercentage >= 50) {
      return 'You are halfway there!';
    }
    if (progress.completionPercentage > 0) {
      return 'Keep going!';
    }
    return 'Start your learning journey';
  };

  /**
   * Calculate average quiz score
   */
  const getAverageQuizScore = (): number => {
    const scores = Object.values(progress.quizScores);
    if (scores.length === 0) return 0;
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  };

  return (
    <div className={`progress-tracker ${className}`}>
      {/* Tabs */}
      <div className="progress-tracker__tabs">
        <button
          className={`progress-tracker__tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <Award size={16} />
          Overview
        </button>
        <button
          className={`progress-tracker__tab ${activeTab === 'notes' ? 'active' : ''}`}
          onClick={() => setActiveTab('notes')}
        >
          <FileText size={16} />
          Notes ({progress.notes.length})
        </button>
        <button
          className={`progress-tracker__tab ${activeTab === 'bookmarks' ? 'active' : ''}`}
          onClick={() => setActiveTab('bookmarks')}
        >
          <BookMarked size={16} />
          Bookmarks ({progress.bookmarks.length})
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="progress-tracker__content">
          <div className="progress-tracker__status">
            <div className="progress-tracker__circle">
              <svg viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" className="progress-circle-bg" />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  className="progress-circle-fill"
                  style={{
                    strokeDashoffset: `${283 - (283 * progress.completionPercentage) / 100}`,
                  }}
                />
              </svg>
              <div className="progress-tracker__percentage">
                {Math.round(progress.completionPercentage)}%
              </div>
            </div>

            <div className="progress-tracker__status-text">
              <h3>{getStatusMessage()}</h3>
              {progress.certificateEarned && (
                <p className="progress-tracker__certificate-badge">
                  <Award size={16} />
                  Certificate Earned
                </p>
              )}
            </div>
          </div>

          <div className="progress-tracker__stats">
            <div className="progress-tracker__stat">
              <div className="progress-tracker__stat-label">Chapters Completed</div>
              <div className="progress-tracker__stat-value">
                {progress.completedChapters.length} / {totalChapters}
              </div>
            </div>

            <div className="progress-tracker__stat">
              <div className="progress-tracker__stat-label">Average Quiz Score</div>
              <div className="progress-tracker__stat-value">
                {getAverageQuizScore()}%
              </div>
            </div>

            <div className="progress-tracker__stat">
              <div className="progress-tracker__stat-label">Notes Taken</div>
              <div className="progress-tracker__stat-value">{progress.notes.length}</div>
            </div>

            <div className="progress-tracker__stat">
              <div className="progress-tracker__stat-label">Bookmarks</div>
              <div className="progress-tracker__stat-value">{progress.bookmarks.length}</div>
            </div>
          </div>

          {progress.lastUpdated && (
            <div className="progress-tracker__last-updated">
              Last activity: {formatDate(progress.lastUpdated)}
            </div>
          )}
        </div>
      )}

      {/* Notes Tab */}
      {activeTab === 'notes' && (
        <div className="progress-tracker__content">
          <div className="progress-tracker__header">
            <h3>Your Notes</h3>
            {progress.notes.length > 0 && (
              <button className="progress-tracker__export-btn" onClick={onExportNotes}>
                <Download size={14} />
                Export to Markdown
              </button>
            )}
          </div>

          {progress.notes.length === 0 ? (
            <div className="progress-tracker__empty">
              <FileText size={48} />
              <p>No notes yet</p>
              <small>Add notes while watching to remember important points</small>
            </div>
          ) : (
            <div className="progress-tracker__list">
              {progress.notes
                .sort((a, b) => b.createdAt - a.createdAt)
                .map((note) => (
                  <div key={note.id} className="progress-tracker__note">
                    <div className="progress-tracker__note-header">
                      <button
                        className="progress-tracker__note-time"
                        onClick={() => onBookmarkClick(note.timestamp)}
                      >
                        <Clock size={12} />
                        {formatTime(note.timestamp)}
                      </button>
                      <button
                        className="progress-tracker__delete-btn"
                        onClick={() => onNoteDelete(note.id)}
                        aria-label="Delete note"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <p className="progress-tracker__note-content">{note.content}</p>
                    <small className="progress-tracker__note-date">
                      {formatDate(note.createdAt)}
                    </small>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* Bookmarks Tab */}
      {activeTab === 'bookmarks' && (
        <div className="progress-tracker__content">
          <div className="progress-tracker__header">
            <h3>Your Bookmarks</h3>
          </div>

          {progress.bookmarks.length === 0 ? (
            <div className="progress-tracker__empty">
              <BookMarked size={48} />
              <p>No bookmarks yet</p>
              <small>Bookmark important moments to find them quickly later</small>
            </div>
          ) : (
            <div className="progress-tracker__list">
              {progress.bookmarks
                .sort((a, b) => a.timestamp - b.timestamp)
                .map((bookmark) => (
                  <div key={bookmark.id} className="progress-tracker__bookmark">
                    <button
                      className="progress-tracker__bookmark-content"
                      onClick={() => onBookmarkClick(bookmark.timestamp)}
                    >
                      <div className="progress-tracker__bookmark-title">
                        <BookMarked size={14} />
                        {bookmark.title}
                      </div>
                      <div className="progress-tracker__bookmark-time">
                        {formatTime(bookmark.timestamp)}
                      </div>
                    </button>
                    <button
                      className="progress-tracker__delete-btn"
                      onClick={() => onBookmarkDelete(bookmark.id)}
                      aria-label="Delete bookmark"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        .progress-tracker {
          background: var(--background);
          border-radius: 8px;
          border: 1px solid var(--border);
          overflow: hidden;
        }

        .progress-tracker__tabs {
          display: flex;
          border-bottom: 1px solid var(--border);
          background: var(--muted);
        }

        .progress-tracker__tab {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          border: none;
          background: transparent;
          cursor: pointer;
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--muted-foreground);
          transition: all 0.2s ease;
          border-bottom: 2px solid transparent;
        }

        .progress-tracker__tab:hover {
          background: var(--accent);
          color: var(--foreground);
        }

        .progress-tracker__tab.active {
          color: var(--primary);
          border-bottom-color: var(--primary);
          background: var(--background);
        }

        .progress-tracker__content {
          padding: 1.5rem;
        }

        .progress-tracker__status {
          display: flex;
          align-items: center;
          gap: 2rem;
          margin-bottom: 2rem;
        }

        .progress-tracker__circle {
          position: relative;
          width: 120px;
          height: 120px;
          flex-shrink: 0;
        }

        .progress-tracker__circle svg {
          transform: rotate(-90deg);
          width: 100%;
          height: 100%;
        }

        .progress-circle-bg {
          fill: none;
          stroke: var(--secondary);
          stroke-width: 8;
        }

        .progress-circle-fill {
          fill: none;
          stroke: var(--primary);
          stroke-width: 8;
          stroke-linecap: round;
          stroke-dasharray: 283;
          transition: stroke-dashoffset 0.5s ease;
        }

        .progress-tracker__percentage {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--primary);
        }

        .progress-tracker__status-text h3 {
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }

        .progress-tracker__certificate-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: linear-gradient(135deg, #ffd700, #ffed4e);
          color: #000;
          border-radius: 6px;
          font-weight: 600;
          font-size: 0.875rem;
        }

        .progress-tracker__stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .progress-tracker__stat {
          padding: 1rem;
          background: var(--accent);
          border-radius: 6px;
          text-align: center;
        }

        .progress-tracker__stat-label {
          font-size: 0.75rem;
          color: var(--muted-foreground);
          margin-bottom: 0.5rem;
        }

        .progress-tracker__stat-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--primary);
        }

        .progress-tracker__last-updated {
          font-size: 0.8125rem;
          color: var(--muted-foreground);
          text-align: center;
          padding-top: 1rem;
          border-top: 1px solid var(--border);
        }

        .progress-tracker__header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .progress-tracker__header h3 {
          font-size: 1.125rem;
          font-weight: 600;
        }

        .progress-tracker__export-btn {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          padding: 0.5rem 1rem;
          font-size: 0.8125rem;
          background: var(--primary);
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: opacity 0.2s ease;
        }

        .progress-tracker__export-btn:hover {
          opacity: 0.9;
        }

        .progress-tracker__empty {
          text-align: center;
          padding: 3rem 1rem;
          color: var(--muted-foreground);
        }

        .progress-tracker__empty svg {
          margin-bottom: 1rem;
          opacity: 0.3;
        }

        .progress-tracker__empty p {
          font-size: 1rem;
          font-weight: 500;
          margin-bottom: 0.5rem;
        }

        .progress-tracker__empty small {
          font-size: 0.875rem;
        }

        .progress-tracker__list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          max-height: 400px;
          overflow-y: auto;
        }

        .progress-tracker__note {
          padding: 1rem;
          background: var(--accent);
          border-radius: 6px;
          border: 1px solid var(--border);
        }

        .progress-tracker__note-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }

        .progress-tracker__note-time {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.75rem;
          font-family: monospace;
          color: var(--primary);
          background: transparent;
          border: none;
          cursor: pointer;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          transition: background 0.2s ease;
        }

        .progress-tracker__note-time:hover {
          background: var(--secondary);
        }

        .progress-tracker__delete-btn {
          padding: 0.25rem;
          background: transparent;
          border: none;
          color: var(--muted-foreground);
          cursor: pointer;
          border-radius: 4px;
          transition: all 0.2s ease;
        }

        .progress-tracker__delete-btn:hover {
          background: var(--destructive);
          color: white;
        }

        .progress-tracker__note-content {
          font-size: 0.9375rem;
          line-height: 1.5;
          margin-bottom: 0.5rem;
        }

        .progress-tracker__note-date {
          font-size: 0.75rem;
          color: var(--muted-foreground);
        }

        .progress-tracker__bookmark {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          background: var(--accent);
          border-radius: 6px;
          border: 1px solid var(--border);
          transition: background 0.2s ease;
        }

        .progress-tracker__bookmark:hover {
          background: var(--secondary);
        }

        .progress-tracker__bookmark-content {
          flex: 1;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: transparent;
          border: none;
          cursor: pointer;
          text-align: left;
        }

        .progress-tracker__bookmark-title {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.9375rem;
          font-weight: 500;
        }

        .progress-tracker__bookmark-time {
          font-size: 0.8125rem;
          font-family: monospace;
          color: var(--primary);
        }

        @media (max-width: 768px) {
          .progress-tracker__status {
            flex-direction: column;
            text-align: center;
          }

          .progress-tracker__stats {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </div>
  );
}

export default ProgressTracker;
