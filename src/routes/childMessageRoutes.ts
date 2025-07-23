import { Router } from 'express';
import { childMessageController } from '../controllers/childMessageController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { tutorOrAdmin, childOnly, childOrTutorOrAdmin } from '../middlewares/roleMiddleware.js';
import { validate, validateParams, schemas, paramSchemas } from '../middlewares/validationMiddleware.js';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

/**
 * @swagger
 * /api/child-messages/my-messages:
 *   get:
 *     tags:
 *       - Asignación de Mensajes
 *     summary: Obtener mensajes asignados al niño autenticado
 *     description: |
 *       Devuelve todos los mensajes que han sido específicamente asignados al niño que está autenticado.
 *       Solo accesible para usuarios con rol de niño. Incluye información completa del mensaje,
 *       categoría, estado de favorito y quién lo asignó.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de mensajes asignados obtenida exitosamente
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
 *                         $ref: '#/components/schemas/ChildMessage'
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Solo accesible para niños
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
// Rutas para niños
router.get('/my-messages', childOnly, childMessageController.getMyMessages);

/**
 * @swagger
 * /api/child-messages/favorites:
 *   get:
 *     tags:
 *       - Asignación de Mensajes
 *     summary: Obtener mensajes favoritos del niño
 *     description: |
 *       Devuelve únicamente los mensajes que el niño ha marcado como favoritos.
 *       Útil para acceso rápido a los mensajes más utilizados por el niño.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de mensajes favoritos obtenida exitosamente
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
 *                         allOf:
 *                           - $ref: '#/components/schemas/ChildMessage'
 *                           - type: object
 *                             properties:
 *                               is_favorite:
 *                                 type: boolean
 *                                 example: true
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Solo accesible para niños
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/favorites', childOnly, childMessageController.getFavorites);

/**
 * @swagger
 * /api/child-messages/category/{categoryId}:
 *   get:
 *     tags:
 *       - Asignación de Mensajes
 *     summary: Obtener mensajes asignados por categoría
 *     description: |
 *       Filtra los mensajes asignados al niño por una categoría específica.
 *       Útil para organizar la interfaz por temas (saludos, emociones, necesidades, etc.)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         description: ID de la categoría a filtrar
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
 *                         $ref: '#/components/schemas/ChildMessage'
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Solo accesible para niños
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
router.get('/category/:categoryId',
    childOnly,
    validateParams(paramSchemas.id),
    childMessageController.getMessagesByCategory
);

/**
 * @swagger
 * /api/child-messages/assign:
 *   post:
 *     tags:
 *       - Asignación de Mensajes
 *     summary: Asignar mensaje específico a un niño
 *     description: |
 *       Crea una asignación entre un mensaje existente y un niño específico.
 *       Solo tutores y administradores pueden asignar mensajes. Valida que:
 *       - El mensaje existe y está activo
 *       - El niño existe y tiene rol correcto
 *       - La asignación no existe previamente
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - child_id
 *               - message_id
 *             properties:
 *               child_id:
 *                 type: integer
 *                 description: ID del niño al que se asignará el mensaje
 *                 example: 3
 *               message_id:
 *                 type: integer
 *                 description: ID del mensaje a asignar
 *                 example: 1
 *     responses:
 *       201:
 *         description: Mensaje asignado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/ChildMessage'
 *       400:
 *         description: Error de validación o asignación duplicada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               duplicate_assignment:
 *                 summary: Asignación duplicada
 *                 value:
 *                   success: false
 *                   message: "El mensaje ya está asignado a este niño"
 *               invalid_message:
 *                 summary: Mensaje inválido
 *                 value:
 *                   success: false
 *                   message: "El mensaje no existe o no está activo"
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
 */
// Rutas para tutores y administradores
router.post('/assign',
    tutorOrAdmin,
    validate(schemas.assignMessage),
    childMessageController.assignMessage
);

/**
 * @swagger
 * /api/child-messages/child/{childId}:
 *   get:
 *     tags:
 *       - Asignación de Mensajes
 *     summary: Obtener mensajes de un niño específico
 *     description: |
 *       Permite a tutores y administradores ver todos los mensajes asignados a un niño específico.
 *       Útil para monitoreo y gestión del contenido asignado.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: childId
 *         required: true
 *         description: ID del niño del cual obtener los mensajes
 *         schema:
 *           type: integer
 *           example: 3
 *     responses:
 *       200:
 *         description: Mensajes del niño obtenidos exitosamente
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
 *                         $ref: '#/components/schemas/ChildMessage'
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Sin permisos para ver mensajes de este niño
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Niño no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/child/:childId',
    childOrTutorOrAdmin,
    validateParams(paramSchemas.id),
    childMessageController.getChildMessages
);

/**
 * @swagger
 * /api/child-messages/child/{childId}/message/{messageId}:
 *   delete:
 *     tags:
 *       - Asignación de Mensajes
 *     summary: Remover asignación específica de mensaje a niño
 *     description: |
 *       Elimina la asignación de un mensaje específico a un niño específico.
 *       Solo tutores y administradores pueden remover asignaciones.
 *       El mensaje no se elimina, solo la relación con el niño.
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
 *       - in: path
 *         name: messageId
 *         required: true
 *         description: ID del mensaje a remover
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Asignación removida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: true
 *               message: "Asignación removida exitosamente"
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
 *       404:
 *         description: Asignación no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete('/child/:childId/message/:messageId',
    tutorOrAdmin,
    childMessageController.removeMessage
);

/**
 * @swagger
 * /api/child-messages/{id}:
 *   put:
 *     tags:
 *       - Asignación de Mensajes
 *     summary: Actualizar asignación de mensaje (marcar/desmarcar favorito)
 *     description: |
 *       Permite actualizar propiedades de una asignación específica, principalmente
 *       para marcar o desmarcar mensajes como favoritos. Los niños pueden actualizar
 *       sus propias asignaciones, tutores y administradores pueden actualizar cualquiera.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID único de la asignación a actualizar
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
 *               is_favorite:
 *                 type: boolean
 *                 description: Marcar o desmarcar como favorito
 *                 example: true
 *     responses:
 *       200:
 *         description: Asignación actualizada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/ChildMessage'
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
 *         description: Sin permisos para actualizar esta asignación
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Asignación no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
// Actualizar asignación (principalmente para favoritos)
router.put('/:id',
    childOrTutorOrAdmin,
    validateParams(paramSchemas.id),
    validate(schemas.updateChildMessage),
    childMessageController.updateChildMessage
);

export default router;
