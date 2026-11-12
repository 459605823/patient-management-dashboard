import { type PatientStatus, type PatientSchema, patientListQuerySchema, type PatientListQuery } from '@pmd/shared';

export type PatientNavigationState = {
  returnTo?: string;
  notice?: string;
};

export const statusColors: Record<PatientStatus, string> = {
  Inquiry: 'bg-slate-100 text-muted',
  Onboarding: 'bg-blue-50 text-blue-700',
  Active: 'bg-emerald-50 text-emerald-700',
  Churned: 'bg-orange-50 text-orange-800',
};

export function patientName(patient: PatientSchema) {
  return [patient.firstName, patient.middleName, patient.lastName].filter(Boolean).join(' ');
}

export function readListQuery(search: string): PatientListQuery {
  const params = new URLSearchParams(search);
  const parsed = patientListQuerySchema.safeParse({
    search: params.get('search') ?? undefined,
    status: params.get('status') ?? undefined,
    page: params.get('page') ?? undefined,
  });
  return parsed.success ? parsed.data : { search: '', status: 'All', page: 1 };
}

export function listUrl(query: PatientListQuery) {
  const params = new URLSearchParams();
  if (query.search) params.set('search', query.search);
  if (query.status !== 'All') params.set('status', query.status);
  if (query.page !== 1) params.set('page', String(query.page));
  return params.size ? `/?${params}` : '/';
}
