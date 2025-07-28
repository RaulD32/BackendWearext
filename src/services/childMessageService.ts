import { BaseService } from './baseService.js';
import { ChildMessage, AssignMessageDTO, UpdateChildMessageDTO, ChildMessageResponse } from '../models/ChildMessage.js';

export class ChildMessageService extends BaseService {

    constructor() {
        super('child_messages');
    }

    async assignMessageToChild(assignData: AssignMessageDTO, assignedBy: number): Promise<ChildMessageResponse> {
        try {
            // Verificar que el mensaje existe y está activo
            const messageQuery = 'SELECT id FROM messages WHERE id = ? AND is_active = true';
            const [messageRows] = await this.pool.execute(messageQuery, [assignData.message_id]);
            if ((messageRows as any[]).length === 0) {
                throw new Error('El mensaje no existe o no está activo');
            }

            // Verificar que el niño existe y tiene rol de niño
            const childQuery = `
                SELECT u.id FROM users u 
                JOIN roles r ON u.role_id = r.id 
                WHERE u.id = ? AND r.name = 'niño'
            `;
            const [childRows] = await this.pool.execute(childQuery, [assignData.child_id]);
            if ((childRows as any[]).length === 0) {
                throw new Error('El niño especificado no existe');
            }

            // Verificar que la asignación no existe ya
            const existingQuery = 'SELECT id FROM child_messages WHERE child_id = ? AND message_id = ?';
            const [existingRows] = await this.pool.execute(existingQuery, [assignData.child_id, assignData.message_id]);
            if ((existingRows as any[]).length > 0) {
                throw new Error('El mensaje ya está asignado a este niño');
            }

            // Crear la asignación
            const insertQuery = 'INSERT INTO child_messages (child_id, message_id, assigned_by) VALUES (?, ?, ?)';
            const [result] = await this.pool.execute(insertQuery, [assignData.child_id, assignData.message_id, assignedBy]);

            const insertResult = result as any;
            const newAssignment = await this.getChildMessageById(insertResult.insertId);

            if (!newAssignment) {
                throw new Error('Error al crear la asignación');
            }

            return newAssignment;
        } catch (error) {
            console.error('Error al asignar mensaje:', error);
            throw error;
        }
    }

    async getChildMessageById(id: number): Promise<ChildMessageResponse | null> {
        try {
            const query = `
        SELECT 
          cm.id, cm.is_favorite, cm.assigned_at,
          m.id as message_id, m.text as message_text, m.audio_url,
          c.id as category_id, c.name as category_name, c.color as category_color, c.icon as category_icon,
          u.id as assigned_by_id, u.name as assigned_by_name
        FROM child_messages cm
        INNER JOIN messages m ON cm.message_id = m.id
        INNER JOIN categories c ON m.category_id = c.id
        INNER JOIN users u ON cm.assigned_by = u.id
        WHERE cm.id = ? AND m.is_active = true
      `;

            const [rows] = await this.pool.execute(query, [id]);
            const assignments = rows as any[];

            if (assignments.length === 0) {
                return null;
            }

            const assignment = assignments[0];
            return {
                id: assignment.id,
                message: {
                    id: assignment.message_id,
                    text: assignment.message_text,
                    audio_url: assignment.audio_url,
                    category: {
                        id: assignment.category_id,
                        name: assignment.category_name,
                        color: assignment.category_color,
                        icon: assignment.category_icon
                    }
                },
                is_favorite: assignment.is_favorite,
                assigned_at: assignment.assigned_at,
                assigned_by: {
                    id: assignment.assigned_by_id,
                    name: assignment.assigned_by_name
                }
            };
        } catch (error) {
            console.error('Error al obtener asignación:', error);
            throw new Error('Error al obtener asignación');
        }
    }

    async getMessagesByChild(childId: number): Promise<ChildMessageResponse[]> {
        try {
            const query = `
        SELECT 
          cm.id, cm.is_favorite, cm.assigned_at,
          m.id as message_id, m.text as message_text, m.audio_url,
          c.id as category_id, c.name as category_name, c.color as category_color, c.icon as category_icon,
          u.id as assigned_by_id, u.name as assigned_by_name
        FROM child_messages cm
        INNER JOIN messages m ON cm.message_id = m.id
        INNER JOIN categories c ON m.category_id = c.id
        INNER JOIN users u ON cm.assigned_by = u.id
        WHERE cm.child_id = ? AND m.is_active = true
        ORDER BY cm.assigned_at DESC
      `;

            const [rows] = await this.pool.execute(query, [childId]);
            const assignments = rows as any[];

            return assignments.map(assignment => ({
                id: assignment.id,
                message: {
                    id: assignment.message_id,
                    text: assignment.message_text,
                    audio_url: assignment.audio_url,
                    category: {
                        id: assignment.category_id,
                        name: assignment.category_name,
                        color: assignment.category_color,
                        icon: assignment.category_icon
                    }
                },
                is_favorite: assignment.is_favorite,
                assigned_at: assignment.assigned_at,
                assigned_by: {
                    id: assignment.assigned_by_id,
                    name: assignment.assigned_by_name
                }
            }));
        } catch (error) {
            console.error('Error al obtener mensajes del niño:', error);
            throw new Error('Error al obtener mensajes del niño');
        }
    }

    async updateChildMessage(id: number, updateData: UpdateChildMessageDTO): Promise<ChildMessageResponse | null> {
        try {
            const existingAssignment = await this.getChildMessageById(id);
            if (!existingAssignment) {
                return null;
            }

            const fields: string[] = [];
            const values: any[] = [];

            if (updateData.is_favorite !== undefined) {
                fields.push('is_favorite = ?');
                values.push(updateData.is_favorite);
            }

            if (fields.length === 0) {
                return existingAssignment;
            }

            values.push(id);
            const query = `UPDATE child_messages SET ${fields.join(', ')} WHERE id = ?`;
            await this.pool.execute(query, values);

            return await this.getChildMessageById(id);
        } catch (error) {
            console.error('Error al actualizar asignación:', error);
            throw new Error('Error al actualizar asignación');
        }
    }

    async removeMessageFromChild(childId: number, messageId: number): Promise<boolean> {
        try {
            const query = 'DELETE FROM child_messages WHERE child_id = ? AND message_id = ?';
            const [result] = await this.pool.execute(query, [childId, messageId]);

            return (result as any).affectedRows > 0;
        } catch (error) {
            console.error('Error al remover asignación:', error);
            throw new Error('Error al remover asignación');
        }
    }

    async getFavoriteMessages(childId: number): Promise<ChildMessageResponse[]> {
        try {
            const query = `
        SELECT 
          cm.id, cm.is_favorite, cm.assigned_at,
          m.id as message_id, m.text as message_text, m.audio_url,
          c.id as category_id, c.name as category_name, c.color as category_color, c.icon as category_icon,
          u.id as assigned_by_id, u.name as assigned_by_name
        FROM child_messages cm
        INNER JOIN messages m ON cm.message_id = m.id
        INNER JOIN categories c ON m.category_id = c.id
        INNER JOIN users u ON cm.assigned_by = u.id
        WHERE cm.child_id = ? AND cm.is_favorite = true AND m.is_active = true
        ORDER BY cm.assigned_at DESC
      `;

            const [rows] = await this.pool.execute(query, [childId]);
            const assignments = rows as any[];

            return assignments.map(assignment => ({
                id: assignment.id,
                message: {
                    id: assignment.message_id,
                    text: assignment.message_text,
                    audio_url: assignment.audio_url,
                    category: {
                        id: assignment.category_id,
                        name: assignment.category_name,
                        color: assignment.category_color,
                        icon: assignment.category_icon
                    }
                },
                is_favorite: assignment.is_favorite,
                assigned_at: assignment.assigned_at,
                assigned_by: {
                    id: assignment.assigned_by_id,
                    name: assignment.assigned_by_name
                }
            }));
        } catch (error) {
            console.error('Error al obtener mensajes favoritos:', error);
            throw new Error('Error al obtener mensajes favoritos');
        }
    }

    async getMessagesByCategory(childId: number, categoryId: number): Promise<ChildMessageResponse[]> {
        try {
            const query = `
        SELECT 
          cm.id, cm.is_favorite, cm.assigned_at,
          m.id as message_id, m.text as message_text, m.audio_url,
          c.id as category_id, c.name as category_name, c.color as category_color, c.icon as category_icon,
          u.id as assigned_by_id, u.name as assigned_by_name
        FROM child_messages cm
        INNER JOIN messages m ON cm.message_id = m.id
        INNER JOIN categories c ON m.category_id = c.id
        INNER JOIN users u ON cm.assigned_by = u.id
        WHERE cm.child_id = ? AND c.id = ? AND m.is_active = true
        ORDER BY cm.assigned_at DESC
      `;

            const [rows] = await this.pool.execute(query, [childId, categoryId]);
            const assignments = rows as any[];

            return assignments.map(assignment => ({
                id: assignment.id,
                message: {
                    id: assignment.message_id,
                    text: assignment.message_text,
                    audio_url: assignment.audio_url,
                    category: {
                        id: assignment.category_id,
                        name: assignment.category_name,
                        color: assignment.category_color,
                        icon: assignment.category_icon
                    }
                },
                is_favorite: assignment.is_favorite,
                assigned_at: assignment.assigned_at,
                assigned_by: {
                    id: assignment.assigned_by_id,
                    name: assignment.assigned_by_name
                }
            }));
        } catch (error) {
            console.error('Error al obtener mensajes por categoría:', error);
            throw new Error('Error al obtener mensajes por categoría');
        }
    }
}

export const childMessageService = new ChildMessageService();
