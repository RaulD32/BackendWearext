// src/services/userService.ts
import { BaseService } from './baseService.js';
import { User } from '../models/User.js';
import { hashUtils } from '../utils/hashUtils.js';

export class UserService extends BaseService {
  constructor() {
    super('users');
  }

  async create(data: Partial<User>): Promise<any> {
    if (data.password) {
      data.password = await hashUtils.hash(data.password);
    }
    return super.create(data);
  }

  async getAll(): Promise<any[]> {
    return super.getAll();
  }

  async update(id: number, data: Partial<User>): Promise<any> {
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
