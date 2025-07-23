import { Router } from 'express';
import { webSocketController } from '../controllers/websocketController.js';

const router = Router();

/**
 * @swagger
 * /api/websocket/status:
 *   get:
 *     tags:
 *       - WebSocket
 *     summary: Obtener estado de conexiones WebSocket
 *     description: |
 *       Devuelve el estado actual de todas las conexiones WebSocket activas.
 *       Incluye información sobre ESP32 y clientes móviles conectados.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estado de conexiones obtenido exitosamente
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
 *                         esp32Connected:
 *                           type: boolean
 *                           description: Si el ESP32 está conectado
 *                           example: true
 *                         mobileClientsCount:
 *                           type: integer
 *                           description: Número de clientes móviles conectados
 *                           example: 2
 *                         esp32Status:
 *                           type: object
 *                           properties:
 *                             battery:
 *                               type: integer
 *                               description: Nivel de batería del ESP32 (%)
 *                               example: 85
 *                             category:
 *                               type: integer
 *                               description: Categoría actual del ESP32
 *                               example: 1
 *                             lastHeartbeat:
 *                               type: string
 *                               format: date-time
 *                               description: Último heartbeat recibido
 *                               example: "2024-01-15T10:30:00.000Z"
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/status', (req, res) => {
    try {
        const clientsInfo = webSocketController.getConnectedClients();
        const esp32Status = webSocketController.getESP32Status();

        res.json({
            success: true,
            message: 'Estado de WebSocket obtenido exitosamente',
            data: {
                esp32Connected: clientsInfo.esp32,
                mobileClientsCount: clientsInfo.mobileCount,
                esp32Status: esp32Status,
                serverTime: new Date().toISOString()
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener estado de WebSocket',
            errors: [error instanceof Error ? error.message : 'Error desconocido']
        });
    }
});

/**
 * @swagger
 * /api/websocket/send-command:
 *   post:
 *     tags:
 *       - WebSocket
 *     summary: Enviar comando al ESP32 via WebSocket
 *     description: |
 *       Envía un comando directo al ESP32 conectado a través de WebSocket.
 *       Permite controlar remotamente el dispositivo ESP32 desde la API REST.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - command
 *             properties:
 *               command:
 *                 type: string
 *                 enum: [play, category, battery, shutdown]
 *                 description: Comando a enviar al ESP32
 *                 example: "play"
 *               button:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 3
 *                 description: Número de botón (requerido para comando play)
 *                 example: 1
 *               category:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 3
 *                 description: Categoría a establecer (requerido para comando category)
 *                 example: 2
 *               data:
 *                 type: object
 *                 description: Datos adicionales para el comando
 *     responses:
 *       200:
 *         description: Comando enviado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: true
 *               message: "Comando enviado al ESP32 exitosamente"
 *               data:
 *                 command: "play"
 *                 button: 1
 *                 sentAt: "2024-01-15T10:30:00.000Z"
 *       400:
 *         description: Error de validación o comando inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Comando inválido o parámetros faltantes"
 *               errors: ["El comando 'play' requiere el parámetro 'button'"]
 *       404:
 *         description: ESP32 no conectado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "ESP32 no está conectado"
 *               errors: ["No se puede enviar comando: dispositivo ESP32 no disponible"]
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/send-command', (req, res) => {
    try {
        const { command, button, category, data } = req.body;

        if (!command) {
            return res.status(400).json({
                success: false,
                message: 'Comando requerido',
                errors: ['El campo command es obligatorio']
            });
        }

        // Validar comandos específicos
        if (command === 'play' && !button) {
            return res.status(400).json({
                success: false,
                message: 'Comando inválido',
                errors: ['El comando play requiere el parámetro button']
            });
        }

        if (command === 'category' && !category) {
            return res.status(400).json({
                success: false,
                message: 'Comando inválido',
                errors: ['El comando category requiere el parámetro category']
            });
        }

        // Enviar comando al ESP32
        const sent = webSocketController.sendToESP32(command, {
            button,
            category,
            data,
            timestamp: Date.now()
        });

        if (!sent) {
            return res.status(404).json({
                success: false,
                message: 'ESP32 no está conectado',
                errors: ['No se puede enviar comando: dispositivo ESP32 no disponible']
            });
        }

        res.json({
            success: true,
            message: 'Comando enviado al ESP32 exitosamente',
            data: {
                command,
                button,
                category,
                data,
                sentAt: new Date().toISOString()
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al enviar comando',
            errors: [error instanceof Error ? error.message : 'Error desconocido']
        });
    }
});

/**
 * @swagger
 * /api/websocket/broadcast:
 *   post:
 *     tags:
 *       - WebSocket
 *     summary: Enviar mensaje broadcast a todos los clientes
 *     description: |
 *       Envía un mensaje a todos los clientes conectados (ESP32 y aplicaciones móviles).
 *       Útil para notificaciones globales o actualizaciones del sistema.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - message
 *             properties:
 *               type:
 *                 type: string
 *                 description: Tipo de mensaje broadcast
 *                 example: "system_notification"
 *               message:
 *                 type: string
 *                 description: Contenido del mensaje
 *                 example: "Sistema actualizado exitosamente"
 *               data:
 *                 type: object
 *                 description: Datos adicionales del mensaje
 *     responses:
 *       200:
 *         description: Mensaje enviado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/broadcast', (req, res) => {
    try {
        const { type, message, data } = req.body;

        if (!type || !message) {
            return res.status(400).json({
                success: false,
                message: 'Campos requeridos faltantes',
                errors: ['Los campos type y message son obligatorios']
            });
        }

        webSocketController.broadcastToAll({
            type,
            message,
            data,
            timestamp: Date.now(),
            from: 'api_server'
        });

        res.json({
            success: true,
            message: 'Mensaje broadcast enviado exitosamente',
            data: {
                type,
                message,
                sentAt: new Date().toISOString()
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al enviar mensaje broadcast',
            errors: [error instanceof Error ? error.message : 'Error desconocido']
        });
    }
});

export default router;
