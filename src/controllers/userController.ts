import { Request, Response, NextFunction } from 'express';
import { userService } from '../services/userService.js';

// GET ALL
export async function getUsersController(req: Request, res: Response, next: NextFunction) {
  try {
    const users = await userService.getAll();
    res.json({
      success: true,
      message: 'Usuarios obtenidos exitosamente',
      data: users
    });
  } catch (err) {
    next(err);
  }
}

// GET BY ID
export async function getUserByIdController(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const user = await userService.getById(Number(id));
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // No devolver la contraseña en la respuesta
    const { password, ...userWithoutPassword } = user;
    
    res.json({
      success: true,
      message: 'Usuario obtenido exitosamente',
      data: userWithoutPassword
    });
  } catch (err) {
    next(err);
  }
}

// POST 
export async function createUserController(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await userService.create(req.body);
    
    // Obtener el usuario creado sin la contraseña
    const newUser = await userService.getById(result.insertId);
    const { password, ...userWithoutPassword } = newUser;
    
    res.status(201).json({
      success: true,
      message: 'Usuario creado exitosamente',
      data: userWithoutPassword
    });
  } catch (err) {
    next(err);
  }
}

// PUT 
export async function updateUserController(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    
    // Verificar si el usuario existe
    const existingUser = await userService.getById(Number(id));
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    await userService.update(Number(id), req.body);
    
    // Obtener el usuario actualizado sin la contraseña
    const updatedUser = await userService.getById(Number(id));
    const { password, ...userWithoutPassword } = updatedUser;
    
    res.json({
      success: true,
      message: 'Usuario actualizado exitosamente',
      data: userWithoutPassword
    });
  } catch (err) {
    next(err);
  }
}

// DELETE 
export async function deleteUserController(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    
    // Verificar si el usuario existe
    const existingUser = await userService.getById(Number(id));
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    await userService.delete(Number(id));
    
    res.json({
      success: true,
      message: 'Usuario eliminado exitosamente'
    });
  } catch (err) {
    next(err);
  }
}
