import prisma from '@config/database';
import { Organization, Prisma } from '@prisma/client';

export class OrganizationRepository {
  async findById(id: string): Promise<Organization | null> {
    return prisma.organization.findUnique({
      where: { id },
      include: {
        admin: true,
        barbers: {
          include: {
            user: true,
          },
        },
      },
    });
  }

  async findByAdminId(adminId: string): Promise<Organization | null> {
    return prisma.organization.findUnique({
      where: { adminId },
    });
  }

  async create(data: Prisma.OrganizationCreateInput): Promise<Organization> {
    return prisma.organization.create({
      data,
      include: {
        admin: true,
      },
    });
  }

  async update(id: string, data: Prisma.OrganizationUpdateInput): Promise<Organization> {
    return prisma.organization.update({
      where: { id },
      data,
    });
  }

  async findAll(skip?: number, take?: number) {
    return prisma.organization.findMany({
      skip,
      take,
      include: {
        admin: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}

export default new OrganizationRepository();

