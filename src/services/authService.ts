import pool from '../config/db.js';
import jwt from 'jsonwebtoken';
import { hashUtils } from '../utils/hashUtils.js';

export const authService = {
  async login(email: string, password: string) {
    const [rows]: any = await pool.query('SELECT * FROM users WHERE email = ?', [email]);

    const user = rows[0];
    if (!user) {
      throw { status: 401, message: 'Correo no registrado' };
    }

    const isValid = await hashUtils.compare(password, user.password);
    if (!isValid) {
      throw { status: 401, message: 'Contraseña incorrecta' };
    }

    const token = jwt.sign(
  { id: user.id, email: user.email, role_id: user.role_id },
  process.env.JWT_SECRET as string
 );

    return { token, user: { id: user.id, email: user.email, role_id: user.role_id } };
  }
};
