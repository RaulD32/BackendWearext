import joi from 'joi';
import { Request, Response, NextFunction } from 'express';

// Esquemas de validación
export const schemas = {
    // Categorías
    createCategory: joi.object({
        name: joi.string().min(2).max(100).required().messages({
            'string.min': 'El nombre debe tener al menos 2 caracteres',
            'string.max': 'El nombre no puede exceder 100 caracteres',
            'any.required': 'El nombre es requerido'
        }),
        description: joi.string().max(500).optional(),
        color: joi.string().pattern(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/).optional().messages({
            'string.pattern.base': 'El color debe ser un código hexadecimal válido'
        }),
        icon: joi.string().max(50).optional()
    }),

    updateCategory: joi.object({
        name: joi.string().min(2).max(100).optional(),
        description: joi.string().max(500).optional(),
        color: joi.string().pattern(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/).optional(),
        icon: joi.string().max(50).optional()
    }),

    // Mensajes
    createMessage: joi.object({
        text: joi.string().min(1).max(2000).required().messages({
            'string.min': 'El texto no puede estar vacío',
            'string.max': 'El texto no puede exceder 2000 caracteres',
            'any.required': 'El texto es requerido'
        }),
        category_id: joi.number().integer().positive().required().messages({
            'number.base': 'ID de categoría debe ser un número',
            'number.positive': 'ID de categoría debe ser positivo',
            'any.required': 'La categoría es requerida'
        }),
        difficulty: joi.string().valid('facil', 'intermedio', 'dificil').optional().messages({
            'any.only': 'La dificultad debe ser: facil, intermedio o dificil'
        })
    }),

    updateMessage: joi.object({
        text: joi.string().min(1).max(2000).optional(),
        category_id: joi.number().integer().positive().optional(),
        difficulty: joi.string().valid('facil', 'intermedio', 'dificil').optional().messages({
            'any.only': 'La dificultad debe ser: facil, intermedio o dificil'
        }),
        is_active: joi.boolean().optional()
    }),

    // Relaciones
    createRelation: joi.object({
        tutor_id: joi.number().integer().positive().required().messages({
            'any.required': 'ID del tutor es requerido'
        }),
        child_id: joi.number().integer().positive().required().messages({
            'any.required': 'ID del niño es requerido'
        })
    }),

    // Asignación de mensajes a niños
    assignMessage: joi.object({
        child_id: joi.number().integer().positive().required(),
        message_id: joi.number().integer().positive().required()
    }),

    updateChildMessage: joi.object({
        is_favorite: joi.boolean().optional()
    }),

    // Usuarios
    createUser: joi.object({
        name: joi.string().min(2).max(100).required(),
        email: joi.string().email().required(),
        password: joi.string().min(6).max(255).required(),
        role_id: joi.number().integer().positive().required()
    }),

    updateUser: joi.object({
        name: joi.string().min(2).max(100).optional(),
        email: joi.string().email().optional(),
        password: joi.string().min(6).max(255).optional(),
        role_id: joi.number().integer().positive().optional()
    }),

    // Autenticación
    login: joi.object({
        email: joi.string().email().required().messages({
            'string.email': 'Debe ser un email válido',
            'any.required': 'El email es requerido'
        }),
        password: joi.string().min(1).required().messages({
            'any.required': 'La contraseña es requerida'
        })
    }),

    register: joi.object({
        name: joi.string().min(2).max(100).required(),
        email: joi.string().email().required(),
        password: joi.string().min(6).max(255).required(),
        role_id: joi.number().integer().positive().required()
    })
};

// Middleware de validación
export const validate = (schema: joi.ObjectSchema) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const { error } = schema.validate(req.body);

        if (error) {
            const errorMessage = error.details[0].message;
            return res.status(400).json({
                success: false,
                message: 'Error de validación',
                details: errorMessage
            });
        }

        next();
    };
};

// Validación de parámetros de URL
export const validateParams = (schema: joi.ObjectSchema) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const { error } = schema.validate(req.params);

        if (error) {
            const errorMessage = error.details[0].message;
            return res.status(400).json({
                success: false,
                message: 'Parámetros inválidos',
                details: errorMessage
            });
        }

        next();
    };
};

// Esquemas para parámetros
export const paramSchemas = {
    id: joi.object({
        id: joi.number().integer().positive().required()
    })
};
