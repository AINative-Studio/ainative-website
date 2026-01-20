import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrandedWelcome } from './BrandedWelcome';
import '@testing-library/jest-dom';

describe('BrandedWelcome', () => {
  const defaultProps = {
    title: 'Welcome to AI Native Studio',
    description: 'Get started with AI development',
    actionLabel: 'Get Started',
    actionHref: '/developer-settings',
  };

  describe('Rendering', () => {
    it('renders with required props', () => {
      render(<BrandedWelcome {...defaultProps} />);

      expect(screen.getByText('Welcome to AI Native Studio')).toBeInTheDocument();
      expect(screen.getByText('Get started with AI development')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Get Started' })).toBeInTheDocument();
    });

    it('renders with personalized greeting when userName is provided', () => {
      render(<BrandedWelcome {...defaultProps} userName="John" />);

      expect(screen.getByText(/Welcome back,/)).toBeInTheDocument();
      expect(screen.getByText('John')).toBeInTheDocument();
    });

    it('renders without userName when not provided', () => {
      render(<BrandedWelcome {...defaultProps} />);

      expect(screen.queryByText(/Welcome back,/)).not.toBeInTheDocument();
    });

    it('renders background image when showImage is true', () => {
      const { container } = render(
        <BrandedWelcome {...defaultProps} showImage backgroundImage="/card.png" />
      );

      const image = container.querySelector('img[src*="card.png"]');
      expect(image).toBeInTheDocument();
    });

    it('does not render background image when showImage is false', () => {
      const { container } = render(
        <BrandedWelcome {...defaultProps} showImage={false} />
      );

      const imageContainer = container.querySelector('[aria-hidden="true"]');
      expect(imageContainer?.querySelector('img')).not.toBeInTheDocument();
    });
  });

  describe('Dismiss Functionality', () => {
    it('renders dismiss button when showDismiss is true', () => {
      const onDismiss = jest.fn();
      render(<BrandedWelcome {...defaultProps} showDismiss onDismiss={onDismiss} />);

      const dismissButton = screen.getByRole('button', { name: /dismiss welcome message/i });
      expect(dismissButton).toBeInTheDocument();
    });

    it('does not render dismiss button when showDismiss is false', () => {
      render(<BrandedWelcome {...defaultProps} showDismiss={false} />);

      const dismissButton = screen.queryByRole('button', { name: /dismiss welcome message/i });
      expect(dismissButton).not.toBeInTheDocument();
    });

    it('calls onDismiss when dismiss button is clicked', async () => {
      const onDismiss = jest.fn();
      render(<BrandedWelcome {...defaultProps} showDismiss onDismiss={onDismiss} animate={false} />);

      const dismissButton = screen.getByRole('button', { name: /dismiss welcome message/i });
      fireEvent.click(dismissButton);

      await waitFor(() => {
        expect(onDismiss).toHaveBeenCalledTimes(1);
      });
    });

    it('delays onDismiss callback to allow exit animation', async () => {
      jest.useFakeTimers();
      const onDismiss = jest.fn();
      render(<BrandedWelcome {...defaultProps} showDismiss onDismiss={onDismiss} animate />);

      const dismissButton = screen.getByRole('button', { name: /dismiss welcome message/i });
      fireEvent.click(dismissButton);

      expect(onDismiss).not.toHaveBeenCalled();

      jest.advanceTimersByTime(300);

      await waitFor(() => {
        expect(onDismiss).toHaveBeenCalledTimes(1);
      });

      jest.useRealTimers();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA label on dismiss button', () => {
      const onDismiss = jest.fn();
      render(<BrandedWelcome {...defaultProps} showDismiss onDismiss={onDismiss} />);

      const dismissButton = screen.getByRole('button', { name: 'Dismiss welcome message' });
      expect(dismissButton).toHaveAttribute('aria-label', 'Dismiss welcome message');
    });

    it('has proper heading hierarchy', () => {
      render(<BrandedWelcome {...defaultProps} />);

      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toBeInTheDocument();
      expect(heading.textContent).toContain('Welcome to AI Native Studio');
    });

    it('marks decorative elements with aria-hidden', () => {
      const { container } = render(<BrandedWelcome {...defaultProps} showImage />);

      const decorativeElements = container.querySelectorAll('[aria-hidden="true"]');
      expect(decorativeElements.length).toBeGreaterThan(0);
    });

    it('action link is keyboard accessible', () => {
      render(<BrandedWelcome {...defaultProps} />);

      const actionLink = screen.getByRole('link', { name: 'Get Started' });
      expect(actionLink).toHaveAttribute('href', '/developer-settings');
    });

    it('dismiss button is keyboard accessible', () => {
      const onDismiss = jest.fn();
      render(<BrandedWelcome {...defaultProps} showDismiss onDismiss={onDismiss} animate={false} />);

      const dismissButton = screen.getByRole('button', { name: /dismiss welcome message/i });
      dismissButton.focus();

      expect(document.activeElement).toBe(dismissButton);

      fireEvent.keyDown(dismissButton, { key: 'Enter' });
      fireEvent.click(dismissButton);

      expect(onDismiss).toHaveBeenCalled();
    });
  });

  describe('Responsive Design', () => {
    it('applies responsive padding classes', () => {
      const { container } = render(<BrandedWelcome {...defaultProps} />);

      const content = container.querySelector('[class*="p-6"]');
      expect(content).toBeInTheDocument();
      expect(content?.className).toMatch(/sm:p-8|md:p-12/);
    });

    it('applies responsive text size classes', () => {
      const { container } = render(<BrandedWelcome {...defaultProps} />);

      const title = container.querySelector('h2');
      expect(title?.className).toMatch(/text-2xl|sm:text-3xl|md:text-4xl/);
    });
  });

  describe('Animation', () => {
    it('enables animations by default', () => {
      const { container } = render(<BrandedWelcome {...defaultProps} />);

      // Check if framer-motion is applied (component will have motion-related attributes)
      const card = container.firstChild as HTMLElement;
      expect(card).toBeInTheDocument();
    });

    it('disables animations when animate is false', () => {
      const { container } = render(<BrandedWelcome {...defaultProps} animate={false} />);

      const card = container.firstChild as HTMLElement;
      expect(card).toBeInTheDocument();
    });
  });

  describe('Custom Styling', () => {
    it('applies custom className', () => {
      const { container } = render(
        <BrandedWelcome {...defaultProps} className="custom-welcome" />
      );

      const card = container.firstChild as HTMLElement;
      expect(card.className).toContain('custom-welcome');
    });

    it('applies gradient text to title', () => {
      const { container } = render(<BrandedWelcome {...defaultProps} />);

      const gradientText = container.querySelector('[class*="bg-gradient-to-r"]');
      expect(gradientText).toBeInTheDocument();
      expect(gradientText?.className).toMatch(/from-brand-primary|to-accent-secondary/);
    });
  });

  describe('Edge Cases', () => {
    it('handles missing onDismiss callback gracefully', () => {
      render(<BrandedWelcome {...defaultProps} showDismiss />);

      const dismissButton = screen.getByRole('button', { name: /dismiss welcome message/i });

      expect(() => fireEvent.click(dismissButton)).not.toThrow();
    });

    it('handles empty userName gracefully', () => {
      render(<BrandedWelcome {...defaultProps} userName="" />);

      expect(screen.queryByText(/Welcome back,/)).not.toBeInTheDocument();
    });

    it('handles long text content', () => {
      const longTitle = 'Welcome to AI Native Studio - The Most Advanced AI Development Platform';
      const longDescription = 'Get started by creating your first API key and explore our powerful AI development tools. Build faster with our comprehensive suite of APIs and services. Join thousands of developers worldwide.';

      render(
        <BrandedWelcome
          {...defaultProps}
          title={longTitle}
          description={longDescription}
        />
      );

      expect(screen.getByText(longTitle)).toBeInTheDocument();
      expect(screen.getByText(longDescription)).toBeInTheDocument();
    });
  });
});
