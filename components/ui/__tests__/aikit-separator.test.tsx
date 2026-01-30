/**
 * AIKit Separator/Divider Component - TDD Test Suite
 * Coverage Target: 100%
 */

import { render, screen } from '@/test/test-utils';
import { Separator } from '../separator';
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

describe('AIKit Separator Component - TDD Suite', () => {
  describe('Rendering', () => {
    it('should render horizontal separator by default', () => {
      render(<Separator data-testid="separator" />);
      const separator = screen.getByTestId('separator');
      expect(separator).toBeInTheDocument();
      expect(separator).toHaveClass('h-[1px]');
      expect(separator).toHaveClass('w-full');
    });

    it('should render vertical separator', () => {
      render(<Separator orientation="vertical" data-testid="separator" />);
      const separator = screen.getByTestId('separator');
      expect(separator).toHaveClass('h-full');
      expect(separator).toHaveClass('w-[1px]');
    });

    it('should apply custom className', () => {
      render(<Separator className="custom-divider" data-testid="separator" />);
      expect(screen.getByTestId('separator')).toHaveClass('custom-divider');
    });

    it('should render with decorative role by default', () => {
      render(<Separator data-testid="separator" />);
      expect(screen.getByTestId('separator')).toHaveAttribute('data-orientation', 'horizontal');
    });

    it('should render as semantic separator when decorative=false', () => {
      render(<Separator decorative={false} data-testid="separator" />);
      expect(screen.getByRole('separator')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(
        <div>
          <div>Section 1</div>
          <Separator />
          <div>Section 2</div>
        </div>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper ARIA role when not decorative', () => {
      render(<Separator decorative={false} data-testid="separator" />);
      expect(screen.getByRole('separator')).toHaveAttribute('role', 'separator');
    });

    it('should indicate orientation in ARIA', () => {
      render(<Separator orientation="vertical" decorative={false} data-testid="separator" />);
      const separator = screen.getByRole('separator');
      expect(separator).toHaveAttribute('aria-orientation', 'vertical');
    });

    it('should support aria-label for semantic separators', () => {
      render(<Separator decorative={false} aria-label="Section divider" />);
      expect(screen.getByLabelText('Section divider')).toBeInTheDocument();
    });
  });

  describe('Orientation', () => {
    it('should render horizontal separator', () => {
      render(<Separator orientation="horizontal" data-testid="separator" />);
      const separator = screen.getByTestId('separator');
      expect(separator).toHaveAttribute('data-orientation', 'horizontal');
      expect(separator).toHaveClass('h-[1px]');
      expect(separator).toHaveClass('w-full');
    });

    it('should render vertical separator', () => {
      render(<Separator orientation="vertical" data-testid="separator" />);
      const separator = screen.getByTestId('separator');
      expect(separator).toHaveAttribute('data-orientation', 'vertical');
      expect(separator).toHaveClass('w-[1px]');
      expect(separator).toHaveClass('h-full');
    });
  });

  describe('Dark Theme', () => {
    it('should render correctly in dark theme', () => {
      const { container } = render(
        <div className="dark">
          <Separator data-testid="separator" />
        </div>
      );

      expect(screen.getByTestId('separator')).toBeInTheDocument();
      expect(container.querySelector('.dark')).toBeInTheDocument();
    });

    it('should maintain visibility in dark theme', () => {
      render(
        <div className="dark">
          <Separator data-testid="separator" />
        </div>
      );

      const separator = screen.getByTestId('separator');
      expect(separator).toBeVisible();
      expect(separator).toHaveClass('bg-border');
    });
  });

  describe('Use Cases', () => {
    it('should separate content sections', () => {
      render(
        <div>
          <section>Content 1</section>
          <Separator data-testid="separator" />
          <section>Content 2</section>
        </div>
      );

      expect(screen.getByTestId('separator')).toBeInTheDocument();
      expect(screen.getByText('Content 1')).toBeInTheDocument();
      expect(screen.getByText('Content 2')).toBeInTheDocument();
    });

    it('should work in navigation menus', () => {
      render(
        <nav>
          <a href="#home">Home</a>
          <Separator orientation="vertical" data-testid="separator" />
          <a href="#about">About</a>
        </nav>
      );

      expect(screen.getByTestId('separator')).toBeInTheDocument();
    });

    it('should work in sidebars', () => {
      render(
        <aside>
          <div>Menu Item 1</div>
          <Separator data-testid="separator" />
          <div>Menu Item 2</div>
        </aside>
      );

      expect(screen.getByTestId('separator')).toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('should have border background', () => {
      render(<Separator data-testid="separator" />);
      expect(screen.getByTestId('separator')).toHaveClass('bg-border');
    });

    it('should prevent shrinking', () => {
      render(<Separator data-testid="separator" />);
      expect(screen.getByTestId('separator')).toHaveClass('shrink-0');
    });

    it('should accept style overrides', () => {
      render(
        <Separator
          data-testid="separator"
          style={{ backgroundColor: 'red' }}
        />
      );

      const separator = screen.getByTestId('separator');
      expect(separator).toHaveStyle({ backgroundColor: 'red' });
    });
  });

  describe('Edge Cases', () => {
    it('should render without parent container', () => {
      render(<Separator data-testid="separator" />);
      expect(screen.getByTestId('separator')).toBeInTheDocument();
    });

    it('should render multiple separators', () => {
      render(
        <div>
          <Separator data-testid="sep1" />
          <Separator data-testid="sep2" />
          <Separator data-testid="sep3" />
        </div>
      );

      expect(screen.getByTestId('sep1')).toBeInTheDocument();
      expect(screen.getByTestId('sep2')).toBeInTheDocument();
      expect(screen.getByTestId('sep3')).toBeInTheDocument();
    });

    it('should handle custom data attributes', () => {
      render(<Separator data-testid="separator" data-custom="value" />);
      expect(screen.getByTestId('separator')).toHaveAttribute('data-custom', 'value');
    });
  });

  describe('Ref Forwarding', () => {
    it('should forward ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>();
      render(<Separator ref={ref} />);
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });

    it('should allow measurement via ref', () => {
      const ref = React.createRef<HTMLDivElement>();
      render(<Separator ref={ref} />);

      const { current } = ref;
      expect(current).toBeTruthy();
      expect(current?.getBoundingClientRect).toBeDefined();
    });
  });

  describe('Responsive Behavior', () => {
    it('should maintain width in responsive containers', () => {
      render(
        <div style={{ width: '100px' }}>
          <Separator data-testid="separator" />
        </div>
      );

      const separator = screen.getByTestId('separator');
      expect(separator).toHaveClass('w-full');
    });

    it('should work in flex containers', () => {
      render(
        <div style={{ display: 'flex', flexDirection: 'column', height: '200px' }}>
          <div>Top</div>
          <Separator orientation="horizontal" data-testid="separator" />
          <div>Bottom</div>
        </div>
      );

      expect(screen.getByTestId('separator')).toBeInTheDocument();
    });

    it('should work in grid containers', () => {
      render(
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr' }}>
          <div>Left</div>
          <Separator orientation="vertical" data-testid="separator" />
          <div>Right</div>
        </div>
      );

      expect(screen.getByTestId('separator')).toBeInTheDocument();
    });
  });
});
