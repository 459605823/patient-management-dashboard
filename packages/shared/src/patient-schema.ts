import { z } from 'zod';
import { getUtcToday, isValidDateOnly } from './patient-date.js';
import { usStates } from './us-states.js';

function textSchema(max: number) {
  // Count Unicode code points so characters outside the BMP count as one, not two.
  return z
    .string()
    .trim()
    .refine((value) => Array.from(value).length <= max, `Must be at most ${max} characters`);
}

function requiredTextSchema(max: number) {
  return textSchema(max).refine((value) => value.length > 0, 'Required');
}

function optionalTextSchema(max: number) {
  // Normalize blank text to null; field-level transforms also map omitted values to null.
  return textSchema(max)
    .nullable()
    .transform((value) => (value === '' ? null : value));
}

/** Stored patient statuses; the list filter's "All" option is not a patient status. */
export const patientStatusSchema = z.enum(['Inquiry', 'Onboarding', 'Active', 'Churned']);

/** US address contract; strict objects reject unknown fields instead of stripping them. */
export const patientAddressSchema = z.strictObject({
  line1: requiredTextSchema(200),
  line2: optionalTextSchema(200)
    .optional()
    .transform((value) => value ?? null),
  city: requiredTextSchema(100),
  state: z.enum(usStates.map((state) => state.code)),
  // Keep ZIP codes as text to preserve leading zeros, including ZIP+4 values.
  postalCode: z
    .string()
    .trim()
    .regex(/^\d{5}(-\d{4})?$/, 'Enter a 5-digit ZIP or ZIP+4'),
  country: z.literal('US'),
});

/**
 * Validates a complete patient form and normalizes it for persistence.
 * Server-managed fields such as id and timestamps are rejected as unknown keys.
 */
export const createPatientSchema = z.strictObject({
  firstName: requiredTextSchema(100),
  middleName: optionalTextSchema(100)
    .optional()
    .transform((value) => value ?? null),
  lastName: requiredTextSchema(100),
  dateOfBirth: z.string().superRefine((value, ctx) => {
    if (!isValidDateOnly(value)) {
      ctx.addIssue({
        code: 'custom',
        message: 'Enter a valid date as YYYY-MM-DD (year 1000–9999)',
      });
    } else if (value > getUtcToday()) {
      // Valid YYYY-MM-DD strings sort chronologically; read today on every validation.
      ctx.addIssue({ code: 'custom', message: 'Date of birth cannot be in the future' });
    }
  }),
  status: patientStatusSchema,
  address: patientAddressSchema,
});

/** Input before parsing; optional text fields may be omitted or supplied as null. */
export type CreatePatientInput = z.input<typeof createPatientSchema>;
/** Parsed data with trimmed text and explicit nulls for empty optional fields. */
export type CreatePatientData = z.output<typeof createPatientSchema>;
export type PatientAddress = z.output<typeof patientAddressSchema>;
export type PatientStatus = z.output<typeof patientStatusSchema>;
/** A saved patient, including server-managed identity and timestamps. */
export type PatientSchema = CreatePatientData & {
  id: string;
  createdAt: string;
  updatedAt: string;
};
