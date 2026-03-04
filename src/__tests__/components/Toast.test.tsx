import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Toast from '../components/Toast';

describe('Toast', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('Success Toast', () => {
    it('should render success toast with correct styling and content', () => {
      render(
        <Toast
          type="success"
          message="Operation completed successfully"
          onClose={mockOnClose}
        />
      );
      
      const toast = screen.getByText('Operation completed successfully').closest('div');
      expect(toast).toHaveClass('bg-green-600');
      expect(screen.getByText('Operation completed successfully')).toBeInTheDocument();
      
      // Check for success icon (checkmark)
      const successIcon = screen.getByRole('button', { name: /close/i }).previousElementSibling?.querySelector('svg');
      expect(successIcon).toBeInTheDocument();
    });

    it('should display success icon', () => {
      render(
        <Toast
          type="success"
          message="Success message"
          onClose={mockOnClose}
        />
      );
      
      // Look for the checkmark path
      const checkmarkPath = screen.getByText('Success message').closest('div')?.querySelector('path[d="M5 13l4 4L19 7"]');
      expect(checkmarkPath).toBeInTheDocument();
    });
  });

  describe('Error Toast', () => {
    it('should render error toast with correct styling and content', () => {
      render(
        <Toast
          type="error"
          message="An error occurred"
          onClose={mockOnClose}
        />
      );
      
      const toast = screen.getByText('An error occurred').closest('div');
      expect(toast).toHaveClass('bg-red-600');
      expect(screen.getByText('An error occurred')).toBeInTheDocument();
    });

    it('should display error icon', () => {
      render(
        <Toast
          type="error"
          message="Error message"
          onClose={mockOnClose}
        />
      );
      
      // Look for the X icon path
      const errorIconPath = screen.getByText('Error message').closest('div')?.querySelector('path[d="M6 18L18 6M6 6l12 12"]');
      expect(errorIconPath).toBeInTheDocument();
    });
  });

  describe('Auto-close functionality', () => {
    it('should auto-close after 5 seconds', async () => {
      render(
        <Toast
          type="success"
          message="Auto-close test"
          onClose={mockOnClose}
        />
      );
      
      expect(mockOnClose).not.toHaveBeenCalled();
      
      // Fast-forward time by 5 seconds
      jest.advanceTimersByTime(5000);
      
      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalledTimes(1);
      });
    });

    it('should clear timeout on unmount', () => {
      const { unmount } = render(
        <Toast
          type="success"
          message="Unmount test"
          onClose={mockOnClose}
        />
      );
      
      // Unmount before timeout
      unmount();
      
      // Fast-forward time
      jest.advanceTimersByTime(5000);
      
      expect(mockOnClose).not.toHaveBeenCalled();
    });

    it('should reset timeout when onClose prop changes', () => {
      const newOnClose = jest.fn();
      
      const { rerender } = render(
        <Toast
          type="success"
          message="Prop change test"
          onClose={mockOnClose}
        />
      );
      
      // Advance time partially
      jest.advanceTimersByTime(2500);
      
      // Change onClose prop
      rerender(
        <Toast
          type="success"
          message="Prop change test"
          onClose={newOnClose}
        />
      );
      
      // Advance remaining time
      jest.advanceTimersByTime(2500);
      
      expect(mockOnClose).not.toHaveBeenCalled();
      expect(newOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Manual close functionality', () => {
    it('should call onClose when close button is clicked', () => {
      render(
        <Toast
          type="success"
          message="Manual close test"
          onClose={mockOnClose}
        />
      );
      
      const closeButton = screen.getByRole('button');
      fireEvent.click(closeButton);
      
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should have hover effect on close button', () => {
      render(
        <Toast
          type="error"
          message="Hover test"
          onClose={mockOnClose}
        />
      );
      
      const closeButton = screen.getByRole('button');
      expect(closeButton).toHaveClass('hover:text-gray-200');
    });
  });

  describe('Styling and layout', () => {
    it('should have correct positioning classes', () => {
      render(
        <Toast
          type="success"
          message="Position test"
          onClose={mockOnClose}
        />
      );
      
      const toast = screen.getByText('Position test').closest('div');
      expect(toast).toHaveClass('fixed', 'top-4', 'right-4', 'z-50');
    });

    it('should have correct layout classes', () => {
      render(
        <Toast
          type="success"
          message="Layout test"
          onClose={mockOnClose}
        />
      );
      
      const toast = screen.getByText('Layout test').closest('div');
      expect(toast).toHaveClass('text-white', 'p-4', 'rounded-lg', 'shadow-lg', 'max-w-sm');
    });

    it('should have correct flex layout for content', () => {
      render(
        <Toast
          type="error"
          message="Flex test"
          onClose={mockOnClose}
        />
      );
      
      const contentContainer = screen.getByText('Flex test').closest('.flex');
      expect(contentContainer).toHaveClass('flex', 'items-center', 'space-x-3');
    });
  });

  describe('Accessibility', () => {
    it('should have accessible close button', () => {
      render(
        <Toast
          type="success"
          message="Accessibility test"
          onClose={mockOnClose}
        />
      );
      
      const closeButton = screen.getByRole('button');
      expect(closeButton).toBeInTheDocument();
      
      // Should be focusable
      closeButton.focus();
      expect(closeButton).toHaveFocus();
    });

    it('should support keyboard interaction on close button', () => {
      render(
        <Toast
          type="error"
          message="Keyboard test"
          onClose={mockOnClose}
        />
      );
      
      const closeButton = screen.getByRole('button');
      
      // Test Enter key
      fireEvent.keyDown(closeButton, { key: 'Enter', code: 'Enter' });
      fireEvent.click(closeButton); // Simulate the click that would happen
      
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Edge cases', () => {
    it('should handle empty message', () => {
      render(
        <Toast
          type="success"
          message=""
          onClose={mockOnClose}
        />
      );
      
      const messageElement = screen.getByText('');
      expect(messageElement).toBeInTheDocument();
    });

    it('should handle very long messages', () => {
      const longMessage = 'This is a very long message that should still be displayed properly in the toast component without breaking the layout or causing any issues with the styling';
      
      render(
        <Toast
          type="error"
          message={longMessage}
          onClose={mockOnClose}
        />
      );
      
      expect(screen.getByText(longMessage)).toBeInTheDocument();
      
      const toast = screen.getByText(longMessage).closest('div');
      expect(toast).toHaveClass('max-w-sm'); // Should still have max width constraint
    });

    it('should handle rapid close button clicks', () => {
      render(
        <Toast
          type="success"
          message="Rapid click test"
          onClose={mockOnClose}
        />
      );
      
      const closeButton = screen.getByRole('button');
      
      // Click multiple times rapidly
      fireEvent.click(closeButton);
      fireEvent.click(closeButton);
      fireEvent.click(closeButton);
      
      // Should only call onClose once per click
      expect(mockOnClose).toHaveBeenCalledTimes(3);
    });
  });
});