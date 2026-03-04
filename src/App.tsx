"use client"

import React, { useState } from 'react';
import BookingTab from './components/BookingTab';
import AppointmentsTab from './components/AppointmentsTab';
import Toast from './components/Toast';
import { ToastMessage } from './types';

type Tab = 'book' | 'appointments';

function App(): JSX.Element {
  const [activeTab, setActiveTab] = useState<Tab>('book');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'success' | 'error', message: string): void => {
    const id = Math.random().toString(36).substr(2, 9);
    const toast: ToastMessage = { id, type, message };
    setToasts(prev => [...prev, toast]);
    
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  };

  const removeToast = (id: string): void => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-4">
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Stitch Appointments</h1>
          
          <nav className="border-b border-gray-200">
            <div className="flex space-x-8">
              <button
                onClick={() => setActiveTab('book')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'book'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Book Appointment
              </button>
              <button
                onClick={() => setActiveTab('appointments')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'appointments'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                My Appointments
              </button>
            </div>
          </nav>
        </header>

        <main>
          {activeTab === 'book' && <BookingTab onToast={addToast} />}
          {activeTab === 'appointments' && <AppointmentsTab onToast={addToast} />}
        </main>
      </div>

      {toasts.map(toast => (
        <Toast
          key={toast.id}
          type={toast.type}
          message={toast.message}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
}

export default App;