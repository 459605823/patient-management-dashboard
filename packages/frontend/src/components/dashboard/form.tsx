import {
  createPatientSchema,
  getUtcToday,
  patientStatusSchema,
  usStates,
  type CreatePatientData,
  type CreatePatientInput,
} from '@pmd/shared';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useId, useRef, useState } from 'react';
import { useForm, type FieldPath } from 'react-hook-form';
import { PmdButton } from '@/components/ui/button';
import { ApiError } from '@/api/request';
import './form.css';

type PatientFormInput = Omit<CreatePatientInput, 'address'> & {
  address: Omit<CreatePatientInput['address'], 'state'> & {
    state: CreatePatientInput['address']['state'] | '';
  };
};

type Props = {
  layout?: 'drawer' | 'page';
  initialValues?: CreatePatientData;
  submitLabel?: string;
  onSubmit: (data: CreatePatientData) => Promise<void>;
  onCancel: () => void;
  onSavingChange?: (saving: boolean) => void;
  onDirtyChange?: (dirty: boolean) => void;
};

const controlClassName = 'patient-form-control';
const labelClassName = 'text-sm leading-5.25 font-medium';
const sectionClassName = 'mb-8 flex flex-col gap-6 last:mb-0';
const sectionTitleClassName =
  'text-xs leading-4.5 font-semibold tracking-[.15px] text-muted uppercase';

export function PatientForm({
  layout = 'drawer',
  initialValues,
  submitLabel = 'Save patient',
  onSubmit,
  onCancel,
  onSavingChange,
  onDirtyChange,
}: Props) {
  const id = useId();
  const [saveError, setSaveError] = useState('');
  const submitting = useRef(false);
  const rejectedField = useRef<FieldPath<PatientFormInput> | undefined>(undefined);
  const { register, handleSubmit, setError, getFieldState, formState, setFocus } = useForm<
    PatientFormInput,
    unknown,
    CreatePatientData
  >({
    resolver: zodResolver<PatientFormInput, unknown, CreatePatientData>(createPatientSchema),
    defaultValues: initialValues
      ? {
          firstName: initialValues.firstName,
          middleName: initialValues.middleName ?? '',
          lastName: initialValues.lastName,
          dateOfBirth: initialValues.dateOfBirth,
          status: initialValues.status,
          address: { ...initialValues.address, line2: initialValues.address.line2 ?? '' },
        }
      : {
          firstName: '',
          middleName: '',
          lastName: '',
          dateOfBirth: '',
          status: 'Inquiry',
          address: { line1: '', line2: '', city: '', state: '', postalCode: '', country: 'US' },
        },
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  });
  const saving = formState.isSubmitting;
  const dirty = formState.isDirty;
  useEffect(() => {
    if (!saving && rejectedField.current) {
      setFocus(rejectedField.current);
      rejectedField.current = undefined;
    }
  }, [saving, setFocus]);
  useEffect(() => {
    onDirtyChange?.(dirty);
    return () => onDirtyChange?.(false);
  }, [dirty, onDirtyChange]);

  function field(name: FieldPath<PatientFormInput>) {
    const error = getFieldState(name, formState).error;
    return {
      ...register(name),
      id: `${id}-${name}`,
      className: controlClassName,
      'aria-invalid': !!error,
      'aria-describedby': error ? `${id}-${name}-error` : undefined,
    };
  }

  function error(name: FieldPath<PatientFormInput>) {
    const fieldError = getFieldState(name, formState).error;
    const message =
      fieldError && name === 'address.state' && fieldError.type !== 'server'
        ? 'Select a state or district.'
        : fieldError?.message;
    return message ? (
      <p className="text-[13px] leading-5 text-red-700" id={`${id}-${name}-error`}>
        {message}
      </p>
    ) : null;
  }

  async function save(data: CreatePatientData) {
    if (submitting.current) return;
    submitting.current = true;
    onSavingChange?.(true);
    setSaveError('');
    try {
      await onSubmit(data);
    } catch (cause) {
      if (cause instanceof ApiError && cause.code === 'VALIDATION_ERROR') {
        const fields = Object.entries(cause.fieldErrors);
        const known = new Set(
          Object.keys({
            ...data,
            ...Object.fromEntries(Object.keys(data.address).map((key) => [`address.${key}`, true])),
          }),
        );
        let first: FieldPath<PatientFormInput> | undefined;
        for (const [name, messages] of fields) {
          if (!known.has(name) || name === 'address') continue;
          const path = name as FieldPath<PatientFormInput>;
          setError(path, { type: 'server', message: messages[0] ?? 'Check this field.' });
          first ??= path;
        }
        rejectedField.current = first;
        setSaveError('Check the highlighted fields and try again.');
      } else if (
        cause instanceof ApiError &&
        (cause.code === 'SAVE_RESULT_UNAVAILABLE' ||
          cause.status === 0 ||
          cause.code === 'INVALID_RESPONSE')
      ) {
        setSaveError('We couldn’t confirm the save. Check the patient list before trying again.');
      } else {
        setSaveError(
          'Couldn’t save this patient. Your information is still here. Please try again.',
        );
      }
    } finally {
      submitting.current = false;
      onSavingChange?.(false);
    }
  }

  return (
    <form
      className="flex min-h-0 flex-1 flex-col"
      onSubmit={(event) => void handleSubmit(save)(event)}
      noValidate
      aria-busy={saving}
    >
      <div className={`patient-form-body patient-form-body--${layout}`}>
        {saveError && (
          <div className="patient-form-error" role="alert">
            {saveError}
          </div>
        )}
        <fieldset
          disabled={saving}
          className={`patient-form-fields patient-form-fields--${layout}`}
        >
          <legend className="sr-only">Patient information</legend>
          <section
            className={layout === 'page' ? 'patient-form-section' : sectionClassName}
            aria-labelledby={`${id}-personal`}
          >
            <h3 id={`${id}-personal`} className={sectionTitleClassName}>
              Personal information
            </h3>
            <div className="flex min-w-0 flex-col gap-2">
              <label className={labelClassName} htmlFor={`${id}-firstName`}>
                First name
              </label>
              <input
                {...field('firstName')}
                autoComplete="given-name"
                autoFocus={layout === 'drawer'}
              />
              {error('firstName')}
            </div>
            <div className="flex min-w-0 flex-col gap-2">
              <label className={labelClassName} htmlFor={`${id}-middleName`}>
                Middle name <span className="font-normal text-muted">(optional)</span>
              </label>
              <input {...field('middleName')} autoComplete="additional-name" />
              {error('middleName')}
            </div>
            <div className="flex min-w-0 flex-col gap-2">
              <label className={labelClassName} htmlFor={`${id}-lastName`}>
                Last name
              </label>
              <input {...field('lastName')} autoComplete="family-name" />
              {error('lastName')}
            </div>
            <div className="flex min-w-0 flex-col gap-2">
              <label className={labelClassName} htmlFor={`${id}-dateOfBirth`}>
                Date of birth
              </label>
              <input
                {...field('dateOfBirth')}
                type="date"
                min="1000-01-01"
                max={getUtcToday()}
                autoComplete="bday"
              />
              {error('dateOfBirth')}
            </div>
          </section>
          <section
            className={
              layout === 'page' ? 'patient-form-section patient-form-status' : sectionClassName
            }
            aria-labelledby={`${id}-status`}
          >
            <h3 id={`${id}-status`} className={sectionTitleClassName}>
              Patient status
            </h3>
            <div className="flex min-w-0 flex-col gap-2">
              <label className={labelClassName} htmlFor={`${id}-status-field`}>
                Status
              </label>
              <select
                {...field('status')}
                className={`${controlClassName} pr-6`}
                id={`${id}-status-field`}
              >
                {patientStatusSchema.options.map((status) => (
                  <option key={status}>{status}</option>
                ))}
              </select>
              {error('status')}
            </div>
          </section>
          <section
            className={
              layout === 'page' ? 'patient-form-section patient-form-address' : sectionClassName
            }
            aria-labelledby={`${id}-address`}
          >
            <h3 id={`${id}-address`} className={sectionTitleClassName}>
              Address
            </h3>
            <div className="flex min-w-0 flex-col gap-2">
              <label className={labelClassName} htmlFor={`${id}-address.line1`}>
                Address line 1
              </label>
              <input {...field('address.line1')} autoComplete="address-line1" />
              {error('address.line1')}
            </div>
            <div className="flex min-w-0 flex-col gap-2">
              <label className={labelClassName} htmlFor={`${id}-address.line2`}>
                Address line 2 <span className="font-normal text-muted">(optional)</span>
              </label>
              <input {...field('address.line2')} autoComplete="address-line2" />
              {error('address.line2')}
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-4">
              <div className="flex min-w-0 flex-col gap-2">
                <label className={labelClassName} htmlFor={`${id}-address.city`}>
                  City
                </label>
                <input {...field('address.city')} autoComplete="address-level2" />
                {error('address.city')}
              </div>
              <div className="flex min-w-0 flex-col gap-2">
                <label className={labelClassName} htmlFor={`${id}-address.state`}>
                  State / District
                </label>
                <select
                  {...field('address.state')}
                  className={`${controlClassName} pr-6`}
                  autoComplete="address-level1"
                >
                  <option value="">Select a state or district</option>
                  {usStates.map((state) => (
                    <option value={state.code} key={state.code}>
                      {state.label}
                    </option>
                  ))}
                </select>
                {error('address.state')}
              </div>
            </div>
            <div className="flex min-w-0 flex-col gap-2">
              <label className={labelClassName} htmlFor={`${id}-address.postalCode`}>
                ZIP code
              </label>
              <input
                {...field('address.postalCode')}
                autoComplete="postal-code"
                inputMode="numeric"
              />
              {error('address.postalCode')}
            </div>
            <div className="flex min-w-0 flex-col gap-2">
              <span className={labelClassName}>Country</span>
              <p className="leading-6 text-muted">United States</p>
              <input type="hidden" {...register('address.country')} />
            </div>
          </section>
        </fieldset>
      </div>
      <footer className="patient-form-footer">
        <PmdButton variant="secondary" disabled={saving} onClick={onCancel}>
          Cancel
        </PmdButton>
        <PmdButton type="submit" disabled={saving}>
          {saving ? 'Saving…' : submitLabel}
        </PmdButton>
      </footer>
    </form>
  );
}
