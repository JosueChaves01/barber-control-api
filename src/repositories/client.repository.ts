import prisma from '@config/database';
import { Client, Prisma } from '@prisma/client';

export class ClientRepository {
  async findById(id: string): Promise<Client | null> {
    return prisma.client.findUnique({
      where: { id },
      include: {
        user: true,
      },
    });
  }

  async findByUserId(userId: string): Promise<Client | null> {
    return prisma.client.findUnique({
      where: { userId },
      include: {
        user: true,
      },
    });
  }

  async create(data: Prisma.ClientCreateInput): Promise<Client> {
    return prisma.client.create({
      data,
      include: {
        user: true,
      },
    });
  }

  async update(id: string, data: Prisma.ClientUpdateInput): Promise<Client> {
    return prisma.client.update({
      where: { id },
      data,
      include: {
        user: true,
      },
    });
  }
}

export default new ClientRepository();

