'use client';

/**
 * NotesPanel Component
 * Display and manage user notes and bookmarks with timestamps
 * Features: Add, edit, delete, search, export notes
 */

import React, { useState, useMemo } from 'react';
import { Note, Bookmark } from '@/types/tutorial';
import {
  NotebookPen,
  Bookmark as BookmarkIcon,
  Search,
  Download,
  Trash2,
  Edit2,
  X,
  Clock,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface NotesPanelProps {
  notes: Note[];
  bookmarks: Bookmark[];
  onAddNote: (timestamp: number, content: string) => void;
  onEditNote: (id: string, content: string) => void;
  onDeleteNote: (id: string) => void;
  onDeleteBookmark: (id: string) => void;
  onJumpToTimestamp: (timestamp: number) => void;
  className?: string;
}

export function NotesPanel({
  notes,
  bookmarks,
  onAddNote,
  onEditNote,
  onDeleteNote,
  onDeleteBookmark,
  onJumpToTimestamp,
  className = '',
}: NotesPanelProps) {
  const [activeTab, setActiveTab] = useState<'notes' | 'bookmarks'>('notes');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set());

  /**
   * Format timestamp to MM:SS or HH:MM:SS
   */
  const formatTimestamp = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  /**
   * Format date
   */
  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  /**
   * Filter notes by search query
   */
  const filteredNotes = useMemo(() => {
    if (!searchQuery) return notes;
    const query = searchQuery.toLowerCase();
    return notes.filter((note) => note.content.toLowerCase().includes(query));
  }, [notes, searchQuery]);

  /**
   * Filter bookmarks by search query
   */
  const filteredBookmarks = useMemo(() => {
    if (!searchQuery) return bookmarks;
    const query = searchQuery.toLowerCase();
    return bookmarks.filter((bookmark) => bookmark.title.toLowerCase().includes(query));
  }, [bookmarks, searchQuery]);

  /**
   * Export notes to markdown
   */
  const handleExportNotes = () => {
    let markdown = '# Tutorial Notes\n\n';

    // Add bookmarks
    if (bookmarks.length > 0) {
      markdown += '## Bookmarks\n\n';
      bookmarks
        .sort((a, b) => a.timestamp - b.timestamp)
        .forEach((bookmark) => {
          markdown += `- **[${formatTimestamp(bookmark.timestamp)}]** ${bookmark.title}\n`;
        });
      markdown += '\n';
    }

    // Add notes
    if (notes.length > 0) {
      markdown += '## Notes\n\n';
      notes
        .sort((a, b) => a.timestamp - b.timestamp)
        .forEach((note) => {
          markdown += `### [${formatTimestamp(note.timestamp)}]\n\n`;
          markdown += `${note.content}\n\n`;
          markdown += `*Created: ${formatDate(note.createdAt)}*\n\n---\n\n`;
        });
    }

    // Create and download file
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `tutorial-notes-${Date.now()}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  /**
   * Start editing a note
   */
  const handleStartEdit = (note: Note) => {
    setEditingNoteId(note.id);
    setEditContent(note.content);
  };

  /**
   * Save edited note
   */
  const handleSaveEdit = (noteId: string) => {
    if (editContent.trim()) {
      onEditNote(noteId, editContent.trim());
      setEditingNoteId(null);
      setEditContent('');
    }
  };

  /**
   * Cancel editing
   */
  const handleCancelEdit = () => {
    setEditingNoteId(null);
    setEditContent('');
  };

  /**
   * Toggle note expansion
   */
  const toggleNoteExpansion = (noteId: string) => {
    const newExpanded = new Set(expandedNotes);
    if (newExpanded.has(noteId)) {
      newExpanded.delete(noteId);
    } else {
      newExpanded.add(noteId);
    }
    setExpandedNotes(newExpanded);
  };

  /**
   * Check if note should be truncated
   */
  const shouldTruncateNote = (content: string): boolean => {
    return content.length > 150;
  };

  return (
    <div className={`notes-panel ${className}`}>
      {/* Header */}
      <div className="notes-panel__header">
        <div className="notes-panel__tabs">
          <button
            className={`notes-panel__tab ${activeTab === 'notes' ? 'active' : ''}`}
            onClick={() => setActiveTab('notes')}
          >
            <NotebookPen size={18} />
            Notes ({notes.length})
          </button>
          <button
            className={`notes-panel__tab ${activeTab === 'bookmarks' ? 'active' : ''}`}
            onClick={() => setActiveTab('bookmarks')}
          >
            <BookmarkIcon size={18} />
            Bookmarks ({bookmarks.length})
          </button>
        </div>

        {(notes.length > 0 || bookmarks.length > 0) && (
          <button className="notes-panel__export-btn" onClick={handleExportNotes}>
            <Download size={16} />
            Export
          </button>
        )}
      </div>

      {/* Search */}
      {((activeTab === 'notes' && notes.length > 0) ||
        (activeTab === 'bookmarks' && bookmarks.length > 0)) && (
        <div className="notes-panel__search">
          <Search size={16} className="notes-panel__search-icon" />
          <input
            type="text"
            className="notes-panel__search-input"
            placeholder={`Search ${activeTab}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              className="notes-panel__search-clear"
              onClick={() => setSearchQuery('')}
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>
      )}

      {/* Content */}
      <div className="notes-panel__content">
        {activeTab === 'notes' && (
          <>
            {filteredNotes.length === 0 ? (
              <div className="notes-panel__empty">
                <NotebookPen size={48} />
                <p>
                  {searchQuery
                    ? 'No notes match your search'
                    : 'No notes yet. Add notes as you watch to keep track of important moments!'}
                </p>
              </div>
            ) : (
              <div className="notes-panel__list">
                {filteredNotes
                  .sort((a, b) => a.timestamp - b.timestamp)
                  .map((note) => {
                    const isEditing = editingNoteId === note.id;
                    const isExpanded = expandedNotes.has(note.id);
                    const shouldTruncate = shouldTruncateNote(note.content);

                    return (
                      <div key={note.id} className="note-item">
                        <div className="note-item__header">
                          <button
                            className="note-item__timestamp"
                            onClick={() => onJumpToTimestamp(note.timestamp)}
                            title="Jump to timestamp"
                          >
                            <Clock size={14} />
                            {formatTimestamp(note.timestamp)}
                          </button>
                          <span className="note-item__date">{formatDate(note.createdAt)}</span>
                        </div>

                        {isEditing ? (
                          <div className="note-item__edit">
                            <textarea
                              className="note-item__textarea"
                              value={editContent}
                              onChange={(e) => setEditContent(e.target.value)}
                              rows={4}
                              autoFocus
                            />
                            <div className="note-item__edit-actions">
                              <button
                                className="note-item__btn note-item__btn--save"
                                onClick={() => handleSaveEdit(note.id)}
                              >
                                Save
                              </button>
                              <button
                                className="note-item__btn note-item__btn--cancel"
                                onClick={handleCancelEdit}
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <p
                              className={`note-item__content ${shouldTruncate && !isExpanded ? 'truncated' : ''}`}
                            >
                              {note.content}
                            </p>

                            {shouldTruncate && (
                              <button
                                className="note-item__expand"
                                onClick={() => toggleNoteExpansion(note.id)}
                              >
                                {isExpanded ? (
                                  <>
                                    <ChevronUp size={14} />
                                    Show less
                                  </>
                                ) : (
                                  <>
                                    <ChevronDown size={14} />
                                    Show more
                                  </>
                                )}
                              </button>
                            )}

                            <div className="note-item__actions">
                              <button
                                className="note-item__action"
                                onClick={() => handleStartEdit(note)}
                                title="Edit note"
                              >
                                <Edit2 size={14} />
                              </button>
                              <button
                                className="note-item__action note-item__action--delete"
                                onClick={() => onDeleteNote(note.id)}
                                title="Delete note"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
              </div>
            )}
          </>
        )}

        {activeTab === 'bookmarks' && (
          <>
            {filteredBookmarks.length === 0 ? (
              <div className="notes-panel__empty">
                <BookmarkIcon size={48} />
                <p>
                  {searchQuery
                    ? 'No bookmarks match your search'
                    : 'No bookmarks yet. Bookmark important timestamps for quick access!'}
                </p>
              </div>
            ) : (
              <div className="notes-panel__list">
                {filteredBookmarks
                  .sort((a, b) => a.timestamp - b.timestamp)
                  .map((bookmark) => (
                    <div key={bookmark.id} className="bookmark-item">
                      <button
                        className="bookmark-item__content"
                        onClick={() => onJumpToTimestamp(bookmark.timestamp)}
                      >
                        <BookmarkIcon size={16} className="bookmark-item__icon" />
                        <div className="bookmark-item__details">
                          <h4 className="bookmark-item__title">{bookmark.title}</h4>
                          <div className="bookmark-item__meta">
                            <span className="bookmark-item__timestamp">
                              <Clock size={12} />
                              {formatTimestamp(bookmark.timestamp)}
                            </span>
                            <span className="bookmark-item__date">{formatDate(bookmark.createdAt)}</span>
                          </div>
                        </div>
                      </button>
                      <button
                        className="bookmark-item__delete"
                        onClick={() => onDeleteBookmark(bookmark.id)}
                        title="Delete bookmark"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
              </div>
            )}
          </>
        )}
      </div>

      <style jsx>{`
        .notes-panel {
          background: var(--background);
          border-radius: 8px;
          border: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          height: 100%;
          overflow: hidden;
        }

        .notes-panel__header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          border-bottom: 1px solid var(--border);
          background: var(--accent);
        }

        .notes-panel__tabs {
          display: flex;
          gap: 0.5rem;
        }

        .notes-panel__tab {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          font-size: 0.875rem;
          font-weight: 500;
          background: transparent;
          border: none;
          border-bottom: 2px solid transparent;
          cursor: pointer;
          transition: all 0.2s ease;
          color: var(--muted-foreground);
        }

        .notes-panel__tab:hover {
          color: var(--foreground);
        }

        .notes-panel__tab.active {
          color: var(--primary);
          border-bottom-color: var(--primary);
        }

        .notes-panel__export-btn {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          padding: 0.5rem 0.875rem;
          font-size: 0.8125rem;
          font-weight: 500;
          background: var(--primary);
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: opacity 0.2s ease;
        }

        .notes-panel__export-btn:hover {
          opacity: 0.9;
        }

        .notes-panel__search {
          position: relative;
          padding: 1rem;
          border-bottom: 1px solid var(--border);
        }

        .notes-panel__search-icon {
          position: absolute;
          left: 1.75rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--muted-foreground);
        }

        .notes-panel__search-input {
          width: 100%;
          padding: 0.625rem 2.5rem 0.625rem 2.75rem;
          font-size: 0.875rem;
          background: var(--background);
          border: 1px solid var(--border);
          border-radius: 6px;
          transition: border-color 0.2s ease;
        }

        .notes-panel__search-input:focus {
          outline: none;
          border-color: var(--primary);
        }

        .notes-panel__search-clear {
          position: absolute;
          right: 1.75rem;
          top: 50%;
          transform: translateY(-50%);
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          background: none;
          border: none;
          cursor: pointer;
          color: var(--muted-foreground);
          transition: color 0.2s ease;
        }

        .notes-panel__search-clear:hover {
          color: var(--foreground);
        }

        .notes-panel__content {
          flex: 1;
          overflow-y: auto;
          padding: 1rem;
        }

        .notes-panel__empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 3rem 1.5rem;
          text-align: center;
          color: var(--muted-foreground);
        }

        .notes-panel__empty svg {
          margin-bottom: 1rem;
          opacity: 0.3;
        }

        .notes-panel__empty p {
          font-size: 0.875rem;
          line-height: 1.5;
          max-width: 300px;
        }

        .notes-panel__list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .note-item,
        .bookmark-item {
          padding: 1rem;
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: 8px;
          transition: all 0.2s ease;
        }

        .note-item:hover,
        .bookmark-item:hover {
          border-color: var(--primary);
        }

        .note-item__header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.75rem;
        }

        .note-item__timestamp {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          padding: 0.25rem 0.625rem;
          font-size: 0.75rem;
          font-weight: 600;
          font-family: monospace;
          background: var(--primary);
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          transition: opacity 0.2s ease;
        }

        .note-item__timestamp:hover {
          opacity: 0.9;
        }

        .note-item__date {
          font-size: 0.75rem;
          color: var(--muted-foreground);
        }

        .note-item__content {
          font-size: 0.875rem;
          line-height: 1.6;
          margin-bottom: 0.75rem;
          white-space: pre-wrap;
        }

        .note-item__content.truncated {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .note-item__expand {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.8125rem;
          color: var(--primary);
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
          margin-bottom: 0.75rem;
          transition: opacity 0.2s ease;
        }

        .note-item__expand:hover {
          opacity: 0.8;
        }

        .note-item__actions {
          display: flex;
          gap: 0.5rem;
        }

        .note-item__action {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0.375rem 0.625rem;
          font-size: 0.8125rem;
          background: var(--background);
          border: 1px solid var(--border);
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .note-item__action:hover {
          background: var(--accent);
          border-color: var(--primary);
        }

        .note-item__action--delete:hover {
          background: #fee;
          border-color: #ef4444;
          color: #ef4444;
        }

        .note-item__edit {
          margin-bottom: 0.75rem;
        }

        .note-item__textarea {
          width: 100%;
          padding: 0.75rem;
          font-size: 0.875rem;
          background: var(--background);
          border: 1px solid var(--border);
          border-radius: 6px;
          resize: vertical;
          font-family: inherit;
          margin-bottom: 0.5rem;
        }

        .note-item__textarea:focus {
          outline: none;
          border-color: var(--primary);
        }

        .note-item__edit-actions {
          display: flex;
          gap: 0.5rem;
        }

        .note-item__btn {
          padding: 0.5rem 1rem;
          font-size: 0.8125rem;
          font-weight: 500;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: opacity 0.2s ease;
        }

        .note-item__btn--save {
          background: var(--primary);
          color: white;
        }

        .note-item__btn--cancel {
          background: var(--secondary);
          color: var(--foreground);
        }

        .note-item__btn:hover {
          opacity: 0.9;
        }

        .bookmark-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0;
        }

        .bookmark-item__content {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem;
          background: none;
          border: none;
          cursor: pointer;
          text-align: left;
          transition: background 0.2s ease;
        }

        .bookmark-item__content:hover {
          background: var(--accent);
        }

        .bookmark-item__icon {
          color: var(--primary);
          flex-shrink: 0;
        }

        .bookmark-item__details {
          flex: 1;
          min-width: 0;
        }

        .bookmark-item__title {
          font-size: 0.9375rem;
          font-weight: 500;
          margin-bottom: 0.25rem;
          line-height: 1.4;
        }

        .bookmark-item__meta {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 0.75rem;
          color: var(--muted-foreground);
        }

        .bookmark-item__timestamp {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-family: monospace;
        }

        .bookmark-item__delete {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          margin-right: 0.75rem;
          background: none;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          color: var(--muted-foreground);
          transition: all 0.2s ease;
        }

        .bookmark-item__delete:hover {
          background: #fee;
          color: #ef4444;
        }

        @media (max-width: 768px) {
          .notes-panel__header {
            flex-direction: column;
            align-items: stretch;
            gap: 0.75rem;
          }

          .notes-panel__tabs {
            justify-content: center;
          }

          .notes-panel__export-btn {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
}

export default NotesPanel;
