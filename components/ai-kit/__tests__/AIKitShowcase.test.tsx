import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AIKitShowcase from '../AIKitShowcase';

describe('AIKitShowcase', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render without crashing', () => {
      // Given/When
      const { container } = render(<AIKitShowcase />);

      // Then
      expect(container).toBeInTheDocument();
    });

    it('should display showcase heading', () => {
      // Given/When
      render(<AIKitShowcase />);

      // Then
      expect(screen.getByRole('heading', { name: /interactive component demos/i })).toBeInTheDocument();
    });

    it('should display package stats', () => {
      // Given/When
      render(<AIKitShowcase />);

      // Then
      expect(screen.getByText(/downloads/i)).toBeInTheDocument();
      expect(screen.getByText(/components/i)).toBeInTheDocument();
    });

    it('should display all component demo sections', () => {
      // Given/When
      render(<AIKitShowcase />);

      // Then
      expect(screen.getByText(/AIKitButton/i)).toBeInTheDocument();
      expect(screen.getByText(/AIKitTextField/i)).toBeInTheDocument();
      expect(screen.getByText(/AIKitSlider/i)).toBeInTheDocument();
      expect(screen.getByText(/AIKitCheckBox/i)).toBeInTheDocument();
      expect(screen.getByText(/AIKitChoicePicker/i)).toBeInTheDocument();
      expect(screen.getByText(/AIKitDivider/i)).toBeInTheDocument();
    });
  });

  describe('Component Demos', () => {
    it('should render AIKitButton demo with all variants', () => {
      // Given/When
      render(<AIKitShowcase />);

      // Then
      expect(screen.getByText(/primary/i)).toBeInTheDocument();
      expect(screen.getByText(/secondary/i)).toBeInTheDocument();
      expect(screen.getByText(/outline/i)).toBeInTheDocument();
    });

    it('should render interactive TextField demo', () => {
      // Given/When
      render(<AIKitShowcase />);

      // Then
      const textFields = screen.getAllByRole('textbox');
      expect(textFields.length).toBeGreaterThan(0);
    });

    it('should render slider demo with value display', () => {
      // Given/When
      render(<AIKitShowcase />);

      // Then
      expect(screen.getByRole('slider')).toBeInTheDocument();
    });

    it('should render checkbox demo', () => {
      // Given/When
      render(<AIKitShowcase />);

      // Then
      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes.length).toBeGreaterThan(0);
    });
  });

  describe('Code Examples', () => {
    it('should display code examples for each component', () => {
      // Given/When
      render(<AIKitShowcase />);

      // Then
      const codeBlocks = screen.getAllByRole('region', { name: /code example/i });
      expect(codeBlocks.length).toBeGreaterThan(0);
    });

    it('should have copy buttons for code examples', () => {
      // Given/When
      render(<AIKitShowcase />);

      // Then
      const copyButtons = screen.getAllByRole('button', { name: /copy/i });
      expect(copyButtons.length).toBeGreaterThan(0);
    });

    it('should copy code to clipboard when copy button clicked', async () => {
      // Given
      const user = userEvent.setup();
      Object.assign(navigator, {
        clipboard: {
          writeText: jest.fn(() => Promise.resolve()),
        },
      });
      render(<AIKitShowcase />);

      // When
      const copyButton = screen.getAllByRole('button', { name: /copy/i })[0];
      await user.click(copyButton);

      // Then
      expect(navigator.clipboard.writeText).toHaveBeenCalled();
    });

    it('should show copied confirmation after copying', async () => {
      // Given
      const user = userEvent.setup();
      Object.assign(navigator, {
        clipboard: {
          writeText: jest.fn(() => Promise.resolve()),
        },
      });
      render(<AIKitShowcase />);

      // When
      const copyButton = screen.getAllByRole('button', { name: /copy/i })[0];
      await user.click(copyButton);

      // Then
      await waitFor(() => {
        expect(screen.getByText(/copied/i)).toBeInTheDocument();
      });
    });
  });

  describe('Interactive Demos', () => {
    it('should allow button clicks in demo', async () => {
      // Given
      const user = userEvent.setup();
      render(<AIKitShowcase />);

      // When
      const demoButton = screen.getAllByRole('button')[0];
      await user.click(demoButton);

      // Then
      expect(demoButton).toBeInTheDocument();
    });

    it('should update slider value when moved', async () => {
      // Given
      const user = userEvent.setup();
      render(<AIKitShowcase />);

      // When
      const sliders = screen.getAllByRole('slider');
      await user.click(sliders[0]);

      // Then
      expect(sliders[0]).toHaveAttribute('aria-valuenow');
    });

    it('should toggle checkbox when clicked', async () => {
      // Given
      const user = userEvent.setup();
      render(<AIKitShowcase />);

      // When
      const checkbox = screen.getAllByRole('checkbox')[0];
      const initialState = checkbox.getAttribute('aria-checked');
      await user.click(checkbox);

      // Then
      await waitFor(() => {
        expect(checkbox.getAttribute('aria-checked')).not.toBe(initialState);
      });
    });

    it('should allow text input in TextField demo', async () => {
      // Given
      const user = userEvent.setup();
      render(<AIKitShowcase />);

      // When
      const textField = screen.getAllByRole('textbox')[0];
      await user.type(textField, 'Test input');

      // Then
      expect(textField).toHaveValue('Test input');
    });
  });

  describe('Documentation Links', () => {
    it('should display link to full documentation', () => {
      // Given/When
      render(<AIKitShowcase />);

      // Then
      const docLinks = screen.getAllByRole('link', { name: /documentation/i });
      expect(docLinks.length).toBeGreaterThan(0);
    });

    it('should have correct documentation URL', () => {
      // Given/When
      render(<AIKitShowcase />);

      // Then
      const docLink = screen.getAllByRole('link', { name: /documentation/i })[0];
      expect(docLink).toHaveAttribute('href');
    });

    it('should have GitHub link for component library', () => {
      // Given/When
      render(<AIKitShowcase />);

      // Then
      expect(screen.getByRole('link', { name: /github/i })).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      // Given/When
      render(<AIKitShowcase />);

      // Then
      const headings = screen.getAllByRole('heading');
      expect(headings.length).toBeGreaterThan(0);
    });

    it('should have accessible labels for interactive elements', () => {
      // Given/When
      render(<AIKitShowcase />);

      // Then
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toHaveAccessibleName();
      });
    });

    it('should support keyboard navigation', async () => {
      // Given
      const user = userEvent.setup();
      render(<AIKitShowcase />);

      // When
      await user.tab();

      // Then
      expect(document.activeElement).toBeDefined();
    });

    it('should have ARIA labels for code regions', () => {
      // Given/When
      render(<AIKitShowcase />);

      // Then
      const codeRegions = screen.getAllByRole('region');
      codeRegions.forEach(region => {
        expect(region).toHaveAttribute('aria-label');
      });
    });
  });

  describe('Responsive Layout', () => {
    it('should render demo grid layout', () => {
      // Given/When
      const { container } = render(<AIKitShowcase />);

      // Then
      expect(container.querySelector('.grid')).toBeInTheDocument();
    });

    it('should have mobile-friendly spacing', () => {
      // Given/When
      const { container } = render(<AIKitShowcase />);

      // Then
      expect(container.firstChild).toHaveClass('space-y-12');
    });
  });

  describe('Edge Cases', () => {
    it('should handle clipboard API not available', async () => {
      // Given
      const user = userEvent.setup();
      const originalClipboard = navigator.clipboard;
      Object.defineProperty(navigator, 'clipboard', {
        value: undefined,
        writable: true,
        configurable: true,
      });
      render(<AIKitShowcase />);

      // When
      const copyButton = screen.getAllByRole('button', { name: /copy/i })[0];
      await user.click(copyButton);

      // Then
      expect(copyButton).toBeInTheDocument();

      // Cleanup
      Object.defineProperty(navigator, 'clipboard', {
        value: originalClipboard,
        writable: true,
        configurable: true,
      });
    });

    it('should render with all props optional', () => {
      // Given/When
      const { container } = render(<AIKitShowcase />);

      // Then
      expect(container).toBeInTheDocument();
    });
  });
});
