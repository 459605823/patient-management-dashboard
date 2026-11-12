import { z } from 'zod';

// Accept real calendar dates in YYYY-MM-DD format, limited to years 1000 through 9999.
const dateOnlySchema = z.iso
  .date()
  .length(10)
  .refine((value) => value >= '1000-01-01');

/** Use the UTC calendar day so validation does not depend on the host's local timezone. */
export function getUtcToday(now = new Date()): string {
  return now.toISOString().slice(0, 10);
}

/** Checks format and calendar validity; future-date restrictions belong to the patient schema. */
export function isValidDateOnly(value: string): boolean {
  return dateOnlySchema.safeParse(value).success;
}

// Match the UTC instant used below to prevent the displayed birthday from shifting by a day.
const dateFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: 'UTC',
  month: 'short',
  day: 'numeric',
  year: 'numeric',
});

/** Formats a valid date as "Jan 15, 1990" and throws RangeError for invalid calendar dates. */
export function formatDateOfBirth(value: string): string {
  if (!isValidDateOnly(value)) throw new RangeError('Invalid date of birth');
  return dateFormatter.format(new Date(`${value}T00:00:00.000Z`));
}
