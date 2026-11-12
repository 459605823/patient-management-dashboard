import { describe, expect, it } from 'vitest';
import { patientListQuerySchema } from './index.js';

describe('patientListQuerySchema (raw HTTP query)', () => {
  it('supplies the complete default query', () => {
    expect(patientListQuerySchema.parse({})).toEqual({ search: '', status: 'All', page: 1 });
  });

  it('trims search without changing case, Unicode or internal whitespace and parses page', () => {
    expect(
      patientListQuerySchema.parse({ search: '  ＭＡＲＹ\tSmith ', status: 'Active', page: '2' }),
    ).toEqual({
      search: 'ＭＡＲＹ\tSmith',
      status: 'Active',
      page: 2,
    });
  });

  it.each(['All', 'Inquiry', 'Onboarding', 'Active', 'Churned'])('accepts status %s', (status) => {
    expect(patientListQuerySchema.parse({ status }).status).toBe(status);
  });

  it.each(['1', '2147483647'])('accepts page boundary %s', (page) => {
    expect(patientListQuerySchema.parse({ page }).page).toBe(Number(page));
  });

  it.each([
    ['0', 'too_small'],
    ['2147483648', 'too_big'],
    ['-1', 'invalid_format'],
    ['+1', 'invalid_format'],
    ['1.0', 'invalid_format'],
    ['1e2', 'invalid_format'],
    ['2x', 'invalid_format'],
    [' 2 ', 'invalid_format'],
    ['', 'invalid_format'],
    ['Infinity', 'invalid_format'],
    ['1\n', 'invalid_format'],
    [2, 'invalid_type'],
    [null, 'invalid_type'],
    [['1', '2'], 'invalid_type'],
    [{ value: '1' }, 'invalid_type'],
  ])('rejects malformed/out-of-range page %j', (page, code) => {
    const result = patientListQuerySchema.safeParse({ page });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues[0]).toMatchObject({ path: ['page'], code });
  });

  it.each([
    [{ extra: 'x' }, { path: [], code: 'unrecognized_keys', keys: ['extra'] }],
    [{ status: 'active' }, { path: ['status'], code: 'invalid_value' }],
    [{ sort: 'dob-desc' }, { path: [], code: 'unrecognized_keys', keys: ['sort'] }],
    [{ pageSize: '20' }, { path: [], code: 'unrecognized_keys', keys: ['pageSize'] }],
    [{ search: ['mary', 'smith'] }, { path: ['search'], code: 'invalid_type' }],
    [{ status: ['Active', 'Churned'] }, { path: ['status'], code: 'invalid_value' }],
    [{ search: { value: 'mary' } }, { path: ['search'], code: 'invalid_type' }],
    [{ search: null }, { path: ['search'], code: 'invalid_type' }],
  ])('rejects unknown/duplicate/structured query %j', (query, issue) => {
    const result = patientListQuerySchema.safeParse(query);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues[0]).toMatchObject(issue);
  });

  it('counts Unicode code points instead of UTF-16 units', () => {
    expect(patientListQuerySchema.parse({ search: '𠮷'.repeat(100) }).search).toBe(
      '𠮷'.repeat(100),
    );
    const result = patientListQuerySchema.safeParse({ search: '𠮷'.repeat(101) });
    expect(result.success).toBe(false);
    if (!result.success)
      expect(result.error.issues[0]).toMatchObject({
        path: ['search'],
        code: 'custom',
      });
  });

  it('checks search length after trimming', () => {
    expect(patientListQuerySchema.parse({ search: `  ${'a'.repeat(100)}  ` }).search).toBe(
      'a'.repeat(100),
    );
    expect(patientListQuerySchema.parse({ search: ' '.repeat(301) }).search).toBe('');
  });

  it('preserves a keyword containing more than ten words', () => {
    const search = 'one two three four five six seven eight nine ten eleven';
    expect(patientListQuerySchema.parse({ search }).search).toBe(search);
  });
});
