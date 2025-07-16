// src/services/userService.ts
import { BaseService } from './baseService.js';
import { User } from '../models/User.js';
import { hashUtils } from '../utils/hashUtils.js';

export class UserService extends BaseService<User> {
  constructor() {
    super('users');
  }

  async create(data: Partial<User>): Promise<any> {
    if (data.password) {
      data.password = await hashUtils.hash(data.password);
    }
    return super.create(data);
  }
}

export const userService = new UserService();
