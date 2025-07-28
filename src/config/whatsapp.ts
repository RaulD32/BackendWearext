import { whatsAppService } from '../services/whatsappService.js';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Muestra la configuración actual de WhatsApp del .env
 */
export const showWhatsAppConfig = (): void => {
    console.log('');
    console.log('📱 CONFIGURACIÓN DE WHATSAPP');
    console.log('═'.repeat(50));
    console.log(`🔧 WHATSAPP_ENABLED: ${process.env.WHATSAPP_ENABLED || 'no configurado'}`);
    console.log(`📞 TUTOR_PHONE_NUMBER: ${process.env.TUTOR_PHONE_NUMBER || 'no configurado'}`);
    console.log('═'.repeat(50));
};

/**
 * Inicializa automáticamente el servicio de WhatsApp al arrancar el servidor
 */
export const initializeWhatsAppOnStartup = async (): Promise<void> => {
    try {
        const whatsappEnabled = process.env.WHATSAPP_ENABLED === 'true';
        const tutorPhone = process.env.TUTOR_PHONE_NUMBER;

        console.log('');
        console.log('📱 INICIALIZACIÓN AUTOMÁTICA DE WHATSAPP');
        console.log('═'.repeat(60));

        if (!whatsappEnabled) {
            console.log('❌ WhatsApp deshabilitado en configuración (.env)');
            console.log('💡 Para habilitar, cambia WHATSAPP_ENABLED=true en .env');
            console.log('═'.repeat(60));
            return;
        }

        if (!tutorPhone) {
            console.log('⚠️ Número de teléfono del tutor no configurado');
            console.log('💡 Configura TUTOR_PHONE_NUMBER en tu archivo .env');
            console.log('📝 Ejemplo: TUTOR_PHONE_NUMBER=+529981035330');
            console.log('🔧 O usa la API manual: POST /api/test-whatsapp/initialize');
            console.log('═'.repeat(60));
            return;
        }

        console.log(`✅ WhatsApp habilitado: ${whatsappEnabled}`);
        console.log(`📞 Número del tutor desde .env: ${tutorPhone}`);
        console.log('🔄 Iniciando conexión automática...');
        console.log('═'.repeat(60));

        await whatsAppService.initialize(tutorPhone);

    } catch (error) {
        console.log('');
        console.log('❌ ERROR EN INICIALIZACIÓN AUTOMÁTICA DE WHATSAPP');
        console.log('═'.repeat(60));
        console.error('Error:', error);
        console.log('');
        console.log('� OPCIONES DE RECUPERACIÓN:');
        console.log('   1. Verificar configuración en .env');
        console.log('   2. Inicializar manualmente: POST /api/test-whatsapp/initialize');
        console.log('   3. Revisar conectividad de red');
        console.log('═'.repeat(60));
    }
};
