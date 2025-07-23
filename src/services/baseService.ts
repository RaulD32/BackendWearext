import pool from '../config/db.js';

export class BaseService {
  protected pool = pool;
  protected table: string;

  constructor(table: string = '') {
    this.table = table;
  }

  async getAll(): Promise<any[]> {
    const [rows] = await this.pool.query(`SELECT * FROM ${this.table}`);
    return rows as any[];
  }

  async getById(id: number): Promise<any | null> {
    const [rows] = await this.pool.query(`SELECT * FROM ${this.table} WHERE id = ?`, [id]);
    const results = rows as any[];
    return results.length > 0 ? results[0] : null;
  }

  async create(data: any): Promise<any> {
    const [result] = await this.pool.query(`INSERT INTO ${this.table} SET ?`, [data]);
    return result;
  }

  async update(id: number, data: any): Promise<any> {
    const [result] = await this.pool.query(`UPDATE ${this.table} SET ? WHERE id = ?`, [data, id]);
    return result;
  }

  async delete(id: number): Promise<any> {
    const [result] = await this.pool.query(`DELETE FROM ${this.table} WHERE id = ?`, [id]);
    return result;
  }
}
