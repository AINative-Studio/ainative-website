/**
 * ControlPanel Component Tests
 *
 * Comprehensive test suite ensuring:
 * - Status badge rendering with correct variants
 * - Button enabling/disabling logic based on project state
 * - Confirmation dialogs for stop and restart actions
 * - API integration for stop/restart endpoints
 * - Error handling
 * - Accessibility compliance
 *
 * Refs #1098
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ControlPanel from '../ControlPanel';
import type { ControlPanelProps } from '../ControlPanel';

// Mock fetch globally
global.fetch = jest.fn();

describe('ControlPanel', () => {
  const mockProjectId = 'test-project-123';
  const mockOnStatusChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockReset();
  });

  describe('Component Rendering', () => {
    it('should render control panel with title', () => {
      render(
        <ControlPanel
          projectId={mockProjectId}
          status="active"
          onStatusChange={mockOnStatusChange}
        />
      );
      expect(screen.getByText('Control Panel')).toBeInTheDocument();
    });

    it('should render status indicator', () => {
      render(
        <ControlPanel
          projectId={mockProjectId}
          status="active"
          onStatusChange={mockOnStatusChange}
        />
      );
      expect(screen.getByTestId('status-indicator')).toBeInTheDocument();
      expect(screen.getByText('Status:')).toBeInTheDocument();
    });

    it('should render both control buttons', () => {
      render(
        <ControlPanel
          projectId={mockProjectId}
          status="active"
          onStatusChange={mockOnStatusChange}
        />
      );
      expect(screen.getByTestId('stop-button')).toBeInTheDocument();
      expect(screen.getByTestId('restart-button')).toBeInTheDocument();
    });
  });

  describe('Status Badge Rendering', () => {
    it('should show green running badge for active status', () => {
      render(
        <ControlPanel
          projectId={mockProjectId}
          status="active"
          onStatusChange={mockOnStatusChange}
        />
      );
      const badge = screen.getByTestId('status-badge');
      expect(badge).toHaveTextContent('🟢');
      expect(badge).toHaveTextContent('Running');
    });

    it('should show gray stopped badge for stopped status', () => {
      render(
        <ControlPanel
          projectId={mockProjectId}
          status="stopped"
          onStatusChange={mockOnStatusChange}
        />
      );
      const badge = screen.getByTestId('status-badge');
      expect(badge).toHaveTextContent('⏸️');
      expect(badge).toHaveTextContent('Stopped');
    });

    it('should show blue completed badge for completed status', () => {
      render(
        <ControlPanel
          projectId={mockProjectId}
          status="completed"
          onStatusChange={mockOnStatusChange}
        />
      );
      const badge = screen.getByTestId('status-badge');
      expect(badge).toHaveTextContent('✅');
      expect(badge).toHaveTextContent('Completed');
    });

    it('should show red error badge for error status', () => {
      render(
        <ControlPanel
          projectId={mockProjectId}
          status="error"
          onStatusChange={mockOnStatusChange}
        />
      );
      const badge = screen.getByTestId('status-badge');
      expect(badge).toHaveTextContent('❌');
      expect(badge).toHaveTextContent('Error');
    });
  });

  describe('Button Disabling Logic', () => {
    it('should disable stop button when project is stopped', () => {
      render(
        <ControlPanel
          projectId={mockProjectId}
          status="stopped"
          onStatusChange={mockOnStatusChange}
        />
      );
      const stopButton = screen.getByTestId('stop-button');
      expect(stopButton).toBeDisabled();
    });

    it('should disable stop button when project is completed', () => {
      render(
        <ControlPanel
          projectId={mockProjectId}
          status="completed"
          onStatusChange={mockOnStatusChange}
        />
      );
      const stopButton = screen.getByTestId('stop-button');
      expect(stopButton).toBeDisabled();
    });

    it('should enable stop button when project is active', () => {
      render(
        <ControlPanel
          projectId={mockProjectId}
          status="active"
          onStatusChange={mockOnStatusChange}
        />
      );
      const stopButton = screen.getByTestId('stop-button');
      expect(stopButton).not.toBeDisabled();
    });

    it('should enable stop button when project has error', () => {
      render(
        <ControlPanel
          projectId={mockProjectId}
          status="error"
          onStatusChange={mockOnStatusChange}
        />
      );
      const stopButton = screen.getByTestId('stop-button');
      expect(stopButton).not.toBeDisabled();
    });

    it('should disable restart button when project is active', () => {
      render(
        <ControlPanel
          projectId={mockProjectId}
          status="active"
          onStatusChange={mockOnStatusChange}
        />
      );
      const restartButton = screen.getByTestId('restart-button');
      expect(restartButton).toBeDisabled();
    });

    it('should disable restart button when project has error', () => {
      render(
        <ControlPanel
          projectId={mockProjectId}
          status="error"
          onStatusChange={mockOnStatusChange}
        />
      );
      const restartButton = screen.getByTestId('restart-button');
      expect(restartButton).toBeDisabled();
    });

    it('should enable restart button when project is stopped', () => {
      render(
        <ControlPanel
          projectId={mockProjectId}
          status="stopped"
          onStatusChange={mockOnStatusChange}
        />
      );
      const restartButton = screen.getByTestId('restart-button');
      expect(restartButton).not.toBeDisabled();
    });

    it('should enable restart button when project is completed', () => {
      render(
        <ControlPanel
          projectId={mockProjectId}
          status="completed"
          onStatusChange={mockOnStatusChange}
        />
      );
      const restartButton = screen.getByTestId('restart-button');
      expect(restartButton).not.toBeDisabled();
    });
  });

  describe('Confirmation Dialogs', () => {
    it('should show stop confirmation dialog when stop button clicked', async () => {
      render(
        <ControlPanel
          projectId={mockProjectId}
          status="active"
          onStatusChange={mockOnStatusChange}
        />
      );

      const stopButton = screen.getByTestId('stop-button');
      fireEvent.click(stopButton);

      await waitFor(() => {
        expect(screen.getByTestId('stop-dialog')).toBeInTheDocument();
        expect(screen.getByText('Stop All Agents?')).toBeInTheDocument();
        expect(
          screen.getByText(/This will stop all agents working on this project/)
        ).toBeInTheDocument();
      });
    });

    it('should show restart confirmation dialog when restart button clicked', async () => {
      render(
        <ControlPanel
          projectId={mockProjectId}
          status="stopped"
          onStatusChange={mockOnStatusChange}
        />
      );

      const restartButton = screen.getByTestId('restart-button');
      fireEvent.click(restartButton);

      await waitFor(() => {
        expect(screen.getByTestId('restart-dialog')).toBeInTheDocument();
        expect(screen.getByText('Restart Project?')).toBeInTheDocument();
        expect(
          screen.getByText(/This will restart the agent swarm/)
        ).toBeInTheDocument();
      });
    });

    it('should close stop dialog when cancel button clicked', async () => {
      render(
        <ControlPanel
          projectId={mockProjectId}
          status="active"
          onStatusChange={mockOnStatusChange}
        />
      );

      const stopButton = screen.getByTestId('stop-button');
      fireEvent.click(stopButton);

      await waitFor(() => {
        expect(screen.getByTestId('stop-dialog')).toBeInTheDocument();
      });

      const cancelButton = screen.getByTestId('stop-dialog-cancel');
      fireEvent.click(cancelButton);

      await waitFor(() => {
        expect(screen.queryByTestId('stop-dialog')).not.toBeInTheDocument();
      });
    });

    it('should close restart dialog when cancel button clicked', async () => {
      render(
        <ControlPanel
          projectId={mockProjectId}
          status="stopped"
          onStatusChange={mockOnStatusChange}
        />
      );

      const restartButton = screen.getByTestId('restart-button');
      fireEvent.click(restartButton);

      await waitFor(() => {
        expect(screen.getByTestId('restart-dialog')).toBeInTheDocument();
      });

      const cancelButton = screen.getByTestId('restart-dialog-cancel');
      fireEvent.click(cancelButton);

      await waitFor(() => {
        expect(screen.queryByTestId('restart-dialog')).not.toBeInTheDocument();
      });
    });
  });

  describe('API Integration - Stop Action', () => {
    it('should call stop API when confirmed', async () => {
      const mockResponse = {
        project_id: mockProjectId,
        status: 'stopped',
        message: 'Agent swarm project stopped successfully',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      render(
        <ControlPanel
          projectId={mockProjectId}
          status="active"
          onStatusChange={mockOnStatusChange}
        />
      );

      const stopButton = screen.getByTestId('stop-button');
      fireEvent.click(stopButton);

      await waitFor(() => {
        expect(screen.getByTestId('stop-dialog')).toBeInTheDocument();
      });

      const confirmButton = screen.getByTestId('stop-dialog-confirm');
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          `/api/v1/admin/agent-swarms/projects/${mockProjectId}/stop`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
      });
    });

    it('should call onStatusChange callback after successful stop', async () => {
      const mockResponse = {
        project_id: mockProjectId,
        status: 'stopped',
        message: 'Agent swarm project stopped successfully',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      render(
        <ControlPanel
          projectId={mockProjectId}
          status="active"
          onStatusChange={mockOnStatusChange}
        />
      );

      const stopButton = screen.getByTestId('stop-button');
      fireEvent.click(stopButton);

      await waitFor(() => {
        expect(screen.getByTestId('stop-dialog')).toBeInTheDocument();
      });

      const confirmButton = screen.getByTestId('stop-dialog-confirm');
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(mockOnStatusChange).toHaveBeenCalledWith('stopped');
      });
    });

    it('should handle stop API errors gracefully', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error('Network error')
      );

      render(
        <ControlPanel
          projectId={mockProjectId}
          status="active"
          onStatusChange={mockOnStatusChange}
        />
      );

      const stopButton = screen.getByTestId('stop-button');
      fireEvent.click(stopButton);

      await waitFor(() => {
        expect(screen.getByTestId('stop-dialog')).toBeInTheDocument();
      });

      const confirmButton = screen.getByTestId('stop-dialog-confirm');
      fireEvent.click(confirmButton);

      await waitFor(() => {
        const errorMessage = screen.getByTestId('error-message');
        expect(errorMessage).toBeInTheDocument();
        expect(errorMessage).toHaveTextContent('Network error');
      });

      expect(mockOnStatusChange).not.toHaveBeenCalled();
    });

    it('should show loading state during stop action', async () => {
      (global.fetch as jest.Mock).mockImplementationOnce(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  json: async () => ({ status: 'stopped' }),
                }),
              100
            )
          )
      );

      render(
        <ControlPanel
          projectId={mockProjectId}
          status="active"
          onStatusChange={mockOnStatusChange}
        />
      );

      const stopButton = screen.getByTestId('stop-button');
      fireEvent.click(stopButton);

      await waitFor(() => {
        expect(screen.getByTestId('stop-dialog')).toBeInTheDocument();
      });

      const confirmButton = screen.getByTestId('stop-dialog-confirm');
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(screen.getByText('Stopping...')).toBeInTheDocument();
      });
    });
  });

  describe('API Integration - Restart Action', () => {
    it('should call restart API when confirmed', async () => {
      const mockResponse = {
        project_id: mockProjectId,
        status: 'restarting',
        message: 'Agent swarm project restart initiated',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      render(
        <ControlPanel
          projectId={mockProjectId}
          status="stopped"
          onStatusChange={mockOnStatusChange}
        />
      );

      const restartButton = screen.getByTestId('restart-button');
      fireEvent.click(restartButton);

      await waitFor(() => {
        expect(screen.getByTestId('restart-dialog')).toBeInTheDocument();
      });

      const confirmButton = screen.getByTestId('restart-dialog-confirm');
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          `/api/v1/admin/agent-swarms/projects/${mockProjectId}/restart`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
      });
    });

    it('should call onStatusChange callback after successful restart', async () => {
      const mockResponse = {
        project_id: mockProjectId,
        status: 'active',
        message: 'Agent swarm project restart initiated',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      render(
        <ControlPanel
          projectId={mockProjectId}
          status="stopped"
          onStatusChange={mockOnStatusChange}
        />
      );

      const restartButton = screen.getByTestId('restart-button');
      fireEvent.click(restartButton);

      await waitFor(() => {
        expect(screen.getByTestId('restart-dialog')).toBeInTheDocument();
      });

      const confirmButton = screen.getByTestId('restart-dialog-confirm');
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(mockOnStatusChange).toHaveBeenCalledWith('active');
      });
    });

    it('should handle restart API errors gracefully', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error('Server error')
      );

      render(
        <ControlPanel
          projectId={mockProjectId}
          status="stopped"
          onStatusChange={mockOnStatusChange}
        />
      );

      const restartButton = screen.getByTestId('restart-button');
      fireEvent.click(restartButton);

      await waitFor(() => {
        expect(screen.getByTestId('restart-dialog')).toBeInTheDocument();
      });

      const confirmButton = screen.getByTestId('restart-dialog-confirm');
      fireEvent.click(confirmButton);

      await waitFor(() => {
        const errorMessage = screen.getByTestId('error-message');
        expect(errorMessage).toBeInTheDocument();
        expect(errorMessage).toHaveTextContent('Server error');
      });

      expect(mockOnStatusChange).not.toHaveBeenCalled();
    });

    it('should show loading state during restart action', async () => {
      (global.fetch as jest.Mock).mockImplementationOnce(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  json: async () => ({ status: 'active' }),
                }),
              100
            )
          )
      );

      render(
        <ControlPanel
          projectId={mockProjectId}
          status="stopped"
          onStatusChange={mockOnStatusChange}
        />
      );

      const restartButton = screen.getByTestId('restart-button');
      fireEvent.click(restartButton);

      await waitFor(() => {
        expect(screen.getByTestId('restart-dialog')).toBeInTheDocument();
      });

      const confirmButton = screen.getByTestId('restart-dialog-confirm');
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(screen.getByText('Restarting...')).toBeInTheDocument();
      });
    });

    it('should handle non-ok HTTP responses', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        statusText: 'Internal Server Error',
      });

      render(
        <ControlPanel
          projectId={mockProjectId}
          status="stopped"
          onStatusChange={mockOnStatusChange}
        />
      );

      const restartButton = screen.getByTestId('restart-button');
      fireEvent.click(restartButton);

      await waitFor(() => {
        expect(screen.getByTestId('restart-dialog')).toBeInTheDocument();
      });

      const confirmButton = screen.getByTestId('restart-dialog-confirm');
      fireEvent.click(confirmButton);

      await waitFor(() => {
        const errorMessage = screen.getByTestId('error-message');
        expect(errorMessage).toBeInTheDocument();
        expect(errorMessage).toHaveTextContent(
          'Failed to restart project: Internal Server Error'
        );
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels on buttons', () => {
      render(
        <ControlPanel
          projectId={mockProjectId}
          status="active"
          onStatusChange={mockOnStatusChange}
        />
      );

      expect(screen.getByLabelText('Stop project')).toBeInTheDocument();
      expect(screen.getByLabelText('Restart project')).toBeInTheDocument();
    });

    it('should have role="alert" on error message', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error('Test error')
      );

      render(
        <ControlPanel
          projectId={mockProjectId}
          status="active"
          onStatusChange={mockOnStatusChange}
        />
      );

      const stopButton = screen.getByTestId('stop-button');
      fireEvent.click(stopButton);

      await waitFor(() => {
        expect(screen.getByTestId('stop-dialog')).toBeInTheDocument();
      });

      const confirmButton = screen.getByTestId('stop-dialog-confirm');
      fireEvent.click(confirmButton);

      await waitFor(() => {
        const errorMessage = screen.getByRole('alert');
        expect(errorMessage).toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should work without onStatusChange callback', async () => {
      const mockResponse = {
        project_id: mockProjectId,
        status: 'stopped',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      render(<ControlPanel projectId={mockProjectId} status="active" />);

      const stopButton = screen.getByTestId('stop-button');
      fireEvent.click(stopButton);

      await waitFor(() => {
        expect(screen.getByTestId('stop-dialog')).toBeInTheDocument();
      });

      const confirmButton = screen.getByTestId('stop-dialog-confirm');
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });

    it('should handle API response without status field', async () => {
      const mockResponse = {
        project_id: mockProjectId,
        message: 'Stopped',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      render(
        <ControlPanel
          projectId={mockProjectId}
          status="active"
          onStatusChange={mockOnStatusChange}
        />
      );

      const stopButton = screen.getByTestId('stop-button');
      fireEvent.click(stopButton);

      await waitFor(() => {
        expect(screen.getByTestId('stop-dialog')).toBeInTheDocument();
      });

      const confirmButton = screen.getByTestId('stop-dialog-confirm');
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(mockOnStatusChange).toHaveBeenCalledWith('stopped');
      });
    });
  });
});
