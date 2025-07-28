import { WebSocket, WebSocketServer } from 'ws';
import { IncomingMessage } from 'http';
import { parse } from 'url';
import { whatsAppService } from '../services/whatsappService.js';

interface ClientInfo {
    id: string;
    type: 'esp32' | 'mobile' | 'unknown';
    deviceName?: string;
    connectedAt: Date;
    lastHeartbeat: Date;
    batteryLevel?: number;
    currentCategory?: number | string;
    isOnline: boolean;
}

interface WSMessage {
    type: string;
    command?: string;
    button?: number;
    category?: number | string;
    device?: string;
    bootCount?: number;
    battery?: number;
    voltage?: number;
    percentage?: number;
    charging?: boolean;
    timestamp?: number;
    data?: any;
    clientId?: string;
    connected?: boolean;
    esp32_connected?: boolean;
    mobile_clients?: number;
    esp32_battery?: number;
    esp32_category?: number | string;
    server_time?: string;
    message?: string;

    // Nuevos campos para ESP32 avanzado
    log_level?: string;
    log_message?: string;
    system_state?: string;
    previous_state?: string;
    current_state?: string;
    wake_reason?: string;
    sleep_reason?: string;
    error_code?: string;
    function_name?: string;
    line_number?: number;
    sleep_duration?: number;

    [key: string]: any; // Para propiedades adicionales
}

class WebSocketController {
    private wss: WebSocketServer;
    private clients: Map<WebSocket, ClientInfo> = new Map();
    private esp32Client: WebSocket | null = null;
    private mobileClients: Set<WebSocket> = new Set();

    constructor() {
        const wsPort = process.env.WS_PORT || 8080;
        const wsHost = process.env.WS_HOST || '0.0.0.0';

        this.wss = new WebSocketServer({
            port: Number(wsPort),
            host: wsHost,
            path: '/ws'
        });

        this.wss.on('connection', (ws: WebSocket, req: IncomingMessage) => {
            this.handleConnection(ws, req);
        });

        console.log(`🔌 WebSocket server iniciado en ${wsHost}:${wsPort}/ws`);

        // Cleanup de clientes desconectados cada 30 segundos
        setInterval(() => {
            this.cleanupDisconnectedClients();
        }, 30000);
    }

    private handleConnection(ws: WebSocket, req: IncomingMessage): void {
        const clientId = this.generateClientId();
        const clientInfo: ClientInfo = {
            id: clientId,
            type: 'unknown',
            connectedAt: new Date(),
            lastHeartbeat: new Date(),
            isOnline: true
        };

        this.clients.set(ws, clientInfo);

        console.log(`🔗 Cliente conectado: ${clientId} desde ${req.socket.remoteAddress}`);

        ws.on('message', (data: Buffer) => {
            try {
                const message: WSMessage = JSON.parse(data.toString());
                this.handleMessage(ws, message);
            } catch (error) {
                console.error('❌ Error parsing WebSocket message:', error);
                this.sendError(ws, 'Invalid JSON format');
            }
        });

        ws.on('close', () => {
            this.handleDisconnection(ws);
        });

        ws.on('error', (error) => {
            console.error(`❌ WebSocket error for client ${clientId}:`, error);
        });

        // Enviar mensaje de bienvenida
        this.sendMessage(ws, {
            type: 'welcome',
            clientId: clientId,
            timestamp: Date.now()
        });
    }

    private handleMessage(ws: WebSocket, message: WSMessage): void {
        const clientInfo = this.clients.get(ws);
        if (!clientInfo) return;

        // Actualizar último heartbeat
        clientInfo.lastHeartbeat = new Date();

        console.log(`📨 Mensaje recibido de ${clientInfo.id}:`, message);

        switch (message.type) {
            case 'connection':
                this.handleDeviceIdentification(ws, message);
                break;

            case 'heartbeat':
                this.handleHeartbeat(ws, message);
                break;

            case 'button_pressed':
                this.handleButtonPress(ws, message);
                break;

            case 'battery_status':
                this.handleBatteryStatus(ws, message);
                break;

            case 'mobile_command':
                this.handleMobileCommand(ws, message);
                break;

            // Comandos directos del frontend (sin mobile_command wrapper)
            case 'change_category':
                this.handleMobileCommand(ws, { ...message, command: 'change_category' });
                break;

            case 'play_audio':
                this.handleMobileCommand(ws, { ...message, command: 'play_audio' });
                break;

            case 'play_message':
                this.handlePlayMessage(ws, message);
                break;

            case 'shutdown':
                this.handleMobileCommand(ws, { ...message, command: 'shutdown' });
                break;

            case 'battery':
                this.handleMobileCommand(ws, { ...message, command: 'battery' });
                break;

            case 'get_status':
                this.handleGetStatus(ws);
                break;

            case 'status':
                // Estado inicial del ESP32 - manejar igual que device_identification
                this.handleStatusMessage(ws, message);
                break;

            // Nuevos tipos de mensajes del ESP32
            case 'log':
                this.handleLogMessage(ws, message);
                break;

            case 'system_state_changed':
                this.handleSystemStateChanged(ws, message);
                break;

            case 'category_changed':
                this.handleCategoryChanged(ws, message);
                break;

            case 'wake_up':
                this.handleWakeUp(ws, message);
                break;

            case 'wakeup':
                // Comando de encendido desde móvil - enviarlo al ESP32
                this.handleMobileCommand(ws, { ...message, command: 'wakeup' });
                break;

            case 'going_to_sleep':
                this.handleGoingToSleep(ws, message);
                break;

            case 'error':
                this.handleErrorMessage(ws, message);
                break;

            case 'configure_buttons':
                this.handleConfigureButtons(ws, message);
                break;

            default:
                console.log(`⚠️ Tipo de mensaje desconocido: ${message.type}`);
        }
    }

    private handleDeviceIdentification(ws: WebSocket, message: WSMessage): void {
        const clientInfo = this.clients.get(ws);
        if (!clientInfo) return;

        if (message.device === 'TalkingChildren') {
            // Es el ESP32
            const wasDisconnected = this.esp32Client === null;

            clientInfo.type = 'esp32';
            clientInfo.deviceName = 'TalkingChildren ESP32';
            clientInfo.batteryLevel = message.battery;
            clientInfo.currentCategory = message.category;
            this.esp32Client = ws;

            console.log(`🤖 ESP32 identificado - Boot: ${message.bootCount}, Batería: ${message.battery}%, Categoría: ${message.category}`);

            // Enviar notificación adecuada por WhatsApp
            if (wasDisconnected) {
                // Si estaba desconectado, enviar notificación de reconexión
                whatsAppService.sendReconnectionAlert().catch((error: any) => {
                    console.error('❌ Error enviando alerta de reconexión por WhatsApp:', error);
                });
            } else if (message.bootCount === 1) {
                // Si es boot #1, es un encendido inicial
                this.sendWhatsAppNotification('device_powered_on').catch((error: any) => {
                    console.error('❌ Error enviando notificación de encendido por WhatsApp:', error);
                });
            }

            // Notificar a clientes móviles sobre la conexión del ESP32
            this.broadcastToMobile({
                type: 'esp32_connected',
                device: 'TalkingChildren',
                battery: message.battery,
                category: message.category,
                bootCount: message.bootCount
            });
        } else {
            // Es un cliente móvil
            clientInfo.type = 'mobile';
            clientInfo.deviceName = message.device || 'Mobile App';
            this.mobileClients.add(ws);

            console.log(`📱 Cliente móvil identificado: ${clientInfo.deviceName}`);

            // Enviar estado actual del ESP32 si está conectado
            if (this.esp32Client && this.clients.get(this.esp32Client)) {
                const esp32Info = this.clients.get(this.esp32Client);
                this.sendMessage(ws, {
                    type: 'esp32_status',
                    connected: true,
                    battery: esp32Info?.batteryLevel,
                    category: esp32Info?.currentCategory
                });
            } else {
                this.sendMessage(ws, {
                    type: 'esp32_status',
                    connected: false
                });
            }
        }
    }

    private handleStatusMessage(ws: WebSocket, message: WSMessage): void {
        const clientInfo = this.clients.get(ws);
        if (!clientInfo) return;

        // El ESP32 está enviando su estado inicial - tratarlo como identificación
        const wasDisconnected = this.esp32Client === null;

        clientInfo.type = 'esp32';
        clientInfo.deviceName = 'TalkingChildren ESP32';
        clientInfo.batteryLevel = message.battery;
        clientInfo.currentCategory = message.category;
        this.esp32Client = ws;

        console.log(`✅ ESP32 estado recibido - Boot: ${message.boot_count}, Batería: ${message.battery}%, Categoría: ${message.category}`);

        // Enviar notificación por WhatsApp solo si es reconexión
        if (wasDisconnected) {
            whatsAppService.sendReconnectionAlert().catch((error: any) => {
                console.error('❌ Error enviando alerta de reconexión por WhatsApp:', error);
            });
        }

        // Notificar a clientes móviles sobre el estado del ESP32
        this.broadcastToMobile({
            type: 'esp32_status',
            system_on: message.system_on,
            battery: message.battery,
            category: message.category,
            slot_group: message.slot_group,
            wifi_rssi: message.wifi_rssi,
            boot_count: message.boot_count,
            max_categories: message.max_categories,
            total_messages: message.total_messages
        });
    }

    private handleHeartbeat(ws: WebSocket, message: WSMessage): void {
        const clientInfo = this.clients.get(ws);
        if (!clientInfo) return;

        if (message.battery !== undefined) {
            clientInfo.batteryLevel = message.battery;
        }

        // Responder heartbeat
        this.sendMessage(ws, {
            type: 'heartbeat_ack',
            timestamp: Date.now()
        });
    }

    private handleButtonPress(ws: WebSocket, message: WSMessage): void {
        console.log(`🔘 Botón presionado en ESP32 - Botón: ${message.button}, Categoría: ${message.category}`);

        // Enviar notificación de WhatsApp al tutor
        if (message.button && message.category) {
            whatsAppService.sendButtonPressNotification({
                button: message.button,
                category: message.category,
                timestamp: message.timestamp || Date.now(),
                childName: 'Mi hijo/a' // Puedes obtener esto de la base de datos si es necesario
            }).catch(error => {
                console.error('❌ Error enviando notificación de WhatsApp:', error);
            });
        }

        // Notificar a todos los clientes móviles
        this.broadcastToMobile({
            type: 'button_pressed',
            button: message.button,
            category: message.category,
            timestamp: message.timestamp
        });
    }

    private handleBatteryStatus(ws: WebSocket, message: WSMessage): void {
        const clientInfo = this.clients.get(ws);
        if (!clientInfo) return;

        clientInfo.batteryLevel = message.percentage;

        console.log(`🔋 Estado batería ESP32 - ${message.percentage}% (${message.voltage}V) ${message.charging ? 'Cargando' : ''}`);

        // Enviar alerta de batería baja por WhatsApp si es necesario
        if (message.percentage !== undefined && message.percentage <= 20) {
            whatsAppService.sendBatteryAlert(message.percentage).catch(error => {
                console.error('❌ Error enviando alerta de batería por WhatsApp:', error);
            });
        }

        // Notificar a clientes móviles
        this.broadcastToMobile({
            type: 'battery_update',
            voltage: message.voltage,
            percentage: message.percentage,
            charging: message.charging
        });
    }

    private handlePlayMessage(ws: WebSocket, message: WSMessage): void {
        console.log(`🎵 Comando reproducir mensaje - ID: ${message.messageId}`);

        // Reenviar comando al ESP32 con formato correcto
        if (this.esp32Client) {
            this.sendMessage(this.esp32Client, {
                type: 'play_message',
                messageId: message.messageId
            });
            console.log(`📡 Comando play_message reenviado al ESP32 - ID: ${message.messageId}`);
        } else {
            console.log('⚠️ ESP32 no conectado, no se puede reproducir mensaje');
        }

        // Notificar a clientes móviles
        this.broadcastToMobile({
            type: 'message_played_from_app',
            messageId: message.messageId,
            timestamp: Date.now()
        });
    }

    private handleConfigureButtons(ws: WebSocket, message: WSMessage): void {
        console.log(`⚙️ Configuración de botones - Categoría: ${message.category}, Botones: ${JSON.stringify(message.buttons)}`);

        // Reenviar configuración al ESP32 si está disponible
        if (this.esp32Client) {
            this.sendMessage(this.esp32Client, {
                type: 'configure_buttons',
                category: message.category,
                buttons: message.buttons
            });
            console.log(`📡 Configuración de botones reenviada al ESP32`);
        } else {
            console.log('⚠️ ESP32 no conectado, no se puede configurar botones');
        }

        // Notificar a otros clientes móviles
        this.broadcastToMobile({
            type: 'buttons_configured',
            category: message.category,
            buttons: message.buttons,
            timestamp: Date.now()
        });
    }

    private handleMobileCommand(ws: WebSocket, message: WSMessage): void {
        if (!this.esp32Client) {
            this.sendError(ws, 'ESP32 no conectado');
            return;
        }

        const command = message.command || message.type;
        console.log(`📱➡️🤖 Comando desde móvil a ESP32: ${command}`, message);

        switch (command) {
            case 'shutdown':
            case 'sleep':
                console.log(`😴 Enviando comando de apagado al ESP32`);
                this.sendMessage(this.esp32Client, {
                    type: 'command',
                    command: 'shutdown',
                    sleep_duration: message.sleep_duration
                });

                // Notificar por WhatsApp
                this.sendWhatsAppNotification('shutdown').catch((error: any) => {
                    console.error('❌ Error enviando notificación de apagado por WhatsApp:', error);
                });
                break;

            case 'wakeup':
            case 'wake':
                console.log(`🌅 Enviando comando de despertar al ESP32`);
                this.sendMessage(this.esp32Client, {
                    type: 'command',
                    command: 'wakeup'
                });
                break;

            case 'change_category':
                const category = message.category || 1;
                console.log(`📁 Cambiar categoría a: ${category}`);

                this.sendMessage(this.esp32Client, {
                    type: 'command',
                    command: 'category',
                    category: category
                });

                // Actualizar info del cliente ESP32
                const esp32Info = this.clients.get(this.esp32Client);
                if (esp32Info) {
                    esp32Info.currentCategory = category;
                }

                // Notificar por WhatsApp
                this.sendWhatsAppNotification('category_change', { category }).catch((error: any) => {
                    console.error('❌ Error enviando notificación de cambio de categoría por WhatsApp:', error);
                });
                break;

            case 'play_audio':
            case 'play':
                const button = message.button || 1;
                console.log(`🔊 Comando reproducir audio - Botón: ${button}`);

                this.sendMessage(this.esp32Client, {
                    type: 'command',
                    command: 'play',
                    button: button
                });
                break;

            case 'battery':
                console.log(`🔋 Solicitar estado de batería`);

                this.sendMessage(this.esp32Client, {
                    type: 'command',
                    command: 'battery'
                });
                break;

            default:
                // Comando genérico
                console.log(`🤖 Enviando comando genérico: ${command}`);
                this.sendMessage(this.esp32Client, {
                    type: 'command',
                    command: command,
                    button: message.button,
                    category: message.category,
                    data: message.data
                });
                break;
        }
    }

    private handleGetStatus(ws: WebSocket): void {
        const esp32Connected = this.esp32Client !== null;
        const esp32Info = esp32Connected ? this.clients.get(this.esp32Client!) : null;

        this.sendMessage(ws, {
            type: 'status_response',
            esp32_connected: esp32Connected,
            mobile_clients: this.mobileClients.size,
            esp32_battery: esp32Info?.batteryLevel,
            esp32_category: esp32Info?.currentCategory,
            server_time: new Date().toISOString()
        });
    }

    // Nuevos manejadores para mensajes del ESP32 avanzado
    private handleLogMessage(ws: WebSocket, message: WSMessage): void {
        // Los logs solo se muestran en consola del servidor, no se reenvían a la app
        const logLevel = message.log_level || 'INFO';
        const logMessage = message.log_message || message.message || '';
        const functionName = message.function_name ? ` [${message.function_name}:${message.line_number}]` : '';

        console.log(`📋 [ESP32 ${logLevel}]${functionName} ${logMessage}`);
    }

    private handleSystemStateChanged(ws: WebSocket, message: WSMessage): void {
        const previousState = message.previous_state;
        const currentState = message.current_state || message.system_state;

        console.log(`🔄 Estado del sistema ESP32 cambió: ${previousState} → ${currentState}`);

        // Actualizar info del cliente
        const clientInfo = this.clients.get(ws);
        if (clientInfo) {
            // Guardar el estado actual en algún campo personalizado
            (clientInfo as any).systemState = currentState;
        }

        // Notificar a clientes móviles sobre el cambio de estado
        this.broadcastToMobile({
            type: 'system_state_changed',
            previous_state: previousState,
            current_state: currentState,
            timestamp: message.timestamp || Date.now()
        });
    }

    private handleCategoryChanged(ws: WebSocket, message: WSMessage): void {
        const category = message.category;

        console.log(`📁 Categoría ESP32 cambió a: ${category}`);

        // Actualizar info del cliente ESP32
        const clientInfo = this.clients.get(ws);
        if (clientInfo) {
            clientInfo.currentCategory = category;
        }

        // Notificar a clientes móviles sobre el cambio de categoría
        this.broadcastToMobile({
            type: 'category_changed',
            category: category,
            timestamp: message.timestamp || Date.now()
        });

        // Notificar por WhatsApp cuando el ESP32 confirma el cambio de categoría
        this.sendWhatsAppNotification('category_change', { category }).catch((error: any) => {
            console.error('❌ Error enviando notificación de cambio de categoría por WhatsApp:', error);
        });
    }

    private handleWakeUp(ws: WebSocket, message: WSMessage): void {
        const wakeReason = message.wake_reason || 'unknown';

        console.log(`🌅 ESP32 despertó - Razón: ${wakeReason}`);

        // Notificar a clientes móviles
        this.broadcastToMobile({
            type: 'esp32_wake_up',
            wake_reason: wakeReason,
            timestamp: message.timestamp || Date.now()
        });

        // Enviar notificación de reconexión por WhatsApp
        whatsAppService.sendReconnectionAlert().catch((error: any) => {
            console.error('❌ Error enviando notificación de reconexión por WhatsApp:', error);
        });
    }

    private handleGoingToSleep(ws: WebSocket, message: WSMessage): void {
        const sleepReason = message.sleep_reason || 'unknown';
        const sleepDuration = message.sleep_duration;

        console.log(`😴 ESP32 entrando en modo sueño - Razón: ${sleepReason}${sleepDuration ? `, Duración: ${sleepDuration}ms` : ''}`);

        // Notificar a clientes móviles
        this.broadcastToMobile({
            type: 'esp32_going_to_sleep',
            sleep_reason: sleepReason,
            sleep_duration: sleepDuration,
            timestamp: message.timestamp || Date.now()
        });
    }

    private handleErrorMessage(ws: WebSocket, message: WSMessage): void {
        // Los errores solo se muestran en consola del servidor, no se reenvían a la app
        const errorCode = message.error_code || 'UNKNOWN';
        const errorMessage = message.message || '';
        const functionName = message.function_name ? ` [${message.function_name}:${message.line_number}]` : '';

        console.error(`❌ [ESP32 ERROR ${errorCode}]${functionName} ${errorMessage}`);
    }

    private handleDisconnection(ws: WebSocket): void {
        const clientInfo = this.clients.get(ws);
        if (!clientInfo) return;

        console.log(`🔌 Cliente desconectado: ${clientInfo.id} (${clientInfo.type})`);

        if (clientInfo.type === 'esp32' && this.esp32Client === ws) {
            this.esp32Client = null;

            // Enviar alerta de desconexión por WhatsApp
            whatsAppService.sendDisconnectionAlert().catch(error => {
                console.error('❌ Error enviando alerta de desconexión por WhatsApp:', error);
            });

            // Notificar a clientes móviles
            this.broadcastToMobile({
                type: 'esp32_disconnected'
            });
        } else if (clientInfo.type === 'mobile') {
            this.mobileClients.delete(ws);
        }

        this.clients.delete(ws);
    }

    private broadcastToMobile(message: WSMessage): void {
        this.mobileClients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                this.sendMessage(client, message);
            }
        });
    }

    private sendMessage(ws: WebSocket, message: WSMessage): void {
        if (ws.readyState === WebSocket.OPEN) {
            try {
                ws.send(JSON.stringify(message));
            } catch (error) {
                console.error('❌ Error enviando mensaje WebSocket:', error);
            }
        }
    }

    private sendError(ws: WebSocket, error: string): void {
        this.sendMessage(ws, {
            type: 'error',
            message: error,
            timestamp: Date.now()
        });
    }

    private generateClientId(): string {
        return Math.random().toString(36).substring(2, 15) +
            Math.random().toString(36).substring(2, 15);
    }

    private cleanupDisconnectedClients(): void {
        const now = new Date();
        const timeout = 5 * 60 * 1000; // 5 minutos

        this.clients.forEach((clientInfo, ws) => {
            if (now.getTime() - clientInfo.lastHeartbeat.getTime() > timeout) {
                console.log(`🧹 Limpiando cliente inactivo: ${clientInfo.id}`);
                ws.terminate();
                this.clients.delete(ws);

                if (clientInfo.type === 'esp32' && this.esp32Client === ws) {
                    this.esp32Client = null;
                } else if (clientInfo.type === 'mobile') {
                    this.mobileClients.delete(ws);
                }
            }
        });
    }

    // Métodos públicos para interactuar con el WebSocket desde otras partes de la aplicación
    public sendToESP32(command: string, data?: any): boolean {
        if (!this.esp32Client) {
            console.log('⚠️ No se puede enviar comando: ESP32 no conectado');
            return false;
        }

        this.sendMessage(this.esp32Client, {
            command,
            ...data
        });
        return true;
    }

    public broadcastToAll(message: WSMessage): void {
        this.clients.forEach((clientInfo, ws) => {
            this.sendMessage(ws, message);
        });
    }

    public getConnectedClients(): { esp32: boolean; mobileCount: number } {
        return {
            esp32: this.esp32Client !== null,
            mobileCount: this.mobileClients.size
        };
    }

    public getESP32Status(): any {
        if (!this.esp32Client) return null;

        const esp32Info = this.clients.get(this.esp32Client);
        return esp32Info ? {
            connected: true,
            battery: esp32Info.batteryLevel,
            category: esp32Info.currentCategory,
            lastHeartbeat: esp32Info.lastHeartbeat
        } : null;
    }

    // Método para enviar notificaciones de WhatsApp para acciones del sistema
    private async sendWhatsAppNotification(eventType: string, data?: any): Promise<void> {
        if (!whatsAppService.isClientReady()) {
            console.log('⚠️ WhatsApp no está listo para enviar notificación');
            return;
        }

        try {
            let message = '';
            const timestamp = new Date().toLocaleString('es-ES');

            switch (eventType) {
                case 'shutdown':
                    message = `😴 *Dispositivo Apagado*\n\n` +
                        `El dispositivo wearable ha sido apagado de forma remota.\n\n` +
                        `El monitoreo estará pausado hasta que el dispositivo sea encendido nuevamente.\n\n` +
                        `_Apagado: ${timestamp}_`;
                    break;

                case 'category_change':
                    const categoryName = this.getCategoryName(data?.category);
                    message = `📁 *Categoría Cambiada*\n\n` +
                        `La categoría del dispositivo wearable ha sido cambiada a: *${categoryName}*\n\n` +
                        `Ahora el dispositivo reproducirá mensajes de esta nueva categoría.\n\n` +
                        `_Cambiado: ${timestamp}_`;
                    break;

                case 'device_powered_on':
                    message = `🔌 *Dispositivo Encendido*\n\n` +
                        `El dispositivo wearable ha sido encendido y está funcionando correctamente.\n\n` +
                        `El monitoreo y las notificaciones han sido restablecidos.\n\n` +
                        `_Encendido: ${timestamp}_`;
                    break;

                default:
                    console.log(`⚠️ Tipo de notificación desconocido: ${eventType}`);
                    return;
            }

            // Enviar mensaje usando el método público del servicio
            await whatsAppService.sendNotificationMessage(message);
            console.log(`✅ Notificación de WhatsApp enviada: ${eventType}`);

        } catch (error) {
            console.error(`❌ Error enviando notificación de WhatsApp (${eventType}):`, error);
            throw error;
        }
    }

    // Método auxiliar para obtener el nombre de la categoría
    private getCategoryName(category: number | string): string {
        if (typeof category === 'string') return category;

        const categoryNames = {
            1: 'Básico',
            2: 'Emociones',
            3: 'Necesidades'
        };

        return categoryNames[category as keyof typeof categoryNames] || `Categoría ${category}`;
    }
}

export const webSocketController = new WebSocketController();
