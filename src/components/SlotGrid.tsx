"use client"

import React from 'react';
import { TimeSlot } from '../types';

interface SlotGridProps {
  slots: TimeSlot[];
  onSlotSelect: (time: string) => void;
}

function SlotGrid({ slots, onSlotSelect }: SlotGridProps): JSX.Element {
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

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      {slots.map((slot) => (
        <button
          key={slot.time}
          onClick={() => slot.available && onSlotSelect(slot.time)}
          disabled={!slot.available}
          className={`px-4 py-3 rounded-md font-medium text-sm transition-colors ${
            slot.available
              ? 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
          }`}
        >
          {formatTime(slot.time)}
        </button>
      ))}
    </div>
  );
}

export default SlotGrid;