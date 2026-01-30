/**
 * Tutorial Storage Library
 * LocalStorage wrapper for tutorial progress, notes, and bookmarks
 * Features: CRUD operations, export/import, migration support
 */

import { TutorialProgress, Note, Bookmark } from '@/types/tutorial';

const STORAGE_PREFIX = 'ainative_tutorial_';
const STORAGE_VERSION = '1.0';

/**
 * Storage keys
 */
const KEYS = {
    PROGRESS: (tutorialId: string) => `${STORAGE_PREFIX}progress_${tutorialId}`,
    NOTES: (tutorialId: string) => `${STORAGE_PREFIX}notes_${tutorialId}`,
    BOOKMARKS: (tutorialId: string) => `${STORAGE_PREFIX}bookmarks_${tutorialId}`,
    VERSION: `${STORAGE_PREFIX}version`,
};

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
        console.warn('localStorage is not available. Tutorial progress will not be saved.');
        return;
    }

    const currentVersion = localStorage.getItem(KEYS.VERSION);
    if (!currentVersion) {
        localStorage.setItem(KEYS.VERSION, STORAGE_VERSION);
    }

    // Handle version migrations here if needed
    if (currentVersion && currentVersion !== STORAGE_VERSION) {
        console.log(`Migrating storage from ${currentVersion} to ${STORAGE_VERSION}`);
        // Add migration logic here
        localStorage.setItem(KEYS.VERSION, STORAGE_VERSION);
    }
}

/**
 * Get tutorial progress
 */
export function getTutorialProgress(tutorialId: string): TutorialProgress | null {
    if (!isLocalStorageAvailable()) return null;

    try {
        const data = localStorage.getItem(KEYS.PROGRESS(tutorialId));
        if (!data) return null;

        const progress: TutorialProgress = JSON.parse(data);
        return progress;
    } catch (error) {
        console.error('Failed to get tutorial progress:', error);
        return null;
    }
}

/**
 * Save tutorial progress
 */
export function saveTutorialProgress(progress: TutorialProgress): void {
    if (!isLocalStorageAvailable() || !progress.videoId) return;

    try {
        const data = JSON.stringify({
            ...progress,
            lastUpdated: Date.now(),
        });
        localStorage.setItem(KEYS.PROGRESS(progress.videoId), data);
    } catch (error) {
        console.error('Failed to save tutorial progress:', error);
    }
}

/**
 * Update specific progress fields
 */
export function updateTutorialProgress(
    tutorialId: string,
    updates: Partial<TutorialProgress>
): void {
    const current = getTutorialProgress(tutorialId);
    if (!current) return;

    saveTutorialProgress({
        ...current,
        ...updates,
    });
}

/**
 * Get notes for a tutorial
 */
export function getTutorialNotes(tutorialId: string): Note[] {
    if (!isLocalStorageAvailable()) return [];

    try {
        const data = localStorage.getItem(KEYS.NOTES(tutorialId));
        if (!data) return [];

        const notes: Note[] = JSON.parse(data);
        return notes;
    } catch (error) {
        console.error('Failed to get tutorial notes:', error);
        return [];
    }
}

/**
 * Save notes for a tutorial
 */
export function saveTutorialNotes(tutorialId: string, notes: Note[]): void {
    if (!isLocalStorageAvailable()) return;

    try {
        const data = JSON.stringify(notes);
        localStorage.setItem(KEYS.NOTES(tutorialId), data);
    } catch (error) {
        console.error('Failed to save tutorial notes:', error);
    }
}

/**
 * Add a note
 */
export function addNote(tutorialId: string, timestamp: number, content: string): Note {
    const notes = getTutorialNotes(tutorialId);

    const newNote: Note = {
        id: `note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp,
        content,
        createdAt: Date.now(),
    };

    notes.push(newNote);
    saveTutorialNotes(tutorialId, notes);

    return newNote;
}

/**
 * Update a note
 */
export function updateNote(tutorialId: string, noteId: string, content: string): void {
    const notes = getTutorialNotes(tutorialId);
    const index = notes.findIndex((n) => n.id === noteId);

    if (index !== -1) {
        notes[index] = {
            ...notes[index],
            content,
        };
        saveTutorialNotes(tutorialId, notes);
    }
}

/**
 * Delete a note
 */
export function deleteNote(tutorialId: string, noteId: string): void {
    const notes = getTutorialNotes(tutorialId);
    const filtered = notes.filter((n) => n.id !== noteId);
    saveTutorialNotes(tutorialId, filtered);
}

/**
 * Get bookmarks for a tutorial
 */
export function getTutorialBookmarks(tutorialId: string): Bookmark[] {
    if (!isLocalStorageAvailable()) return [];

    try {
        const data = localStorage.getItem(KEYS.BOOKMARKS(tutorialId));
        if (!data) return [];

        const bookmarks: Bookmark[] = JSON.parse(data);
        return bookmarks;
    } catch (error) {
        console.error('Failed to get tutorial bookmarks:', error);
        return [];
    }
}

/**
 * Save bookmarks for a tutorial
 */
export function saveTutorialBookmarks(tutorialId: string, bookmarks: Bookmark[]): void {
    if (!isLocalStorageAvailable()) return;

    try {
        const data = JSON.stringify(bookmarks);
        localStorage.setItem(KEYS.BOOKMARKS(tutorialId), data);
    } catch (error) {
        console.error('Failed to save tutorial bookmarks:', error);
    }
}

/**
 * Add a bookmark
 */
export function addBookmark(tutorialId: string, timestamp: number, title: string): Bookmark {
    const bookmarks = getTutorialBookmarks(tutorialId);

    const newBookmark: Bookmark = {
        id: `bookmark_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp,
        title,
        createdAt: Date.now(),
    };

    bookmarks.push(newBookmark);
    saveTutorialBookmarks(tutorialId, bookmarks);

    return newBookmark;
}

/**
 * Delete a bookmark
 */
export function deleteBookmark(tutorialId: string, bookmarkId: string): void {
    const bookmarks = getTutorialBookmarks(tutorialId);
    const filtered = bookmarks.filter((b) => b.id !== bookmarkId);
    saveTutorialBookmarks(tutorialId, filtered);
}

/**
 * Clear tutorial progress (alias for clearTutorialData)
 */
export function clearTutorialProgress(tutorialId: string): void {
    clearTutorialData(tutorialId);
}

/**
 * Clear all tutorial data
 */
export function clearTutorialData(tutorialId: string): void {
    if (!isLocalStorageAvailable()) return;

    try {
        localStorage.removeItem(KEYS.PROGRESS(tutorialId));
        localStorage.removeItem(KEYS.NOTES(tutorialId));
        localStorage.removeItem(KEYS.BOOKMARKS(tutorialId));
    } catch (error) {
        console.error('Failed to clear tutorial data:', error);
    }
}

/**
 * Mark tutorial as complete
 */
export function markTutorialComplete(tutorialId: string): void {
    const progress = getTutorialProgress(tutorialId);

    if (!progress) {
        // Create new progress if doesn't exist
        const newProgress: TutorialProgress = {
            tutorialId,
            userId: null,
            completionPercentage: 100,
            chaptersCompleted: 0,
            totalChapters: 0,
            chapterProgress: [],
            quizScores: [],
            certificateEligible: true,
            certificateEarned: true,
            totalWatchTime: 0,
            lastWatchedAt: null,
            videoId: tutorialId,
            completedChapters: [],
            currentChapter: null,
            lastWatchedTime: 0,
            notes: [],
            bookmarks: [],
            lastUpdated: Date.now(),
        };
        saveTutorialProgress(newProgress);
    } else {
        // Update existing progress
        updateTutorialProgress(tutorialId, {
            completionPercentage: 100,
            certificateEarned: true,
        });
    }
}

/**
 * Get all completed tutorials
 */
export function getCompletedTutorials(): string[] {
    if (!isLocalStorageAvailable()) return [];

    try {
        const tutorialIds = getAllTutorialIds();
        const completedIds: string[] = [];

        tutorialIds.forEach((id) => {
            const progress = getTutorialProgress(id);
            if (progress && progress.completionPercentage === 100) {
                completedIds.push(id);
            }
        });

        return completedIds;
    } catch (error) {
        console.error('Failed to get completed tutorials:', error);
        return [];
    }
}

/**
 * Export all tutorial data
 */
export function exportTutorialData(tutorialId: string): object | null {
    if (!isLocalStorageAvailable()) return null;

    try {
        return {
            progress: getTutorialProgress(tutorialId),
            notes: getTutorialNotes(tutorialId),
            bookmarks: getTutorialBookmarks(tutorialId),
            exportedAt: Date.now(),
            version: STORAGE_VERSION,
        };
    } catch (error) {
        console.error('Failed to export tutorial data:', error);
        return null;
    }
}

/**
 * Import tutorial data
 */
export function importTutorialData(
    tutorialId: string,
    data: {
        progress?: TutorialProgress;
        notes?: Note[];
        bookmarks?: Bookmark[];
        exportedAt?: number;
        version?: string;
    }
): boolean {
    if (!isLocalStorageAvailable()) return false;

    try {
        if (data.progress) {
            saveTutorialProgress({ ...data.progress, videoId: tutorialId });
        }
        if (data.notes) {
            saveTutorialNotes(tutorialId, data.notes);
        }
        if (data.bookmarks) {
            saveTutorialBookmarks(tutorialId, data.bookmarks);
        }
        return true;
    } catch (error) {
        console.error('Failed to import tutorial data:', error);
        return false;
    }
}

/**
 * Get all tutorial IDs with saved data
 */
export function getAllTutorialIds(): string[] {
    if (!isLocalStorageAvailable()) return [];

    try {
        const keys = Object.keys(localStorage);
        const tutorialIds = new Set<string>();

        keys.forEach((key) => {
            if (key.startsWith(STORAGE_PREFIX)) {
                const match = key.match(/^ainative_tutorial_(progress|notes|bookmarks)_(.+)$/);
                if (match && match[2]) {
                    tutorialIds.add(match[2]);
                }
            }
        });

        return Array.from(tutorialIds);
    } catch (error) {
        console.error('Failed to get tutorial IDs:', error);
        return [];
    }
}

/**
 * Get storage usage statistics
 */
export function getStorageStats(): {
    used: number;
    total: number;
    percentage: number;
} | null {
    if (!isLocalStorageAvailable()) return null;

    try {
        let totalSize = 0;
        for (const key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                totalSize += localStorage[key].length + key.length;
            }
        }

        // LocalStorage typically has 5-10MB limit (5MB is common)
        const totalLimit = 5 * 1024 * 1024; // 5MB in bytes

        return {
            used: totalSize,
            total: totalLimit,
            percentage: (totalSize / totalLimit) * 100,
        };
    } catch (error) {
        console.error('Failed to get storage stats:', error);
        return null;
    }
}

/**
 * Initialize storage on module load
 */
if (typeof window !== 'undefined') {
    initializeStorage();
}

const tutorialStorageUtils = {
    getTutorialProgress,
    saveTutorialProgress,
    updateTutorialProgress,
    clearTutorialProgress,
    markTutorialComplete,
    getCompletedTutorials,
    getTutorialNotes,
    saveTutorialNotes,
    addNote,
    updateNote,
    deleteNote,
    getTutorialBookmarks,
    saveTutorialBookmarks,
    addBookmark,
    deleteBookmark,
    clearTutorialData,
    exportTutorialData,
    importTutorialData,
    getAllTutorialIds,
    getStorageStats,
};

export default tutorialStorageUtils;
