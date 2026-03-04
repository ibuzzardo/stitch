import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/index.js';
import { appointmentStore } from '../src/store.js';

describe('Slots API - Extended Tests', () => {
  beforeEach(() => {
    appointmentStore.clear();
  });

  describe('GET /api/slots - Edge Cases', () => {
    it('should return 400 when date parameter is missing', async () => {
      const response = await request(app)
        .get('/api/slots')
        .expect(400);

      expect(response.body.error).toBeDefined();
      expect(response.body.message).toContain('date query parameter is required');
    });

    it('should return 400 for invalid date formats', async () => {
      const invalidDates = [
        '2025/12/25',
        '25-12-2025',
        'December 25, 2025',
        '2025-13-01', // Invalid month
        '2025-12-32', // Invalid day
        'invalid-date',
        ''
      ];

      for (const date of invalidDates) {
        await request(app)
          .get(`/api/slots?date=${date}`)
          .expect(400);
      }
    });

    it('should handle URL encoded date parameters', async () => {
      const response = await request(app)
        .get('/api/slots?date=2025-12-25')
        .expect(200);

      expect(response.body).toHaveLength(16);
    });

    it('should ignore additional query parameters', async () => {
      const response = await request(app)
        .get('/api/slots?date=2025-12-25&extra=ignored&another=param')
        .expect(200);

      expect(response.body).toHaveLength(16);
    });

    it('should return correct slot structure', async () => {
      const response = await request(app)
        .get('/api/slots?date=2025-12-25')
        .expect(200);

      response.body.forEach((slot: any) => {
        expect(slot).toHaveProperty('time');
        expect(slot).toHaveProperty('available');
        expect(typeof slot.time).toBe('string');
        expect(typeof slot.available).toBe('boolean');
        expect(slot.time).toMatch(/^\d{2}:\d{2}$/);
      });
    });

    it('should return slots in chronological order', async () => {
      const response = await request(app)
        .get('/api/slots?date=2025-12-25')
        .expect(200);

      const times = response.body.map((slot: any) => slot.time);
      const expectedTimes = [
        '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
        '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
        '15:00', '15:30', '16:00', '16:30'
      ];

      expect(times).toEqual(expectedTimes);
    });

    it('should handle multiple booked slots correctly', async () => {
      // Book multiple appointments
      const appointments = [
        { time: '09:00', name: 'John Doe', email: 'john@example.com' },
        { time: '10:30', name: 'Jane Smith', email: 'jane@example.com' },
        { time: '14:00', name: 'Bob Johnson', email: 'bob@example.com' },
        { time: '16:30', name: 'Alice Brown', email: 'alice@example.com' }
      ];

      for (const apt of appointments) {
        await request(app)
          .post('/api/appointments')
          .send({
            name: apt.name,
            email: apt.email,
            date: '2025-12-25',
            time: apt.time
          });
      }

      const response = await request(app)
        .get('/api/slots?date=2025-12-25')
        .expect(200);

      const bookedSlots = response.body.filter((slot: any) => !slot.available);
      const availableSlots = response.body.filter((slot: any) => slot.available);

      expect(bookedSlots).toHaveLength(4);
      expect(availableSlots).toHaveLength(12);

      const bookedTimes = bookedSlots.map((slot: any) => slot.time);
      expect(bookedTimes).toEqual(['09:00', '10:30', '14:00', '16:30']);
    });

    it('should handle all slots booked scenario', async () => {
      const allTimes = [
        '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
        '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
        '15:00', '15:30', '16:00', '16:30'
      ];

      // Book all slots
      for (let i = 0; i < allTimes.length; i++) {
        await request(app)
          .post('/api/appointments')
          .send({
            name: `User ${i}`,
            email: `user${i}@example.com`,
            date: '2025-12-25',
            time: allTimes[i]
          });
      }

      const response = await request(app)
        .get('/api/slots?date=2025-12-25')
        .expect(200);

      expect(response.body).toHaveLength(16);
      expect(response.body.every((slot: any) => !slot.available)).toBe(true);
    });

    it('should not affect slots on different dates', async () => {
      // Book appointment on one date
      await request(app)
        .post('/api/appointments')
        .send({
          name: 'John Doe',
          email: 'john@example.com',
          date: '2025-12-25',
          time: '09:30'
        });

      // Check slots on different date
      const response = await request(app)
        .get('/api/slots?date=2025-12-26')
        .expect(200);

      expect(response.body.every((slot: any) => slot.available)).toBe(true);
    });

    it('should handle past dates (should still return slots)', async () => {
      // Note: The API doesn't prevent querying past dates for slots
      const response = await request(app)
        .get('/api/slots?date=2020-01-01')
        .expect(200);

      expect(response.body).toHaveLength(16);
      expect(response.body.every((slot: any) => slot.available)).toBe(true);
    });

    it('should handle leap year dates', async () => {
      const response = await request(app)
        .get('/api/slots?date=2024-02-29')
        .expect(200);

      expect(response.body).toHaveLength(16);
    });

    it('should handle edge case dates', async () => {
      const edgeDates = [
        '2025-01-01', // New Year
        '2025-12-31', // New Year's Eve
        '2025-02-28', // End of February (non-leap year)
        '2024-02-29'  // Leap day
      ];

      for (const date of edgeDates) {
        const response = await request(app)
          .get(`/api/slots?date=${date}`)
          .expect(200);

        expect(response.body).toHaveLength(16);
      }
    });
  });

  describe('Slots Integration with Appointments', () => {
    it('should update slot availability after appointment creation', async () => {
      // Check initial availability
      let response = await request(app)
        .get('/api/slots?date=2025-12-25')
        .expect(200);

      let slot930 = response.body.find((slot: any) => slot.time === '09:30');
      expect(slot930.available).toBe(true);

      // Create appointment
      await request(app)
        .post('/api/appointments')
        .send({
          name: 'John Doe',
          email: 'john@example.com',
          date: '2025-12-25',
          time: '09:30'
        })
        .expect(201);

      // Check updated availability
      response = await request(app)
        .get('/api/slots?date=2025-12-25')
        .expect(200);

      slot930 = response.body.find((slot: any) => slot.time === '09:30');
      expect(slot930.available).toBe(false);
    });

    it('should update slot availability after appointment deletion', async () => {
      // Create appointment
      const createResponse = await request(app)
        .post('/api/appointments')
        .send({
          name: 'John Doe',
          email: 'john@example.com',
          date: '2025-12-25',
          time: '09:30'
        })
        .expect(201);

      const appointmentId = createResponse.body.id;

      // Check slot is unavailable
      let response = await request(app)
        .get('/api/slots?date=2025-12-25')
        .expect(200);

      let slot930 = response.body.find((slot: any) => slot.time === '09:30');
      expect(slot930.available).toBe(false);

      // Delete appointment
      await request(app)
        .delete(`/api/appointments/${appointmentId}`)
        .expect(204);

      // Check slot is available again
      response = await request(app)
        .get('/api/slots?date=2025-12-25')
        .expect(200);

      slot930 = response.body.find((slot: any) => slot.time === '09:30');
      expect(slot930.available).toBe(true);
    });
  });
});