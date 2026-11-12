/**
 * Public contracts, validation schemas, and utilities shared across workspaces.
 * Keep these exports independent of browser, server, and database APIs.
 */

/** Response body returned by the API health endpoint. */
export type HealthResponse = {
  data: {
    status: 'ok';
  };
};

export {
  createPatientSchema,
  patientAddressSchema,
  patientStatusSchema,
} from './patient-schema.js';
export type {
  CreatePatientInput,
  CreatePatientData,
  Patient,
  PatientAddress,
  PatientStatus,
} from './patient-schema.js';
export { patientListQuerySchema } from './patient-list-schema.js';
export type { PatientListQuery, PatientListResponse } from './patient-list-schema.js';
export { getUtcToday, isValidDateOnly, formatDateOfBirth } from './patient-date.js';
export { usStates } from './us-states.js';
