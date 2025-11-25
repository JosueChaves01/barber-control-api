import { Router } from 'express';
import superadminController from '@controllers/superadmin.controller';
import { authenticateToken } from '@middleware/auth';
import { authorizeRoles } from '@middleware/authorize';
import { validate } from '@middleware/validate';
import { createOrganizationSchema, createAdminSchema } from '@validators/organization.validator';
import { UserRole } from '@types';

const router = Router();

// All routes require authentication and SUPERADMIN role
router.use(authenticateToken);
router.use(authorizeRoles(UserRole.SUPERADMIN));

/**
 * @swagger
 * /api/superadmin/organizations:
 *   post:
 *     summary: Crear organización y admin
 *     tags: [SuperAdmin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - adminEmail
 *               - adminPassword
 *               - adminFirstName
 *               - adminLastName
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nombre de la organización
 *               address:
 *                 type: string
 *                 description: Dirección de la organización
 *               phone:
 *                 type: string
 *                 description: Teléfono de la organización
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email de la organización
 *               adminEmail:
 *                 type: string
 *                 format: email
 *                 description: Email del administrador
 *               adminPassword:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 description: Contraseña del administrador (mínimo 8 caracteres)
 *               adminFirstName:
 *                 type: string
 *                 description: Nombre del administrador
 *               adminLastName:
 *                 type: string
 *                 description: Apellido del administrador
 *               adminPhone:
 *                 type: string
 *                 description: Teléfono del administrador
 *     responses:
 *       201:
 *         description: Organización creada exitosamente
 *       400:
 *         description: Error de validación en los datos de entrada
 *       409:
 *         description: El email del administrador ya está registrado
 *       500:
 *         description: Error interno del servidor
 */
router.post(
  '/organizations',
  validate(createOrganizationSchema),
  superadminController.createOrganization
);

/**
 * @swagger
 * /api/superadmin/organizations:
 *   get:
 *     summary: Listar todas las organizaciones
 *     tags: [SuperAdmin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de organizaciones
 */
router.get('/organizations', superadminController.getAllOrganizations);

/**
 * @swagger
 * /api/superadmin/admins:
 *   post:
 *     summary: Crear admin para organización
 *     tags: [SuperAdmin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Admin creado
 */
router.post('/admins', validate(createAdminSchema), superadminController.createAdmin);

/**
 * @swagger
 * /api/superadmin/users:
 *   get:
 *     summary: Listar todos los usuarios
 *     tags: [SuperAdmin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de usuarios
 */
router.get('/users', superadminController.getAllUsers);

export default router;

