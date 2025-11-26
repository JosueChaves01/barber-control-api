import { UserRole, AppointmentStatus, NotificationType, AuthProvider } from '@prisma/client';

export interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
}

import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        role: UserRole;
      };
    }
  }
}

export interface RequestWithUser extends Request {}

export { UserRole, AppointmentStatus, NotificationType, AuthProvider };

