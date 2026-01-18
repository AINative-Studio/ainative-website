'use client';

import * as React from 'react';
import type { OperationProgress } from '@/types/progress';

interface ProgressContextValue {
  operations: Map<string, OperationProgress>;
  updateProgress: (operationId: string, progress: OperationProgress) => void;
  removeOperation: (operationId: string) => void;
  getProgress: (operationId: string) => OperationProgress | undefined;
}

const ProgressContext = React.createContext<ProgressContextValue | undefined>(undefined);

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const [operations] = React.useState(() => new Map<string, OperationProgress>());

  const updateProgress = React.useCallback((operationId: string, progress: OperationProgress) => {
    operations.set(operationId, progress);
  }, [operations]);

  const removeOperation = React.useCallback((operationId: string) => {
    operations.delete(operationId);
  }, [operations]);

  const getProgress = React.useCallback((operationId: string) => {
    return operations.get(operationId);
  }, [operations]);

  const value = React.useMemo(
    () => ({
      operations,
      updateProgress,
      removeOperation,
      getProgress,
    }),
    [operations, updateProgress, removeOperation, getProgress]
  );

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress() {
  const context = React.useContext(ProgressContext);
  if (!context) {
    throw new Error('useProgress must be used within ProgressProvider');
  }
  return context;
}
