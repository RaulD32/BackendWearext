import pool from '../config/db.js';
import jwt from 'jsonwebtoken';
import { hashUtils } from '../utils/hashUtils.js';

export const authService = {
  async register(userData: { name: string; email: string; password: string; role_id: number }) {
    try {
      // Verificar si el email ya existe
      const [existingUsers]: any = await pool.query('SELECT id FROM users WHERE email = ?', [userData.email]);

      if (existingUsers.length > 0) {
        throw { status: 400, message: 'El email ya está registrado' };
      }

      // Verificar que el rol existe
      const [roles]: any = await pool.query('SELECT id FROM roles WHERE id = ?', [userData.role_id]);

      if (roles.length === 0) {
        throw { status: 400, message: 'Rol no válido' };
      }

      // Hash de la contraseña
      const hashedPassword = await hashUtils.hash(userData.password);

      // Insertar usuario
      const [result]: any = await pool.query(
        'INSERT INTO users (name, email, password, role_id) VALUES (?, ?, ?, ?)',
        [userData.name, userData.email, hashedPassword, userData.role_id]
      );

      // Obtener el usuario creado
      const [newUser]: any = await pool.query(
        `SELECT u.id, u.name, u.email, u.role_id, r.name as role_name 
         FROM users u 
         INNER JOIN roles r ON u.role_id = r.id 
         WHERE u.id = ?`,
        [result.insertId]
      );

      return {
        success: true,
        data: {
          id: newUser[0].id,
          name: newUser[0].name,
          email: newUser[0].email,
          role_id: newUser[0].role_id,
          role_name: newUser[0].role_name
        },
        message: 'Usuario registrado exitosamente'
      };
    } catch (error) {
      console.error('Error en authService.register:', error);
      throw error;
    }
  },

  async login(email: string, password: string) {
    try {
      const [rows]: any = await pool.query(
        `SELECT u.id, u.name, u.email, u.password, u.role_id, r.name as role_name 
         FROM users u 
         INNER JOIN roles r ON u.role_id = r.id 
         WHERE u.email = ?`,
        [email]
      );

      const user = rows[0];
      if (!user) {
        throw { status: 401, message: 'Credenciales incorrectas' };
      }

      const isValid = await hashUtils.compare(password, user.password);
      if (!isValid) {
        throw { status: 401, message: 'Credenciales incorrectas' };
      }

      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          role_id: user.role_id,
          role_name: user.role_name
        },
        process.env.JWT_SECRET as string,
        { expiresIn: '24h' }
      );

      return {
        success: true,
        data: {
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role_id: user.role_id,
            role_name: user.role_name
          }
        },
        message: 'Login exitoso'
      };
    } catch (error) {
      console.error('Error en authService.login:', error);
      throw error;
    }
  },

  async getProfile(userId: number) {
    try {
      const [rows]: any = await pool.query(
        `SELECT u.id, u.name, u.email, u.role_id, r.name as role_name, u.created_at 
         FROM users u 
         INNER JOIN roles r ON u.role_id = r.id 
         WHERE u.id = ?`,
        [userId]
      );

      const user = rows[0];
      if (!user) {
        throw { status: 404, message: 'Usuario no encontrado' };
      }

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        role_id: user.role_id,
        role_name: user.role_name,
        created_at: user.created_at
      };
    } catch (error) {
      console.error('Error en authService.getProfile:', error);
      throw error;
    }
  }
};
