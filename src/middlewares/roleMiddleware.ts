import { Response, NextFunction } from 'express';
import { AuthRequest } from './authMiddleware.js';

export const roleMiddleware = (allowedRoles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'Usuario no autenticado'
                });
            }

            const userRole = req.user.role_name?.toLowerCase();
            const allowedRolesLower = allowedRoles.map(role => role.toLowerCase());

            if (!allowedRolesLower.includes(userRole)) {
                return res.status(403).json({
                    success: false,
                    message: `Acceso denegado. Roles requeridos: ${allowedRoles.join(', ')}`
                });
            }

            next();
        } catch (error) {
            console.error('Error en middleware de roles:', error);
            return res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    };
};

// Shortcuts para roles específicos
export const adminOnly = roleMiddleware(['administrador']);
export const tutorOrAdmin = roleMiddleware(['tutor', 'administrador']);
export const childOrTutorOrAdmin = roleMiddleware(['niño', 'tutor', 'administrador']);
export const childOnly = roleMiddleware(['niño']);
export const tutorOnly = roleMiddleware(['tutor']);
