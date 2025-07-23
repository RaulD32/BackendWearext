import { Router } from 'express';
import { runFullSeederController, runSpecificSeederController } from '../controllers/seederController.js';

const router = Router();

/**
 * @swagger
 * /api/seeder/run:
 *   post:
 *     tags:
 *       - Seeder
 *     summary: Ejecutar seeder completo del sistema (solo desarrollo)
 *     description: |
 *       Ejecuta el seeder completo que inicializa la base de datos con datos de ejemplo.
 *       Crea roles, usuarios de prueba, categorías predefinidas y relaciones tutor-niño.
 *       
 *       **⚠️ IMPORTANTE: Solo usar en desarrollo. No ejecutar en producción.**
 *       
 *       ## Datos que se crean:
 *       - **Roles**: administrador, tutor, niño
 *       - **Usuarios de prueba** con credenciales conocidas
 *       - **Categorías predefinidas** para organizar mensajes
 *       - **Relaciones tutor-niño** de ejemplo
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Seeder ejecutado exitosamente
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
 *                         seedsExecuted:
 *                           type: array
 *                           items:
 *                             type: string
 *                           example: ["roles", "users", "categories", "relations"]
 *                         defaultUsers:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               email:
 *                                 type: string
 *                                 example: "admin@wearext.com"
 *                               password:
 *                                 type: string
 *                                 example: "admin123"
 *                               role:
 *                                 type: string
 *                                 example: "administrador"
 *             example:
 *               success: true
 *               message: "Seeder ejecutado exitosamente"
 *               data:
 *                 seedsExecuted: ["roles", "users", "categories", "relations"]
 *                 defaultUsers:
 *                   - email: "admin@wearext.com"
 *                     password: "admin123"
 *                     role: "administrador"
 *                   - email: "maria.tutor@wearext.com"
 *                     password: "tutor123"
 *                     role: "tutor"
 *                   - email: "ana.nina@wearext.com"
 *                     password: "nina123"
 *                     role: "niño"
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Solo administradores pueden ejecutar el seeder
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
 *             example:
 *               success: false
 *               message: "Error al ejecutar el seeder"
 *               errors: ["Error de conexión a la base de datos"]
 */
router.post('/run', runFullSeederController);

/**
 * @swagger
 * /api/seeder/run/{type}:
 *   post:
 *     tags:
 *       - Seeder
 *     summary: Ejecutar seeder específico (solo desarrollo)
 *     description: |
 *       Ejecuta un seeder específico para inicializar solo un tipo de datos.
 *       Útil para actualizar datos específicos sin afectar el resto.
 *       
 *       **⚠️ IMPORTANTE: Solo usar en desarrollo.**
 *       
 *       ## Tipos disponibles:
 *       - **roles**: Crea roles básicos (administrador, tutor, niño)
 *       - **users**: Crea usuarios de prueba con credenciales conocidas
 *       - **categories**: Crea categorías predefinidas para mensajes
 *       - **relations**: Crea relaciones tutor-niño de ejemplo
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         description: Tipo de seeder a ejecutar
 *         schema:
 *           type: string
 *           enum: [roles, users, categories, relations]
 *           example: "users"
 *     responses:
 *       200:
 *         description: Seeder específico ejecutado exitosamente
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
 *                         seeded:
 *                           type: string
 *                           example: "users"
 *                         items:
 *                           oneOf:
 *                             - type: array
 *                               items:
 *                                 type: string
 *                             - type: string
 *             examples:
 *               users:
 *                 value:
 *                   success: true
 *                   message: "Usuarios sembrados exitosamente"
 *                   data:
 *                     seeded: "users"
 *                     items: ["admin@wearext.com", "maria.tutor@wearext.com", "ana.nina@wearext.com"]
 *               categories:
 *                 value:
 *                   success: true
 *                   message: "Categorías sembradas exitosamente"
 *                   data:
 *                     seeded: "categories"
 *                     items: ["Saludos", "Emociones", "Necesidades", "Familia"]
 *       400:
 *         description: Tipo de seeder no válido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Tipo de seeder no válido"
 *               errors: ["Tipos válidos: roles, users, categories, relations"]
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Solo administradores pueden ejecutar seeders
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
router.post('/run/:type', runSpecificSeederController);

export default router;
