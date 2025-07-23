import { BaseService } from './baseService.js';
import { Message, CreateMessageDTO, UpdateMessageDTO } from '../models/Message.js';
import { ttsService } from './ttsService.js';

export class MessageService extends BaseService {

    constructor() {
        super('messages');
    }

    async getAllMessages(userId?: number, roleId?: number): Promise<Message[]> {
        try {
            let query = `
        SELECT 
          m.id, m.text, m.audio_url, m.category_id, m.created_by, m.is_active,
          m.created_at, m.updated_at,
          c.name as category_name,
          u.name as creator_name
        FROM messages m
        INNER JOIN categories c ON m.category_id = c.id
        INNER JOIN users u ON m.created_by = u.id
        WHERE m.is_active = true
      `;

            const params: any[] = [];

            // Filtrar por rol si es necesario
            if (userId && roleId) {
                // Si es niño, solo mostrar mensajes asignados
                if (roleId === 3) { // Asumiendo que 3 es el ID del rol 'niño'
                    query += ` AND m.id IN (
            SELECT cm.message_id 
            FROM child_messages cm 
            WHERE cm.child_id = ?
          )`;
                    params.push(userId);
                }
                // Si es tutor, mostrar mensajes creados por él o de sus niños
                else if (roleId === 2) { // Asumiendo que 2 es el ID del rol 'tutor'
                    query += ` AND (m.created_by = ? OR m.id IN (
            SELECT cm.message_id 
            FROM child_messages cm 
            INNER JOIN tutor_child_relations tcr ON cm.child_id = tcr.child_id
            WHERE tcr.tutor_id = ?
          ))`;
                    params.push(userId, userId);
                }
            }

            query += ' ORDER BY m.created_at DESC';

            const [rows] = await this.pool.execute(query, params);
            return rows as Message[];
        } catch (error) {
            console.error('Error al obtener mensajes:', error);
            throw new Error('Error al obtener mensajes');
        }
    }

    async getMessageById(id: number): Promise<Message | null> {
        try {
            const query = `
        SELECT 
          m.id, m.text, m.audio_url, m.category_id, m.created_by, m.is_active,
          m.created_at, m.updated_at,
          c.name as category_name,
          u.name as creator_name
        FROM messages m
        INNER JOIN categories c ON m.category_id = c.id
        INNER JOIN users u ON m.created_by = u.id
        WHERE m.id = ?
      `;

            const [rows] = await this.pool.execute(query, [id]);
            const messages = rows as Message[];

            return messages.length > 0 ? messages[0] : null;
        } catch (error) {
            console.error('Error al obtener mensaje:', error);
            throw new Error('Error al obtener mensaje');
        }
    }

    async createMessage(messageData: CreateMessageDTO, createdBy: number): Promise<Message> {
        try {
            // Validar texto para TTS
            const validation = ttsService.validateTextForTTS(messageData.text);
            if (!validation.isValid) {
                throw new Error(`Error de validación: ${validation.errors.join(', ')}`);
            }

            // Verificar que la categoría existe
            const categoryQuery = 'SELECT id FROM categories WHERE id = ?';
            const [categoryRows] = await this.pool.execute(categoryQuery, [messageData.category_id]);
            if ((categoryRows as any[]).length === 0) {
                throw new Error('La categoría especificada no existe');
            }

            // Generar audio con TTS
            const audioUrl = await ttsService.generateAudioFromText(messageData.text);

            // Crear mensaje en la base de datos
            const query = `
        INSERT INTO messages (text, audio_url, category_id, created_by)
        VALUES (?, ?, ?, ?)
      `;

            const [result] = await this.pool.execute(query, [
                messageData.text,
                audioUrl,
                messageData.category_id,
                createdBy
            ]);

            const insertResult = result as any;
            const newMessage = await this.getMessageById(insertResult.insertId);

            if (!newMessage) {
                throw new Error('Error al crear mensaje');
            }

            return newMessage;
        } catch (error) {
            console.error('Error al crear mensaje:', error);
            throw error;
        }
    }

    async updateMessage(id: number, updateData: UpdateMessageDTO): Promise<Message | null> {
        try {
            const existingMessage = await this.getMessageById(id);
            if (!existingMessage) {
                return null;
            }

            const fields: string[] = [];
            const values: any[] = [];
            let newAudioUrl: string | undefined;

            // Si se actualiza el texto, regenerar audio
            if (updateData.text !== undefined) {
                const validation = ttsService.validateTextForTTS(updateData.text);
                if (!validation.isValid) {
                    throw new Error(`Error de validación: ${validation.errors.join(', ')}`);
                }

                newAudioUrl = await ttsService.regenerateAudio(updateData.text, existingMessage.audio_url);
                fields.push('text = ?', 'audio_url = ?');
                values.push(updateData.text, newAudioUrl);
            }

            if (updateData.category_id !== undefined) {
                // Verificar que la categoría existe
                const categoryQuery = 'SELECT id FROM categories WHERE id = ?';
                const [categoryRows] = await this.pool.execute(categoryQuery, [updateData.category_id]);
                if ((categoryRows as any[]).length === 0) {
                    throw new Error('La categoría especificada no existe');
                }

                fields.push('category_id = ?');
                values.push(updateData.category_id);
            }

            if (updateData.is_active !== undefined) {
                fields.push('is_active = ?');
                values.push(updateData.is_active);
            }

            if (fields.length === 0) {
                return existingMessage;
            }

            fields.push('updated_at = CURRENT_TIMESTAMP');
            values.push(id);

            const query = `UPDATE messages SET ${fields.join(', ')} WHERE id = ?`;
            await this.pool.execute(query, values);

            return await this.getMessageById(id);
        } catch (error) {
            console.error('Error al actualizar mensaje:', error);
            throw error;
        }
    }

    async deleteMessage(id: number): Promise<boolean> {
        try {
            const message = await this.getMessageById(id);
            if (!message) {
                return false;
            }

            // Eliminar archivo de audio
            if (message.audio_url) {
                await ttsService.deleteAudio(message.audio_url);
            }

            // Eliminar asignaciones a niños primero
            await this.pool.execute('DELETE FROM child_messages WHERE message_id = ?', [id]);

            // Eliminar mensaje
            const query = 'DELETE FROM messages WHERE id = ?';
            const [result] = await this.pool.execute(query, [id]);

            return (result as any).affectedRows > 0;
        } catch (error) {
            console.error('Error al eliminar mensaje:', error);
            throw new Error('Error al eliminar mensaje');
        }
    }

    async getMessagesByCategory(categoryId: number): Promise<Message[]> {
        try {
            const query = `
        SELECT 
          m.id, m.text, m.audio_url, m.category_id, m.created_by, m.is_active,
          m.created_at, m.updated_at,
          c.name as category_name,
          u.name as creator_name
        FROM messages m
        INNER JOIN categories c ON m.category_id = c.id
        INNER JOIN users u ON m.created_by = u.id
        WHERE m.category_id = ? AND m.is_active = true
        ORDER BY m.created_at DESC
      `;

            const [rows] = await this.pool.execute(query, [categoryId]);
            return rows as Message[];
        } catch (error) {
            console.error('Error al obtener mensajes por categoría:', error);
            throw new Error('Error al obtener mensajes por categoría');
        }
    }

    async getMessagesByUser(userId: number): Promise<Message[]> {
        try {
            const query = `
        SELECT 
          m.id, m.text, m.audio_url, m.category_id, m.created_by, m.is_active,
          m.created_at, m.updated_at,
          c.name as category_name,
          u.name as creator_name
        FROM messages m
        INNER JOIN categories c ON m.category_id = c.id
        INNER JOIN users u ON m.created_by = u.id
        WHERE m.created_by = ? AND m.is_active = true
        ORDER BY m.created_at DESC
      `;

            const [rows] = await this.pool.execute(query, [userId]);
            return rows as Message[];
        } catch (error) {
            console.error('Error al obtener mensajes por usuario:', error);
            throw new Error('Error al obtener mensajes por usuario');
        }
    }

    async regenerateMessageAudio(id: number): Promise<Message | null> {
        try {
            const message = await this.getMessageById(id);
            if (!message) {
                return null;
            }

            const newAudioUrl = await ttsService.regenerateAudio(message.text, message.audio_url);

            const query = 'UPDATE messages SET audio_url = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
            await this.pool.execute(query, [newAudioUrl, id]);

            return await this.getMessageById(id);
        } catch (error) {
            console.error('Error al regenerar audio:', error);
            throw new Error('Error al regenerar audio del mensaje');
        }
    }
}

export const messageService = new MessageService();
