import { Router } from 'express';
import appointmentsController from '@controllers/appointments.controller';
import { authenticateToken } from '@middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

/**
 * @swagger
 * /api/clients/{id}/appointments:
 *   get:
 *     summary: Citas de un cliente
 *     tags: [Appointments]
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
 *         description: Lista de citas del cliente
 */
router.get('/:id/appointments', (req, res, next) => {
  req.query.clientId = req.params.id;
  appointmentsController.getAppointments(req as any, res, next);
});

export default router;

