import { formatDateOfBirth, type CreatePatientData, type PatientSchema } from '@pmd/shared';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Link,
  useBeforeUnload,
  useBlocker,
  useLocation,
  useNavigate,
  useParams,
} from 'react-router-dom';
import { PmdButton } from '@/components/ui/button';
import { PatientForm } from '@/components/dashboard/form';
import { StatusBadge } from '@/components/dashboard/badge';
import { ApiError } from '@/api/request';
import { queryOne, queryList, update } from '@/api/patient';
import { patientName, readListQuery, type PatientNavigationState } from '@/utils/patient';
import { DiscardChangesDialog } from '@/components/dashboard/DiscardChangesDialog';
import { DashboardLayout } from '@/components/ui/layout';

export function PatientPage({ editing = false }: { editing?: boolean }) {
  const { id = '' } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as PatientNavigationState | null;
  const returnTo = state?.returnTo ?? '/';
  const notice = editing ? '' : (state?.notice ?? '');
  const queryClient = useQueryClient();
  const heading = useRef<HTMLHeadingElement>(null);
  const dirty = useRef(false);
  const busy = useRef(false);
  const saved = useRef(false);
  const [saving, setSaving] = useState(false);
  const setDirty = useCallback((value: boolean) => {
    dirty.current = value;
  }, []);
  const setBusy = useCallback((value: boolean) => {
    busy.current = value;
    setSaving(value);
  }, []);
  const blocker = useBlocker(
    useCallback(() => !saved.current && (dirty.current || busy.current), []),
  );
  useBeforeUnload(
    useCallback((event) => {
      if (!saved.current && (dirty.current || busy.current)) {
        event.preventDefault();
        event.returnValue = '';
      }
    }, []),
  );
  useEffect(() => {
    if (blocker.state === 'blocked' && saving) blocker.reset();
  }, [blocker, saving]);
  const detail = useQuery({
    queryKey: ['patients', 'detail', id],
    queryFn: ({ signal }) => queryOne(id, signal),
    refetchOnMount: !editing,
    refetchOnReconnect: !editing,
  });
  const listQuery = readListQuery(new URL(returnTo, 'http://localhost').search);
  const list = useQuery({
    queryKey: ['patients', 'list', listQuery],
    queryFn: ({ signal }) => queryList(listQuery, signal),
    enabled: !!notice,
  });
  useEffect(() => {
    heading.current?.focus();
  }, [id, editing, detail.isPending]);

  async function save(data: CreatePatientData) {
    const patient = await update(id, data);
    await queryClient.cancelQueries({ queryKey: ['patients', 'detail', id] });
    queryClient.setQueryData(['patients', 'detail', id], patient);
    await queryClient.invalidateQueries({ queryKey: ['patients', 'list'], refetchType: 'none' });
    saved.current = true;
    await navigate(`/patients/${id}`, {
      replace: true,
      state: { returnTo, notice: 'Patient updated' },
    });
  }

  return (
    <>
      <DashboardLayout className="min-h-[70vh]" aria-busy={detail.isFetching}>
        <nav aria-label="Patient navigation" className="mb-3 sm:mb-6">
          {saving ? (
            <span className="inline-flex min-h-11 items-center text-sm text-muted">
              Back to patients
            </span>
          ) : (
            <Link
              to={returnTo}
              className="inline-flex min-h-11 items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              <span aria-hidden="true">←</span>Back to patients
            </Link>
          )}
        </nav>
        <div className="mb-6 flex flex-col items-stretch gap-5 sm:mb-7 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
          <div className="min-w-0 sm:flex-1">
            <h1
              ref={heading}
              tabIndex={-1}
              className="text-[26px] leading-tight font-semibold tracking-[-.65px] wrap-anywhere outline-none sm:text-[28px] md:text-[32px]"
            >
              {editing
                ? 'Edit patient'
                : detail.data
                  ? patientName(detail.data)
                  : 'Patient details'}
            </h1>
            {detail.data && (
              <div className="mt-2 sm:mt-3">
                <StatusBadge status={detail.data.status} />
              </div>
            )}
          </div>
          {!editing && detail.isSuccess && (
            <Link
              to={`/patients/${id}/edit`}
              state={{ returnTo }}
              className="inline-flex min-h-11 w-full shrink-0 items-center justify-center rounded-lg bg-primary px-4 py-2 font-medium text-white transition-colors hover:bg-primary-hover motion-reduce:transition-none sm:w-auto"
            >
              Edit patient
            </Link>
          )}
        </div>
        {notice && (
          <p
            role="status"
            className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3.5 text-sm text-emerald-800"
          >
            {notice}
          </p>
        )}
        {notice && list.isError && (
          <div
            role="alert"
            className="mb-6 flex flex-col items-stretch gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3.5 text-sm text-red-800 sm:flex-row sm:flex-wrap sm:items-center"
          >
            <span>Patient saved, but the list couldn’t refresh.</span>
            <PmdButton
              variant="secondary"
              disabled={list.isFetching}
              onClick={() => {
                void list.refetch();
              }}
            >
              Retry list
            </PmdButton>
          </div>
        )}
        {detail.isPending ? (
          <p role="status" className="text-muted">
            Loading patient…
          </p>
        ) : !detail.data ? (
          <div role="alert" className="rounded-xl border border-border bg-white p-4 sm:p-6">
            <h2 className="text-xl font-semibold">
              {detail.error instanceof ApiError &&
              (detail.error.status === 404 || detail.error.status === 400)
                ? 'Patient not found.'
                : 'Couldn’t load this patient.'}
            </h2>
            <PmdButton
              className="mt-4 w-full sm:w-auto"
              variant="secondary"
              disabled={detail.isFetching}
              onClick={() => {
                void detail.refetch();
              }}
            >
              Retry
            </PmdButton>
          </div>
        ) : editing ? (
          <section
            className="mx-auto min-w-0 max-w-4xl overflow-hidden rounded-xl border border-border bg-white"
            aria-label="Edit patient information"
          >
            <PatientForm
              key={id}
              layout="page"
              initialValues={detail.data}
              submitLabel="Save changes"
              onSubmit={save}
              onCancel={() => {
                void navigate(`/patients/${id}`, { state: { returnTo } });
              }}
              onDirtyChange={setDirty}
              onSavingChange={setBusy}
            />
          </section>
        ) : (
          <PatientDetails patient={detail.data} />
        )}
      </DashboardLayout>
      <DiscardChangesDialog
        open={blocker.state === 'blocked' && !saving}
        onKeepEditing={() => {
          if (blocker.state === 'blocked') blocker.reset();
        }}
        onDiscard={() => {
          if (blocker.state === 'blocked') blocker.proceed();
        }}
      />
    </>
  );
}

function PatientDetails({ patient }: { patient: PatientSchema }) {
  return (
    <article className="min-w-0 rounded-xl border border-border bg-white">
      <section aria-labelledby="personal-details" className="p-4 sm:p-6">
        <h2
          id="personal-details"
          className="text-xs font-semibold tracking-wide text-muted uppercase"
        >
          Personal information
        </h2>
        <dl className="mt-5 space-y-5 text-base leading-6 sm:space-y-4 [&>div]:grid [&>div]:min-w-0 [&>div]:grid-cols-1 [&>div]:gap-1 sm:[&>div]:grid-cols-[140px_minmax(0,1fr)] sm:[&>div]:gap-4 [&_dd]:min-w-0 [&_dd]:font-medium [&_dd]:wrap-anywhere [&_dt]:text-sm [&_dt]:text-muted">
          <div>
            <dt>First name</dt>
            <dd>{patient.firstName}</dd>
          </div>
          <div>
            <dt>Middle name</dt>
            <dd>{patient.middleName ?? <span className="text-muted">Not provided</span>}</dd>
          </div>
          <div>
            <dt>Last name</dt>
            <dd>{patient.lastName}</dd>
          </div>
          <div>
            <dt>Date of birth</dt>
            <dd>
              <time dateTime={patient.dateOfBirth}>{formatDateOfBirth(patient.dateOfBirth)}</time>
            </dd>
          </div>
          <div>
            <dt>Address</dt>
            <dd>
              <address className="space-y-1 not-italic">
                <p>{patient.address.line1}</p>
                {patient.address.line2 && <p>{patient.address.line2}</p>}
                <p>
                  {patient.address.city}, {patient.address.state} {patient.address.postalCode}
                </p>
                <p>United States</p>
              </address>
            </dd>
          </div>
        </dl>
      </section>
    </article>
  );
}
