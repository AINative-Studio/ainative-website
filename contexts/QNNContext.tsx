'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { TrainingJob } from '@/types/qnn.types';

interface Repository {
  id: string;
  name: string;
  full_name: string;
  description?: string;
  language?: string;
  stars?: number;
  updated_at?: string;
}

interface Model {
  id: string;
  name: string;
  status?: string;
}

type ViewMode = 'grid' | 'list';

interface QNNContextType {
  isLoading: boolean;
  error: Error | null;
  // Single selection
  selectedRepository: Repository | null;
  setSelectedRepository: React.Dispatch<React.SetStateAction<Repository | null>>;
  // Multi-selection
  selectedRepositories: Repository[];
  setSelectedRepositories: React.Dispatch<React.SetStateAction<Repository[]>>;
  toggleRepositorySelection: (repo: Repository) => void;
  clearRepositorySelection: () => void;
  isRepositorySelected: (repoId: string) => boolean;
  savedRepositories: Repository[];
  setSavedRepositories: React.Dispatch<React.SetStateAction<Repository[]>>;
  // Model selection
  selectedModel: Model | null;
  setSelectedModel: React.Dispatch<React.SetStateAction<Model | null>>;
  // Training state
  activeTraining: TrainingJob | null;
  setActiveTraining: React.Dispatch<React.SetStateAction<TrainingJob | null>>;
  // Polling
  isPollingEnabled: boolean;
  setIsPollingEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  // View mode
  viewMode: ViewMode;
  setViewMode: React.Dispatch<React.SetStateAction<ViewMode>>;
}

const QNNContext = createContext<QNNContextType | undefined>(undefined);

export function QNNProvider({ children }: { children: ReactNode }) {
  // Single selection
  const [selectedRepository, setSelectedRepository] = useState<Repository | null>(null);
  // Multi-selection
  const [selectedRepositories, setSelectedRepositories] = useState<Repository[]>([]);
  const [savedRepositories, setSavedRepositories] = useState<Repository[]>([]);
  // Model selection
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);
  // Training state
  const [activeTraining, setActiveTraining] = useState<TrainingJob | null>(null);
  // Polling
  const [isPollingEnabled, setIsPollingEnabled] = useState(false);
  // View mode
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  const toggleRepositorySelection = useCallback((repo: Repository) => {
    setSelectedRepositories(prev => {
      const exists = prev.some(r => r.id === repo.id);
      if (exists) {
        return prev.filter(r => r.id !== repo.id);
      } else {
        return [...prev, repo];
      }
    });
  }, []);

  const clearRepositorySelection = useCallback(() => {
    setSelectedRepositories([]);
  }, []);

  const isRepositorySelected = useCallback((repoId: string) => {
    return selectedRepositories.some(r => r.id === repoId);
  }, [selectedRepositories]);

  return (
    <QNNContext.Provider value={{
      isLoading: false,
      error: null,
      selectedRepository,
      setSelectedRepository,
      selectedRepositories,
      setSelectedRepositories,
      toggleRepositorySelection,
      clearRepositorySelection,
      isRepositorySelected,
      savedRepositories,
      setSavedRepositories,
      selectedModel,
      setSelectedModel,
      activeTraining,
      setActiveTraining,
      isPollingEnabled,
      setIsPollingEnabled,
      viewMode,
      setViewMode,
    }}>
      {children}
    </QNNContext.Provider>
  );
}

export function useQNN() {
  const context = useContext(QNNContext);
  if (context === undefined) {
    throw new Error('useQNN must be used within a QNNProvider');
  }
  return context;
}

// Alias for backwards compatibility
export const useQNNContext = useQNN;

// Helper hook to check if training is active
export function useIsTrainingActive() {
  const context = useContext(QNNContext);
  const status = context?.activeTraining?.status;
  return context?.activeTraining !== null && (
    status === 'training' || status === 'initializing' || status === 'validating' || status === 'queued'
  );
}

// Helper hook to clear all QNN state
export function useClearQNNState() {
  const context = useContext(QNNContext);
  return useCallback(() => {
    context?.setSelectedRepository(null);
    context?.setSelectedRepositories([]);
    context?.setSelectedModel(null);
    context?.setActiveTraining(null);
  }, [context]);
}
