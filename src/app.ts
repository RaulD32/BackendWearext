import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import './config/silent-env.js'; // Configuración silenciosa de dotenv
import roleRoutes from './routes/roleRoutes.js';
import userRoutes from './routes/userRoutes.js';
import authRoutes from './routes/authRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import relationRoutes from './routes/relationRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import childMessageRoutes from './routes/childMessageRoutes.js';
import ttsRoutes from './routes/ttsRoutes.js';
import seederRoutes from './routes/seederRoutes.js';
import websocketRoutes from './routes/websocketRoutes.js';
import esp32Routes from './routes/esp32Routes.js';
import { errorMiddleware } from './middlewares/errorMiddleware.js';
import { setupSwagger } from './config/swagger.js';
import './controllers/websocketController.js'; // Inicializar WebSocket

// Configuración silenciosa
const app = express();

// Configuración de Swagger
setupSwagger(app);

// Configuración de CORS
app.use(cors({
    origin: [
        process.env.FRONTEND_URL || 'http://localhost:3001',
        process.env.MOBILE_APP_URL || '*'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Configurar morgan para ser menos verboso
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('tiny')); // Más limpio que 'dev'
} else {
    app.use(morgan('combined'));
}
app.use(express.json());

// Configurar tipos MIME para archivos de audio
app.use('/uploads', (req, res, next) => {
    if (req.url.endsWith('.wav')) {
        res.set('Content-Type', 'audio/wav');
    } else if (req.url.endsWith('.mp3')) {
        res.set('Content-Type', 'audio/mpeg');
    }
    next();
});

// Servir archivos estáticos de uploads
app.use('/uploads', express.static('uploads'));

// Rutas de la API con prefijo /api
app.use('/api/auth', authRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/relations', relationRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/child-messages', childMessageRoutes);
app.use('/api/tts', ttsRoutes);
app.use('/api/seeder', seederRoutes);
app.use('/api/websocket', websocketRoutes);
app.use('/api/esp32', esp32Routes);

// Ruta de salud del servidor
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Servidor funcionando correctamente',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// Middleware de manejo de errores (debe ir al final)
app.use(errorMiddleware);

export default app;
