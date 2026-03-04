import { describe, it, expect } from 'vitest';
import {
  createAppointmentSchema,
  appointmentParamsSchema,
  dateQuerySchema
} from '../src/schemas/appointment.js';

describe('Appointment Schemas', () => {
  describe('createAppointmentSchema', () => {
    it('should validate valid appointment data', () => {
      const validData = {
        name: 'John Doe',
        email: 'john@example.com',
        date: '2027-12-25',
        time: '09:30',
        notes: 'Test appointment'
      };

      const result = createAppointmentSchema.parse(validData);
      expect(result).toEqual(validData);
    });

    it('should validate appointment without notes', () => {
      const validData = {
        name: 'John Doe',
        email: 'john@example.com',
        date: '2027-12-25',
        time: '09:30'
      };

      const result = createAppointmentSchema.parse(validData);
      expect(result).toEqual(validData);
    });

    it('should trim whitespace from name', () => {
      const data = {
        name: '  John Doe  ',
        email: 'john@example.com',
        date: '2027-12-25',
        time: '09:30'
      };

      const result = createAppointmentSchema.parse(data);
      expect(result.name).toBe('John Doe');
    });

    describe('name validation', () => {
      it('should reject name too short', () => {
        const data = {
          name: 'A',
          email: 'john@example.com',
          date: '2027-12-25',
          time: '09:30'
        };

        expect(() => createAppointmentSchema.parse(data)).toThrow('Name must be at least 2 characters');
      });

      it('should reject name too long', () => {
        const data = {
          name: 'A'.repeat(101),
          email: 'john@example.com',
          date: '2027-12-25',
          time: '09:30'
        };

        expect(() => createAppointmentSchema.parse(data)).toThrow('Name must be at most 100 characters');
      });

      it('should accept name at boundaries', () => {
        const minData = {
          name: 'AB',
          email: 'john@example.com',
          date: '2027-12-25',
          time: '09:30'
        };

        const maxData = {
          name: 'A'.repeat(100),
          email: 'john@example.com',
          date: '2027-12-25',
          time: '09:30'
        };

        expect(() => createAppointmentSchema.parse(minData)).not.toThrow();
        expect(() => createAppointmentSchema.parse(maxData)).not.toThrow();
      });
    });

    describe('email validation', () => {
      it('should reject invalid email formats', () => {
        const invalidEmails = [
          'invalid-email',
          '@example.com',
          'user@',
          'user.example.com',
          'user@.com',
          'user@example.',
          ''
        ];

        invalidEmails.forEach(email => {
          const data = {
            name: 'John Doe',
            email,
            date: '2027-12-25',
            time: '09:30'
          };

          expect(() => createAppointmentSchema.parse(data)).toThrow('Invalid email format');
        });
      });

      it('should accept valid email formats', () => {
        const validEmails = [
          'user@example.com',
          'user.name@example.com',
          'user+tag@example.co.uk',
          'user123@example-domain.com'
        ];

        validEmails.forEach(email => {
          const data = {
            name: 'John Doe',
            email,
            date: '2027-12-25',
            time: '09:30'
          };

          expect(() => createAppointmentSchema.parse(data)).not.toThrow();
        });
      });
    });

    describe('date validation', () => {
      it('should reject invalid date formats', () => {
        const invalidDates = [
          '2025/12/25',
          '25-12-2025',
          '2027-12-25T10:00:00Z',
          'December 25, 2025',
          '2025-13-01',
          '2025-12-32',
          ''
        ];

        invalidDates.forEach(date => {
          const data = {
            name: 'John Doe',
            email: 'john@example.com',
            date,
            time: '09:30'
          };

          expect(() => createAppointmentSchema.parse(data)).toThrow();
        });
      });

      it('should reject past dates', () => {
        const pastDate = '2020-01-01';
        const data = {
          name: 'John Doe',
          email: 'john@example.com',
          date: pastDate,
          time: '09:30'
        };

        expect(() => createAppointmentSchema.parse(data)).toThrow('Date must be today or in the future');
      });

      it('should accept today and future dates', () => {
        const today = new Date().toISOString().split('T')[0];
        const futureDate = '2027-12-25';

        [today, futureDate].forEach(date => {
          const data = {
            name: 'John Doe',
            email: 'john@example.com',
            date,
            time: '09:30'
          };

          expect(() => createAppointmentSchema.parse(data)).not.toThrow();
        });
      });
    });

    describe('time validation', () => {
      it('should accept valid time slots', () => {
        const validTimes = [
          '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
          '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
          '15:00', '15:30', '16:00', '16:30'
        ];

        validTimes.forEach(time => {
          const data = {
            name: 'John Doe',
            email: 'john@example.com',
            date: '2027-12-25',
            time
          };

          expect(() => createAppointmentSchema.parse(data)).not.toThrow();
        });
      });

      it('should reject invalid time slots', () => {
        const invalidTimes = [
          '08:30', '09:15', '17:00', '12:45',
          '9:00', '09:30:00', 'invalid-time', ''
        ];

        invalidTimes.forEach(time => {
          const data = {
            name: 'John Doe',
            email: 'john@example.com',
            date: '2027-12-25',
            time
          };

          expect(() => createAppointmentSchema.parse(data)).toThrow('Invalid time slot');
        });
      });
    });

    describe('notes validation', () => {
      it('should accept notes within limit', () => {
        const data = {
          name: 'John Doe',
          email: 'john@example.com',
          date: '2027-12-25',
          time: '09:30',
          notes: 'A'.repeat(500)
        };

        expect(() => createAppointmentSchema.parse(data)).not.toThrow();
      });

      it('should reject notes exceeding limit', () => {
        const data = {
          name: 'John Doe',
          email: 'john@example.com',
          date: '2027-12-25',
          time: '09:30',
          notes: 'A'.repeat(501)
        };

        expect(() => createAppointmentSchema.parse(data)).toThrow('Notes must be at most 500 characters');
      });
    });
  });

  describe('appointmentParamsSchema', () => {
    it('should validate valid UUID', () => {
      const validUUID = '123e4567-e89b-12d3-a456-426614174000';
      const result = appointmentParamsSchema.parse({ id: validUUID });
      expect(result.id).toBe(validUUID);
    });

    it('should reject invalid UUID formats', () => {
      const invalidUUIDs = [
        'not-a-uuid',
        '123',
        '123e4567-e89b-12d3-a456',
        '123e4567-e89b-12d3-a456-42661417400g',
        ''
      ];

      invalidUUIDs.forEach(id => {
        expect(() => appointmentParamsSchema.parse({ id })).toThrow('Invalid appointment ID');
      });
    });
  });

  describe('dateQuerySchema', () => {
    it('should validate valid date format', () => {
      const validDate = '2027-12-25';
      const result = dateQuerySchema.parse({ date: validDate });
      expect(result.date).toBe(validDate);
    });

    it('should reject invalid date formats', () => {
      const invalidDates = [
        '2025/12/25',
        '25-12-2025',
        'December 25, 2025',
        'invalid-date',
        ''
      ];

      invalidDates.forEach(date => {
        expect(() => dateQuerySchema.parse({ date })).toThrow('Date must be in YYYY-MM-DD format');
      });
    });
  });
});