import { describe, expect, it } from 'vitest';

import { formatDateTime } from './formatDateTime';

describe('formatDateTime', () => {
  it('ISO 문자열을 YYYY.MM.DD HH:mm 형식으로 변환한다', () => {
    expect(formatDateTime('2026-01-05T09:30:00.000Z')).toMatch(/^\d{4}\.\d{2}\.\d{2} \d{2}:\d{2}$/);
  });
});
