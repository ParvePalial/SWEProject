import sqlite3 from 'sqlite3';
import { promisify } from 'util';
import path from 'path';

const dbPath = path.resolve(process.cwd(), 'dev.db');
const db = new sqlite3.Database(dbPath);

const dbGet = promisify(db.get.bind(db));
const dbAll = promisify(db.all.bind(db));
const dbRun = promisify(db.run.bind(db));

export async function queryOne(sql: string, params: any[] = []) {
  return await dbGet(sql, params);
}

export async function queryAll(sql: string, params: any[] = []) {
  return await dbAll(sql, params);
}

export async function queryRun(sql: string, params: any[] = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
}
