import dotenv from 'dotenv';
import app from './app.js';
import { initializeWhatsAppOnStartup, showWhatsAppConfig } from './config/whatsapp.js';

dotenv.config();

const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || '0.0.0.0';

app.listen(PORT, HOST, async () => {
  console.log(`Servidor corriendo en ${HOST}:${PORT}`);
  console.log('🚀 SISTEMA WEAREXT INICIADO');
  console.log(`📍 Swagger: http://${HOST === '0.0.0.0' ? 'localhost' : HOST}:${PORT}/api-docs`);
  console.log(`🔌 WebSocket disponible en: ws://${HOST === '0.0.0.0' ? 'localhost' : HOST}:${process.env.WS_PORT || 8080}/ws`);

  showWhatsAppConfig();

  setTimeout(async () => {
    await initializeWhatsAppOnStartup();
  }, 2000);
});
