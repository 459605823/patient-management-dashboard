import type { Database } from '../../database.js';
import { createPatientController } from './patient.controller.js';
import { PatientService } from './patient.service.js';
import { PatientRepository } from './patient.repository.js';

export function createPatientModule(database: Database) {
  const repository = new PatientRepository(database);
  const service = new PatientService(repository);
  return createPatientController(service);
}
