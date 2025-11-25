import prisma from '@config/database';
import { Notification, Prisma } from '@prisma/client';

export class NotificationRepository {
  async findById(id: string): Promise<Notification | null> {
    return prisma.notification.findUnique({
      where: { id },
    });
  }

  async findByUserId(userId: string, read?: boolean) {
    const where: Prisma.NotificationWhereInput = { userId };
    if (read !== undefined) {
      where.read = read;
    }

    return prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(data: Prisma.NotificationCreateInput): Promise<Notification> {
    return prisma.notification.create({
      data,
    });
  }

  async markAsRead(id: string): Promise<Notification> {
    return prisma.notification.update({
      where: { id },
      data: { read: true },
    });
  }

  async markAllAsRead(userId: string) {
    return prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
  }
}

export default new NotificationRepository();

