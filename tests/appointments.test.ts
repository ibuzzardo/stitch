import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/index.js';
import { appointmentStore } from '../src/store.js';

describe('Appointments API', () => {
  beforeEach(() => {
    appointmentStore.clear();
  });

  describe('POST /api/appointments', () => {
    it('should create a new appointment', async () => {
      const appointmentData = {
        name: 'John Doe',
        email: 'john@example.com',
        date: '2025-12-25',
        time: '09:30',
        notes: 'Test appointment'
      };

      const response = await request(app)
        .post('/api/appointments')
        .send(appointmentData)
        .expect(201);

      expect(response.body).toMatchObject(appointmentData);
      expect(response.body.id).toBeDefined();
      expect(response.body.createdAt).toBeDefined();
    });

    it('should return 400 for invalid data', async () => {
      const invalidData = {
        name: 'A', // Too short
        email: 'invalid-email',
        date: '2020-01-01', // Past date
        time: '09:15' // Invalid time slot
      };

      await request(app)
        .post('/api/appointments')
        .send(invalidData)
        .expect(400);
    });

    it('should return 409 for double booking', async () => {
      const appointmentData = {
        name: 'John Doe',
        email: 'john@example.com',
        date: '2025-12-25',
        time: '09:30'
      };

      // Create first appointment
      await request(app)
        .post('/api/appointments')
        .send(appointmentData)
        .expect(201);

      // Try to book same slot
      await request(app)
        .post('/api/appointments')
        .send({ ...appointmentData, name: 'Jane Doe', email: 'jane@example.com' })
        .expect(409);
    });
  });

  describe('GET /api/appointments', () => {
    it('should return all appointments', async () => {
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
        .get('/api/appointments')
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0]).toMatchObject(appointmentData);
    });

    it('should filter appointments by date', async () => {
      const appointment1 = {
        name: 'John Doe',
        email: 'john@example.com',
        date: '2025-12-25',
        time: '09:30'
      };

      const appointment2 = {
        name: 'Jane Doe',
        email: 'jane@example.com',
        date: '2025-12-26',
        time: '10:00'
      };

      await request(app).post('/api/appointments').send(appointment1);
      await request(app).post('/api/appointments').send(appointment2);

      const response = await request(app)
        .get('/api/appointments?date=2025-12-25')
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0]).toMatchObject(appointment1);
    });
  });

  describe('GET /api/appointments/:id', () => {
    it('should return appointment by id', async () => {
      const appointmentData = {
        name: 'John Doe',
        email: 'john@example.com',
        date: '2025-12-25',
        time: '09:30'
      };

      const createResponse = await request(app)
        .post('/api/appointments')
        .send(appointmentData);

      const response = await request(app)
        .get(`/api/appointments/${createResponse.body.id}`)
        .expect(200);

      expect(response.body).toMatchObject(appointmentData);
    });

    it('should return 404 for non-existent appointment', async () => {
      await request(app)
        .get('/api/appointments/550e8400-e29b-41d4-a716-446655440000')
        .expect(404);
    });
  });

  describe('DELETE /api/appointments/:id', () => {
    it('should delete appointment', async () => {
      const appointmentData = {
        name: 'John Doe',
        email: 'john@example.com',
        date: '2025-12-25',
        time: '09:30'
      };

      const createResponse = await request(app)
        .post('/api/appointments')
        .send(appointmentData);

      await request(app)
        .delete(`/api/appointments/${createResponse.body.id}`)
        .expect(204);

      await request(app)
        .get(`/api/appointments/${createResponse.body.id}`)
        .expect(404);
    });

    it('should return 404 for non-existent appointment', async () => {
      await request(app)
        .delete('/api/appointments/550e8400-e29b-41d4-a716-446655440000')
        .expect(404);
    });
  });
});
