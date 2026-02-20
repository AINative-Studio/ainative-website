/**
 * ControlPanel Component Usage Example
 *
 * This file demonstrates how to use the ControlPanel component
 * in the Agent Swarm Monitoring Dashboard.
 *
 * Refs #1098
 */

import React, { useState } from 'react';
import { ControlPanel } from '@/components/agent-swarm';

/**
 * Example 1: Basic Usage
 * Simple integration with local state management
 */
export function BasicControlPanelExample() {
  const [projectStatus, setProjectStatus] = useState<
    'active' | 'completed' | 'error' | 'stopped'
  >('active');

  return (
    <div className="p-4">
      <h2 className="mb-4 text-xl font-bold">Agent Swarm Control Panel</h2>
      <ControlPanel
        projectId="project-123"
        status={projectStatus}
        onStatusChange={(newStatus) => {
          setProjectStatus(newStatus as any);
          console.log('Project status changed to:', newStatus);
        }}
      />
    </div>
  );
}

/**
 * Example 2: Integration with Dashboard
 * Shows how to integrate with a larger dashboard component
 */
export function DashboardWithControlPanel() {
  const [projectId] = useState('project-abc-123');
  const [status, setStatus] = useState<
    'active' | 'completed' | 'error' | 'stopped'
  >('active');

  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus as any);

    // Trigger side effects like refetching data
    console.log('Refetching project data after status change...');

    // Update analytics
    console.log('Tracking status change event:', {
      projectId,
      oldStatus: status,
      newStatus,
      timestamp: new Date().toISOString(),
    });
  };

  return (
    <div className="space-y-6 p-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Other dashboard cards */}
        <div className="rounded-lg bg-white p-4 shadow-md">
          <h3 className="font-semibold">Project Info</h3>
          <p className="text-sm text-gray-600">Project ID: {projectId}</p>
        </div>

        {/* Control Panel */}
        <div className="lg:col-span-2">
          <ControlPanel
            projectId={projectId}
            status={status}
            onStatusChange={handleStatusChange}
          />
        </div>
      </div>
    </div>
  );
}

/**
 * Example 3: Without Status Change Callback
 * Minimal usage when you don't need to track status changes locally
 */
export function MinimalControlPanelExample() {
  return (
    <ControlPanel
      projectId="project-xyz-789"
      status="active"
      // onStatusChange is optional
    />
  );
}

/**
 * Example 4: Different Status States
 * Shows all possible status configurations
 */
export function AllStatusStatesExample() {
  return (
    <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2">
      <div>
        <h3 className="mb-2 font-semibold">Active Project</h3>
        <ControlPanel projectId="active-project" status="active" />
      </div>

      <div>
        <h3 className="mb-2 font-semibold">Stopped Project</h3>
        <ControlPanel projectId="stopped-project" status="stopped" />
      </div>

      <div>
        <h3 className="mb-2 font-semibold">Completed Project</h3>
        <ControlPanel projectId="completed-project" status="completed" />
      </div>

      <div>
        <h3 className="mb-2 font-semibold">Error State</h3>
        <ControlPanel projectId="error-project" status="error" />
      </div>
    </div>
  );
}

/**
 * Example 5: Integration with API/SWR
 * Shows how to use with data fetching libraries
 */
export function ControlPanelWithSWR() {
  // This example assumes you're using SWR or similar
  // const { data: project, mutate } = useSWR(`/api/projects/${projectId}`);

  const projectId = 'project-123';
  const status = 'active'; // This would come from your API

  const handleStatusChange = async (newStatus: string) => {
    // Optimistically update UI
    console.log('Updating to:', newStatus);

    // Revalidate data from server
    // await mutate();
  };

  return (
    <ControlPanel
      projectId={projectId}
      status={status as any}
      onStatusChange={handleStatusChange}
    />
  );
}
