/**
 * Tutorial System Types
 * Comprehensive types for the tutorial video system with chapters
 */

export interface Chapter {
  id: string;
  title: string;
  startTime: number;
  endTime: number;
  description?: string;
  thumbnail?: string;
  completed?: boolean;
}

export interface CodeSnippet {
  id: string;
  chapterId: string;
  language: string;
  code: string;
  title?: string;
  description?: string;
  startTime: number;
  endTime?: number;
  highlightedLines?: number[];
}

export interface QuizQuestion {
  id: string;
  chapterId: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

export interface Note {
  id: string;
  timestamp: number;
  content: string;
  createdAt: number;
}

export interface Bookmark {
  id: string;
  timestamp: number;
  title: string;
  createdAt: number;
}

export interface ChapterProgress {
  chapterId: string;
  watchTime: number;
  completed: boolean;
  lastPosition: number;
}

export interface QuizScore {
  quizId: string;
  score: number;
  maxScore: number;
  passed: boolean;
  attempts?: number;
  completedAt: Date;
}

export interface TutorialProgress {
  tutorialId: string;
  userId: string | null;
  completionPercentage: number;
  chaptersCompleted: number;
  totalChapters: number;
  chapterProgress: ChapterProgress[];
  quizScores: QuizScore[];
  certificateEligible: boolean;
  certificateEarned: boolean;
  totalWatchTime: number;
  lastWatchedAt: Date | null;
  // Legacy support
  videoId?: string;
  completedChapters?: string[];
  currentChapter?: string | null;
  lastWatchedTime?: number;
  notes?: Note[];
  bookmarks?: Bookmark[];
  lastUpdated?: number;
}

export interface Tutorial {
  id: string;
  title: string;
  description: string;
  slug: string;
  category: 'tutorial' | 'webinar' | 'showcase' | 'demo';
  duration: number;
  video_url: string;
  thumbnail_url?: string;
  poster_url?: string;
  chapters: Chapter[];
  quiz_questions: QuizQuestion[];
  code_snippets: CodeSnippet[];
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  prerequisites: string[];
  learning_objectives: string[];
  estimated_duration: number;
  completion_certificate: boolean;
  author?: {
    name: string;
    avatar?: string;
  };
  tags?: string[];
  views?: number;
  likes?: number;
  featured?: boolean;
}

export interface QuizResult {
  chapterId: string;
  score: number;
  totalQuestions: number;
  passed: boolean;
  answers: Record<string, number>;
}

export interface CertificateData {
  userName: string;
  tutorialTitle: string;
  completionDate: string;
  difficulty: string;
  duration: number;
  certificateId: string;
}

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export const QUIZ_PASS_THRESHOLD = 0.7; // 70% pass threshold
