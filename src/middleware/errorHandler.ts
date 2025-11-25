import { Request, Response, NextFunction } from 'express';
import { AppError } from '@utils/errors';
import logger from '@utils/logger';

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (err instanceof AppError) {
    logger.error(`Error ${err.statusCode}: ${err.message}`);
    res.status(err.statusCode).json({
      success: false,
      error: {
        message: err.message,
        statusCode: err.statusCode,
      },
    });
    return;
  }

  // Error no manejado
  logger.error(`Error no manejado: ${err.message}`, err);
  res.status(500).json({
    success: false,
    error: {
      message: 'Error interno del servidor',
      statusCode: 500,
    },
  });
};

