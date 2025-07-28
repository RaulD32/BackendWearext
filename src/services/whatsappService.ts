// Servicio de WhatsApp usando whatsapp-web.js (QR-based)
import pkg from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';
const { Client, LocalAuth } = pkg;

interface ButtonPressNotification {
    button: number;
    category: number | string;
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
        this.initializeClient();
    }

    private initializeCategories(): void {
        // Categorías que coinciden con el ESP32
        this.categories.set(1, { id: 1, name: 'Básico', description: 'Necesidades básicas y comunicación' });
        this.categories.set(2, { id: 2, name: 'Emociones', description: 'Sentimientos y emociones' });
        this.categories.set(3, { id: 3, name: 'Necesidades', description: 'Necesidades físicas y cuidado' });
        this.categories.set(4, { id: 4, name: 'Saludos', description: 'Saludos y despedidas' });
        this.categories.set(5, { id: 5, name: 'Familia', description: 'Mensajes familiares' });
        this.categories.set(6, { id: 6, name: 'Comida', description: 'Relacionado con comida' });
        this.categories.set(7, { id: 7, name: 'Juegos', description: 'Actividades y juegos' });
        this.categories.set(8, { id: 8, name: 'Escuela', description: 'Actividades escolares' });
        this.categories.set(9, { id: 9, name: 'Salud', description: 'Temas de salud' });
        this.categories.set(10, { id: 10, name: 'Transporte', description: 'Transporte y movilidad' });
    }

    private initializeClient(): void {
        try {
            this.client = new Client({
                authStrategy: new LocalAuth(),
                puppeteer: {
                    headless: true,
                    args: [
                        '--no-sandbox',
                        '--disable-setuid-sandbox',
                        '--disable-dev-shm-usage',
                        '--disable-accelerated-2d-canvas',
                        '--no-first-run',
                        '--no-zygote',
                        '--disable-gpu'
                    ]
                }
            });

            this.setupEventHandlers();
            console.log('✅ Cliente de WhatsApp inicializado correctamente');

        } catch (error) {
            console.error('❌ Error inicializando cliente de WhatsApp:', error);
        }
    }

    private setupEventHandlers(): void {
        if (!this.client) return;

        this.client.on('qr', (qr: string) => {
            console.log('');
            console.log('📱 CÓDIGO QR PARA WHATSAPP');
            console.log('═'.repeat(60));
            console.log('');
            console.log('🔍 Escanea este código QR con WhatsApp:');
            console.log('');

            // Generar QR visual en la consola
            qrcode.generate(qr, { small: true });

            console.log('');
            console.log('📋 INSTRUCCIONES:');
            console.log('   1. Abre WhatsApp en tu teléfono');
            console.log('   2. Ve a ⚙️ Configuración > Dispositivos vinculados');
            console.log('   3. Toca "➕ Vincular un dispositivo"');
            console.log('   4. 📷 Escanea el código QR mostrado arriba');
            console.log('');
            console.log('⏰ El QR expira en ~20 segundos y se generará uno nuevo');
            console.log('💡 Si no funciona, reinicia el servidor y prueba de nuevo');
            console.log('═'.repeat(60));
            console.log('');
        });

        this.client.on('ready', () => {
            console.log('✅ Cliente de WhatsApp conectado y listo');
            this.isReady = true;

            // Enviar mensaje de conexión
            if (this.tutorPhoneNumber) {
                this.sendConnectionNotification();
            }
        });

        this.client.on('authenticated', () => {
            console.log('🔐 Cliente de WhatsApp autenticado');
        });

        this.client.on('auth_failure', (msg: any) => {
            console.error('❌ Error de autenticación de WhatsApp:', msg);
        });

        this.client.on('disconnected', (reason: any) => {
            console.log('📱 Cliente de WhatsApp desconectado:', reason);
            this.isReady = false;
        });
    }

    public async initialize(tutorPhone: string): Promise<void> {
        try {
            this.tutorPhoneNumber = tutorPhone;

            console.log('🔄 Iniciando cliente de WhatsApp...');
            console.log(`📞 Número del tutor: ${tutorPhone}`);

            if (this.client) {
                await this.client.initialize();
            }

        } catch (error) {
            console.error('❌ Error inicializando WhatsApp:', error);
            throw error;
        }
    }

    private async sendConnectionNotification(): Promise<void> {
        const message = `🔗 *WearExt - Sistema Conectado*\n\n` +
            `¡Hola! El dispositivo wearable de su hijo/a está ahora conectado y funcionando correctamente.\n\n` +
            `✅ *Funciones activas:*\n` +
            `• Notificaciones de botones presionados\n` +
            `• Alertas de batería baja\n` +
            `• Monitoreo de conexión del dispositivo\n\n` +
            `📱 Recibirá mensajes automáticos cada vez que su hijo/a presione un botón en el dispositivo.\n\n` +
            `_Sistema iniciado: ${new Date().toLocaleString('es-ES')}_\n\n` +
            `🆘 Si necesita ayuda, contacte al administrador del sistema.`;

        try {
            await this.sendMessage(message);
            console.log('📤 Mensaje de bienvenida enviado correctamente');
        } catch (error) {
            console.error('❌ Error en mensaje de bienvenida:', error);
        }
    }

    public async sendButtonPressNotification(notification: ButtonPressNotification): Promise<void> {
        if (!this.isReady || !this.client) {
            console.log('⚠️ Cliente de WhatsApp no está listo');
            return;
        }

        try {
            let categoryName: string;

            // Manejar tanto números como strings para las categorías
            if (typeof notification.category === 'number') {
                const category = this.categories.get(notification.category);
                categoryName = category ? category.name : `Categoría ${notification.category}`;
            } else {
                categoryName = notification.category;
            }

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
            'Básico': '📱',
            'Emociones': '😊',
            'Necesidades': '🙏',
            'Saludos': '👋',
            'Familia': '👨‍👩‍👧‍👦',
            'Comida': '🍎',
            'Juegos': '🎮',
            'Escuela': '📚',
            'Salud': '🏥',
            'Transporte': '🚗'
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
        // Conservar el número tal como viene (con + si lo tiene)
        let cleanPhone = phone;

        // Si tiene +, quitarlo temporalmente para procesar
        const hasPlus = phone.startsWith('+');
        if (hasPlus) {
            cleanPhone = phone.substring(1);
        }

        // Limpiar solo caracteres que no sean números
        cleanPhone = cleanPhone.replace(/[^0-9]/g, '');

        console.log(`🔍 Formateando número: ${phone} -> ${cleanPhone} (Plus: ${hasPlus})`);

        // Casos para números mexicanos
        if (cleanPhone.length === 10) {
            // Número mexicano sin código de país (agregar 52)
            const formatted = `52${cleanPhone}@c.us`;
            console.log(`📱 Formato mexicano 10 dígitos: ${formatted}`);
            return formatted;
        } else if (cleanPhone.length === 12 && cleanPhone.startsWith('52')) {
            // Número mexicano con código de país
            const formatted = `${cleanPhone}@c.us`;
            console.log(`📱 Formato mexicano con código: ${formatted}`);
            return formatted;
        } else if (cleanPhone.length === 13 && cleanPhone.startsWith('521')) {
            // Número mexicano con código de país y 1 adicional (formato móvil)
            const withoutExtra1 = cleanPhone.substring(0, 2) + cleanPhone.substring(3);
            const formatted = `${withoutExtra1}@c.us`;
            console.log(`📱 Formato mexicano móvil: ${formatted}`);
            return formatted;
        } else {
            // Formato general - usar número sin el +
            const formatted = `${cleanPhone}@c.us`;
            console.log(`📱 Formato general: ${formatted}`);
            return formatted;
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

    public async sendNotificationMessage(message: string): Promise<void> {
        if (!this.isReady || !this.client) {
            throw new Error('Cliente de WhatsApp no está listo');
        }

        try {
            const chatId = this.formatPhoneNumber(this.tutorPhoneNumber);
            await this.client.sendMessage(chatId, message);
            console.log('📤 Mensaje de notificación enviado por WhatsApp');
        } catch (error) {
            console.error('❌ Error enviando mensaje de notificación:', error);
            throw error;
        }
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

    // Método para pruebas - envía un mensaje de prueba
    public async sendTestMessage(): Promise<void> {
        const testMessage = `🧪 *Mensaje de Prueba - WearExt*\n\n` +
            `Este es un mensaje de prueba para verificar que el sistema de WhatsApp está funcionando correctamente.\n\n` +
            `✅ Si recibe este mensaje, la configuración es exitosa.\n\n` +
            `📱 Número configurado: ${this.tutorPhoneNumber}\n` +
            `🕐 Hora de prueba: ${new Date().toLocaleString('es-ES')}\n\n` +
            `_Mensaje generado automáticamente por el sistema WearExt._`;

        try {
            await this.sendMessage(testMessage);
            console.log('🧪 Mensaje de prueba enviado correctamente');
        } catch (error) {
            console.error('❌ Error enviando mensaje de prueba:', error);
            throw error;
        }
    }
}

export const whatsAppService = new WhatsAppService();
