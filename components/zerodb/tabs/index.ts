// ZeroDB Tab Components
export { DatabaseManagement } from './database-management';
export { VectorSearch } from './vector-search';
export { AnalyticsMonitoring } from './analytics-monitoring';

// Lazy imports for remaining components
export const StreamingEvents = React.lazy(() => import('./streaming-events').then(m => ({ default: m.StreamingEvents })));
export const ObjectStorage = React.lazy(() => import('./object-storage').then(m => ({ default: m.ObjectStorage })));
export const AgentMemory = React.lazy(() => import('./agent-memory').then(m => ({ default: m.AgentMemory })));
export const SecurityAccess = React.lazy(() => import('./security-access').then(m => ({ default: m.SecurityAccess })));
export const RLHFTraining = React.lazy(() => import('./rlhf-training').then(m => ({ default: m.RLHFTraining })));

import React from 'react';