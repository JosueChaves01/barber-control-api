import { Response, NextFunction } from 'express';
import googleService from '@services/google.service';
import { RequestWithUser } from '@types';

export class GoogleController {
  async getAuthUrl(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authUrl = googleService.getAuthUrl();
      res.json({
        success: true,
        data: { authUrl },
      });
    } catch (error) {
      next(error);
    }
  }

  async handleCallback(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { code } = req.query;
      if (!code || typeof code !== 'string') {
        res.status(400).json({
          success: false,
          error: { message: 'Código de autorización requerido' },
        });
        return;
      }

      const tokens = await googleService.getTokens(code);
      // In a real application, you would store these tokens securely
      // For now, we'll return them (not recommended for production)
      res.json({
        success: true,
        data: { tokens },
        message: 'Autorización exitosa. Guarda estos tokens de forma segura.',
      });
    } catch (error) {
      next(error);
    }
  }

  async syncAppointment(req: RequestWithUser, res: Response, next: NextFunction): Promise<void> {
    try {
      // In a real application, you would retrieve tokens from secure storage
      // For now, we'll expect them in the request body
      const { tokens } = req.body;
      const result = await googleService.syncAppointmentToCalendar(req.params.appointment_id, tokens);
      res.json({
        success: true,
        data: result,
        message: 'Cita sincronizada con Google Calendar',
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteEvent(req: RequestWithUser, res: Response, next: NextFunction): Promise<void> {
    try {
      // In a real application, you would retrieve tokens from secure storage
      const { tokens } = req.body;
      await googleService.deleteEventFromCalendar(req.params.appointment_id, tokens);
      res.json({
        success: true,
        message: 'Evento eliminado de Google Calendar',
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new GoogleController();

