import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/index.js';
import { appointmentStore } from '../src/store.js';

describe('Appointments API - Extended Tests', () => {
  beforeEach(() => {
    appointmentStore.clear();
  });

  describe('POST /api/appointments - Edge Cases', () => {
    it('should handle missing required fields', async () => {
      const incompleteData = {
        name: 'John Doe'
        // Missing email, date, time
      };

      const response = await request(app)
        .post('/api/appointments')
        .send(incompleteData)
        .expect(400);

      expect(response.body.error).toBe('Validation Error');
      expect(response.body.details).toBeDefined();
    });

    it('should handle empty request body', async () => {
      await request(app)
        .post('/api/appointments')
        .send({})
        .expect(400);
    });

    it('should handle malformed JSON gracefully', async () => {
      await request(app)
        .post('/api/appointments')
        .set('Content-Type', 'application/json')
        .send('{ invalid json }')
        .expect(400);
    });

    it('should validate email format strictly', async () => {
      const invalidEmails = [
        'plainaddress',
        '@missingdomain.com',
        'missing@.com',
        'missing@domain',
        'spaces @domain.com'
      ];

      for (const email of invalidEmails) {
        await request(app)
          .post('/api/appointments')
          .send({
            name: 'John Doe',
            email,
            date: '2027-12-25',
            time: '09:30'
          })
          .expect(400);
      }
    });

    it('should validate date format strictly', async () => {
      const invalidDates = [
        '2025/12/25',
        '25-12-2025',
        '2027-12-25T10:00:00Z',
        '2025-13-01', // Invalid month
        '2025-12-32', // Invalid day
        '25/12/2025'
      ];

      for (const date of invalidDates) {
        await request(app)
          .post('/api/appointments')
          .send({
            name: 'John Doe',
            email: 'john@example.com',
            date,
            time: '09:30'
          })
          .expect(400);
      }
    });

    it('should reject appointments in the past', async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const pastDate = yesterday.toISOString().split('T')[0];

      await request(app)
        .post('/api/appointments')
        .send({
          name: 'John Doe',
          email: 'john@example.com',
          date: pastDate,
          time: '09:30'
        })
        .expect(400);
    });

    it('should accept appointment for today', async () => {
      const today = new Date().toISOString().split('T')[0];

      await request(app)
        .post('/api/appointments')
        .send({
          name: 'John Doe',
          email: 'john@example.com',
          date: today,
          time: '09:30'
        })
        .expect(201);
    });

    it('should validate time slots strictly', async () => {
      const invalidTimes = [
        '08:30', // Before business hours
        '17:00', // After business hours
        '09:15', // Not 30-minute interval
        '12:45', // Not 30-minute interval
        '9:00',  // Wrong format
        '09:30:00', // Wrong format
        'invalid'
      ];

      for (const time of invalidTimes) {
        await request(app)
          .post('/api/appointments')
          .send({
            name: 'John Doe',
            email: 'john@example.com',
            date: '2027-12-25',
            time
          })
          .expect(400);
      }
    });

    it('should handle very long notes', async () => {
      const longNotes = 'A'.repeat(501);

      await request(app)
        .post('/api/appointments')
        .send({
          name: 'John Doe',
          email: 'john@example.com',
          date: '2027-12-25',
          time: '09:30',
          notes: longNotes
        })
        .expect(400);
    });

    it('should accept notes at maximum length', async () => {
      const maxNotes = 'A'.repeat(500);

      await request(app)
        .post('/api/appointments')
        .send({
          name: 'John Doe',
          email: 'john@example.com',
          date: '2027-12-25',
          time: '09:30',
          notes: maxNotes
        })
        .expect(201);
    });

    it('should handle concurrent booking attempts', async () => {
      const appointmentData = {
        name: 'John Doe',
        email: 'john@example.com',
        date: '2027-12-25',
        time: '09:30'
      };

      const secondAppointmentData = {
        name: 'Jane Smith',
        email: 'jane@example.com',
        date: '2027-12-25',
        time: '09:30'
      };

      // Make concurrent requests
      const [response1, response2] = await Promise.all([
        request(app).post('/api/appointments').send(appointmentData),
        request(app).post('/api/appointments').send(secondAppointmentData)
      ]);

      // One should succeed, one should fail
      const statuses = [response1.status, response2.status].sort();
      expect(statuses).toEqual([201, 409]);
    });
  });

  describe('GET /api/appointments/:id - Edge Cases', () => {
    it('should return 400 for invalid UUID format', async () => {
      await request(app)
        .get('/api/appointments/invalid-uuid')
        .expect(400);
    });

    it('should return 404 for valid UUID that does not exist', async () => {
      const validUUID = '123e4567-e89b-12d3-a456-426614174000';
      await request(app)
        .get(`/api/appointments/${validUUID}`)
        .expect(404);
    });

    it('should handle special characters in URL', async () => {
      await request(app)
        .get('/api/appointments/special-chars-!@#$%')
        .expect(400);
    });
  });

  describe('DELETE /api/appointments/:id - Edge Cases', () => {
    it('should return 400 for invalid UUID format', async () => {
      await request(app)
        .delete('/api/appointments/invalid-uuid')
        .expect(400);
    });

    it('should return 404 for valid UUID that does not exist', async () => {
      const validUUID = '123e4567-e89b-12d3-a456-426614174000';
      await request(app)
        .delete(`/api/appointments/${validUUID}`)
        .expect(404);
    });

    it('should successfully delete and then return 404 on subsequent delete', async () => {
      // Create appointment
      const response = await request(app)
        .post('/api/appointments')
        .send({
          name: 'John Doe',
          email: 'john@example.com',
          date: '2027-12-25',
          time: '09:30'
        })
        .expect(201);

      const appointmentId = response.body.id;

      // Delete appointment
      await request(app)
        .delete(`/api/appointments/${appointmentId}`)
        .expect(204);

      // Try to delete again
      await request(app)
        .delete(`/api/appointments/${appointmentId}`)
        .expect(404);
    });
  });

  describe('GET /api/appointments - Query Parameters', () => {
    beforeEach(async () => {
      // Create test appointments
      await request(app)
        .post('/api/appointments')
        .send({
          name: 'John Doe',
          email: 'john@example.com',
          date: '2027-12-25',
          time: '09:30'
        });

      await request(app)
        .post('/api/appointments')
        .send({
          name: 'Jane Smith',
          email: 'jane@example.com',
          date: '2027-12-26',
          time: '10:00'
        });

      await request(app)
        .post('/api/appointments')
        .send({
          name: 'Bob Johnson',
          email: 'bob@example.com',
          date: '2027-12-25',
          time: '11:00'
        });
    });

    it('should handle invalid date query parameter', async () => {
      await request(app)
        .get('/api/appointments?date=invalid-date')
        .expect(400);
    });

    it('should handle multiple query parameters gracefully', async () => {
      const response = await request(app)
        .get('/api/appointments?date=2027-12-25&extra=ignored')
        .expect(200);

      expect(response.body).toHaveLength(2);
    });

    it('should return empty array for date with no appointments', async () => {
      const response = await request(app)
        .get('/api/appointments?date=2027-12-31')
        .expect(200);

      expect(response.body).toEqual([]);
    });
  });

  describe('Response Headers and Content Type', () => {
    it('should return JSON content type for all endpoints', async () => {
      const endpoints = [
        { method: 'get', path: '/api/appointments' },
        { method: 'get', path: '/api/health' },
        { method: 'get', path: '/api/slots?date=2027-12-25' }
      ];

      for (const endpoint of endpoints) {
        const response = await request(app)[endpoint.method](endpoint.path);
        expect(response.headers['content-type']).toMatch(/application\/json/);
      }
    });

    it('should handle CORS headers', async () => {
      const response = await request(app)
        .options('/api/appointments')
        .expect(204);

      expect(response.headers['access-control-allow-origin']).toBeDefined();
    });
  });
});