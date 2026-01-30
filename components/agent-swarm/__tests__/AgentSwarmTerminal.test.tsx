import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AgentSwarmTerminal from '../AgentSwarmTerminal';
import { act } from 'react-dom/test-utils';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Mock ExecutionTimer
jest.mock('../ExecutionTimer', () => {
  return function MockExecutionTimer() {
    return <div data-testid="execution-timer">Timer</div>;
  };
});

// Mock WebSocket
class MockWebSocket {
  static instances: MockWebSocket[] = [];
  onopen: (() => void) | null = null;
  onmessage: ((event: { data: string }) => void) | null = null;
  onerror: ((error: Event) => void) | null = null;
  onclose: (() => void) | null = null;
  readyState = WebSocket.CONNECTING;

  constructor(public url: string) {
    MockWebSocket.instances.push(this);
  }

  close() {
    this.readyState = WebSocket.CLOSED;
    this.onclose?.();
  }

  send(data: string) {
    // Mock send
  }

  static reset() {
    MockWebSocket.instances = [];
  }

  static getLatest() {
    return MockWebSocket.instances[MockWebSocket.instances.length - 1];
  }
}

global.WebSocket = MockWebSocket as any;

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock as any;

// Mock URL methods
global.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
global.URL.revokeObjectURL = jest.fn();

// Mock scrollIntoView
Element.prototype.scrollIntoView = jest.fn();

describe('AgentSwarmTerminal', () => {
  const mockProjectId = 'test-project-123';

  beforeEach(() => {
    jest.clearAllMocks();
    MockWebSocket.reset();
    localStorageMock.getItem.mockReturnValue('mock-token');
  });

  describe('Component Rendering', () => {
    it('should render terminal with correct title', () => {
      render(<AgentSwarmTerminal projectId={mockProjectId} />);
      expect(screen.getByText('Agent Swarm Terminal')).toBeInTheDocument();
    });

    it('should display execution timer', () => {
      render(<AgentSwarmTerminal projectId={mockProjectId} />);
      expect(screen.getByTestId('execution-timer')).toBeInTheDocument();
    });

    it('should show connecting status initially', () => {
      render(<AgentSwarmTerminal projectId={mockProjectId} />);
      expect(screen.getByText('Connecting...')).toBeInTheDocument();
    });

    it('should display filter count', () => {
      render(<AgentSwarmTerminal projectId={mockProjectId} />);
      expect(screen.getByText(/Filters \(5\/5\)/)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels on controls', () => {
      render(<AgentSwarmTerminal projectId={mockProjectId} />);
      expect(screen.getByLabelText('Filter logs by type')).toBeInTheDocument();
      expect(screen.getByLabelText('Pause streaming')).toBeInTheDocument();
      expect(screen.getByLabelText('Download logs')).toBeInTheDocument();
      expect(screen.getByLabelText('Clear logs')).toBeInTheDocument();
    });

    it('should have log region with aria-live', () => {
      render(<AgentSwarmTerminal projectId={mockProjectId} />);
      const logRegion = screen.getByRole('log');
      expect(logRegion).toHaveAttribute('aria-live', 'polite');
      expect(logRegion).toHaveAttribute('aria-atomic', 'false');
    });

    it('should have monospace font for terminal', () => {
      render(<AgentSwarmTerminal projectId={mockProjectId} />);
      const logRegion = screen.getByRole('log');
      expect(logRegion).toHaveClass('font-mono');
    });

    it('should have dark terminal background', () => {
      render(<AgentSwarmTerminal projectId={mockProjectId} />);
      const logRegion = screen.getByRole('log');
      expect(logRegion).toHaveClass('bg-black');
    });
  });

  describe('Pause/Resume Streaming', () => {
    it('should toggle pause/resume button', async () => {
      render(<AgentSwarmTerminal projectId={mockProjectId} />);

      const pauseButton = screen.getByLabelText('Pause streaming');
      fireEvent.click(pauseButton);

      await waitFor(() => {
        expect(screen.getByLabelText('Resume streaming')).toBeInTheDocument();
      });

      const resumeButton = screen.getByLabelText('Resume streaming');
      fireEvent.click(resumeButton);

      await waitFor(() => {
        expect(screen.getByLabelText('Pause streaming')).toBeInTheDocument();
      });
    });
  });

  describe('Download and Clear Functionality', () => {
    it('should have download button disabled initially', async () => {
      render(<AgentSwarmTerminal projectId={mockProjectId} />);
      await waitFor(() => {
        const downloadButton = screen.getByLabelText('Download logs');
        expect(downloadButton).toBeDisabled();
      });
    });

    it('should have clear button disabled initially', async () => {
      render(<AgentSwarmTerminal projectId={mockProjectId} />);
      await waitFor(() => {
        const clearButton = screen.getByLabelText('Clear logs');
        expect(clearButton).toBeDisabled();
      });
    });
  });

  describe('WebSocket Connection', () => {
    it('should establish WebSocket connection', async () => {
      render(<AgentSwarmTerminal projectId={mockProjectId} />);

      await waitFor(() => {
        const ws = MockWebSocket.getLatest();
        expect(ws).toBeDefined();
        expect(ws.url).toContain('ws/admin/agent-swarm/');
      });
    });

    it('should display connecting message in logs', async () => {
      render(<AgentSwarmTerminal projectId={mockProjectId} />);

      await waitFor(() => {
        expect(screen.getByText(/Connecting to Agent Swarm WebSocket/)).toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });

  describe('Terminal UI Requirements', () => {
    it('should have fixed height terminal', async () => {
      render(<AgentSwarmTerminal projectId={mockProjectId} />);
      await waitFor(() => {
        const logRegion = screen.getByRole('log');
        expect(logRegion).toHaveClass('h-[400px]');
      });
    });

    it('should have overflow scrolling', async () => {
      render(<AgentSwarmTerminal projectId={mockProjectId} />);
      await waitFor(() => {
        const logRegion = screen.getByRole('log');
        expect(logRegion).toHaveClass('overflow-y-auto');
      });
    });

    it('should display timestamps format correctly', async () => {
      render(<AgentSwarmTerminal projectId={mockProjectId} />);

      await waitFor(() => {
        const timestamps = screen.getAllByText(/\[\d{2}:\d{2}:\d{2}\]/);
        expect(timestamps.length).toBeGreaterThan(0);
      }, { timeout: 3000 });
    });
  });
});
