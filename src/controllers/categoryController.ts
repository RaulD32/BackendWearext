import { Request, Response } from 'express';
import { categoryService } from '../services/categoryService.js';
import { AuthRequest } from '../middlewares/authMiddleware.js';

export class CategoryController {

    async getAllCategories(req: Request, res: Response) {
        try {
            const categories = await categoryService.getCategoriesWithMessageCount();

            res.json({
                success: true,
                data: categories,
                message: 'Categorías obtenidas exitosamente'
            });
        } catch (error) {
            console.error('Error en CategoryController.getAllCategories:', error);
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Error interno del servidor'
            });
        }
    }

    async getCategoryById(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const category = await categoryService.getCategoryById(parseInt(id));

            if (!category) {
                return res.status(404).json({
                    success: false,
                    message: 'Categoría no encontrada'
                });
            }

            res.json({
                success: true,
                data: category,
                message: 'Categoría obtenida exitosamente'
            });
        } catch (error) {
            console.error('Error en CategoryController.getCategoryById:', error);
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Error interno del servidor'
            });
        }
    }

    async createCategory(req: AuthRequest, res: Response) {
        try {
            const categoryData = req.body;
            const newCategory = await categoryService.createCategory(categoryData);

            res.status(201).json({
                success: true,
                data: newCategory,
                message: 'Categoría creada exitosamente'
            });
        } catch (error) {
            console.error('Error en CategoryController.createCategory:', error);
            res.status(400).json({
                success: false,
                message: error instanceof Error ? error.message : 'Error al crear categoría'
            });
        }
    }

    async updateCategory(req: AuthRequest, res: Response) {
        try {
            const { id } = req.params;
            const updateData = req.body;

            const updatedCategory = await categoryService.updateCategory(parseInt(id), updateData);

            if (!updatedCategory) {
                return res.status(404).json({
                    success: false,
                    message: 'Categoría no encontrada'
                });
            }

            res.json({
                success: true,
                data: updatedCategory,
                message: 'Categoría actualizada exitosamente'
            });
        } catch (error) {
            console.error('Error en CategoryController.updateCategory:', error);
            res.status(400).json({
                success: false,
                message: error instanceof Error ? error.message : 'Error al actualizar categoría'
            });
        }
    }

    async deleteCategory(req: AuthRequest, res: Response) {
        try {
            const { id } = req.params;
            const deleted = await categoryService.deleteCategory(parseInt(id));

            if (!deleted) {
                return res.status(404).json({
                    success: false,
                    message: 'Categoría no encontrada'
                });
            }

            res.json({
                success: true,
                message: 'Categoría eliminada exitosamente'
            });
        } catch (error) {
            console.error('Error en CategoryController.deleteCategory:', error);
            res.status(400).json({
                success: false,
                message: error instanceof Error ? error.message : 'Error al eliminar categoría'
            });
        }
    }

    async getCategoriesBasic(req: Request, res: Response) {
        try {
            const categories = await categoryService.getAllCategories();

            // Devolver solo información básica para selects/dropdowns
            const basicCategories = categories.map(cat => ({
                id: cat.id,
                name: cat.name,
                color: cat.color,
                icon: cat.icon
            }));

            res.json({
                success: true,
                data: basicCategories,
                message: 'Categorías básicas obtenidas exitosamente'
            });
        } catch (error) {
            console.error('Error en CategoryController.getCategoriesBasic:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }
}

export const categoryController = new CategoryController();
