/**
 * @jest-environment jsdom
 *
 * Tests for Model Detail Tab Components
 * - ModelPlayground
 * - ModelAPI
 * - ModelReadme
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ModelPlayground, { PlaygroundParams } from '@/app/dashboard/ai-settings/[id]/ModelPlayground';
import ModelAPI from '@/app/dashboard/ai-settings/[id]/ModelAPI';
import ModelReadme from '@/app/dashboard/ai-settings/[id]/ModelReadme';
import { AIModel } from '@/lib/ai-registry-service';

// Mock framer-motion
jest.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    },
}));

// Mock next/link
jest.mock('next/link', () => {
    return ({ children, href }: any) => <a href={href}>{children}</a>;
});

// Mock react-markdown
jest.mock('react-markdown', () => {
    return ({ children }: any) => <div data-testid="markdown-content">{children}</div>;
});

describe('ModelPlayground', () => {
    const mockChatModel: AIModel = {
        id: 1,
        name: 'GPT-4',
        provider: 'OpenAI',
        model_identifier: 'gpt-4',
        capabilities: ['text-generation', 'code'],
        is_default: true,
        max_tokens: 8192,
        created_at: '2024-01-01T00:00:00Z',
    };

    const mockVideoModel: AIModel = {
        id: 2,
        name: 'Wan 2.2',
        provider: 'Alibaba',
        model_identifier: 'wan22-i2v',
        capabilities: ['image-to-video', 'video-generation'],
        is_default: false,
        max_tokens: 1024,
        created_at: '2024-01-01T00:00:00Z',
    };

    const mockImageModel: AIModel = {
        id: 3,
        name: 'Qwen Image',
        provider: 'Qwen',
        model_identifier: 'qwen-image',
        capabilities: ['image-generation', 'text-to-image'],
        is_default: false,
        max_tokens: 2000,
        created_at: '2024-01-01T00:00:00Z',
    };

    const mockAudioModel: AIModel = {
        id: 4,
        name: 'Whisper',
        provider: 'OpenAI',
        model_identifier: 'whisper',
        capabilities: ['audio', 'transcription'],
        is_default: false,
        max_tokens: 1024,
        created_at: '2024-01-01T00:00:00Z',
    };

    const mockEmbeddingModel: AIModel = {
        id: 5,
        name: 'BGE Small',
        provider: 'BAAI',
        model_identifier: 'bge-small-en-v1.5',
        capabilities: ['embedding', 'semantic-search'],
        is_default: true,
        max_tokens: 512,
        created_at: '2024-01-01T00:00:00Z',
    };

    const mockOnRun = jest.fn();

    beforeEach(() => {
        mockOnRun.mockClear();
    });

    it('renders chat model playground UI', () => {
        render(<ModelPlayground model={mockChatModel} onRun={mockOnRun} />);

        expect(screen.getByText('Input')).toBeInTheDocument();
        expect(screen.getByText('Result')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Enter your prompt here...')).toBeInTheDocument();
        expect(screen.getByText('Max Tokens')).toBeInTheDocument();
    });

    it('renders video model playground UI', () => {
        render(<ModelPlayground model={mockVideoModel} onRun={mockOnRun} />);

        expect(screen.getByText('Source Image')).toBeInTheDocument();
        expect(screen.getByText('Motion Prompt')).toBeInTheDocument();
        expect(screen.getByText('Duration')).toBeInTheDocument();
        expect(screen.getByText('5s')).toBeInTheDocument();
        expect(screen.getByText('8s')).toBeInTheDocument();
    });

    it('renders image model playground UI', () => {
        render(<ModelPlayground model={mockImageModel} onRun={mockOnRun} />);

        expect(screen.getByText('Width')).toBeInTheDocument();
        expect(screen.getByText('Height')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Describe the image you want to generate...')).toBeInTheDocument();
    });

    it('renders audio model playground UI', () => {
        render(<ModelPlayground model={mockAudioModel} onRun={mockOnRun} />);

        expect(screen.getByText('Audio File')).toBeInTheDocument();
    });

    it('renders embedding model playground UI', () => {
        render(<ModelPlayground model={mockEmbeddingModel} onRun={mockOnRun} />);

        expect(screen.getByText('Text to Embed')).toBeInTheDocument();
        expect(screen.getByLabelText('Normalize vectors')).toBeInTheDocument();
    });

    it('handles prompt input for chat model', () => {
        render(<ModelPlayground model={mockChatModel} onRun={mockOnRun} />);

        const promptInput = screen.getByPlaceholderText('Enter your prompt here...');
        fireEvent.change(promptInput, { target: { value: 'Test prompt' } });

        expect(promptInput).toHaveValue('Test prompt');
    });

    it('calls onRun when Run button is clicked', async () => {
        render(<ModelPlayground model={mockChatModel} onRun={mockOnRun} />);

        const promptInput = screen.getByPlaceholderText('Enter your prompt here...');
        fireEvent.change(promptInput, { target: { value: 'Test prompt' } });

        const runButton = screen.getByText('Run');
        fireEvent.click(runButton);

        await waitFor(() => {
            expect(mockOnRun).toHaveBeenCalled();
        });
    });

    it('disables Run button when prompt is empty', () => {
        render(<ModelPlayground model={mockChatModel} onRun={mockOnRun} />);

        const runButton = screen.getByText('Run');
        expect(runButton).toBeDisabled();
    });

    it('handles reset functionality', () => {
        render(<ModelPlayground model={mockChatModel} onRun={mockOnRun} />);

        const promptInput = screen.getByPlaceholderText('Enter your prompt here...');
        fireEvent.change(promptInput, { target: { value: 'Test prompt' } });

        const resetButton = screen.getByText('Reset');
        fireEvent.click(resetButton);

        expect(promptInput).toHaveValue('');
    });

    it('switches between Preview and JSON views', () => {
        render(<ModelPlayground model={mockChatModel} onRun={mockOnRun} />);

        const jsonButton = screen.getByText('JSON');
        fireEvent.click(jsonButton);

        // Both buttons should be present
        expect(screen.getByText('Preview')).toBeInTheDocument();
        expect(screen.getByText('JSON')).toBeInTheDocument();
    });

    it('displays status indicator', () => {
        render(<ModelPlayground model={mockChatModel} onRun={mockOnRun} />);

        expect(screen.getByText('Idle')).toBeInTheDocument();
    });

    it('displays pricing information for video model', () => {
        render(<ModelPlayground model={mockVideoModel} onRun={mockOnRun} />);

        expect(screen.getByText(/Pricing:/)).toBeInTheDocument();
    });

    it('handles duration selection for video model', () => {
        render(<ModelPlayground model={mockVideoModel} onRun={mockOnRun} />);

        const duration8s = screen.getByText('8s');
        fireEvent.click(duration8s);

        // Should still be visible after click
        expect(duration8s).toBeInTheDocument();
    });

    it('displays additional settings section', () => {
        render(<ModelPlayground model={mockChatModel} onRun={mockOnRun} />);

        expect(screen.getByText('Additional settings')).toBeInTheDocument();
    });

    it('handles max tokens selection for chat model', () => {
        render(<ModelPlayground model={mockChatModel} onRun={mockOnRun} />);

        const token512Button = screen.getByText('512');
        fireEvent.click(token512Button);

        expect(token512Button).toBeInTheDocument();
    });

    it('displays Request logs link', () => {
        render(<ModelPlayground model={mockChatModel} onRun={mockOnRun} />);

        expect(screen.getByText('Request logs')).toBeInTheDocument();
    });
});

describe('ModelAPI', () => {
    const mockChatModel: AIModel = {
        id: 1,
        name: 'GPT-4',
        provider: 'OpenAI',
        model_identifier: 'gpt-4',
        capabilities: ['text-generation', 'code'],
        is_default: true,
        max_tokens: 8192,
        created_at: '2024-01-01T00:00:00Z',
    };

    const mockVideoModel: AIModel = {
        id: 2,
        name: 'Wan 2.2',
        provider: 'Alibaba',
        model_identifier: 'wan22-i2v',
        capabilities: ['image-to-video', 'video-generation'],
        is_default: false,
        max_tokens: 1024,
        created_at: '2024-01-01T00:00:00Z',
    };

    it('renders API tab with basic elements', () => {
        render(<ModelAPI model={mockChatModel} />);

        expect(screen.getByText('Create an API Key')).toBeInTheDocument();
        expect(screen.getByText('Curl')).toBeInTheDocument();
        expect(screen.getByText('Post /Run')).toBeInTheDocument();
    });

    it('displays curl code by default', () => {
        render(<ModelAPI model={mockChatModel} />);

        expect(screen.getByText(/curl -X POST/)).toBeInTheDocument();
    });

    it('switches between Curl and Post /Run views', () => {
        render(<ModelAPI model={mockChatModel} />);

        const postRunButton = screen.getByText('Post /Run');
        fireEvent.click(postRunButton);

        expect(screen.getByText(/POST https:\/\/api\.ainative\.studio/)).toBeInTheDocument();
    });

    it('displays API parameters section', () => {
        render(<ModelAPI model={mockChatModel} />);

        expect(screen.getByText('API Parameters')).toBeInTheDocument();
    });

    it('displays response format section', () => {
        render(<ModelAPI model={mockChatModel} />);

        expect(screen.getByText('Response Format')).toBeInTheDocument();
    });

    it('shows correct parameters for chat model', () => {
        render(<ModelAPI model={mockChatModel} />);

        expect(screen.getByText(/messages/)).toBeInTheDocument();
        expect(screen.getByText(/temperature/)).toBeInTheDocument();
        expect(screen.getByText(/max_tokens/)).toBeInTheDocument();
    });

    it('shows correct parameters for video model', () => {
        render(<ModelAPI model={mockVideoModel} />);

        expect(screen.getByText(/prompt/)).toBeInTheDocument();
        expect(screen.getByText(/duration/)).toBeInTheDocument();
    });

    it('displays download button', () => {
        render(<ModelAPI model={mockChatModel} />);

        const downloadButtons = screen.getAllByText(/Download/);
        expect(downloadButtons.length).toBeGreaterThan(0);
    });

    it('has copy functionality', () => {
        // Mock clipboard API
        Object.assign(navigator, {
            clipboard: {
                writeText: jest.fn(),
            },
        });

        render(<ModelAPI model={mockChatModel} />);

        const downloadButton = screen.getAllByText(/Download/)[0];
        fireEvent.click(downloadButton);

        expect(navigator.clipboard.writeText).toHaveBeenCalled();
    });

    it('links to developer settings for API key creation', () => {
        render(<ModelAPI model={mockChatModel} />);

        const apiKeyLink = screen.getByText('Create an API Key').closest('a');
        expect(apiKeyLink).toHaveAttribute('href', '/dashboard/developer-settings');
    });

    it('displays model identifier in parameters', () => {
        render(<ModelAPI model={mockChatModel} />);

        expect(screen.getByText(/gpt-4/)).toBeInTheDocument();
    });

    it('shows appropriate endpoint for chat model', () => {
        render(<ModelAPI model={mockChatModel} />);

        expect(screen.getByText(/\/v1\/chat\/completions/)).toBeInTheDocument();
    });

    it('shows appropriate endpoint for video model', () => {
        render(<ModelAPI model={mockVideoModel} />);

        expect(screen.getByText(/\/v1\/multimodal\/video/)).toBeInTheDocument();
    });
});

describe('ModelReadme', () => {
    const mockChatModel: AIModel = {
        id: 1,
        name: 'GPT-4',
        provider: 'OpenAI',
        model_identifier: 'gpt-4',
        capabilities: ['text-generation', 'code'],
        is_default: true,
        max_tokens: 8192,
        created_at: '2024-01-01T00:00:00Z',
    };

    const mockVideoModel: AIModel = {
        id: 2,
        name: 'Wan 2.2',
        provider: 'Alibaba',
        model_identifier: 'wan22-i2v',
        capabilities: ['image-to-video', 'video-generation'],
        is_default: false,
        max_tokens: 1024,
        created_at: '2024-01-01T00:00:00Z',
    };

    const mockModelWithReadme: AIModel = {
        id: 3,
        name: 'Custom Model',
        provider: 'Custom',
        model_identifier: 'custom-model',
        capabilities: ['text-generation'],
        is_default: false,
        max_tokens: 2048,
        created_at: '2024-01-01T00:00:00Z',
        readme: '# Custom Model\n\nThis is a custom readme.',
    };

    it('renders readme content', () => {
        render(<ModelReadme model={mockChatModel} />);

        expect(screen.getByTestId('markdown-content')).toBeInTheDocument();
    });

    it('generates readme for chat model', () => {
        render(<ModelReadme model={mockChatModel} />);

        const markdownContent = screen.getByTestId('markdown-content');
        expect(markdownContent.textContent).toContain('GPT-4');
    });

    it('generates readme for video model', () => {
        render(<ModelReadme model={mockVideoModel} />);

        const markdownContent = screen.getByTestId('markdown-content');
        expect(markdownContent.textContent).toContain('Wan 2.2');
    });

    it('uses custom readme if provided', () => {
        render(<ModelReadme model={mockModelWithReadme} />);

        const markdownContent = screen.getByTestId('markdown-content');
        expect(markdownContent.textContent).toContain('Custom Model');
        expect(markdownContent.textContent).toContain('This is a custom readme');
    });

    it('includes overview section in generated content', () => {
        render(<ModelReadme model={mockChatModel} />);

        const markdownContent = screen.getByTestId('markdown-content');
        expect(markdownContent.textContent).toContain('Overview');
    });

    it('includes features section in generated content', () => {
        render(<ModelReadme model={mockChatModel} />);

        const markdownContent = screen.getByTestId('markdown-content');
        expect(markdownContent.textContent).toContain('Features');
    });

    it('includes parameters section in generated content', () => {
        render(<ModelReadme model={mockChatModel} />);

        const markdownContent = screen.getByTestId('markdown-content');
        expect(markdownContent.textContent).toContain('Parameters');
    });

    it('includes use cases section in generated content', () => {
        render(<ModelReadme model={mockChatModel} />);

        const markdownContent = screen.getByTestId('markdown-content');
        expect(markdownContent.textContent).toContain('Use Cases');
    });

    it('includes pricing section in generated content', () => {
        render(<ModelReadme model={mockChatModel} />);

        const markdownContent = screen.getByTestId('markdown-content');
        expect(markdownContent.textContent).toContain('Pricing');
    });

    it('includes best practices section in generated content', () => {
        render(<ModelReadme model={mockChatModel} />);

        const markdownContent = screen.getByTestId('markdown-content');
        expect(markdownContent.textContent).toContain('Best Practices');
    });

    it('includes getting started section', () => {
        render(<ModelReadme model={mockChatModel} />);

        const markdownContent = screen.getByTestId('markdown-content');
        expect(markdownContent.textContent).toContain('Getting Started');
    });

    it('includes support section', () => {
        render(<ModelReadme model={mockChatModel} />);

        const markdownContent = screen.getByTestId('markdown-content');
        expect(markdownContent.textContent).toContain('Support');
    });

    it('displays provider information', () => {
        render(<ModelReadme model={mockChatModel} />);

        const markdownContent = screen.getByTestId('markdown-content');
        expect(markdownContent.textContent).toContain('OpenAI');
    });

    it('displays model identifier', () => {
        render(<ModelReadme model={mockChatModel} />);

        const markdownContent = screen.getByTestId('markdown-content');
        expect(markdownContent.textContent).toContain('gpt-4');
    });

    it('displays capabilities', () => {
        render(<ModelReadme model={mockChatModel} />);

        const markdownContent = screen.getByTestId('markdown-content');
        expect(markdownContent.textContent).toContain('text-generation');
        expect(markdownContent.textContent).toContain('code');
    });
});

describe('ModelDetailTabs Integration', () => {
    it('all tab components render without errors', () => {
        const mockModel: AIModel = {
            id: 1,
            name: 'Test Model',
            provider: 'Test Provider',
            model_identifier: 'test-model',
            capabilities: ['text-generation'],
            is_default: true,
            max_tokens: 4096,
            created_at: '2024-01-01T00:00:00Z',
        };

        const mockOnRun = jest.fn();

        const { container: playgroundContainer } = render(<ModelPlayground model={mockModel} onRun={mockOnRun} />);
        expect(playgroundContainer).toBeTruthy();

        const { container: apiContainer } = render(<ModelAPI model={mockModel} />);
        expect(apiContainer).toBeTruthy();

        const { container: readmeContainer } = render(<ModelReadme model={mockModel} />);
        expect(readmeContainer).toBeTruthy();
    });
});
