import { describe, expect, it } from 'vitest';
import { formatDateOfBirth, getUtcToday, isValidDateOnly } from './index.js';

describe('date-only calendar rules', () => {
  it.each(['1000-01-01', '1900-02-28', '2000-02-29', '2024-02-29', '2400-02-29', '9999-12-31'])(
    'accepts real calendar date %s',
    (value) => {
      expect(isValidDateOnly(value)).toBe(true);
    },
  );

  it.each([
    '0000-01-01',
    '0001-01-01',
    '0999-12-31',
    '10000-01-01',
    '2026-1-01',
    '2026-01-1',
    '2026-01-01T00:00:00Z',
    '1900-02-29',
    '2100-02-29',
    '2025-02-29',
    '2024-02-30',
    '2026-04-31',
    '2026-00-01',
    '2026-13-01',
    '2026-01-00',
    '2026-01-32',
    ' 2026-01-01',
    '2026-01-01\n',
    '',
  ])('rejects invalid date %j', (value) => {
    expect(isValidDateOnly(value)).toBe(false);
  });

  it.each([
    ['2026-11-11T00:30:00+08:00', '2026-11-10'],
    ['2026-11-10T23:30:00-08:00', '2026-11-11'],
    ['1000-01-01T00:00:00Z', '1000-01-01'],
  ])('uses UTC components for %s', (instant, expected) => {
    expect(getUtcToday(new Date(instant))).toBe(expected);
  });

  it.each([
    ['1990-01-15', 'Jan 15, 1990'],
    ['1000-01-01', 'Jan 1, 1000'],
    ['2000-02-29', 'Feb 29, 2000'],
    ['9999-12-31', 'Dec 31, 9999'],
  ])('formats %s without local timezone shifts', (value, expected) => {
    expect(formatDateOfBirth(value)).toBe(expected);
  });

  it('refuses to silently roll an invalid date forward', () => {
    expect(() => formatDateOfBirth('2025-02-29')).toThrow(RangeError);
  });

  it('rejects formatting dates below the supported range', () => {
    expect(() => formatDateOfBirth('0999-12-31')).toThrow(RangeError);
  });
});
