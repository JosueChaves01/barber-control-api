import { AppointmentStatus } from '@prisma/client';
import { NotFoundError, ForbiddenError, ConflictError } from '@utils/errors';
import appointmentRepository from '@repositories/appointment.repository';
import barberRepository from '@repositories/barber.repository';
import clientRepository from '@repositories/client.repository';
import organizationRepository from '@repositories/organization.repository';
import notificationService from '@services/notification.service';
import { UserRole } from '@types';

export class AppointmentService {
  async createAppointment(data: {
    barberId: string;
    clientId: string;
    appointmentDate: Date;
    duration: number;
    notes?: string;
  }, userId: string, userRole: UserRole) {
    // Validate barber exists
    const barber = await barberRepository.findById(data.barberId);
    if (!barber) {
      throw new NotFoundError('Barbero no encontrado');
    }

    // Validate client exists
    const client = await clientRepository.findById(data.clientId);
    if (!client) {
      throw new NotFoundError('Cliente no encontrado');
    }

    // Check permissions
    if (userRole === UserRole.CLIENT && client.userId !== userId) {
      throw new ForbiddenError('Solo puedes crear citas para ti mismo');
    }

    // Validate appointment date is in the future
    if (data.appointmentDate < new Date()) {
      throw new ConflictError('La fecha de la cita debe ser en el futuro');
    }

    // Check for conflicting appointments
    const conflicts = await appointmentRepository.findConflictingAppointments(
      data.barberId,
      data.appointmentDate,
      data.duration
    );

    if (conflicts.length > 0) {
      throw new ConflictError('El barbero ya tiene una cita en ese horario');
    }

    // Validate barber schedule (optional - can be enhanced)
    // For now, we'll just check conflicts

    // Create appointment
    const appointment = await appointmentRepository.create({
      barber: { connect: { id: data.barberId } },
      client: { connect: { id: data.clientId } },
      organization: { connect: { id: barber.organizationId } },
      appointmentDate: data.appointmentDate,
      duration: data.duration,
      status: AppointmentStatus.PENDING,
      notes: data.notes,
    });

    // Create notifications
    await notificationService.createAppointmentNotification(
      appointment.id,
      'APPOINTMENT_CREATED'
    );

    return appointment;
  }

  async getAppointment(id: string, userId: string, userRole: UserRole) {
    const appointment = await appointmentRepository.findById(id);
    if (!appointment) {
      throw new NotFoundError('Cita no encontrada');
    }

    // Check permissions
    if (userRole === UserRole.SUPERADMIN) {
      return appointment;
    }

    if (userRole === UserRole.ADMIN) {
      const organization = await organizationRepository.findById(appointment.organizationId);
      if (organization && organization.adminId !== userId) {
        throw new ForbiddenError('No tienes acceso a esta cita');
      }
      return appointment;
    }

    if (userRole === UserRole.BARBER) {
      const barber = await barberRepository.findByUserId(userId);
      if (!barber || barber.id !== appointment.barberId) {
        throw new ForbiddenError('No tienes acceso a esta cita');
      }
      return appointment;
    }

    if (userRole === UserRole.CLIENT) {
      const client = await clientRepository.findByUserId(userId);
      if (!client || client.id !== appointment.clientId) {
        throw new ForbiddenError('No tienes acceso a esta cita');
      }
      return appointment;
    }

    throw new ForbiddenError('No tienes acceso a esta cita');
  }

  async getAppointments(filters: {
    organizationId?: string;
    barberId?: string;
    clientId?: string;
    status?: AppointmentStatus;
  }, userId: string, userRole: UserRole) {
    // Apply filters based on role
    if (userRole === UserRole.CLIENT) {
      const client = await clientRepository.findByUserId(userId);
      if (!client) {
        throw new NotFoundError('Cliente no encontrado');
      }
      filters.clientId = client.id;
    } else if (userRole === UserRole.BARBER) {
      const barber = await barberRepository.findByUserId(userId);
      if (!barber) {
        throw new NotFoundError('Barbero no encontrado');
      }
      filters.barberId = barber.id;
    } else if (userRole === UserRole.ADMIN) {
      const organization = await organizationRepository.findByAdminId(userId);
      if (organization) {
        filters.organizationId = organization.id;
      }
    }

    if (filters.barberId) {
      return appointmentRepository.findByBarberId(filters.barberId);
    }

    if (filters.clientId) {
      return appointmentRepository.findByClientId(filters.clientId);
    }

    if (filters.organizationId) {
      return appointmentRepository.findByOrganizationId(filters.organizationId);
    }

    // If no specific filter, return empty or all (for superadmin)
    if (userRole === UserRole.SUPERADMIN) {
      return appointmentRepository.findByOrganizationId(filters.organizationId || '');
    }

    return [];
  }

  async updateAppointment(
    id: string,
    data: {
      appointmentDate?: Date;
      duration?: number;
      status?: AppointmentStatus;
      notes?: string;
    },
    userId: string,
    userRole: UserRole
  ) {
    const appointment = await appointmentRepository.findById(id);
    if (!appointment) {
      throw new NotFoundError('Cita no encontrada');
    }

    // Check permissions
    if (userRole === UserRole.SUPERADMIN) {
      // SuperAdmin can update any appointment
    } else if (userRole === UserRole.ADMIN) {
      const organization = await organizationRepository.findById(appointment.organizationId);
      if (!organization || organization.adminId !== userId) {
        throw new ForbiddenError('No tienes permisos para actualizar esta cita');
      }
    } else if (userRole === UserRole.BARBER) {
      const barber = await barberRepository.findByUserId(userId);
      if (!barber || barber.id !== appointment.barberId) {
        throw new ForbiddenError('Solo puedes actualizar tus propias citas');
      }
    } else if (userRole === UserRole.CLIENT) {
      const client = await clientRepository.findByUserId(userId);
      if (!client || client.id !== appointment.clientId) {
        throw new ForbiddenError('Solo puedes actualizar tus propias citas');
      }
    } else {
      throw new ForbiddenError('No tienes permisos para actualizar esta cita');
    }

    // If changing date/time, check for conflicts
    if (data.appointmentDate) {
      const duration = data.duration || appointment.duration;
      const conflicts = await appointmentRepository.findConflictingAppointments(
        appointment.barberId,
        data.appointmentDate,
        duration
      );

      // Exclude current appointment from conflicts
      const otherConflicts = conflicts.filter((c) => c.id !== id);
      if (otherConflicts.length > 0) {
        throw new ConflictError('El barbero ya tiene una cita en ese horario');
      }
    }

    const updated = await appointmentRepository.update(id, data);

    // Create notifications for status changes
    if (data.status) {
      if (data.status === AppointmentStatus.CONFIRMED) {
        await notificationService.createAppointmentNotification(id, 'APPOINTMENT_CONFIRMED');
      } else if (data.status === AppointmentStatus.CANCELLED) {
        await notificationService.createAppointmentNotification(id, 'APPOINTMENT_CANCELLED');
      }
    }

    return updated;
  }

  async deleteAppointment(id: string, userId: string, userRole: UserRole) {
    const appointment = await appointmentRepository.findById(id);
    if (!appointment) {
      throw new NotFoundError('Cita no encontrada');
    }

    // Check permissions
    if (userRole === UserRole.SUPERADMIN) {
      // SuperAdmin can delete any appointment
    } else if (userRole === UserRole.ADMIN) {
      const organization = await organizationRepository.findById(appointment.organizationId);
      if (!organization || organization.adminId !== userId) {
        throw new ForbiddenError('No tienes permisos para eliminar esta cita');
      }
    } else if (userRole === UserRole.BARBER) {
      const barber = await barberRepository.findByUserId(userId);
      if (!barber || barber.id !== appointment.barberId) {
        throw new ForbiddenError('Solo puedes eliminar tus propias citas');
      }
    } else if (userRole === UserRole.CLIENT) {
      const client = await clientRepository.findByUserId(userId);
      if (!client || client.id !== appointment.clientId) {
        throw new ForbiddenError('Solo puedes eliminar tus propias citas');
      }
    } else {
      throw new ForbiddenError('No tienes permisos para eliminar esta cita');
    }

    await appointmentRepository.delete(id);
  }
}

export default new AppointmentService();

