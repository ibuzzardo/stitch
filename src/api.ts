import { Appointment, TimeSlot, APIError, CreateAppointmentRequest } from './types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4009/api';

class ApiClient {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });

      if (!response.ok) {
        const errorData: APIError = await response.json();
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error occurred');
    }
  }

  async getSlots(date: string): Promise<TimeSlot[]> {
    return this.request<TimeSlot[]>(`/slots?date=${date}`);
  }

  async getAppointments(): Promise<Appointment[]> {
    return this.request<Appointment[]>('/appointments');
  }

  async createAppointment(data: CreateAppointmentRequest): Promise<Appointment> {
    return this.request<Appointment>('/appointments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async cancelAppointment(id: string): Promise<void> {
    await this.request<void>(`/appointments/${id}`, {
      method: 'DELETE',
    });
  }
}

export const api = new ApiClient();