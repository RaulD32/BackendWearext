import { BaseService } from './baseService.js';
import { TutorChildRelation, CreateRelationDTO, RelationResponse } from '../models/TutorChildRelation.js';

export interface ChildStats {
    childId: number;
    childName: string;
    messagesCount: number;
    favoriteMessagesCount: number;
    categoriesCount: number;
}

export class RelationService extends BaseService {

    constructor() {
        super('tutor_child_relations');
    }

    async createRelation(relationData: CreateRelationDTO): Promise<RelationResponse> {
        try {
            // Verificar que el tutor tiene rol de tutor (role_id = 2)
            const tutorQuery = 'SELECT id, name, email, role_id FROM users WHERE id = ? AND role_id = 2';
            const [tutorRows] = await this.pool.execute(tutorQuery, [relationData.tutor_id]);
            if ((tutorRows as any[]).length === 0) {
                throw new Error('El usuario especificado no es un tutor válido');
            }

            // Verificar que el niño tiene rol de niño (role_id = 3)
            const childQuery = 'SELECT id, name, email, role_id FROM users WHERE id = ? AND role_id = 3';
            const [childRows] = await this.pool.execute(childQuery, [relationData.child_id]);
            if ((childRows as any[]).length === 0) {
                throw new Error('El usuario especificado no es un niño válido');
            }

            // Verificar que la relación no existe ya
            const existingQuery = 'SELECT id FROM tutor_child_relations WHERE tutor_id = ? AND child_id = ?';
            const [existingRows] = await this.pool.execute(existingQuery, [relationData.tutor_id, relationData.child_id]);
            if ((existingRows as any[]).length > 0) {
                throw new Error('La relación ya existe entre este tutor y niño');
            }

            // Crear la relación
            const insertQuery = 'INSERT INTO tutor_child_relations (tutor_id, child_id) VALUES (?, ?)';
            const [result] = await this.pool.execute(insertQuery, [relationData.tutor_id, relationData.child_id]);

            const insertResult = result as any;
            const newRelation = await this.getRelationById(insertResult.insertId);

            if (!newRelation) {
                throw new Error('Error al crear la relación');
            }

            return newRelation;
        } catch (error) {
            console.error('Error al crear relación:', error);
            throw error;
        }
    }

    async getRelationById(id: number): Promise<RelationResponse | null> {
        try {
            const query = `
        SELECT 
          tcr.id, tcr.created_at,
          t.id as tutor_id, t.name as tutor_name, t.email as tutor_email,
          c.id as child_id, c.name as child_name, c.email as child_email
        FROM tutor_child_relations tcr
        INNER JOIN users t ON tcr.tutor_id = t.id
        INNER JOIN users c ON tcr.child_id = c.id
        WHERE tcr.id = ?
      `;

            const [rows] = await this.pool.execute(query, [id]);
            const relations = rows as any[];

            if (relations.length === 0) {
                return null;
            }

            const relation = relations[0];
            return {
                id: relation.id,
                tutor: {
                    id: relation.tutor_id,
                    name: relation.tutor_name,
                    email: relation.tutor_email
                },
                child: {
                    id: relation.child_id,
                    name: relation.child_name,
                    email: relation.child_email
                },
                created_at: relation.created_at
            };
        } catch (error) {
            console.error('Error al obtener relación:', error);
            throw new Error('Error al obtener relación');
        }
    }

    async getChildrenByTutor(tutorId: number): Promise<RelationResponse[]> {
        try {
            const query = `
        SELECT 
          tcr.id, tcr.created_at,
          t.id as tutor_id, t.name as tutor_name, t.email as tutor_email,
          c.id as child_id, c.name as child_name, c.email as child_email
        FROM tutor_child_relations tcr
        INNER JOIN users t ON tcr.tutor_id = t.id
        INNER JOIN users c ON tcr.child_id = c.id
        WHERE tcr.tutor_id = ?
        ORDER BY c.name ASC
      `;

            const [rows] = await this.pool.execute(query, [tutorId]);
            const relations = rows as any[];

            return relations.map(relation => ({
                id: relation.id,
                tutor: {
                    id: relation.tutor_id,
                    name: relation.tutor_name,
                    email: relation.tutor_email
                },
                child: {
                    id: relation.child_id,
                    name: relation.child_name,
                    email: relation.child_email
                },
                created_at: relation.created_at
            }));
        } catch (error) {
            console.error('Error al obtener niños del tutor:', error);
            throw new Error('Error al obtener niños del tutor');
        }
    }

    async getTutorsByChild(childId: number): Promise<RelationResponse[]> {
        try {
            const query = `
        SELECT 
          tcr.id, tcr.created_at,
          t.id as tutor_id, t.name as tutor_name, t.email as tutor_email,
          c.id as child_id, c.name as child_name, c.email as child_email
        FROM tutor_child_relations tcr
        INNER JOIN users t ON tcr.tutor_id = t.id
        INNER JOIN users c ON tcr.child_id = c.id
        WHERE tcr.child_id = ?
        ORDER BY t.name ASC
      `;

            const [rows] = await this.pool.execute(query, [childId]);
            const relations = rows as any[];

            return relations.map(relation => ({
                id: relation.id,
                tutor: {
                    id: relation.tutor_id,
                    name: relation.tutor_name,
                    email: relation.tutor_email
                },
                child: {
                    id: relation.child_id,
                    name: relation.child_name,
                    email: relation.child_email
                },
                created_at: relation.created_at
            }));
        } catch (error) {
            console.error('Error al obtener tutores del niño:', error);
            throw new Error('Error al obtener tutores del niño');
        }
    }

    async deleteRelation(tutorId: number, childId: number): Promise<boolean> {
        try {
            // Verificar que la relación existe
            const existingQuery = 'SELECT id FROM tutor_child_relations WHERE tutor_id = ? AND child_id = ?';
            const [existingRows] = await this.pool.execute(existingQuery, [tutorId, childId]);
            if ((existingRows as any[]).length === 0) {
                return false;
            }

            // Eliminar mensajes asignados por este tutor a este niño
            const deleteMessagesQuery = `
        DELETE FROM child_messages 
        WHERE child_id = ? AND assigned_by = ?
      `;
            await this.pool.execute(deleteMessagesQuery, [childId, tutorId]);

            // Eliminar la relación
            const deleteQuery = 'DELETE FROM tutor_child_relations WHERE tutor_id = ? AND child_id = ?';
            const [result] = await this.pool.execute(deleteQuery, [tutorId, childId]);

            return (result as any).affectedRows > 0;
        } catch (error) {
            console.error('Error al eliminar relación:', error);
            throw new Error('Error al eliminar relación');
        }
    }

    async deleteRelationById(relationId: number): Promise<boolean> {
        try {
            // Obtener información de la relación
            const relation = await this.getRelationById(relationId);
            if (!relation) {
                return false;
            }

            // Eliminar usando los IDs del tutor y niño
            return await this.deleteRelation(relation.tutor.id, relation.child.id);
        } catch (error) {
            console.error('Error al eliminar relación por ID:', error);
            throw new Error('Error al eliminar relación');
        }
    }

    async getAllRelations(): Promise<RelationResponse[]> {
        try {
            const query = `
        SELECT 
          tcr.id, tcr.created_at,
          t.id as tutor_id, t.name as tutor_name, t.email as tutor_email,
          c.id as child_id, c.name as child_name, c.email as child_email
        FROM tutor_child_relations tcr
        INNER JOIN users t ON tcr.tutor_id = t.id
        INNER JOIN users c ON tcr.child_id = c.id
        ORDER BY tcr.created_at DESC
      `;

            const [rows] = await this.pool.execute(query);
            const relations = rows as any[];

            return relations.map(relation => ({
                id: relation.id,
                tutor: {
                    id: relation.tutor_id,
                    name: relation.tutor_name,
                    email: relation.tutor_email
                },
                child: {
                    id: relation.child_id,
                    name: relation.child_name,
                    email: relation.child_email
                },
                created_at: relation.created_at
            }));
        } catch (error) {
            console.error('Error al obtener todas las relaciones:', error);
            throw new Error('Error al obtener relaciones');
        }
    }

    async checkRelationExists(tutorId: number, childId: number): Promise<boolean> {
        try {
            const query = 'SELECT id FROM tutor_child_relations WHERE tutor_id = ? AND child_id = ?';
            const [rows] = await this.pool.execute(query, [tutorId, childId]);
            return (rows as any[]).length > 0;
        } catch (error) {
            console.error('Error al verificar relación:', error);
            return false;
        }
    }

    async getRelationStats(): Promise<{
        totalRelations: number;
        totalTutors: number;
        totalChildren: number;
        avgChildrenPerTutor: number;
    }> {
        try {
            const statsQuery = `
        SELECT 
          COUNT(*) as total_relations,
          COUNT(DISTINCT tutor_id) as total_tutors,
          COUNT(DISTINCT child_id) as total_children,
          ROUND(COUNT(*) / COUNT(DISTINCT tutor_id), 2) as avg_children_per_tutor
        FROM tutor_child_relations
      `;

            const [rows] = await this.pool.execute(statsQuery);
            const stats = (rows as any[])[0];

            return {
                totalRelations: stats.total_relations || 0,
                totalTutors: stats.total_tutors || 0,
                totalChildren: stats.total_children || 0,
                avgChildrenPerTutor: stats.avg_children_per_tutor || 0
            };
        } catch (error) {
            console.error('Error al obtener estadísticas de relaciones:', error);
            throw new Error('Error al obtener estadísticas');
        }
    }

    async getChildStats(childId: number): Promise<ChildStats> {
        try {
            // Obtener información básica del niño
            const childQuery = 'SELECT id, name FROM users WHERE id = ? AND role_id = 3';
            const [childRows] = await this.pool.execute(childQuery, [childId]);
            if ((childRows as any[]).length === 0) {
                throw new Error('Niño no encontrado');
            }
            const child = (childRows as any[])[0];

            // Obtener conteo de mensajes asignados
            const messagesQuery = 'SELECT COUNT(*) as count FROM child_messages WHERE child_id = ?';
            const [messagesRows] = await this.pool.execute(messagesQuery, [childId]);
            const messagesCount = (messagesRows as any[])[0].count || 0;

            // Obtener conteo de mensajes favoritos
            const favoritesQuery = 'SELECT COUNT(*) as count FROM child_messages WHERE child_id = ? AND is_favorite = true';
            const [favoritesRows] = await this.pool.execute(favoritesQuery, [childId]);
            const favoriteMessagesCount = (favoritesRows as any[])[0].count || 0;

            // Obtener conteo de categorías distintas
            const categoriesQuery = `
                SELECT COUNT(DISTINCT c.id) as count 
                FROM categories c 
                JOIN messages m ON c.id = m.category_id 
                JOIN child_messages cm ON m.id = cm.message_id 
                WHERE cm.child_id = ?
            `;
            const [categoriesRows] = await this.pool.execute(categoriesQuery, [childId]);
            const categoriesCount = (categoriesRows as any[])[0].count || 0;

            return {
                childId: child.id,
                childName: child.name,
                messagesCount,
                favoriteMessagesCount,
                categoriesCount
            };
        } catch (error) {
            console.error('Error al obtener estadísticas del niño:', error);
            throw new Error('Error al obtener estadísticas del niño');
        }
    }
}

export const relationService = new RelationService();
