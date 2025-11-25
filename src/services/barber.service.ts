import { UserRole } from '@prisma/client';
import { hashPassword } from '@utils/password';
import { ConflictError, NotFoundError, ForbiddenError } from '@utils/errors';
import barberRepository from '@repositories/barber.repository';
import organizationRepository from '@repositories/organization.repository';
import userRepository from '@repositories/user.repository';
import prisma from '@config/database';

export class BarberService {
  async createBarber(
    organizationId: string,
    data: {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
      phone?: string;
      specialties?: string[];
      schedule?: any;
    },
    userId: string,
    userRole: UserRole
  ) {
    // Check if organization exists
    const organization = await organizationRepository.findById(organizationId);
    if (!organization) {
      throw new NotFoundError('Organización no encontrada');
    }

    // Check permissions
    if (userRole === UserRole.SUPERADMIN) {
      // SuperAdmin can create barbers in any organization
    } else if (userRole === UserRole.ADMIN && organization.adminId !== userId) {
      throw new ForbiddenError('No tienes permisos para crear barberos en esta organización');
    } else {
      throw new ForbiddenError('No tienes permisos para crear barberos');
    }

    // Check if email already exists
    const existingUser = await userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new ConflictError('El email ya está registrado');
    }

    // Hash password
    const passwordHash = await hashPassword(data.password);

    // Create user and barber in transaction
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: data.email,
          passwordHash,
          role: UserRole.BARBER,
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
        },
      });

      const barber = await tx.barber.create({
        data: {
          userId: user.id,
          organizationId,
          specialties: data.specialties || [],
          schedule: data.schedule || {},
        },
      });

      return { user, barber };
    });

    return {
      id: result.barber.id,
      user: {
        id: result.user.id,
        email: result.user.email,
        firstName: result.user.firstName,
        lastName: result.user.lastName,
        phone: result.user.phone,
      },
      specialties: result.barber.specialties,
      schedule: result.barber.schedule,
    };
  }

  async getBarber(id: string) {
    const barber = await barberRepository.findById(id);
    if (!barber) {
      throw new NotFoundError('Barbero no encontrado');
    }
    return barber;
  }

  async getBarbersByOrganization(organizationId: string, userId: string, userRole: UserRole) {
    // Check if organization exists
    const organization = await organizationRepository.findById(organizationId);
    if (!organization) {
      throw new NotFoundError('Organización no encontrada');
    }

    // Check permissions
    if (userRole === UserRole.SUPERADMIN) {
      // SuperAdmin can view barbers in any organization
    } else if (userRole === UserRole.ADMIN && organization.adminId !== userId) {
      throw new ForbiddenError('No tienes acceso a esta organización');
    } else if (userRole === UserRole.BARBER) {
      // Barber can view other barbers in their organization
      const barber = await barberRepository.findByUserId(userId);
      if (!barber || barber.organizationId !== organizationId) {
        throw new ForbiddenError('No tienes acceso a esta organización');
      }
    } else {
      throw new ForbiddenError('No tienes permisos para ver barberos');
    }

    return barberRepository.findByOrganizationId(organizationId);
  }

  async updateBarber(
    id: string,
    data: {
      specialties?: string[];
      schedule?: any;
    },
    userId: string,
    userRole: UserRole
  ) {
    const barber = await barberRepository.findById(id);
    if (!barber) {
      throw new NotFoundError('Barbero no encontrado');
    }

    // Check permissions
    if (userRole === UserRole.SUPERADMIN) {
      // SuperAdmin can update any barber
    } else if (userRole === UserRole.ADMIN) {
      const organization = await organizationRepository.findById(barber.organizationId);
      if (!organization || organization.adminId !== userId) {
        throw new ForbiddenError('No tienes permisos para actualizar este barbero');
      }
    } else if (userRole === UserRole.BARBER && barber.userId !== userId) {
      throw new ForbiddenError('Solo puedes actualizar tu propio perfil');
    } else {
      throw new ForbiddenError('No tienes permisos para actualizar barberos');
    }

    const updated = await barberRepository.update(id, {
      specialties: data.specialties,
      schedule: data.schedule,
    });

    return updated;
  }
}

export default new BarberService();

