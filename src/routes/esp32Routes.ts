import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import {
    playMessageOnESP32Controller,
    changeCategoryOnESP32Controller,
    getESP32StatusController,
    requestBatteryStatusController,
    playCategorySequenceController,
    syncFavoritesController,
    shutdownESP32Controller
} from '../controllers/esp32Controller.js';

const router = Router();

// Aplicar autenticación a todas las rutas
router.use(authMiddleware);

/**
 * @swagger
 * /api/esp32/play-message/{messageId}:
 *   post:
 *     tags:
 *       - ESP32 Control
 *     summary: Reproducir mensaje específico en ESP32
 *     description: |
 *       Envía un mensaje específico al ESP32 para su reproducción inmediata.
 *       El mensaje debe estar asignado al niño especificado.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: messageId
 *         required: true
 *         description: ID del mensaje a reproducir
 *         schema:
 *           type: integer
 *           example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - childId
 *             properties:
 *               childId:
 *                 type: integer
 *                 description: ID del niño que solicita el mensaje
 *                 example: 3
 *     responses:
 *       200:
 *         description: Mensaje enviado al ESP32 exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         description: Parámetros faltantes o inválidos
 *       404:
 *         description: ESP32 no conectado o mensaje no disponible
 *       401:
 *         description: No autorizado
 */
router.post('/play-message/:messageId', playMessageOnESP32Controller);

/**
 * @swagger
 * /api/esp32/change-category/{categoryId}:
 *   post:
 *     tags:
 *       - ESP32 Control
 *     summary: Cambiar categoría activa en ESP32
 *     description: |
 *       Cambia la categoría actual del ESP32 para organizar los mensajes disponibles.
 *       Esto afecta qué mensajes se reproducen en cada botón del dispositivo.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         description: ID de la categoría a activar
 *         schema:
 *           type: integer
 *           example: 2
 *     responses:
 *       200:
 *         description: Categoría cambiada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         description: categoryId inválido
 *       404:
 *         description: ESP32 no conectado o categoría no válida
 *       401:
 *         description: No autorizado
 */
router.post('/change-category/:categoryId', changeCategoryOnESP32Controller);

/**
 * @swagger
 * /api/esp32/status:
 *   get:
 *     tags:
 *       - ESP32 Control
 *     summary: Obtener estado completo del ESP32
 *     description: |
 *       Obtiene el estado actual del ESP32 incluyendo conexión, batería, categoría activa
 *       y información de otros clientes conectados.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estado obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         esp32:
 *                           type: object
 *                           properties:
 *                             connected:
 *                               type: boolean
 *                               example: true
 *                             battery:
 *                               type: integer
 *                               example: 85
 *                             category:
 *                               type: integer
 *                               example: 1
 *                             lastHeartbeat:
 *                               type: string
 *                               format: date-time
 *                         connections:
 *                           type: object
 *                           properties:
 *                             esp32:
 *                               type: boolean
 *                               example: true
 *                             mobileCount:
 *                               type: integer
 *                               example: 2
 *       401:
 *         description: No autorizado
 */
router.get('/status', getESP32StatusController);

/**
 * @swagger
 * /api/esp32/battery-status:
 *   post:
 *     tags:
 *       - ESP32 Control
 *     summary: Solicitar estado de batería del ESP32
 *     description: |
 *       Solicita al ESP32 que envíe su estado actual de batería.
 *       La respuesta se recibe vía WebSocket.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Solicitud enviada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       404:
 *         description: ESP32 no conectado
 *       401:
 *         description: No autorizado
 */
router.post('/battery-status', requestBatteryStatusController);

/**
 * @swagger
 * /api/esp32/play-category/{categoryId}:
 *   post:
 *     tags:
 *       - ESP32 Control
 *     summary: Reproducir secuencia de mensajes de una categoría
 *     description: |
 *       Reproduce todos los mensajes disponibles de una categoría específica
 *       para un niño, en secuencia con intervalos de 3 segundos.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         description: ID de la categoría a reproducir
 *         schema:
 *           type: integer
 *           example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - childId
 *             properties:
 *               childId:
 *                 type: integer
 *                 description: ID del niño
 *                 example: 3
 *     responses:
 *       200:
 *         description: Secuencia iniciada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         description: Parámetros faltantes
 *       404:
 *         description: ESP32 no conectado o sin mensajes disponibles
 *       401:
 *         description: No autorizado
 */
router.post('/play-category/:categoryId', playCategorySequenceController);

/**
 * @swagger
 * /api/esp32/sync-favorites/{childId}:
 *   post:
 *     tags:
 *       - ESP32 Control
 *     summary: Sincronizar mensajes favoritos con ESP32
 *     description: |
 *       Sincroniza los mensajes marcados como favoritos por un niño específico
 *       con el ESP32 para acceso rápido.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: childId
 *         required: true
 *         description: ID del niño
 *         schema:
 *           type: integer
 *           example: 3
 *     responses:
 *       200:
 *         description: Favoritos sincronizados exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         description: childId inválido
 *       404:
 *         description: ESP32 no conectado
 *       401:
 *         description: No autorizado
 */
router.post('/sync-favorites/:childId', syncFavoritesController);

/**
 * @swagger
 * /api/esp32/shutdown:
 *   post:
 *     tags:
 *       - ESP32 Control
 *     summary: Apagar ESP32 remotamente (solo administradores)
 *     description: |
 *       Envía comando de apagado al ESP32. Solo administradores pueden ejecutar este comando.
 *       El ESP32 entrará en modo de sueño profundo para conservar batería.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Comando de apagado enviado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       403:
 *         description: Solo administradores pueden apagar el ESP32
 *       404:
 *         description: ESP32 no conectado
 *       401:
 *         description: No autorizado
 */
router.post('/shutdown', shutdownESP32Controller);

export default router;
