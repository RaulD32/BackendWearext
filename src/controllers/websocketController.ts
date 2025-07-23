import { WebSocket, WebSocketServer } from 'ws';
import { IncomingMessage } from 'http';
import { parse } from 'url';

interface ClientInfo {
    id: string;
    type: 'esp32' | 'mobile' | 'unknown';
    deviceName?: string;
    connectedAt: Date;
    lastHeartbeat: Date;
    batteryLevel?: number;
    currentCategory?: number;
    isOnline: boolean;
}

interface WSMessage {
    type: string;
    command?: string;
    button?: number;
    category?: number;
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
    esp32_category?: number;
    server_time?: string;
    message?: string;
    [key: string]: any; // Para propiedades adicionales
}

class WebSocketController {
    private wss: WebSocketServer;
    private clients: Map<WebSocket, ClientInfo> = new Map();
    private esp32Client: WebSocket | null = null;
    private mobileClients: Set<WebSocket> = new Set();

    constructor() {
        this.wss = new WebSocketServer({
            port: 8080,
            path: '/ws'
        });

        this.wss.on('connection', (ws: WebSocket, req: IncomingMessage) => {
            this.handleConnection(ws, req);
        });

        console.log('🔌 WebSocket server iniciado en puerto 8080');

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

            case 'play_audio':
                this.handlePlayAudio(ws, message);
                break;

            case 'change_category':
                this.handleChangeCategory(ws, message);
                break;

            case 'get_status':
                this.handleGetStatus(ws);
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
            clientInfo.type = 'esp32';
            clientInfo.deviceName = 'TalkingChildren ESP32';
            clientInfo.batteryLevel = message.battery;
            clientInfo.currentCategory = message.category;
            this.esp32Client = ws;

            console.log(`🤖 ESP32 identificado - Boot: ${message.bootCount}, Batería: ${message.battery}%, Categoría: ${message.category}`);

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

        // Notificar a clientes móviles
        this.broadcastToMobile({
            type: 'battery_update',
            voltage: message.voltage,
            percentage: message.percentage,
            charging: message.charging
        });
    }

    private handleMobileCommand(ws: WebSocket, message: WSMessage): void {
        if (!this.esp32Client) {
            this.sendError(ws, 'ESP32 no conectado');
            return;
        }

        console.log(`📱➡️🤖 Comando desde móvil a ESP32:`, message);

        // Reenviar comando al ESP32
        this.sendMessage(this.esp32Client, {
            type: 'command',
            command: message.command,
            button: message.button,
            category: message.category,
            data: message.data
        });
    }

    private handlePlayAudio(ws: WebSocket, message: WSMessage): void {
        if (!this.esp32Client) {
            this.sendError(ws, 'ESP32 no conectado');
            return;
        }

        console.log(`🔊 Comando reproducir audio - Botón: ${message.button}`);

        this.sendMessage(this.esp32Client, {
            type: 'command',
            command: 'play',
            button: message.button
        });
    }

    private handleChangeCategory(ws: WebSocket, message: WSMessage): void {
        if (!this.esp32Client) {
            this.sendError(ws, 'ESP32 no conectado');
            return;
        }

        console.log(`📁 Cambiar categoría a: ${message.category}`);

        this.sendMessage(this.esp32Client, {
            type: 'command',
            command: 'category',
            category: message.category
        });

        // Actualizar info del cliente ESP32
        const esp32Info = this.clients.get(this.esp32Client);
        if (esp32Info) {
            esp32Info.currentCategory = message.category;
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

    private handleDisconnection(ws: WebSocket): void {
        const clientInfo = this.clients.get(ws);
        if (!clientInfo) return;

        console.log(`🔌 Cliente desconectado: ${clientInfo.id} (${clientInfo.type})`);

        if (clientInfo.type === 'esp32' && this.esp32Client === ws) {
            this.esp32Client = null;
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
}

export const webSocketController = new WebSocketController();
