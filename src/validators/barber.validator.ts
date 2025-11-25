import { z } from 'zod';

const scheduleSchema = z.object({
  monday: z
    .object({
      start: z.string(),
      end: z.string(),
      available: z.boolean(),
    })
    .optional(),
  tuesday: z
    .object({
      start: z.string(),
      end: z.string(),
      available: z.boolean(),
    })
    .optional(),
  wednesday: z
    .object({
      start: z.string(),
      end: z.string(),
      available: z.boolean(),
    })
    .optional(),
  thursday: z
    .object({
      start: z.string(),
      end: z.string(),
      available: z.boolean(),
    })
    .optional(),
  friday: z
    .object({
      start: z.string(),
      end: z.string(),
      available: z.boolean(),
    })
    .optional(),
  saturday: z
    .object({
      start: z.string(),
      end: z.string(),
      available: z.boolean(),
    })
    .optional(),
  sunday: z
    .object({
      start: z.string(),
      end: z.string(),
      available: z.boolean(),
    })
    .optional(),
});

export const createBarberSchema = z.object({
  params: z.object({
    id: z.string().uuid('ID de organización inválido'),
  }),
  body: z.object({
    email: z.string().email('Email inválido'),
    password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
    firstName: z.string().min(1, 'El nombre es requerido'),
    lastName: z.string().min(1, 'El apellido es requerido'),
    phone: z.string().optional(),
    specialties: z.array(z.string()).optional(),
    schedule: scheduleSchema.optional(),
  }),
});

export const updateBarberSchema = z.object({
  params: z.object({
    id: z.string().uuid('ID de barbero inválido'),
  }),
  body: z.object({
    specialties: z.array(z.string()).optional(),
    schedule: scheduleSchema.optional(),
  }),
});

