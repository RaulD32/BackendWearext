import { Request, Response } from 'express';
import { messageService } from '../services/messageService.js';
import { AuthRequest } from '../middlewares/authMiddleware.js';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class MessageController {

    async getAllMessages(req: AuthRequest, res: Response) {
        try {
            const userId = req.user?.id;
            const userRole = req.user?.role_id;

            const messages = await messageService.getAllMessages(userId, userRole);

            res.json({
                success: true,
                data: messages,
                message: 'Mensajes obtenidos exitosamente'
            });
        } catch (error) {
            console.error('Error en MessageController.getAllMessages:', error);
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Error interno del servidor'
            });
        }
    }

    async getMessageById(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const message = await messageService.getMessageById(parseInt(id));

            if (!message) {
                return res.status(404).json({
                    success: false,
                    message: 'Mensaje no encontrado'
                });
            }

            res.json({
                success: true,
                data: message,
                message: 'Mensaje obtenido exitosamente'
            });
        } catch (error) {
            console.error('Error en MessageController.getMessageById:', error);
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Error interno del servidor'
            });
        }
    }

    async createMessage(req: AuthRequest, res: Response) {
        try {
            const messageData = req.body;
            const createdBy = req.user!.id;

            const newMessage = await messageService.createMessage(messageData, createdBy);

            res.status(201).json({
                success: true,
                data: newMessage,
                message: 'Mensaje creado exitosamente con audio TTS'
            });
        } catch (error) {
            console.error('Error en MessageController.createMessage:', error);
            res.status(400).json({
                success: false,
                message: error instanceof Error ? error.message : 'Error al crear mensaje'
            });
        }
    }

    async updateMessage(req: AuthRequest, res: Response) {
        try {
            const { id } = req.params;
            const updateData = req.body;
            const userId = req.user!.id;
            const userRole = req.user!.role_name;

            // Verificar permisos: solo el creador, tutores relacionados o admin pueden actualizar
            const message = await messageService.getMessageById(parseInt(id));
            if (!message) {
                return res.status(404).json({
                    success: false,
                    message: 'Mensaje no encontrado'
                });
            }

            // Solo admin o el creador pueden actualizar
            if (userRole !== 'administrador' && message.created_by !== userId) {
                return res.status(403).json({
                    success: false,
                    message: 'No tienes permisos para actualizar este mensaje'
                });
            }

            const updatedMessage = await messageService.updateMessage(parseInt(id), updateData);

            if (!updatedMessage) {
                return res.status(404).json({
                    success: false,
                    message: 'Mensaje no encontrado'
                });
            }

            res.json({
                success: true,
                data: updatedMessage,
                message: 'Mensaje actualizado exitosamente'
            });
        } catch (error) {
            console.error('Error en MessageController.updateMessage:', error);
            res.status(400).json({
                success: false,
                message: error instanceof Error ? error.message : 'Error al actualizar mensaje'
            });
        }
    }

    async deleteMessage(req: AuthRequest, res: Response) {
        try {
            const { id } = req.params;
            const userId = req.user!.id;
            const userRole = req.user!.role_name;

            // Verificar permisos
            const message = await messageService.getMessageById(parseInt(id));
            if (!message) {
                return res.status(404).json({
                    success: false,
                    message: 'Mensaje no encontrado'
                });
            }

            // Solo admin puede eliminar cualquier mensaje, tutores solo los suyos
            if (userRole !== 'administrador' && message.created_by !== userId) {
                return res.status(403).json({
                    success: false,
                    message: 'No tienes permisos para eliminar este mensaje'
                });
            }

            const deleted = await messageService.deleteMessage(parseInt(id));

            if (!deleted) {
                return res.status(404).json({
                    success: false,
                    message: 'Mensaje no encontrado'
                });
            }

            res.json({
                success: true,
                message: 'Mensaje eliminado exitosamente'
            });
        } catch (error) {
            console.error('Error en MessageController.deleteMessage:', error);
            res.status(400).json({
                success: false,
                message: error instanceof Error ? error.message : 'Error al eliminar mensaje'
            });
        }
    }

    async getMessagesByCategory(req: Request, res: Response) {
        try {
            const { categoryId } = req.params;
            const messages = await messageService.getMessagesByCategory(parseInt(categoryId));

            res.json({
                success: true,
                data: messages,
                message: 'Mensajes de categoría obtenidos exitosamente'
            });
        } catch (error) {
            console.error('Error en MessageController.getMessagesByCategory:', error);
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Error interno del servidor'
            });
        }
    }

    async getMyMessages(req: AuthRequest, res: Response) {
        try {
            const userId = req.user!.id;
            const messages = await messageService.getMessagesByUser(userId);

            res.json({
                success: true,
                data: messages,
                message: 'Mis mensajes obtenidos exitosamente'
            });
        } catch (error) {
            console.error('Error en MessageController.getMyMessages:', error);
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Error interno del servidor'
            });
        }
    }

    async regenerateAudio(req: AuthRequest, res: Response) {
        try {
            const { id } = req.params;
            const userId = req.user!.id;
            const userRole = req.user!.role_name;

            // Verificar permisos
            const message = await messageService.getMessageById(parseInt(id));
            if (!message) {
                return res.status(404).json({
                    success: false,
                    message: 'Mensaje no encontrado'
                });
            }

            if (userRole !== 'administrador' && message.created_by !== userId) {
                return res.status(403).json({
                    success: false,
                    message: 'No tienes permisos para regenerar el audio de este mensaje'
                });
            }

            const updatedMessage = await messageService.regenerateMessageAudio(parseInt(id));

            if (!updatedMessage) {
                return res.status(404).json({
                    success: false,
                    message: 'Mensaje no encontrado'
                });
            }

            res.json({
                success: true,
                data: updatedMessage,
                message: 'Audio regenerado exitosamente'
            });
        } catch (error) {
            console.error('Error en MessageController.regenerateAudio:', error);
            res.status(400).json({
                success: false,
                message: error instanceof Error ? error.message : 'Error al regenerar audio'
            });
        }
    }

    async getMessageAudio(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const message = await messageService.getMessageById(parseInt(id));

            if (!message) {
                return res.status(404).json({
                    success: false,
                    message: 'Mensaje no encontrado'
                });
            }

            if (!message.audio_url) {
                return res.status(404).json({
                    success: false,
                    message: 'Audio no disponible para este mensaje'
                });
            }

            // Construir ruta del archivo de audio
            const filename = message.audio_url.split('/').pop();
            if (!filename) {
                return res.status(404).json({
                    success: false,
                    message: 'Archivo de audio no válido'
                });
            }

            const audioPath = path.join(__dirname, '../../uploads/audio', filename);

            try {
                await fs.access(audioPath);
            } catch {
                return res.status(404).json({
                    success: false,
                    message: 'Archivo de audio no encontrado'
                });
            }

            // Configurar headers para audio
            res.setHeader('Content-Type', 'audio/mpeg');
            res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
            res.setHeader('Accept-Ranges', 'bytes');

            // Enviar archivo
            res.sendFile(audioPath);
        } catch (error) {
            console.error('Error en MessageController.getMessageAudio:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener archivo de audio'
            });
        }
    }
}

export const messageController = new MessageController();
