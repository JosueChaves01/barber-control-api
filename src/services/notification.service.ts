import { NotificationType } from '@prisma/client';
import notificationRepository from '@repositories/notification.repository';
import appointmentRepository from '@repositories/appointment.repository';

export class NotificationService {
  async createNotification(data: {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    metadata?: any;
  }) {
    return notificationRepository.create({
      user: { connect: { id: data.userId } },
      type: data.type,
      title: data.title,
      message: data.message,
      metadata: data.metadata || {},
    });
  }

  async createAppointmentNotification(appointmentId: string, type: NotificationType) {
    const appointment = await appointmentRepository.findById(appointmentId);
    if (!appointment) {
      return;
    }

    const notifications = [];

    // Notification for barber
    if (type === 'APPOINTMENT_CREATED') {
      notifications.push(
        notificationRepository.create({
          user: { connect: { id: appointment.barber.userId } },
          type: NotificationType.APPOINTMENT_CREATED,
          title: 'Nueva cita creada',
          message: `Tienes una nueva cita el ${new Date(appointment.appointmentDate).toLocaleDateString()}`,
          metadata: { appointmentId },
        })
      );

      // Notification for client
      notifications.push(
        notificationRepository.create({
          user: { connect: { id: appointment.client.userId } },
          type: NotificationType.APPOINTMENT_CREATED,
          title: 'Cita creada',
          message: `Tu cita ha sido creada para el ${new Date(appointment.appointmentDate).toLocaleDateString()}`,
          metadata: { appointmentId },
        })
      );
    } else if (type === 'APPOINTMENT_CONFIRMED') {
      notifications.push(
        notificationRepository.create({
          user: { connect: { id: appointment.client.userId } },
          type: NotificationType.APPOINTMENT_CONFIRMED,
          title: 'Cita confirmada',
          message: `Tu cita ha sido confirmada para el ${new Date(appointment.appointmentDate).toLocaleDateString()}`,
          metadata: { appointmentId },
        })
      );
    } else if (type === 'APPOINTMENT_CANCELLED') {
      notifications.push(
        notificationRepository.create({
          user: { connect: { id: appointment.barber.userId } },
          type: NotificationType.APPOINTMENT_CANCELLED,
          title: 'Cita cancelada',
          message: `Una cita ha sido cancelada`,
          metadata: { appointmentId },
        })
      );

      notifications.push(
        notificationRepository.create({
          user: { connect: { id: appointment.client.userId } },
          type: NotificationType.APPOINTMENT_CANCELLED,
          title: 'Cita cancelada',
          message: `Tu cita ha sido cancelada`,
          metadata: { appointmentId },
        })
      );
    }

    await Promise.all(notifications);
  }

  async getNotifications(userId: string, read?: boolean) {
    return notificationRepository.findByUserId(userId, read);
  }

  async markAsRead(id: string, userId: string) {
    const notification = await notificationRepository.findById(id);
    if (!notification) {
      throw new Error('Notificación no encontrada');
    }

    if (notification.userId !== userId) {
      throw new Error('No tienes acceso a esta notificación');
    }

    return notificationRepository.markAsRead(id);
  }
}

export default new NotificationService();

