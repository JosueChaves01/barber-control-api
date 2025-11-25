import { Router } from 'express';
import appointmentsController from '@controllers/appointments.controller';
import { authenticateToken } from '@middleware/auth';
import { validate } from '@middleware/validate';
import { createAppointmentSchema, updateAppointmentSchema, getAppointmentsSchema } from '@validators/appointment.validator';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

/**
 * @swagger
 * /api/appointments:
 *   post:
 *     summary: Crear cita
 *     tags: [Appointments]
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
 *         description: Cita creada
 */
router.post('/', validate(createAppointmentSchema), appointmentsController.createAppointment);

/**
 * @swagger
 * /api/appointments:
 *   get:
 *     summary: Listar citas
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: organizationId
 *         schema:
 *           type: string
 *       - in: query
 *         name: barberId
 *         schema:
 *           type: string
 *       - in: query
 *         name: clientId
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de citas
 */
router.get('/', validate(getAppointmentsSchema), appointmentsController.getAppointments);


/**
 * @swagger
 * /api/appointments/{id}:
 *   get:
 *     summary: Obtener cita
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
 *         description: Cita
 */
router.get('/:id', appointmentsController.getAppointment);

/**
 * @swagger
 * /api/appointments/{id}:
 *   patch:
 *     summary: Actualizar cita
 *     tags: [Appointments]
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
 *         description: Cita actualizada
 */
router.patch('/:id', validate(updateAppointmentSchema), appointmentsController.updateAppointment);

/**
 * @swagger
 * /api/appointments/{id}:
 *   delete:
 *     summary: Eliminar cita
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
 *         description: Cita eliminada
 */
router.delete('/:id', appointmentsController.deleteAppointment);

export default router;

