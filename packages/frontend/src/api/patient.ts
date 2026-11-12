import type {
  CreatePatientData,
  PatientSchema,
  PatientListQuery,
  PatientListResponse,
} from '@pmd/shared';
import { request } from './request';

export function queryList(query: PatientListQuery, signal?: AbortSignal) {
  const params = new URLSearchParams({
    search: query.search,
    status: query.status,
    page: String(query.page),
  });
  return request<PatientListResponse>(`/patients?${params}`, signal ? { signal } : undefined);
}

export async function queryOne(id: string, signal?: AbortSignal) {
  const response = await request<{ data: PatientSchema }>(
    `/patients/${encodeURIComponent(id)}`,
    signal ? { signal } : undefined,
  );
  return response.data;
}

export async function create(input: CreatePatientData) {
  const response = await request<{ data: PatientSchema }>('/patients', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  return response.data;
}

export async function update(id: string, input: CreatePatientData) {
  const response = await request<{ data: PatientSchema }>(`/patients/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  return response.data;
}
