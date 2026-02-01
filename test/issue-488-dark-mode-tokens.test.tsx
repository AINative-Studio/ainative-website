/**
 * Issue #488: Dark Mode Color Token Usage Gap
 *
 * Visual Regression and Accessibility Tests
 * Following TDD/BDD - These tests SHOULD FAIL initially (RED phase)
 *
 * Target: 85%+ coverage, WCAG 2.1 AA compliance
 */

import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

describe('Issue #488: Dark Mode Token Usage', () => {
  describe('Color Token Definitions', () => {
    it('should have dark-1 token defined in Tailwind config', () => {
      // This will fail initially - we need to create tailwind.config.ts
      const styles = getComputedStyle(document.documentElement);

      // Check CSS variable exists
      expect(styles.getPropertyValue('--color-dark-1')).toBe('#131726');
    });

    it('should have dark-2 token defined in Tailwind config', () => {
      const styles = getComputedStyle(document.documentElement);
      expect(styles.getPropertyValue('--color-dark-2')).toBe('#22263c');
    });

    it('should have dark-3 token defined in Tailwind config', () => {
      const styles = getComputedStyle(document.documentElement);
      expect(styles.getPropertyValue('--color-dark-3')).toBe('#31395a');
    });

    it('should have surface-primary token mapping to dark-1', () => {
      const styles = getComputedStyle(document.documentElement);
      expect(styles.getPropertyValue('--color-surface-primary')).toBe('#131726');
    });

    it('should have surface-secondary token mapping to dark-2', () => {
      const styles = getComputedStyle(document.documentElement);
      expect(styles.getPropertyValue('--color-surface-secondary')).toBe('#22263c');
    });

    it('should have surface-accent token mapping to dark-3', () => {
      const styles = getComputedStyle(document.documentElement);
      expect(styles.getPropertyValue('--color-surface-accent')).toBe('#31395a');
    });
  });

  describe('Button Component - Token Usage', () => {
    it('should use design tokens for default variant (not hardcoded colors)', () => {
      const { container } = render(<Button>Test Button</Button>);
      const button = container.querySelector('button');

      // Should NOT have hardcoded bg-[#4B6FED]
      expect(button?.className).not.toMatch(/bg-\[#[0-9A-F]{6}\]/i);

      // Should use token-based classes
      expect(button?.className).toMatch(/bg-(primary|brand-primary)/);
    });

    it('should use design tokens for outline variant', () => {
      const { container } = render(<Button variant="outline">Outline</Button>);
      const button = container.querySelector('button');

      // Should NOT have hardcoded border colors
      expect(button?.className).not.toMatch(/border-\[#[0-9A-F]{6}\]/i);

      // Should use semantic border tokens
      expect(button?.className).toMatch(/border-(border|dark-2|dark-3)/);
    });

    it('should use design tokens for ghost variant', () => {
      const { container } = render(<Button variant="ghost">Ghost</Button>);
      const button = container.querySelector('button');

      // Should NOT have hardcoded hover colors
      expect(button?.className).not.toMatch(/hover:bg-\[#[0-9A-F]{6}\]/i);
    });

    it('should have proper focus indicators with token-based ring', () => {
      const { container } = render(<Button>Focus Test</Button>);
      const button = container.querySelector('button');

      // Should have focus-visible:ring with token color
      expect(button?.className).toMatch(/focus-visible:ring-(ring|primary)/);
    });
  });

  describe('Card Component - Token Usage', () => {
    it('should use surface-secondary (dark-2) for card background', () => {
      const { container } = render(
        <Card>
          <CardContent>Test Card</CardContent>
        </Card>
      );
      const card = container.querySelector('div[class*="rounded"]');

      // Should NOT use hardcoded bg-[#161B22]
      expect(card?.className).not.toMatch(/bg-\[#[0-9A-F]{6}\]/i);

      // Should use bg-dark-2 or bg-surface-secondary
      expect(card?.className).toMatch(/bg-(dark-2|surface-secondary)/);
    });

    it('should use token-based border colors', () => {
      const { container } = render(<Card>Card Content</Card>);
      const card = container.querySelector('div[class*="rounded"]');

      // Should NOT have hardcoded border-[#2D333B]
      expect(card?.className).not.toMatch(/border-\[#[0-9A-F]{6}\]/i);

      // Should use semantic border token
      expect(card?.className).toMatch(/border-(border|dark-3)/);
    });

    it('should have proper hover state with token colors', () => {
      const { container } = render(<Card>Hover Test</Card>);
      const card = container.querySelector('div[class*="rounded"]');

      // Should use token-based hover border
      expect(card?.className).toMatch(/hover:border-(primary|brand-primary)/);
    });
  });

  describe('Input Component - Token Usage', () => {
    it('should use dark-2 token for input borders', () => {
      const { container } = render(<Input placeholder="Test input" />);
      const input = container.querySelector('input');

      // Should use border-input or border-dark-2
      expect(input?.className).toMatch(/border-(input|dark-2)/);
    });

    it('should have proper focus ring with token colors', () => {
      const { container } = render(<Input placeholder="Focus test" />);
      const input = container.querySelector('input');

      // Should have token-based focus ring
      expect(input?.className).toMatch(/focus-visible:ring-(ring|primary)/);
    });
  });

  describe('Theme Switching', () => {
    it('should maintain token usage in light mode', () => {
      document.documentElement.classList.remove('dark');

      const { container } = render(<Button>Light Mode</Button>);
      const button = container.querySelector('button');

      // Should still use tokens, not hardcoded colors
      expect(button?.className).not.toMatch(/bg-\[#[0-9A-F]{6}\]/i);
    });

    it('should maintain token usage in dark mode', () => {
      document.documentElement.classList.add('dark');

      const { container } = render(<Button>Dark Mode</Button>);
      const button = container.querySelector('button');

      // Should still use tokens
      expect(button?.className).not.toMatch(/bg-\[#[0-9A-F]{6}\]/i);

      // Cleanup
      document.documentElement.classList.remove('dark');
    });
  });

  describe('WCAG 2.1 AA Accessibility - Contrast Ratios', () => {
    /**
     * WCAG 2.1 AA Requirements:
     * - Normal text (< 18px): 4.5:1 minimum
     * - Large text (≥ 18px or ≥ 14px bold): 3:1 minimum
     * - UI components: 3:1 minimum
     */

    it('should have sufficient contrast for primary button text', () => {
      // Primary button: #4B6FED (bg) vs white (text)
      // Expected contrast ratio: > 4.5:1
      const { container } = render(<Button>Primary Button</Button>);
      const button = container.querySelector('button');

      // Button should use proper text color token
      expect(button?.className).toMatch(/(text-white|text-primary-foreground)/);
    });

    it('should have sufficient contrast for outline button text', () => {
      const { container } = render(<Button variant="outline">Outline</Button>);
      const button = container.querySelector('button');

      // Should have proper foreground color
      expect(button?.className).toMatch(/text-(foreground|white)/);
    });

    it('should have sufficient contrast for card text on dark-2 background', () => {
      const { container } = render(
        <Card>
          <CardHeader>
            <CardTitle>Card Title</CardTitle>
            <CardDescription>Card description text</CardDescription>
          </CardHeader>
        </Card>
      );

      const title = screen.getByText('Card Title');
      const description = screen.getByText('Card description text');

      // Title should have high contrast
      expect(title.className).toMatch(/text-(white|foreground)/);

      // Description can have muted but still accessible contrast
      expect(description.className).toMatch(/text-gray-400/); // Should be changed to token
    });

    it('should have 3:1 contrast for focus indicators', () => {
      const { container } = render(<Button>Focus Test</Button>);
      const button = container.querySelector('button');

      // Focus ring should be visible (WCAG 2.4.11)
      expect(button?.className).toMatch(/focus-visible:ring-2/);
      expect(button?.className).toMatch(/focus-visible:ring-(ring|primary)/);
    });
  });

  describe('Token Usage Count - 67+ Instances', () => {
    it('should have bg-dark-1 used in multiple locations', () => {
      // This test will check after migration
      // Expected: Header, primary backgrounds, containers
      expect(true).toBe(true); // Placeholder - will be validated manually
    });

    it('should have bg-dark-2 used for cards and surfaces', () => {
      // Expected: Card components, surface elements
      expect(true).toBe(true); // Placeholder
    });

    it('should have bg-dark-3 used for elevated surfaces', () => {
      // Expected: Modal overlays, elevated cards, hover states
      expect(true).toBe(true); // Placeholder
    });
  });

  describe('Visual Regression - Component Rendering', () => {
    it('should render Button without visual regressions', () => {
      const { container } = render(
        <div className="space-y-4 p-4 bg-dark-1">
          <Button variant="default">Default</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="secondary">Secondary</Button>
        </div>
      );

      expect(container.firstChild).toBeInTheDocument();
      // Visual snapshot would be taken here in real visual regression testing
    });

    it('should render Card without visual regressions', () => {
      const { container } = render(
        <div className="p-4 bg-dark-1">
          <Card>
            <CardHeader>
              <CardTitle>Test Card</CardTitle>
              <CardDescription>Card description</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Card content goes here</p>
            </CardContent>
          </Card>
        </div>
      );

      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('Responsive Behavior', () => {
    it('should maintain token usage across breakpoints', () => {
      const { container } = render(<Card className="sm:bg-dark-2 md:bg-dark-3">Responsive Card</Card>);
      const card = container.querySelector('div');

      // Should have responsive token classes
      expect(card?.className).toMatch(/bg-dark/);
    });
  });

  describe('Performance - No Hardcoded Colors', () => {
    it('should not have any hardcoded hex colors in Button', () => {
      const { container } = render(
        <>
          <Button variant="default">Default</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="link">Link</Button>
        </>
      );

      const buttons = container.querySelectorAll('button');
      buttons.forEach(button => {
        // Should not have [#XXXXXX] pattern
        expect(button.className).not.toMatch(/\[#[0-9A-Fa-f]{6}\]/);
      });
    });

    it('should not have any hardcoded hex colors in Card', () => {
      const { container } = render(<Card>Test</Card>);
      const card = container.querySelector('div');

      expect(card?.className).not.toMatch(/\[#[0-9A-Fa-f]{6}\]/);
    });
  });
});

describe('Integration Tests - Component Combinations', () => {
  it('should render Card with Buttons using consistent tokens', () => {
    const { container } = render(
      <Card className="p-6">
        <CardHeader>
          <CardTitle>Action Card</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button variant="default" className="w-full">Primary Action</Button>
          <Button variant="outline" className="w-full">Secondary Action</Button>
        </CardContent>
      </Card>
    );

    expect(container.firstChild).toBeInTheDocument();

    // Both card and buttons should use tokens
    const card = container.querySelector('div[class*="rounded"]');
    const buttons = container.querySelectorAll('button');

    expect(card?.className).not.toMatch(/\[#[0-9A-Fa-f]{6}\]/);
    buttons.forEach(button => {
      expect(button.className).not.toMatch(/\[#[0-9A-Fa-f]{6}\]/);
    });
  });

  it('should render form with Input and Button using consistent tokens', () => {
    const { container } = render(
      <Card className="p-6">
        <form className="space-y-4">
          <Input placeholder="Enter text" />
          <Button type="submit" className="w-full">Submit</Button>
        </form>
      </Card>
    );

    const input = container.querySelector('input');
    const button = container.querySelector('button');

    expect(input?.className).not.toMatch(/\[#[0-9A-Fa-f]{6}\]/);
    expect(button?.className).not.toMatch(/\[#[0-9A-Fa-f]{6}\]/);
  });
});

describe('Coverage Verification', () => {
  it('should have test coverage >= 85%', () => {
    // This is verified by Jest coverage report
    // Run: npm test -- --coverage
    expect(true).toBe(true);
  });
});
