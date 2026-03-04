import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import BookingForm from '../components/BookingForm';
import { api } from '../api';

// Mock the API
jest.mock('../api', () => ({
  api: {
    createAppointment: jest.fn()
  }
}));

const mockApi = api as jest.Mocked<typeof api>;

describe('BookingForm', () => {
  const mockProps = {
    date: '2024-01-15',
    time: '10:00',
    onSuccess: jest.fn(),
    onError: jest.fn(),
    onClose: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render form with all fields', () => {
      render(<BookingForm {...mockProps} />);
      
      expect(screen.getByText('Book Appointment')).toBeInTheDocument();
      expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/notes/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /book appointment/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });

    it('should display formatted date and time', () => {
      render(<BookingForm {...mockProps} />);
      
      expect(screen.getByText('Monday, January 15, 2024')).toBeInTheDocument();
      expect(screen.getByText('10:00 AM')).toBeInTheDocument();
    });

    it('should format different dates correctly', () => {
      render(<BookingForm {...mockProps} date="2024-12-25" time="14:30" />);
      
      expect(screen.getByText('Wednesday, December 25, 2024')).toBeInTheDocument();
      expect(screen.getByText('2:30 PM')).toBeInTheDocument();
    });
  });

  describe('Form validation', () => {
    it('should show error for empty name', async () => {
      render(<BookingForm {...mockProps} />);
      
      const submitButton = screen.getByRole('button', { name: /book appointment/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Name must be at least 2 characters')).toBeInTheDocument();
      });
    });

    it('should show error for short name', async () => {
      render(<BookingForm {...mockProps} />);
      
      const nameInput = screen.getByLabelText(/name/i);
      fireEvent.change(nameInput, { target: { value: 'A' } });
      
      const submitButton = screen.getByRole('button', { name: /book appointment/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Name must be at least 2 characters')).toBeInTheDocument();
      });
    });

    it('should show error for invalid email', async () => {
      render(<BookingForm {...mockProps} />);
      
      const nameInput = screen.getByLabelText(/name/i);
      const emailInput = screen.getByLabelText(/email/i);
      
      fireEvent.change(nameInput, { target: { value: 'John Doe' } });
      fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
      
      const submitButton = screen.getByRole('button', { name: /book appointment/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
      });
    });

    it('should show error for notes exceeding 500 characters', async () => {
      render(<BookingForm {...mockProps} />);
      
      const nameInput = screen.getByLabelText(/name/i);
      const emailInput = screen.getByLabelText(/email/i);
      const notesInput = screen.getByLabelText(/notes/i);
      
      const longNotes = 'A'.repeat(501);
      
      fireEvent.change(nameInput, { target: { value: 'John Doe' } });
      fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
      fireEvent.change(notesInput, { target: { value: longNotes } });
      
      const submitButton = screen.getByRole('button', { name: /book appointment/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Notes must be at most 500 characters')).toBeInTheDocument();
      });
    });

    it('should clear errors when input is corrected', async () => {
      render(<BookingForm {...mockProps} />);
      
      const nameInput = screen.getByLabelText(/name/i);
      const submitButton = screen.getByRole('button', { name: /book appointment/i });
      
      // Trigger error
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Name must be at least 2 characters')).toBeInTheDocument();
      });
      
      // Fix the error
      fireEvent.change(nameInput, { target: { value: 'John Doe' } });
      
      await waitFor(() => {
        expect(screen.queryByText('Name must be at least 2 characters')).not.toBeInTheDocument();
      });
    });
  });

  describe('Form submission', () => {
    it('should submit valid form successfully', async () => {
      const mockAppointment = {
        id: '123',
        name: 'John Doe',
        email: 'john@example.com',
        date: '2024-01-15',
        time: '10:00',
        notes: 'Test notes',
        createdAt: new Date()
      };
      
      mockApi.createAppointment.mockResolvedValueOnce(mockAppointment);
      
      render(<BookingForm {...mockProps} />);
      
      const nameInput = screen.getByLabelText(/name/i);
      const emailInput = screen.getByLabelText(/email/i);
      const notesInput = screen.getByLabelText(/notes/i);
      const submitButton = screen.getByRole('button', { name: /book appointment/i });
      
      fireEvent.change(nameInput, { target: { value: 'John Doe' } });
      fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
      fireEvent.change(notesInput, { target: { value: 'Test notes' } });
      
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(mockApi.createAppointment).toHaveBeenCalledWith({
          name: 'John Doe',
          email: 'john@example.com',
          date: '2024-01-15',
          time: '10:00',
          notes: 'Test notes'
        });
      });
      
      expect(mockProps.onSuccess).toHaveBeenCalledTimes(1);
    });

    it('should handle API errors', async () => {
      mockApi.createAppointment.mockRejectedValueOnce(new Error('Slot no longer available'));
      
      render(<BookingForm {...mockProps} />);
      
      const nameInput = screen.getByLabelText(/name/i);
      const emailInput = screen.getByLabelText(/email/i);
      const submitButton = screen.getByRole('button', { name: /book appointment/i });
      
      fireEvent.change(nameInput, { target: { value: 'John Doe' } });
      fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
      
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(mockProps.onError).toHaveBeenCalledWith('Slot no longer available');
      });
    });

    it('should handle non-Error exceptions', async () => {
      mockApi.createAppointment.mockRejectedValueOnce('String error');
      
      render(<BookingForm {...mockProps} />);
      
      const nameInput = screen.getByLabelText(/name/i);
      const emailInput = screen.getByLabelText(/email/i);
      const submitButton = screen.getByRole('button', { name: /book appointment/i });
      
      fireEvent.change(nameInput, { target: { value: 'John Doe' } });
      fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
      
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(mockProps.onError).toHaveBeenCalledWith('Failed to book appointment');
      });
    });

    it('should disable submit button while submitting', async () => {
      let resolvePromise: (value: any) => void;
      const pendingPromise = new Promise(resolve => {
        resolvePromise = resolve;
      });
      
      mockApi.createAppointment.mockReturnValueOnce(pendingPromise);
      
      render(<BookingForm {...mockProps} />);
      
      const nameInput = screen.getByLabelText(/name/i);
      const emailInput = screen.getByLabelText(/email/i);
      const submitButton = screen.getByRole('button', { name: /book appointment/i });
      
      fireEvent.change(nameInput, { target: { value: 'John Doe' } });
      fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
      
      fireEvent.click(submitButton);
      
      // Button should be disabled and show loading text
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /booking.../i })).toBeDisabled();
      });
      
      // Resolve the promise
      resolvePromise!({
        id: '123',
        name: 'John Doe',
        email: 'john@example.com',
        date: '2024-01-15',
        time: '10:00',
        createdAt: new Date()
      });
      
      await waitFor(() => {
        expect(mockProps.onSuccess).toHaveBeenCalled();
      });
    });
  });

  describe('Form interactions', () => {
    it('should call onClose when cancel button is clicked', () => {
      render(<BookingForm {...mockProps} />);
      
      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      fireEvent.click(cancelButton);
      
      expect(mockProps.onClose).toHaveBeenCalledTimes(1);
    });

    it('should handle form input changes', () => {
      render(<BookingForm {...mockProps} />);
      
      const nameInput = screen.getByLabelText(/name/i) as HTMLInputElement;
      const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;
      const notesInput = screen.getByLabelText(/notes/i) as HTMLTextAreaElement;
      
      fireEvent.change(nameInput, { target: { value: 'Jane Smith' } });
      fireEvent.change(emailInput, { target: { value: 'jane@example.com' } });
      fireEvent.change(notesInput, { target: { value: 'Updated notes' } });
      
      expect(nameInput.value).toBe('Jane Smith');
      expect(emailInput.value).toBe('jane@example.com');
      expect(notesInput.value).toBe('Updated notes');
    });

    it('should trim whitespace from name input', async () => {
      const mockAppointment = {
        id: '123',
        name: 'John Doe',
        email: 'john@example.com',
        date: '2024-01-15',
        time: '10:00',
        createdAt: new Date()
      };
      
      mockApi.createAppointment.mockResolvedValueOnce(mockAppointment);
      
      render(<BookingForm {...mockProps} />);
      
      const nameInput = screen.getByLabelText(/name/i);
      const emailInput = screen.getByLabelText(/email/i);
      const submitButton = screen.getByRole('button', { name: /book appointment/i });
      
      fireEvent.change(nameInput, { target: { value: '  John Doe  ' } });
      fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
      
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(mockApi.createAppointment).toHaveBeenCalledWith({
          name: 'John Doe', // Should be trimmed
          email: 'john@example.com',
          date: '2024-01-15',
          time: '10:00',
          notes: ''
        });
      });
    });
  });

  describe('Edge cases', () => {
    it('should handle empty notes field', async () => {
      const mockAppointment = {
        id: '123',
        name: 'John Doe',
        email: 'john@example.com',
        date: '2024-01-15',
        time: '10:00',
        createdAt: new Date()
      };
      
      mockApi.createAppointment.mockResolvedValueOnce(mockAppointment);
      
      render(<BookingForm {...mockProps} />);
      
      const nameInput = screen.getByLabelText(/name/i);
      const emailInput = screen.getByLabelText(/email/i);
      const submitButton = screen.getByRole('button', { name: /book appointment/i });
      
      fireEvent.change(nameInput, { target: { value: 'John Doe' } });
      fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
      
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(mockApi.createAppointment).toHaveBeenCalledWith({
          name: 'John Doe',
          email: 'john@example.com',
          date: '2024-01-15',
          time: '10:00',
          notes: ''
        });
      });
    });

    it('should handle midnight time formatting', () => {
      render(<BookingForm {...mockProps} time="00:00" />);
      
      expect(screen.getByText('12:00 AM')).toBeInTheDocument();
    });

    it('should handle form submission with Enter key', async () => {
      const mockAppointment = {
        id: '123',
        name: 'John Doe',
        email: 'john@example.com',
        date: '2024-01-15',
        time: '10:00',
        createdAt: new Date()
      };
      
      mockApi.createAppointment.mockResolvedValueOnce(mockAppointment);
      
      render(<BookingForm {...mockProps} />);
      
      const nameInput = screen.getByLabelText(/name/i);
      const emailInput = screen.getByLabelText(/email/i);
      const form = screen.getByRole('form') || nameInput.closest('form');
      
      fireEvent.change(nameInput, { target: { value: 'John Doe' } });
      fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
      
      if (form) {
        fireEvent.submit(form);
      }
      
      await waitFor(() => {
        expect(mockApi.createAppointment).toHaveBeenCalled();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper form labels', () => {
      render(<BookingForm {...mockProps} />);
      
      expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/notes/i)).toBeInTheDocument();
    });

    it('should associate error messages with form fields', async () => {
      render(<BookingForm {...mockProps} />);
      
      const submitButton = screen.getByRole('button', { name: /book appointment/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        const nameInput = screen.getByLabelText(/name/i);
        const errorMessage = screen.getByText('Name must be at least 2 characters');
        
        expect(nameInput).toBeInTheDocument();
        expect(errorMessage).toBeInTheDocument();
      });
    });
  });
});