import { Router } from 'express';
import clientsController from '@controllers/clients.controller';
import { authenticateToken } from '@middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

/**
 * @swagger
 * /api/clients/{id}:
 *   get:
 *     summary: Obtener cliente
 *     tags: [Clients]
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
 *         description: Cliente
 */
router.get('/:id', clientsController.getClient);

/**
 * @swagger
 * /api/clients/{id}:
 *   patch:
 *     summary: Actualizar cliente
 *     tags: [Clients]
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
 *             properties:
 *               preferences:
 *                 type: object
 *     responses:
 *       200:
 *         description: Cliente actualizado
 */
router.patch('/:id', clientsController.updateClient);

export default router;

