import { Router, Request, Response, NextFunction } from 'express';
import { appointmentStore } from '../store.js';
import { dateQuerySchema, DateQuery } from '../schemas/appointment.js';
import { TimeSlot } from '../types.js';
import { HttpError } from '../middleware/error-handler.js';

const router = Router();

const timeSlots = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30'
];

// GET /api/slots?date=YYYY-MM-DD - Get available time slots
router.get('/', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.query.date) {
      throw new HttpError('date query parameter is required', 400);
    }
    
    const validatedQuery = dateQuerySchema.parse(req.query) as DateQuery;
    const bookedAppointments = appointmentStore.getByDate(validatedQuery.date);
    const bookedTimes = new Set(bookedAppointments.map(apt => apt.time));
    
    const availableSlots: TimeSlot[] = timeSlots.map(time => ({
      time,
      available: !bookedTimes.has(time)
    }));
    
    res.json(availableSlots);
  } catch (error) {
    next(error);
  }
});

export default router;
