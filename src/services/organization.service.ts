import { UserRole } from '@prisma/client';
import { hashPassword } from '@utils/password';
import { ConflictError, NotFoundError, ForbiddenError } from '@utils/errors';
import organizationRepository from '@repositories/organization.repository';
import userRepository from '@repositories/user.repository';
import prisma from '@config/database';

export class OrganizationService {
  async createOrganization(data: {
    name: string;
    address?: string;
    phone?: string;
    email?: string;
    adminEmail: string;
    adminPassword: string;
    adminFirstName: string;
    adminLastName: string;
    adminPhone?: string;
  }) {
    // Check if admin email already exists
    const existingUser = await userRepository.findByEmail(data.adminEmail);
    if (existingUser) {
      throw new ConflictError('El email del admin ya está registrado');
    }

    // Hash admin password
    const passwordHash = await hashPassword(data.adminPassword);

    // Create organization and admin in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create admin user
      const admin = await tx.user.create({
        data: {
          email: data.adminEmail,
          passwordHash,
          role: UserRole.ADMIN,
          firstName: data.adminFirstName,
          lastName: data.adminLastName,
          phone: data.adminPhone,
        },
      });

      // Create organization
      const organization = await tx.organization.create({
        data: {
          name: data.name,
          address: data.address,
          phone: data.phone,
          email: data.email,
          adminId: admin.id,
        },
      });

      return { organization, admin };
    });

    return {
      organization: {
        id: result.organization.id,
        name: result.organization.name,
        address: result.organization.address,
        phone: result.organization.phone,
        email: result.organization.email,
        admin: {
          id: result.admin.id,
          email: result.admin.email,
          firstName: result.admin.firstName,
          lastName: result.admin.lastName,
        },
      },
    };
  }

  async createAdmin(data: {
    organizationId: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
  }) {
    // Check if organization exists
    const organization = await organizationRepository.findById(data.organizationId);
    if (!organization) {
      throw new NotFoundError('Organización no encontrada');
    }

    // Check if email already exists
    const existingUser = await userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new ConflictError('El email ya está registrado');
    }

    // Hash password
    const passwordHash = await hashPassword(data.password);

    // Create admin user
    const admin = await userRepository.create({
      email: data.email,
      passwordHash,
      role: UserRole.ADMIN,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
    });

    // Update organization admin (if needed, or create new organization)
    // For now, we'll just create the admin user
    // Note: This assumes one admin per organization. If you need multiple admins,
    // you might need to change the schema to support multiple admins.

    return {
      id: admin.id,
      email: admin.email,
      firstName: admin.firstName,
      lastName: admin.lastName,
      role: admin.role,
    };
  }

  async getOrganization(id: string, userId: string, userRole: UserRole) {
    const organization = await organizationRepository.findById(id);
    if (!organization) {
      throw new NotFoundError('Organización no encontrada');
    }

    // Check permissions
    if (userRole === UserRole.SUPERADMIN) {
      return organization;
    }

    if (userRole === UserRole.ADMIN && organization.adminId !== userId) {
      throw new ForbiddenError('No tienes acceso a esta organización');
    }

    return organization;
  }

  async updateOrganization(id: string, data: {
    name?: string;
    address?: string;
    phone?: string;
    email?: string;
  }, userId: string, userRole: UserRole) {
    const organization = await organizationRepository.findById(id);
    if (!organization) {
      throw new NotFoundError('Organización no encontrada');
    }

    // Check permissions
    if (userRole === UserRole.SUPERADMIN) {
      // SuperAdmin can update any organization
    } else if (userRole === UserRole.ADMIN && organization.adminId !== userId) {
      throw new ForbiddenError('No tienes permisos para actualizar esta organización');
    } else {
      throw new ForbiddenError('No tienes permisos para actualizar organizaciones');
    }

    const updated = await organizationRepository.update(id, data);
    return updated;
  }

  async getAllOrganizations() {
    return organizationRepository.findAll();
  }
}

export default new OrganizationService();

