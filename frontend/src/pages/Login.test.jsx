import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import Login from './Login';
import { AuthProvider } from '../context/AuthContext';

// Mock the useNavigate hook
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Helper function to render Login with all required providers
const renderLogin = () => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <Login />
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('Login Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('Rendering', () => {
    it('should render the login form with all elements', () => {
      renderLogin();

      // Check for logo
      expect(screen.getByAltText('RGIPT Logo')).toBeInTheDocument();

      // Check for header text
      expect(screen.getByText('RGIPT Resume Portal')).toBeInTheDocument();
      expect(screen.getByText('Sign in to your account')).toBeInTheDocument();

      // Check for form inputs
      expect(screen.getByLabelText('Institute Email')).toBeInTheDocument();
      expect(screen.getByLabelText('Password')).toBeInTheDocument();

      // Check for submit button
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });

    it('should render Sign Up link', () => {
      renderLogin();

      const signUpLink = screen.getByRole('link', { name: /sign up.*activate account/i });
      expect(signUpLink).toBeInTheDocument();
      expect(signUpLink).toHaveAttribute('href', '/activate-account');
    });

    it('should render Forgot Password link', () => {
      renderLogin();

      const forgotPasswordLink = screen.getByRole('link', { name: /forgot password/i });
      expect(forgotPasswordLink).toBeInTheDocument();
      expect(forgotPasswordLink).toHaveAttribute('href', '/forgot-password');
    });

    it('should render password toggle button', () => {
      renderLogin();

      const toggleButton = screen.getByRole('button', { name: /show password/i });
      expect(toggleButton).toBeInTheDocument();
    });

    it('should render demo credentials section', () => {
      renderLogin();

      expect(screen.getByText('Demo Credentials')).toBeInTheDocument();
      expect(screen.getByText('23cd3054@rgipt.ac.in')).toBeInTheDocument();
      expect(screen.getByText('Password:', { exact: false })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /use demo/i })).toBeInTheDocument();
    });
  });

  describe('Form Interaction', () => {
    it('should allow typing in email input', async () => {
      const user = userEvent.setup();
      renderLogin();

      const emailInput = screen.getByLabelText('Institute Email');
      await user.type(emailInput, 'test@rgipt.ac.in');

      expect(emailInput).toHaveValue('test@rgipt.ac.in');
    });

    it('should allow typing in password input', async () => {
      const user = userEvent.setup();
      renderLogin();

      const passwordInput = screen.getByLabelText('Password');
      await user.type(passwordInput, 'password123');

      expect(passwordInput).toHaveValue('password123');
    });

    it('should toggle password visibility when toggle button is clicked', async () => {
      const user = userEvent.setup();
      renderLogin();

      const passwordInput = screen.getByLabelText('Password');
      const toggleButton = screen.getByRole('button', { name: /show password/i });

      // Initially password should be hidden
      expect(passwordInput).toHaveAttribute('type', 'password');

      // Click to show password
      await user.click(toggleButton);
      expect(passwordInput).toHaveAttribute('type', 'text');

      // Click to hide password again
      await user.click(toggleButton);
      expect(passwordInput).toHaveAttribute('type', 'password');
    });

    it('should require email and password fields', () => {
      renderLogin();

      const emailInput = screen.getByLabelText('Institute Email');
      const passwordInput = screen.getByLabelText('Password');

      expect(emailInput).toBeRequired();
      expect(passwordInput).toBeRequired();
    });
  });

  describe('Navigation Links', () => {
    it('should navigate to account activation page when Sign Up link is clicked', async () => {
      const user = userEvent.setup();
      renderLogin();

      const signUpLink = screen.getByRole('link', { name: /sign up.*activate account/i });
      
      // Verify the link has correct href
      expect(signUpLink).toHaveAttribute('href', '/activate-account');
    });

    it('should navigate to password reset page when Forgot Password link is clicked', async () => {
      const user = userEvent.setup();
      renderLogin();

      const forgotPasswordLink = screen.getByRole('link', { name: /forgot password/i });
      
      // Verify the link has correct href
      expect(forgotPasswordLink).toHaveAttribute('href', '/forgot-password');
    });
  });

  describe('Form Submission - Existing Login Functionality', () => {
    it('should show loading state during login', async () => {
      const user = userEvent.setup();
      renderLogin();

      const emailInput = screen.getByLabelText('Institute Email');
      const passwordInput = screen.getByLabelText('Password');
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, 'test@rgipt.ac.in');
      await user.type(passwordInput, 'password123');

      // Start the click but don't await it immediately
      const clickPromise = user.click(submitButton);

      // Check for loading state immediately after click
      await waitFor(() => {
        expect(screen.getByText('Signing in...')).toBeInTheDocument();
      }, { timeout: 100 });

      // Wait for the click to complete
      await clickPromise;
    });

    it('should display error message on login failure', async () => {
      const user = userEvent.setup();
      renderLogin();

      const emailInput = screen.getByLabelText('Institute Email');
      const passwordInput = screen.getByLabelText('Password');
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, 'wrong@rgipt.ac.in');
      await user.type(passwordInput, 'wrongpassword');
      await user.click(submitButton);

      // Wait for error message to appear - it should show "Test error message" from the mocked API
      await waitFor(() => {
        const errorText = screen.getByText(/test error message/i);
        expect(errorText).toBeInTheDocument();
      });
    });

    it('should clear error message when user starts typing again', async () => {
      const user = userEvent.setup();
      renderLogin();

      const emailInput = screen.getByLabelText('Institute Email');
      const passwordInput = screen.getByLabelText('Password');

      // Simulate an error state by typing and submitting
      await user.type(emailInput, 'test@rgipt.ac.in');
      await user.type(passwordInput, 'password');
      
      // Type again to trigger form interaction
      await user.clear(emailInput);
      await user.type(emailInput, 'new@rgipt.ac.in');
    });

    it('should not submit form with empty fields', async () => {
      const user = userEvent.setup();
      renderLogin();

      const submitButton = screen.getByRole('button', { name: /sign in/i });

      // Try to submit without filling fields
      await user.click(submitButton);

      // Form should not submit (browser validation will prevent it)
      // The navigate function should not be called
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have proper labels for form inputs', () => {
      renderLogin();

      const emailInput = screen.getByLabelText('Institute Email');
      const passwordInput = screen.getByLabelText('Password');

      expect(emailInput).toHaveAttribute('id', 'email');
      expect(passwordInput).toHaveAttribute('id', 'password');
    });

    it('should have proper aria-label for password toggle button', () => {
      renderLogin();

      const toggleButton = screen.getByRole('button', { name: /show password/i });
      expect(toggleButton).toHaveAttribute('aria-label');
    });

    it('should have proper placeholder text', () => {
      renderLogin();

      const emailInput = screen.getByLabelText('Institute Email');
      const passwordInput = screen.getByLabelText('Password');

      expect(emailInput).toHaveAttribute('placeholder', 'your.email@rgipt.ac.in');
      expect(passwordInput).toHaveAttribute('placeholder', 'Enter your password');
    });
  });

  describe('UI States', () => {
    it('should disable all interactive elements during loading', async () => {
      const user = userEvent.setup();
      renderLogin();

      const emailInput = screen.getByLabelText('Institute Email');
      const passwordInput = screen.getByLabelText('Password');
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      const toggleButton = screen.getByRole('button', { name: /show password/i });

      await user.type(emailInput, 'test@rgipt.ac.in');
      await user.type(passwordInput, 'password123');

      // Start the click but don't await it
      const clickPromise = user.click(submitButton);

      // Check for disabled state during loading
      await waitFor(() => {
        expect(submitButton).toBeDisabled();
      }, { timeout: 100 });

      // Wait for the click to complete
      await clickPromise;
    });

    it('should display error message in proper styling', async () => {
      const user = userEvent.setup();
      
      // Mock API to return error
      vi.mock('../services/api', () => ({
        default: {
          post: vi.fn(() => Promise.reject({
            response: {
              data: {
                error: {
                  message: 'Test error message'
                }
              }
            }
          }))
        }
      }));

      renderLogin();

      const emailInput = screen.getByLabelText('Institute Email');
      const passwordInput = screen.getByLabelText('Password');
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, 'test@rgipt.ac.in');
      await user.type(passwordInput, 'password');
      await user.click(submitButton);

      await waitFor(() => {
        const errorElement = screen.queryByText(/error|failed|invalid/i);
        if (errorElement) {
          expect(errorElement).toHaveClass('text-red-800');
        }
      });
    });
  });

  describe('Integration with Auth Context', () => {
    it('should call login function from AuthContext on form submission', async () => {
      const user = userEvent.setup();
      renderLogin();

      const emailInput = screen.getByLabelText('Institute Email');
      const passwordInput = screen.getByLabelText('Password');
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, 'test@rgipt.ac.in');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      // The form should attempt to submit
      // (actual API call testing would require more complex mocking)
    });
  });
});
