import { BaseService } from './baseService.js';
import { Role } from '../models/Role.js';


export const roleService = new BaseService<Role>('roles');