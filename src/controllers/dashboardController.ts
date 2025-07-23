import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware.js';
import pool from '../config/db.js';

export class DashboardController {

    async getStats(req: AuthRequest, res: Response) {
        try {
            const userId = req.user!.id;
            const userRole = req.user!.role_name;

            let stats: any = {};

            if (userRole === 'administrador') {
                stats = await this.getAdminStats();
            } else if (userRole === 'tutor') {
                stats = await this.getTutorStats(userId);
            } else if (userRole === 'niño') {
                stats = await this.getChildStats(userId);
            }

            res.json({
                success: true,
                data: stats,
                message: 'Estadísticas obtenidas exitosamente'
            });
        } catch (error) {
            console.error('Error en DashboardController.getStats:', error);
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Error interno del servidor'
            });
        }
    }

    private async getAdminStats() {
        try {
            const [usersResult] = await pool.execute('SELECT COUNT(*) as count FROM users');
            const [messagesResult] = await pool.execute('SELECT COUNT(*) as count FROM messages WHERE is_active = true');
            const [categoriesResult] = await pool.execute('SELECT COUNT(*) as count FROM categories');
            const [relationsResult] = await pool.execute('SELECT COUNT(*) as count FROM tutor_child_relations');

            return {
                totalUsers: (usersResult as any)[0].count,
                totalMessages: (messagesResult as any)[0].count,
                totalCategories: (categoriesResult as any)[0].count,
                totalRelations: (relationsResult as any)[0].count
            };
        } catch (error) {
            console.error('Error al obtener estadísticas de admin:', error);
            throw new Error('Error al obtener estadísticas');
        }
    }

    private async getTutorStats(tutorId: number) {
        try {
            const [childrenResult] = await pool.execute('SELECT COUNT(*) as count FROM tutor_child_relations WHERE tutor_id = ?', [tutorId]);
            const [messagesResult] = await pool.execute('SELECT COUNT(*) as count FROM messages WHERE created_by = ? AND is_active = true', [tutorId]);

            return {
                myChildren: (childrenResult as any)[0].count,
                myMessages: (messagesResult as any)[0].count
            };
        } catch (error) {
            console.error('Error al obtener estadísticas de tutor:', error);
            throw new Error('Error al obtener estadísticas');
        }
    }

    private async getChildStats(childId: number) {
        try {
            const [messagesResult] = await pool.execute('SELECT COUNT(*) as count FROM child_messages WHERE child_id = ?', [childId]);
            const [favoritesResult] = await pool.execute('SELECT COUNT(*) as count FROM child_messages WHERE child_id = ? AND is_favorite = true', [childId]);

            return {
                totalMessages: (messagesResult as any)[0].count,
                favoriteMessages: (favoritesResult as any)[0].count
            };
        } catch (error) {
            console.error('Error al obtener estadísticas de niño:', error);
            throw new Error('Error al obtener estadísticas');
        }
    }

    async getActivity(req: AuthRequest, res: Response) {
        try {
            const userId = req.user!.id;
            const userRole = req.user!.role_name;

            let activity: any[] = [];

            if (userRole === 'administrador') {
                // Admin puede ver toda la actividad
                const [rows] = await pool.execute('SELECT * FROM messages ORDER BY created_at DESC LIMIT 20');
                activity = rows as any[];
            } else if (userRole === 'tutor') {
                // Tutor puede ver actividad de sus niños asignados
                const [rows] = await pool.execute(`
                    SELECT m.*, cm.created_at as assigned_at 
                    FROM messages m 
                    JOIN child_messages cm ON m.id = cm.message_id 
                    JOIN tutor_child_relations tcr ON cm.child_id = tcr.child_id 
                    WHERE tcr.tutor_id = ? 
                    ORDER BY cm.created_at DESC LIMIT 20
                `, [userId]);
                activity = rows as any[];
            } else if (userRole === 'niño') {
                // Niño puede ver sus propios mensajes asignados
                const [rows] = await pool.execute(`
                    SELECT m.*, cm.created_at as assigned_at 
                    FROM messages m 
                    JOIN child_messages cm ON m.id = cm.message_id 
                    WHERE cm.child_id = ? 
                    ORDER BY cm.created_at DESC LIMIT 20
                `, [userId]);
                activity = rows as any[];
            }

            res.json({
                success: true,
                data: activity,
                message: 'Actividad obtenida exitosamente'
            });
        } catch (error) {
            console.error('Error en DashboardController.getActivity:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }

    async getMessages(req: AuthRequest, res: Response) {
        try {
            const userId = req.user!.id;
            const userRole = req.user!.role_name;

            let messages: any[] = [];

            if (userRole === 'administrador') {
                // Admin puede ver todos los mensajes
                const [rows] = await pool.execute('SELECT * FROM messages ORDER BY created_at DESC');
                messages = rows as any[];
            } else if (userRole === 'tutor') {
                // Tutor puede ver mensajes asignados a sus niños
                const [rows] = await pool.execute(`
                    SELECT DISTINCT m.* 
                    FROM messages m 
                    JOIN child_messages cm ON m.id = cm.message_id 
                    JOIN tutor_child_relations tcr ON cm.child_id = tcr.child_id 
                    WHERE tcr.tutor_id = ? 
                    ORDER BY m.created_at DESC
                `, [userId]);
                messages = rows as any[];
            } else if (userRole === 'niño') {
                // Niño puede ver sus mensajes asignados
                const [rows] = await pool.execute(`
                    SELECT m.* 
                    FROM messages m 
                    JOIN child_messages cm ON m.id = cm.message_id 
                    WHERE cm.child_id = ? 
                    ORDER BY m.created_at DESC
                `, [userId]);
                messages = rows as any[];
            }

            res.json({
                success: true,
                data: messages,
                message: 'Mensajes obtenidos exitosamente'
            });
        } catch (error) {
            console.error('Error en DashboardController.getMessages:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }
}

export const dashboardController = new DashboardController();
