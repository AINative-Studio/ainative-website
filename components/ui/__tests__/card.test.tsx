import { render, screen } from '@/test/test-utils';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '../card';

describe('Card', () => {
  it('renders with children', () => {
    render(<Card data-testid="card">Card content</Card>);
    expect(screen.getByTestId('card')).toHaveTextContent('Card content');
  });

  it('applies custom className', () => {
    render(<Card className="custom-class" data-testid="card">Content</Card>);
    expect(screen.getByTestId('card')).toHaveClass('custom-class');
  });

  it('forwards ref correctly', () => {
    const ref = { current: null };
    render(<Card ref={ref}>Content</Card>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('has default styling classes', () => {
    render(<Card data-testid="card">Content</Card>);
    expect(screen.getByTestId('card')).toHaveClass('rounded-lg', 'border', 'shadow-sm');
  });
});

describe('CardHeader', () => {
  it('renders with children', () => {
    render(<CardHeader data-testid="header">Header content</CardHeader>);
    expect(screen.getByTestId('header')).toHaveTextContent('Header content');
  });

  it('applies custom className', () => {
    render(<CardHeader className="custom-class" data-testid="header">Content</CardHeader>);
    expect(screen.getByTestId('header')).toHaveClass('custom-class');
  });
});

describe('CardTitle', () => {
  it('renders with children', () => {
    render(<CardTitle>Title content</CardTitle>);
    expect(screen.getByText('Title content')).toBeInTheDocument();
  });

  it('has text styling classes', () => {
    render(<CardTitle data-testid="title">Title</CardTitle>);
    expect(screen.getByTestId('title')).toHaveClass('text-2xl', 'font-semibold');
  });
});

describe('CardDescription', () => {
  it('renders with children', () => {
    render(<CardDescription>Description content</CardDescription>);
    expect(screen.getByText('Description content')).toBeInTheDocument();
  });

  it('has muted text styling', () => {
    render(<CardDescription data-testid="desc">Description</CardDescription>);
    expect(screen.getByTestId('desc')).toHaveClass('text-sm', 'text-muted-foreground');
  });
});

describe('CardContent', () => {
  it('renders with children', () => {
    render(<CardContent data-testid="content">Content here</CardContent>);
    expect(screen.getByTestId('content')).toHaveTextContent('Content here');
  });

  it('has padding classes', () => {
    render(<CardContent data-testid="content">Content</CardContent>);
    expect(screen.getByTestId('content')).toHaveClass('p-6', 'pt-0');
  });
});

describe('CardFooter', () => {
  it('renders with children', () => {
    render(<CardFooter data-testid="footer">Footer content</CardFooter>);
    expect(screen.getByTestId('footer')).toHaveTextContent('Footer content');
  });

  it('has flex layout', () => {
    render(<CardFooter data-testid="footer">Footer</CardFooter>);
    expect(screen.getByTestId('footer')).toHaveClass('flex', 'items-center');
  });
});

describe('Card composition', () => {
  it('renders a complete card with all parts', () => {
    render(
      <Card data-testid="card">
        <CardHeader>
          <CardTitle>Test Card</CardTitle>
          <CardDescription>A test description</CardDescription>
        </CardHeader>
        <CardContent>Main content here</CardContent>
        <CardFooter>Footer actions</CardFooter>
      </Card>
    );

    expect(screen.getByTestId('card')).toBeInTheDocument();
    expect(screen.getByText('Test Card')).toBeInTheDocument();
    expect(screen.getByText('A test description')).toBeInTheDocument();
    expect(screen.getByText('Main content here')).toBeInTheDocument();
    expect(screen.getByText('Footer actions')).toBeInTheDocument();
  });
});
