import { render, screen } from '@/test/test-utils';
import { Separator } from '../separator';

describe('Separator', () => {
  it('renders a separator element', () => {
    render(<Separator data-testid="separator" />);
    expect(screen.getByTestId('separator')).toBeInTheDocument();
  });

  it('renders horizontal by default', () => {
    render(<Separator data-testid="separator" />);
    const separator = screen.getByTestId('separator');
    expect(separator).toHaveClass('h-[1px]', 'w-full');
  });

  it('renders vertical orientation', () => {
    render(<Separator orientation="vertical" data-testid="separator" />);
    const separator = screen.getByTestId('separator');
    expect(separator).toHaveClass('h-full', 'w-[1px]');
  });

  it('has base styling classes', () => {
    render(<Separator data-testid="separator" />);
    const separator = screen.getByTestId('separator');
    expect(separator).toHaveClass('shrink-0', 'bg-border');
  });

  it('applies custom className', () => {
    render(<Separator className="my-4" data-testid="separator" />);
    expect(screen.getByTestId('separator')).toHaveClass('my-4');
  });

  it('forwards ref correctly', () => {
    const ref = { current: null };
    render(<Separator ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('is decorative by default', () => {
    render(<Separator data-testid="separator" />);
    expect(screen.getByTestId('separator')).toHaveAttribute('data-orientation', 'horizontal');
  });

  it('can be non-decorative', () => {
    render(<Separator decorative={false} data-testid="separator" />);
    expect(screen.getByTestId('separator')).toBeInTheDocument();
  });
});
