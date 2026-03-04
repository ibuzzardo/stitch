import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../App';

// Mock the child components
jest.mock('../components/BookingTab', () => {
  return function MockBookingTab({ onToast }: { onToast: (type: string, message: string) => void }) {
    return (
      <div data-testid="booking-tab">
        <button onClick={() => onToast('success', 'Booking successful')}>Trigger Success Toast</button>
        <button onClick={() => onToast('error', 'Booking failed')}>Trigger Error Toast</button>
      </div>
    );
  };
});

jest.mock('../components/AppointmentsTab', () => {
  return function MockAppointmentsTab({ onToast }: { onToast: (type: string, message: string) => void }) {
    return (
      <div data-testid="appointments-tab">
        <button onClick={() => onToast('success', 'Appointment cancelled')}>Trigger Success Toast</button>
      </div>
    );
  };
});

jest.mock('../components/Toast', () => {
  return function MockToast({ type, message, onClose }: { type: string; message: string; onClose: () => void }) {
    return (
      <div data-testid={`toast-${type}`}>
        <span>{message}</span>
        <button onClick={onClose}>Close</button>
      </div>
    );
  };
});

describe('App', () => {
  beforeEach(() => {
    jest.clearAllTimers();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('should render the main header and navigation', () => {
    render(<App />);
    
    expect(screen.getByText('Stitch Appointments')).toBeInTheDocument();
    expect(screen.getByText('Book Appointment')).toBeInTheDocument();
    expect(screen.getByText('My Appointments')).toBeInTheDocument();
  });

  it('should show BookingTab by default', () => {
    render(<App />);
    
    expect(screen.getByTestId('booking-tab')).toBeInTheDocument();
    expect(screen.queryByTestId('appointments-tab')).not.toBeInTheDocument();
  });

  it('should switch to AppointmentsTab when clicked', () => {
    render(<App />);
    
    fireEvent.click(screen.getByText('My Appointments'));
    
    expect(screen.getByTestId('appointments-tab')).toBeInTheDocument();
    expect(screen.queryByTestId('booking-tab')).not.toBeInTheDocument();
  });

  it('should switch back to BookingTab when clicked', () => {
    render(<App />);
    
    // Switch to appointments tab
    fireEvent.click(screen.getByText('My Appointments'));
    expect(screen.getByTestId('appointments-tab')).toBeInTheDocument();
    
    // Switch back to booking tab
    fireEvent.click(screen.getByText('Book Appointment'));
    expect(screen.getByTestId('booking-tab')).toBeInTheDocument();
    expect(screen.queryByTestId('appointments-tab')).not.toBeInTheDocument();
  });

  it('should apply correct CSS classes for active tab', () => {
    render(<App />);
    
    const bookingButton = screen.getByText('Book Appointment');
    const appointmentsButton = screen.getByText('My Appointments');
    
    // Initially booking tab should be active
    expect(bookingButton).toHaveClass('border-indigo-500', 'text-indigo-600');
    expect(appointmentsButton).toHaveClass('border-transparent', 'text-gray-500');
    
    // Switch to appointments tab
    fireEvent.click(appointmentsButton);
    
    expect(appointmentsButton).toHaveClass('border-indigo-500', 'text-indigo-600');
    expect(bookingButton).toHaveClass('border-transparent', 'text-gray-500');
  });

  describe('Toast functionality', () => {
    it('should display success toast when triggered', () => {
      render(<App />);
      
      fireEvent.click(screen.getByText('Trigger Success Toast'));
      
      expect(screen.getByTestId('toast-success')).toBeInTheDocument();
      expect(screen.getByText('Booking successful')).toBeInTheDocument();
    });

    it('should display error toast when triggered', () => {
      render(<App />);
      
      fireEvent.click(screen.getByText('Trigger Error Toast'));
      
      expect(screen.getByTestId('toast-error')).toBeInTheDocument();
      expect(screen.getByText('Booking failed')).toBeInTheDocument();
    });

    it('should auto-remove toast after 5 seconds', async () => {
      render(<App />);
      
      fireEvent.click(screen.getByText('Trigger Success Toast'));
      expect(screen.getByTestId('toast-success')).toBeInTheDocument();
      
      // Fast-forward time by 5 seconds
      jest.advanceTimersByTime(5000);
      
      await waitFor(() => {
        expect(screen.queryByTestId('toast-success')).not.toBeInTheDocument();
      });
    });

    it('should remove toast when close button is clicked', () => {
      render(<App />);
      
      fireEvent.click(screen.getByText('Trigger Success Toast'));
      expect(screen.getByTestId('toast-success')).toBeInTheDocument();
      
      fireEvent.click(screen.getByText('Close'));
      expect(screen.queryByTestId('toast-success')).not.toBeInTheDocument();
    });

    it('should handle multiple toasts', () => {
      render(<App />);
      
      fireEvent.click(screen.getByText('Trigger Success Toast'));
      fireEvent.click(screen.getByText('Trigger Error Toast'));
      
      expect(screen.getByTestId('toast-success')).toBeInTheDocument();
      expect(screen.getByTestId('toast-error')).toBeInTheDocument();
      expect(screen.getByText('Booking successful')).toBeInTheDocument();
      expect(screen.getByText('Booking failed')).toBeInTheDocument();
    });

    it('should generate unique IDs for toasts', () => {
      const mathRandomSpy = jest.spyOn(Math, 'random');
      mathRandomSpy.mockReturnValueOnce(0.123456789);
      mathRandomSpy.mockReturnValueOnce(0.987654321);
      
      render(<App />);
      
      fireEvent.click(screen.getByText('Trigger Success Toast'));
      fireEvent.click(screen.getByText('Trigger Error Toast'));
      
      // Both toasts should be present with different IDs
      expect(screen.getByTestId('toast-success')).toBeInTheDocument();
      expect(screen.getByTestId('toast-error')).toBeInTheDocument();
      
      mathRandomSpy.mockRestore();
    });

    it('should handle toast from appointments tab', () => {
      render(<App />);
      
      fireEvent.click(screen.getByText('My Appointments'));
      fireEvent.click(screen.getByText('Trigger Success Toast'));
      
      expect(screen.getByTestId('toast-success')).toBeInTheDocument();
      expect(screen.getByText('Appointment cancelled')).toBeInTheDocument();
    });
  });

  describe('Edge cases', () => {
    it('should handle rapid tab switching', () => {
      render(<App />);
      
      // Rapidly switch between tabs
      for (let i = 0; i < 5; i++) {
        fireEvent.click(screen.getByText('My Appointments'));
        fireEvent.click(screen.getByText('Book Appointment'));
      }
      
      // Should end up on booking tab
      expect(screen.getByTestId('booking-tab')).toBeInTheDocument();
      expect(screen.queryByTestId('appointments-tab')).not.toBeInTheDocument();
    });

    it('should handle multiple rapid toast triggers', () => {
      render(<App />);
      
      // Trigger multiple toasts rapidly
      for (let i = 0; i < 3; i++) {
        fireEvent.click(screen.getByText('Trigger Success Toast'));
      }
      
      // Should have multiple success toasts
      const successToasts = screen.getAllByTestId('toast-success');
      expect(successToasts).toHaveLength(3);
    });
  });
});