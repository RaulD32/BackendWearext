import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
    user?: {
        id: number;
        email: string;
        role_id: number;
        role_name: string;
    };
}

export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Token de acceso requerido'
            });
        }

        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            return res.status(500).json({
                success: false,
                message: 'Error de configuración del servidor'
            });
        }

        const decoded = jwt.verify(token, jwtSecret) as any;

        if (!decoded.id || !decoded.email || !decoded.role_id) {
            return res.status(401).json({
                success: false,
                message: 'Token inválido'
            });
        }

        req.user = {
            id: decoded.id,
            email: decoded.email,
            role_id: decoded.role_id,
            role_name: decoded.role_name
        };

        next();
    } catch (error) {
        console.error('Error en autenticación:', error);
        return res.status(401).json({
            success: false,
            message: 'Token inválido o expirado'
        });
    }
};
