import { Router } from 'express';
import organizationsController from '@controllers/organizations.controller';
import barbersController from '@controllers/barbers.controller';
import { authenticateToken } from '@middleware/auth';
import { validate } from '@middleware/validate';
import { updateOrganizationSchema } from '@validators/organization.validator';
import { createBarberSchema } from '@validators/barber.validator';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

router.get('/', organizationsController.getOrganizations);

/**
 * @swagger
 * /api/organizations/{id}:
 *   get:
 *     summary: Obtener organización
 *     tags: [Organizations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Organización
 */
router.get('/:id', organizationsController.getOrganization);

/**
 * @swagger
 * /api/organizations/{id}:
 *   patch:
 *     summary: Actualizar organización
 *     tags: [Organizations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Organización actualizada
 */
router.patch('/:id', validate(updateOrganizationSchema), organizationsController.updateOrganization);

/**
 * @swagger
 * /api/organizations/{id}/barbers:
 *   post:
 *     summary: Crear barbero
 *     tags: [Organizations]
 *     security:
 *       - bearerAuth: []
 */
router.post('/:id/barbers', validate(createBarberSchema), barbersController.createBarber);

/**
 * @swagger
 * /api/organizations/{id}/barbers:
 *   get:
 *     summary: Listar barberos de organización
 *     tags: [Organizations]
 *     security:
 *       - bearerAuth: []
 */
router.get('/:id/barbers', barbersController.getBarbersByOrganization);

export default router;

