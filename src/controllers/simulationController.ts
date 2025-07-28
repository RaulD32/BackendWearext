import { Request, Response } from 'express';
import { whatsAppService } from '../services/whatsappService.js';

class SimulationController {

    /**
     * Simular presión de botón del ESP32
     */
    public async simulateButtonPress(req: Request, res: Response): Promise<void> {
        try {
            const { button, category, childName } = req.body;

            // Validaciones
            if (!button || button < 1 || button > 10) {
                res.status(400).json({
                    success: false,
                    message: 'Botón debe estar entre 1 y 10'
                });
                return;
            }

            if (!category) {
                res.status(400).json({
                    success: false,
                    message: 'Categoría es requerida (puede ser número 1-3 o string "Básico", "Emociones", "Necesidades")'
                });
                return;
            }

            // Validar categoría
            let validCategory = false;
            if (typeof category === 'number') {
                validCategory = category >= 1 && category <= 3;
            } else if (typeof category === 'string') {
                validCategory = ['Básico', 'Emociones', 'Necesidades'].includes(category);
            }

            if (!validCategory) {
                res.status(400).json({
                    success: false,
                    message: 'Categoría debe ser 1-3 (número) o "Básico", "Emociones", "Necesidades" (string)'
                });
                return;
            }

            // Crear notificación simulada
            const notification = {
                button: parseInt(button),
                category: typeof category === 'string' ? category : parseInt(category),
                timestamp: Date.now(),
                childName: childName || 'Simulación de Prueba'
            };

            console.log('');
            console.log('🎯 SIMULACIÓN DE BOTÓN ESP32:');
            console.log('═'.repeat(50));
            console.log(`📱 Botón: ${notification.button}`);
            console.log(`📂 Categoría: ${notification.category}`);
            console.log(`👶 Niño: ${notification.childName}`);
            console.log(`🕐 Timestamp: ${new Date(notification.timestamp).toLocaleString()}`);
            console.log('═'.repeat(50));

            // Verificar si WhatsApp está listo
            if (!whatsAppService.isClientReady()) {
                res.status(400).json({
                    success: false,
                    message: 'WhatsApp no está conectado. Inicia WhatsApp primero.',
                    data: {
                        whatsappReady: false,
                        simulation: notification
                    }
                });
                return;
            }

            // Enviar notificación de WhatsApp
            await whatsAppService.sendButtonPressNotification(notification);

            res.status(200).json({
                success: true,
                message: 'Simulación de botón ejecutada correctamente',
                data: {
                    notification,
                    whatsappReady: true,
                    timestamp: new Date().toISOString()
                }
            });

        } catch (error: any) {
            console.error('❌ Error en simulación de botón:', error);
            res.status(500).json({
                success: false,
                message: 'Error ejecutando simulación de botón',
                error: error.message
            });
        }
    }

    /**
     * Simular alerta de batería baja
     */
    public async simulateBatteryAlert(req: Request, res: Response): Promise<void> {
        try {
            const { batteryLevel } = req.body;

            const level = parseInt(batteryLevel) || 15;

            console.log('');
            console.log('🔋 SIMULACIÓN DE BATERÍA BAJA:');
            console.log('═'.repeat(50));
            console.log(`🔋 Nivel: ${level}%`);
            console.log('═'.repeat(50));

            if (!whatsAppService.isClientReady()) {
                res.status(400).json({
                    success: false,
                    message: 'WhatsApp no está conectado. Inicia WhatsApp primero.',
                    data: {
                        whatsappReady: false,
                        batteryLevel: level
                    }
                });
                return;
            }

            await whatsAppService.sendBatteryAlert(level);

            res.status(200).json({
                success: true,
                message: 'Simulación de batería ejecutada correctamente',
                data: {
                    batteryLevel: level,
                    whatsappReady: true,
                    timestamp: new Date().toISOString()
                }
            });

        } catch (error: any) {
            console.error('❌ Error en simulación de batería:', error);
            res.status(500).json({
                success: false,
                message: 'Error ejecutando simulación de batería',
                error: error.message
            });
        }
    }

    /**
     * Simular desconexión del dispositivo
     */
    public async simulateDeviceDisconnection(req: Request, res: Response): Promise<void> {
        try {
            console.log('');
            console.log('🔌 SIMULACIÓN DE DESCONEXIÓN:');
            console.log('═'.repeat(50));
            console.log('📱 Dispositivo ESP32 desconectado');
            console.log('═'.repeat(50));

            if (!whatsAppService.isClientReady()) {
                res.status(400).json({
                    success: false,
                    message: 'WhatsApp no está conectado. Inicia WhatsApp primero.',
                    data: {
                        whatsappReady: false
                    }
                });
                return;
            }

            await whatsAppService.sendDisconnectionAlert();

            res.status(200).json({
                success: true,
                message: 'Simulación de desconexión ejecutada correctamente',
                data: {
                    whatsappReady: true,
                    timestamp: new Date().toISOString()
                }
            });

        } catch (error: any) {
            console.error('❌ Error en simulación de desconexión:', error);
            res.status(500).json({
                success: false,
                message: 'Error ejecutando simulación de desconexión',
                error: error.message
            });
        }
    }

    /**
     * Simular reconexión del dispositivo
     */
    public async simulateDeviceReconnection(req: Request, res: Response): Promise<void> {
        try {
            console.log('');
            console.log('✅ SIMULACIÓN DE RECONEXIÓN:');
            console.log('═'.repeat(50));
            console.log('📱 Dispositivo ESP32 reconectado');
            console.log('═'.repeat(50));

            if (!whatsAppService.isClientReady()) {
                res.status(400).json({
                    success: false,
                    message: 'WhatsApp no está conectado. Inicia WhatsApp primero.',
                    data: {
                        whatsappReady: false
                    }
                });
                return;
            }

            await whatsAppService.sendReconnectionAlert();

            res.status(200).json({
                success: true,
                message: 'Simulación de reconexión ejecutada correctamente',
                data: {
                    whatsappReady: true,
                    timestamp: new Date().toISOString()
                }
            });

        } catch (error: any) {
            console.error('❌ Error en simulación de reconexión:', error);
            res.status(500).json({
                success: false,
                message: 'Error ejecutando simulación de reconexión',
                error: error.message
            });
        }
    }

    /**
     * Ejecutar batería de pruebas completa
     */
    public async runFullSimulation(req: Request, res: Response): Promise<void> {
        try {
            console.log('');
            console.log('🚀 INICIANDO SIMULACIÓN COMPLETA:');
            console.log('═'.repeat(60));

            if (!whatsAppService.isClientReady()) {
                res.status(400).json({
                    success: false,
                    message: 'WhatsApp no está conectado. Inicia WhatsApp primero.'
                });
                return;
            }

            const results = [];

            // 1. Simular varios botones presionados con nuevas categorías
            const buttons = [
                { button: 1, category: 'Básico', childName: 'Ana' },
                { button: 3, category: 'Emociones', childName: 'Luis' },
                { button: 5, category: 'Necesidades', childName: 'María' },
                { button: 2, category: 1, childName: 'Diego' }, // Categoría numérica
                { button: 4, category: 2, childName: 'Sofía' }  // Categoría numérica
            ];

            for (const btnData of buttons) {
                console.log(`📱 Enviando simulación botón ${btnData.button}...`);
                await whatsAppService.sendButtonPressNotification({
                    ...btnData,
                    timestamp: Date.now()
                });
                results.push(`Botón ${btnData.button} - Categoría ${btnData.category}`);

                // Esperar 2 segundos entre mensajes
                await new Promise(resolve => setTimeout(resolve, 2000));
            }

            // 2. Simular alerta de batería
            console.log('🔋 Enviando alerta de batería...');
            await whatsAppService.sendBatteryAlert(15);
            results.push('Alerta de batería 15%');

            console.log('✅ SIMULACIÓN COMPLETA FINALIZADA');
            console.log('═'.repeat(60));

            res.status(200).json({
                success: true,
                message: 'Simulación completa ejecutada correctamente',
                data: {
                    testsExecuted: results,
                    totalTests: results.length,
                    timestamp: new Date().toISOString()
                }
            });

        } catch (error: any) {
            console.error('❌ Error en simulación completa:', error);
            res.status(500).json({
                success: false,
                message: 'Error ejecutando simulación completa',
                error: error.message
            });
        }
    }

    /**
     * Simular cambio de estado del sistema ESP32
     */
    public async simulateSystemStateChange(req: Request, res: Response): Promise<void> {
        try {
            const { previousState, currentState } = req.body;

            console.log('');
            console.log('🔄 SIMULACIÓN DE CAMBIO DE ESTADO:');
            console.log('═'.repeat(50));
            console.log(`📊 Estado anterior: ${previousState || 'IDLE'}`);
            console.log(`📊 Estado actual: ${currentState || 'ACTIVE'}`);
            console.log('═'.repeat(50));

            res.status(200).json({
                success: true,
                message: 'Simulación de cambio de estado ejecutada',
                data: {
                    previousState: previousState || 'IDLE',
                    currentState: currentState || 'ACTIVE',
                    timestamp: new Date().toISOString()
                }
            });

        } catch (error: any) {
            console.error('❌ Error en simulación de cambio de estado:', error);
            res.status(500).json({
                success: false,
                message: 'Error ejecutando simulación de cambio de estado',
                error: error.message
            });
        }
    }

    /**
     * Simular despertar del ESP32
     */
    public async simulateWakeUp(req: Request, res: Response): Promise<void> {
        try {
            const { wakeReason } = req.body;

            console.log('');
            console.log('🌅 SIMULACIÓN DE DESPERTAR ESP32:');
            console.log('═'.repeat(50));
            console.log(`🔍 Razón: ${wakeReason || 'button_press'}`);
            console.log('═'.repeat(50));

            if (whatsAppService.isClientReady()) {
                await whatsAppService.sendReconnectionAlert();
                console.log('✅ Notificación de reconexión enviada por WhatsApp');
            }

            res.status(200).json({
                success: true,
                message: 'Simulación de despertar ejecutada correctamente',
                data: {
                    wakeReason: wakeReason || 'button_press',
                    whatsappNotification: whatsAppService.isClientReady(),
                    timestamp: new Date().toISOString()
                }
            });

        } catch (error: any) {
            console.error('❌ Error en simulación de despertar:', error);
            res.status(500).json({
                success: false,
                message: 'Error ejecutando simulación de despertar',
                error: error.message
            });
        }
    }

    /**
     * Simular entrada en modo sueño del ESP32
     */
    public async simulateGoToSleep(req: Request, res: Response): Promise<void> {
        try {
            const { sleepReason, duration } = req.body;

            console.log('');
            console.log('😴 SIMULACIÓN DE MODO SUEÑO ESP32:');
            console.log('═'.repeat(50));
            console.log(`🔍 Razón: ${sleepReason || 'inactivity'}`);
            console.log(`⏱️ Duración: ${duration || 'indefinida'}`);
            console.log('═'.repeat(50));

            res.status(200).json({
                success: true,
                message: 'Simulación de modo sueño ejecutada correctamente',
                data: {
                    sleepReason: sleepReason || 'inactivity',
                    duration: duration || null,
                    timestamp: new Date().toISOString()
                }
            });

        } catch (error: any) {
            console.error('❌ Error en simulación de modo sueño:', error);
            res.status(500).json({
                success: false,
                message: 'Error ejecutando simulación de modo sueño',
                error: error.message
            });
        }
    }

    /**
     * Simular mensaje de log del ESP32
     */
    public async simulateLogMessage(req: Request, res: Response): Promise<void> {
        try {
            const { logLevel, message, functionName, lineNumber } = req.body;

            console.log('');
            console.log('📋 SIMULACIÓN DE LOG ESP32:');
            console.log('═'.repeat(50));
            console.log(`📊 Nivel: ${logLevel || 'INFO'}`);
            console.log(`💬 Mensaje: ${message || 'Mensaje de prueba'}`);
            if (functionName) console.log(`📍 Función: ${functionName}:${lineNumber || 0}`);
            console.log('═'.repeat(50));

            res.status(200).json({
                success: true,
                message: 'Simulación de log ejecutada correctamente',
                data: {
                    logLevel: logLevel || 'INFO',
                    message: message || 'Mensaje de prueba',
                    functionName: functionName || null,
                    lineNumber: lineNumber || null,
                    timestamp: new Date().toISOString()
                }
            });

        } catch (error: any) {
            console.error('❌ Error en simulación de log:', error);
            res.status(500).json({
                success: false,
                message: 'Error ejecutando simulación de log',
                error: error.message
            });
        }
    }

    /**
     * Simular comando de cambio de categoría desde móvil
     */
    public async simulateCategoryCommand(req: Request, res: Response): Promise<void> {
        try {
            const { category } = req.body;

            console.log('');
            console.log('📁 SIMULACIÓN DE COMANDO CAMBIO CATEGORÍA:');
            console.log('═'.repeat(50));
            console.log(`📊 Nueva categoría: ${category || 2}`);
            console.log('═'.repeat(50));

            // Simular que el comando fue enviado y el ESP32 responde
            setTimeout(() => {
                console.log('📁 ESP32 simulado confirmó cambio de categoría');
            }, 1000);

            res.status(200).json({
                success: true,
                message: 'Simulación de comando de categoría ejecutada',
                data: {
                    category: category || 2,
                    command: 'change_category',
                    timestamp: new Date().toISOString()
                }
            });

        } catch (error: any) {
            console.error('❌ Error en simulación de comando de categoría:', error);
            res.status(500).json({
                success: false,
                message: 'Error ejecutando simulación de comando de categoría',
                error: error.message
            });
        }
    }

    /**
     * Simular comando de apagado desde móvil
     */
    public async simulateShutdownCommand(req: Request, res: Response): Promise<void> {
        try {
            console.log('');
            console.log('😴 SIMULACIÓN DE COMANDO APAGADO:');
            console.log('═'.repeat(50));
            console.log('📱 Comando de apagado enviado desde móvil');
            console.log('═'.repeat(50));

            if (whatsAppService.isClientReady()) {
                // Simular notificación de apagado
                console.log('📤 Enviando notificación de apagado por WhatsApp...');
            }

            res.status(200).json({
                success: true,
                message: 'Simulación de comando de apagado ejecutada',
                data: {
                    command: 'shutdown',
                    whatsappNotification: whatsAppService.isClientReady(),
                    timestamp: new Date().toISOString()
                }
            });

        } catch (error: any) {
            console.error('❌ Error en simulación de comando de apagado:', error);
            res.status(500).json({
                success: false,
                message: 'Error ejecutando simulación de comando de apagado',
                error: error.message
            });
        }
    }
}

export const simulationController = new SimulationController();
