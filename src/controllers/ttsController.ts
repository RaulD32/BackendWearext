import { Request, Response } from 'express';
import { ttsConfig } from '../config/tts.js';

// Obtener voces disponibles en el sistema
export const getAvailableVoices = async (req: Request, res: Response): Promise<void> => {
    try {
        const voices = await ttsConfig.getAvailableVoices();

        res.json({
            success: true,
            data: {
                voices,
                totalVoices: voices.length,
                recommendation: voices.filter(v => v.Culture.includes('es')).length > 0
                    ? 'Se recomienda usar voces en español para mejor comprensión'
                    : 'No se encontraron voces en español, usando voces del sistema'
            }
        });
    } catch (error) {
        console.error('Error obteniendo voces:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener voces disponibles',
            details: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
};

// Configurar preferencias de voz
export const updateVoiceSettings = async (req: Request, res: Response): Promise<void> => {
    try {
        const { rate, volume, preferFemale, language } = req.body;

        // Validar parámetros
        const settings: any = {};

        if (rate !== undefined) {
            if (rate < -10 || rate > 10) {
                res.status(400).json({
                    success: false,
                    message: 'La velocidad debe estar entre -10 y 10'
                });
                return;
            }
            settings.rate = rate;
        }

        if (volume !== undefined) {
            if (volume < 0 || volume > 100) {
                res.status(400).json({
                    success: false,
                    message: 'El volumen debe estar entre 0 y 100'
                });
                return;
            }
            settings.volume = volume;
        }

        if (preferFemale !== undefined) {
            settings.preferFemale = Boolean(preferFemale);
        }

        if (language !== undefined) {
            settings.language = String(language);
        }

        // Actualizar configuración
        ttsConfig.updateVoiceSettings(settings);

        res.json({
            success: true,
            message: 'Configuración de voz actualizada correctamente',
            data: {
                updatedSettings: settings,
                info: {
                    rate: 'Velocidad: -10 (muy lenta) a 10 (muy rápida)',
                    volume: 'Volumen: 0 (silencio) a 100 (máximo)',
                    preferFemale: 'true = voz femenina, false = voz masculina',
                    language: 'Código de idioma (ej: "es" para español, "en" para inglés)'
                }
            }
        });
    } catch (error) {
        console.error('Error configurando voz:', error);
        res.status(500).json({
            success: false,
            message: 'Error al configurar preferencias de voz',
            details: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
};

// Generar audio de prueba con configuración actual
export const generateTestAudio = async (req: Request, res: Response): Promise<void> => {
    try {
        const { text = 'Hola, esta es una prueba de la nueva configuración de voz' } = req.body;

        const audioUrl = await ttsConfig.generateAudio(text, `test_${Date.now()}.wav`);

        res.json({
            success: true,
            message: 'Audio de prueba generado correctamente',
            data: {
                audioUrl: `${req.protocol}://${req.get('host')}${audioUrl}`,
                text,
                instructions: 'Reproduce el audio para verificar la calidad de la voz'
            }
        });
    } catch (error) {
        console.error('Error generando audio de prueba:', error);
        res.status(500).json({
            success: false,
            message: 'Error al generar audio de prueba',
            details: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
};
