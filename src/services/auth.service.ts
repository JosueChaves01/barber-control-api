import { UserRole, AuthProvider } from '@prisma/client';
import { hashPassword, verifyPassword } from '@utils/password';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '@utils/jwt';
import { ConflictError, UnauthorizedError, NotFoundError } from '@utils/errors';
import userRepository from '@repositories/user.repository';
import refreshTokenRepository from '@repositories/refreshToken.repository';
import prisma from '@config/database';
import { OAuth2Client } from 'google-auth-library';
import { googleConfig } from '@config/google';

export class AuthService {
  private googleClient = new OAuth2Client(googleConfig.clientId);

  private formatUserResponse(user: any) {
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      provider: user.provider,
      organizationId: user.organization?.id || user.barber?.organizationId,
      barberId: user.barber?.id,
      clientId: user.client?.id,
    };
  }

  async register(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
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
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
          provider: 'LOCAL',
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
      user: this.formatUserResponse(result.user ? { ...result.user, client: result.client } : { ...result, client: result.client }),
      accessToken,
      refreshToken,
    };
  }

  async login(email: string, password: string) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new UnauthorizedError('Credenciales inválidas');
    }

    // Check if user is using Google authentication
    if (user.provider === AuthProvider.GOOGLE) {
      throw new UnauthorizedError('Este usuario está registrado con Google. Por favor, usa el login con Google.');
    }

    // Check if user has a password
    if (!user.passwordHash) {
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
      user: this.formatUserResponse(user),
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
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        organizationId: (user as any).organization?.id,
      }
    };
  }

  async logout(refreshToken: string) {
    try {
      await refreshTokenRepository.deleteByToken(refreshToken);
    } catch (error) {
      // Token might not exist, which is fine
    }
  }

  async loginWithGoogle(idToken: string) {
    try {
      // Verify the ID token
      const ticket = await this.googleClient.verifyIdToken({
        idToken,
        audience: googleConfig.clientId,
      });

      const payload = ticket.getPayload();
      if (!payload) {
        throw new UnauthorizedError('Token de Google inválido');
      }

      const { sub: googleId, email, given_name: firstName, family_name: lastName } = payload;

      if (!email || !googleId) {
        throw new UnauthorizedError('Token de Google no contiene información suficiente');
      }

      // Check if user exists by googleId
      let user = await userRepository.findByGoogleId(googleId);

      // If not found by googleId, check by email
      if (!user) {
        user = await userRepository.findByEmail(email);

        // If user exists by email but doesn't have googleId, link the account
        if (user && !user.googleId) {
          user = await userRepository.update(user.id, {
            googleId,
            provider: AuthProvider.GOOGLE,
          });
        }
      }

      // If user still doesn't exist, create new user
      if (!user) {
        const result = await prisma.$transaction(async (tx) => {
          const newUser = await tx.user.create({
            data: {
              email,
              googleId,
              provider: AuthProvider.GOOGLE,
              role: UserRole.CLIENT,
              firstName: firstName || '',
              lastName: lastName || '',
              passwordHash: null,
            },
          });

          const client = await tx.client.create({
            data: {
              userId: newUser.id,
            },
          });

          return { user: newUser, client };
        });

        user = result.user;
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
          organizationId: (user as any).organization?.id,
        },
        accessToken,
        refreshToken,
      };
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        throw error;
      }
      throw new UnauthorizedError('Error al verificar token de Google');
    }
  }

  async getCurrentUser(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('Usuario no encontrado');
    }

    return this.formatUserResponse(user);
  }
}

export default new AuthService();

