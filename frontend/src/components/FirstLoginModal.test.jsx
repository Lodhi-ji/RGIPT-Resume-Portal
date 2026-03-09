import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FirstLoginModal from './FirstLoginModal';
import api from '../services/api';

// Mock the API module
vi.mock('../services/api');

describe('FirstLoginModal Component', () => {
  const mockOnClose = vi.fn();
  const mockOnPasswordChanged = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should not render when isOpen is false', () => {
      const { container } = render(
        <FirstLoginModal 
          isOpen={false} 
          onClose={mockOnClose} 
          onPasswordChanged={mockOnPasswordChanged} 
        />
      );
      expect(container.firstChild).toBeNull();
    });

    it('should render when isOpen is true', () => {
      render(
        <FirstLoginModal 
          isOpen={true} 
          onClose={mockOnClose} 
          onPasswordChanged={mockOnPasswordChanged} 
        />
      );
      
      expect(screen.getByText('Welcome! Change Your Password')).toBeInTheDocument();
      expect(screen.getByLabelText('Current Password')).toBeInTheDocument();
      expect(screen.getByLabelText('New Password')).toBeInTheDocument();
      expect(screen.getByLabelText('Confirm New Password')).toBeInTheDocument();
    });

    it('should render both action buttons', () => {
      render(
        <FirstLoginModal 
          isOpen={true} 
          onClose={mockOnClose} 
          onPasswordChanged={mockOnPasswordChanged} 
        />
      );
      
      expect(screen.getByRole('button', { name: /change password/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /skip for now/i })).toBeInTheDocument();
    });
  });

  describe('Form Interaction', () => {
    it('should allow typing in all password fields', async () => {
      const user = userEvent.setup();
      render(
        <FirstLoginModal 
          isOpen={true} 
          onClose={mockOnClose} 
          onPasswordChanged={mockOnPasswordChanged} 
        />
      );

      const oldPasswordInput = screen.getByLabelText('Current Password');
      const newPasswordInput = screen.getByLabelText('New Password');
      const confirmPasswordInput = screen.getByLabelText('Confirm New Password');

      await user.type(oldPasswordInput, 'OldPass123!');
      await user.type(newPasswordInput, 'NewPass456!');
      await user.type(confirmPasswordInput, 'NewPass456!');

      expect(oldPasswordInput).toHaveValue('OldPass123!');
      expect(newPasswordInput).toHaveValue('NewPass456!');
      expect(confirmPasswordInput).toHaveValue('NewPass456!');
    });

    it('should toggle password visibility', async () => {
      const user = userEvent.setup();
      render(
        <FirstLoginModal 
          isOpen={true} 
          onClose={mockOnClose} 
          onPasswordChanged={mockOnPasswordChanged} 
        />
      );

      const oldPasswordInput = screen.getByLabelText('Current Password');
      const toggleButtons = screen.getAllByLabelText('Toggle password visibility');

      expect(oldPasswordInput).toHaveAttribute('type', 'password');
      
      await user.click(toggleButtons[0]);
      expect(oldPasswordInput).toHaveAttribute('type', 'text');
      
      await user.click(toggleButtons[0]);
      expect(oldPasswordInput).toHaveAttribute('type', 'password');
    });

    it('should display password strength indicator when typing new password', async () => {
      const user = userEvent.setup();
      render(
        <FirstLoginModal 
          isOpen={true} 
          onClose={mockOnClose} 
          onPasswordChanged={mockOnPasswordChanged} 
        />
      );

      const newPasswordInput = screen.getByLabelText('New Password');
      
      // Initially no strength indicator
      expect(screen.queryByText(/weak|fair|good|strong/i)).not.toBeInTheDocument();

      // Type a weak password
      await user.type(newPasswordInput, 'pass');
      expect(screen.getByText(/weak/i)).toBeInTheDocument();

      // Clear and type a stronger password
      await user.clear(newPasswordInput);
      await user.type(newPasswordInput, 'StrongPass123!');
      expect(screen.getByText(/strong/i)).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('should show error when passwords do not match', async () => {
      const user = userEvent.setup();
      render(
        <FirstLoginModal 
          isOpen={true} 
          onClose={mockOnClose} 
          onPasswordChanged={mockOnPasswordChanged} 
        />
      );

      await user.type(screen.getByLabelText('Current Password'), 'OldPass123!');
      await user.type(screen.getByLabelText('New Password'), 'NewPass456!');
      await user.type(screen.getByLabelText('Confirm New Password'), 'DifferentPass!');
      
      await user.click(screen.getByRole('button', { name: /change password/i }));

      expect(screen.getByText('New passwords do not match')).toBeInTheDocument();
    });

    it('should show error when new password is too short', async () => {
      const user = userEvent.setup();
      render(
        <FirstLoginModal 
          isOpen={true} 
          onClose={mockOnClose} 
          onPasswordChanged={mockOnPasswordChanged} 
        />
      );

      await user.type(screen.getByLabelText('Current Password'), 'OldPass123!');
      await user.type(screen.getByLabelText('New Password'), 'Short1!');
      await user.type(screen.getByLabelText('Confirm New Password'), 'Short1!');
      
      await user.click(screen.getByRole('button', { name: /change password/i }));

      expect(screen.getByText('Password must be at least 8 characters long')).toBeInTheDocument();
    });

    it('should clear error message when user types again', async () => {
      const user = userEvent.setup();
      render(
        <FirstLoginModal 
          isOpen={true} 
          onClose={mockOnClose} 
          onPasswordChanged={mockOnPasswordChanged} 
        />
      );

      // Trigger an error
      await user.type(screen.getByLabelText('Current Password'), 'OldPass123!');
      await user.type(screen.getByLabelText('New Password'), 'NewPass456!');
      await user.type(screen.getByLabelText('Confirm New Password'), 'DifferentPass!');
      await user.click(screen.getByRole('button', { name: /change password/i }));

      expect(screen.getByText('New passwords do not match')).toBeInTheDocument();

      // Type again to clear error
      await user.type(screen.getByLabelText('New Password'), '!');
      expect(screen.queryByText('New passwords do not match')).not.toBeInTheDocument();
    });
  });

  describe('Form Submission', () => {
    it('should call API and onPasswordChanged callback on successful submission', async () => {
      const user = userEvent.setup();
      api.post.mockResolvedValueOnce({ data: { success: true } });

      render(
        <FirstLoginModal 
          isOpen={true} 
          onClose={mockOnClose} 
          onPasswordChanged={mockOnPasswordChanged} 
        />
      );

      await user.type(screen.getByLabelText('Current Password'), 'OldPass123!');
      await user.type(screen.getByLabelText('New Password'), 'NewPass456!');
      await user.type(screen.getByLabelText('Confirm New Password'), 'NewPass456!');
      
      await user.click(screen.getByRole('button', { name: /change password/i }));

      await waitFor(() => {
        expect(api.post).toHaveBeenCalledWith('/auth/change-password', {
          oldPassword: 'OldPass123!',
          newPassword: 'NewPass456!'
        });
        expect(mockOnPasswordChanged).toHaveBeenCalled();
      });
    });

    it('should display error message on API failure', async () => {
      const user = userEvent.setup();
      api.post.mockRejectedValueOnce({
        response: {
          data: {
            error: {
              message: 'Incorrect current password'
            }
          }
        }
      });

      render(
        <FirstLoginModal 
          isOpen={true} 
          onClose={mockOnClose} 
          onPasswordChanged={mockOnPasswordChanged} 
        />
      );

      await user.type(screen.getByLabelText('Current Password'), 'WrongPass!');
      await user.type(screen.getByLabelText('New Password'), 'NewPass456!');
      await user.type(screen.getByLabelText('Confirm New Password'), 'NewPass456!');
      
      await user.click(screen.getByRole('button', { name: /change password/i }));

      await waitFor(() => {
        expect(screen.getByText('Incorrect current password')).toBeInTheDocument();
      });
    });

    it('should disable form during submission', async () => {
      const user = userEvent.setup();
      api.post.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

      render(
        <FirstLoginModal 
          isOpen={true} 
          onClose={mockOnClose} 
          onPasswordChanged={mockOnPasswordChanged} 
        />
      );

      await user.type(screen.getByLabelText('Current Password'), 'OldPass123!');
      await user.type(screen.getByLabelText('New Password'), 'NewPass456!');
      await user.type(screen.getByLabelText('Confirm New Password'), 'NewPass456!');
      
      const submitButton = screen.getByRole('button', { name: /change password/i });
      await user.click(submitButton);

      expect(screen.getByRole('button', { name: /changing password/i })).toBeDisabled();
      expect(screen.getByLabelText('Current Password')).toBeDisabled();
    });
  });

  describe('Skip Functionality', () => {
    it('should call onClose when skip button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <FirstLoginModal 
          isOpen={true} 
          onClose={mockOnClose} 
          onPasswordChanged={mockOnPasswordChanged} 
        />
      );

      await user.click(screen.getByRole('button', { name: /skip for now/i }));

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should clear form data when skip is clicked', async () => {
      const user = userEvent.setup();
      render(
        <FirstLoginModal 
          isOpen={true} 
          onClose={mockOnClose} 
          onPasswordChanged={mockOnPasswordChanged} 
        />
      );

      // Fill in some data
      await user.type(screen.getByLabelText('Current Password'), 'OldPass123!');
      await user.type(screen.getByLabelText('New Password'), 'NewPass456!');
      
      // Click skip
      await user.click(screen.getByRole('button', { name: /skip for now/i }));

      // Form should be cleared (check by re-rendering)
      expect(screen.getByLabelText('Current Password')).toHaveValue('');
      expect(screen.getByLabelText('New Password')).toHaveValue('');
    });
  });

  describe('Accessibility', () => {
    it('should have proper labels for all inputs', () => {
      render(
        <FirstLoginModal 
          isOpen={true} 
          onClose={mockOnClose} 
          onPasswordChanged={mockOnPasswordChanged} 
        />
      );

      expect(screen.getByLabelText('Current Password')).toBeInTheDocument();
      expect(screen.getByLabelText('New Password')).toBeInTheDocument();
      expect(screen.getByLabelText('Confirm New Password')).toBeInTheDocument();
    });

    it('should have proper aria-labels for toggle buttons', () => {
      render(
        <FirstLoginModal 
          isOpen={true} 
          onClose={mockOnClose} 
          onPasswordChanged={mockOnPasswordChanged} 
        />
      );

      const toggleButtons = screen.getAllByLabelText('Toggle password visibility');
      expect(toggleButtons).toHaveLength(3);
    });
  });
});
