import { Router } from 'express';
import { messageController } from '../controllers/messageController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { tutorOrAdmin, childOrTutorOrAdmin, adminOnly } from '../middlewares/roleMiddleware.js';
import { validate, validateParams, schemas, paramSchemas } from '../middlewares/validationMiddleware.js';

const router = Router();

/**
 * @swagger
 * /api/messages:
 *   get:
 *     tags:
 *       - Mensajes
 *     summary: Obtener lista de mensajes
 *     description: |
 *       Devuelve mensajes filtrados según el rol del usuario:
 *       - **Administradores**: Ven todos los mensajes del sistema
 *       - **Tutores**: Ven sus propios mensajes creados
 *       - **Niños**: Ven solo mensajes que les han sido asignados
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de mensajes obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Message'
 *       401:
 *         description: Token no válido o faltante
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
// Rutas para todos los usuarios autenticados
router.get('/', authMiddleware, messageController.getAllMessages);

/**
 * @swagger
 * /api/messages/my-messages:
 *   get:
 *     tags:
 *       - Mensajes
 *     summary: Obtener mensajes propios del usuario
 *     description: |
 *       Devuelve los mensajes específicos del usuario autenticado:
 *       - **Tutores**: Sus mensajes creados
 *       - **Niños**: Sus mensajes asignados
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Mensajes propios obtenidos exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Message'
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/my-messages', authMiddleware, messageController.getMyMessages);

/**
 * @swagger
 * /api/messages/{id}:
 *   get:
 *     tags:
 *       - Mensajes
 *     summary: Obtener mensaje específico por ID
 *     description: Devuelve un mensaje específico con toda su información incluido el audio
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID único del mensaje
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Mensaje obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Message'
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Mensaje no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:id',
    authMiddleware,
    childOrTutorOrAdmin,
    validateParams(paramSchemas.id),
    messageController.getMessageById
);

/**
 * @swagger
 * /api/messages/{id}/audio:
 *   get:
 *     tags:
 *       - Mensajes
 *     summary: Descargar archivo de audio del mensaje
 *     description: |
 *       Devuelve el archivo WAV generado por TTS para el mensaje especificado.
 *       Ideal para reproducción en aplicaciones móviles o web.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del mensaje del cual obtener el audio
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Archivo de audio WAV
 *         content:
 *           audio/wav:
 *             schema:
 *               type: string
 *               format: binary
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Mensaje o archivo de audio no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
// Ruta especial para obtener audio (accesible para todos los roles)
router.get('/:id/audio',
    authMiddleware,
    childOrTutorOrAdmin,
    validateParams(paramSchemas.id),
    messageController.getMessageAudio
);

/**
 * @swagger
 * /api/messages/category/{categoryId}:
 *   get:
 *     tags:
 *       - Mensajes
 *     summary: Obtener mensajes por categoría
 *     description: Filtra mensajes por una categoría específica (ej. Saludos, Emociones, Necesidades)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         description: ID de la categoría
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Mensajes de la categoría obtenidos exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Message'
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Categoría no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
// Rutas por categoría
router.get('/category/:categoryId',
    authMiddleware,
    childOrTutorOrAdmin,
    validateParams(paramSchemas.id),
    messageController.getMessagesByCategory
);

/**
 * @swagger
 * /api/messages:
 *   post:
 *     tags:
 *       - Mensajes
 *     summary: Crear nuevo mensaje con audio TTS automático
 *     description: |
 *       Crea un nuevo mensaje y genera automáticamente el archivo de audio usando TTS.
 *       El sistema selecciona inteligentemente una voz femenina en español para mejor comprensión infantil.
 *       Solo tutores y administradores pueden crear mensajes.
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
 *               - category_id
 *             properties:
 *               text:
 *                 type: string
 *                 description: Texto que se convertirá a audio mediante TTS
 *                 example: "Buenos días. ¿Cómo te sientes hoy?"
 *                 minLength: 1
 *                 maxLength: 500
 *               category_id:
 *                 type: integer
 *                 description: ID de la categoría para organizar el mensaje
 *                 example: 1
 *     responses:
 *       201:
 *         description: Mensaje creado exitosamente con audio TTS generado
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Message'
 *       400:
 *         description: Error de validación o categoría no existe
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Sin permisos de tutor o administrador
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error generando audio TTS o guardando mensaje
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
// Rutas para tutores y administradores (crear y actualizar)
router.post('/',
    authMiddleware,
    tutorOrAdmin,
    validate(schemas.createMessage),
    messageController.createMessage
);

/**
 * @swagger
 * /api/messages/{id}:
 *   put:
 *     tags:
 *       - Mensajes
 *     summary: Actualizar mensaje existente
 *     description: |
 *       Actualiza un mensaje existente. Si se cambia el texto, se regenera automáticamente el audio TTS.
 *       Solo el creador del mensaje o administradores pueden actualizar.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del mensaje a actualizar
 *         schema:
 *           type: integer
 *           example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               text:
 *                 type: string
 *                 description: Nuevo texto (regenerará audio automáticamente)
 *                 example: "Buenos días. Espero que tengas un día maravilloso"
 *               category_id:
 *                 type: integer
 *                 description: Nueva categoría del mensaje
 *                 example: 1
 *               is_active:
 *                 type: boolean
 *                 description: Estado activo del mensaje
 *                 example: true
 *     responses:
 *       200:
 *         description: Mensaje actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Message'
 *       400:
 *         description: Error de validación
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Sin permisos para actualizar este mensaje
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Mensaje no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put('/:id',
    authMiddleware,
    tutorOrAdmin,
    validateParams(paramSchemas.id),
    validate(schemas.updateMessage),
    messageController.updateMessage
);

/**
 * @swagger
 * /api/messages/{id}/regenerate-audio:
 *   post:
 *     tags:
 *       - Mensajes
 *     summary: Regenerar archivo de audio TTS
 *     description: |
 *       Regenera el archivo de audio para un mensaje existente usando la configuración TTS actual.
 *       Útil cuando se actualiza la configuración de voz o se necesita mejor calidad de audio.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del mensaje para regenerar audio
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Audio regenerado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Message'
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Mensaje no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error regenerando audio TTS
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
// Regenerar audio (tutores y admin)
router.post('/:id/regenerate-audio',
    authMiddleware,
    tutorOrAdmin,
    validateParams(paramSchemas.id),
    messageController.regenerateAudio
);

/**
 * @swagger
 * /api/messages/{id}:
 *   delete:
 *     tags:
 *       - Mensajes
 *     summary: Eliminar mensaje permanentemente
 *     description: |
 *       Elimina un mensaje del sistema incluyendo su archivo de audio y todas las asignaciones a niños.
 *       Solo el creador del mensaje o administradores pueden eliminar.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del mensaje a eliminar
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Mensaje eliminado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: true
 *               message: "Mensaje eliminado exitosamente"
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Sin permisos para eliminar este mensaje
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Mensaje no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
// Rutas de eliminación (solo admin o creador del mensaje)
router.delete('/:id',
    authMiddleware,
    tutorOrAdmin,
    validateParams(paramSchemas.id),
    messageController.deleteMessage
);

export default router;
