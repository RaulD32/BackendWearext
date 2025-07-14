import { Request, Response, NextFunction } from 'express';
import { createRole, getAllRoles } from '../services/roleService.js';

//POST
export async function createRoleController(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, description } = req.body;

    if (!name || !description) {
      return res.status(400).json({ message: 'Nombre y descripción son requeridos' });
    }

    const id = await createRole(name, description);
    res.status(201).json({ id, name, description });
  } catch (err) {
    next(err);
  }
}

//GET
export async function getRolesController(req: Request, res: Response, next: NextFunction) {
  try {
    const roles = await getAllRoles();
    res.json(roles);
  } catch (error) {
    next(error);
  }
}
