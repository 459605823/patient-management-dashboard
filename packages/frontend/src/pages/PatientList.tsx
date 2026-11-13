import { useEffect, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { DashboardLayout } from '@/components/ui/layout';
import { PmdButton } from '@/components/ui/button';
import { PatientTable } from '@/components/dashboard/table';
import { PatientPanel, type PatientPanelState } from '@/components/dashboard/panel';
import { patientStatusSchema, type CreatePatientData, type PatientListQuery } from '@pmd/shared';
import { queryList, create } from '@/api/patient';
import { readListQuery, listUrl } from '@/utils/patient';
import plus from '@/assets/plus.svg';
import './PatientList.css';

type PatientFiltersProps = {
  search: string;
  status: PatientListQuery['status'];
  onSearchChange: (search: string) => void;
  onApply: (search: string, status?: PatientListQuery['status']) => void;
};

export function PatientListFilter({
  search,
  status,
  onSearchChange,
  onApply,
}: PatientFiltersProps) {
  return (
    <div className="mb-7 flex flex-col gap-4">
      <form
        className="flex w-full items-center gap-2 md:max-w-md"
        role="search"
        onSubmit={(event) => {
          event.preventDefault();
        }}
      >
        <div className="min-w-0 flex-1">
          <label className="sr-only" htmlFor="patient-search">
            Search patients by name
          </label>
          <input
            id="patient-search"
            type="search"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search patients by name…"
            className="patient-list-search"
          />
        </div>
        {search && (
          <PmdButton variant="ghost" className="shrink-0 text-primary" onClick={() => onApply('')}>
            Clear search
          </PmdButton>
        )}
      </form>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by status">
        {(['All', ...patientStatusSchema.options] as const).map((value) => (
          <PmdButton
            key={value}
            variant={status === value ? 'primary' : 'secondary'}
            onClick={() => onApply(search, value)}
          >
            {value}
          </PmdButton>
        ))}
      </div>
    </div>
  );
}

export function PatientListLoading() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
      <div className="patient-list-spinner" aria-hidden="true" />
      <p className="text-muted" role="status">
        Loading patients…
      </p>
    </div>
  );
}

export function PatientListError({
  retrying,
  onRetry,
}: {
  retrying: boolean;
  onRetry: () => void;
}) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
      <h3 className="text-xl font-semibold">Couldn’t load patients.</h3>
      <p className="text-muted">Check your connection and try again.</p>
      <PmdButton variant="secondary" disabled={retrying} onClick={onRetry}>
        Retry
      </PmdButton>
    </div>
  );
}

export function PatientListEmpty({
  page,
  hasFilters,
  setQuery,
  applyFilters,
  openCreate,
}: {
  page: number;
  hasFilters: boolean;
  setQuery: (next: PatientListQuery | ((current: PatientListQuery) => PatientListQuery)) => void;
  applyFilters: (search: string, status?: PatientListQuery['status']) => void;
  openCreate: () => void;
}) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
      <h3 className="text-xl font-semibold">
        {page > 1
          ? 'No patients on this page'
          : hasFilters
            ? 'No matching patients'
            : 'No patients yet'}
      </h3>
      <p className="text-muted">
        {page > 1
          ? 'The results may have changed. Return to the first page.'
          : hasFilters
            ? 'Try another name or change the status filter.'
            : 'Add your first patient to get started.'}
      </p>
      {page > 1 ? (
        <PmdButton
          variant="secondary"
          onClick={() => setQuery((current) => ({ ...current, page: 1 }))}
        >
          Back to first page
        </PmdButton>
      ) : hasFilters ? (
        <PmdButton variant="secondary" onClick={() => applyFilters('', 'All')}>
          Clear filters
        </PmdButton>
      ) : (
        <PmdButton onClick={openCreate}>Add patient</PmdButton>
      )}
    </div>
  );
}

export function PatientListFooter({
  showPagination,
  totalCount,
  totalPages,
  isFetching,
  query,
  setQuery,
}: {
  showPagination: boolean;
  totalCount: number;
  totalPages: number;
  isFetching: boolean;
  query: PatientListQuery;
  setQuery: (next: PatientListQuery | ((current: PatientListQuery) => PatientListQuery)) => void;
}) {
  return (
    <footer className="patient-list-footer">
      <span className="shrink-0">
        {showPagination && (
          <>
            {totalCount} {totalCount === 1 ? 'result' : 'results'}
          </>
        )}
      </span>
      <nav
        className="flex shrink-0 flex-nowrap items-center gap-2 md:gap-3"
        aria-label="Patient pages"
      >
        <PmdButton
          variant="secondary"
          disabled={!showPagination || query.page === 1 || isFetching}
          onClick={() => setQuery((current) => ({ ...current, page: current.page - 1 }))}
        >
          Previous
        </PmdButton>
        <span className={showPagination ? '' : 'invisible'}>
          {query.page > totalPages ? `Page ${query.page}` : `Page ${query.page} of ${totalPages}`}
        </span>
        <PmdButton
          variant="secondary"
          disabled={!showPagination || query.page >= totalPages || isFetching}
          onClick={() => setQuery((current) => ({ ...current, page: current.page + 1 }))}
        >
          Next
        </PmdButton>
      </nav>
    </footer>
  );
}

export function PatientList() {
  const heading = useRef<HTMLHeadingElement>(null);
  const addButton = useRef<HTMLButtonElement>(null);
  const [panel, setPanel] = useState<PatientPanelState>({ mode: 'closed' });
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const query = readListQuery(params.toString());
  const [searchInput, setSearchInput] = useState(query.search);
  const [previousSearch, setPreviousSearch] = useState(query.search);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  if (previousSearch !== query.search) {
    setPreviousSearch(query.search);
    setSearchInput(query.search);
  }
  const queryClient = useQueryClient();
  const list = useQuery({
    queryKey: ['patients', 'list', query],
    queryFn: ({ signal }) => queryList(query, signal),
  });
  const createFn = useMutation({ mutationFn: create, retry: false });
  const searchPending = searchInput.trim() !== query.search;
  const hasFilters = query.search !== '' || query.status !== 'All';
  const showPagination = list.isSuccess && !searchPending;
  const totalPages = list.data
    ? Math.max(1, Math.ceil(list.data.pagination.total / list.data.pagination.pageSize))
    : 1;

  function setQuery(next: PatientListQuery | ((current: PatientListQuery) => PatientListQuery)) {
    const value = typeof next === 'function' ? next(query) : next;
    setParams(new URLSearchParams(listUrl(value).split('?')[1] ?? ''), { replace: true });
  }

  function applyFilters(search: string, status = query.status) {
    clearTimeout(searchTimer.current);
    setSearchInput(search);
    setQuery({ search: search.trim(), status, page: 1 });
  }

  function changeSearch(value: string) {
    clearTimeout(searchTimer.current);
    setSearchInput(value);
    if (Array.from(value.trim()).length <= 100) {
      searchTimer.current = setTimeout(() => {
        setQuery((current) => ({ ...current, search: value.trim(), page: 1 }));
      }, 300);
    }
  }

  function openCreate() {
    setPanel({ mode: 'create' });
  }

  async function save(data: CreatePatientData) {
    const patient = await createFn.mutateAsync(data);
    await queryClient.cancelQueries({ queryKey: ['patients', 'detail', patient.id] });
    queryClient.setQueryData(['patients', 'detail', patient.id], patient);
    await queryClient.invalidateQueries({ queryKey: ['patients', 'list'], refetchType: 'none' });
    const returnTo = listUrl({ ...query, page: 1 });
    setQuery({ ...query, page: 1 });
    await navigate(`/patients/${patient.id}`, { state: { returnTo, notice: 'Patient added' } });
  }

  useEffect(() => () => clearTimeout(searchTimer.current), []);

  return (
    <>
      <DashboardLayout>
        <div className="patient-list-header">
          <div>
            <h1 ref={heading} tabIndex={-1} className="patient-list-heading">
              Patients
            </h1>
            <p className="mt-1 text-base leading-6 text-muted">Manage patient information.</p>
          </div>
          <PmdButton ref={addButton} className="w-full min-w-44 md:w-auto" onClick={openCreate}>
            <img src={plus} width="24" height="24" alt="" />
            Add patient
          </PmdButton>
        </div>
        <PatientListFilter
          search={searchInput}
          status={query.status}
          onSearchChange={changeSearch}
          onApply={applyFilters}
        />
        <div className="patient-list-directory-heading">
          <h2 className="text-base font-semibold">Patient directory</h2>
          <p className="text-[13px] text-muted">Sorted by last name</p>
        </div>
        <section className="flex flex-col overflow-hidden rounded-xl border border-border bg-white">
          <div className="h-107 shrink-0">
            {searchPending || list.isPending ? (
              <PatientListLoading />
            ) : list.isError ? (
              <PatientListError retrying={list.isRefetching} onRetry={() => list.refetch()} />
            ) : list.data.data.length === 0 ? (
              <PatientListEmpty
                page={query.page}
                hasFilters={hasFilters}
                setQuery={setQuery}
                applyFilters={applyFilters}
                openCreate={openCreate}
              />
            ) : (
              <PatientTable patients={list.data.data} returnTo={listUrl(query)} />
            )}
          </div>
          <PatientListFooter
            showPagination={showPagination}
            totalCount={list.data?.pagination.total ?? 0}
            totalPages={totalPages}
            isFetching={list.isFetching}
            query={query}
            setQuery={setQuery}
          />
        </section>
      </DashboardLayout>
      <PatientPanel
        panel={panel}
        onClose={() => setPanel({ mode: 'closed' })}
        onCreate={save}
        restoreFocus={() => {
          addButton.current?.focus();
        }}
      />
    </>
  );
}
