import { render, screen } from '@testing-library/react';
import AdminCard from '../AdminCard';

describe('AdminCard', () => {
  describe('Rendering', () => {
    it('should render card with title and children', () => {
      render(
        <AdminCard title="Test Card">
          <p>Card content</p>
        </AdminCard>
      );

      expect(screen.getByText('Test Card')).toBeInTheDocument();
      expect(screen.getByText('Card content')).toBeInTheDocument();
    });

    it('should render card without title', () => {
      render(
        <AdminCard>
          <p>Card content</p>
        </AdminCard>
      );

      expect(screen.getByText('Card content')).toBeInTheDocument();
    });

    it('should render description when provided', () => {
      render(
        <AdminCard title="Test Card" description="Test description">
          <p>Card content</p>
        </AdminCard>
      );

      expect(screen.getByText('Test description')).toBeInTheDocument();
    });

    it('should render icon when provided', () => {
      const TestIcon = () => <svg data-testid="test-icon" />;

      render(
        <AdminCard title="Test Card" icon={TestIcon}>
          <p>Card content</p>
        </AdminCard>
      );

      expect(screen.getByTestId('test-icon')).toBeInTheDocument();
    });

    it('should render actions when provided', () => {
      render(
        <AdminCard
          title="Test Card"
          actions={<button>Action</button>}
        >
          <p>Card content</p>
        </AdminCard>
      );

      expect(screen.getByText('Action')).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('should show loading skeleton when loading is true', () => {
      render(
        <AdminCard title="Test Card" loading>
          <p>Card content</p>
        </AdminCard>
      );

      expect(screen.getByText('Loading...')).toBeInTheDocument();
      expect(screen.queryByText('Card content')).not.toBeInTheDocument();
    });

    it('should show content when loading is false', () => {
      render(
        <AdminCard title="Test Card" loading={false}>
          <p>Card content</p>
        </AdminCard>
      );

      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      expect(screen.getByText('Card content')).toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('should show error message when error is provided', () => {
      render(
        <AdminCard title="Test Card" error="Something went wrong">
          <p>Card content</p>
        </AdminCard>
      );

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      expect(screen.queryByText('Card content')).not.toBeInTheDocument();
    });

    it('should show error with retry button', () => {
      const onRetry = jest.fn();

      render(
        <AdminCard
          title="Test Card"
          error="Something went wrong"
          onRetry={onRetry}
        >
          <p>Card content</p>
        </AdminCard>
      );

      const retryButton = screen.getByText('Try Again');
      expect(retryButton).toBeInTheDocument();
    });

    it('should call onRetry when retry button is clicked', () => {
      const onRetry = jest.fn();

      render(
        <AdminCard
          title="Test Card"
          error="Something went wrong"
          onRetry={onRetry}
        >
          <p>Card content</p>
        </AdminCard>
      );

      const retryButton = screen.getByText('Try Again');
      retryButton.click();

      expect(onRetry).toHaveBeenCalledTimes(1);
    });
  });

  describe('Empty State', () => {
    it('should show empty state when empty is true', () => {
      render(
        <AdminCard
          title="Test Card"
          empty
          emptyMessage="No data available"
        >
          <p>Card content</p>
        </AdminCard>
      );

      expect(screen.getByText('No data available')).toBeInTheDocument();
      expect(screen.queryByText('Card content')).not.toBeInTheDocument();
    });

    it('should show default empty message when none provided', () => {
      render(
        <AdminCard title="Test Card" empty>
          <p>Card content</p>
        </AdminCard>
      );

      expect(screen.getByText('No data to display')).toBeInTheDocument();
    });

    it('should show empty state with custom icon', () => {
      const EmptyIcon = () => <svg data-testid="empty-icon" />;

      render(
        <AdminCard
          title="Test Card"
          empty
          emptyIcon={EmptyIcon}
        >
          <p>Card content</p>
        </AdminCard>
      );

      expect(screen.getByTestId('empty-icon')).toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('should apply custom className', () => {
      const { container } = render(
        <AdminCard title="Test Card" className="custom-class">
          <p>Card content</p>
        </AdminCard>
      );

      const card = container.querySelector('.custom-class');
      expect(card).toBeInTheDocument();
    });

    it('should apply variant styles', () => {
      const { container } = render(
        <AdminCard title="Test Card" variant="outlined">
          <p>Card content</p>
        </AdminCard>
      );

      const card = container.querySelector('.border-2');
      expect(card).toBeInTheDocument();
    });

    it('should apply hover effect when hoverable is true', () => {
      const { container } = render(
        <AdminCard title="Test Card" hoverable>
          <p>Card content</p>
        </AdminCard>
      );

      const card = container.querySelector('.hover\\:shadow-lg');
      expect(card).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      render(
        <AdminCard title="Test Card">
          <p>Card content</p>
        </AdminCard>
      );

      const heading = screen.getByRole('heading', { level: 3 });
      expect(heading).toHaveTextContent('Test Card');
    });

    it('should have aria-label when provided', () => {
      const { container } = render(
        <AdminCard title="Test Card" aria-label="Custom label">
          <p>Card content</p>
        </AdminCard>
      );

      const card = container.querySelector('[aria-label="Custom label"]');
      expect(card).toBeInTheDocument();
    });

    it('should have role="region" when title is provided', () => {
      const { container } = render(
        <AdminCard title="Test Card">
          <p>Card content</p>
        </AdminCard>
      );

      const region = container.querySelector('[role="region"]');
      expect(region).toBeInTheDocument();
    });

    it('should have aria-busy when loading', () => {
      const { container } = render(
        <AdminCard title="Test Card" loading>
          <p>Card content</p>
        </AdminCard>
      );

      const card = container.querySelector('[aria-busy="true"]');
      expect(card).toBeInTheDocument();
    });
  });

  describe('Content', () => {
    it('should render multiple children', () => {
      render(
        <AdminCard title="Test Card">
          <p>First paragraph</p>
          <p>Second paragraph</p>
          <button>Action button</button>
        </AdminCard>
      );

      expect(screen.getByText('First paragraph')).toBeInTheDocument();
      expect(screen.getByText('Second paragraph')).toBeInTheDocument();
      expect(screen.getByText('Action button')).toBeInTheDocument();
    });

    it('should render complex content', () => {
      render(
        <AdminCard title="Test Card">
          <div>
            <ul>
              <li>Item 1</li>
              <li>Item 2</li>
            </ul>
          </div>
        </AdminCard>
      );

      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 2')).toBeInTheDocument();
    });
  });

  describe('Priority States', () => {
    it('should prioritize error over loading', () => {
      render(
        <AdminCard title="Test Card" loading error="Error occurred">
          <p>Card content</p>
        </AdminCard>
      );

      expect(screen.getByText('Error occurred')).toBeInTheDocument();
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    it('should prioritize error over empty', () => {
      render(
        <AdminCard title="Test Card" empty error="Error occurred">
          <p>Card content</p>
        </AdminCard>
      );

      expect(screen.getByText('Error occurred')).toBeInTheDocument();
      expect(screen.queryByText('No data to display')).not.toBeInTheDocument();
    });

    it('should prioritize loading over empty', () => {
      render(
        <AdminCard title="Test Card" loading empty>
          <p>Card content</p>
        </AdminCard>
      );

      expect(screen.getByText('Loading...')).toBeInTheDocument();
      expect(screen.queryByText('No data to display')).not.toBeInTheDocument();
    });
  });
});
