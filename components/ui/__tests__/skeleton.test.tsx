import { render, screen } from '@/test/test-utils';
import { Skeleton } from '../skeleton';

describe('Skeleton', () => {
  it('renders a div element', () => {
    render(<Skeleton data-testid="skeleton" />);
    expect(screen.getByTestId('skeleton')).toBeInTheDocument();
  });

  it('has animation classes', () => {
    render(<Skeleton data-testid="skeleton" />);
    expect(screen.getByTestId('skeleton')).toHaveClass('animate-pulse');
  });

  it('has rounded styling', () => {
    render(<Skeleton data-testid="skeleton" />);
    expect(screen.getByTestId('skeleton')).toHaveClass('rounded-md');
  });

  it('has background styling', () => {
    render(<Skeleton data-testid="skeleton" />);
    expect(screen.getByTestId('skeleton')).toHaveClass('bg-primary/10');
  });

  it('applies custom className', () => {
    render(<Skeleton className="h-12 w-12" data-testid="skeleton" />);
    const skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toHaveClass('h-12', 'w-12');
  });

  it('passes additional props', () => {
    render(<Skeleton data-testid="skeleton" aria-label="Loading" />);
    expect(screen.getByTestId('skeleton')).toHaveAttribute('aria-label', 'Loading');
  });

  it('can render with custom dimensions', () => {
    render(<Skeleton className="h-4 w-[250px]" data-testid="skeleton" />);
    const skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toHaveClass('h-4');
  });
});
