/**
 * Preview Components Tests
 *
 * Tests for TextPreview and CodePreview components.
 *
 * Related: Issue #546 - Add example prompts to model playground pages
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TextPreview } from '../TextPreview';
import { CodePreview } from '../CodePreview';
import { TextResult, CodeResult } from '../../../types.preview';

// Mock clipboard API
const mockClipboard = {
  writeText: jest.fn(() => Promise.resolve()),
};
Object.assign(navigator, { clipboard: mockClipboard });

describe('TextPreview', () => {
  const mockTextResult: TextResult = {
    type: 'text',
    output: 'This is a test output from an AI model.',
    latency_ms: 234,
    tokens_used: 15,
    cost_credits: 1,
    model_category: 'All',
  };

  beforeEach(() => {
    mockClipboard.writeText.mockClear();
  });

  it('should render text output', () => {
    render(<TextPreview result={mockTextResult} />);
    expect(screen.getByText('This is a test output from an AI model.')).toBeInTheDocument();
  });

  it('should display metadata', () => {
    render(<TextPreview result={mockTextResult} />);
    expect(screen.getByText(/Latency: 234ms/)).toBeInTheDocument();
    expect(screen.getByText(/Tokens: 15/)).toBeInTheDocument();
    expect(screen.getByText(/Cost: 1 credits/)).toBeInTheDocument();
  });

  it('should copy text to clipboard', async () => {
    render(<TextPreview result={mockTextResult} />);
    const copyButton = screen.getByLabelText(/Copy text/);

    fireEvent.click(copyButton);

    await waitFor(() => {
      expect(mockClipboard.writeText).toHaveBeenCalledWith(mockTextResult.output);
      expect(screen.getByText('Copied!')).toBeInTheDocument();
    });
  });

  it('should show markdown toggle when markdown syntax detected', () => {
    const markdownResult: TextResult = {
      ...mockTextResult,
      output: '# Heading\n\nThis is **bold** and *italic* text.',
    };

    render(<TextPreview result={markdownResult} />);
    expect(screen.getByLabelText('Render as Markdown')).toBeInTheDocument();
  });

  it('should handle empty output', () => {
    const emptyResult: TextResult = {
      ...mockTextResult,
      output: '',
    };

    render(<TextPreview result={emptyResult} />);
    expect(screen.getByText('No output generated')).toBeInTheDocument();
  });

  it('should display error message', () => {
    const errorResult: TextResult = {
      ...mockTextResult,
      error: 'API request failed',
    };

    render(<TextPreview result={errorResult} />);
    expect(screen.getByText(/Error: API request failed/)).toBeInTheDocument();
  });

  it('should call onCopy callback', async () => {
    const onCopy = jest.fn();
    render(<TextPreview result={mockTextResult} onCopy={onCopy} />);

    const copyButton = screen.getByLabelText(/Copy text/);
    fireEvent.click(copyButton);

    await waitFor(() => {
      expect(onCopy).toHaveBeenCalled();
    });
  });
});

describe('CodePreview', () => {
  const mockCodeResult: CodeResult = {
    type: 'code',
    output: 'def hello():\n    print("Hello, World!")',
    language: 'python',
    latency_ms: 567,
    tokens_used: 23,
    cost_credits: 2,
    model_category: 'Coding',
  };

  beforeEach(() => {
    mockClipboard.writeText.mockClear();
  });

  it('should render code output', () => {
    render(<CodePreview result={mockCodeResult} />);
    expect(screen.getByText(/def hello\(\):/)).toBeInTheDocument();
  });

  it('should display language badge', () => {
    render(<CodePreview result={mockCodeResult} />);
    expect(screen.getByText('Python')).toBeInTheDocument();
  });

  it('should display metadata', () => {
    render(<CodePreview result={mockCodeResult} />);
    expect(screen.getByText(/Latency: 567ms/)).toBeInTheDocument();
    expect(screen.getByText(/Tokens: 23/)).toBeInTheDocument();
    expect(screen.getByText(/Cost: 2 credits/)).toBeInTheDocument();
  });

  it('should copy code to clipboard', async () => {
    render(<CodePreview result={mockCodeResult} />);
    const copyButton = screen.getByLabelText(/Copy code/);

    fireEvent.click(copyButton);

    await waitFor(() => {
      expect(mockClipboard.writeText).toHaveBeenCalledWith(mockCodeResult.output);
      expect(screen.getByText('Copied!')).toBeInTheDocument();
    });
  });

  it('should auto-detect language when not provided', () => {
    const noLangResult: CodeResult = {
      ...mockCodeResult,
      language: undefined,
    };

    render(<CodePreview result={noLangResult} />);
    // Should still render (language detection happens internally)
    expect(screen.getByText('Python')).toBeInTheDocument();
  });

  it('should handle empty code', () => {
    const emptyResult: CodeResult = {
      ...mockCodeResult,
      output: '',
    };

    render(<CodePreview result={emptyResult} />);
    expect(screen.getByText('No code generated')).toBeInTheDocument();
  });

  it('should display error message', () => {
    const errorResult: CodeResult = {
      ...mockCodeResult,
      error: 'Code generation failed',
    };

    render(<CodePreview result={errorResult} />);
    expect(screen.getByText(/Error: Code generation failed/)).toBeInTheDocument();
  });

  it('should call onCopy callback', async () => {
    const onCopy = jest.fn();
    render(<CodePreview result={mockCodeResult} onCopy={onCopy} />);

    const copyButton = screen.getByLabelText(/Copy code/);
    fireEvent.click(copyButton);

    await waitFor(() => {
      expect(onCopy).toHaveBeenCalled();
    });
  });

  it('should render pre-highlighted HTML when provided', () => {
    const highlightedResult: CodeResult = {
      ...mockCodeResult,
      highlighted_html: '<pre><code>def hello():\n    print("Hello")</code></pre>',
    };

    render(<CodePreview result={highlightedResult} />);
    // Should use the pre-rendered HTML
    const codeElement = document.querySelector('.code-preview-html');
    expect(codeElement).toBeInTheDocument();
  });

  it('should format language labels correctly', () => {
    const jsResult: CodeResult = {
      ...mockCodeResult,
      output: 'const x = 42;',
      language: 'javascript',
    };

    render(<CodePreview result={jsResult} />);
    expect(screen.getByText('JavaScript')).toBeInTheDocument();
  });
});
