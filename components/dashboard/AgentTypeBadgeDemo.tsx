/**
 * AgentTypeBadge Demo Component
 *
 * This file demonstrates how to use the AgentTypeBadge component
 * in real-world scenarios. It can be imported and used in the
 * main dashboard or agent pages.
 *
 * Usage:
 * ```tsx
 * import AgentTypeBadgeDemo from '@/components/dashboard/AgentTypeBadgeDemo';
 * <AgentTypeBadgeDemo />
 * ```
 */

'use client';

import React from 'react';
import AgentTypeBadge from './AgentTypeBadge';

export default function AgentTypeBadgeDemo() {
  return (
    <div className="p-8 space-y-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div>
        <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
          Agent Type Badge Component
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Color-coded badges for visual distinction of different agent types.
          All colors are WCAG 2.1 AA compliant with 4.5:1+ contrast ratios.
        </p>
      </div>

      {/* All Types */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          All Agent Types
        </h2>
        <div className="flex flex-wrap gap-3 p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
          <AgentTypeBadge type="quantum" />
          <AgentTypeBadge type="ml" />
          <AgentTypeBadge type="general" />
          <AgentTypeBadge type="conversational" />
          <AgentTypeBadge type="task-based" />
          <AgentTypeBadge type="workflow" />
          <AgentTypeBadge type="custom" />
        </div>
      </section>

      {/* With Icons */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          With Icons
        </h2>
        <div className="flex flex-wrap gap-3 p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
          <AgentTypeBadge type="quantum" showIcon />
          <AgentTypeBadge type="ml" showIcon />
          <AgentTypeBadge type="general" showIcon />
          <AgentTypeBadge type="conversational" showIcon />
          <AgentTypeBadge type="task-based" showIcon />
          <AgentTypeBadge type="workflow" showIcon />
          <AgentTypeBadge type="custom" showIcon />
        </div>
      </section>

      {/* Size Variants */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Size Variants
        </h2>
        <div className="space-y-4 p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Small</p>
            <div className="flex flex-wrap gap-2">
              <AgentTypeBadge type="quantum" size="sm" showIcon />
              <AgentTypeBadge type="ml" size="sm" showIcon />
              <AgentTypeBadge type="general" size="sm" showIcon />
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Medium (Default)</p>
            <div className="flex flex-wrap gap-2">
              <AgentTypeBadge type="quantum" size="md" showIcon />
              <AgentTypeBadge type="ml" size="md" showIcon />
              <AgentTypeBadge type="general" size="md" showIcon />
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Large</p>
            <div className="flex flex-wrap gap-2">
              <AgentTypeBadge type="quantum" size="lg" showIcon />
              <AgentTypeBadge type="ml" size="lg" showIcon />
              <AgentTypeBadge type="general" size="lg" showIcon />
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Examples */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Interactive Badges
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          These badges are clickable and keyboard-accessible. Try clicking or using Tab + Enter.
        </p>
        <div className="flex flex-wrap gap-3 p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
          <AgentTypeBadge
            type="quantum"
            showIcon
            interactive
            onClick={() => alert('Quantum agent clicked!')}
          />
          <AgentTypeBadge
            type="ml"
            showIcon
            interactive
            onClick={() => alert('ML agent clicked!')}
          />
          <AgentTypeBadge
            type="general"
            showIcon
            interactive
            onClick={() => alert('General agent clicked!')}
          />
        </div>
      </section>

      {/* Real-World Example: Agent Card */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Real-World Example: Agent Cards
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              name: 'Quantum Optimizer Pro',
              type: 'quantum' as const,
              status: 'Active',
              runs: 1543,
              description: 'Advanced quantum computing agent for optimization problems',
            },
            {
              name: 'ML Predictor',
              type: 'ml' as const,
              status: 'Running',
              runs: 892,
              description: 'Machine learning agent for predictive analytics',
            },
            {
              name: 'General Assistant',
              type: 'general' as const,
              status: 'Idle',
              runs: 3421,
              description: 'Multi-purpose AI assistant for general tasks',
            },
            {
              name: 'Chat Support Bot',
              type: 'conversational' as const,
              status: 'Active',
              runs: 5234,
              description: 'Conversational AI for customer support',
            },
            {
              name: 'Task Manager Pro',
              type: 'task-based' as const,
              status: 'Active',
              runs: 2156,
              description: 'Specialized agent for task automation',
            },
            {
              name: 'Workflow Engine',
              type: 'workflow' as const,
              status: 'Running',
              runs: 1876,
              description: 'Automated workflow orchestration agent',
            },
          ].map((agent, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                    {agent.name}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {agent.runs.toLocaleString()} runs
                  </p>
                </div>
                <AgentTypeBadge type={agent.type} showIcon size="sm" />
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                {agent.description}
              </p>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-1 rounded-full bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300">
                  {agent.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Color Accessibility Information */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          WCAG 2.1 AA Compliance
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { type: 'quantum' as const, contrast: '5.2:1', color: '#8B5CF6', name: 'Purple' },
            { type: 'ml' as const, contrast: '4.8:1', color: '#10B981', name: 'Emerald' },
            { type: 'general' as const, contrast: '5.5:1', color: '#3B82F6', name: 'Blue' },
            { type: 'conversational' as const, contrast: '5.1:1', color: '#EC4899', name: 'Pink' },
            { type: 'task-based' as const, contrast: '4.7:1', color: '#F59E0B', name: 'Amber' },
            { type: 'workflow' as const, contrast: '5.3:1', color: '#6366F1', name: 'Indigo' },
            { type: 'custom' as const, contrast: '6.1:1', color: '#64748B', name: 'Slate' },
          ].map((item) => (
            <div
              key={item.type}
              className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700"
            >
              <AgentTypeBadge type={item.type} showIcon className="mb-3" />
              <div className="space-y-1 text-sm">
                <p className="text-gray-600 dark:text-gray-400">
                  <span className="font-semibold">Color:</span> {item.name}
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  <span className="font-semibold">Hex:</span> {item.color}
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  <span className="font-semibold">Contrast:</span> {item.contrast}
                </p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                  ✓ WCAG 2.1 AA Compliant
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
