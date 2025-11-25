import { Router } from 'express';
import notificationsController from '@controllers/notifications.controller';
import { authenticateToken } from '@middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: Listar notificaciones del usuario
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: read
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: Lista de notificaciones
 */
router.get('/', notificationsController.getNotifications);

/**
 * @swagger
 * /api/notifications/{id}/read:
 *   patch:
 *     summary: Marcar notificación como leída
 *     tags: [Notifications]
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
 *         description: Notificación marcada como leída
 */
router.patch('/:id/read', notificationsController.markAsRead);

export default router;

