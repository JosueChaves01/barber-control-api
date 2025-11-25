import { Response, NextFunction } from 'express';
import barberService from '@services/barber.service';
import { RequestWithUser } from '@types';

export class BarbersController {
  async createBarber(req: RequestWithUser, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: { message: 'Usuario no autenticado' },
        });
        return;
      }

      const result = await barberService.createBarber(
        req.params.id,
        req.body,
        req.user.userId,
        req.user.role
      );
      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getBarbersByOrganization(req: RequestWithUser, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: { message: 'Usuario no autenticado' },
        });
        return;
      }

      const barbers = await barberService.getBarbersByOrganization(
        req.params.id,
        req.user.userId,
        req.user.role
      );
      res.json({
        success: true,
        data: barbers,
      });
    } catch (error) {
      next(error);
    }
  }

  async getBarber(req: RequestWithUser, res: Response, next: NextFunction): Promise<void> {
    try {
      const barber = await barberService.getBarber(req.params.id);
      res.json({
        success: true,
        data: barber,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateBarber(req: RequestWithUser, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: { message: 'Usuario no autenticado' },
        });
        return;
      }

      const barber = await barberService.updateBarber(
        req.params.id,
        req.body,
        req.user.userId,
        req.user.role
      );
      res.json({
        success: true,
        data: barber,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new BarbersController();

