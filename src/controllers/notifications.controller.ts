import { Response, NextFunction } from 'express';
import notificationService from '@services/notification.service';
import { RequestWithUser } from '@types';

export class NotificationsController {
  async getNotifications(req: RequestWithUser, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: { message: 'Usuario no autenticado' },
        });
        return;
      }

      const read = req.query.read === 'true' ? true : req.query.read === 'false' ? false : undefined;
      const notifications = await notificationService.getNotifications(req.user.userId, read);
      res.json({
        success: true,
        data: notifications,
      });
    } catch (error) {
      next(error);
    }
  }

  async markAsRead(req: RequestWithUser, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: { message: 'Usuario no autenticado' },
        });
        return;
      }

      const notification = await notificationService.markAsRead(req.params.id, req.user.userId);
      res.json({
        success: true,
        data: notification,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new NotificationsController();

