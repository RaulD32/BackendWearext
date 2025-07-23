import { Request, Response } from 'express';
import { childMessageService } from '../services/childMessageService.js';
import { AuthRequest } from '../middlewares/authMiddleware.js';

export class ChildMessageController {

    async assignMessage(req: AuthRequest, res: Response) {
        try {
            const assignData = req.body;
            const assignedBy = req.user!.id;
            const userRole = req.user!.role_name;

            // Solo tutores y administradores pueden asignar mensajes
            if (userRole !== 'tutor' && userRole !== 'administrador') {
                return res.status(403).json({
                    success: false,
                    message: 'No tienes permisos para asignar mensajes'
                });
            }

            // Si es tutor, verificar que el niño esté relacionado con él
            if (userRole === 'tutor') {
                // Aquí deberías verificar la relación tutor-niño
                // Por ahora permitimos que cualquier tutor asigne a cualquier niño
            }

            const newAssignment = await childMessageService.assignMessageToChild(assignData, assignedBy);

            res.status(201).json({
                success: true,
                data: newAssignment,
                message: 'Mensaje asignado exitosamente'
            });
        } catch (error) {
            console.error('Error en ChildMessageController.assignMessage:', error);
            res.status(400).json({
                success: false,
                message: error instanceof Error ? error.message : 'Error al asignar mensaje'
            });
        }
    }

    async getMyMessages(req: AuthRequest, res: Response) {
        try {
            const childId = req.user!.id;
            const userRole = req.user!.role_name;

            if (userRole !== 'niño') {
                return res.status(403).json({
                    success: false,
                    message: 'Solo los niños pueden ver sus mensajes asignados'
                });
            }

            const messages = await childMessageService.getMessagesByChild(childId);

            res.json({
                success: true,
                data: messages,
                message: 'Mensajes obtenidos exitosamente'
            });
        } catch (error) {
            console.error('Error en ChildMessageController.getMyMessages:', error);
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Error interno del servidor'
            });
        }
    }

    async getChildMessages(req: AuthRequest, res: Response) {
        try {
            const { childId } = req.params;
            const userRole = req.user!.role_name;
            const userId = req.user!.id;

            // Solo administradores o tutores relacionados pueden ver mensajes de otros niños
            if (userRole === 'niño' && parseInt(childId) !== userId) {
                return res.status(403).json({
                    success: false,
                    message: 'No tienes permisos para ver mensajes de otros niños'
                });
            }

            const messages = await childMessageService.getMessagesByChild(parseInt(childId));

            res.json({
                success: true,
                data: messages,
                message: 'Mensajes del niño obtenidos exitosamente'
            });
        } catch (error) {
            console.error('Error en ChildMessageController.getChildMessages:', error);
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Error interno del servidor'
            });
        }
    }

    async updateChildMessage(req: AuthRequest, res: Response) {
        try {
            const { id } = req.params;
            const updateData = req.body;
            const userRole = req.user!.role_name;
            const userId = req.user!.id;

            // Obtener la asignación para verificar permisos
            const assignment = await childMessageService.getChildMessageById(parseInt(id));
            if (!assignment) {
                return res.status(404).json({
                    success: false,
                    message: 'Asignación no encontrada'
                });
            }

            // Verificar permisos: solo el niño puede actualizar sus propias asignaciones (favoritos)
            // O un administrador puede actualizar cualquiera
            if (userRole === 'niño') {
                // Para verificar si el niño es dueño del mensaje, usamos el servicio
                const allChildMessages = await childMessageService.getMessagesByChild(userId);
                const isOwner = allChildMessages.some(msg => msg.id === parseInt(id));

                if (!isOwner) {
                    return res.status(403).json({
                        success: false,
                        message: 'No tienes permisos para actualizar esta asignación'
                    });
                }
            } else if (userRole !== 'administrador') {
                return res.status(403).json({
                    success: false,
                    message: 'No tienes permisos para actualizar asignaciones'
                });
            }

            const updatedAssignment = await childMessageService.updateChildMessage(parseInt(id), updateData);

            res.json({
                success: true,
                data: updatedAssignment,
                message: 'Asignación actualizada exitosamente'
            });
        } catch (error) {
            console.error('Error en ChildMessageController.updateChildMessage:', error);
            res.status(400).json({
                success: false,
                message: error instanceof Error ? error.message : 'Error al actualizar asignación'
            });
        }
    }

    async removeMessage(req: AuthRequest, res: Response) {
        try {
            const { childId, messageId } = req.params;
            const userRole = req.user!.role_name;

            // Solo administradores y tutores pueden remover asignaciones
            if (userRole !== 'administrador' && userRole !== 'tutor') {
                return res.status(403).json({
                    success: false,
                    message: 'No tienes permisos para remover asignaciones'
                });
            }

            const removed = await childMessageService.removeMessageFromChild(
                parseInt(childId),
                parseInt(messageId)
            );

            if (!removed) {
                return res.status(404).json({
                    success: false,
                    message: 'Asignación no encontrada'
                });
            }

            res.json({
                success: true,
                message: 'Mensaje removido del niño exitosamente'
            });
        } catch (error) {
            console.error('Error en ChildMessageController.removeMessage:', error);
            res.status(400).json({
                success: false,
                message: error instanceof Error ? error.message : 'Error al remover mensaje'
            });
        }
    }

    async getFavorites(req: AuthRequest, res: Response) {
        try {
            const childId = req.user!.id;
            const userRole = req.user!.role_name;

            if (userRole !== 'niño') {
                return res.status(403).json({
                    success: false,
                    message: 'Solo los niños pueden ver sus favoritos'
                });
            }

            const favorites = await childMessageService.getFavoriteMessages(childId);

            res.json({
                success: true,
                data: favorites,
                message: 'Mensajes favoritos obtenidos exitosamente'
            });
        } catch (error) {
            console.error('Error en ChildMessageController.getFavorites:', error);
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Error interno del servidor'
            });
        }
    }

    async getMessagesByCategory(req: AuthRequest, res: Response) {
        try {
            const { categoryId } = req.params;
            const childId = req.user!.id;
            const userRole = req.user!.role_name;

            if (userRole !== 'niño') {
                return res.status(403).json({
                    success: false,
                    message: 'Solo los niños pueden ver sus mensajes por categoría'
                });
            }

            const messages = await childMessageService.getMessagesByCategory(
                childId,
                parseInt(categoryId)
            );

            res.json({
                success: true,
                data: messages,
                message: 'Mensajes de la categoría obtenidos exitosamente'
            });
        } catch (error) {
            console.error('Error en ChildMessageController.getMessagesByCategory:', error);
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Error interno del servidor'
            });
        }
    }
}

export const childMessageController = new ChildMessageController();
