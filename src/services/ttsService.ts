import { ttsConfig } from '../config/tts.js';

export class TTSService {

    async generateAudioFromText(text: string, filename?: string): Promise<string> {
        try {
            if (!text || text.trim().length === 0) {
                throw new Error('El texto no puede estar vacío');
            }

            // Limpiar el texto para TTS
            const cleanText = this.cleanTextForTTS(text);

            // Generar audio usando el servicio configurado
            const audioUrl = await ttsConfig.generateAudio(cleanText, filename);

            return audioUrl;
        } catch (error) {
            console.error('Error en TTSService.generateAudioFromText:', error);
            throw new Error('Error al generar audio desde texto');
        }
    }

    async deleteAudio(audioUrl: string): Promise<void> {
        try {
            await ttsConfig.deleteAudio(audioUrl);
        } catch (error) {
            console.error('Error al eliminar audio:', error);
            // No lanzar error, solo loggar
        }
    }

    async checkAudioExists(audioUrl: string): Promise<boolean> {
        try {
            return await ttsConfig.checkAudioExists(audioUrl);
        } catch (error) {
            console.error('Error al verificar existencia de audio:', error);
            return false;
        }
    }

    private cleanTextForTTS(text: string): string {
        // Limpiar texto para mejorar la síntesis de voz
        return text
            .trim()
            // Reemplazar emojis y caracteres especiales
            .replace(/[🎵🎶🎤🎧🔊🔉🔈🔇]/g, '')
            // Normalizar espacios múltiples
            .replace(/\s+/g, ' ')
            // Eliminar caracteres de control
            .replace(/[\x00-\x1F\x7F]/g, '')
            // Limitar longitud máxima para TTS
            .substring(0, 2000);
    }

    async regenerateAudio(text: string, oldAudioUrl?: string): Promise<string> {
        try {
            // Eliminar audio anterior si existe
            if (oldAudioUrl) {
                await this.deleteAudio(oldAudioUrl);
            }

            // Generar nuevo audio
            return await this.generateAudioFromText(text);
        } catch (error) {
            console.error('Error al regenerar audio:', error);
            throw new Error('Error al regenerar audio');
        }
    }

    getAudioFileName(text: string, messageId?: number): string {
        // Generar nombre de archivo basado en contenido
        const textHash = this.generateTextHash(text);
        const timestamp = Date.now();
        const id = messageId || Math.random().toString(36).substr(2, 9);

        return `msg_${id}_${textHash}_${timestamp}.mp3`;
    }

    private generateTextHash(text: string): string {
        // Generar hash simple para el texto
        let hash = 0;
        for (let i = 0; i < text.length; i++) {
            const char = text.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convertir a 32bit integer
        }
        return Math.abs(hash).toString(36);
    }

    validateTextForTTS(text: string): { isValid: boolean; errors: string[] } {
        const errors: string[] = [];

        if (!text || typeof text !== 'string') {
            errors.push('El texto es requerido');
        } else {
            const trimmedText = text.trim();

            if (trimmedText.length === 0) {
                errors.push('El texto no puede estar vacío');
            }

            if (trimmedText.length > 2000) {
                errors.push('El texto no puede exceder 2000 caracteres');
            }

            if (trimmedText.length < 1) {
                errors.push('El texto debe tener al menos 1 caracter');
            }
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }
}

export const ttsService = new TTSService();
