import type {Express} from 'express';
import type { Database } from '../database.js';
import { createPatientModule } from './patients/patient.module.js';

export function createRoute(app: Express, db?: Database) {
  if (db) {
    app.use('/api/patients', createPatientModule(db))
  };
  app.use('/api', (_request, response) => {
    response.status(404).json({ error: { code: 'NOT_FOUND', message: 'API route not found.' } });
  });
}