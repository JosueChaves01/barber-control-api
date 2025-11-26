import prisma from '@config/database';
import { User, UserRole, Prisma } from '@prisma/client';

export class UserRepository {
  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  async findByGoogleId(googleId: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { googleId },
    });
  }

  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
      include: {
        barber: true,
        client: true,
      },
    });
  }

  async create(data: Prisma.UserCreateInput): Promise<User> {
    return prisma.user.create({
      data,
    });
  }

  async update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    return prisma.user.update({
      where: { id },
      data,
    });
  }

  async findAll(filters?: { role?: UserRole }, skip?: number, take?: number) {
    const where: Prisma.UserWhereInput = {};
    if (filters?.role) {
      where.role = filters.role;
    }

    return prisma.user.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    });
  }

  async count(filters?: { role?: UserRole }): Promise<number> {
    const where: Prisma.UserWhereInput = {};
    if (filters?.role) {
      where.role = filters.role;
    }

    return prisma.user.count({ where });
  }
}

export default new UserRepository();

