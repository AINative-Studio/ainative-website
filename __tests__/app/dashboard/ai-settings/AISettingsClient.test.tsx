/**
 * Tests for AISettingsClient Component
 */

import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import AISettingsClient from '@/app/dashboard/ai-settings/AISettingsClient';
import { modelAggregatorService } from '@/lib/model-aggregator-service';
import type { UnifiedAIModel } from '@/lib/model-aggregator-service';

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/lib/model-aggregator-service', () => ({
  modelAggregatorService: {
    aggregateAllModels: jest.fn(),
  },
  ModelCategory: ['All', 'Image', 'Video', 'Audio', 'Coding', 'Embedding'],
}));

const mockRouter = {
  push: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
  replace: jest.fn(),
  prefetch: jest.fn(),
};

describe('AISettingsClient', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    jest.clearAllMocks();
  });

  const mockModels: UnifiedAIModel[] = [
    {
      id: 'chat-gpt-4',
      slug: 'gpt-4',
      name: 'GPT-4',
      provider: 'OpenAI',
      category: 'Coding',
      capabilities: ['text-generation', 'code', 'reasoning'],
      description: 'Advanced AI model for coding and reasoning',
      endpoint: '/v1/chat/completions',
      method: 'POST',
      is_default: false,
      source_type: 'chat',
    },
    {
      id: 'image-qwen-edit',
      slug: 'qwen-image-edit',
      name: 'Qwen Image Edit',
      provider: 'Qwen',
      category: 'Image',
      capabilities: ['image-generation', 'text-to-image'],
      description: 'High-quality image generation',
      thumbnail_url: 'https://image.ainative.studio/asset/qwen/qwen-image-edit.png',
      pricing: { credits: 50, usd: 0.025, unit: 'per image' },
      endpoint: '/v1/multimodal/image',
      method: 'POST',
      is_default: true,
      source_type: 'image',
    },
    {
      id: 'video-wan22-i2v',
      slug: 'alibaba-wan-22-i2v-720p',
      name: 'Alibaba Wan 2.2 I2V 720p',
      provider: 'Alibaba',
      category: 'Video',
      capabilities: ['image-to-video', 'video-generation'],
      description: 'Image-to-video generation',
      thumbnail_url: 'https://image.ainative.studio/asset/alibaba/wan-2i2v720.png',
      pricing: { credits: 400, usd: 0.20, unit: 'per 5s video' },
      endpoint: '/v1/multimodal/video/i2v',
      method: 'POST',
      is_default: true,
      is_premium: false,
      source_type: 'video',
    },
    {
      id: 'audio-whisper-transcription',
      slug: 'whisper-transcription',
      name: 'Whisper',
      provider: 'OpenAI',
      category: 'Audio',
      capabilities: ['audio', 'transcription', 'speech-to-text'],
      description: 'Speech-to-text transcription',
      endpoint: '/v1/audio/transcriptions',
      method: 'POST',
      is_default: true,
      source_type: 'audio',
    },
    {
      id: 'embedding-bge-small',
      slug: 'bge-small-en-v1-5',
      name: 'bge-small-en-v1.5',
      provider: 'BAAI',
      category: 'Embedding',
      capabilities: ['embedding', 'semantic-search'],
      description: 'Lightweight embedding model',
      endpoint: '/v1/embeddings',
      method: 'POST',
      is_default: true,
      source_type: 'embedding',
    },
    {
      id: 'video-sora2-i2v',
      slug: 'sora2-i2v',
      name: 'Sora2',
      provider: 'Sora',
      category: 'Video',
      capabilities: ['image-to-video', 'video-generation'],
      description: 'Premium cinematic video generation',
      pricing: { credits: 800, usd: 0.40, unit: 'per 4s video' },
      endpoint: '/v1/multimodal/video/i2v',
      method: 'POST',
      is_premium: true,
      source_type: 'video',
    },
  ];

  const renderComponent = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <AISettingsClient />
      </QueryClientProvider>
    );
  };

  describe('Loading and Error States', () => {
    it('should display loading spinner while fetching models', () => {
      (modelAggregatorService.aggregateAllModels as jest.Mock).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      renderComponent();
      expect(screen.getByRole('progressbar', { hidden: true })).toBeInTheDocument();
    });

    it('should display error message when fetch fails', async () => {
      const errorMessage = 'Failed to load models';
      (modelAggregatorService.aggregateAllModels as jest.Mock).mockRejectedValue(
        new Error(errorMessage)
      );

      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('Failed to load AI models')).toBeInTheDocument();
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });
    });
  });

  describe('Model Display', () => {
    beforeEach(() => {
      (modelAggregatorService.aggregateAllModels as jest.Mock).mockResolvedValue(mockModels);
    });

    it('should display all models when loaded', async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('GPT-4')).toBeInTheDocument();
        expect(screen.getByText('Qwen Image Edit')).toBeInTheDocument();
        expect(screen.getByText('Alibaba Wan 2.2 I2V 720p')).toBeInTheDocument();
        expect(screen.getByText('Whisper')).toBeInTheDocument();
        expect(screen.getByText('bge-small-en-v1.5')).toBeInTheDocument();
        expect(screen.getByText('Sora2')).toBeInTheDocument();
      });
    });

    it('should display "Looking for another model?" CTA card', async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('Looking for another model?')).toBeInTheDocument();
        expect(
          screen.getByText(/Request a public endpoint to be added/)
        ).toBeInTheDocument();
      });
    });

    it('should display provider badges for models', async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('OpenAI')).toBeInTheDocument();
        expect(screen.getByText('Qwen')).toBeInTheDocument();
        expect(screen.getByText('Alibaba')).toBeInTheDocument();
        expect(screen.getByText('BAAI')).toBeInTheDocument();
      });
    });

    it('should display pricing for models with pricing info', async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('$0.025 per image')).toBeInTheDocument();
        expect(screen.getByText('$0.200 per 5s video')).toBeInTheDocument();
        expect(screen.getByText('$0.400 per 4s video')).toBeInTheDocument();
      });
    });

    it('should mark default models with star icon', async () => {
      renderComponent();

      await waitFor(() => {
        const stars = screen.getAllByTestId('star-icon', { hidden: true });
        // Should have stars for: Qwen Image, Wan 2.2, Whisper, bge-small = 4 models
        expect(stars.length).toBeGreaterThanOrEqual(4);
      });
    });

    it('should mark premium models with crown badge', async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('Premium')).toBeInTheDocument();
      });
    });
  });

  describe('Category Filtering', () => {
    beforeEach(() => {
      (modelAggregatorService.aggregateAllModels as jest.Mock).mockResolvedValue(mockModels);
    });

    it('should display all categories', async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'All' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Image' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Video' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Audio' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Coding' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Embedding' })).toBeInTheDocument();
      });
    });

    it('should filter models by Image category', async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('GPT-4')).toBeInTheDocument();
      });

      const imageTab = screen.getByRole('button', { name: 'Image' });
      fireEvent.click(imageTab);

      await waitFor(() => {
        expect(screen.getByText('Qwen Image Edit')).toBeInTheDocument();
        expect(screen.queryByText('GPT-4')).not.toBeInTheDocument();
        expect(screen.queryByText('Whisper')).not.toBeInTheDocument();
      });
    });

    it('should filter models by Video category', async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('GPT-4')).toBeInTheDocument();
      });

      const videoTab = screen.getByRole('button', { name: 'Video' });
      fireEvent.click(videoTab);

      await waitFor(() => {
        expect(screen.getByText('Alibaba Wan 2.2 I2V 720p')).toBeInTheDocument();
        expect(screen.getByText('Sora2')).toBeInTheDocument();
        expect(screen.queryByText('GPT-4')).not.toBeInTheDocument();
        expect(screen.queryByText('Qwen Image Edit')).not.toBeInTheDocument();
      });
    });

    it('should filter models by Audio category', async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('GPT-4')).toBeInTheDocument();
      });

      const audioTab = screen.getByRole('button', { name: 'Audio' });
      fireEvent.click(audioTab);

      await waitFor(() => {
        expect(screen.getByText('Whisper')).toBeInTheDocument();
        expect(screen.queryByText('GPT-4')).not.toBeInTheDocument();
        expect(screen.queryByText('Qwen Image Edit')).not.toBeInTheDocument();
      });
    });

    it('should filter models by Coding category', async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('GPT-4')).toBeInTheDocument();
      });

      const codingTab = screen.getByRole('button', { name: 'Coding' });
      fireEvent.click(codingTab);

      await waitFor(() => {
        expect(screen.getByText('GPT-4')).toBeInTheDocument();
        expect(screen.queryByText('Qwen Image Edit')).not.toBeInTheDocument();
        expect(screen.queryByText('Whisper')).not.toBeInTheDocument();
      });
    });

    it('should filter models by Embedding category', async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('GPT-4')).toBeInTheDocument();
      });

      const embeddingTab = screen.getByRole('button', { name: 'Embedding' });
      fireEvent.click(embeddingTab);

      await waitFor(() => {
        expect(screen.getByText('bge-small-en-v1.5')).toBeInTheDocument();
        expect(screen.queryByText('GPT-4')).not.toBeInTheDocument();
        expect(screen.queryByText('Qwen Image Edit')).not.toBeInTheDocument();
      });
    });

    it('should show empty state when no models match filter', async () => {
      (modelAggregatorService.aggregateAllModels as jest.Mock).mockResolvedValue([
        mockModels[0], // Only coding model
      ]);

      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('GPT-4')).toBeInTheDocument();
      });

      const imageTab = screen.getByRole('button', { name: 'Image' });
      fireEvent.click(imageTab);

      await waitFor(() => {
        expect(screen.getByText(/No models found in the "Image" category/)).toBeInTheDocument();
        expect(screen.getByText('View all models')).toBeInTheDocument();
      });
    });
  });

  describe('Sorting', () => {
    beforeEach(() => {
      (modelAggregatorService.aggregateAllModels as jest.Mock).mockResolvedValue(mockModels);
    });

    it('should sort models by name alphabetically', async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('GPT-4')).toBeInTheDocument();
      });

      const sortSelect = screen.getByDisplayValue('Newest');
      fireEvent.change(sortSelect, { target: { value: 'name' } });

      await waitFor(() => {
        const modelNames = screen.getAllByRole('heading', { level: 3 }).map(el => el.textContent);
        // Remove CTA card text and check alphabetical order
        const actualNames = modelNames.filter(name => name !== null);
        const sortedNames = [...actualNames].sort();
        expect(actualNames).toEqual(sortedNames);
      });
    });
  });

  describe('Navigation', () => {
    beforeEach(() => {
      (modelAggregatorService.aggregateAllModels as jest.Mock).mockResolvedValue(mockModels);
    });

    it('should navigate to model detail page when card is clicked', async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('GPT-4')).toBeInTheDocument();
      });

      const modelCard = screen.getByText('GPT-4').closest('div');
      if (modelCard) {
        fireEvent.click(modelCard);
      }

      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith('/dashboard/ai-settings/gpt-4');
      });
    });

    it('should navigate to correct slug for video models', async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('Alibaba Wan 2.2 I2V 720p')).toBeInTheDocument();
      });

      const modelCard = screen.getByText('Alibaba Wan 2.2 I2V 720p').closest('div');
      if (modelCard) {
        fireEvent.click(modelCard);
      }

      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith(
          '/dashboard/ai-settings/alibaba-wan-22-i2v-720p'
        );
      });
    });
  });

  describe('Learn More Link', () => {
    beforeEach(() => {
      (modelAggregatorService.aggregateAllModels as jest.Mock).mockResolvedValue(mockModels);
    });

    it('should display learn more link with correct href', async () => {
      renderComponent();

      await waitFor(() => {
        const learnMoreLink = screen.getByText('Learn more');
        expect(learnMoreLink).toBeInTheDocument();
        expect(learnMoreLink).toHaveAttribute('href', 'https://docs.ainative.studio/models');
        expect(learnMoreLink).toHaveAttribute('target', '_blank');
      });
    });
  });

  describe('Critical Bug Fix: "All" Category Filter', () => {
    beforeEach(() => {
      (modelAggregatorService.aggregateAllModels as jest.Mock).mockResolvedValue(mockModels);
    });

    it('should ALWAYS show all models when "All" category is selected', async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('GPT-4')).toBeInTheDocument();
      });

      // Click "All" button
      const allTab = screen.getByRole('button', { name: 'All' });
      fireEvent.click(allTab);

      // Verify ALL models are displayed
      await waitFor(() => {
        expect(screen.getByText('GPT-4')).toBeInTheDocument();
        expect(screen.getByText('Qwen Image Edit')).toBeInTheDocument();
        expect(screen.getByText('Alibaba Wan 2.2 I2V 720p')).toBeInTheDocument();
        expect(screen.getByText('Whisper')).toBeInTheDocument();
        expect(screen.getByText('bge-small-en-v1.5')).toBeInTheDocument();
        expect(screen.getByText('Sora2')).toBeInTheDocument();
      });
    });

    it('should show all models after switching from another category to "All"', async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('GPT-4')).toBeInTheDocument();
      });

      // Click Image category first
      const imageTab = screen.getByRole('button', { name: 'Image' });
      fireEvent.click(imageTab);

      await waitFor(() => {
        expect(screen.getByText('Qwen Image Edit')).toBeInTheDocument();
        expect(screen.queryByText('GPT-4')).not.toBeInTheDocument();
      });

      // Now click "All" - this should show ALL models again
      const allTab = screen.getByRole('button', { name: 'All' });
      fireEvent.click(allTab);

      await waitFor(() => {
        expect(screen.getByText('GPT-4')).toBeInTheDocument();
        expect(screen.getByText('Qwen Image Edit')).toBeInTheDocument();
        expect(screen.getByText('Alibaba Wan 2.2 I2V 720p')).toBeInTheDocument();
        expect(screen.getByText('Whisper')).toBeInTheDocument();
        expect(screen.getByText('bge-small-en-v1.5')).toBeInTheDocument();
        expect(screen.getByText('Sora2')).toBeInTheDocument();
      });
    });

    it('should work correctly when rapidly switching between categories', async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('GPT-4')).toBeInTheDocument();
      });

      // Rapidly click through categories: All → Image → Video → Audio → All
      const allTab = screen.getByRole('button', { name: 'All' });
      const imageTab = screen.getByRole('button', { name: 'Image' });
      const videoTab = screen.getByRole('button', { name: 'Video' });
      const audioTab = screen.getByRole('button', { name: 'Audio' });

      fireEvent.click(allTab);
      fireEvent.click(imageTab);
      fireEvent.click(videoTab);
      fireEvent.click(audioTab);
      fireEvent.click(allTab);

      // Final state should show all models
      await waitFor(() => {
        expect(screen.getByText('GPT-4')).toBeInTheDocument();
        expect(screen.getByText('Qwen Image Edit')).toBeInTheDocument();
        expect(screen.getByText('Alibaba Wan 2.2 I2V 720p')).toBeInTheDocument();
        expect(screen.getByText('Whisper')).toBeInTheDocument();
        expect(screen.getByText('bge-small-en-v1.5')).toBeInTheDocument();
      });
    });

    it('should maintain filter functionality after clicking "All" multiple times', async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('GPT-4')).toBeInTheDocument();
      });

      const allTab = screen.getByRole('button', { name: 'All' });
      const imageTab = screen.getByRole('button', { name: 'Image' });

      // Click "All" multiple times
      fireEvent.click(allTab);
      fireEvent.click(allTab);
      fireEvent.click(allTab);

      // Then switch to Image category - should still work
      fireEvent.click(imageTab);

      await waitFor(() => {
        expect(screen.getByText('Qwen Image Edit')).toBeInTheDocument();
        expect(screen.queryByText('GPT-4')).not.toBeInTheDocument();
      });

      // Back to "All" - should show all models
      fireEvent.click(allTab);

      await waitFor(() => {
        expect(screen.getByText('GPT-4')).toBeInTheDocument();
        expect(screen.getByText('Qwen Image Edit')).toBeInTheDocument();
      });
    });

    it('should show all models when category filters are applied and then "All" is clicked', async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('GPT-4')).toBeInTheDocument();
      });

      // Apply multiple category filters in sequence
      const codingTab = screen.getByRole('button', { name: 'Coding' });
      const videoTab = screen.getByRole('button', { name: 'Video' });
      const embeddingTab = screen.getByRole('button', { name: 'Embedding' });
      const allTab = screen.getByRole('button', { name: 'All' });

      fireEvent.click(codingTab);
      await waitFor(() => {
        expect(screen.getByText('GPT-4')).toBeInTheDocument();
        expect(screen.queryByText('Whisper')).not.toBeInTheDocument();
      });

      fireEvent.click(videoTab);
      await waitFor(() => {
        expect(screen.getByText('Alibaba Wan 2.2 I2V 720p')).toBeInTheDocument();
        expect(screen.queryByText('GPT-4')).not.toBeInTheDocument();
      });

      fireEvent.click(embeddingTab);
      await waitFor(() => {
        expect(screen.getByText('bge-small-en-v1.5')).toBeInTheDocument();
        expect(screen.queryByText('Alibaba Wan 2.2 I2V 720p')).not.toBeInTheDocument();
      });

      // Click "All" - should show ALL models
      fireEvent.click(allTab);

      await waitFor(() => {
        expect(screen.getByText('GPT-4')).toBeInTheDocument();
        expect(screen.getByText('Qwen Image Edit')).toBeInTheDocument();
        expect(screen.getByText('Alibaba Wan 2.2 I2V 720p')).toBeInTheDocument();
        expect(screen.getByText('Whisper')).toBeInTheDocument();
        expect(screen.getByText('bge-small-en-v1.5')).toBeInTheDocument();
        expect(screen.getByText('Sora2')).toBeInTheDocument();
      });
    });

    it('should handle edge case where models load after "All" category is clicked', async () => {
      let resolveModels: (value: UnifiedAIModel[]) => void;
      const modelsPromise = new Promise<UnifiedAIModel[]>((resolve) => {
        resolveModels = resolve;
      });

      (modelAggregatorService.aggregateAllModels as jest.Mock).mockReturnValue(modelsPromise);

      renderComponent();

      // Should show loading state
      expect(screen.getByRole('progressbar', { hidden: true })).toBeInTheDocument();

      // Resolve models after a delay
      await new Promise(resolve => setTimeout(resolve, 100));
      resolveModels!(mockModels);

      // Wait for models to load and display
      await waitFor(() => {
        expect(screen.getByText('GPT-4')).toBeInTheDocument();
        expect(screen.getByText('Qwen Image Edit')).toBeInTheDocument();
        expect(screen.getByText('Alibaba Wan 2.2 I2V 720p')).toBeInTheDocument();
      }, { timeout: 3000 });

      // Click "All" after models are loaded
      const allTab = screen.getByRole('button', { name: 'All' });
      fireEvent.click(allTab);

      // Should still show all models
      await waitFor(() => {
        expect(screen.getByText('GPT-4')).toBeInTheDocument();
        expect(screen.getByText('Qwen Image Edit')).toBeInTheDocument();
        expect(screen.getByText('Whisper')).toBeInTheDocument();
        expect(screen.getByText('bge-small-en-v1.5')).toBeInTheDocument();
      });
    });
  });

  describe('Error Recovery', () => {
    it('should display retry button on error', async () => {
      const errorMessage = 'Network error';
      (modelAggregatorService.aggregateAllModels as jest.Mock).mockRejectedValue(
        new Error(errorMessage)
      );

      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('Failed to load AI models')).toBeInTheDocument();
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();
      });
    });

    it('should retry loading models when retry button is clicked', async () => {
      const errorMessage = 'Network error';
      (modelAggregatorService.aggregateAllModels as jest.Mock)
        .mockRejectedValueOnce(new Error(errorMessage))
        .mockResolvedValueOnce(mockModels);

      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('Failed to load AI models')).toBeInTheDocument();
      });

      const retryButton = screen.getByRole('button', { name: 'Retry' });
      fireEvent.click(retryButton);

      await waitFor(() => {
        expect(screen.getByText('GPT-4')).toBeInTheDocument();
        expect(screen.getByText('Qwen Image Edit')).toBeInTheDocument();
      });
    });
  });
});
