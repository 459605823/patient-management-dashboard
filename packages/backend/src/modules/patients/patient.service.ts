import { randomUUID } from 'node:crypto';
import type { CreatePatientData, PatientSchema, PatientListQuery } from '@pmd/shared';
import type { PatientRepository } from './patient.repository.js';

export class PatientService {
  constructor(private readonly repository: PatientRepository) {}

  list(query: PatientListQuery) {
    return this.repository.listPatients(query);
  }

  get(id: string) {
    return this.repository.getPatient(id);
  }

  async create(data: CreatePatientData, id: string = randomUUID()): Promise<PatientSchema> {
    await this.repository.insertPatient(id, data);
    const patient = await this.readAfterWrite(id);
    if (!patient)
      throw Object.assign(new Error('Saved patient is no longer available.'), {
        code: 'SAVE_RESULT_UNAVAILABLE',
      });
    return patient;
  }

  async update(id: string, data: CreatePatientData): Promise<PatientSchema | null> {
    await this.repository.updatePatient(id, data);
    return this.readAfterWrite(id);
  }

  private async readAfterWrite(id: string) {
    try {
      return await this.get(id);
    } catch {
      throw Object.assign(new Error('Patient saved, but the saved result could not be read.'), {
        code: 'SAVE_RESULT_UNAVAILABLE',
      });
    }
  }
}
