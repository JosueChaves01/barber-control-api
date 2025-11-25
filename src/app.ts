import express, { Application } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from '@config/swagger';
import { errorHandler } from '@middleware/errorHandler';
import logger from '@utils/logger';

// Routes
import authRoutes from '@routes/auth.routes';
import superadminRoutes from '@routes/superadmin.routes';
import organizationsRoutes from '@routes/organizations.routes';
import barbersRoutes from '@routes/barbers.routes';
import clientsRoutes from '@routes/clients.routes';
import appointmentsRoutes from '@routes/appointments.routes';
import barberAppointmentsRoutes from '@routes/barber-appointments.routes';
import clientAppointmentsRoutes from '@routes/client-appointments.routes';
import notificationsRoutes from '@routes/notifications.routes';
import googleRoutes from '@routes/google.routes';

const app: Application = express();

// Security middleware
app.use(helmet());

// CORS
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3001',
    credentials: true,
  })
);

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));
}

// Rate limiting temporarily disabled for development

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/superadmin', superadminRoutes);
app.use('/api/organizations', organizationsRoutes);
app.use('/api/barbers', barbersRoutes);
app.use('/api/barbers', barberAppointmentsRoutes);
app.use('/api/clients', clientsRoutes);
app.use('/api/clients', clientAppointmentsRoutes);
app.use('/api/appointments', appointmentsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/google', googleRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      message: 'Ruta no encontrada',
      statusCode: 404,
    },
  });
});

// Error handler (must be last)
app.use(errorHandler);

export default app;

