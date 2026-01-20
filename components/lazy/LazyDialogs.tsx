'use client';

/**
 * Lazy-loaded dialog and modal components
 * These are often not needed on initial page load
 */

import dynamic from 'next/dynamic';

// Dynamic imports for heavy modal components
export const LazyAgentDetailModal = dynamic(
  () => import('@/components/agent-swarm/AgentDetailModal'),
  { ssr: false }
);

export const LazySprintPlanReview = dynamic(
  () => import('@/components/agent-swarm/SprintPlanReview'),
  { ssr: false }
);

export const LazyDataModelReview = dynamic(
  () => import('@/components/agent-swarm/DataModelReview'),
  { ssr: false }
);

export const LazyBacklogReview = dynamic(
  () => import('@/components/agent-swarm/BacklogReview'),
  { ssr: false }
);

export const LazySwarmLaunchConfirmation = dynamic(
  () => import('@/components/agent-swarm/SwarmLaunchConfirmation'),
  { ssr: false }
);

export const LazyAgentSwarmTerminal = dynamic(
  () => import('@/components/agent-swarm/AgentSwarmTerminal'),
  { ssr: false }
);
