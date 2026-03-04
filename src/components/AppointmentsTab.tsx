"use client"

import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { Appointment } from '../types';

interface AppointmentsTabProps {
  onToast: (type: 'success' | 'error', message: string) => void;
}

function AppointmentsTab({ onToast }: AppointmentsTabProps): JSX.Element {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async (): Promise<void> => {
    setLoading(true);
    try {
      const appointmentsData = await api.getAppointments();
      setAppointments(appointmentsData);
    } catch (error) {
      onToast('error', error instanceof Error ? error.message : 'Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id: string, name: string): Promise<void> => {
    if (!window.confirm(`Are you sure you want to cancel the appointment for ${name}?`)) {
      return;
    }

    setCancellingId(id);
    try {
      await api.cancelAppointment(id);
      setAppointments(prev => prev.filter(apt => apt.id !== id));
      onToast('success', 'Appointment cancelled successfully');
    } catch (error) {
      onToast('error', error instanceof Error ? error.message : 'Failed to cancel appointment');
    } finally {
      setCancellingId(null);
    }
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeStr: string): string => {
    const [hours, minutes] = timeStr.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center py-8">
          <div className="text-gray-500">Loading appointments...</div>
        </div>
      </div>
    );
  }

  if (appointments.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center py-8">
          <div className="text-gray-500 mb-2">No appointments yet</div>
          <div className="text-sm text-gray-400">Your booked appointments will appear here</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Your Appointments</h2>
      
      <div className="space-y-4">
        {appointments.map((appointment) => (
          <div key={appointment.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4">
                  <div>
                    <h3 className="font-medium text-gray-900">{appointment.name}</h3>
                    <p className="text-sm text-gray-600">{appointment.email}</p>
                  </div>
                  <div className="mt-2 sm:mt-0">
                    <p className="text-sm font-medium text-gray-900">
                      {formatDate(appointment.date)}
                    </p>
                    <p className="text-sm text-gray-600">
                      {formatTime(appointment.time)}
                    </p>
                  </div>
                </div>
                {appointment.notes && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Notes:</span> {appointment.notes}
                    </p>
                  </div>
                )}
              </div>
              <div className="mt-4 sm:mt-0 sm:ml-4">
                <button
                  onClick={() => handleCancel(appointment.id, appointment.name)}
                  disabled={cancellingId === appointment.id}
                  className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {cancellingId === appointment.id ? 'Cancelling...' : 'Cancel'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AppointmentsTab;