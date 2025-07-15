import { Request, Response, NextFunction } from 'express';
import { roleService } from '../services/roleService.js';

//GET
export async function getRolesController(req: Request, res: Response, next: NextFunction) {
  try {
    const roles = await roleService.getAll();
    res.json(roles);
  } catch (err) {
    next(err);
  }
}

//CREATE
export async function createRoleController(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await roleService.create(req.body);
    res.status(201).json({ message: 'Rol creado', id: result.insertId });
  } catch (err) {
    next(err);
  }
}

//UPDATE
export async function updateRoleController(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    await roleService.update(Number(id), req.body);
    res.json({ message: 'Rol actualizado' });
  } catch (err) {
    next(err);
  }
}

//DELETE
export async function deleteRoleController(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    await roleService.delete(Number(id));
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

