import express from 'express';
import cors from 'cors';
import { logger } from './middleware/logger.js';
import { errorHandler } from './middleware/error-handler.js';
import appointmentsRouter from './routes/appointments.js';
import slotsRouter from './routes/slots.js';
import healthRouter from './routes/health.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(logger);

// Routes
app.use('/api/appointments', appointmentsRouter);
app.use('/api/slots', slotsRouter);
app.use('/api/health', healthRouter);

// Error handling
app.use(errorHandler);


export default app;
