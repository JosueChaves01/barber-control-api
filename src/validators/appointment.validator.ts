import { z } from 'zod';

export const createAppointmentSchema = z.object({
  body: z.object({
    barberId: z.string().uuid('ID de barbero inválido'),
    clientId: z.string().uuid('ID de cliente inválido'),
    appointmentDate: z.string().datetime('Fecha inválida'),
    duration: z.number().int().min(15, 'La duración mínima es 15 minutos').max(480, 'La duración máxima es 8 horas'),
    notes: z.string().optional(),
  }),
});

export const updateAppointmentSchema = z.object({
  params: z.object({
    id: z.string().uuid('ID de cita inválido'),
  }),
  body: z.object({
    appointmentDate: z.string().datetime('Fecha inválida').optional(),
    duration: z.number().int().min(15).max(480).optional(),
    status: z.enum(['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED']).optional(),
    notes: z.string().optional(),
  }),
});

export const getAppointmentsSchema = z.object({
  query: z.object({
    organizationId: z.string().uuid('ID de organización inválido').optional(),
    barberId: z.string().uuid('ID de barbero inválido').optional(),
    clientId: z.string().uuid('ID de cliente inválido').optional(),
    status: z.enum(['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED']).optional(),
    page: z.string().optional(),
    limit: z.string().optional(),
  }),
});

