import { Router, Request, Response, NextFunction } from 'express';
import authController from '@controllers/auth.controller';
import { authenticateToken } from '@middleware/auth';
import { validate } from '@middleware/validate';
import { registerSchema, loginSchema, refreshTokenSchema, googleLoginSchema } from '@validators/auth.validator';
import { RequestWithUser } from '@types';

const router = Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Registrar nuevo cliente
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - firstName
 *               - lastName
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               phone:
 *                 type: string
 *     responses:
 *       201:
 *         description: Usuario registrado exitosamente
 */
router.post('/register', validate(registerSchema), authController.register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Iniciar sesión
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login exitoso
 */
router.post('/login', validate(loginSchema), authController.login);

/**
 * @swagger
 * /api/auth/google:
 *   post:
 *     summary: Iniciar sesión con Google
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - idToken
 *             properties:
 *               idToken:
 *                 type: string
 *                 description: ID token de Google obtenido del frontend
 *     responses:
 *       200:
 *         description: Login exitoso con Google
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                     accessToken:
 *                       type: string
 *                     refreshToken:
 *                       type: string
 *       401:
 *         description: Token de Google inválido
 */
router.post('/google', validate(googleLoginSchema), authController.loginWithGoogle);

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Renovar access token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Tokens renovados
 */
router.post('/refresh', validate(refreshTokenSchema), authController.refreshToken);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Cerrar sesión
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Sesión cerrada
 */
router.post('/logout', authController.logout);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Obtener usuario actual
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Usuario actual
 */
router.get('/me', 
  (req: Request, res: Response, next: NextFunction) => authenticateToken(req as RequestWithUser, res, next),
  (req: Request, res: Response, next: NextFunction) => authController.getCurrentUser(req as RequestWithUser, res, next)
);

export default router;

