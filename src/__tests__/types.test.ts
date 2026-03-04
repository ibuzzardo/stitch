import { Appointment, TimeSlot, APIError, CreateAppointmentRequest, ToastMessage } from '../types';

describe('Types', () => {
  describe('Appointment interface', () => {
    it('should have all required properties', () => {
      const appointment: Appointment = {
        id: '123',
        name: 'John Doe',
        email: 'john@example.com',
        date: '2024-01-15',
        time: '10:00',
        createdAt: new Date()
      };
      
      expect(appointment.id).toBe('123');
      expect(appointment.name).toBe('John Doe');
      expect(appointment.email).toBe('john@example.com');
      expect(appointment.date).toBe('2024-01-15');
      expect(appointment.time).toBe('10:00');
      expect(appointment.createdAt).toBeInstanceOf(Date);
    });

    it('should allow optional notes property', () => {
      const appointmentWithNotes: Appointment = {
        id: '123',
        name: 'John Doe',
        email: 'john@example.com',
        date: '2024-01-15',
        time: '10:00',
        notes: 'Special requirements',
        createdAt: new Date()
      };
      
      expect(appointmentWithNotes.notes).toBe('Special requirements');
    });
  });

  describe('TimeSlot interface', () => {
    it('should have time and available properties', () => {
      const availableSlot: TimeSlot = {
        time: '10:00',
        available: true
      };
      
      const unavailableSlot: TimeSlot = {
        time: '11:00',
        available: false
      };
      
      expect(availableSlot.time).toBe('10:00');
      expect(availableSlot.available).toBe(true);
      expect(unavailableSlot.time).toBe('11:00');
      expect(unavailableSlot.available).toBe(false);
    });
  });

  describe('APIError interface', () => {
    it('should have required error and message properties', () => {
      const apiError: APIError = {
        error: 'ValidationError',
        message: 'Invalid input data'
      };
      
      expect(apiError.error).toBe('ValidationError');
      expect(apiError.message).toBe('Invalid input data');
    });

    it('should allow optional details property', () => {
      const apiErrorWithDetails: APIError = {
        error: 'ValidationError',
        message: 'Invalid input data',
        details: { field: 'email', reason: 'invalid format' }
      };
      
      expect(apiErrorWithDetails.details).toEqual({ field: 'email', reason: 'invalid format' });
    });
  });

  describe('CreateAppointmentRequest interface', () => {
    it('should have all required properties', () => {
      const request: CreateAppointmentRequest = {
        name: 'John Doe',
        email: 'john@example.com',
        date: '2024-01-15',
        time: '10:00'
      };
      
      expect(request.name).toBe('John Doe');
      expect(request.email).toBe('john@example.com');
      expect(request.date).toBe('2024-01-15');
      expect(request.time).toBe('10:00');
    });

    it('should allow optional notes property', () => {
      const requestWithNotes: CreateAppointmentRequest = {
        name: 'John Doe',
        email: 'john@example.com',
        date: '2024-01-15',
        time: '10:00',
        notes: 'Special requirements'
      };
      
      expect(requestWithNotes.notes).toBe('Special requirements');
    });
  });

  describe('ToastMessage interface', () => {
    it('should have all required properties', () => {
      const successToast: ToastMessage = {
        id: 'toast-123',
        type: 'success',
        message: 'Operation completed successfully'
      };
      
      const errorToast: ToastMessage = {
        id: 'toast-456',
        type: 'error',
        message: 'An error occurred'
      };
      
      expect(successToast.id).toBe('toast-123');
      expect(successToast.type).toBe('success');
      expect(successToast.message).toBe('Operation completed successfully');
      
      expect(errorToast.id).toBe('toast-456');
      expect(errorToast.type).toBe('error');
      expect(errorToast.message).toBe('An error occurred');
    });
  });
});