import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuración del cliente TTS que genera archivos WAV con voz real
export class TTSConfig {
    private audioDir: string;
    private defaultVoiceSettings = {
        rate: -2,      // Velocidad: -10 (muy lenta) a 10 (muy rápida)
        volume: 95,    // Volumen: 0 a 100
        preferFemale: true,  // Preferir voz femenina
        language: 'es'       // Idioma preferido
    };

    constructor() {
        // Directorio para guardar archivos de audio
        this.audioDir = path.join(__dirname, '../../uploads/audio');
        this.ensureAudioDirectory();
    }

    private async ensureAudioDirectory(): Promise<void> {
        try {
            await fs.access(this.audioDir);
        } catch {
            await fs.mkdir(this.audioDir, { recursive: true });
        }
    }

    async generateAudio(text: string, filename?: string): Promise<string> {
        try {
            console.log(`🎵 Generando audio TTS para: "${text}"`);

            // Asegurar que el directorio existe
            await this.ensureAudioDirectory();

            // Generar nombre de archivo único si no se proporciona
            const audioFilename = filename || `tts_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.wav`;
            const audioPath = path.join(this.audioDir, audioFilename);

            // Intentar generar audio real con PowerShell
            try {
                await this.generateRealTTS(text, audioPath);

                // Verificar que el archivo se creó y tiene contenido
                const stats = await fs.stat(audioPath);
                if (stats.size > 1000) { // Si tiene más de 1KB, probablemente es válido
                    console.log(`✅ Audio TTS real creado: ${audioFilename} (${stats.size} bytes)`);
                    return `/uploads/audio/${audioFilename}`;
                }
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
                console.log(`⚠️ TTS real falló, usando sintético: ${errorMessage}`);
            }

            // Si falla el TTS real, usar sintético como respaldo
            await this.generateBasicWAV(text, audioPath);
            console.log(`✅ Audio TTS sintético creado: ${audioFilename}`);
            return `/uploads/audio/${audioFilename}`;

        } catch (error) {
            console.error('Error al generar audio TTS:', error);

            // Si todo falla, crear un archivo de respaldo
            const fallbackFilename = filename || `fallback_${Date.now()}.txt`;
            const fallbackPath = path.join(this.audioDir, fallbackFilename);
            const fallbackContent = `Audio TTS para: "${text}"\nGenerado: ${new Date().toISOString()}\nNota: Error en generación de audio real, archivo de texto como respaldo.`;

            await fs.writeFile(fallbackPath, fallbackContent, 'utf8');
            return `/uploads/audio/${fallbackFilename}`;
        }
    }

    private async generateRealTTS(text: string, outputPath: string): Promise<void> {
        return new Promise((resolve, reject) => {
            // Escapar texto para PowerShell
            const escapedText = text.replace(/'/g, "''").replace(/"/g, '""');
            const escapedPath = outputPath.replace(/\\/g, '\\\\');

            // Script PowerShell más robusto
            const psScript = `
try {
    Add-Type -AssemblyName System.Speech
    $synth = New-Object System.Speech.Synthesis.SpeechSynthesizer
    
    # Listar todas las voces disponibles para encontrar la mejor
    $allVoices = $synth.GetInstalledVoices()
    
    # Priorizar voces en español (cualquier variante)
    $spanishVoice = $allVoices | Where-Object { 
        $_.VoiceInfo.Culture.Name -like "${this.defaultVoiceSettings.language}*" -and 
        $_.VoiceInfo.Gender -eq "${this.defaultVoiceSettings.preferFemale ? 'Female' : 'Male'}"
    } | Select-Object -First 1
    
    # Si no hay voz del género preferido en español, buscar cualquier género en español
    if (-not $spanishVoice) {
        $spanishVoice = $allVoices | Where-Object { 
            $_.VoiceInfo.Culture.Name -like "${this.defaultVoiceSettings.language}*"
        } | Select-Object -First 1
    }
    
    # Si no hay voces en español, usar la mejor voz disponible (preferir género seleccionado)
    if (-not $spanishVoice) {
        $spanishVoice = $allVoices | Where-Object { 
            $_.VoiceInfo.Gender -eq "${this.defaultVoiceSettings.preferFemale ? 'Female' : 'Male'}"
        } | Select-Object -First 1
    }
    
    # Como último recurso, usar cualquier voz disponible
    if (-not $spanishVoice) {
        $spanishVoice = $allVoices | Select-Object -First 1
    }
    
    if ($spanishVoice) {
        $synth.SelectVoice($spanishVoice.VoiceInfo.Name)
        Write-Host "Usando voz: $($spanishVoice.VoiceInfo.Name) - $($spanishVoice.VoiceInfo.Culture.Name) - $($spanishVoice.VoiceInfo.Gender)"
    }
    
    # Configurar parámetros para voz más agradable
    $synth.Rate = ${this.defaultVoiceSettings.rate}     # Velocidad configurada
    $synth.Volume = ${this.defaultVoiceSettings.volume} # Volumen configurado
    
    # Generar audio con configuración optimizada
    $synth.SetOutputToWaveFile('${escapedPath}')
    $synth.Speak('${escapedText}')
    $synth.SetOutputToNull()
    $synth.Dispose()
    
    Write-Host "SUCCESS: Audio generado correctamente"
} catch {
    Write-Error "ERROR: $($_.Exception.Message)"
    exit 1
}
            `.trim();

            const child = spawn('powershell', [
                '-ExecutionPolicy', 'Bypass',
                '-Command', psScript
            ], {
                stdio: ['pipe', 'pipe', 'pipe'],
                shell: false
            });

            let stdout = '';
            let stderr = '';

            child.stdout?.on('data', (data) => {
                stdout += data.toString();
            });

            child.stderr?.on('data', (data) => {
                stderr += data.toString();
            });

            child.on('close', (code) => {
                if (code === 0 && stdout.includes('SUCCESS')) {
                    resolve();
                } else {
                    reject(new Error(`PowerShell TTS falló: ${stderr || stdout || 'Error desconocido'}`));
                }
            });

            child.on('error', (error) => {
                reject(new Error(`Error ejecutando PowerShell: ${error.message}`));
            });

            // Timeout de 10 segundos
            setTimeout(() => {
                child.kill();
                reject(new Error('Timeout: PowerShell TTS tardó demasiado'));
            }, 10000);
        });
    }

    private async generateBasicWAV(text: string, outputPath: string): Promise<void> {
        try {
            // Configuración básica del WAV
            const sampleRate = 44100;
            const duration = Math.max(2, text.length * 0.1); // Duración basada en texto
            const numSamples = Math.floor(sampleRate * duration);

            // Crear header WAV manualmente
            const headerSize = 44;
            const dataSize = numSamples * 2; // 16-bit = 2 bytes por sample
            const fileSize = headerSize + dataSize - 8;

            const buffer = Buffer.alloc(headerSize + dataSize);

            // Header WAV
            let offset = 0;

            // RIFF header
            buffer.write('RIFF', offset); offset += 4;
            buffer.writeUInt32LE(fileSize, offset); offset += 4;
            buffer.write('WAVE', offset); offset += 4;

            // fmt chunk
            buffer.write('fmt ', offset); offset += 4;
            buffer.writeUInt32LE(16, offset); offset += 4; // chunk size
            buffer.writeUInt16LE(1, offset); offset += 2;  // audio format (PCM)
            buffer.writeUInt16LE(1, offset); offset += 2;  // num channels
            buffer.writeUInt32LE(sampleRate, offset); offset += 4; // sample rate
            buffer.writeUInt32LE(sampleRate * 2, offset); offset += 4; // byte rate
            buffer.writeUInt16LE(2, offset); offset += 2;  // block align
            buffer.writeUInt16LE(16, offset); offset += 2; // bits per sample

            // data chunk
            buffer.write('data', offset); offset += 4;
            buffer.writeUInt32LE(dataSize, offset); offset += 4;

            // Generar datos de audio sintético básico
            const words = text.split(' ');
            const samplesPerWord = Math.floor(numSamples / words.length);

            for (let i = 0; i < numSamples; i++) {
                const wordIndex = Math.floor(i / samplesPerWord);
                const word = words[wordIndex] || '';

                // Frecuencia basada en la palabra
                const freq = 200 + (word.length * 30);
                const t = i / sampleRate;

                // Generar tono simple que simula habla
                let amplitude = 0;
                if (word.match(/[aeiouáéíóú]/i)) {
                    // Vocales: tono más claro
                    amplitude = Math.sin(2 * Math.PI * freq * t) * 0.3;
                } else if (word.length > 0) {
                    // Consonantes: mezcla de frecuencias
                    amplitude = (Math.sin(2 * Math.PI * freq * t) +
                        Math.sin(2 * Math.PI * (freq * 1.5) * t) * 0.5) * 0.2;
                }

                // Aplicar envelope para suavizar
                const wordProgress = (i % samplesPerWord) / samplesPerWord;
                const envelope = Math.sin(Math.PI * wordProgress) * 0.8;

                // Convertir a 16-bit signed integer
                const sample = Math.floor(amplitude * envelope * 32767);
                const clampedSample = Math.max(-32768, Math.min(32767, sample));

                buffer.writeInt16LE(clampedSample, offset);
                offset += 2;
            }

            // Guardar archivo
            await fs.writeFile(outputPath, buffer);

            // Verificar que el archivo se creó correctamente
            const stats = await fs.stat(outputPath);
            if (stats.size === 0) {
                throw new Error('El archivo de audio se creó pero está vacío');
            }

            console.log(`📁 Archivo WAV creado: ${outputPath} (${stats.size} bytes, ${duration.toFixed(1)}s)`);

        } catch (error) {
            console.error('Error generando WAV básico:', error);
            throw error;
        }
    }

    async deleteAudio(audioUrl: string): Promise<void> {
        try {
            if (!audioUrl || !audioUrl.includes('/uploads/audio/')) {
                return;
            }

            const filename = audioUrl.split('/').pop();
            if (!filename) return;

            const audioPath = path.join(this.audioDir, filename);
            await fs.unlink(audioPath);
            console.log(`🗑️ Archivo de audio eliminado: ${filename}`);
        } catch (error) {
            console.error('Error al eliminar archivo de audio:', error);
            // No lanzar error, solo loggar
        }
    }

    async checkAudioExists(audioUrl: string): Promise<boolean> {
        try {
            if (!audioUrl || !audioUrl.includes('/uploads/audio/')) {
                return false;
            }

            const filename = audioUrl.split('/').pop();
            if (!filename) return false;

            const audioPath = path.join(this.audioDir, filename);
            await fs.access(audioPath);
            return true;
        } catch {
            return false;
        }
    }

    // Método para obtener información de voces disponibles
    async getAvailableVoices(): Promise<any[]> {
        return new Promise((resolve, reject) => {
            const psScript = `
try {
    Add-Type -AssemblyName System.Speech
    $synth = New-Object System.Speech.Synthesis.SpeechSynthesizer
    
    $voices = $synth.GetInstalledVoices() | ForEach-Object {
        @{
            Name = $_.VoiceInfo.Name
            Culture = $_.VoiceInfo.Culture.Name
            Gender = $_.VoiceInfo.Gender.ToString()
            Age = $_.VoiceInfo.Age.ToString()
            Description = $_.VoiceInfo.Description
        }
    }
    
    $voices | ConvertTo-Json
    $synth.Dispose()
} catch {
    Write-Error "ERROR: $($_.Exception.Message)"
    exit 1
}
            `.trim();

            const child = spawn('powershell', [
                '-ExecutionPolicy', 'Bypass',
                '-Command', psScript
            ], {
                stdio: ['pipe', 'pipe', 'pipe'],
                shell: false
            });

            let stdout = '';
            let stderr = '';

            child.stdout?.on('data', (data) => {
                stdout += data.toString();
            });

            child.stderr?.on('data', (data) => {
                stderr += data.toString();
            });

            child.on('close', (code) => {
                if (code === 0) {
                    try {
                        const voices = JSON.parse(stdout);
                        resolve(Array.isArray(voices) ? voices : [voices]);
                    } catch (parseError) {
                        resolve([]);
                    }
                } else {
                    reject(new Error(`Error obteniendo voces: ${stderr || 'Error desconocido'}`));
                }
            });

            child.on('error', (error) => {
                reject(new Error(`Error ejecutando PowerShell: ${error.message}`));
            });

            setTimeout(() => {
                child.kill();
                reject(new Error('Timeout obteniendo voces'));
            }, 5000);
        });
    }

    // Método para configurar preferencias de voz
    updateVoiceSettings(settings: {
        rate?: number;
        volume?: number;
        preferFemale?: boolean;
        language?: string;
    }): void {
        this.defaultVoiceSettings = { ...this.defaultVoiceSettings, ...settings };
        console.log('🎤 Configuración de voz actualizada:', this.defaultVoiceSettings);
    }
}

// Instancia singleton
export const ttsConfig = new TTSConfig();
