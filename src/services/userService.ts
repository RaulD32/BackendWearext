import { BaseService } from './baseService.js';
import { User } from '../models/User.js';

export const userService = new BaseService<User>('users');
