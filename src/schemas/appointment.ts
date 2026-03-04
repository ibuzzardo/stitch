import { z } from 'zod';

const timeSlots = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30'
];

export const createAppointmentSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be at most 100 characters')
    .trim(),
  email: z.string()
    .email('Invalid email format'),
  date: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
    .refine((date) => {
      const appointmentDate = new Date(date + 'T00:00:00.000Z');
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return appointmentDate >= today;
    }, 'Date must be today or in the future'),
  time: z.string()
    .refine((time) => timeSlots.includes(time), 'Invalid time slot'),
  notes: z.string()
    .max(500, 'Notes must be at most 500 characters')
    .optional()
});

export const appointmentParamsSchema = z.object({
  id: z.string().uuid('Invalid appointment ID')
});

export const dateQuerySchema = z.object({
  date: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
});

export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>;
export type AppointmentParams = z.infer<typeof appointmentParamsSchema>;
export type DateQuery = z.infer<typeof dateQuerySchema>;
