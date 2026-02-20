/**
 * @jest-environment jsdom
 *
 * Issue #1098: Agent Swarm Monitoring Dashboard - LogViewer Component Tests
 * Refs #1098
 */

import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import LogViewer from '@/components/LogViewer';
import '@testing-library/jest-dom';

global.fetch = jest.fn();

const createTestQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: Infinity,
      },
      mutations: {
        retry: false,
      },
    },
  });
};

const createWrapper = () => {
  const queryClient = createTestQueryClient();
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  Wrapper.displayName = 'QueryClientWrapper';
  return Wrapper;
};

const mockLogs = [
  {
    timestamp: '2026-02-06T17:45:23Z',
    level: 'info' as const,
    agent: 'Requirements Analyst',
    emoji: '📋',
    message: 'Analyzing user requirements',
    step_name: 'requirements_analysis'
  },
  {
    timestamp: '2026-02-06T17:45:24Z',
    level: 'warning' as const,
    agent: 'Architect',
    emoji: '🏗️',
    message: 'Database schema complexity detected',
    step_name: 'architecture'
  },
  {
    timestamp: '2026-02-06T17:45:25Z',
    level: 'error' as const,
    agent: 'Frontend Developer',
    emoji: '⚛️',
    message: 'Component dependency conflict',
    step_name: 'frontend_dev'
  },
  {
    timestamp: '2026-02-06T17:45:26Z',
    level: 'info' as const,
    agent: 'Backend Developer',
    emoji: '🔧',
    message: 'API endpoint created successfully',
    step_name: 'backend_dev'
  },
  {
    timestamp: '2026-02-06T17:45:27Z',
    level: 'info' as const,
    agent: 'Requirements Analyst',
    emoji: '📋',
    message: 'Requirements validation complete',
    step_name: 'requirements_analysis'
  }
];

describe('LogViewer Component - Issue #1098', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ logs: mockLogs })
    });

    Element.prototype.scrollIntoView = jest.fn();
    HTMLElement.prototype.hasPointerCapture = jest.fn();
    HTMLElement.prototype.setPointerCapture = jest.fn();
    HTMLElement.prototype.releasePointerCapture = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Fetching and displaying logs', () => {
    it('should fetch and display logs from API', async () => {
      render(<LogViewer projectId="test-project-123" />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('Analyzing user requirements')).toBeInTheDocument();
        expect(screen.getByText('Database schema complexity detected')).toBeInTheDocument();
        expect(screen.getByText('Component dependency conflict')).toBeInTheDocument();
        expect(screen.getByText('API endpoint created successfully')).toBeInTheDocument();
      });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/admin/agent-swarms/projects/test-project-123/logs?limit=100'),
        expect.any(Object)
      );
    });

    it('should display emoji and agent name for each log entry', async () => {
      render(<LogViewer projectId="test-project-123" />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('Analyzing user requirements')).toBeInTheDocument();
      });

      const emojis = screen.getAllByText(/📋|🏗️|⚛️|🔧/);
      expect(emojis.length).toBeGreaterThan(0);

      const agentLabels = screen.getAllByText('Requirements Analyst:');
      expect(agentLabels.length).toBeGreaterThan(0);

      expect(screen.getByText('Architect:')).toBeInTheDocument();
    });
  });

  describe('Filtering logs by agent', () => {
    it('should filter logs by agent selection', async () => {
      const user = userEvent.setup();
      render(<LogViewer projectId="test-project-123" />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('Analyzing user requirements')).toBeInTheDocument();
      });

      const agentFilter = screen.getByRole('combobox', { name: /filter.*agent/i });
      await user.click(agentFilter);

      await waitFor(() => {
        const option = screen.getByRole('option', { name: /requirements analyst/i });
        expect(option).toBeInTheDocument();
      });

      const option = screen.getByRole('option', { name: /requirements analyst/i });
      await user.click(option);

      await waitFor(() => {
        expect(screen.getByText('Requirements validation complete')).toBeInTheDocument();
        expect(screen.queryByText('Database schema complexity detected')).not.toBeInTheDocument();
        expect(screen.queryByText('Component dependency conflict')).not.toBeInTheDocument();
      });
    });
  });

  describe('Filtering logs by level', () => {
    it('should filter logs by level selection', async () => {
      const user = userEvent.setup();
      render(<LogViewer projectId="test-project-123" />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('Analyzing user requirements')).toBeInTheDocument();
      });

      const levelFilter = screen.getByRole('combobox', { name: /level/i });
      await user.click(levelFilter);

      await waitFor(() => {
        const errorOption = screen.getByRole('option', { name: /^error$/i });
        expect(errorOption).toBeInTheDocument();
      });

      const errorOption = screen.getByRole('option', { name: /^error$/i });
      await user.click(errorOption);

      await waitFor(() => {
        expect(screen.getByText('Component dependency conflict')).toBeInTheDocument();
        expect(screen.queryByText('Analyzing user requirements')).not.toBeInTheDocument();
        expect(screen.queryByText('Database schema complexity detected')).not.toBeInTheDocument();
      });
    });
  });

  describe('Search functionality', () => {
    it('should search and filter logs by message content', async () => {
      const user = userEvent.setup();
      render(<LogViewer projectId="test-project-123" />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('Analyzing user requirements')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/search logs/i);
      await user.type(searchInput, 'requirements');

      await waitFor(() => {
        expect(screen.getByText('Analyzing user requirements')).toBeInTheDocument();
        expect(screen.getByText('Requirements validation complete')).toBeInTheDocument();
        expect(screen.queryByText('Database schema complexity detected')).not.toBeInTheDocument();
        expect(screen.queryByText('Component dependency conflict')).not.toBeInTheDocument();
      });
    });
  });

  describe('Color coding by level', () => {
    it('should color code logs by level correctly', async () => {
      render(<LogViewer projectId="test-project-123" />, { wrapper: createWrapper() });

      await waitFor(() => {
        const logs = screen.getAllByTestId(/^log-entry-/);
        expect(logs.length).toBeGreaterThan(0);
      });

      const errorLog = screen.getByText('Component dependency conflict').closest('[data-testid^="log-entry-"]');
      const warningLog = screen.getByText('Database schema complexity detected').closest('[data-testid^="log-entry-"]');
      const infoLog = screen.getByText('Analyzing user requirements').closest('[data-testid^="log-entry-"]');

      expect(errorLog).toHaveClass('log-error');
      expect(warningLog).toHaveClass('log-warning');
      expect(infoLog).toHaveClass('log-info');
    });
  });

  describe('Auto-scroll functionality', () => {
    it('should call scrollIntoView when logs are rendered', async () => {
      const mockScrollIntoView = jest.fn();
      Element.prototype.scrollIntoView = mockScrollIntoView;

      render(<LogViewer projectId="test-project-123" />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('Analyzing user requirements')).toBeInTheDocument();
      });

      await waitFor(() => {
        expect(mockScrollIntoView).toHaveBeenCalled();
      });
    });
  });

  describe('Empty and error states', () => {
    it('should handle empty log state gracefully', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ logs: [] })
      });

      render(<LogViewer projectId="test-project-123" />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText(/no logs available/i)).toBeInTheDocument();
      });
    });

    it('should handle API errors gracefully', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      render(<LogViewer projectId="test-project-123" />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText(/error loading logs/i)).toBeInTheDocument();
      });
    });
  });
});
