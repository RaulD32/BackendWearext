import { Request, Response } from 'express';
import { whatsAppService } from '../services/whatsappService.js';

class WhatsAppController {

    /**
     * Inicializar el servicio de WhatsApp
     */
    public async initializeWhatsApp(req: Request, res: Response): Promise<void> {
        try {
            const { tutorPhone } = req.body;

            if (!tutorPhone) {
                res.status(400).json({
                    success: false,
                    message: 'El número de teléfono del tutor es requerido'
                });
                return;
            }

            await whatsAppService.initialize(tutorPhone);

            res.status(200).json({
                success: true,
                message: 'Servicio de WhatsApp inicializado correctamente',
                data: {
                    tutorPhone: tutorPhone,
                    status: 'initializing'
                }
            });

        } catch (error: any) {
            console.error('❌ Error inicializando WhatsApp:', error);
            res.status(500).json({
                success: false,
                message: 'Error inicializando el servicio de WhatsApp',
                error: error.message
            });
        }
    }

    /**
     * Obtener el estado del servicio de WhatsApp
     */
    public async getWhatsAppStatus(req: Request, res: Response): Promise<void> {
        try {
            const isReady = whatsAppService.isClientReady();

            res.status(200).json({
                success: true,
                data: {
                    isReady: isReady,
                    status: isReady ? 'connected' : 'disconnected',
                    timestamp: new Date().toISOString()
                }
            });

        } catch (error: any) {
            console.error('❌ Error obteniendo estado de WhatsApp:', error);
            res.status(500).json({
                success: false,
                message: 'Error obteniendo el estado del servicio de WhatsApp',
                error: error.message
            });
        }
    }

    /**
     * Enviar mensaje de prueba
     */
    public async sendTestMessage(req: Request, res: Response): Promise<void> {
        try {
            if (!whatsAppService.isClientReady()) {
                res.status(400).json({
                    success: false,
                    message: 'El servicio de WhatsApp no está conectado. Escanea el código QR primero.'
                });
                return;
            }

            await whatsAppService.sendTestMessage();

            res.status(200).json({
                success: true,
                message: 'Mensaje de prueba enviado correctamente'
            });

        } catch (error: any) {
            console.error('❌ Error enviando mensaje de prueba:', error);
            res.status(500).json({
                success: false,
                message: 'Error enviando mensaje de prueba',
                error: error.message
            });
        }
    }

    /**
     * Configurar número de teléfono del tutor
     */
    public async setTutorPhone(req: Request, res: Response): Promise<void> {
        try {
            const { phone } = req.body;

            if (!phone) {
                res.status(400).json({
                    success: false,
                    message: 'El número de teléfono es requerido'
                });
                return;
            }

            whatsAppService.setTutorPhoneNumber(phone);

            res.status(200).json({
                success: true,
                message: 'Número de teléfono del tutor configurado correctamente',
                data: {
                    tutorPhone: phone
                }
            });

        } catch (error: any) {
            console.error('❌ Error configurando número de teléfono:', error);
            res.status(500).json({
                success: false,
                message: 'Error configurando el número de teléfono',
                error: error.message
            });
        }
    }

    /**
     * Desconectar el servicio de WhatsApp
     */
    public async disconnectWhatsApp(req: Request, res: Response): Promise<void> {
        try {
            await whatsAppService.disconnect();

            res.status(200).json({
                success: true,
                message: 'Servicio de WhatsApp desconectado correctamente'
            });

        } catch (error: any) {
            console.error('❌ Error desconectando WhatsApp:', error);
            res.status(500).json({
                success: false,
                message: 'Error desconectando el servicio de WhatsApp',
                error: error.message
            });
        }
    }

    /**
     * Enviar alerta manual de batería
     */
    public async sendBatteryAlert(req: Request, res: Response): Promise<void> {
        try {
            const { batteryLevel } = req.body;

            if (batteryLevel === undefined || batteryLevel < 0 || batteryLevel > 100) {
                res.status(400).json({
                    success: false,
                    message: 'Nivel de batería inválido (debe estar entre 0 y 100)'
                });
                return;
            }

            await whatsAppService.sendBatteryAlert(batteryLevel);

            res.status(200).json({
                success: true,
                message: 'Alerta de batería enviada correctamente'
            });

        } catch (error: any) {
            console.error('❌ Error enviando alerta de batería:', error);
            res.status(500).json({
                success: false,
                message: 'Error enviando alerta de batería',
                error: error.message
            });
        }
    }
}

export const whatsAppController = new WhatsAppController();
