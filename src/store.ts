import { Appointment } from './types.js';

class AppointmentStore {
  private appointments = new Map<string, Appointment>();

  getAll(): Appointment[] {
    return Array.from(this.appointments.values());
  }

  getById(id: string): Appointment | undefined {
    return this.appointments.get(id);
  }

  getByDate(date: string): Appointment[] {
    return this.getAll().filter(appointment => appointment.date === date);
  }

  isSlotTaken(date: string, time: string): boolean {
    return this.getAll().some(
      appointment => appointment.date === date && appointment.time === time
    );
  }

  create(appointment: Appointment): Appointment {
    this.appointments.set(appointment.id, appointment);
    return appointment;
  }

  delete(id: string): boolean {
    return this.appointments.delete(id);
  }

  clear(): void {
    this.appointments.clear();
  }
}

export const appointmentStore = new AppointmentStore();
