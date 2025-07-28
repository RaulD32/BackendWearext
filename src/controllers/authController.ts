import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/authService.js';
import { AuthRequest } from '../middlewares/authMiddleware.js';

export async function registerController(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, email, password, role_id } = req.body;
    const result = await authService.register({ name, email, password, role_id });
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

export async function loginController(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);

    // Mostrar token en consola para facilitar pruebas
    if (result.success && result.data.token) {
      console.log('');
      console.log('🔑 TOKEN GENERADO PARA PRUEBAS:');
      console.log('═'.repeat(80));
      console.log(result.data.token);
      console.log('═'.repeat(80));
      console.log('💡 Copia este token para usar en las pruebas de WhatsApp');
      console.log('');
    }

    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function profileController(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const profile = await authService.getProfile(userId);
    res.json({
      success: true,
      data: profile,
      message: 'Perfil obtenido exitosamente'
    });
  } catch (error) {
    next(error);
  }
}

export async function logoutController(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    res.json({
      success: true,
      message: 'Logout exitoso'
    });
  } catch (error) {
    next(error);
  }
}
