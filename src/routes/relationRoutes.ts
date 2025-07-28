import { Router } from 'express';
import { relationController } from '../controllers/relationController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { tutorOrAdmin, adminOnly, childOrTutorOrAdmin } from '../middlewares/roleMiddleware.js';
import { validate, validateParams, schemas, paramSchemas } from '../middlewares/validationMiddleware.js';

const router = Router();

/**
 * @swagger
 * /api/relations/my-children:
 *   get:
 *     tags:
 *       - Relaciones
 *     summary: Obtener niños asignados al tutor
 *     description: |
 *       Devuelve la lista de niños que están bajo el cuidado del tutor autenticado.
 *       Solo accesible para usuarios con rol de tutor o administrador.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de niños asignados obtenida exitosamente
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
 *                         $ref: '#/components/schemas/Relation'
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
// Rutas para obtener relaciones según el rol
router.get('/my-children', authMiddleware, tutorOrAdmin, relationController.getMyChildren);

/**
 * @swagger
 * /api/relations/my-tutors:
 *   get:
 *     tags:
 *       - Relaciones
 *     summary: Obtener tutores asignados al niño
 *     description: |
 *       Devuelve la lista de tutores que están a cargo del niño autenticado.
 *       Accesible para niños, tutores y administradores.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de tutores asignados obtenida exitosamente
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
 *                         $ref: '#/components/schemas/Relation'
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/my-tutors', authMiddleware, childOrTutorOrAdmin, relationController.getMyTutors);

/**
 * @swagger
 * /api/relations:
 *   get:
 *     tags:
 *       - Relaciones
 *     summary: Obtener todas las relaciones del sistema (solo administradores)
 *     description: |
 *       Devuelve una lista completa de todas las relaciones tutor-niño en el sistema.
 *       Solo accesible para administradores para supervisión general.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista completa de relaciones obtenida exitosamente
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
 *                         $ref: '#/components/schemas/Relation'
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Sin permisos de administrador
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
// Rutas para administradores
router.get('/', authMiddleware, adminOnly, relationController.getAllRelations);

/**
 * @swagger
 * /api/relations/stats:
 *   get:
 *     tags:
 *       - Relaciones
 *     summary: Obtener estadísticas de relaciones (solo administradores)
 *     description: |
 *       Devuelve estadísticas útiles sobre las relaciones en el sistema como:
 *       total de relaciones, tutores activos, niños registrados, promedio de niños por tutor.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estadísticas obtenidas exitosamente
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
 *                         totalRelations:
 *                           type: integer
 *                           description: Total de relaciones activas
 *                           example: 25
 *                         totalTutors:
 *                           type: integer
 *                           description: Total de tutores con niños asignados
 *                           example: 8
 *                         totalChildren:
 *                           type: integer
 *                           description: Total de niños con tutores asignados
 *                           example: 20
 *                         avgChildrenPerTutor:
 *                           type: number
 *                           description: Promedio de niños por tutor
 *                           example: 3.12
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Sin permisos de administrador
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/stats', authMiddleware, adminOnly, relationController.getRelationStats);

/**
 * @swagger
 * /api/relations:
 *   post:
 *     tags:
 *       - Relaciones
 *     summary: Crear nueva relación tutor-niño
 *     description: |
 *       Establece una nueva relación entre un tutor y un niño. 
 *       Valida que ambos usuarios existan y tengan los roles correctos.
 *       Los tutores pueden crear relaciones con niños, los administradores pueden crear cualquier relación.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tutor_id
 *               - child_id
 *             properties:
 *               tutor_id:
 *                 type: integer
 *                 description: ID del usuario tutor (debe tener role_id = 2)
 *                 example: 2
 *               child_id:
 *                 type: integer
 *                 description: ID del usuario niño (debe tener role_id = 3)
 *                 example: 3
 *     responses:
 *       201:
 *         description: Relación creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Relation'
 *       400:
 *         description: Error de validación o relación ya existe
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               relation_exists:
 *                 summary: Relación ya existe
 *                 value:
 *                   success: false
 *                   message: "La relación ya existe entre este tutor y niño"
 *               invalid_role:
 *                 summary: Rol inválido
 *                 value:
 *                   success: false
 *                   message: "El usuario especificado no es un tutor válido"
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
// Crear y eliminar relaciones
router.post('/',
    authMiddleware,
    tutorOrAdmin,
    validate(schemas.createRelation),
    relationController.createRelation
);

/**
 * @swagger
 * /api/relations/{id}:
 *   delete:
 *     tags:
 *       - Relaciones
 *     summary: Eliminar relación por ID
 *     description: |
 *       Elimina una relación tutor-niño específica usando su ID único.
 *       También elimina todos los mensajes asignados por ese tutor a ese niño.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID único de la relación a eliminar
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Relación eliminada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: true
 *               message: "Relación eliminada exitosamente"
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Sin permisos para eliminar esta relación
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Relación no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete('/:id',
    authMiddleware,
    tutorOrAdmin,
    validateParams(paramSchemas.id),
    relationController.deleteRelationById
);

/**
 * @swagger
 * /api/relations:
 *   delete:
 *     tags:
 *       - Relaciones
 *     summary: Eliminar relación por IDs de tutor y niño
 *     description: |
 *       Elimina una relación específica proporcionando los IDs del tutor y niño.
 *       Alternativa al endpoint de eliminación por ID de relación.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tutor_id
 *               - child_id
 *             properties:
 *               tutor_id:
 *                 type: integer
 *                 description: ID del tutor en la relación
 *                 example: 2
 *               child_id:
 *                 type: integer
 *                 description: ID del niño en la relación
 *                 example: 3
 *     responses:
 *       200:
 *         description: Relación eliminada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
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
 *       404:
 *         description: Relación no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete('/',
    authMiddleware,
    tutorOrAdmin,
    validate(schemas.createRelation), // Usa el mismo schema para validar tutor_id y child_id
    relationController.deleteRelation
);

// Rutas de conveniencia para tutores
router.post('/link',
    authMiddleware,
    tutorOrAdmin,
    relationController.linkChild
);

router.post('/unlink',
    authMiddleware,
    tutorOrAdmin,
    relationController.unlinkChild
);

// Verificar si existe una relación
router.get('/check/:tutorId/:childId',
    authMiddleware,
    adminOnly,
    relationController.checkRelation
);

// Obtener estadísticas de un niño específico
router.get('/child/:childId/stats',
    authMiddleware,
    tutorOrAdmin,
    validateParams(paramSchemas.childId),
    relationController.getChildStats
);

export default router;
