import { api } from '../api';
import { TimeSlot, Appointment, CreateAppointmentRequest } from '../types';

// Mock fetch globally
global.fetch = jest.fn();

const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

describe('ApiClient', () => {
  beforeEach(() => {
    mockFetch.mockClear();
    // Mock environment variable
    Object.defineProperty(import.meta, 'env', {
      value: { VITE_API_URL: 'http://localhost:4009/api' },
      writable: true
    });
  });

  describe('getSlots', () => {
    it('should fetch time slots for a given date', async () => {
      const mockSlots: TimeSlot[] = [
        { time: '09:00', available: true },
        { time: '10:00', available: false }
      ];
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockSlots
      } as Response);
      
      const result = await api.getSlots('2024-01-15');
      
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:4009/api/slots?date=2024-01-15',
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      expect(result).toEqual(mockSlots);
    });

    it('should handle API errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ error: 'BadRequest', message: 'Invalid date format' })
      } as Response);
      
      await expect(api.getSlots('invalid-date')).rejects.toThrow('Invalid date format');
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));
      
      await expect(api.getSlots('2024-01-15')).rejects.toThrow('Network error');
    });

    it('should handle non-Error exceptions', async () => {
      mockFetch.mockRejectedValueOnce('String error');
      
      await expect(api.getSlots('2024-01-15')).rejects.toThrow('Network error occurred');
    });
  });

  describe('getAppointments', () => {
    it('should fetch all appointments', async () => {
      const mockAppointments: Appointment[] = [
        {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          date: '2024-01-15',
          time: '10:00',
          createdAt: new Date('2024-01-01')
        }
      ];
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockAppointments
      } as Response);
      
      const result = await api.getAppointments();
      
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:4009/api/appointments',
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      expect(result).toEqual(mockAppointments);
    });

    it('should handle server errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: 'InternalServerError', message: 'Database connection failed' })
      } as Response);
      
      await expect(api.getAppointments()).rejects.toThrow('Database connection failed');
    });
  });

  describe('createAppointment', () => {
    it('should create a new appointment', async () => {
      const requestData: CreateAppointmentRequest = {
        name: 'John Doe',
        email: 'john@example.com',
        date: '2024-01-15',
        time: '10:00',
        notes: 'First appointment'
      };
      
      const mockResponse: Appointment = {
        id: '123',
        ...requestData,
        createdAt: new Date('2024-01-01')
      };
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      } as Response);
      
      const result = await api.createAppointment(requestData);
      
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:4009/api/appointments',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestData)
        }
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle validation errors', async () => {
      const requestData: CreateAppointmentRequest = {
        name: '',
        email: 'invalid-email',
        date: '2024-01-15',
        time: '10:00'
      };
      
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ error: 'ValidationError', message: 'Invalid email format' })
      } as Response);
      
      await expect(api.createAppointment(requestData)).rejects.toThrow('Invalid email format');
    });
  });

  describe('cancelAppointment', () => {
    it('should cancel an appointment', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({})
      } as Response);
      
      await api.cancelAppointment('123');
      
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:4009/api/appointments/123',
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    });

    it('should handle not found errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ error: 'NotFound', message: 'Appointment not found' })
      } as Response);
      
      await expect(api.cancelAppointment('999')).rejects.toThrow('Appointment not found');
    });
  });

  describe('request method error handling', () => {
    it('should handle responses without error message', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: 'InternalServerError' })
      } as Response);
      
      await expect(api.getSlots('2024-01-15')).rejects.toThrow('HTTP 500');
    });

    it('should use fallback API URL when env var is not set', async () => {
      // Mock empty environment
      Object.defineProperty(import.meta, 'env', {
        value: {},
        writable: true
      });
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => []
      } as Response);
      
      await api.getSlots('2024-01-15');
      
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:4009/api/slots?date=2024-01-15',
        expect.any(Object)
      );
    });
  });
});