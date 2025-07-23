import { Router } from 'express';
import { categoryController } from '../controllers/categoryController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { tutorOrAdmin, adminOnly } from '../middlewares/roleMiddleware.js';
import { validate, validateParams, schemas, paramSchemas } from '../middlewares/validationMiddleware.js';

const router = Router();

/**
 * @swagger
 * /api/categories:
 *   get:
 *     tags:
 *       - Categorías
 *     summary: Obtener todas las categorías disponibles
 *     description: |
 *       Devuelve una lista completa de categorías para organizar mensajes temáticamente.
 *       Las categorías incluyen información de color e icono para interfaces visuales.
 *       Incluye categorías por defecto: Saludos, Emociones, Necesidades, Actividades.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de categorías obtenida exitosamente
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
 *                         $ref: '#/components/schemas/Category'
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
// Rutas públicas (requieren autenticación pero no rol específico)
router.get('/', authMiddleware, categoryController.getAllCategories);

/**
 * @swagger
 * /api/categories/basic:
 *   get:
 *     tags:
 *       - Categorías
 *     summary: Obtener información básica de categorías
 *     description: |
 *       Devuelve solo la información esencial de las categorías (id, nombre, color, icono)
 *       optimizada para interfaces móviles o cuando se necesita menos datos.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Información básica de categorías obtenida exitosamente
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
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 1
 *                           name:
 *                             type: string
 *                             example: "Saludos"
 *                           color:
 *                             type: string
 *                             example: "#4CAF50"
 *                           icon:
 *                             type: string
 *                             example: "waving-hand"
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/basic', authMiddleware, categoryController.getCategoriesBasic);

/**
 * @swagger
 * /api/categories/{id}:
 *   get:
 *     tags:
 *       - Categorías
 *     summary: Obtener categoría específica por ID
 *     description: Devuelve información detallada de una categoría específica
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID único de la categoría
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Categoría obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Category'
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
router.get('/:id',
    authMiddleware,
    validateParams(paramSchemas.id),
    categoryController.getCategoryById
);

/**
 * @swagger
 * /api/categories:
 *   post:
 *     tags:
 *       - Categorías
 *     summary: Crear nueva categoría de mensajes
 *     description: |
 *       Crea una nueva categoría para organizar mensajes temáticamente.
 *       Solo tutores y administradores pueden crear categorías.
 *       Incluye validación de colores hexadecimales e iconos válidos.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *               - color
 *               - icon
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nombre único de la categoría
 *                 example: "Actividades"
 *                 minLength: 2
 *                 maxLength: 50
 *               description:
 *                 type: string
 *                 description: Descripción detallada de la categoría
 *                 example: "Mensajes sobre actividades diarias y rutinas"
 *                 maxLength: 200
 *               color:
 *                 type: string
 *                 description: Color hexadecimal para la interfaz visual
 *                 example: "#FF5722"
 *                 pattern: "^#[0-9A-Fa-f]{6}$"
 *               icon:
 *                 type: string
 *                 description: Nombre del icono (compatible con librerías de iconos)
 *                 example: "activity"
 *                 maxLength: 30
 *     responses:
 *       201:
 *         description: Categoría creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Category'
 *       400:
 *         description: Error de validación
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Error de validación"
 *               errors: ["El nombre de la categoría ya existe", "El color debe ser hexadecimal válido"]
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
router.post('/',
    authMiddleware,
    tutorOrAdmin,
    validate(schemas.createCategory),
    categoryController.createCategory
);

/**
 * @swagger
 * /api/categories/{id}:
 *   put:
 *     tags:
 *       - Categorías
 *     summary: Actualizar categoría existente
 *     description: |
 *       Actualiza una categoría existente. Solo tutores y administradores pueden actualizar.
 *       Permite modificar nombre, descripción, color e icono de la categoría.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la categoría a actualizar
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
 *               name:
 *                 type: string
 *                 description: Nuevo nombre de la categoría
 *                 example: "Actividades Diarias"
 *               description:
 *                 type: string
 *                 description: Nueva descripción
 *                 example: "Mensajes relacionados con actividades y rutinas diarias del niño"
 *               color:
 *                 type: string
 *                 description: Nuevo color hexadecimal
 *                 example: "#FF6B35"
 *               icon:
 *                 type: string
 *                 description: Nuevo icono
 *                 example: "calendar"
 *               is_active:
 *                 type: boolean
 *                 description: Estado activo de la categoría
 *                 example: true
 *     responses:
 *       200:
 *         description: Categoría actualizada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Category'
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
 *         description: Sin permisos de tutor o administrador
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
router.put('/:id',
    authMiddleware,
    tutorOrAdmin,
    validateParams(paramSchemas.id),
    validate(schemas.updateCategory),
    categoryController.updateCategory
);

/**
 * @swagger
 * /api/categories/{id}:
 *   delete:
 *     tags:
 *       - Categorías
 *     summary: Eliminar categoría permanentemente
 *     description: |
 *       Elimina una categoría del sistema. Solo administradores pueden eliminar categorías.
 *       ADVERTENCIA: Al eliminar una categoría se eliminan también todos los mensajes asociados.
 *       Las categorías básicas del sistema (Saludos, Emociones, Necesidades) no pueden eliminarse.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la categoría a eliminar
 *         schema:
 *           type: integer
 *           example: 5
 *     responses:
 *       200:
 *         description: Categoría eliminada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: true
 *               message: "Categoría eliminada exitosamente"
 *       400:
 *         description: No se puede eliminar categoría básica del sistema
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "No se pueden eliminar las categorías básicas del sistema"
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Solo administradores pueden eliminar categorías
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
// Rutas solo para administradores
router.delete('/:id',
    authMiddleware,
    adminOnly,
    validateParams(paramSchemas.id),
    categoryController.deleteCategory
);

export default router;
