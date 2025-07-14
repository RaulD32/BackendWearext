import { Request, Response, NextFunction } from 'express';
import { createProduct } from '../services/productService.js';
// import { Product } from '../models/Product.js';


export async function createProductController(req: Request, res: Response, next: NextFunction) {
  try {
    const { nombre, precio } = req.body;
    if (!nombre || !precio) {
      return res.status(400).json({ message: 'Faltan campos obligatorios' });
    }

    const result = await createProduct({ nombre, precio });

    res.status(201).json({ message: 'Producto creado', result });
  } catch (error) {
    next(error);
  }
}
