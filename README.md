# Stitch API

Appointment booking REST API built with Express.js and TypeScript.

## Setup

```bash
npm install
cp .env.example .env
```

## Development

```bash
npm run dev    # Start with hot reload
npm run build  # Build for production
npm start      # Run production build
npm test       # Run tests
```

## API Endpoints

- `GET /api/health` - Health check
- `GET /api/appointments` - List appointments (optional ?date=YYYY-MM-DD filter)
- `GET /api/appointments/:id` - Get appointment by ID
- `POST /api/appointments` - Create appointment
- `DELETE /api/appointments/:id` - Cancel appointment
- `GET /api/slots?date=YYYY-MM-DD` - Get available time slots

## Appointment Schema

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "date": "2025-01-15",
  "time": "09:30",
  "notes": "Optional notes"
}
```

## Time Slots

30-minute intervals from 09:00 to 16:30:
- 09:00, 09:30, 10:00, 10:30, ..., 16:00, 16:30

## Error Handling

- 400: Validation errors
- 404: Resource not found
- 409: Time slot conflict
- 500: Server errors
