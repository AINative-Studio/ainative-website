/**
 * LogViewer Component Usage Example
 * Issue #1098: Agent Swarm Monitoring Dashboard
 *
 * This file demonstrates how to integrate the LogViewer component
 * into your Agent Swarm Monitoring Dashboard.
 */

import React from 'react';
import LogViewer from '@/components/LogViewer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * Example 1: Basic Usage
 * Simply pass the projectId to display logs for that project
 */
export function BasicLogViewerExample() {
  return (
    <div className="p-6">
      <LogViewer projectId="abc-123-def-456" />
    </div>
  );
}

/**
 * Example 2: Within a Card
 * Wrapped in a card for better UI presentation
 */
export function CardLogViewerExample() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Agent Swarm Logs</CardTitle>
        <CardDescription>
          Real-time logs from all agents working on your project
        </CardDescription>
      </CardHeader>
      <CardContent>
        <LogViewer projectId="abc-123-def-456" />
      </CardContent>
    </Card>
  );
}

/**
 * Example 3: Full Dashboard Integration
 * Complete monitoring dashboard with logs and other metrics
 */
export function DashboardWithLogsExample() {
  const [selectedProjectId, setSelectedProjectId] = React.useState<string>('abc-123-def-456');

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Project Selector */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Agent Swarm Monitoring</h1>
        {/* Add project selector here */}
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Active Agents</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">5</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Tasks Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">23</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">67%</p>
          </CardContent>
        </Card>
      </div>

      {/* Logs Section */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Real-Time Logs</CardTitle>
          <CardDescription>
            Live updates from all agents in the swarm
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LogViewer projectId={selectedProjectId} />
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Example 4: With WebSocket Updates
 * For real-time log streaming via WebSocket
 */
export function LogViewerWithWebSocketExample() {
  const projectId = 'abc-123-def-456';

  React.useEffect(() => {
    // WebSocket connection for real-time updates
    const ws = new WebSocket(`wss://api.ainative.studio/ws/agent-swarms/${projectId}/logs`);

    ws.onmessage = (event) => {
      const newLog = JSON.parse(event.data);
      console.log('New log received:', newLog);
      // The LogViewer component automatically refetches every 5 seconds
      // So WebSocket updates will be picked up on the next refetch
    };

    return () => {
      ws.close();
    };
  }, [projectId]);

  return (
    <div className="p-6">
      <LogViewer projectId={projectId} />
    </div>
  );
}

/**
 * Key Features:
 *
 * 1. Auto-scrolling: Automatically scrolls to the latest log entries
 * 2. Agent Filter: Dropdown to filter logs by specific agent
 * 3. Level Filter: Show only info/warning/error logs
 * 4. Search: Text search across all log messages
 * 5. Color Coding: Visual distinction between log levels
 * 6. Auto-refresh: Refetches logs every 5 seconds
 * 7. Responsive: Works on mobile, tablet, and desktop
 *
 * API Endpoint:
 * GET /api/v1/admin/agent-swarms/projects/{projectId}/logs?limit=100
 *
 * Response Format:
 * {
 *   "logs": [
 *     {
 *       "timestamp": "2026-02-06T17:45:23Z",
 *       "level": "info",
 *       "agent": "Requirements Analyst",
 *       "emoji": "📋",
 *       "message": "Analyzing user requirements",
 *       "step_name": "requirements_analysis"
 *     }
 *   ]
 * }
 */
