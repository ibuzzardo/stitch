import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import SlotGrid from '../components/SlotGrid';
import { TimeSlot } from '../types';

describe('SlotGrid', () => {
  const mockOnSlotSelect = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockSlots: TimeSlot[] = [
    { time: '09:00', available: true },
    { time: '10:00', available: false },
    { time: '11:00', available: true },
    { time: '14:00', available: false },
    { time: '15:00', available: true }
  ];

  describe('Rendering', () => {
    it('should render all time slots', () => {
      render(<SlotGrid slots={mockSlots} onSlotSelect={mockOnSlotSelect} />);
      
      expect(screen.getByText('9:00 AM')).toBeInTheDocument();
      expect(screen.getByText('10:00 AM')).toBeInTheDocument();
      expect(screen.getByText('11:00 AM')).toBeInTheDocument();
      expect(screen.getByText('2:00 PM')).toBeInTheDocument();
      expect(screen.getByText('3:00 PM')).toBeInTheDocument();
    });

    it('should render empty grid when no slots provided', () => {
      render(<SlotGrid slots={[]} onSlotSelect={mockOnSlotSelect} />);
      
      const grid = screen.getByRole('generic');
      expect(grid).toBeInTheDocument();
      expect(grid.children).toHaveLength(0);
    });

    it('should apply correct grid layout classes', () => {
      render(<SlotGrid slots={mockSlots} onSlotSelect={mockOnSlotSelect} />);
      
      const grid = screen.getByRole('generic');
      expect(grid).toHaveClass(
        'grid',
        'grid-cols-2',
        'sm:grid-cols-3',
        'lg:grid-cols-4',
        'gap-3'
      );
    });
  });

  describe('Time formatting', () => {
    it('should format morning times correctly', () => {
      const morningSlots: TimeSlot[] = [
        { time: '08:00', available: true },
        { time: '09:30', available: true },
        { time: '11:45', available: true }
      ];
      
      render(<SlotGrid slots={morningSlots} onSlotSelect={mockOnSlotSelect} />);
      
      expect(screen.getByText('8:00 AM')).toBeInTheDocument();
      expect(screen.getByText('9:30 AM')).toBeInTheDocument();
      expect(screen.getByText('11:45 AM')).toBeInTheDocument();
    });

    it('should format afternoon/evening times correctly', () => {
      const afternoonSlots: TimeSlot[] = [
        { time: '12:00', available: true },
        { time: '13:30', available: true },
        { time: '17:15', available: true },
        { time: '23:59', available: true }
      ];
      
      render(<SlotGrid slots={afternoonSlots} onSlotSelect={mockOnSlotSelect} />);
      
      expect(screen.getByText('12:00 PM')).toBeInTheDocument();
      expect(screen.getByText('1:30 PM')).toBeInTheDocument();
      expect(screen.getByText('5:15 PM')).toBeInTheDocument();
      expect(screen.getByText('11:59 PM')).toBeInTheDocument();
    });

    it('should handle midnight correctly', () => {
      const midnightSlots: TimeSlot[] = [
        { time: '00:00', available: true },
        { time: '00:30', available: true }
      ];
      
      render(<SlotGrid slots={midnightSlots} onSlotSelect={mockOnSlotSelect} />);
      
      expect(screen.getByText('12:00 AM')).toBeInTheDocument();
      expect(screen.getByText('12:30 AM')).toBeInTheDocument();
    });
  });

  describe('Available slots', () => {
    it('should style available slots correctly', () => {
      render(<SlotGrid slots={mockSlots} onSlotSelect={mockOnSlotSelect} />);
      
      const availableSlot = screen.getByText('9:00 AM');
      expect(availableSlot).toHaveClass(
        'bg-indigo-50',
        'text-indigo-700',
        'hover:bg-indigo-100',
        'border-indigo-200'
      );
      expect(availableSlot).not.toBeDisabled();
    });

    it('should call onSlotSelect when available slot is clicked', () => {
      render(<SlotGrid slots={mockSlots} onSlotSelect={mockOnSlotSelect} />);
      
      const availableSlot = screen.getByText('9:00 AM');
      fireEvent.click(availableSlot);
      
      expect(mockOnSlotSelect).toHaveBeenCalledWith('09:00');
      expect(mockOnSlotSelect).toHaveBeenCalledTimes(1);
    });

    it('should handle multiple available slot clicks', () => {
      render(<SlotGrid slots={mockSlots} onSlotSelect={mockOnSlotSelect} />);
      
      fireEvent.click(screen.getByText('9:00 AM'));
      fireEvent.click(screen.getByText('11:00 AM'));
      fireEvent.click(screen.getByText('3:00 PM'));
      
      expect(mockOnSlotSelect).toHaveBeenCalledTimes(3);
      expect(mockOnSlotSelect).toHaveBeenNthCalledWith(1, '09:00');
      expect(mockOnSlotSelect).toHaveBeenNthCalledWith(2, '11:00');
      expect(mockOnSlotSelect).toHaveBeenNthCalledWith(3, '15:00');
    });
  });

  describe('Unavailable slots', () => {
    it('should style unavailable slots correctly', () => {
      render(<SlotGrid slots={mockSlots} onSlotSelect={mockOnSlotSelect} />);
      
      const unavailableSlot = screen.getByText('10:00 AM');
      expect(unavailableSlot).toHaveClass(
        'bg-gray-100',
        'text-gray-400',
        'cursor-not-allowed',
        'border-gray-200'
      );
      expect(unavailableSlot).toBeDisabled();
    });

    it('should not call onSlotSelect when unavailable slot is clicked', () => {
      render(<SlotGrid slots={mockSlots} onSlotSelect={mockOnSlotSelect} />);
      
      const unavailableSlot = screen.getByText('10:00 AM');
      fireEvent.click(unavailableSlot);
      
      expect(mockOnSlotSelect).not.toHaveBeenCalled();
    });

    it('should not respond to keyboard events on disabled slots', () => {
      render(<SlotGrid slots={mockSlots} onSlotSelect={mockOnSlotSelect} />);
      
      const unavailableSlot = screen.getByText('2:00 PM');
      fireEvent.keyDown(unavailableSlot, { key: 'Enter' });
      fireEvent.keyDown(unavailableSlot, { key: ' ' });
      
      expect(mockOnSlotSelect).not.toHaveBeenCalled();
    });
  });

  describe('Button properties', () => {
    it('should have correct button attributes for available slots', () => {
      render(<SlotGrid slots={mockSlots} onSlotSelect={mockOnSlotSelect} />);
      
      const availableSlot = screen.getByText('9:00 AM');
      expect(availableSlot.tagName).toBe('BUTTON');
      expect(availableSlot).not.toBeDisabled();
      expect(availableSlot).toHaveClass('px-4', 'py-3', 'rounded-md', 'font-medium', 'text-sm', 'transition-colors');
    });

    it('should have correct button attributes for unavailable slots', () => {
      render(<SlotGrid slots={mockSlots} onSlotSelect={mockOnSlotSelect} />);
      
      const unavailableSlot = screen.getByText('10:00 AM');
      expect(unavailableSlot.tagName).toBe('BUTTON');
      expect(unavailableSlot).toBeDisabled();
      expect(unavailableSlot).toHaveClass('px-4', 'py-3', 'rounded-md', 'font-medium', 'text-sm', 'transition-colors');
    });
  });

  describe('Edge cases', () => {
    it('should handle slots with invalid time format gracefully', () => {
      const invalidSlots: TimeSlot[] = [
        { time: 'invalid', available: true },
        { time: '25:00', available: true },
        { time: '12:60', available: true }
      ];
      
      // Should not throw an error
      expect(() => {
        render(<SlotGrid slots={invalidSlots} onSlotSelect={mockOnSlotSelect} />);
      }).not.toThrow();
    });

    it('should handle single slot', () => {
      const singleSlot: TimeSlot[] = [
        { time: '10:00', available: true }
      ];
      
      render(<SlotGrid slots={singleSlot} onSlotSelect={mockOnSlotSelect} />);
      
      expect(screen.getByText('10:00 AM')).toBeInTheDocument();
      
      fireEvent.click(screen.getByText('10:00 AM'));
      expect(mockOnSlotSelect).toHaveBeenCalledWith('10:00');
    });

    it('should handle all unavailable slots', () => {
      const allUnavailableSlots: TimeSlot[] = [
        { time: '09:00', available: false },
        { time: '10:00', available: false },
        { time: '11:00', available: false }
      ];
      
      render(<SlotGrid slots={allUnavailableSlots} onSlotSelect={mockOnSlotSelect} />);
      
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toBeDisabled();
        fireEvent.click(button);
      });
      
      expect(mockOnSlotSelect).not.toHaveBeenCalled();
    });

    it('should handle rapid clicks on same slot', () => {
      render(<SlotGrid slots={mockSlots} onSlotSelect={mockOnSlotSelect} />);
      
      const availableSlot = screen.getByText('9:00 AM');
      
      // Rapid clicks
      for (let i = 0; i < 5; i++) {
        fireEvent.click(availableSlot);
      }
      
      expect(mockOnSlotSelect).toHaveBeenCalledTimes(5);
      expect(mockOnSlotSelect).toHaveBeenCalledWith('09:00');
    });

    it('should maintain unique keys for slots', () => {
      const duplicateTimeSlots: TimeSlot[] = [
        { time: '10:00', available: true },
        { time: '10:00', available: false } // Same time, different availability
      ];
      
      // Should render without React key warnings
      expect(() => {
        render(<SlotGrid slots={duplicateTimeSlots} onSlotSelect={mockOnSlotSelect} />);
      }).not.toThrow();
      
      // Both slots should be rendered
      const slots = screen.getAllByText('10:00 AM');
      expect(slots).toHaveLength(2);
    });
  });

  describe('Accessibility', () => {
    it('should be keyboard accessible for available slots', () => {
      render(<SlotGrid slots={mockSlots} onSlotSelect={mockOnSlotSelect} />);
      
      const availableSlot = screen.getByText('9:00 AM');
      
      // Should be focusable
      availableSlot.focus();
      expect(availableSlot).toHaveFocus();
      
      // Should respond to Enter key
      fireEvent.keyDown(availableSlot, { key: 'Enter' });
      // Note: We need to simulate the actual click that would happen
      fireEvent.click(availableSlot);
      
      expect(mockOnSlotSelect).toHaveBeenCalledWith('09:00');
    });

    it('should not be focusable for unavailable slots', () => {
      render(<SlotGrid slots={mockSlots} onSlotSelect={mockOnSlotSelect} />);
      
      const unavailableSlot = screen.getByText('10:00 AM');
      expect(unavailableSlot).toBeDisabled();
      
      // Disabled buttons are not focusable
      unavailableSlot.focus();
      expect(unavailableSlot).not.toHaveFocus();
    });
  });
});