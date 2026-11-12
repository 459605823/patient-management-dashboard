import { patientStatusSchema, type PatientSchema } from '@pmd/shared';
import { char, date, datetime, mysqlEnum, mysqlTable, varchar } from 'drizzle-orm/mysql-core';

export const patients = mysqlTable('patients', {
  id: char('id', { length: 36 }).primaryKey(),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  middleName: varchar('middle_name', { length: 100 }),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  dateOfBirth: date('date_of_birth', { mode: 'string' }).notNull(),
  status: mysqlEnum('status', patientStatusSchema.enum).notNull(),
  addressLine1: varchar('address_line1', { length: 200 }).notNull(),
  addressLine2: varchar('address_line2', { length: 200 }),
  city: varchar('city', { length: 100 }).notNull(),
  state: char('state', { length: 2 }).$type<PatientSchema['address']['state']>().notNull(),
  postalCode: varchar('postal_code', { length: 10 }).notNull(),
  country: char('country', { length: 2, enum: ['US'] }).notNull(),
  createdAt: datetime('created_at', { mode: 'date', fsp: 3 }).notNull(),
  updatedAt: datetime('updated_at', { mode: 'date', fsp: 3 }).notNull(),
});
