import { readFile } from 'node:fs/promises';
import { createDatabase } from '../src/database.js';

const database = createDatabase();
try {
  await database.$client.query(
    await readFile(new URL('../sql/schema.sql', import.meta.url), 'utf8'),
  );
  console.log('Patient table initialized. Existing data preserved.');
} catch (error) {
  console.error('Database initialization failed. Check the connection and schema configuration.');
  if (error instanceof Error && 'code' in error) {
    console.error('Database error code:', error.code);
  }
  process.exitCode = 1;
} finally {
  await database.$client.end();
}
