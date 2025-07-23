import { Router } from 'express';
import { createRoleController, getRolesController, deleteRoleController, updateRoleController } from '../controllers/roleController.js';

const router = Router();

/**
 * @swagger
 * /api/roles:
 *   get:
 *     tags:
 *       - Roles
 *     summary: Obtener todos los roles del sistema
 *     description: |
 *       Devuelve una lista completa de roles disponibles en el sistema.
 *       Incluye los roles predefinidos: administrador, tutor y niño.
 *       Útil para formularios de registro y gestión de usuarios.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de roles obtenida exitosamente
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
 *                         $ref: '#/components/schemas/Role'
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
router.get('/', getRolesController);

/**
 * @swagger
 * /api/roles:
 *   post:
 *     tags:
 *       - Roles
 *     summary: Crear nuevo rol del sistema (solo administradores)
 *     description: |
 *       Crea un nuevo rol personalizado en el sistema. Solo administradores pueden crear roles.
 *       Los roles básicos (administrador, tutor, niño) ya están predefinidos en el sistema.
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
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nombre único del rol
 *                 example: "terapista"
 *                 minLength: 2
 *                 maxLength: 50
 *               description:
 *                 type: string
 *                 description: Descripción detallada del rol y sus permisos
 *                 example: "Profesional especializado en terapia del habla con acceso completo a herramientas terapéuticas"
 *                 maxLength: 255
 *     responses:
 *       201:
 *         description: Rol creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Role'
 *       400:
 *         description: Error de validación o rol ya existe
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Error de validación"
 *               errors: ["El nombre del rol ya existe"]
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Solo administradores pueden crear roles
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/', createRoleController);

/**
 * @swagger
 * /api/roles/{id}:
 *   put:
 *     tags:
 *       - Roles
 *     summary: Actualizar rol existente (solo administradores)
 *     description: |
 *       Actualiza la información de un rol existente. Solo administradores pueden actualizar roles.
 *       Los roles básicos del sistema (ID 1, 2, 3) tienen restricciones de modificación.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del rol a actualizar
 *         schema:
 *           type: integer
 *           example: 4
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nuevo nombre del rol
 *                 example: "especialista"
 *               description:
 *                 type: string
 *                 description: Nueva descripción del rol
 *                 example: "Especialista en terapia del habla con permisos avanzados"
 *     responses:
 *       200:
 *         description: Rol actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Role'
 *       400:
 *         description: Error de validación o intento de modificar rol básico
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "No se pueden modificar los roles básicos del sistema"
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Solo administradores pueden actualizar roles
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Rol no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put('/:id', updateRoleController);

/**
 * @swagger
 * /api/roles/{id}:
 *   delete:
 *     tags:
 *       - Roles
 *     summary: Eliminar rol del sistema (solo administradores)
 *     description: |
 *       Elimina permanentemente un rol del sistema. Solo administradores pueden eliminar roles.
 *       Los roles básicos (administrador=1, tutor=2, niño=3) NO pueden eliminarse.
 *       ADVERTENCIA: Eliminar un rol afectará a todos los usuarios que lo tengan asignado.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del rol a eliminar (no puede ser 1, 2 o 3)
 *         schema:
 *           type: integer
 *           example: 4
 *     responses:
 *       200:
 *         description: Rol eliminado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: true
 *               message: "Rol eliminado exitosamente"
 *       400:
 *         description: Intento de eliminar rol básico del sistema
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "No se pueden eliminar los roles básicos del sistema (administrador, tutor, niño)"
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Solo administradores pueden eliminar roles
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Rol no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: No se puede eliminar rol que tiene usuarios asignados
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "No se puede eliminar el rol porque tiene usuarios asignados"
 */
router.delete('/:id', deleteRoleController);

export default router;


