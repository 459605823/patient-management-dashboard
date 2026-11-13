import { statusColors } from '@/utils/patient';
import { type PatientStatus } from '@pmd/shared';
import './badge.css';

export function StatusBadge({ status }: { status: PatientStatus }) {
  return <span className={`patient-status-badge ${statusColors[status]}`}>{status}</span>;
}
