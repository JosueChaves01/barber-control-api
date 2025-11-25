import { UserRole } from '@prisma/client';
import { hashPassword, verifyPassword } from '@utils/password';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '@utils/jwt';
import { ConflictError, UnauthorizedError, NotFoundError } from '@utils/errors';
import userRepository from '@repositories/user.repository';
import refreshTokenRepository from '@repositories/refreshToken.repository';
import prisma from '@config/database';

export class AuthService {
  async register(data: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    phone?: string;
  }) {
    // Check if user already exists
    const existingUser = await userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new ConflictError('El email ya está registrado');
    }

    // Hash password
    const passwordHash = await hashPassword(data.password);

    // Create user and client in transaction
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: data.email,
          passwordHash,
          role: UserRole.CLIENT,
          firstName: data.first_name,
          lastName: data.last_name,
          phone: data.phone,
        },
      });

      const client = await tx.client.create({
        data: {
          userId: user.id,
        },
      });

      return { user, client };
    });

    // Generate tokens
    const accessToken = generateAccessToken({
      userId: result.user.id,
      email: result.user.email,
      role: result.user.role,
    });

    const refreshToken = generateRefreshToken({
      userId: result.user.id,
      email: result.user.email,
      role: result.user.role,
    });

    // Save refresh token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await refreshTokenRepository.create({
      user: { connect: { id: result.user.id } },
      token: refreshToken,
      expiresAt,
    });

    return {
      user: {
        id: result.user.id,
        email: result.user.email,
        role: result.user.role,
        firstName: result.user.firstName,
        lastName: result.user.lastName,
        phone: result.user.phone,
      },
      accessToken,
      refreshToken,
    };
  }

  async login(email: string, password: string) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new UnauthorizedError('Credenciales inválidas');
    }

    const isValidPassword = await verifyPassword(password, user.passwordHash);
    if (!isValidPassword) {
      throw new UnauthorizedError('Credenciales inválidas');
    }

    // Generate tokens
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const refreshToken = generateRefreshToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Save refresh token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await refreshTokenRepository.create({
      user: { connect: { id: user.id } },
      token: refreshToken,
      expiresAt,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
      },
      accessToken,
      refreshToken,
    };
  }

  async refreshToken(refreshToken: string) {
    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);

    // Check if token exists in database
    const tokenRecord = await refreshTokenRepository.findByToken(refreshToken);
    if (!tokenRecord) {
      throw new UnauthorizedError('Refresh token inválido');
    }

    // Check if token is expired
    if (tokenRecord.expiresAt < new Date()) {
      await refreshTokenRepository.deleteByToken(refreshToken);
      throw new UnauthorizedError('Refresh token expirado');
    }

    // Get user
    const user = await userRepository.findById(decoded.userId);
    if (!user) {
      throw new NotFoundError('Usuario no encontrado');
    }

    // Generate new access token
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Optionally rotate refresh token
    const newRefreshToken = generateRefreshToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Delete old token and create new one
    await prisma.$transaction(async (tx) => {
      await tx.refreshToken.delete({
        where: { id: tokenRecord.id },
      });

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      await tx.refreshToken.create({
        data: {
          userId: user.id,
          token: newRefreshToken,
          expiresAt,
        },
      });
    });

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  }

  async logout(refreshToken: string) {
    try {
      await refreshTokenRepository.deleteByToken(refreshToken);
    } catch (error) {
      // Token might not exist, which is fine
    }
  }

  async getCurrentUser(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('Usuario no encontrado');
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
    };
  }
}

export default new AuthService();

