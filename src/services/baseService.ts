import pool from '../config/db.js';

export class BaseService<T> {
  private table: string;

  constructor(table: string) {
    this.table = table;
  }

  async getAll(): Promise<T[]> {
    const [rows] = await pool.query(`SELECT * FROM ${this.table}`);
    return rows as T[];
  }

  async create(data: Partial<T>): Promise<any> {
    const [result] = await pool.query(`INSERT INTO ${this.table} SET ?`, [data]);
    return result;
  }

  async update(id: number, data: Partial<T>): Promise<any> {
    const [result] = await pool.query(`UPDATE ${this.table} SET ? WHERE id = ?`, [data, id]);
    return result;
  }

  async delete(id: number): Promise<any> {
    const [result] = await pool.query(`DELETE FROM ${this.table} WHERE id = ?`, [id]);
    return result;
  }
}
