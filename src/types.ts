export interface Appointment {
  id: string;
  name: string;
  email: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  notes?: string;
  createdAt: Date;
}

export interface TimeSlot {
  time: string; // HH:MM
  available: boolean;
}

export interface APIError {
  error: string;
  message: string;
  details?: unknown;
}

export interface CreateAppointmentRequest {
  name: string;
  email: string;
  date: string;
  time: string;
  notes?: string;
}

export type ToastType = 'success' | 'error';

export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
}