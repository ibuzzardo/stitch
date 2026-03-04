import express from 'express';
import cors from 'cors';
import { logger } from './middleware/logger.js';
import { errorHandler } from './middleware/error-handler.js';
import appointmentsRouter from './routes/appointments.js';
import slotsRouter from './routes/slots.js';
import healthRouter from './routes/health.js';

const app = express();
const PORT = process.env.PORT || 3001;

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

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
