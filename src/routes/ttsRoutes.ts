import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import {
    getAvailableVoices,
    updateVoiceSettings,
    generateTestAudio
} from '../controllers/ttsController.js';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

/**
 * @swagger
 * /api/tts/voices:
 *   get:
 *     tags:
 *       - Configuración TTS
 *     summary: Obtener voces disponibles en el sistema
 *     description: |
 *       Devuelve una lista de todas las voces TTS instaladas en el sistema Windows,
 *       junto con la configuración actual. El sistema prioriza automáticamente
 *       voces femeninas en español para mejor comprensión infantil.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de voces y configuración obtenida exitosamente
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
 *                         availableVoices:
 *                           type: array
 *                           items:
 *                             type: string
 *                           description: Lista de voces disponibles en el sistema
 *                           example: [
 *                             "Microsoft Sabina Desktop - Spanish (Mexico)",
 *                             "Microsoft Helena Desktop - Spanish (Spain)",
 *                             "Microsoft David Desktop - English (United States)"
 *                           ]
 *                         currentSettings:
 *                           $ref: '#/components/schemas/TTSSettings'
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error obteniendo voces del sistema
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
// Obtener voces disponibles en el sistema
router.get('/voices', getAvailableVoices);

/**
 * @swagger
 * /api/tts/settings:
 *   post:
 *     tags:
 *       - Configuración TTS
 *     summary: Actualizar configuración de voz TTS
 *     description: |
 *       Permite configurar las preferencias del sistema TTS incluyendo:
 *       - Género preferido de voz (femenino recomendado para niños)
 *       - Idioma preferido (español por defecto)
 *       - Velocidad de habla (ajustable para comprensión)
 *       - Volumen de salida
 *       
 *       La configuración se aplica a todos los nuevos audios generados.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TTSSettings'
 *           examples:
 *             optimal_for_children:
 *               summary: Configuración óptima para niños
 *               value:
 *                 preferredGender: "female"
 *                 preferredLanguage: "es"
 *                 speed: -3
 *                 volume: 85
 *             faster_speech:
 *               summary: Habla más rápida
 *               value:
 *                 preferredGender: "female"
 *                 preferredLanguage: "es"
 *                 speed: 0
 *                 volume: 80
 *     responses:
 *       200:
 *         description: Configuración actualizada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/TTSSettings'
 *       400:
 *         description: Error de validación en la configuración
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Error de validación"
 *               errors: ["La velocidad debe estar entre -10 y 10"]
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error aplicando configuración TTS
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
// Configurar preferencias de voz
router.post('/settings', updateVoiceSettings);

/**
 * @swagger
 * /api/tts/test:
 *   post:
 *     tags:
 *       - Configuración TTS
 *     summary: Generar audio de prueba con configuración actual
 *     description: |
 *       Genera un archivo de audio de prueba usando la configuración TTS actual.
 *       Útil para probar diferentes configuraciones de voz antes de aplicarlas
 *       a mensajes reales. Devuelve directamente el archivo WAV generado.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - text
 *             properties:
 *               text:
 *                 type: string
 *                 description: Texto para generar audio de prueba
 *                 example: "Esta es una prueba de la nueva configuración de voz"
 *                 minLength: 1
 *                 maxLength: 200
 *           examples:
 *             greeting_test:
 *               summary: Prueba de saludo
 *               value:
 *                 text: "Hola, soy tu nueva voz. ¿Te gusta cómo sueno?"
 *             emotion_test:
 *               summary: Prueba de emoción
 *               value:
 *                 text: "Estoy muy feliz de poder ayudarte a comunicarte mejor"
 *             speed_test:
 *               summary: Prueba de velocidad
 *               value:
 *                 text: "Esta frase te ayudará a escuchar si la velocidad es adecuada para ti"
 *     responses:
 *       200:
 *         description: Audio de prueba generado exitosamente
 *         content:
 *           audio/wav:
 *             schema:
 *               type: string
 *               format: binary
 *               description: Archivo WAV con el audio de prueba
 *       400:
 *         description: Error de validación en el texto
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "El texto es requerido y no puede estar vacío"
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error generando audio de prueba
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Error al generar audio: No se pudo crear el archivo de audio"
 */
// Generar audio de prueba
router.post('/test', generateTestAudio);

export default router;
