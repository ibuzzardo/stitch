# Stitch Frontend

React frontend for the Stitch appointment booking application.

## Features

- **Book Appointments**: Select date and time, fill out booking form
- **View Appointments**: See all booked appointments with cancel functionality
- **Responsive Design**: Works on desktop and mobile devices
- **Real-time Updates**: Slots refresh after booking/cancelling

## Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Environment Configuration**:
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your API URL if different from default:
   ```
   VITE_API_URL=http://localhost:4009/api
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

4. **Build for production**:
   ```bash
   npm run build
   ```

5. **Preview production build**:
   ```bash
   npm run preview
   ```

## API Integration

The frontend connects to the Stitch API server. Make sure the API server is running on the configured URL (default: `http://localhost:4009/api`).

### Required API Endpoints

- `GET /api/slots?date=YYYY-MM-DD` - Get available time slots
- `GET /api/appointments` - List all appointments
- `POST /api/appointments` - Create new appointment
- `DELETE /api/appointments/:id` - Cancel appointment

## Technology Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Zod** - Form validation

## Project Structure

```
src/
├── components/          # React components
│   ├── AppointmentsTab.tsx
│   ├── BookingForm.tsx
│   ├── BookingTab.tsx
│   ├── SlotGrid.tsx
│   └── Toast.tsx
├── api.ts              # API client
├── types.ts            # TypeScript interfaces
├── App.tsx             # Main app component
├── main.tsx            # React entry point
└── index.css           # Global styles
```

## Usage

### Booking an Appointment

1. Select a date using the date picker
2. Choose an available time slot from the grid
3. Fill out the booking form with your details
4. Submit to book the appointment

### Managing Appointments

1. Switch to the "My Appointments" tab
2. View all your booked appointments
3. Cancel appointments with the cancel button
4. Confirm cancellation in the dialog

## Responsive Design

The application is fully responsive and works on:
- Mobile devices (320px+)
- Tablets (768px+)
- Desktop (1280px+)

## Error Handling

- Form validation with inline error messages
- API error handling with toast notifications
- Loading states for better user experience
- Graceful handling of network errors
