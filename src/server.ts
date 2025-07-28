import dotenv from 'dotenv';
import app from './app.js';
import { initializeWhatsAppOnStartup, showWhatsAppConfig } from './config/whatsapp.js';

dotenv.config();

const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
  console.log('🚀 SISTEMA WEAREXT INICIADO');
  console.log('📍 Swagger: http://localhost:3000/api-docs');


  showWhatsAppConfig();

  setTimeout(async () => {
    await initializeWhatsAppOnStartup();
  }, 2000);
});
