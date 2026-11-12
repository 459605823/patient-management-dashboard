import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createPatientSchema, usStates } from './index.js';

const input = {
  firstName: ' Mary ',
  middleName: ' Ann ',
  lastName: ' Smith ',
  dateOfBirth: '1990-01-15',
  status: 'Active',
  address: {
    line1: ' 123 Main St ',
    line2: ' Apt 2 ',
    city: ' Boston ',
    state: 'MA',
    postalCode: ' 02108 ',
    country: 'US',
  },
};

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-11-11T00:30:00Z'));
});
afterEach(() => vi.useRealTimers());

describe('createPatientSchema', () => {
  it('trims display fields while preserving case, internal spacing and ZIP zeros', () => {
    expect(createPatientSchema.parse({ ...input, firstName: ' Mary  Jane ' })).toEqual({
      firstName: 'Mary  Jane',
      middleName: 'Ann',
      lastName: 'Smith',
      dateOfBirth: '1990-01-15',
      status: 'Active',
      address: {
        line1: '123 Main St',
        line2: 'Apt 2',
        city: 'Boston',
        state: 'MA',
        postalCode: '02108',
        country: 'US',
      },
    });
  });

  it.each([undefined, null, '', ' \t '])('normalizes optional empty value %j to null', (value) => {
    const result = createPatientSchema.parse({
      ...input,
      middleName: value,
      address: { ...input.address, line2: value },
    });
    expect(result.middleName).toBeNull();
    expect(result.address.line2).toBeNull();
  });

  it('normalizes absent optional properties to null', () => {
    const { middleName: _middle, ...withoutMiddle } = input;
    const { line2: _line2, ...address } = input.address;
    const result = createPatientSchema.parse({ ...withoutMiddle, address });
    expect(result.middleName).toBeNull();
    expect(result.address.line2).toBeNull();
  });

  it.each(['王小明', 'O’Neil', "O'Neil", 'Anne-Marie'])(
    'accepts unrestricted name %s and duplicate name/DOB',
    (firstName) => {
      const record = { ...input, firstName };
      expect(createPatientSchema.parse(record).firstName).toBe(firstName);
      expect(createPatientSchema.safeParse(record).success).toBe(true);
    },
  );

  it.each(['firstName', 'middleName', 'lastName'])(
    'enforces the 100 code point limit on %s',
    (field) => {
      expect(createPatientSchema.safeParse({ ...input, [field]: '𠮷'.repeat(100) }).success).toBe(
        true,
      );
      const result = createPatientSchema.safeParse({ ...input, [field]: '𠮷'.repeat(101) });
      expect(result.success).toBe(false);
      if (!result.success)
        expect(result.error.issues[0]).toMatchObject({
          path: [field],
          code: 'custom',
          message: 'Must be at most 100 characters',
        });
    },
  );

  it.each([
    ['line1', 200],
    ['line2', 200],
    ['city', 100],
  ] as const)('enforces %s length boundary', (field, max) => {
    expect(
      createPatientSchema.safeParse({
        ...input,
        address: { ...input.address, [field]: 'a'.repeat(max) },
      }).success,
    ).toBe(true);
    const result = createPatientSchema.safeParse({
      ...input,
      address: { ...input.address, [field]: 'a'.repeat(max + 1) },
    });
    expect(result.success).toBe(false);
    if (!result.success)
      expect(result.error.issues[0]).toMatchObject({
        path: ['address', field],
        code: 'custom',
        message: `Must be at most ${max} characters`,
      });
  });

  it.each(['firstName', 'lastName', 'dateOfBirth', 'status'])(
    'rejects missing/null/empty required %s',
    (field) => {
      for (const value of [undefined, null, '', '   ']) {
        const result = createPatientSchema.safeParse({ ...input, [field]: value });
        expect(result.success).toBe(false);
        if (!result.success)
          expect(result.error.issues[0]).toMatchObject({
            path: [field],
            code: field === 'status' ? 'invalid_value' : value == null ? 'invalid_type' : 'custom',
            ...((field === 'firstName' || field === 'lastName') && typeof value === 'string'
              ? { message: 'Required' }
              : {}),
          });
      }
    },
  );

  it.each(['line1', 'city', 'state', 'postalCode', 'country'])(
    'requires address.%s without implicit defaults',
    (field) => {
      for (const value of [undefined, null, '', '   ']) {
        const result = createPatientSchema.safeParse({
          ...input,
          address: { ...input.address, [field]: value },
        });
        expect(result.success).toBe(false);
        if (!result.success)
          expect(result.error.issues[0]).toMatchObject({
            path: ['address', field],
            code:
              field === 'state' || field === 'country'
                ? 'invalid_value'
                : value == null
                  ? 'invalid_type'
                  : field === 'postalCode'
                    ? 'invalid_format'
                    : 'custom',
            ...((field === 'line1' || field === 'city') && typeof value === 'string'
              ? { message: 'Required' }
              : {}),
          });
      }
    },
  );

  it.each(['Inquiry', 'Onboarding', 'Active', 'Churned'])('accepts status %s', (status) => {
    expect(createPatientSchema.safeParse({ ...input, status }).success).toBe(true);
  });

  it.each(['active', 'All', 'Archived'])('rejects invalid status %s', (status) => {
    const result = createPatientSchema.safeParse({ ...input, status });
    expect(result.success).toBe(false);
    if (!result.success)
      expect(result.error.issues[0]).toMatchObject({ path: ['status'], code: 'invalid_value' });
  });

  it('accepts exactly the 50 states and DC', () => {
    const codes =
      'AL AK AZ AR CA CO CT DE DC FL GA HI ID IL IN IA KS KY LA ME MD MA MI MN MS MO MT NE NV NH NJ NM NY NC ND OH OK OR PA RI SC SD TN TX UT VT VA WA WV WI WY'.split(
        ' ',
      );
    expect(usStates).toHaveLength(51);
    expect(usStates.map((state) => state.code).sort()).toEqual(codes.sort());
    expect(usStates.find((state) => state.code === 'DC')?.label).toBe('District of Columbia');
    for (const state of codes)
      expect(
        createPatientSchema.safeParse({ ...input, address: { ...input.address, state } }).success,
      ).toBe(true);
  });

  it.each(['PR', 'AE', 'ma', 'Massachusetts'])('rejects unsupported state %s', (state) => {
    const result = createPatientSchema.safeParse({
      ...input,
      address: { ...input.address, state },
    });
    expect(result.success).toBe(false);
    if (!result.success)
      expect(result.error.issues[0]).toMatchObject({
        path: ['address', 'state'],
        code: 'invalid_value',
      });
  });

  it.each(['02108', '02108-1234'])('keeps ZIP string %s', (postalCode) => {
    expect(
      createPatientSchema.parse({ ...input, address: { ...input.address, postalCode } }).address
        .postalCode,
    ).toBe(postalCode);
  });

  it.each([2108, '2108', '021081234', '02108-123', '02108 1234', '02108\nX'])(
    'rejects invalid ZIP %j',
    (postalCode) => {
      const result = createPatientSchema.safeParse({
        ...input,
        address: { ...input.address, postalCode },
      });
      expect(result.success).toBe(false);
      if (!result.success)
        expect(result.error.issues[0]).toMatchObject({
          path: ['address', 'postalCode'],
          code: typeof postalCode === 'number' ? 'invalid_type' : 'invalid_format',
          ...(typeof postalCode === 'string' ? { message: 'Enter a 5-digit ZIP or ZIP+4' } : {}),
        });
    },
  );

  it('rejects countries other than the literal US', () => {
    for (const country of ['CA', 'us', ' US ']) {
      const result = createPatientSchema.safeParse({
        ...input,
        address: { ...input.address, country },
      });
      expect(result.success).toBe(false);
      if (!result.success)
        expect(result.error.issues[0]).toMatchObject({
          path: ['address', 'country'],
          code: 'invalid_value',
        });
    }
  });

  it.each(['id', 'createdAt', 'updatedAt', 'first_name_search', 'extra'])(
    'rejects read-only/unknown %s',
    (field) => {
      const result = createPatientSchema.safeParse({ ...input, [field]: 'unexpected' });
      expect(result.success).toBe(false);
      if (!result.success)
        expect(result.error.issues[0]).toMatchObject({
          path: [],
          code: 'unrecognized_keys',
          keys: [field],
        });
    },
  );

  it('rejects unknown address fields and a missing address', () => {
    expect(
      createPatientSchema.safeParse({ ...input, address: { ...input.address, extra: true } })
        .success,
    ).toBe(false);
    expect(createPatientSchema.safeParse({ ...input, address: undefined }).success).toBe(false);
  });

  it.each(['1000-01-01', '2000-02-29', '2024-02-29', '2026-11-11'])(
    'accepts valid past/present DOB %s',
    (dateOfBirth) => {
      expect(createPatientSchema.parse({ ...input, dateOfBirth }).dateOfBirth).toBe(dateOfBirth);
    },
  );

  it.each([
    ['0000-01-01', 'Enter a valid date as YYYY-MM-DD (year 1000–9999)'],
    ['0001-01-01', 'Enter a valid date as YYYY-MM-DD (year 1000–9999)'],
    ['0999-12-31', 'Enter a valid date as YYYY-MM-DD (year 1000–9999)'],
    ['10000-01-01', 'Enter a valid date as YYYY-MM-DD (year 1000–9999)'],
    ['1900-02-29', 'Enter a valid date as YYYY-MM-DD (year 1000–9999)'],
    ['2025-02-29', 'Enter a valid date as YYYY-MM-DD (year 1000–9999)'],
    ['2026-02-30', 'Enter a valid date as YYYY-MM-DD (year 1000–9999)'],
    ['2026-04-31', 'Enter a valid date as YYYY-MM-DD (year 1000–9999)'],
    ['2026-1-01', 'Enter a valid date as YYYY-MM-DD (year 1000–9999)'],
    ['2026-11-12', 'Date of birth cannot be in the future'],
    ['9999-12-31', 'Date of birth cannot be in the future'],
  ])('rejects invalid/future DOB %s with its specific reason', (dateOfBirth, message) => {
    const result = createPatientSchema.safeParse({ ...input, dateOfBirth });
    expect(result.success).toBe(false);
    if (!result.success)
      expect(result.error.issues).toEqual([{ path: ['dateOfBirth'], code: 'custom', message }]);
  });

  it('re-reads the current UTC date at each parse', () => {
    const record = { ...input, dateOfBirth: '2026-11-12' };
    expect(createPatientSchema.safeParse(record).success).toBe(false);
    vi.setSystemTime(new Date('2026-11-12T00:00:00Z'));
    expect(createPatientSchema.safeParse(record).success).toBe(true);
  });
});

describe('complete patient form for creation and replacement', () => {
  it.each([{}, { status: 'Churned' }, { ...input, address: { city: 'Austin' } }])(
    'rejects incomplete form %j',
    (record) => {
      expect(createPatientSchema.safeParse(record).success).toBe(false);
    },
  );

  it('accepts an unchanged complete form and clears omitted optional fields on replacement', () => {
    const saved = createPatientSchema.parse(input);
    expect(createPatientSchema.parse(saved)).toEqual(saved);

    const { middleName: _middle, ...replacement } = saved;
    const { line2: _line2, ...address } = saved.address;
    expect(createPatientSchema.parse({ ...replacement, address })).toEqual({
      ...saved,
      middleName: null,
      address: { ...saved.address, line2: null },
    });
  });
});
