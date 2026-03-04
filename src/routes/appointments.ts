import { Router, Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { appointmentStore } from '../store.js';
import {
  createAppointmentSchema,
  appointmentParamsSchema,
  dateQuerySchema,
  CreateAppointmentInput,
  AppointmentParams,
  DateQuery
} from '../schemas/appointment.js';
import { Appointment } from '../types.js';
import { HttpError } from '../middleware/error-handler.js';

const router = Router();

// GET /api/appointments - List all appointments with optional date filter
router.get('/', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { date } = req.query;
    
    if (date) {
      const validatedQuery = dateQuerySchema.parse({ date });
      const appointments = appointmentStore.getByDate(validatedQuery.date);
      res.json(appointments);
    } else {
      const appointments = appointmentStore.getAll();
      res.json(appointments);
    }
  } catch (error) {
    next(error);
  }
});

// GET /api/appointments/:id - Get single appointment
router.get('/:id', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const params = appointmentParamsSchema.parse(req.params) as AppointmentParams;
    const appointment = appointmentStore.getById(params.id);
    
    if (!appointment) {
      throw new HttpError('Appointment not found', 404);
    }
    
    res.json(appointment);
  } catch (error) {
    next(error);
  }
});

// POST /api/appointments - Create new appointment
router.post('/', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const validatedData = createAppointmentSchema.parse(req.body) as CreateAppointmentInput;
    
    // Check if slot is already taken
    if (appointmentStore.isSlotTaken(validatedData.date, validatedData.time)) {
      throw new HttpError('This time slot is no longer available', 409);
    }
    
    const appointment: Appointment = {
      id: uuidv4(),
      ...validatedData,
      createdAt: new Date()
    };
    
    const created = appointmentStore.create(appointment);
    res.status(201).json(created);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/appointments/:id - Cancel appointment
router.delete('/:id', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const params = appointmentParamsSchema.parse(req.params) as AppointmentParams;
    const deleted = appointmentStore.delete(params.id);
    
    if (!deleted) {
      throw new HttpError('Appointment not found', 404);
    }
    
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
