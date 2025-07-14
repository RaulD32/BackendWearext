import pool from '../config/db.js';

import { Product } from '../models/Product.js';

export async function createProduct(product: Product) {
  const { nombre, precio } = product;
  const [result] = await pool.execute(
    'INSERT INTO productos (nombre, precio) VALUES (?, ?)',
    [nombre, precio]
  );
  return result;
}
