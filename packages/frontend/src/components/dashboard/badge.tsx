import {statusColors} from '@/utils/patient'
import { type PatientStatus } from '@pmd/shared';

export function StatusBadge({ status }: { status: PatientStatus }) {
  return (
    <span
      className={
        `inline-flex min-h-7 items-center rounded-md px-2 py-1 text-xs leading-5 font-medium whitespace-nowrap md:px-3 md:text-[13px]
         ${statusColors[status]
      }`}
    >
      {status}
    </span>
  );
}