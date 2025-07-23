import { Request, Response } from 'express';
import { dataSeeder } from '../seeders/seed.js';

export const runFullSeederController = async (req: Request, res: Response) => {
    try {
        console.log('🚀 Iniciando seeder desde endpoint...');

        await dataSeeder.seedAll();

        res.status(200).json({
            success: true,
            message: 'Seeder ejecutado exitosamente',
            data: {
                seedsExecuted: [
                    'roles',
                    'users',
                    'categories',
                    'relations'
                ],
                defaultUsers: [
                    { email: 'admin@wearext.com', password: 'admin123', role: 'administrador' },
                    { email: 'maria.tutor@wearext.com', password: 'tutor123', role: 'tutor' },
                    { email: 'carlos.tutor@wearext.com', password: 'tutor123', role: 'tutor' },
                    { email: 'ana.nina@wearext.com', password: 'nina123', role: 'niño' },
                    { email: 'luis.nino@wearext.com', password: 'nino123', role: 'niño' }
                ]
            }
        });

    } catch (error) {
        console.error('❌ Error en seeder endpoint:', error);
        res.status(500).json({
            success: false,
            message: 'Error al ejecutar el seeder',
            errors: [error instanceof Error ? error.message : 'Error desconocido']
        });
    }
};

export const runSpecificSeederController = async (req: Request, res: Response) => {
    try {
        const { type } = req.params;

        let result;
        let message;

        switch (type) {
            case 'roles':
                await dataSeeder.seedRoles();
                message = 'Roles sembrados exitosamente';
                result = { seeded: 'roles', items: ['administrador', 'tutor', 'niño'] };
                break;

            case 'users':
                await dataSeeder.seedUsers();
                message = 'Usuarios sembrados exitosamente';
                result = {
                    seeded: 'users',
                    items: [
                        'admin@wearext.com',
                        'maria.tutor@wearext.com',
                        'carlos.tutor@wearext.com',
                        'ana.nina@wearext.com',
                        'luis.nino@wearext.com'
                    ]
                };
                break;

            case 'categories':
                await dataSeeder.seedCategories();
                message = 'Categorías sembradas exitosamente';
                result = {
                    seeded: 'categories',
                    items: ['Saludos', 'Emociones', 'Necesidades', 'Familia', 'Emergencia', 'Escuela', 'Comida', 'Juegos']
                };
                break;

            case 'relations':
                await dataSeeder.seedRelations();
                message = 'Relaciones sembradas exitosamente';
                result = { seeded: 'relations', items: 'tutor-child relationships' };
                break;

            default:
                return res.status(400).json({
                    success: false,
                    message: 'Tipo de seeder no válido',
                    errors: ['Tipos válidos: roles, users, categories, relations']
                });
        }

        res.status(200).json({
            success: true,
            message,
            data: result
        });

    } catch (error) {
        console.error(`❌ Error en seeder específico (${req.params.type}):`, error);
        res.status(500).json({
            success: false,
            message: `Error al ejecutar seeder de ${req.params.type}`,
            errors: [error instanceof Error ? error.message : 'Error desconocido']
        });
    }
};
