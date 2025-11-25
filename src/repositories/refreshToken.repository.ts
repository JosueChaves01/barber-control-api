import prisma from '@config/database';
import { RefreshToken, Prisma } from '@prisma/client';

export class RefreshTokenRepository {
  async findByToken(token: string): Promise<RefreshToken | null> {
    return prisma.refreshToken.findUnique({
      where: { token },
      include: {
        user: true,
      },
    });
  }

  async findByUserId(userId: string): Promise<RefreshToken[]> {
    return prisma.refreshToken.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(data: Prisma.RefreshTokenCreateInput): Promise<RefreshToken> {
    return prisma.refreshToken.create({
      data,
    });
  }

  async delete(id: string): Promise<RefreshToken> {
    return prisma.refreshToken.delete({
      where: { id },
    });
  }

  async deleteByToken(token: string): Promise<RefreshToken> {
    return prisma.refreshToken.delete({
      where: { token },
    });
  }

  async deleteExpiredTokens() {
    return prisma.refreshToken.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });
  }
}

export default new RefreshTokenRepository();

