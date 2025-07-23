import pool from '../config/db.js';
import { hashUtils } from '../utils/hashUtils.js';

export class DataSeeder {

    async seedRoles() {
        try {
            console.log('🌱 Sembrando roles...');

            const roles = [
                { name: 'administrador', description: 'Acceso completo al sistema, gestión de usuarios y configuración' },
                { name: 'tutor', description: 'Puede gestionar niños, crear mensajes y categorías' },
                { name: 'niño', description: 'Puede escuchar mensajes asignados y reproducir audios' }
            ];

            for (const role of roles) {
                // Verificar si ya existe
                const [existing] = await pool.execute('SELECT id FROM roles WHERE name = ?', [role.name]);

                if ((existing as any[]).length === 0) {
                    await pool.execute(
                        'INSERT INTO roles (name, description) VALUES (?, ?)',
                        [role.name, role.description]
                    );
                    console.log(`✅ Rol '${role.name}' creado`);
                } else {
                    console.log(`⚠️ Rol '${role.name}' ya existe`);
                }
            }
        } catch (error) {
            console.error('❌ Error al sembrar roles:', error);
            throw error;
        }
    }

    async seedUsers() {
        try {
            console.log('🌱 Sembrando usuarios...');

            // Obtener IDs de roles
            const [roleResults] = await pool.execute('SELECT id, name FROM roles');
            const roles = roleResults as any[];

            const adminRoleId = roles.find(r => r.name === 'administrador')?.id;
            const tutorRoleId = roles.find(r => r.name === 'tutor')?.id;
            const childRoleId = roles.find(r => r.name === 'niño')?.id;

            if (!adminRoleId || !tutorRoleId || !childRoleId) {
                throw new Error('No se encontraron todos los roles necesarios');
            }

            const users = [
                {
                    name: 'Administrador Sistema',
                    email: 'admin@wearext.com',
                    password: 'admin123',
                    role_id: adminRoleId
                },
                {
                    name: 'María García',
                    email: 'maria.tutor@wearext.com',
                    password: 'tutor123',
                    role_id: tutorRoleId
                },
                {
                    name: 'Carlos Rodríguez',
                    email: 'carlos.tutor@wearext.com',
                    password: 'tutor123',
                    role_id: tutorRoleId
                },
                {
                    name: 'Ana Niña',
                    email: 'ana.nina@wearext.com',
                    password: 'nina123',
                    role_id: childRoleId
                },
                {
                    name: 'Luis Niño',
                    email: 'luis.nino@wearext.com',
                    password: 'nino123',
                    role_id: childRoleId
                }
            ];

            for (const user of users) {
                // Verificar si ya existe
                const [existing] = await pool.execute('SELECT id FROM users WHERE email = ?', [user.email]);

                if ((existing as any[]).length === 0) {
                    const hashedPassword = await hashUtils.hash(user.password);
                    await pool.execute(
                        'INSERT INTO users (name, email, password, role_id) VALUES (?, ?, ?, ?)',
                        [user.name, user.email, hashedPassword, user.role_id]
                    );
                    console.log(`✅ Usuario '${user.name}' creado`);
                } else {
                    console.log(`⚠️ Usuario '${user.email}' ya existe`);
                }
            }
        } catch (error) {
            console.error('❌ Error al sembrar usuarios:', error);
            throw error;
        }
    }

    async seedCategories() {
        try {
            console.log('🌱 Sembrando categorías...');

            const categories = [
                { name: 'Saludos', description: 'Mensajes de saludo y despedida', color: '#4CAF50', icon: 'waving-hand' },
                { name: 'Emociones', description: 'Expresión de sentimientos y emociones', color: '#2196F3', icon: 'heart' },
                { name: 'Necesidades', description: 'Comunicación de necesidades básicas', color: '#FF9800', icon: 'help' },
                { name: 'Familia', description: 'Mensajes relacionados con la familia', color: '#9C27B0', icon: 'family' },
                { name: 'Emergencia', description: 'Mensajes de urgencia o emergencia', color: '#F44336', icon: 'emergency' },
                { name: 'Escuela', description: 'Mensajes relacionados con actividades escolares', color: '#00BCD4', icon: 'school' },
                { name: 'Comida', description: 'Mensajes sobre alimentos y comidas', color: '#795548', icon: 'restaurant' },
                { name: 'Juegos', description: 'Mensajes sobre actividades lúdicas', color: '#E91E63', icon: 'toys' }
            ];

            for (const category of categories) {
                // Verificar si ya existe
                const [existing] = await pool.execute('SELECT id FROM categories WHERE name = ?', [category.name]);

                if ((existing as any[]).length === 0) {
                    await pool.execute(
                        'INSERT INTO categories (name, description, color, icon) VALUES (?, ?, ?, ?)',
                        [category.name, category.description, category.color, category.icon]
                    );
                    console.log(`✅ Categoría '${category.name}' creada`);
                } else {
                    console.log(`⚠️ Categoría '${category.name}' ya existe`);
                }
            }
        } catch (error) {
            console.error('❌ Error al sembrar categorías:', error);
            throw error;
        }
    }

    async seedRelations() {
        try {
            console.log('🌱 Sembrando relaciones tutor-niño...');

            // Obtener usuarios
            const [tutorResults] = await pool.execute(`
        SELECT u.id, u.name FROM users u 
        INNER JOIN roles r ON u.role_id = r.id 
        WHERE r.name = 'tutor'
      `);

            const [childResults] = await pool.execute(`
        SELECT u.id, u.name FROM users u 
        INNER JOIN roles r ON u.role_id = r.id 
        WHERE r.name = 'niño'
      `);

            const tutors = tutorResults as any[];
            const children = childResults as any[];

            if (tutors.length === 0 || children.length === 0) {
                console.log('⚠️ No hay tutores o niños para crear relaciones');
                return;
            }

            // Crear relaciones ejemplo
            const relations = [
                { tutor_id: tutors[0]?.id, child_id: children[0]?.id }, // María con Ana
                { tutor_id: tutors[0]?.id, child_id: children[1]?.id }, // María con Luis
                { tutor_id: tutors[1]?.id, child_id: children[0]?.id }  // Carlos con Ana
            ];

            for (const relation of relations) {
                if (relation.tutor_id && relation.child_id) {
                    // Verificar si ya existe
                    const [existing] = await pool.execute(
                        'SELECT id FROM tutor_child_relations WHERE tutor_id = ? AND child_id = ?',
                        [relation.tutor_id, relation.child_id]
                    );

                    if ((existing as any[]).length === 0) {
                        await pool.execute(
                            'INSERT INTO tutor_child_relations (tutor_id, child_id) VALUES (?, ?)',
                            [relation.tutor_id, relation.child_id]
                        );
                        console.log(`✅ Relación creada entre tutor ${relation.tutor_id} y niño ${relation.child_id}`);
                    } else {
                        console.log(`⚠️ Relación ya existe entre tutor ${relation.tutor_id} y niño ${relation.child_id}`);
                    }
                }
            }
        } catch (error) {
            console.error('❌ Error al sembrar relaciones:', error);
            throw error;
        }
    }

    async seedAll() {
        try {
            console.log('🚀 Iniciando seeder completo...\n');

            await this.seedRoles();
            console.log('');

            await this.seedUsers();
            console.log('');

            await this.seedCategories();
            console.log('');

            await this.seedRelations();
            console.log('');

            console.log('🎉 Seeder completado exitosamente!\n');

            console.log('📋 Usuarios creados:');
            console.log('👤 Admin: admin@wearext.com / admin123');
            console.log('👨‍🏫 Tutor María: maria.tutor@wearext.com / tutor123');
            console.log('👨‍🏫 Tutor Carlos: carlos.tutor@wearext.com / tutor123');
            console.log('👶 Niña Ana: ana.nina@wearext.com / nina123');
            console.log('👶 Niño Luis: luis.nino@wearext.com / nino123\n');

        } catch (error) {
            console.error('💥 Error en el seeder:', error);
            throw error;
        }
    }
}

export const dataSeeder = new DataSeeder();
