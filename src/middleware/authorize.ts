import { Response, NextFunction } from 'express';
import { ForbiddenError } from '@utils/errors';
import { RequestWithUser, UserRole } from '@types';

export const authorizeRoles = (...roles: UserRole[]) => {
  return (req: RequestWithUser, res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new ForbiddenError('Usuario no autenticado');
    }

    if (!roles.includes(req.user.role)) {
      throw new ForbiddenError('No tienes permisos para realizar esta acción');
    }

    next();
  };
};

export const authorizeOrganization = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
): Promise<void> => {
  // This will be implemented in specific routes that need organization validation
  // For now, it's a placeholder
  next();
};

