import { Request, Response } from 'express';
import { webSocketService } from '../services/websocketService.js';
import { AuthRequest } from '../middlewares/authMiddleware.js';

export const playMessageOnESP32Controller = async (req: AuthRequest, res: Response) => {
    try {
        const { messageId } = req.params;
        const { childId } = req.body;

        if (!messageId || !childId) {
            return res.status(400).json({
                success: false,
                message: 'Parámetros requeridos faltantes',
                errors: ['messageId y childId son obligatorios']
            });
        }

        const success = await webSocketService.playMessageOnESP32(
            parseInt(messageId),
            parseInt(childId)
        );

        if (!success) {
            return res.status(404).json({
                success: false,
                message: 'No se pudo reproducir el mensaje',
                errors: ['ESP32 no conectado o mensaje no disponible']
            });
        }

        res.json({
            success: true,
            message: 'Mensaje enviado al ESP32 para reproducción',
            data: {
                messageId: parseInt(messageId),
                childId: parseInt(childId),
                sentAt: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('❌ Error en playMessageOnESP32Controller:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            errors: [error instanceof Error ? error.message : 'Error desconocido']
        });
    }
};

export const changeCategoryOnESP32Controller = async (req: AuthRequest, res: Response) => {
    try {
        const { categoryId } = req.params;

        if (!categoryId) {
            return res.status(400).json({
                success: false,
                message: 'categoryId es requerido',
                errors: ['Debe proporcionar un ID de categoría válido']
            });
        }

        const success = await webSocketService.changeCategoryOnESP32(parseInt(categoryId));

        if (!success) {
            return res.status(404).json({
                success: false,
                message: 'No se pudo cambiar la categoría',
                errors: ['ESP32 no conectado o categoría no válida']
            });
        }

        res.json({
            success: true,
            message: 'Categoría cambiada en ESP32 exitosamente',
            data: {
                categoryId: parseInt(categoryId),
                changedAt: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('❌ Error en changeCategoryOnESP32Controller:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            errors: [error instanceof Error ? error.message : 'Error desconocido']
        });
    }
};

export const getESP32StatusController = async (req: AuthRequest, res: Response) => {
    try {
        const esp32Status = webSocketService.getESP32Status();
        const connectionsInfo = webSocketService.getConnectionsInfo();

        res.json({
            success: true,
            message: 'Estado del ESP32 obtenido exitosamente',
            data: {
                esp32: esp32Status,
                connections: connectionsInfo,
                serverTime: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('❌ Error en getESP32StatusController:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            errors: [error instanceof Error ? error.message : 'Error desconocido']
        });
    }
};

export const requestBatteryStatusController = async (req: AuthRequest, res: Response) => {
    try {
        const success = await webSocketService.requestESP32BatteryStatus();

        if (!success) {
            return res.status(404).json({
                success: false,
                message: 'ESP32 no está conectado',
                errors: ['No se puede solicitar estado de batería: dispositivo no disponible']
            });
        }

        res.json({
            success: true,
            message: 'Solicitud de estado de batería enviada al ESP32',
            data: {
                requestedAt: new Date().toISOString(),
                note: 'El ESP32 enviará el estado de batería via WebSocket'
            }
        });

    } catch (error) {
        console.error('❌ Error en requestBatteryStatusController:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            errors: [error instanceof Error ? error.message : 'Error desconocido']
        });
    }
};

export const playCategorySequenceController = async (req: AuthRequest, res: Response) => {
    try {
        const { categoryId } = req.params;
        const { childId } = req.body;

        if (!categoryId || !childId) {
            return res.status(400).json({
                success: false,
                message: 'Parámetros requeridos faltantes',
                errors: ['categoryId y childId son obligatorios']
            });
        }

        const success = await webSocketService.playCategoryMessagesOnESP32(
            parseInt(categoryId),
            parseInt(childId)
        );

        if (!success) {
            return res.status(404).json({
                success: false,
                message: 'No se pudo reproducir la secuencia',
                errors: ['ESP32 no conectado o no hay mensajes disponibles']
            });
        }

        res.json({
            success: true,
            message: 'Secuencia de mensajes iniciada en ESP32',
            data: {
                categoryId: parseInt(categoryId),
                childId: parseInt(childId),
                startedAt: new Date().toISOString(),
                note: 'Los mensajes se reproducirán secuencialmente con 3 segundos de intervalo'
            }
        });

    } catch (error) {
        console.error('❌ Error en playCategorySequenceController:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            errors: [error instanceof Error ? error.message : 'Error desconocido']
        });
    }
};

export const syncFavoritesController = async (req: AuthRequest, res: Response) => {
    try {
        const { childId } = req.params;

        if (!childId) {
            return res.status(400).json({
                success: false,
                message: 'childId es requerido',
                errors: ['Debe proporcionar un ID de niño válido']
            });
        }

        const success = await webSocketService.syncFavoriteMessagesWithESP32(parseInt(childId));

        if (!success) {
            return res.status(404).json({
                success: false,
                message: 'No se pudieron sincronizar los favoritos',
                errors: ['ESP32 no conectado o error en la sincronización']
            });
        }

        res.json({
            success: true,
            message: 'Mensajes favoritos sincronizados con ESP32',
            data: {
                childId: parseInt(childId),
                syncedAt: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('❌ Error en syncFavoritesController:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            errors: [error instanceof Error ? error.message : 'Error desconocido']
        });
    }
};

export const shutdownESP32Controller = async (req: AuthRequest, res: Response) => {
    try {
        // Solo administradores pueden apagar el ESP32
        if (req.user?.role_id !== 1) {
            return res.status(403).json({
                success: false,
                message: 'Acceso denegado',
                errors: ['Solo administradores pueden apagar el ESP32']
            });
        }

        const success = await webSocketService.shutdownESP32();

        if (!success) {
            return res.status(404).json({
                success: false,
                message: 'ESP32 no está conectado',
                errors: ['No se puede enviar comando de apagado: dispositivo no disponible']
            });
        }

        res.json({
            success: true,
            message: 'Comando de apagado enviado al ESP32',
            data: {
                sentAt: new Date().toISOString(),
                sentBy: req.user?.email || 'Usuario desconocido'
            }
        });

    } catch (error) {
        console.error('❌ Error en shutdownESP32Controller:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            errors: [error instanceof Error ? error.message : 'Error desconocido']
        });
    }
};
