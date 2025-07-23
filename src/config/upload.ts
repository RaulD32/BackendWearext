import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuración de almacenamiento para archivos
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../../uploads');
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const timestamp = Date.now();
        const originalName = file.originalname.replace(/\s+/g, '_');
        cb(null, `${timestamp}_${originalName}`);
    }
});

// Filtro de archivos (solo audio e imágenes)
const fileFilter = (req: any, file: Express.Multer.File, cb: any) => {
    const allowedMimes = [
        'audio/mpeg',
        'audio/wav',
        'audio/ogg',
        'audio/mp3',
        'audio/mp4',
        'image/jpeg',
        'image/png',
        'image/gif'
    ];

    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Tipo de archivo no permitido'), false);
    }
};

// Configuración de multer
export const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB por defecto
        files: 5 // Máximo 5 archivos por request
    }
});

// Configuración específica para diferentes tipos de upload
export const uploadConfigs = {
    single: (fieldName: string) => upload.single(fieldName),
    multiple: (fieldName: string, maxCount: number = 5) => upload.array(fieldName, maxCount),
    fields: (fields: { name: string; maxCount: number }[]) => upload.fields(fields)
};
