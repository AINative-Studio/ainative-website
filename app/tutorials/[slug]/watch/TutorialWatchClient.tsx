'use client';

import { useState, useEffect } from 'react';
import { VideoPlayer } from '@/components/video/VideoPlayer';
import ChapterNavigation from '@/components/tutorial/ChapterNavigation';
import { QuizPanel } from '@/components/tutorial/QuizPanel';
import { NotesPanel } from '@/components/tutorial/NotesPanel';
import { CertificateGenerator } from '@/components/tutorial/CertificateGenerator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import {
  Tutorial,
  Chapter,
  QuizQuestion,
  Note,
  Bookmark,
  QuizResult,
  CertificateData,
} from '@/types/tutorial';
import { NotebookPen, Bookmark as BookmarkIcon } from 'lucide-react';

export default function TutorialWatchClient({ slug }: { slug: string }) {
  const [tutorial, setTutorial] = useState<Tutorial | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [progress, setProgress] = useState(0);
  const [showQuiz, setShowQuiz] = useState(true);
  const [showNotes, setShowNotes] = useState(true);
  const [completed, setCompleted] = useState(false);
  const [currentChapter, setCurrentChapter] = useState<string | null>(null);
  const [completedChapters, setCompletedChapters] = useState<string[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [quizResults, setQuizResults] = useState<Record<string, number>>({});
  const [noteContent, setNoteContent] = useState('');
  const [showAddNote, setShowAddNote] = useState(false);

  useEffect(() => {
    // Fetch tutorial data
    const fetchTutorial = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/tutorials/${slug}`);

        if (!response.ok) {
          throw new Error('Failed to load tutorial');
        }

        const data = await response.json();
        setTutorial(data);

        // Load saved progress from localStorage
        const savedProgress = localStorage.getItem(`tutorial-${slug}-progress`);
        if (savedProgress) {
          const parsed = JSON.parse(savedProgress);
          setCurrentTime(parsed.currentTime || 0);
          setCompletedChapters(parsed.completedChapters || []);
          setQuizResults(parsed.quizResults || {});
        }

        // Load notes and bookmarks
        const savedNotes = localStorage.getItem(`tutorial-${slug}-notes`);
        if (savedNotes) {
          setNotes(JSON.parse(savedNotes));
        }

        const savedBookmarks = localStorage.getItem(`tutorial-${slug}-bookmarks`);
        if (savedBookmarks) {
          setBookmarks(JSON.parse(savedBookmarks));
        }

        // Check if already completed
        const isCompleted = localStorage.getItem(`tutorial-${slug}-completed`) === 'true';
        setCompleted(isCompleted);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchTutorial();
  }, [slug]);

  // Update current chapter based on time
  useEffect(() => {
    if (!tutorial?.chapters) return;

    const chapter = tutorial.chapters.find(
      (ch) => currentTime >= ch.startTime && currentTime < ch.endTime
    );

    if (chapter && chapter.id !== currentChapter) {
      setCurrentChapter(chapter.id);
    }
  }, [currentTime, tutorial?.chapters, currentChapter]);

  const handleTimeUpdate = (time: number) => {
    setCurrentTime(time);
    const progressPercent = (time / (tutorial?.duration || 1)) * 100;
    setProgress(progressPercent);

    // Save progress every 5 seconds
    if (Math.floor(time) % 5 === 0) {
      saveProgress(time);
    }

    // Mark as completed at 95%
    if (progressPercent >= 95 && !completed) {
      setCompleted(true);
      saveCompletion();
    }
  };

  const saveProgress = (time: number) => {
    localStorage.setItem(
      `tutorial-${slug}-progress`,
      JSON.stringify({
        currentTime: time,
        completedChapters,
        quizResults,
        lastUpdated: Date.now(),
      })
    );
  };

  const saveCompletion = async () => {
    try {
      localStorage.setItem(`tutorial-${slug}-completed`, 'true');

      // Save to backend if user is authenticated
      await fetch(`/api/tutorials/${slug}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          completedAt: new Date().toISOString(),
          progress: 100,
        }),
      }).catch(() => {
        // Silently fail if not authenticated
      });
    } catch (err) {
      console.error('Failed to save completion:', err);
    }
  };

  const handleChapterClick = (chapter: Chapter) => {
    setCurrentTime(chapter.startTime);
    // Note: VideoPlayer handles seeking via onTimeUpdate callback
  };

  const handleQuizComplete = (result: QuizResult) => {
    const newResults = { ...quizResults, [result.chapterId]: result.score };
    setQuizResults(newResults);

    // Mark chapter as completed if quiz passed
    if (result.passed && !completedChapters.includes(result.chapterId)) {
      const newCompleted = [...completedChapters, result.chapterId];
      setCompletedChapters(newCompleted);
      saveProgress(currentTime);
    }
  };

  const handleAddNote = (timestamp: number, content: string) => {
    const newNote: Note = {
      id: `note-${Date.now()}`,
      timestamp,
      content,
      createdAt: Date.now(),
    };

    const updatedNotes = [...notes, newNote];
    setNotes(updatedNotes);
    localStorage.setItem(`tutorial-${slug}-notes`, JSON.stringify(updatedNotes));
  };

  const handleEditNote = (id: string, content: string) => {
    const updatedNotes = notes.map((note) => (note.id === id ? { ...note, content } : note));
    setNotes(updatedNotes);
    localStorage.setItem(`tutorial-${slug}-notes`, JSON.stringify(updatedNotes));
  };

  const handleDeleteNote = (id: string) => {
    const updatedNotes = notes.filter((note) => note.id !== id);
    setNotes(updatedNotes);
    localStorage.setItem(`tutorial-${slug}-notes`, JSON.stringify(updatedNotes));
  };

  const handleDeleteBookmark = (id: string) => {
    const updatedBookmarks = bookmarks.filter((bookmark) => bookmark.id !== id);
    setBookmarks(updatedBookmarks);
    localStorage.setItem(`tutorial-${slug}-bookmarks`, JSON.stringify(updatedBookmarks));
  };

  const handleAddQuickNote = () => {
    if (noteContent.trim()) {
      handleAddNote(currentTime, noteContent.trim());
      setNoteContent('');
      setShowAddNote(false);
    }
  };

  const handleAddBookmark = () => {
    if (!currentChapter || !tutorial) return;

    const chapter = tutorial.chapters.find((ch) => ch.id === currentChapter);
    if (!chapter) return;

    const newBookmark: Bookmark = {
      id: `bookmark-${Date.now()}`,
      timestamp: currentTime,
      title: chapter.title,
      createdAt: Date.now(),
    };

    const updatedBookmarks = [...bookmarks, newBookmark];
    setBookmarks(updatedBookmarks);
    localStorage.setItem(`tutorial-${slug}-bookmarks`, JSON.stringify(updatedBookmarks));
  };

  const handleJumpToTimestamp = (timestamp: number) => {
    setCurrentTime(timestamp);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12 lg:col-span-8">
              <Skeleton className="w-full aspect-video bg-gray-800" />
              <Skeleton className="w-full h-32 mt-4 bg-gray-800" />
            </div>
            <div className="col-span-12 lg:col-span-4 space-y-4">
              <Skeleton className="w-full h-48 bg-gray-800" />
              <Skeleton className="w-full h-48 bg-gray-800" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !tutorial) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="container mx-auto px-4">
          <Alert variant="destructive" className="max-w-2xl mx-auto">
            <AlertDescription>
              {error || 'Tutorial not found. Please check the URL and try again.'}
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  // Get current chapter questions
  const currentChapterQuestions = tutorial.quiz_questions.filter(
    (q) => q.chapterId === currentChapter
  );

  // Generate certificate data
  const certificateData: CertificateData = {
    userName: '', // Will be filled by user
    tutorialTitle: tutorial.title,
    completionDate: new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
    difficulty: tutorial.difficulty,
    duration: tutorial.estimated_duration,
    certificateId: `${tutorial.id}-${Date.now()}`,
  };

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-12 gap-6">
          {/* Video Player - Main Column */}
          <div className="col-span-12 lg:col-span-8">
            <VideoPlayer
              src={tutorial.video_url}
              poster={tutorial.poster_url || tutorial.thumbnail_url}
              onTimeUpdate={handleTimeUpdate}
              autoplay={false}
            />

            {/* Tutorial Info */}
            <div className="mt-4 p-6 bg-gray-900 rounded-lg">
              <h1 className="text-2xl font-bold text-white">{tutorial.title}</h1>

              {tutorial.description && (
                <p className="mt-2 text-gray-300">{tutorial.description}</p>
              )}

              <div className="mt-4 flex items-center gap-4">
                <div className="flex-1 bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className="text-white font-semibold">{Math.round(progress)}%</span>
              </div>

              {/* Quick Actions */}
              <div className="mt-4 flex gap-3">
                <Button
                  onClick={() => setShowAddNote(!showAddNote)}
                  variant="outline"
                  size="sm"
                  className="text-white border-gray-700"
                >
                  <NotebookPen size={16} className="mr-2" />
                  Add Note
                </Button>
                <Button
                  onClick={handleAddBookmark}
                  variant="outline"
                  size="sm"
                  className="text-white border-gray-700"
                  disabled={!currentChapter}
                >
                  <BookmarkIcon size={16} className="mr-2" />
                  Bookmark
                </Button>
              </div>

              {/* Quick Note Input */}
              {showAddNote && (
                <div className="mt-4 p-4 bg-gray-800 rounded-lg border border-gray-700">
                  <textarea
                    className="w-full p-3 bg-gray-900 text-white border border-gray-700 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Add a note at the current timestamp..."
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    rows={3}
                  />
                  <div className="mt-2 flex gap-2">
                    <Button onClick={handleAddQuickNote} size="sm">
                      Save Note
                    </Button>
                    <Button
                      onClick={() => {
                        setShowAddNote(false);
                        setNoteContent('');
                      }}
                      variant="outline"
                      size="sm"
                      className="text-white border-gray-700"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {completed && (
                <div className="mt-4 p-4 bg-green-900/30 border border-green-500/50 rounded-lg">
                  <p className="text-green-400 font-semibold">
                    Tutorial Completed! Download your certificate below.
                  </p>
                </div>
              )}
            </div>

            {/* Chapter Navigation */}
            {tutorial.chapters && tutorial.chapters.length > 0 && (
              <div className="mt-4">
                <ChapterNavigation
                  chapters={tutorial.chapters}
                  currentChapter={currentChapter}
                  completedChapters={completedChapters}
                  currentTime={currentTime}
                  onChapterClick={handleChapterClick}
                />
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="col-span-12 lg:col-span-4 space-y-4">
            {/* Quiz Panel */}
            {currentChapterQuestions.length > 0 && (
              <div className="bg-gray-900 rounded-lg overflow-hidden">
                <button
                  onClick={() => setShowQuiz(!showQuiz)}
                  className="w-full flex items-center justify-between text-white font-semibold p-6 hover:bg-gray-800 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <span className="text-2xl">📝</span>
                    <span>Chapter Quiz ({currentChapterQuestions.length})</span>
                  </span>
                  <span className="text-xl">{showQuiz ? '▼' : '▶'}</span>
                </button>
                {showQuiz && currentChapter && (
                  <div className="border-t border-gray-800 p-4">
                    <QuizPanel
                      chapterId={currentChapter}
                      questions={currentChapterQuestions}
                      onComplete={handleQuizComplete}
                      previousScore={quizResults[currentChapter]}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Notes Panel */}
            <div className="bg-gray-900 rounded-lg overflow-hidden">
              <button
                onClick={() => setShowNotes(!showNotes)}
                className="w-full flex items-center justify-between text-white font-semibold p-6 hover:bg-gray-800 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <span className="text-2xl">📓</span>
                  <span>Notes & Bookmarks</span>
                </span>
                <span className="text-xl">{showNotes ? '▼' : '▶'}</span>
              </button>
              {showNotes && (
                <div className="border-t border-gray-800">
                  <NotesPanel
                    notes={notes}
                    bookmarks={bookmarks}
                    onAddNote={handleAddNote}
                    onEditNote={handleEditNote}
                    onDeleteNote={handleDeleteNote}
                    onDeleteBookmark={handleDeleteBookmark}
                    onJumpToTimestamp={handleJumpToTimestamp}
                  />
                </div>
              )}
            </div>

            {/* Certificate */}
            {completed && (
              <div className="bg-gray-900 rounded-lg overflow-hidden">
                <CertificateGenerator certificateData={certificateData} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
