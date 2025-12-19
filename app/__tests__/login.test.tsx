import { render, screen, waitFor } from '@/test/test-utils';
import userEvent from '@testing-library/user-event';

// Mock next-auth
jest.mock('next-auth/react', () => ({
  signIn: jest.fn(),
}));

// Import after mocking
import { signIn } from 'next-auth/react';
import LoginPage from '../login/page';

const mockSignIn = signIn as jest.MockedFunction<typeof signIn>;

describe('LoginPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders the login form', () => {
      render(<LoginPage />);

      expect(screen.getByText('Welcome back')).toBeInTheDocument();
      expect(screen.getByText('Sign in to your account to continue')).toBeInTheDocument();
    });

    it('renders the brand logo', () => {
      render(<LoginPage />);

      expect(screen.getByText('AI')).toBeInTheDocument();
      expect(screen.getByText('Native')).toBeInTheDocument();
    });

    it('renders email input', () => {
      render(<LoginPage />);

      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument();
    });

    it('renders password input', () => {
      render(<LoginPage />);

      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    });

    it('renders GitHub login button', () => {
      render(<LoginPage />);

      expect(screen.getByRole('button', { name: /continue with github/i })).toBeInTheDocument();
    });

    it('renders sign in button', () => {
      render(<LoginPage />);

      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });

    it('renders sign up link', () => {
      render(<LoginPage />);

      expect(screen.getByText(/don't have an account/i)).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /sign up/i })).toBeInTheDocument();
    });

    it('renders forgot password link', () => {
      render(<LoginPage />);

      expect(screen.getByRole('link', { name: /forgot password/i })).toBeInTheDocument();
    });
  });

  describe('form submission', () => {
    it('submits form with email and password', async () => {
      mockSignIn.mockResolvedValueOnce({ ok: true, error: null, status: 200, url: '/dashboard' });

      const user = userEvent.setup();
      render(<LoginPage />);

      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/password/i), 'password123');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledWith('credentials', {
          email: 'test@example.com',
          password: 'password123',
          redirect: false,
          callbackUrl: '/dashboard',
        });
      });
    });

    it('shows loading state during submission', async () => {
      mockSignIn.mockImplementation(() => new Promise(() => {})); // Never resolves

      const user = userEvent.setup();
      render(<LoginPage />);

      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/password/i), 'password123');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(screen.getByText(/signing in/i)).toBeInTheDocument();
      });
    });

    it('displays error message on failed login', async () => {
      mockSignIn.mockResolvedValueOnce({ ok: false, error: 'CredentialsSignin', status: 401, url: null });

      const user = userEvent.setup();
      render(<LoginPage />);

      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/password/i), 'wrongpassword');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument();
      });
    });
  });

  describe('GitHub login', () => {
    it('calls signIn with github provider on button click', async () => {
      const user = userEvent.setup();
      render(<LoginPage />);

      await user.click(screen.getByRole('button', { name: /continue with github/i }));

      expect(mockSignIn).toHaveBeenCalledWith('github', { callbackUrl: '/dashboard' });
    });
  });

  describe('navigation links', () => {
    it('sign up link points to /signup', () => {
      render(<LoginPage />);

      const signUpLink = screen.getByRole('link', { name: /sign up/i });
      expect(signUpLink).toHaveAttribute('href', '/signup');
    });

    it('forgot password link points to /forgot-password', () => {
      render(<LoginPage />);

      const forgotLink = screen.getByRole('link', { name: /forgot password/i });
      expect(forgotLink).toHaveAttribute('href', '/forgot-password');
    });

    it('logo link points to home page', () => {
      render(<LoginPage />);

      const homeLinks = screen.getAllByRole('link');
      const logoLink = homeLinks.find(link => link.getAttribute('href') === '/');
      expect(logoLink).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('form inputs have proper labels', () => {
      render(<LoginPage />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);

      expect(emailInput).toHaveAttribute('type', 'email');
      expect(passwordInput).toHaveAttribute('type', 'password');
    });

    it('buttons are keyboard accessible', () => {
      render(<LoginPage />);

      const signInButton = screen.getByRole('button', { name: /sign in/i });
      const githubButton = screen.getByRole('button', { name: /continue with github/i });

      expect(signInButton).not.toBeDisabled();
      expect(githubButton).not.toBeDisabled();
    });
  });
});
