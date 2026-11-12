import { formatDateOfBirth, type PatientSchema } from '@pmd/shared';
import { Link } from 'react-router-dom';
import { patientName } from '@/utils/patient';
import { StatusBadge } from './badge';

export function PatientTable({
  patients,
  returnTo,
}: {
  patients: PatientSchema[];
  returnTo: string;
}) {
  return (
    <div
      className="h-full overflow-auto [scrollbar-color:var(--color-border)_var(--color-slate-100)] scrollbar-thin"
      tabIndex={0}
      aria-label="Patient directory"
    >
      <table className="w-full table-fixed border-separate border-spacing-0 text-left">
        <caption className="sr-only">Patients sorted by last name</caption>
        <thead className="[&_th]:sticky [&_th]:top-0 [&_th]:z-1 [&_th]:h-12 [&_th]:bg-slate-100 [&_th]:px-2 [&_th]:py-3 [&_th]:text-[13px] [&_th]:font-semibold [&_th]:text-muted md:[&_th]:px-4 md:[&_th]:py-2 min-[1400px]:[&_th]:px-6">
          <tr>
            <th scope="col" className="w-[40%] md:w-[28%]">
              Name
            </th>
            <th scope="col" className="hidden w-[20%] md:table-cell">
              Date of birth
            </th>
            <th scope="col" className="w-[32%] md:w-[18%]">
              Status
            </th>
            <th scope="col" className="hidden w-[20%] md:table-cell">
              City / State
            </th>
            <th scope="col" className="w-[28%] md:w-[14%]">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="[&_td]:h-16 [&_td]:border-b [&_td]:border-slate-200 [&_td]:px-2 [&_td]:py-3 [&_td]:text-sm [&_td]:text-muted [&_td]:wrap-anywhere [&_tr:last-child_td]:border-b-0 md:[&_td]:px-4 md:[&_td]:py-2 md:[&_td]:text-base min-[1400px]:[&_td]:px-6">
          {patients.map((patient) => (
            <tr key={patient.id} className="focus-within:bg-[#f3faf9] hover:bg-[#f3faf9]">
              <td>
                <Link
                  to={`/patients/${patient.id}`}
                  state={{ returnTo }}
                  className="rounded-xs text-left leading-6 font-medium text-primary wrap-anywhere hover:underline hover:underline-offset-3"
                >
                  {patientName(patient)}
                </Link>
              </td>
              <td className="hidden md:table-cell">
                <time dateTime={patient.dateOfBirth}>{formatDateOfBirth(patient.dateOfBirth)}</time>
              </td>
              <td>
                <StatusBadge status={patient.status} />
              </td>
              <td className="hidden md:table-cell">
                {patient.address.city}, {patient.address.state}
              </td>
              <td className="text-right">
                <Link
                  to={`/patients/${patient.id}`}
                  state={{ returnTo }}
                  className="inline-flex min-h-11 items-center justify-center rounded-lg px-0 py-2 text-xs font-medium text-primary hover:underline md:px-2 md:text-sm"
                  aria-label={`View details for ${patientName(patient)}`}
                >
                  View details
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
