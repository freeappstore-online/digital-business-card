// @vitest-environment happy-dom
import { expect, it } from 'vitest';
import {
  EMPTY_CARD,
  normalizeCard,
  toVCard,
  validateCard,
} from './card';

it('requires a display name', () => {
  expect(validateCard(EMPTY_CARD)).toBe('Add your name.');
  expect(validateCard({ ...EMPTY_CARD, displayName: 'Alex' })).toBeNull();
});

it('rejects non-https social links', () => {
  expect(
    validateCard({
      ...EMPTY_CARD,
      displayName: 'Alex',
      website: 'ftp://example.com',
    }),
  ).toMatch(/Website/);
});

it('builds a vCard with contact fields', () => {
  const card = normalizeCard({
    displayName: 'Alex Rivera',
    headline: 'Designer',
    company: 'Studio',
    email: 'alex@example.com',
    phone: '+1 555 0100',
    website: 'https://example.com',
  });
  const vcf = toVCard(card, 'https://example.com/c/abc');
  expect(vcf).toContain('BEGIN:VCARD');
  expect(vcf).toContain('FN:Alex Rivera');
  expect(vcf).toContain('EMAIL;TYPE=INTERNET:alex@example.com');
  expect(vcf).toContain('URL;TYPE=Profile:https://example.com/c/abc');
  expect(vcf).toContain('END:VCARD');
});
