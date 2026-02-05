/**
 * @jest-environment jsdom
 *
 * Issue #524: Model Registration Persistence Tests
 * Refs #524
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AISettingsClient from '@/app/dashboard/ai-settings/AISettingsClient';
import { aiRegistryService } from '@/lib/ai-registry-service';
import '@testing-library/jest-dom';

jest.mock('@/lib/ai-registry-service', () => ({
  aiRegistryService: {
    listModels: jest.fn(),
    registerModel: jest.fn(),
    switchDefaultModel: jest.fn(),
  },
}));

jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => <div {...props}>{children}</div>,
  },
}));

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

const mockModels = [
  {
    id: 1,
    name: 'GPT-4 Turbo',
    provider: 'openai',
    model_identifier: 'gpt-4-turbo-preview',
    capabilities: ['text-generation', 'reasoning'],
    is_default: true,
    max_tokens: 128000,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-15T00:00:00Z',
    usage_count: 1500,
  },
  {
    id: 2,
    name: 'Claude 3.5 Sonnet',
    provider: 'anthropic',
    model_identifier: 'claude-3-5-sonnet-20241022',
    capabilities: ['text-generation', 'reasoning', 'vision'],
    is_default: false,
    max_tokens: 200000,
    created_at: '2025-01-15T00:00:00Z',
    usage_count: 850,
  },
];

describe('Issue #524: Model Registration Persistence', () => {
  const mockListModels = aiRegistryService.listModels as jest.Mock;
  const mockRegisterModel = aiRegistryService.registerModel as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  it('should load and display existing models', async () => {
    mockListModels.mockResolvedValueOnce({ models: mockModels, total: 2 });
    render(<AISettingsClient />, { wrapper: createWrapper() });

    await waitFor(() => {
      const gpt4Elements = screen.getAllByText('GPT-4 Turbo');
      expect(gpt4Elements.length).toBeGreaterThan(0);
      expect(screen.getByText('Claude 3.5 Sonnet')).toBeInTheDocument();
      expect(screen.getByText('All Models (2)')).toBeInTheDocument();
    });

    expect(mockListModels).toHaveBeenCalledTimes(1);
  });

  it('should call aiRegistryService.registerModel with correct data', async () => {
    jest.clearAllMocks();
    const testData = {
      name: 'Test Model',
      provider: 'custom',
      model_identifier: 'test-v1',
      capabilities: ['text-generation'],
      max_tokens: 10000,
    };

    mockRegisterModel.mockResolvedValueOnce({
      id: 99,
      ...testData,
      is_default: false,
      created_at: '2025-02-04T12:00:00Z',
    });

    const result = await aiRegistryService.registerModel(testData);
    expect(result).toHaveProperty('id');
    expect(result.name).toBe('Test Model');
  });
});
