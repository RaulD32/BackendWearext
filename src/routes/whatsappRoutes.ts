import { Router } from 'express';
import { whatsAppController } from '../controllers/whatsappController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = Router();

/**
 * @swagger
 * /api/whatsapp/initialize:
 *   post:
 *     summary: Inicializar el servicio de WhatsApp
 *     tags: [WhatsApp]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tutorPhone
 *             properties:
 *               tutorPhone:
 *                 type: string
 *                 description: Número de teléfono del tutor
 *                 example: "+5215512345678"
 *     responses:
 *       200:
 *         description: Servicio inicializado correctamente
 *       400:
 *         description: Datos inválidos
 *       500:
 *         description: Error del servidor
 */
router.post('/initialize', authMiddleware, whatsAppController.initializeWhatsApp);

/**
 * @swagger
 * /api/whatsapp/status:
 *   get:
 *     summary: Obtener estado del servicio de WhatsApp
 *     tags: [WhatsApp]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estado obtenido correctamente
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
 *                     isReady:
 *                       type: boolean
 *                     status:
 *                       type: string
 *                     timestamp:
 *                       type: string
 */
router.get('/status', authMiddleware, whatsAppController.getWhatsAppStatus);

/**
 * @swagger
 * /api/whatsapp/test:
 *   post:
 *     summary: Enviar mensaje de prueba
 *     tags: [WhatsApp]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Mensaje enviado correctamente
 *       400:
 *         description: Servicio no conectado
 *       500:
 *         description: Error del servidor
 */
router.post('/test', authMiddleware, whatsAppController.sendTestMessage);

/**
 * @swagger
 * /api/whatsapp/tutor-phone:
 *   post:
 *     summary: Configurar número de teléfono del tutor
 *     tags: [WhatsApp]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phone
 *             properties:
 *               phone:
 *                 type: string
 *                 description: Número de teléfono del tutor
 *                 example: "+5215512345678"
 *     responses:
 *       200:
 *         description: Número configurado correctamente
 *       400:
 *         description: Número inválido
 *       500:
 *         description: Error del servidor
 */
router.post('/tutor-phone', authMiddleware, whatsAppController.setTutorPhone);

/**
 * @swagger
 * /api/whatsapp/disconnect:
 *   post:
 *     summary: Desconectar el servicio de WhatsApp
 *     tags: [WhatsApp]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Servicio desconectado correctamente
 *       500:
 *         description: Error del servidor
 */
router.post('/disconnect', authMiddleware, whatsAppController.disconnectWhatsApp);

/**
 * @swagger
 * /api/whatsapp/battery-alert:
 *   post:
 *     summary: Enviar alerta manual de batería
 *     tags: [WhatsApp]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - batteryLevel
 *             properties:
 *               batteryLevel:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 100
 *                 description: Nivel de batería (0-100)
 *                 example: 15
 *     responses:
 *       200:
 *         description: Alerta enviada correctamente
 *       400:
 *         description: Nivel de batería inválido
 *       500:
 *         description: Error del servidor
 */
router.post('/battery-alert', authMiddleware, whatsAppController.sendBatteryAlert);

export default router;
