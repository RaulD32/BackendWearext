// src/services/userService.ts
import { BaseService } from './baseService.js';
import { User } from '../models/User.js';
import { hashUtils } from '../utils/hashUtils.js';

export class UserService extends BaseService {
  constructor() {
    super('users');
  }

  async create(data: Partial<User>): Promise<any> {
    // Verificar si el email ya existe
    const existingUser = await this.findByEmail(data.email!);
    if (existingUser) {
      throw new Error('El email ya está registrado');
    }

    if (data.password) {
      data.password = await hashUtils.hash(data.password);
    }
    return super.create(data);
  }

  async getAll(): Promise<any[]> {
    const users = await super.getAll();
    // Remover contraseñas de la respuesta
    return users.map(user => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
  }

  async getById(id: number): Promise<any | null> {
    return super.getById(id);
  }

  async findByEmail(email: string): Promise<any | null> {
    const [rows] = await this.pool.query('SELECT * FROM users WHERE email = ?', [email]);
    const results = rows as any[];
    return results.length > 0 ? results[0] : null;
  }

  async update(id: number, data: Partial<User>): Promise<any> {
    // Si se está actualizando el email, verificar que no exista
    if (data.email) {
      const existingUser = await this.findByEmail(data.email);
      if (existingUser && existingUser.id !== id) {
        throw new Error('El email ya está registrado por otro usuario');
      }
    }

    if (data.password) {
      data.password = await hashUtils.hash(data.password);
    }
    return super.update(id, data);
  }

  async delete(id: number): Promise<any> {
    return super.delete(id);
  }
}

export const userService = new UserService();
