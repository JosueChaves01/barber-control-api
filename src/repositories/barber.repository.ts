import prisma from '@config/database';
import { Barber, Prisma } from '@prisma/client';

export class BarberRepository {
  async findById(id: string): Promise<Barber | null> {
    return prisma.barber.findUnique({
      where: { id },
      include: {
        user: true,
        organization: true,
      },
    });
  }

  async findByUserId(userId: string): Promise<Barber | null> {
    return prisma.barber.findUnique({
      where: { userId },
      include: {
        user: true,
        organization: true,
      },
    });
  }

  async findByOrganizationId(organizationId: string) {
    return prisma.barber.findMany({
      where: { organizationId },
      include: {
        user: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(data: Prisma.BarberCreateInput): Promise<Barber> {
    return prisma.barber.create({
      data,
      include: {
        user: true,
        organization: true,
      },
    });
  }

  async update(id: string, data: Prisma.BarberUpdateInput): Promise<Barber> {
    return prisma.barber.update({
      where: { id },
      data,
      include: {
        user: true,
        organization: true,
      },
    });
  }
}

export default new BarberRepository();

