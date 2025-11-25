import prisma from '@config/database';
import { Appointment, AppointmentStatus, Prisma } from '@prisma/client';

export class AppointmentRepository {
  async findById(id: string): Promise<Appointment | null> {
    return prisma.appointment.findUnique({
      where: { id },
      include: {
        barber: {
          include: {
            user: true,
          },
        },
        client: {
          include: {
            user: true,
          },
        },
        organization: true,
      },
    });
  }

  async findByBarberId(barberId: string, startDate?: Date, endDate?: Date) {
    const where: Prisma.AppointmentWhereInput = {
      barberId,
    };

    if (startDate || endDate) {
      where.appointmentDate = {};
      if (startDate) {
        where.appointmentDate.gte = startDate;
      }
      if (endDate) {
        where.appointmentDate.lte = endDate;
      }
    }

    return prisma.appointment.findMany({
      where,
      include: {
        barber: {
          include: {
            user: true,
          },
        },
        client: {
          include: {
            user: true,
          },
        },
        organization: true,
      },
      orderBy: { appointmentDate: 'asc' },
    });
  }

  async findByClientId(clientId: string) {
    return prisma.appointment.findMany({
      where: { clientId },
      include: {
        barber: {
          include: {
            user: true,
          },
        },
        organization: true,
      },
      orderBy: { appointmentDate: 'desc' },
    });
  }

  async findByOrganizationId(organizationId: string) {
    return prisma.appointment.findMany({
      where: { organizationId },
      include: {
        barber: {
          include: {
            user: true,
          },
        },
        client: {
          include: {
            user: true,
          },
        },
      },
      orderBy: { appointmentDate: 'desc' },
    });
  }

  async findConflictingAppointments(
    barberId: string,
    appointmentDate: Date,
    duration: number
  ): Promise<Appointment[]> {
    const startTime = appointmentDate;
    const endTime = new Date(appointmentDate.getTime() + duration * 60000);

    return prisma.appointment.findMany({
      where: {
        barberId,
        status: {
          not: 'CANCELLED',
        },
        appointmentDate: {
          gte: startTime,
          lt: endTime,
        },
      },
    });
  }

  async create(data: Prisma.AppointmentCreateInput): Promise<Appointment> {
    return prisma.appointment.create({
      data,
      include: {
        barber: {
          include: {
            user: true,
          },
        },
        client: {
          include: {
            user: true,
          },
        },
        organization: true,
      },
    });
  }

  async update(id: string, data: Prisma.AppointmentUpdateInput): Promise<Appointment> {
    return prisma.appointment.update({
      where: { id },
      data,
      include: {
        barber: {
          include: {
            user: true,
          },
        },
        client: {
          include: {
            user: true,
          },
        },
        organization: true,
      },
    });
  }

  async delete(id: string): Promise<Appointment> {
    return prisma.appointment.delete({
      where: { id },
    });
  }
}

export default new AppointmentRepository();

