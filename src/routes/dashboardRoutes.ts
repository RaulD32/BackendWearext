import { Router } from 'express';
import { dashboardController } from '../controllers/dashboardController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { childOrTutorOrAdmin } from '../middlewares/roleMiddleware.js';

const router = Router();

// Todas las rutas del dashboard requieren autenticación
router.use(authMiddleware);

// Estadísticas según el rol del usuario
router.get('/stats', childOrTutorOrAdmin, dashboardController.getStats);

// Actividad reciente según el rol
router.get('/activity', childOrTutorOrAdmin, dashboardController.getActivity);

// Mensajes del dashboard según el rol
router.get('/messages', childOrTutorOrAdmin, dashboardController.getMessages);

export default router;
