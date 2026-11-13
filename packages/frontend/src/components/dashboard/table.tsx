import { formatDateOfBirth, type PatientSchema } from '@pmd/shared';
import { Link } from 'react-router-dom';
import { patientName } from '@/utils/patient';
import { StatusBadge } from './badge';
import './table.css';

export function PatientTable({
  patients,
  returnTo,
}: {
  patients: PatientSchema[];
  returnTo: string;
}) {
  return (
    <div className="patient-table-scroll" tabIndex={0} aria-label="Patient directory">
      <table className="w-full table-fixed border-separate border-spacing-0 text-left">
        <caption className="sr-only">Patients sorted by last name</caption>
        <thead className="patient-table-head">
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
        <tbody className="patient-table-body">
          {patients.map((patient) => (
            <tr key={patient.id} className="focus-within:bg-[#f3faf9] hover:bg-[#f3faf9]">
              <td>
                <Link
                  to={`/patients/${patient.id}`}
                  state={{ returnTo }}
                  className="patient-table-name"
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
                  className="patient-table-details"
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
