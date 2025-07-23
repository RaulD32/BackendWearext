import { BaseService } from './baseService.js';
import { Category, CreateCategoryDTO, UpdateCategoryDTO } from '../models/Category.js';

export class CategoryService extends BaseService {

    constructor() {
        super('categories');
    }

    async getAllCategories(): Promise<Category[]> {
        try {
            const query = `
        SELECT id, name, description, color, icon, created_at, updated_at 
        FROM categories 
        ORDER BY name ASC
      `;

            const [rows] = await this.pool.execute(query);
            return rows as Category[];
        } catch (error) {
            console.error('Error al obtener categorías:', error);
            throw new Error('Error al obtener categorías');
        }
    }

    async getCategoryById(id: number): Promise<Category | null> {
        try {
            const query = `
        SELECT id, name, description, color, icon, created_at, updated_at 
        FROM categories 
        WHERE id = ?
      `;

            const [rows] = await this.pool.execute(query, [id]);
            const categories = rows as Category[];

            return categories.length > 0 ? categories[0] : null;
        } catch (error) {
            console.error('Error al obtener categoría:', error);
            throw new Error('Error al obtener categoría');
        }
    }

    async createCategory(categoryData: CreateCategoryDTO): Promise<Category> {
        try {
            const query = `
        INSERT INTO categories (name, description, color, icon)
        VALUES (?, ?, ?, ?)
      `;

            const [result] = await this.pool.execute(query, [
                categoryData.name,
                categoryData.description || null,
                categoryData.color || '#000000',
                categoryData.icon || null
            ]);

            const insertResult = result as any;
            const newCategory = await this.getCategoryById(insertResult.insertId);

            if (!newCategory) {
                throw new Error('Error al crear categoría');
            }

            return newCategory;
        } catch (error) {
            console.error('Error al crear categoría:', error);
            if ((error as any).code === 'ER_DUP_ENTRY') {
                throw new Error('Ya existe una categoría con ese nombre');
            }
            throw new Error('Error al crear categoría');
        }
    }

    async updateCategory(id: number, updateData: UpdateCategoryDTO): Promise<Category | null> {
        try {
            const existingCategory = await this.getCategoryById(id);
            if (!existingCategory) {
                return null;
            }

            const fields: string[] = [];
            const values: any[] = [];

            if (updateData.name !== undefined) {
                fields.push('name = ?');
                values.push(updateData.name);
            }
            if (updateData.description !== undefined) {
                fields.push('description = ?');
                values.push(updateData.description);
            }
            if (updateData.color !== undefined) {
                fields.push('color = ?');
                values.push(updateData.color);
            }
            if (updateData.icon !== undefined) {
                fields.push('icon = ?');
                values.push(updateData.icon);
            }

            if (fields.length === 0) {
                return existingCategory;
            }

            fields.push('updated_at = CURRENT_TIMESTAMP');
            values.push(id);

            const query = `UPDATE categories SET ${fields.join(', ')} WHERE id = ?`;
            await this.pool.execute(query, values);

            return await this.getCategoryById(id);
        } catch (error) {
            console.error('Error al actualizar categoría:', error);
            if ((error as any).code === 'ER_DUP_ENTRY') {
                throw new Error('Ya existe una categoría con ese nombre');
            }
            throw new Error('Error al actualizar categoría');
        }
    }

    async deleteCategory(id: number): Promise<boolean> {
        try {
            // Verificar si la categoría tiene mensajes asociados
            const messageCheckQuery = 'SELECT COUNT(*) as count FROM messages WHERE category_id = ?';
            const [messageRows] = await this.pool.execute(messageCheckQuery, [id]);
            const messageCount = (messageRows as any)[0].count;

            if (messageCount > 0) {
                throw new Error('No se puede eliminar la categoría porque tiene mensajes asociados');
            }

            const query = 'DELETE FROM categories WHERE id = ?';
            const [result] = await this.pool.execute(query, [id]);

            return (result as any).affectedRows > 0;
        } catch (error) {
            console.error('Error al eliminar categoría:', error);
            throw error;
        }
    }

    async getCategoriesWithMessageCount(): Promise<(Category & { message_count: number })[]> {
        try {
            const query = `
        SELECT 
          c.id, c.name, c.description, c.color, c.icon, c.created_at, c.updated_at,
          COUNT(m.id) as message_count
        FROM categories c
        LEFT JOIN messages m ON c.id = m.category_id AND m.is_active = true
        GROUP BY c.id, c.name, c.description, c.color, c.icon, c.created_at, c.updated_at
        ORDER BY c.name ASC
      `;

            const [rows] = await this.pool.execute(query);
            return rows as (Category & { message_count: number })[];
        } catch (error) {
            console.error('Error al obtener categorías con contador:', error);
            throw new Error('Error al obtener categorías con contador de mensajes');
        }
    }
}

export const categoryService = new CategoryService();
