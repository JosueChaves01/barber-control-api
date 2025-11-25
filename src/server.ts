// Load environment variables first
import dotenv from 'dotenv';
dotenv.config();

// Register path aliases
import 'tsconfig-paths/register';

// Now import modules that use path aliases
import app from './app';
import logger from '@utils/logger';
import prisma from '@config/database';

const PORT = process.env.PORT || 3000;

// Graceful shutdown
const shutdown = async () => {
  logger.info('Cerrando servidor...');
  await prisma.$disconnect();
  process.exit(0);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Start server
const server = app.listen(PORT, () => {
  logger.info(`Servidor corriendo en puerto ${PORT}`);
  logger.info(`Ambiente: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`Documentación disponible en http://localhost:${PORT}/api-docs`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  logger.error('Unhandled Promise Rejection:', err);
  server.close(() => {
    process.exit(1);
  });
});

export default server;

