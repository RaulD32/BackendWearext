import { Router } from 'express';
import { whatsAppController } from '../controllers/whatsappController.js';
import { simulationController } from '../controllers/simulationController.js';

const router = Router();

/**
 * @swagger
 * /api/test-whatsapp/status:
 *   get:
 *     tags:
 *       - Test WhatsApp (Sin Autenticación)
 *     summary: Obtener estado de WhatsApp (sin auth)
 *     description: Endpoint temporal para probar WhatsApp sin autenticación
 *     responses:
 *       200:
 *         description: Estado obtenido exitosamente
 */
/**
 * @swagger
 * /api/test-whatsapp/config:
 *   get:
 *     tags:
 *       - Test WhatsApp (Sin Autenticación)
 *     summary: Obtener configuración de WhatsApp desde .env
 *     description: Muestra la configuración actual de WhatsApp desde variables de entorno
 *     responses:
 *       200:
 *         description: Configuración obtenida exitosamente
 */
router.get('/config', (req, res) => {
    const config = {
        whatsappEnabled: process.env.WHATSAPP_ENABLED === 'true',
        tutorPhoneConfigured: !!process.env.TUTOR_PHONE_NUMBER,
        tutorPhone: process.env.TUTOR_PHONE_NUMBER ?
            process.env.TUTOR_PHONE_NUMBER.replace(/\d(?=\d{4})/g, '*') : // Ocultar dígitos excepto los últimos 4
            'No configurado',
        autoInitializeEnabled: process.env.WHATSAPP_ENABLED === 'true' && !!process.env.TUTOR_PHONE_NUMBER
    };

    res.json({
        success: true,
        message: 'Configuración de WhatsApp desde .env',
        data: config,
        instructions: {
            enable: 'Para habilitar: WHATSAPP_ENABLED=true en .env',
            setPhone: 'Para configurar teléfono: TUTOR_PHONE_NUMBER=+529981035330 en .env',
            restart: 'Reinicia el servidor después de cambios en .env'
        }
    });
});

router.get('/status', whatsAppController.getWhatsAppStatus.bind(whatsAppController));

/**
 * @swagger
 * /api/test-whatsapp/initialize:
 *   post:
 *     tags:
 *       - Test WhatsApp (Sin Autenticación)
 *     summary: Inicializar WhatsApp (sin auth)
 *     description: Endpoint temporal para inicializar WhatsApp sin autenticación
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tutorPhone:
 *                 type: string
 *                 example: "+529981035330"
 *     responses:
 *       200:
 *         description: WhatsApp inicializado exitosamente
 */
router.post('/initialize', whatsAppController.initializeWhatsApp.bind(whatsAppController));

/**
 * @swagger
 * /api/test-whatsapp/test-message:
 *   post:
 *     tags:
 *       - Test WhatsApp (Sin Autenticación)
 *     summary: Enviar mensaje de prueba (sin auth)
 *     description: Endpoint temporal para probar envío de mensajes sin autenticación
 *     responses:
 *       200:
 *         description: Mensaje de prueba enviado exitosamente
 */
router.post('/test-message', whatsAppController.sendTestMessage.bind(whatsAppController));

/**
 * @swagger
 * /api/test-whatsapp/disconnect:
 *   post:
 *     tags:
 *       - Test WhatsApp (Sin Autenticación)
 *     summary: Desconectar WhatsApp (sin auth)
 *     description: Endpoint temporal para desconectar WhatsApp sin autenticación
 *     responses:
 *       200:
 *         description: WhatsApp desconectado exitosamente
 */
router.post('/disconnect', whatsAppController.disconnectWhatsApp.bind(whatsAppController));

// Nuevos endpoints de simulación para ESP32 avanzado

/**
 * @swagger
 * /api/test-whatsapp/simulate-button:
 *   post:
 *     tags:
 *       - Test WhatsApp (Sin Autenticación)
 *     summary: Simular presión de botón ESP32
 *     description: Simula presión de botón con nuevas categorías del ESP32
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               button:
 *                 type: number
 *                 description: Número del botón (1-10)
 *               category:
 *                 oneOf:
 *                   - type: number
 *                     description: ID de categoría (1-3)
 *                   - type: string
 *                     description: Nombre de categoría (Básico, Emociones, Necesidades)
 *               childName:
 *                 type: string
 *                 description: Nombre del niño (opcional)
 *     responses:
 *       200:
 *         description: Simulación ejecutada exitosamente
 */
router.post('/simulate-button', simulationController.simulateButtonPress.bind(simulationController));

/**
 * @swagger
 * /api/test-whatsapp/simulate-battery:
 *   post:
 *     tags:
 *       - Test WhatsApp (Sin Autenticación)
 *     summary: Simular alerta de batería baja
 *     description: Simula alerta de batería baja del ESP32
 *     responses:
 *       200:
 *         description: Simulación ejecutada exitosamente
 */
router.post('/simulate-battery', simulationController.simulateBatteryAlert.bind(simulationController));

/**
 * @swagger
 * /api/test-whatsapp/simulate-wakeup:
 *   post:
 *     tags:
 *       - Test WhatsApp (Sin Autenticación)
 *     summary: Simular despertar del ESP32
 *     description: Simula que el ESP32 despierta del modo sueño
 *     responses:
 *       200:
 *         description: Simulación ejecutada exitosamente
 */
router.post('/simulate-wakeup', simulationController.simulateWakeUp.bind(simulationController));

/**
 * @swagger
 * /api/test-whatsapp/simulate-sleep:
 *   post:
 *     tags:
 *       - Test WhatsApp (Sin Autenticación)
 *     summary: Simular entrada en modo sueño
 *     description: Simula que el ESP32 entra en modo sueño
 *     responses:
 *       200:
 *         description: Simulación ejecutada exitosamente
 */
router.post('/simulate-sleep', simulationController.simulateGoToSleep.bind(simulationController));

/**
 * @swagger
 * /api/test-whatsapp/simulate-state-change:
 *   post:
 *     tags:
 *       - Test WhatsApp (Sin Autenticación)
 *     summary: Simular cambio de estado del sistema
 *     description: Simula cambio de estado del sistema ESP32
 *     responses:
 *       200:
 *         description: Simulación ejecutada exitosamente
 */
router.post('/simulate-state-change', simulationController.simulateSystemStateChange.bind(simulationController));

/**
 * @swagger
 * /api/test-whatsapp/simulate-log:
 *   post:
 *     tags:
 *       - Test WhatsApp (Sin Autenticación)
 *     summary: Simular mensaje de log del ESP32
 *     description: Simula mensaje de log del ESP32
 *     responses:
 *       200:
 *         description: Simulación ejecutada exitosamente
 */
router.post('/simulate-log', simulationController.simulateLogMessage.bind(simulationController));

/**
 * @swagger
 * /api/test-whatsapp/simulate-category-command:
 *   post:
 *     tags:
 *       - Test WhatsApp (Sin Autenticación)
 *     summary: Simular comando de cambio de categoría desde móvil
 *     description: Simula el comando que envía el frontend para cambiar categoría
 *     responses:
 *       200:
 *         description: Simulación ejecutada exitosamente
 */
router.post('/simulate-category-command', simulationController.simulateCategoryCommand.bind(simulationController));

/**
 * @swagger
 * /api/test-whatsapp/simulate-shutdown-command:
 *   post:
 *     tags:
 *       - Test WhatsApp (Sin Autenticación)
 *     summary: Simular comando de apagado desde móvil
 *     description: Simula el comando que envía el frontend para apagar el ESP32
 *     responses:
 *       200:
 *         description: Simulación ejecutada exitosamente
 */
router.post('/simulate-shutdown-command', simulationController.simulateShutdownCommand.bind(simulationController));

/**
 * @swagger
 * /api/test-whatsapp/full-test:
 *   post:
 *     tags:
 *       - Test WhatsApp (Sin Autenticación)
 *     summary: Ejecutar simulación completa
 *     description: Ejecuta una simulación completa con todas las nuevas funcionalidades
 *     responses:
 *       200:
 *         description: Simulación completa ejecutada exitosamente
 */
router.post('/full-test', simulationController.runFullSimulation.bind(simulationController));

export default router;
