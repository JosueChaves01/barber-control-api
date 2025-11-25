import { z } from 'zod';

// Esquema base para la creación de organización
export const createOrganizationSchema = z.object({
  // Campos de la organización
  name: z.string().min(1, 'El nombre es requerido'),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('Email inválido').optional(),
  
  // Campos del administrador (acepta tanto camelCase como snake_case)
  admin_email: z.string().email('Email del admin inválido'),
  admin_password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
  admin_first_name: z.string().min(1, 'El nombre del admin es requerido'),
  admin_last_name: z.string().min(1, 'El apellido del admin es requerido'),
  admin_phone: z.string().optional(),
  
  // Alias para compatibilidad con camelCase
  adminPassword: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres').optional(),
  adminFirstName: z.string().min(1, 'El nombre del admin es requerido').optional(),
  adminLastName: z.string().min(1, 'El apellido del admin es requerido').optional(),
  adminPhone: z.string().optional(),
})
// El email ya es requerido en la definición del esquema, así que podemos eliminar este refine
.transform(data => ({
  // Transformar a camelCase
  name: data.name,
  address: data.address,
  phone: data.phone,
  email: data.email,
  adminEmail: data.admin_email,
  adminPassword: data.adminPassword || data.admin_password,
  adminFirstName: data.adminFirstName || data.admin_first_name,
  adminLastName: data.adminLastName || data.admin_last_name,
  adminPhone: data.adminPhone || data.admin_phone,
}));

export const updateOrganizationSchema = z.object({
  params: z.object({
    id: z.string().uuid('ID inválido'),
  }),
  body: z.object({
    name: z.string().min(1).optional(),
    address: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email('Email inválido').optional(),
  }),
});

export const createAdminSchema = z.object({
  // Accept both snake_case and camelCase
  organizationId: z.string().uuid('ID de organización inválido').optional(),
  organization_id: z.string().uuid('ID de organización inválido').optional(),
  
  email: z.string().email('Email inválido'),
  
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres').optional(),
  
  firstName: z.string().min(1, 'El nombre es requerido').optional(),
  first_name: z.string().min(1, 'El nombre es requerido').optional(),
  
  lastName: z.string().min(1, 'El apellido es requerido').optional(),
  last_name: z.string().min(1, 'El apellido es requerido').optional(),
  
  phone: z.string().optional()
})
.refine(data => data.organizationId || data.organization_id, {
  message: 'ID de organización es requerido',
  path: ['organizationId']
})
.refine(data => data.firstName || data.first_name, {
  message: 'El nombre es requerido',
  path: ['firstName']
})
.refine(data => data.lastName || data.last_name, {
  message: 'El apellido es requerido',
  path: ['lastName']
})
.transform(data => ({
  // Transform to camelCase
  organizationId: data.organizationId || data.organization_id,
  email: data.email,
  password: data.password,
  firstName: data.firstName || data.first_name,
  lastName: data.lastName || data.last_name,
  phone: data.phone
}));

