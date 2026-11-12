import { createPatientSchema, type PatientStatus } from '@pmd/shared';
import { createDatabase } from '../packages/backend/src/database.js';
import { PatientService } from '../packages/backend/src/modules/patients/patient.service.js';
import { PatientRepository } from '../packages/backend/src/modules/patients/patient.repository.js';

const names = [
  ['Maya', 'Adams'],
  ['Noah', 'Bennett'],
  ['Olivia', 'Brooks'],
  ['Liam', 'Carter'],
  ['Emma', 'Chen'],
  ['Amelia', 'Davis'],
  ['Ethan', 'Diaz'],
  ['Ava', 'Evans'],
  ['Lucas', 'Foster'],
  ['Sophia', 'Garcia'],
  ['Mason', 'Green'],
  ['Isabella', 'Hall'],
  ['James', 'Harris'],
  ['Charlotte', 'Jackson'],
  ['Benjamin', 'Kim'],
  ['王小明', 'Li'],
  ['Harper', 'Martin'],
  ['Henry', 'Moore'],
  ['Evelyn', "O'Neil"],
  ['Alexander', 'Patel'],
  ['Anne-Marie', 'Rivera'],
  ['Daniel', 'Smith'],
  ['Sofia', 'Taylor'],
  ['Longname'.repeat(10), 'Thomas'],
  ['Samuel', 'Wilson'],
];
const statuses: PatientStatus[] = ['Inquiry', 'Onboarding', 'Active', 'Churned'];
const database = createDatabase();
const repository = new PatientRepository(database);
const service = new PatientService(repository);
try {
  let inserted = 0;
  for (const [index, [firstName, lastName]] of names.entries()) {
    const id = `00000000-0000-4000-8000-${String(index + 1).padStart(12, '0')}`;
    if (await service.get(id)) continue;
    const patient = createPatientSchema.parse({
      firstName,
      middleName: index % 3 === 0 ? 'Anne' : null,
      lastName,
      dateOfBirth: index === 0 ? '1000-01-01' : `1990-01-${String(index + 1).padStart(2, '0')}`,
      status: statuses[index % statuses.length],
      address: {
        line1: index === 23 ? 'Example Avenue '.repeat(10).trim() : `${index + 100} Example Avenue`,
        line2: index % 3 === 0 ? 'Apt 4B' : null,
        city: 'Boston',
        state: 'MA',
        postalCode: '02108',
        country: 'US',
      },
    });
    await service.create(patient, id);
    inserted++;
  }
  console.log(`Seed complete: ${inserted} synthetic patients added; existing records preserved.`);
} catch {
  console.error('Seed failed. Check database configuration and initialize the patient table.');
  process.exitCode = 1;
} finally {
  await database.$client.end();
}
