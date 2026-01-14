/**
 * Video Storage Library
 * LocalStorage wrapper for video bookmarks and watch history
 * Features: CRUD operations, export/import
 */

const STORAGE_PREFIX = 'ainative_video_';
const STORAGE_VERSION = '1.0';

/**
 * Storage keys
 */
const KEYS = {
  BOOKMARKS: 'ainative_video_bookmarks',
  WATCH_HISTORY: 'ainative_video_watch_history',
  VERSION: `${STORAGE_PREFIX}version`,
  PROGRESS: `${STORAGE_PREFIX}progress`,
};

export interface BookmarkedVideo {
  id: number;
  documentId: string;
  slug: string;
  title: string;
  thumbnail_url?: string;
  category?: string;
  duration?: number;
  bookmarkedAt: number;
}

export interface WatchHistoryEntry {
  id: number;
  documentId: string;
  slug: string;
  title: string;
  thumbnail_url?: string;
  lastWatchedAt: number;
  progress?: number; // percentage watched (0-100)
}

export interface VideoProgress {
  videoId: string;
  currentTime: number;
  duration: number;
  completed: boolean;
  lastUpdated: number;
}

/**
 * Check if localStorage is available
 */
function isLocalStorageAvailable(): boolean {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

/**
 * Initialize storage version
 */
export function initializeStorage(): void {
  if (!isLocalStorageAvailable()) {
    console.warn('localStorage is not available. Video bookmarks will not be saved.');
    return;
  }

  const currentVersion = localStorage.getItem(KEYS.VERSION);
  if (!currentVersion) {
    localStorage.setItem(KEYS.VERSION, STORAGE_VERSION);
  }
}

/**
 * Get all bookmarked videos
 */
export function getBookmarkedVideos(): BookmarkedVideo[] {
  if (!isLocalStorageAvailable()) return [];

  try {
    const data = localStorage.getItem(KEYS.BOOKMARKS);
    if (!data) return [];

    const bookmarks: BookmarkedVideo[] = JSON.parse(data);
    // Sort by most recently bookmarked
    return bookmarks.sort((a, b) => b.bookmarkedAt - a.bookmarkedAt);
  } catch (error) {
    console.error('Failed to get bookmarked videos:', error);
    return [];
  }
}

/**
 * Check if a video is bookmarked
 */
export function isVideoBookmarked(videoId: number | string): boolean {
  const bookmarks = getBookmarkedVideos();
  return bookmarks.some((b) => b.id === Number(videoId) || b.documentId === videoId);
}

/**
 * Add a video to bookmarks
 */
export function addVideoBookmark(video: Omit<BookmarkedVideo, 'bookmarkedAt'>): void {
  if (!isLocalStorageAvailable()) return;

  try {
    const bookmarks = getBookmarkedVideos();

    // Check if already bookmarked
    const exists = bookmarks.some((b) => b.id === video.id);
    if (exists) {
      console.log('Video already bookmarked');
      return;
    }

    const newBookmark: BookmarkedVideo = {
      ...video,
      bookmarkedAt: Date.now(),
    };

    bookmarks.push(newBookmark);
    localStorage.setItem(KEYS.BOOKMARKS, JSON.stringify(bookmarks));
  } catch (error) {
    console.error('Failed to add video bookmark:', error);
  }
}

/**
 * Remove a video from bookmarks
 */
export function removeVideoBookmark(videoId: number | string): void {
  if (!isLocalStorageAvailable()) return;

  try {
    const bookmarks = getBookmarkedVideos();
    const filtered = bookmarks.filter(
      (b) => b.id !== Number(videoId) && b.documentId !== videoId
    );
    localStorage.setItem(KEYS.BOOKMARKS, JSON.stringify(filtered));
  } catch (error) {
    console.error('Failed to remove video bookmark:', error);
  }
}

/**
 * Toggle video bookmark
 */
export function toggleVideoBookmark(video: Omit<BookmarkedVideo, 'bookmarkedAt'>): boolean {
  const isBookmarked = isVideoBookmarked(video.id);

  if (isBookmarked) {
    removeVideoBookmark(video.id);
    return false;
  } else {
    addVideoBookmark(video);
    return true;
  }
}

/**
 * Get watch history
 */
export function getWatchHistory(): WatchHistoryEntry[] {
  if (!isLocalStorageAvailable()) return [];

  try {
    const data = localStorage.getItem(KEYS.WATCH_HISTORY);
    if (!data) return [];

    const history: WatchHistoryEntry[] = JSON.parse(data);
    // Sort by most recently watched
    return history.sort((a, b) => b.lastWatchedAt - a.lastWatchedAt);
  } catch (error) {
    console.error('Failed to get watch history:', error);
    return [];
  }
}

/**
 * Add or update watch history entry
 */
export function updateWatchHistory(video: Omit<WatchHistoryEntry, 'lastWatchedAt'> & { progress?: number }): void {
  if (!isLocalStorageAvailable()) return;

  try {
    const history = getWatchHistory();
    const existingIndex = history.findIndex((h) => h.id === video.id);

    const entry: WatchHistoryEntry = {
      ...video,
      lastWatchedAt: Date.now(),
    };

    if (existingIndex !== -1) {
      // Update existing entry
      history[existingIndex] = entry;
    } else {
      // Add new entry
      history.push(entry);
    }

    // Keep only last 100 entries
    const trimmed = history.slice(0, 100);
    localStorage.setItem(KEYS.WATCH_HISTORY, JSON.stringify(trimmed));
  } catch (error) {
    console.error('Failed to update watch history:', error);
  }
}

/**
 * Clear all watch history
 */
export function clearWatchHistory(): void {
  if (!isLocalStorageAvailable()) return;

  try {
    localStorage.removeItem(KEYS.WATCH_HISTORY);
  } catch (error) {
    console.error('Failed to clear watch history:', error);
  }
}

/**
 * Clear all bookmarks
 */
export function clearAllBookmarks(): void {
  if (!isLocalStorageAvailable()) return;

  try {
    localStorage.removeItem(KEYS.BOOKMARKS);
  } catch (error) {
    console.error('Failed to clear bookmarks:', error);
  }
}

/**
 * Save video playback progress
 */
export function saveVideoProgress(videoId: string, currentTime: number, duration: number): void {
  if (!isLocalStorageAvailable()) return;

  try {
    const allProgress = getAllVideoProgress();
    const progress: VideoProgress = {
      videoId,
      currentTime,
      duration,
      completed: currentTime >= duration * 0.9, // Consider 90% as completed
      lastUpdated: Date.now(),
    };

    allProgress[videoId] = progress;
    localStorage.setItem(KEYS.PROGRESS, JSON.stringify(allProgress));
  } catch (error) {
    console.error('Failed to save video progress:', error);
  }
}

/**
 * Get video playback progress
 */
export function getVideoProgress(videoId: string): VideoProgress | null {
  if (!isLocalStorageAvailable()) return null;

  try {
    const allProgress = getAllVideoProgress();
    return allProgress[videoId] || null;
  } catch (error) {
    console.error('Failed to get video progress:', error);
    return null;
  }
}

/**
 * Get all video progress data
 */
function getAllVideoProgress(): Record<string, VideoProgress> {
  if (!isLocalStorageAvailable()) return {};

  try {
    const data = localStorage.getItem(KEYS.PROGRESS);
    if (!data) return {};
    return JSON.parse(data);
  } catch (error) {
    console.error('Failed to get all video progress:', error);
    return {};
  }
}

/**
 * Clear video progress
 */
export function clearVideoProgress(videoId: string): void {
  if (!isLocalStorageAvailable()) return;

  try {
    const allProgress = getAllVideoProgress();
    delete allProgress[videoId];
    localStorage.setItem(KEYS.PROGRESS, JSON.stringify(allProgress));
  } catch (error) {
    console.error('Failed to clear video progress:', error);
  }
}

/**
 * Get all watched videos (completed)
 */
export function getWatchedVideos(): VideoProgress[] {
  if (!isLocalStorageAvailable()) return [];

  try {
    const allProgress = getAllVideoProgress();
    return Object.values(allProgress).filter((p) => p.completed);
  } catch (error) {
    console.error('Failed to get watched videos:', error);
    return [];
  }
}

/**
 * Mark video as complete
 */
export function markVideoComplete(videoId: string, duration: number): void {
  if (!isLocalStorageAvailable()) return;

  try {
    const allProgress = getAllVideoProgress();
    const progress: VideoProgress = {
      videoId,
      currentTime: duration,
      duration,
      completed: true,
      lastUpdated: Date.now(),
    };

    allProgress[videoId] = progress;
    localStorage.setItem(KEYS.PROGRESS, JSON.stringify(allProgress));
  } catch (error) {
    console.error('Failed to mark video as complete:', error);
  }
}

/**
 * Export all video data
 */
export function exportVideoData(): object | null {
  if (!isLocalStorageAvailable()) return null;

  try {
    return {
      bookmarks: getBookmarkedVideos(),
      watchHistory: getWatchHistory(),
      progress: getAllVideoProgress(),
      exportedAt: Date.now(),
      version: STORAGE_VERSION,
    };
  } catch (error) {
    console.error('Failed to export video data:', error);
    return null;
  }
}

/**
 * Import video data
 */
export function importVideoData(data: any): boolean {
  if (!isLocalStorageAvailable()) return false;

  try {
    if (data.bookmarks && Array.isArray(data.bookmarks)) {
      localStorage.setItem(KEYS.BOOKMARKS, JSON.stringify(data.bookmarks));
    }
    if (data.watchHistory && Array.isArray(data.watchHistory)) {
      localStorage.setItem(KEYS.WATCH_HISTORY, JSON.stringify(data.watchHistory));
    }
    if (data.progress && typeof data.progress === 'object') {
      localStorage.setItem(KEYS.PROGRESS, JSON.stringify(data.progress));
    }
    return true;
  } catch (error) {
    console.error('Failed to import video data:', error);
    return false;
  }
}

/**
 * Get storage statistics
 */
export function getVideoStorageStats(): {
  bookmarksCount: number;
  historyCount: number;
  progressCount: number;
  completedCount: number;
} {
  const allProgress = getAllVideoProgress();
  const completedVideos = Object.values(allProgress).filter((p) => p.completed);

  return {
    bookmarksCount: getBookmarkedVideos().length,
    historyCount: getWatchHistory().length,
    progressCount: Object.keys(allProgress).length,
    completedCount: completedVideos.length,
  };
}

/**
 * Initialize storage on module load
 */
if (typeof window !== 'undefined') {
  initializeStorage();
}

export default {
  getBookmarkedVideos,
  isVideoBookmarked,
  addVideoBookmark,
  removeVideoBookmark,
  toggleVideoBookmark,
  getWatchHistory,
  updateWatchHistory,
  clearWatchHistory,
  clearAllBookmarks,
  saveVideoProgress,
  getVideoProgress,
  clearVideoProgress,
  getWatchedVideos,
  markVideoComplete,
  exportVideoData,
  importVideoData,
  getVideoStorageStats,
};
