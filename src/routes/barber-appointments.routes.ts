import { Router } from 'express';
import appointmentsController from '@controllers/appointments.controller';
import { authenticateToken } from '@middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

/**
 * @swagger
 * /api/barbers/{id}/appointments:
 *   get:
 *     summary: Citas de un barbero
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
 *         description: Lista de citas del barbero
 */
router.get('/:id/appointments', (req, res, next) => {
  req.query.barberId = req.params.id;
  appointmentsController.getAppointments(req as any, res, next);
});

export default router;

