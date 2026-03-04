import { describe, it, expect, beforeEach } from 'vitest';
import { appointmentStore } from '../src/store.js';
import { Appointment } from '../src/types.js';

describe('AppointmentStore', () => {
  beforeEach(() => {
    appointmentStore.clear();
  });

  describe('create and getById', () => {
    it('should create and retrieve an appointment', () => {
      const appointment: Appointment = {
        id: 'test-id',
        name: 'John Doe',
        email: 'john@example.com',
        date: '2025-12-25',
        time: '09:30',
        createdAt: new Date()
      };

      const created = appointmentStore.create(appointment);
      expect(created).toEqual(appointment);

      const retrieved = appointmentStore.getById('test-id');
      expect(retrieved).toEqual(appointment);
    });

    it('should return undefined for non-existent appointment', () => {
      const result = appointmentStore.getById('non-existent');
      expect(result).toBeUndefined();
    });
  });

  describe('getAll', () => {
    it('should return empty array when no appointments', () => {
      const appointments = appointmentStore.getAll();
      expect(appointments).toEqual([]);
    });

    it('should return all appointments', () => {
      const appointment1: Appointment = {
        id: 'id1',
        name: 'John Doe',
        email: 'john@example.com',
        date: '2025-12-25',
        time: '09:30',
        createdAt: new Date()
      };

      const appointment2: Appointment = {
        id: 'id2',
        name: 'Jane Smith',
        email: 'jane@example.com',
        date: '2025-12-26',
        time: '10:00',
        createdAt: new Date()
      };

      appointmentStore.create(appointment1);
      appointmentStore.create(appointment2);

      const appointments = appointmentStore.getAll();
      expect(appointments).toHaveLength(2);
      expect(appointments).toContain(appointment1);
      expect(appointments).toContain(appointment2);
    });
  });

  describe('getByDate', () => {
    it('should return appointments for specific date', () => {
      const appointment1: Appointment = {
        id: 'id1',
        name: 'John Doe',
        email: 'john@example.com',
        date: '2025-12-25',
        time: '09:30',
        createdAt: new Date()
      };

      const appointment2: Appointment = {
        id: 'id2',
        name: 'Jane Smith',
        email: 'jane@example.com',
        date: '2025-12-26',
        time: '10:00',
        createdAt: new Date()
      };

      const appointment3: Appointment = {
        id: 'id3',
        name: 'Bob Johnson',
        email: 'bob@example.com',
        date: '2025-12-25',
        time: '11:00',
        createdAt: new Date()
      };

      appointmentStore.create(appointment1);
      appointmentStore.create(appointment2);
      appointmentStore.create(appointment3);

      const appointments = appointmentStore.getByDate('2025-12-25');
      expect(appointments).toHaveLength(2);
      expect(appointments).toContain(appointment1);
      expect(appointments).toContain(appointment3);
      expect(appointments).not.toContain(appointment2);
    });

    it('should return empty array for date with no appointments', () => {
      const appointments = appointmentStore.getByDate('2025-12-31');
      expect(appointments).toEqual([]);
    });
  });

  describe('isSlotTaken', () => {
    it('should return true for taken slot', () => {
      const appointment: Appointment = {
        id: 'id1',
        name: 'John Doe',
        email: 'john@example.com',
        date: '2025-12-25',
        time: '09:30',
        createdAt: new Date()
      };

      appointmentStore.create(appointment);

      const isTaken = appointmentStore.isSlotTaken('2025-12-25', '09:30');
      expect(isTaken).toBe(true);
    });

    it('should return false for available slot', () => {
      const isTaken = appointmentStore.isSlotTaken('2025-12-25', '09:30');
      expect(isTaken).toBe(false);
    });

    it('should return false for same time on different date', () => {
      const appointment: Appointment = {
        id: 'id1',
        name: 'John Doe',
        email: 'john@example.com',
        date: '2025-12-25',
        time: '09:30',
        createdAt: new Date()
      };

      appointmentStore.create(appointment);

      const isTaken = appointmentStore.isSlotTaken('2025-12-26', '09:30');
      expect(isTaken).toBe(false);
    });

    it('should return false for different time on same date', () => {
      const appointment: Appointment = {
        id: 'id1',
        name: 'John Doe',
        email: 'john@example.com',
        date: '2025-12-25',
        time: '09:30',
        createdAt: new Date()
      };

      appointmentStore.create(appointment);

      const isTaken = appointmentStore.isSlotTaken('2025-12-25', '10:00');
      expect(isTaken).toBe(false);
    });
  });

  describe('delete', () => {
    it('should delete existing appointment', () => {
      const appointment: Appointment = {
        id: 'test-id',
        name: 'John Doe',
        email: 'john@example.com',
        date: '2025-12-25',
        time: '09:30',
        createdAt: new Date()
      };

      appointmentStore.create(appointment);
      expect(appointmentStore.getById('test-id')).toBeDefined();

      const deleted = appointmentStore.delete('test-id');
      expect(deleted).toBe(true);
      expect(appointmentStore.getById('test-id')).toBeUndefined();
    });

    it('should return false for non-existent appointment', () => {
      const deleted = appointmentStore.delete('non-existent');
      expect(deleted).toBe(false);
    });
  });

  describe('clear', () => {
    it('should remove all appointments', () => {
      const appointment1: Appointment = {
        id: 'id1',
        name: 'John Doe',
        email: 'john@example.com',
        date: '2025-12-25',
        time: '09:30',
        createdAt: new Date()
      };

      const appointment2: Appointment = {
        id: 'id2',
        name: 'Jane Smith',
        email: 'jane@example.com',
        date: '2025-12-26',
        time: '10:00',
        createdAt: new Date()
      };

      appointmentStore.create(appointment1);
      appointmentStore.create(appointment2);
      expect(appointmentStore.getAll()).toHaveLength(2);

      appointmentStore.clear();
      expect(appointmentStore.getAll()).toHaveLength(0);
    });
  });
});