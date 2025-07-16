import { Request, Response, NextFunction } from 'express';
import { userService } from '../services/userService.js';

// GET 
export async function getUsersController(req: Request, res: Response, next: NextFunction) {
  try {
    const users = await userService.getAll();
    res.json(users);
  } catch (err) {
    next(err);
  }
}

// POST 
export async function createUserController(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await userService.create(req.body);
    res.status(201).json({ message: 'Usuario creado', id: result.insertId });
  } catch (err) {
    next(err);
  }
}

// PUT 
export async function updateUserController(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    await userService.update(Number(id), req.body);
    res.json({ message: 'Usuario actualizado' });
  } catch (err) {
    next(err);
  }
}

// DELETE 
export async function deleteUserController(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    await userService.delete(Number(id));
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
