import { z } from 'zod';
import { patientStatusSchema } from './patient-schema.js';
import type { Patient } from './patient-schema.js';

// Trim surrounding whitespace and count Unicode code points, preserving the search text otherwise.
const searchSchema = z
  .string()
  .trim()
  .refine((value) => Array.from(value).length <= 100, 'Search must be at most 100 characters');

/**
 * Parses raw HTTP query values into filters and a numeric page, applying defaults
 * for omitted fields. Unknown keys and array/object values are rejected.
 */
export const patientListQuerySchema = z.strictObject({
  search: searchSchema.default(''),
  // "All" disables status filtering and is never stored on a patient record.
  status: z.enum(['All', ...patientStatusSchema.options]).default('All'),
  // Require decimal digits before conversion, then enforce the positive 32-bit integer range.
  page: z
    .string()
    .regex(/^\d+$/)
    .transform(Number)
    .pipe(z.number().int().min(1).max(2147483647))
    .default(1),
});

/** Parsed query: page is a number and all defaulted fields are present. */
export type PatientListQuery = z.output<typeof patientListQuerySchema>;
/** List response contract with a fixed page size of 20; this type performs no runtime validation. */
export type PatientListResponse = {
  data: Patient[];
  pagination: { page: number; pageSize: 20; total: number };
};
