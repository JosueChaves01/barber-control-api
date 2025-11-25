import { Router } from 'express';
import barbersController from '@controllers/barbers.controller';
import { authenticateToken } from '@middleware/auth';
import { validate } from '@middleware/validate';
import { createBarberSchema, updateBarberSchema } from '@validators/barber.validator';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

/**
 * @swagger
 * /api/barbers/{id}:
 *   get:
 *     summary: Obtener barbero
 *     tags: [Barbers]
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
 *         description: Barbero
 */
router.get('/:id', barbersController.getBarber);

/**
 * @swagger
 * /api/barbers/{id}:
 *   patch:
 *     summary: Actualizar barbero
 *     tags: [Barbers]
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
 *         description: Barbero actualizado
 */
router.patch('/:id', validate(updateBarberSchema), barbersController.updateBarber);

export default router;

