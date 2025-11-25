import { Response, NextFunction } from 'express';
import appointmentService from '@services/appointment.service';
import { RequestWithUser } from '@types';

export class AppointmentsController {
  async createAppointment(req: RequestWithUser, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: { message: 'Usuario no autenticado' },
        });
        return;
      }

      const appointment = await appointmentService.createAppointment(
        {
          ...req.body,
          appointmentDate: new Date(req.body.appointmentDate),
        },
        req.user.userId,
        req.user.role
      );
      res.status(201).json({
        success: true,
        data: appointment,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAppointments(req: RequestWithUser, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: { message: 'Usuario no autenticado' },
        });
        return;
      }

      const appointments = await appointmentService.getAppointments(
        {
          organizationId: req.query.organizationId as string,
          barberId: req.query.barberId as string,
          clientId: req.query.clientId as string,
          status: req.query.status as any,
        },
        req.user.userId,
        req.user.role
      );
      res.json({
        success: true,
        data: appointments,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAppointment(req: RequestWithUser, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: { message: 'Usuario no autenticado' },
        });
        return;
      }

      const appointment = await appointmentService.getAppointment(
        req.params.id,
        req.user.userId,
        req.user.role
      );
      res.json({
        success: true,
        data: appointment,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateAppointment(req: RequestWithUser, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: { message: 'Usuario no autenticado' },
        });
        return;
      }

      const updateData: any = { ...req.body };
      if (req.body.appointmentDate) {
        updateData.appointmentDate = new Date(req.body.appointmentDate);
      }

      const appointment = await appointmentService.updateAppointment(
        req.params.id,
        updateData,
        req.user.userId,
        req.user.role
      );
      res.json({
        success: true,
        data: appointment,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteAppointment(req: RequestWithUser, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: { message: 'Usuario no autenticado' },
        });
        return;
      }

      await appointmentService.deleteAppointment(req.params.id, req.user.userId, req.user.role);
      res.json({
        success: true,
        message: 'Cita eliminada exitosamente',
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new AppointmentsController();

