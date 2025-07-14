import dotenv from 'dotenv';
import app from './app.js';  // ojo la extensión .js aunque el archivo sea .ts

dotenv.config();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
