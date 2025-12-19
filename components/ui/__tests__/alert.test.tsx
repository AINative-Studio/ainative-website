import { render, screen } from '@/test/test-utils';
import { Alert, AlertTitle, AlertDescription } from '../alert';

describe('Alert', () => {
  it('renders with children', () => {
    render(<Alert>Alert content</Alert>);
    expect(screen.getByRole('alert')).toHaveTextContent('Alert content');
  });

  it('has role="alert"', () => {
    render(<Alert>Test alert</Alert>);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('renders with default variant', () => {
    render(<Alert data-testid="alert">Default</Alert>);
    expect(screen.getByTestId('alert')).toHaveClass('bg-background');
  });

  it('renders with destructive variant', () => {
    render(<Alert variant="destructive" data-testid="alert">Error</Alert>);
    expect(screen.getByTestId('alert')).toHaveClass('text-destructive');
  });

  it('applies custom className', () => {
    render(<Alert className="custom-class" data-testid="alert">Custom</Alert>);
    expect(screen.getByTestId('alert')).toHaveClass('custom-class');
  });

  it('forwards ref correctly', () => {
    const ref = { current: null };
    render(<Alert ref={ref}>Content</Alert>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('has base styling classes', () => {
    render(<Alert data-testid="alert">Test</Alert>);
    const alert = screen.getByTestId('alert');
    expect(alert).toHaveClass('relative', 'w-full', 'rounded-lg', 'border');
  });
});

describe('AlertTitle', () => {
  it('renders with children', () => {
    render(<AlertTitle>Alert Title</AlertTitle>);
    expect(screen.getByText('Alert Title')).toBeInTheDocument();
  });

  it('renders as h5 element', () => {
    render(<AlertTitle data-testid="title">Title</AlertTitle>);
    expect(screen.getByTestId('title').tagName).toBe('H5');
  });

  it('has font styling classes', () => {
    render(<AlertTitle data-testid="title">Title</AlertTitle>);
    expect(screen.getByTestId('title')).toHaveClass('font-medium', 'leading-none');
  });

  it('applies custom className', () => {
    render(<AlertTitle className="custom-class" data-testid="title">Title</AlertTitle>);
    expect(screen.getByTestId('title')).toHaveClass('custom-class');
  });

  it('forwards ref correctly', () => {
    const ref = { current: null };
    render(<AlertTitle ref={ref}>Title</AlertTitle>);
    expect(ref.current).toBeInstanceOf(HTMLHeadingElement);
  });
});

describe('AlertDescription', () => {
  it('renders with children', () => {
    render(<AlertDescription>Description text</AlertDescription>);
    expect(screen.getByText('Description text')).toBeInTheDocument();
  });

  it('has text styling classes', () => {
    render(<AlertDescription data-testid="desc">Description</AlertDescription>);
    expect(screen.getByTestId('desc')).toHaveClass('text-sm');
  });

  it('applies custom className', () => {
    render(<AlertDescription className="custom-class" data-testid="desc">Description</AlertDescription>);
    expect(screen.getByTestId('desc')).toHaveClass('custom-class');
  });

  it('forwards ref correctly', () => {
    const ref = { current: null };
    render(<AlertDescription ref={ref}>Description</AlertDescription>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});

describe('Alert composition', () => {
  it('renders a complete alert with title and description', () => {
    render(
      <Alert>
        <AlertTitle>Heads up!</AlertTitle>
        <AlertDescription>
          You can add components to your app using the CLI.
        </AlertDescription>
      </Alert>
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Heads up!')).toBeInTheDocument();
    expect(screen.getByText(/You can add components/)).toBeInTheDocument();
  });

  it('renders destructive alert composition', () => {
    render(
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Something went wrong!</AlertDescription>
      </Alert>
    );

    expect(screen.getByRole('alert')).toHaveClass('text-destructive');
    expect(screen.getByText('Error')).toBeInTheDocument();
    expect(screen.getByText('Something went wrong!')).toBeInTheDocument();
  });
});
