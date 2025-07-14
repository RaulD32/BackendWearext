import  pool  from '../config/db.js';
import { ResultSetHeader } from 'mysql2';
import { Role } from '../models/Role.js';


//CREATE ROLE
export async function createRole(name: string, description: string): Promise<number> {
  const [result] = await pool.query<ResultSetHeader>(
    'INSERT INTO roles (name, description) VALUES (?, ?)',
    [name, description]
  );

  return result.insertId;
}

export async function getAllRoles(): Promise<Role[]> {
  const [rows] = await pool.query('SELECT * FROM roles');
  return rows as Role[];
}