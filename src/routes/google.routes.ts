import { Router } from 'express';
import googleController from '@controllers/google.controller';
import { authenticateToken } from '@middleware/auth';

const router = Router();

/**
 * @swagger
 * /api/google/auth:
 *   get:
 *     summary: Obtener URL de autorización Google
 *     tags: [Google]
 *     responses:
 *       200:
 *         description: URL de autorización
 */
router.get('/auth', googleController.getAuthUrl);

/**
 * @swagger
 * /api/google/callback:
 *   get:
 *     summary: Callback de OAuth de Google
 *     tags: [Google]
 *     parameters:
 *       - in: query
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Autorización exitosa
 */
router.get('/callback', googleController.handleCallback);

// Routes that require authentication
router.use(authenticateToken);

/**
 * @swagger
 * /api/google/sync/{appointment_id}:
 *   post:
 *     summary: Sincronizar cita con Google Calendar
 *     tags: [Google]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: appointment_id
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
 *               tokens:
 *                 type: object
 *     responses:
 *       200:
 *         description: Cita sincronizada
 */
router.post('/sync/:appointment_id', googleController.syncAppointment);

/**
 * @swagger
 * /api/google/event/{appointment_id}:
 *   delete:
 *     summary: Eliminar evento de Google Calendar
 *     tags: [Google]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: appointment_id
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
 *               tokens:
 *                 type: object
 *     responses:
 *       200:
 *         description: Evento eliminado
 */
router.delete('/event/:appointment_id', googleController.deleteEvent);

export default router;

