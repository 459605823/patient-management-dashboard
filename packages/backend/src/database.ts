import { createPool } from 'mysql2/promise';
import { drizzle } from 'drizzle-orm/mysql2';

export function createDatabase(env = process.env) {
  if (!env.DATABASE_PASSWORD) throw new Error('DATABASE_PASSWORD is required');
  if (!env.DATABASE_HOST) throw new Error('DATABASE_HOST is required');
  if (!env.DATABASE_NAME) throw new Error('DATABASE_NAME is required');
  if (!env.DATABASE_USER) throw new Error('DATABASE_USER is required');
  return drizzle({
    client: createPool({
      host: env.DATABASE_HOST,
      port: Number(env.DATABASE_PORT ?? 3306),
      database: env.DATABASE_NAME,
      user: env.DATABASE_USER,
      password: env.DATABASE_PASSWORD,
      timezone: 'Z',
      dateStrings: true,
      charset: 'utf8mb4',
      connectionLimit: 5,
    }),
  });
}

export type Database = ReturnType<typeof createDatabase>;
