import { webSocketController } from '../controllers/websocketController.js';
import pool from '../config/db.js';

interface AudioPlayRequest {
    messageId: number;
    childId: number;
    button?: number;
    category?: number;
}

interface CategoryChangeRequest {
    categoryId: number;
    childId: number;
}

class WebSocketService {

    /**
     * Reproduce un mensaje específico en el ESP32
     */
    async playMessageOnESP32(messageId: number, childId: number): Promise<boolean> {
        try {
            // Obtener información del mensaje
            const [messageResults] = await pool.execute(`
                SELECT m.*, c.name as category_name, c.id as category_id
                FROM messages m
                LEFT JOIN categories c ON m.category_id = c.id
                WHERE m.id = ? AND m.is_active = 1
            `, [messageId]);

            const messages = messageResults as any[];
            if (messages.length === 0) {
                console.log(`⚠️ Mensaje ${messageId} no encontrado o inactivo`);
                return false;
            }

            const message = messages[0];

            // Verificar que el niño tenga acceso al mensaje
            const [accessResults] = await pool.execute(`
                SELECT cm.* FROM child_messages cm
                WHERE cm.message_id = ? AND cm.child_id = ?
            `, [messageId, childId]);

            const access = accessResults as any[];
            if (access.length === 0) {
                console.log(`⚠️ Niño ${childId} no tiene acceso al mensaje ${messageId}`);
                return false;
            }

            // Determinar botón basado en la categoría (mapeo simple 1-3)
            const button = this.getCategoryButton(message.category_id);

            // Enviar comando al ESP32
            const sent = webSocketController.sendToESP32('play', {
                button: button,
                messageId: messageId,
                text: message.text,
                category: message.category_id,
                timestamp: Date.now()
            });

            if (sent) {
                // Registrar la reproducción
                await this.logPlayback(messageId, childId, 'esp32');
                console.log(`🔊 Mensaje ${messageId} enviado al ESP32 - Botón: ${button}`);
            }

            return sent;
        } catch (error) {
            console.error('❌ Error reproduciendo mensaje en ESP32:', error);
            return false;
        }
    }

    /**
     * Cambia la categoría actual en el ESP32
     */
    async changeCategoryOnESP32(categoryId: number): Promise<boolean> {
        try {
            // Verificar que la categoría existe
            const [categoryResults] = await pool.execute(`
                SELECT * FROM categories WHERE id = ? AND is_active = 1
            `, [categoryId]);

            const categories = categoryResults as any[];
            if (categories.length === 0) {
                console.log(`⚠️ Categoría ${categoryId} no encontrada o inactiva`);
                return false;
            }

            const category = categories[0];

            // Enviar comando al ESP32
            const sent = webSocketController.sendToESP32('category', {
                category: categoryId,
                categoryName: category.name,
                timestamp: Date.now()
            });

            if (sent) {
                console.log(`📁 Categoría cambiada a ${category.name} (ID: ${categoryId})`);
            }

            return sent;
        } catch (error) {
            console.error('❌ Error cambiando categoría en ESP32:', error);
            return false;
        }
    }

    /**
     * Solicita el estado de batería del ESP32
     */
    async requestESP32BatteryStatus(): Promise<boolean> {
        try {
            const sent = webSocketController.sendToESP32('battery', {
                timestamp: Date.now()
            });

            if (sent) {
                console.log('🔋 Solicitud de estado de batería enviada al ESP32');
            }

            return sent;
        } catch (error) {
            console.error('❌ Error solicitando estado de batería:', error);
            return false;
        }
    }

    /**
     * Reproduce todos los mensajes de una categoría secuencialmente
     */
    async playCategoryMessagesOnESP32(categoryId: number, childId: number): Promise<boolean> {
        try {
            // Obtener mensajes de la categoría para el niño
            const [messageResults] = await pool.execute(`
                SELECT m.*, cm.is_favorite
                FROM messages m
                INNER JOIN child_messages cm ON m.id = cm.message_id
                WHERE m.category_id = ? AND cm.child_id = ? AND m.is_active = 1
                ORDER BY cm.is_favorite DESC, m.id ASC
                LIMIT 3
            `, [categoryId, childId]);

            const messages = messageResults as any[];
            if (messages.length === 0) {
                console.log(`⚠️ No hay mensajes disponibles para categoría ${categoryId} y niño ${childId}`);
                return false;
            }

            // Cambiar a la categoría primero
            await this.changeCategoryOnESP32(categoryId);

            // Reproducir mensajes con delay
            for (let i = 0; i < messages.length; i++) {
                const message = messages[i];
                const button = i + 1; // Botones 1, 2, 3

                setTimeout(async () => {
                    const sent = webSocketController.sendToESP32('play', {
                        button: button,
                        messageId: message.id,
                        text: message.text,
                        category: categoryId,
                        isFavorite: message.is_favorite,
                        timestamp: Date.now()
                    });

                    if (sent) {
                        await this.logPlayback(message.id, childId, 'esp32_sequence');
                    }
                }, i * 3000); // 3 segundos entre mensajes
            }

            console.log(`🎵 Secuencia de ${messages.length} mensajes iniciada para categoría ${categoryId}`);
            return true;

        } catch (error) {
            console.error('❌ Error reproduciendo secuencia de mensajes:', error);
            return false;
        }
    }

    /**
     * Obtiene el estado actual del ESP32
     */
    getESP32Status(): any {
        return webSocketController.getESP32Status();
    }

    /**
     * Obtiene información de conexiones WebSocket
     */
    getConnectionsInfo(): { esp32: boolean; mobileCount: number } {
        return webSocketController.getConnectedClients();
    }

    /**
     * Envía notificación a todas las apps móviles
     */
    notifyMobileApps(type: string, data: any): void {
        webSocketController.broadcastToAll({
            type: `mobile_${type}`,
            data,
            timestamp: Date.now(),
            from: 'websocket_service'
        });
    }

    /**
     * Apagar o reiniciar el ESP32
     */
    async shutdownESP32(): Promise<boolean> {
        try {
            const sent = webSocketController.sendToESP32('shutdown', {
                timestamp: Date.now(),
                reason: 'api_request'
            });

            if (sent) {
                console.log('🔌 Comando de apagado enviado al ESP32');
            }

            return sent;
        } catch (error) {
            console.error('❌ Error enviando comando de apagado:', error);
            return false;
        }
    }

    /**
     * Registra la reproducción de un mensaje
     */
    private async logPlayback(messageId: number, childId: number, source: string): Promise<void> {
        try {
            await pool.execute(`
                INSERT INTO message_playbacks (message_id, child_id, played_at, source)
                VALUES (?, ?, NOW(), ?)
            `, [messageId, childId, source]);
        } catch (error) {
            console.error('❌ Error registrando reproducción:', error);
        }
    }

    /**
     * Mapea categoría a botón del ESP32 (simple mapping 1-3)
     */
    private getCategoryButton(categoryId: number): number {
        // Mapeo simple: categoría 1 -> botón 1, etc.
        return Math.min(Math.max(categoryId, 1), 3);
    }

    /**
     * Sincronizar mensajes favoritos con ESP32
     */
    async syncFavoriteMessagesWithESP32(childId: number): Promise<boolean> {
        try {
            // Obtener mensajes favoritos del niño
            const [favoriteResults] = await pool.execute(`
                SELECT m.*, c.name as category_name, cm.is_favorite
                FROM messages m
                INNER JOIN child_messages cm ON m.id = cm.message_id
                INNER JOIN categories c ON m.category_id = c.id
                WHERE cm.child_id = ? AND cm.is_favorite = 1 AND m.is_active = 1
                ORDER BY c.id, m.id
                LIMIT 9
            `, [childId]);

            const favorites = favoriteResults as any[];

            // Enviar información de favoritos al ESP32
            const sent = webSocketController.sendToESP32('sync_favorites', {
                childId: childId,
                favorites: favorites.map(msg => ({
                    id: msg.id,
                    text: msg.text,
                    category: msg.category_id,
                    categoryName: msg.category_name,
                    button: this.getCategoryButton(msg.category_id)
                })),
                timestamp: Date.now()
            });

            if (sent) {
                console.log(`⭐ ${favorites.length} mensajes favoritos sincronizados con ESP32`);
            }

            return sent;
        } catch (error) {
            console.error('❌ Error sincronizando favoritos:', error);
            return false;
        }
    }
}

export const webSocketService = new WebSocketService();
