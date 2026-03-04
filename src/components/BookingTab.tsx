"use client"

import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { TimeSlot } from '../types';
import SlotGrid from './SlotGrid';
import BookingForm from './BookingForm';

interface BookingTabProps {
  onToast: (type: 'success' | 'error', message: string) => void;
}

function BookingTab({ onToast }: BookingTabProps): JSX.Element {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [showBookingForm, setShowBookingForm] = useState<boolean>(false);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (selectedDate) {
      fetchSlots();
    }
  }, [selectedDate]);

  const fetchSlots = async (): Promise<void> => {
    if (!selectedDate) return;
    
    setLoading(true);
    try {
      const slotsData = await api.getSlots(selectedDate);
      setSlots(slotsData);
    } catch (error) {
      onToast('error', error instanceof Error ? error.message : 'Failed to load time slots');
      setSlots([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSlotSelect = (time: string): void => {
    setSelectedSlot(time);
    setShowBookingForm(true);
  };

  const handleBookingSuccess = (): void => {
    setShowBookingForm(false);
    setSelectedSlot(null);
    onToast('success', 'Appointment booked successfully!');
    fetchSlots(); // Refresh slots
  };

  const handleBookingError = (error: string): void => {
    onToast('error', error);
  };

  const handleCloseForm = (): void => {
    setShowBookingForm(false);
    setSelectedSlot(null);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Select Date</h2>
        <input
          type="date"
          value={selectedDate}
          min={today}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      {selectedDate && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Available Time Slots</h2>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="text-gray-500">Loading available slots...</div>
            </div>
          ) : slots.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-500">No available slots for this date</div>
            </div>
          ) : (
            <SlotGrid slots={slots} onSlotSelect={handleSlotSelect} />
          )}
        </div>
      )}

      {showBookingForm && selectedSlot && (
        <BookingForm
          date={selectedDate}
          time={selectedSlot}
          onSuccess={handleBookingSuccess}
          onError={handleBookingError}
          onClose={handleCloseForm}
        />
      )}
    </div>
  );
}

export default BookingTab;