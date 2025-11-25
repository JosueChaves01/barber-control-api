import { Response, NextFunction } from 'express';
import clientRepository from '@repositories/client.repository';
import { NotFoundError, ForbiddenError } from '@utils/errors';
import { RequestWithUser } from '@types';

export class ClientsController {
  async getClient(req: RequestWithUser, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: { message: 'Usuario no autenticado' },
        });
        return;
      }

      const client = await clientRepository.findById(req.params.id);
      if (!client) {
        throw new NotFoundError('Cliente no encontrado');
      }

      // Check permissions
      if (req.user.role !== 'SUPERADMIN' && client.userId !== req.user.userId) {
        throw new ForbiddenError('No tienes acceso a este cliente');
      }

      res.json({
        success: true,
        data: client,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateClient(req: RequestWithUser, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: { message: 'Usuario no autenticado' },
        });
        return;
      }

      const client = await clientRepository.findById(req.params.id);
      if (!client) {
        throw new NotFoundError('Cliente no encontrado');
      }

      // Check permissions
      if (req.user.role !== 'SUPERADMIN' && client.userId !== req.user.userId) {
        throw new ForbiddenError('No tienes permisos para actualizar este cliente');
      }

      const updated = await clientRepository.update(req.params.id, {
        preferences: req.body.preferences,
      });

      res.json({
        success: true,
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new ClientsController();

