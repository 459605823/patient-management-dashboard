import type {
  CreatePatientData,
  Patient,
  PatientListQuery,
  PatientListResponse,
} from '@pmd/shared';
import { and, asc, count, eq, or, sql } from 'drizzle-orm';
import type { Database } from '../../database.js';
import { patients } from './entity/index.js';

export class PatientRepository {
  constructor(private readonly database: Database) {}

  static toPatient(row: typeof patients.$inferSelect): Patient {
    return {
      id: row.id,
      firstName: row.firstName,
      middleName: row.middleName,
      lastName: row.lastName,
      dateOfBirth: row.dateOfBirth,
      status: row.status,
      address: {
        line1: row.addressLine1,
        line2: row.addressLine2,
        city: row.city,
        state: row.state,
        postalCode: row.postalCode,
        country: row.country,
      },
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  }

  async getPatient(id: string): Promise<Patient | null> {
    const [row] = await this.database.select().from(patients).where(eq(patients.id, id)).limit(1);
    return row ? PatientRepository.toPatient(row) : null;
  }

  async listPatients(query: PatientListQuery): Promise<PatientListResponse> {
    const keyword = `%${query.search.replace(/[!%_]/g, (value) => `!${value}`)}%`;
    const where = and(
      query.search
        ? or(
            ...[patients.firstName, patients.middleName, patients.lastName].map(
              (column) => sql`${column} LIKE ${keyword} ESCAPE '!'`,
            ),
          )
        : undefined,
      query.status !== 'All' ? eq(patients.status, query.status) : undefined,
    );
    const [counts] = await this.database.select({ total: count() }).from(patients).where(where);
    const rows = await this.database
      .select()
      .from(patients)
      .where(where)
      .orderBy(asc(patients.lastName), asc(patients.firstName), asc(patients.id))
      .limit(20)
      .offset((query.page - 1) * 20);
    return {
      data: rows.map(PatientRepository.toPatient),
      pagination: { page: query.page, pageSize: 20, total: counts!.total },
    };
  }

  formValues(data: CreatePatientData) {
    const { address, ...fields } = data;
    return {
      ...fields,
      addressLine1: address.line1,
      addressLine2: address.line2,
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country,
    };
  }

  async insertPatient(id: string, data: CreatePatientData): Promise<void> {
    await this.database.insert(patients).values({
      id,
      ...this.formValues(data),
      createdAt: sql`UTC_TIMESTAMP(3)`,
      updatedAt: sql`UTC_TIMESTAMP(3)`,
    });
  }

  async updatePatient(id: string, data: CreatePatientData): Promise<void> {
    await this.database
      .update(patients)
      .set({ ...this.formValues(data), updatedAt: sql`UTC_TIMESTAMP(3)` })
      .where(eq(patients.id, id));
  }
}
