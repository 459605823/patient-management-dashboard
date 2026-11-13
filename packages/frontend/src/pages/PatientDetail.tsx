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
import './PatientDetail.css';

export function PatientDetails({ editing = false }: { editing?: boolean }) {
  const { id = '' } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as PatientNavigationState | null;
  const returnTo = state?.returnTo ?? '/';
  const notice = editing ? '' : (state?.notice ?? '');
  const queryClient = useQueryClient();
  const [noticeVisible, setNoticeVisible] = useState(Boolean(notice));
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
  const dismissNotice = useCallback(() => {
    setNoticeVisible(false);
    void navigate(location.pathname, { replace: true, state: { returnTo } });
  }, [location.pathname, navigate, returnTo]);
  useEffect(() => {
    if (!notice) return;
    const timeout = window.setTimeout(dismissNotice, 3000);
    return () => window.clearTimeout(timeout);
  }, [dismissNotice, notice]);
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
        <PatientDetailHeader
          heading={heading}
          editing={editing}
          id={id}
          patient={detail.data}
          showEdit={detail.isSuccess}
          saving={saving}
          returnTo={returnTo}
        />
        <PatientDetailNotices
          notice={notice}
          noticeVisible={noticeVisible}
          listError={list.isError}
          listFetching={list.isFetching}
          onDismiss={dismissNotice}
          onRetryList={() => void list.refetch()}
        />
        {detail.isPending ? (
          <p role="status" className="text-muted">
            Loading patient…
          </p>
        ) : !detail.data ? (
          <PatientDetailLoadError
            error={detail.error}
            isFetching={detail.isFetching}
            onRetry={() => void detail.refetch()}
          />
        ) : editing ? (
          <section
            className="min-w-0 overflow-hidden rounded-xl border border-border bg-white"
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
          <PatientInfomation patient={detail.data} />
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

function PatientDetailHeader({
  heading,
  editing,
  id,
  patient,
  showEdit,
  saving,
  returnTo,
}: {
  heading: React.RefObject<HTMLHeadingElement | null>;
  editing: boolean;
  id: string;
  patient: PatientSchema | undefined;
  showEdit: boolean;
  saving: boolean;
  returnTo: string;
}) {
  return (
    <>
      <nav aria-label="Patient navigation" className="mb-3 sm:mb-6">
        {saving ? (
          <span className="inline-flex min-h-11 items-center text-sm text-muted">
            Back to patients
          </span>
        ) : (
          <Link to={returnTo} className="patient-detail-back">
            <span aria-hidden="true">←</span>Back to patients
          </Link>
        )}
      </nav>
      <div className="patient-detail-header">
        <div className="min-w-0 sm:flex-1">
          <h1 ref={heading} tabIndex={-1} className="patient-detail-heading">
            {editing ? 'Edit patient' : patient ? patientName(patient) : 'Patient details'}
          </h1>
          {patient && !editing && (
            <div className="mt-2 sm:mt-3">
              <StatusBadge status={patient.status} />
            </div>
          )}
        </div>
        {!editing && showEdit && patient && (
          <Link to={`/patients/${id}/edit`} state={{ returnTo }} className="patient-detail-edit">
            Edit patient
          </Link>
        )}
      </div>
    </>
  );
}

function PatientDetailNotices({
  notice,
  noticeVisible,
  listError,
  listFetching,
  onDismiss,
  onRetryList,
}: {
  notice: string;
  noticeVisible: boolean;
  listError: boolean;
  listFetching: boolean;
  onDismiss: () => void;
  onRetryList: () => void;
}) {
  return (
    <>
      {notice && noticeVisible && (
        <div role="status" className="patient-detail-notice">
          <span>{notice}</span>
          <PmdButton
            variant="ghost"
            size="icon"
            aria-label="Close notification"
            onClick={onDismiss}
          >
            ×
          </PmdButton>
        </div>
      )}
      {listError && (
        <div role="alert" className="patient-detail-list-error">
          <span>Patient saved, but the list couldn’t refresh.</span>
          <PmdButton variant="secondary" disabled={listFetching} onClick={onRetryList}>
            Retry list
          </PmdButton>
        </div>
      )}
    </>
  );
}

function PatientDetailLoadError({
  error,
  isFetching,
  onRetry,
}: {
  error: unknown;
  isFetching: boolean;
  onRetry: () => void;
}) {
  const notFound = error instanceof ApiError && (error.status === 404 || error.status === 400);

  return (
    <div role="alert" className="rounded-xl border border-border bg-white p-4 sm:p-6">
      <h2 className="text-xl font-semibold">
        {notFound ? 'Patient not found.' : 'Couldn’t load this patient.'}
      </h2>
      <PmdButton
        className="mt-4 w-full sm:w-auto"
        variant="secondary"
        disabled={isFetching}
        onClick={onRetry}
      >
        Retry
      </PmdButton>
    </div>
  );
}

function PatientInfomation({ patient }: { patient: PatientSchema }) {
  return (
    <div className="patient-information-grid">
      <section aria-labelledby="personal-details" className="patient-information-card">
        <h2 id="personal-details" className="patient-information-title">
          Personal information
        </h2>
        <dl className="patient-information-fields">
          <div>
            <dt>First name</dt>
            <dd>{patient.firstName}</dd>
          </div>
          <div>
            <dt>Middle name</dt>
            <dd>
              {patient.middleName ?? (
                <span className="patient-information-empty">Not provided</span>
              )}
            </dd>
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
              <address className="patient-information-address">
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
    </div>
  );
}
