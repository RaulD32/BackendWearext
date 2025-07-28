import { Router } from 'express';
import { simulationController } from '../controllers/simulationController.js';

const router = Router();

/**
 * @swagger
 * /api/simulation/button-press:
 *   post:
 *     tags:
 *       - Simulación ESP32
 *     summary: Simular presión de botón del ESP32
 *     description: Simula que un niño presiona un botón en el dispositivo ESP32
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               button:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 10
 *                 example: 1
 *                 description: Número del botón presionado (1-10)
 *               category:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 example: 1
 *                 description: Categoría del mensaje (1=Emociones, 2=Necesidades, 3=Actividades, 4=Familia, 5=Comida)
 *               childName:
 *                 type: string
 *                 example: "Ana María"
 *                 description: Nombre del niño (opcional)
 *     responses:
 *       200:
 *         description: Simulación ejecutada correctamente
 *       400:
 *         description: Datos inválidos o WhatsApp no conectado
 */
router.post('/button-press', simulationController.simulateButtonPress.bind(simulationController));

/**
 * @swagger
 * /api/simulation/battery-alert:
 *   post:
 *     tags:
 *       - Simulación ESP32
 *     summary: Simular alerta de batería baja
 *     description: Simula que el dispositivo ESP32 tiene batería baja
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               batteryLevel:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 100
 *                 example: 15
 *                 description: Nivel de batería (opcional, por defecto 15%)
 *     responses:
 *       200:
 *         description: Simulación ejecutada correctamente
 *       400:
 *         description: WhatsApp no conectado
 */
router.post('/battery-alert', simulationController.simulateBatteryAlert.bind(simulationController));

/**
 * @swagger
 * /api/simulation/device-disconnect:
 *   post:
 *     tags:
 *       - Simulación ESP32
 *     summary: Simular desconexión del dispositivo
 *     description: Simula que el dispositivo ESP32 se desconecta del sistema
 *     responses:
 *       200:
 *         description: Simulación ejecutada correctamente
 *       400:
 *         description: WhatsApp no conectado
 */
router.post('/device-disconnect', simulationController.simulateDeviceDisconnection.bind(simulationController));

/**
 * @swagger
 * /api/simulation/device-reconnect:
 *   post:
 *     tags:
 *       - Simulación ESP32
 *     summary: Simular reconexión del dispositivo
 *     description: Simula que el dispositivo ESP32 se reconecta al sistema
 *     responses:
 *       200:
 *         description: Simulación ejecutada correctamente
 *       400:
 *         description: WhatsApp no conectado
 */
router.post('/device-reconnect', simulationController.simulateDeviceReconnection.bind(simulationController));

/**
 * @swagger
 * /api/simulation/full-test:
 *   post:
 *     tags:
 *       - Simulación ESP32
 *     summary: Ejecutar batería completa de pruebas
 *     description: Ejecuta una simulación completa con múltiples eventos (botones + batería)
 *     responses:
 *       200:
 *         description: Simulación completa ejecutada correctamente
 *       400:
 *         description: WhatsApp no conectado
 */
router.post('/full-test', simulationController.runFullSimulation.bind(simulationController));

/**
 * @swagger
 * /api/simulation/quick-tests:
 *   get:
 *     tags:
 *       - Simulación ESP32
 *     summary: Obtener comandos curl para pruebas rápidas
 *     description: Devuelve comandos curl pre-construidos para probar rápidamente
 *     responses:
 *       200:
 *         description: Lista de comandos de prueba
 */
router.get('/quick-tests', (req, res) => {
    const baseUrl = `${req.protocol}://${req.get('host')}`;

    const commands = {
        "1_button_emotions": `curl -X POST ${baseUrl}/api/simulation/button-press -H "Content-Type: application/json" -d '{"button": 1, "category": 1, "childName": "Ana"}'`,
        "2_button_needs": `curl -X POST ${baseUrl}/api/simulation/button-press -H "Content-Type: application/json" -d '{"button": 2, "category": 2, "childName": "Luis"}'`,
        "3_battery_alert": `curl -X POST ${baseUrl}/api/simulation/battery-alert -H "Content-Type: application/json" -d '{"batteryLevel": 10}'`,
        "4_device_disconnect": `curl -X POST ${baseUrl}/api/simulation/device-disconnect`,
        "5_device_reconnect": `curl -X POST ${baseUrl}/api/simulation/device-reconnect`,
        "6_full_test": `curl -X POST ${baseUrl}/api/simulation/full-test`
    };

    res.json({
        success: true,
        message: 'Comandos de prueba para simulación',
        data: {
            instructions: "Copia y pega estos comandos en tu terminal para probar el sistema",
            commands,
            note: "Asegúrate de que WhatsApp esté conectado antes de ejecutar las pruebas"
        }
    });
});

export default router;
