import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/index.js';
import { appointmentStore } from '../src/store.js';

describe('Slots API', () => {
  beforeEach(() => {
    appointmentStore.clear();
  });

  describe('GET /api/slots', () => {
    it('should return all available slots for a date', async () => {
      const response = await request(app)
        .get('/api/slots?date=2025-12-25')
        .expect(200);

      expect(response.body).toHaveLength(16); // 9:00 to 16:30 in 30-min intervals
      expect(response.body[0]).toEqual({ time: '09:00', available: true });
      expect(response.body[15]).toEqual({ time: '16:30', available: true });
    });

    it('should exclude booked slots', async () => {
      // Create an appointment
      const appointmentData = {
        name: 'John Doe',
        email: 'john@example.com',
        date: '2025-12-25',
        time: '09:30'
      };

      await request(app)
        .post('/api/appointments')
        .send(appointmentData);

      const response = await request(app)
        .get('/api/slots?date=2025-12-25')
        .expect(200);

      const slot930 = response.body.find((slot: any) => slot.time === '09:30');
      expect(slot930.available).toBe(false);

      const slot900 = response.body.find((slot: any) => slot.time === '09:00');
      expect(slot900.available).toBe(true);
    });

    it('should return 400 when date parameter is missing', async () => {
      await request(app)
        .get('/api/slots')
        .expect(400);
    });

    it('should return 400 for invalid date format', async () => {
      await request(app)
        .get('/api/slots?date=invalid-date')
        .expect(400);
    });

    it('should return empty slots for date with no appointments', async () => {
      const response = await request(app)
        .get('/api/slots?date=2025-12-30')
        .expect(200);

      expect(response.body).toHaveLength(16);
      expect(response.body.every((slot: any) => slot.available === true)).toBe(true);
    });
  });
});
