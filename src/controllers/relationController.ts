import { Request, Response } from 'express';
import { relationService } from '../services/relationService.js';
import { AuthRequest } from '../middlewares/authMiddleware.js';

export class RelationController {

    async createRelation(req: AuthRequest, res: Response) {
        try {
            const relationData = req.body;
            const userRole = req.user!.role_name;
            const userId = req.user!.id;

            // Solo admin y tutores pueden crear relaciones
            if (userRole !== 'administrador' && userRole !== 'tutor') {
                return res.status(403).json({
                    success: false,
                    message: 'No tienes permisos para crear relaciones'
                });
            }

            // Si es tutor, solo puede vincularse a sí mismo
            if (userRole === 'tutor' && relationData.tutor_id !== userId) {
                return res.status(403).json({
                    success: false,
                    message: 'Solo puedes vincular niños a tu propia cuenta'
                });
            }

            const newRelation = await relationService.createRelation(relationData);

            res.status(201).json({
                success: true,
                data: newRelation,
                message: 'Relación creada exitosamente'
            });
        } catch (error) {
            console.error('Error en RelationController.createRelation:', error);
            res.status(400).json({
                success: false,
                message: error instanceof Error ? error.message : 'Error al crear relación'
            });
        }
    }

    async getMyChildren(req: AuthRequest, res: Response) {
        try {
            const tutorId = req.user!.id;
            const userRole = req.user!.role_name;

            if (userRole !== 'tutor' && userRole !== 'administrador') {
                return res.status(403).json({
                    success: false,
                    message: 'Solo tutores pueden ver sus niños'
                });
            }

            const children = await relationService.getChildrenByTutor(tutorId);

            res.json({
                success: true,
                data: children,
                message: 'Niños obtenidos exitosamente'
            });
        } catch (error) {
            console.error('Error en RelationController.getMyChildren:', error);
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Error interno del servidor'
            });
        }
    }

    async getMyTutors(req: AuthRequest, res: Response) {
        try {
            const childId = req.user!.id;
            const userRole = req.user!.role_name;

            if (userRole !== 'niño' && userRole !== 'administrador') {
                return res.status(403).json({
                    success: false,
                    message: 'Solo niños pueden ver sus tutores'
                });
            }

            const tutors = await relationService.getTutorsByChild(childId);

            res.json({
                success: true,
                data: tutors,
                message: 'Tutores obtenidos exitosamente'
            });
        } catch (error) {
            console.error('Error en RelationController.getMyTutors:', error);
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Error interno del servidor'
            });
        }
    }

    async getAllRelations(req: AuthRequest, res: Response) {
        try {
            const userRole = req.user!.role_name;

            if (userRole !== 'administrador') {
                return res.status(403).json({
                    success: false,
                    message: 'Solo administradores pueden ver todas las relaciones'
                });
            }

            const relations = await relationService.getAllRelations();

            res.json({
                success: true,
                data: relations,
                message: 'Relaciones obtenidas exitosamente'
            });
        } catch (error) {
            console.error('Error en RelationController.getAllRelations:', error);
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Error interno del servidor'
            });
        }
    }

    async deleteRelation(req: AuthRequest, res: Response) {
        try {
            const { tutorId, childId } = req.body;
            const userRole = req.user!.role_name;
            const userId = req.user!.id;

            // Verificar permisos
            if (userRole !== 'administrador' && userRole !== 'tutor') {
                return res.status(403).json({
                    success: false,
                    message: 'No tienes permisos para eliminar relaciones'
                });
            }

            // Si es tutor, solo puede eliminar sus propias relaciones
            if (userRole === 'tutor' && tutorId !== userId) {
                return res.status(403).json({
                    success: false,
                    message: 'Solo puedes eliminar tus propias relaciones'
                });
            }

            const deleted = await relationService.deleteRelation(tutorId, childId);

            if (!deleted) {
                return res.status(404).json({
                    success: false,
                    message: 'Relación no encontrada'
                });
            }

            res.json({
                success: true,
                message: 'Relación eliminada exitosamente'
            });
        } catch (error) {
            console.error('Error en RelationController.deleteRelation:', error);
            res.status(400).json({
                success: false,
                message: error instanceof Error ? error.message : 'Error al eliminar relación'
            });
        }
    }

    async deleteRelationById(req: AuthRequest, res: Response) {
        try {
            const { id } = req.params;
            const userRole = req.user!.role_name;
            const userId = req.user!.id;

            // Obtener información de la relación para verificar permisos
            const relation = await relationService.getRelationById(parseInt(id));
            if (!relation) {
                return res.status(404).json({
                    success: false,
                    message: 'Relación no encontrada'
                });
            }

            // Verificar permisos
            if (userRole !== 'administrador' && userRole !== 'tutor') {
                return res.status(403).json({
                    success: false,
                    message: 'No tienes permisos para eliminar relaciones'
                });
            }

            // Si es tutor, solo puede eliminar sus propias relaciones
            if (userRole === 'tutor' && relation.tutor.id !== userId) {
                return res.status(403).json({
                    success: false,
                    message: 'Solo puedes eliminar tus propias relaciones'
                });
            }

            const deleted = await relationService.deleteRelationById(parseInt(id));

            if (!deleted) {
                return res.status(404).json({
                    success: false,
                    message: 'Relación no encontrada'
                });
            }

            res.json({
                success: true,
                message: 'Relación eliminada exitosamente'
            });
        } catch (error) {
            console.error('Error en RelationController.deleteRelationById:', error);
            res.status(400).json({
                success: false,
                message: error instanceof Error ? error.message : 'Error al eliminar relación'
            });
        }
    }

    async checkRelation(req: Request, res: Response) {
        try {
            const { tutorId, childId } = req.params;
            const exists = await relationService.checkRelationExists(parseInt(tutorId), parseInt(childId));

            res.json({
                success: true,
                data: { exists },
                message: exists ? 'La relación existe' : 'La relación no existe'
            });
        } catch (error) {
            console.error('Error en RelationController.checkRelation:', error);
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Error interno del servidor'
            });
        }
    }

    async getRelationStats(req: AuthRequest, res: Response) {
        try {
            const userRole = req.user!.role_name;

            if (userRole !== 'administrador') {
                return res.status(403).json({
                    success: false,
                    message: 'Solo administradores pueden ver las estadísticas'
                });
            }

            const stats = await relationService.getRelationStats();

            res.json({
                success: true,
                data: stats,
                message: 'Estadísticas obtenidas exitosamente'
            });
        } catch (error) {
            console.error('Error en RelationController.getRelationStats:', error);
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Error interno del servidor'
            });
        }
    }

    async linkChild(req: AuthRequest, res: Response) {
        try {
            const { childId } = req.body;
            const tutorId = req.user!.id;
            const userRole = req.user!.role_name;

            if (userRole !== 'tutor' && userRole !== 'administrador') {
                return res.status(403).json({
                    success: false,
                    message: 'Solo tutores pueden vincular niños'
                });
            }

            const relationData = { tutor_id: tutorId, child_id: childId };
            const newRelation = await relationService.createRelation(relationData);

            res.status(201).json({
                success: true,
                data: newRelation,
                message: 'Niño vinculado exitosamente'
            });
        } catch (error) {
            console.error('Error en RelationController.linkChild:', error);
            res.status(400).json({
                success: false,
                message: error instanceof Error ? error.message : 'Error al vincular niño'
            });
        }
    }

    async unlinkChild(req: AuthRequest, res: Response) {
        try {
            const { childId } = req.body;
            const tutorId = req.user!.id;
            const userRole = req.user!.role_name;

            if (userRole !== 'tutor' && userRole !== 'administrador') {
                return res.status(403).json({
                    success: false,
                    message: 'Solo tutores pueden desvincular niños'
                });
            }

            const deleted = await relationService.deleteRelation(tutorId, childId);

            if (!deleted) {
                return res.status(404).json({
                    success: false,
                    message: 'Relación no encontrada'
                });
            }

            res.json({
                success: true,
                message: 'Niño desvinculado exitosamente'
            });
        } catch (error) {
            console.error('Error en RelationController.unlinkChild:', error);
            res.status(400).json({
                success: false,
                message: error instanceof Error ? error.message : 'Error al desvincular niño'
            });
        }
    }

    async getChildStats(req: AuthRequest, res: Response) {
        try {
            const { childId } = req.params;
            const userRole = req.user!.role_name;
            const userId = req.user!.id;

            // Solo admin o tutor relacionado pueden ver estadísticas de un niño
            if (userRole !== 'administrador') {
                if (userRole !== 'tutor') {
                    return res.status(403).json({
                        success: false,
                        message: 'No tienes permisos para ver estadísticas de niños'
                    });
                }

                // Verificar que el tutor tiene relación con el niño
                const hasRelation = await relationService.checkRelationExists(userId, parseInt(childId));
                if (!hasRelation) {
                    return res.status(403).json({
                        success: false,
                        message: 'No tienes una relación con este niño'
                    });
                }
            }

            const stats = await relationService.getChildStats(parseInt(childId));

            res.json({
                success: true,
                data: stats,
                message: 'Estadísticas obtenidas exitosamente'
            });
        } catch (error) {
            console.error('Error en RelationController.getChildStats:', error);
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Error interno del servidor'
            });
        }
    }
}

export const relationController = new RelationController();
