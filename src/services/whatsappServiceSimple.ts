// Servicio simplificado de WhatsApp para evitar problemas de ES modules
const whatsAppWeb = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

interface ButtonPressNotification {
    button: number;
    category: number;
    timestamp: number;
    childName?: string;
}

interface CategoryInfo {
    id: number;
    name: string;
    description?: string;
}

class WhatsAppService {
    private client: any = null;
    private isReady: boolean = false;
    private tutorPhoneNumber: string = '';
    private categories: Map<number, CategoryInfo> = new Map();

    constructor() {
        this.initializeCategories();
    }

    private initializeCategories(): void {
        // Categorías por defecto
        this.categories.set(1, { id: 1, name: 'Emociones', description: 'Sentimientos y emociones' });
        this.categories.set(2, { id: 2, name: 'Necesidades', description: 'Necesidades básicas' });
        this.categories.set(3, { id: 3, name: 'Actividades', description: 'Juegos y actividades' });
        this.categories.set(4, { id: 4, name: 'Familia', description: 'Miembros de la familia' });
        this.categories.set(5, { id: 5, name: 'Comida', description: 'Alimentos y bebidas' });
    }

    public async initialize(tutorPhone: string): Promise<void> {
        try {
            this.tutorPhoneNumber = tutorPhone;

            this.client = new whatsAppWeb.Client({
                authStrategy: new whatsAppWeb.LocalAuth({
                    clientId: 'wearext-whatsapp-client'
                }),
                puppeteer: {
                    headless: true,
                    args: ['--no-sandbox', '--disable-setuid-sandbox']
                }
            });

            this.setupEventHandlers();

            console.log('🔄 Iniciando cliente de WhatsApp...');
            await this.client.initialize();

        } catch (error) {
            console.error('❌ Error inicializando WhatsApp:', error);
            throw error;
        }
    }

    private setupEventHandlers(): void {
        if (!this.client) return;

        this.client.on('qr', (qr: string) => {
            console.log('📱 Escanea este código QR con WhatsApp:');
            qrcode.generate(qr, { small: true });
            console.log('🔗 También puedes usar este QR en un generador online si no se muestra correctamente');
        });

        this.client.on('ready', () => {
            console.log('✅ Cliente de WhatsApp listo y conectado!');
            this.isReady = true;
            this.sendConnectionNotification();
        });

        this.client.on('authenticated', () => {
            console.log('🔐 WhatsApp autenticado correctamente');
        });

        this.client.on('auth_failure', (msg: any) => {
            console.error('❌ Fallo en la autenticación de WhatsApp:', msg);
        });

        this.client.on('disconnected', (reason: any) => {
            console.log('⚠️ WhatsApp desconectado:', reason);
            this.isReady = false;
        });
    }

    private async sendConnectionNotification(): Promise<void> {
        const message = `🔗 *WearExt - Sistema Conectado*\n\n` +
            `El dispositivo wearable de su hijo/a está ahora conectado y funcionando.\n\n` +
            `Recibirá notificaciones cada vez que su hijo/a presione un botón en el dispositivo.\n\n` +
            `_Sistema iniciado: ${new Date().toLocaleString('es-ES')}_`;

        await this.sendMessage(message);
    }

    public async sendButtonPressNotification(notification: ButtonPressNotification): Promise<void> {
        if (!this.isReady || !this.client) {
            console.log('⚠️ WhatsApp no está listo, guardando notificación...');
            return;
        }

        try {
            const category = this.categories.get(notification.category);
            const categoryName = category ? category.name : `Categoría ${notification.category}`;
            const timestamp = new Date(notification.timestamp).toLocaleString('es-ES');

            const message = this.formatButtonPressMessage(notification, categoryName, timestamp);

            await this.sendMessage(message);

            console.log(`✅ Notificación de WhatsApp enviada - Botón: ${notification.button}, Categoría: ${categoryName}`);

        } catch (error) {
            console.error('❌ Error enviando notificación de WhatsApp:', error);
        }
    }

    private formatButtonPressMessage(notification: ButtonPressNotification, categoryName: string, timestamp: string): string {
        const buttonEmojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];
        const buttonEmoji = buttonEmojis[notification.button - 1] || `${notification.button}️⃣`;

        const categoryEmojis: { [key: string]: string } = {
            'Emociones': '😊',
            'Necesidades': '🙏',
            'Actividades': '🎮',
            'Familia': '👨‍👩‍👧‍👦',
            'Comida': '🍎'
        };

        const categoryEmoji = categoryEmojis[categoryName] || '📱';

        return `${categoryEmoji} *Comunicación de ${notification.childName || 'su hijo/a'}*\n\n` +
            `${buttonEmoji} Botón presionado: *${notification.button}*\n` +
            `📂 Categoría: *${categoryName}*\n` +
            `🕐 Hora: ${timestamp}\n\n` +
            `_Su hijo/a está intentando comunicarse usando el dispositivo wearable._`;
    }

    private async sendMessage(message: string): Promise<void> {
        if (!this.client || !this.isReady) {
            throw new Error('Cliente de WhatsApp no está listo');
        }

        try {
            const chatId = this.formatPhoneNumber(this.tutorPhoneNumber);
            await this.client.sendMessage(chatId, message);

        } catch (error) {
            console.error('❌ Error enviando mensaje de WhatsApp:', error);
            throw error;
        }
    }

    private formatPhoneNumber(phone: string): string {
        const cleanPhone = phone.replace(/\D/g, '');

        if (cleanPhone.length === 10) {
            return `52${cleanPhone}@c.us`;
        } else if (cleanPhone.length === 12 && cleanPhone.startsWith('52')) {
            return `${cleanPhone}@c.us`;
        } else {
            return `${cleanPhone}@c.us`;
        }
    }

    public async sendBatteryAlert(batteryLevel: number): Promise<void> {
        if (!this.isReady || !this.client) return;

        if (batteryLevel <= 20) {
            const message = `🔋 *Alerta de Batería Baja*\n\n` +
                `El dispositivo wearable tiene ${batteryLevel}% de batería restante.\n\n` +
                `Por favor, conecte el dispositivo al cargador para evitar interrupciones.\n\n` +
                `_Notificación automática - ${new Date().toLocaleString('es-ES')}_`;

            await this.sendMessage(message);
        }
    }

    public async sendDisconnectionAlert(): Promise<void> {
        if (!this.isReady || !this.client) return;

        const message = `⚠️ *Dispositivo Desconectado*\n\n` +
            `El dispositivo wearable se ha desconectado del sistema.\n\n` +
            `Esto puede deberse a:\n` +
            `• Batería agotada\n` +
            `• Problemas de conectividad\n` +
            `• El dispositivo fue apagado\n\n` +
            `_Desconectado: ${new Date().toLocaleString('es-ES')}_`;

        await this.sendMessage(message);
    }

    public async sendReconnectionAlert(): Promise<void> {
        if (!this.isReady || !this.client) return;

        const message = `✅ *Dispositivo Reconectado*\n\n` +
            `El dispositivo wearable se ha reconectado al sistema.\n\n` +
            `El monitoreo y las notificaciones han sido restablecidos.\n\n` +
            `_Reconectado: ${new Date().toLocaleString('es-ES')}_`;

        await this.sendMessage(message);
    }

    public setTutorPhoneNumber(phone: string): void {
        this.tutorPhoneNumber = phone;
    }

    public isClientReady(): boolean {
        return this.isReady;
    }

    public async disconnect(): Promise<void> {
        if (this.client) {
            await this.client.destroy();
            this.isReady = false;
            console.log('📱 Cliente de WhatsApp desconectado');
        }
    }

    public updateCategories(categories: CategoryInfo[]): void {
        this.categories.clear();
        categories.forEach(category => {
            this.categories.set(category.id, category);
        });
    }
}

export const whatsAppService = new WhatsAppService();
