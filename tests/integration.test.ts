import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/index.js';
import { appointmentStore } from '../src/store.js';

describe('Integration Tests', () => {
  beforeEach(() => {
    appointmentStore.clear();
  });

  describe('Complete Appointment Workflow', () => {
    it('should handle complete appointment lifecycle', async () => {
      const appointmentData = {
        name: 'John Doe',
        email: 'john@example.com',
        date: '2025-12-25',
        time: '09:30',
        notes: 'Initial consultation'
      };

      // 1. Check initial slot availability
      let slotsResponse = await request(app)
        .get('/api/slots?date=2025-12-25')
        .expect(200);

      let slot930 = slotsResponse.body.find((slot: any) => slot.time === '09:30');
      expect(slot930.available).toBe(true);

      // 2. Create appointment
      const createResponse = await request(app)
        .post('/api/appointments')
        .send(appointmentData)
        .expect(201);

      const appointmentId = createResponse.body.id;
      expect(createResponse.body).toMatchObject(appointmentData);
      expect(appointmentId).toBeDefined();

      // 3. Verify slot is now unavailable
      slotsResponse = await request(app)
        .get('/api/slots?date=2025-12-25')
        .expect(200);

      slot930 = slotsResponse.body.find((slot: any) => slot.time === '09:30');
      expect(slot930.available).toBe(false);

      // 4. Retrieve appointment by ID
      const getResponse = await request(app)
        .get(`/api/appointments/${appointmentId}`)
        .expect(200);

      expect(getResponse.body).toMatchObject(appointmentData);
      expect(getResponse.body.id).toBe(appointmentId);

      // 5. List all appointments
      const listResponse = await request(app)
        .get('/api/appointments')
        .expect(200);

      expect(listResponse.body).toHaveLength(1);
      expect(listResponse.body[0].id).toBe(appointmentId);

      // 6. Filter appointments by date
      const filterResponse = await request(app)
        .get('/api/appointments?date=2025-12-25')
        .expect(200);

      expect(filterResponse.body).toHaveLength(1);
      expect(filterResponse.body[0].id).toBe(appointmentId);

      // 7. Cancel appointment
      await request(app)
        .delete(`/api/appointments/${appointmentId}`)
        .expect(204);

      // 8. Verify appointment is deleted
      await request(app)
        .get(`/api/appointments/${appointmentId}`)
        .expect(404);

      // 9. Verify slot is available again
      slotsResponse = await request(app)
        .get('/api/slots?date=2025-12-25')
        .expect(200);

      slot930 = slotsResponse.body.find((slot: any) => slot.time === '09:30');
      expect(slot930.available).toBe(true);

      // 10. Verify appointments list is empty
      const finalListResponse = await request(app)
        .get('/api/appointments')
        .expect(200);

      expect(finalListResponse.body).toHaveLength(0);
    });

    it('should handle multiple appointments on different dates', async () => {
      const appointments = [
        {
          name: 'John Doe',
          email: 'john@example.com',
          date: '2025-12-25',
          time: '09:30'
        },
        {
          name: 'Jane Smith',
          email: 'jane@example.com',
          date: '2025-12-25',
          time: '10:00'
        },
        {
          name: 'Bob Johnson',
          email: 'bob@example.com',
          date: '2025-12-26',
          time: '09:30'
        }
      ];

      const createdIds = [];

      // Create all appointments
      for (const apt of appointments) {
        const response = await request(app)
          .post('/api/appointments')
          .send(apt)
          .expect(201);
        createdIds.push(response.body.id);
      }

      // Verify all appointments exist
      const allAppointments = await request(app)
        .get('/api/appointments')
        .expect(200);

      expect(allAppointments.body).toHaveLength(3);

      // Filter by first date
      const dec25Appointments = await request(app)
        .get('/api/appointments?date=2025-12-25')
        .expect(200);

      expect(dec25Appointments.body).toHaveLength(2);

      // Filter by second date
      const dec26Appointments = await request(app)
        .get('/api/appointments?date=2025-12-26')
        .expect(200);

      expect(dec26Appointments.body).toHaveLength(1);

      // Check slot availability for both dates
      const slots25 = await request(app)
        .get('/api/slots?date=2025-12-25')
        .expect(200);

      const unavailableSlots25 = slots25.body.filter((slot: any) => !slot.available);
      expect(unavailableSlots25).toHaveLength(2);
      expect(unavailableSlots25.map((s: any) => s.time)).toEqual(['09:30', '10:00']);

      const slots26 = await request(app)
        .get('/api/slots?date=2025-12-26')
        .expect(200);

      const unavailableSlots26 = slots26.body.filter((slot: any) => !slot.available);
      expect(unavailableSlots26).toHaveLength(1);
      expect(unavailableSlots26[0].time).toBe('09:30');
    });

    it('should prevent double booking and maintain data consistency', async () => {
      const appointmentData = {
        name: 'John Doe',
        email: 'john@example.com',
        date: '2025-12-25',
        time: '09:30'
      };

      // Create first appointment
      const firstResponse = await request(app)
        .post('/api/appointments')
        .send(appointmentData)
        .expect(201);

      // Attempt to book same slot
      await request(app)
        .post('/api/appointments')
        .send({
          ...appointmentData,
          name: 'Jane Smith',
          email: 'jane@example.com'
        })
        .expect(409);

      // Verify only one appointment exists
      const allAppointments = await request(app)
        .get('/api/appointments')
        .expect(200);

      expect(allAppointments.body).toHaveLength(1);
      expect(allAppointments.body[0].id).toBe(firstResponse.body.id);

      // Verify slot is still unavailable
      const slotsResponse = await request(app)
        .get('/api/slots?date=2025-12-25')
        .expect(200);

      const slot930 = slotsResponse.body.find((slot: any) => slot.time === '09:30');
      expect(slot930.available).toBe(false);
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle cascading validation errors', async () => {
      const invalidData = {
        name: 'A', // Too short
        email: 'invalid-email', // Invalid format
        date: '2020-01-01', // Past date
        time: '08:00', // Invalid time slot
        notes: 'A'.repeat(501) // Too long
      };

      const response = await request(app)
        .post('/api/appointments')
        .send(invalidData)
        .expect(400);

      expect(response.body.error).toBe('Validation Error');
      expect(response.body.details).toBeDefined();
      expect(Array.isArray(response.body.details)).toBe(true);
      expect(response.body.details.length).toBeGreaterThan(1);
    });

    it('should maintain consistency after errors', async () => {
      // Attempt invalid appointment creation
      await request(app)
        .post('/api/appointments')
        .send({
          name: 'John Doe',
          email: 'invalid-email',
          date: '2025-12-25',
          time: '09:30'
        })
        .expect(400);

      // Verify no appointment was created
      const appointments = await request(app)
        .get('/api/appointments')
        .expect(200);

      expect(appointments.body).toHaveLength(0);

      // Verify slot is still available
      const slots = await request(app)
        .get('/api/slots?date=2025-12-25')
        .expect(200);

      const slot930 = slots.body.find((slot: any) => slot.time === '09:30');
      expect(slot930.available).toBe(true);

      // Create valid appointment should still work
      await request(app)
        .post('/api/appointments')
        .send({
          name: 'John Doe',
          email: 'john@example.com',
          date: '2025-12-25',
          time: '09:30'
        })
        .expect(201);
    });
  });

  describe('API Contract Compliance', () => {
    it('should return consistent response formats', async () => {
      // Health endpoint
      const healthResponse = await request(app)
        .get('/api/health')
        .expect(200);

      expect(healthResponse.body).toHaveProperty('status');
      expect(healthResponse.body).toHaveProperty('uptime');

      // Slots endpoint
      const slotsResponse = await request(app)
        .get('/api/slots?date=2025-12-25')
        .expect(200);

      expect(Array.isArray(slotsResponse.body)).toBe(true);
      slotsResponse.body.forEach((slot: any) => {
        expect(slot).toHaveProperty('time');
        expect(slot).toHaveProperty('available');
      });

      // Appointments endpoint
      const appointmentsResponse = await request(app)
        .get('/api/appointments')
        .expect(200);

      expect(Array.isArray(appointmentsResponse.body)).toBe(true);
    });

    it('should handle all HTTP methods correctly', async () => {
      // Test unsupported methods return appropriate errors
      await request(app)
        .put('/api/appointments')
        .expect(404);

      await request(app)
        .patch('/api/appointments')
        .expect(404);

      // Test CORS preflight
      await request(app)
        .options('/api/appointments')
        .expect(204);
    });
  });
});