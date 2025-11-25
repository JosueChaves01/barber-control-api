import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '@utils/jwt';
import { UnauthorizedError } from '@utils/errors';
import { RequestWithUser } from '@types';

export const authenticateToken = (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      throw new UnauthorizedError('Token de acceso requerido');
    }

    const decoded = verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof Error) {
      throw new UnauthorizedError(error.message);
    }
    throw new UnauthorizedError('Token inválido');
  }
};

