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

it('supports Instagram, WhatsApp, WeChat, and Telegram handles and URLs', () => {
  const card = normalizeCard({
    displayName: 'Alex Rivera',
    instagram: '@alex.design',
    whatsapp: '+61 411 935 878',
    wechat: 'alex_wx_01',
    telegram: '@alex_tg',
  });
  expect(validateCard(card)).toBeNull();

  const vcf = toVCard(card);
  expect(vcf).toContain('URL;TYPE=Instagram:https://instagram.com/alex.design');
  expect(vcf).toContain('URL;TYPE=WhatsApp:https://wa.me/61411935878');
  expect(vcf).toContain('URL;TYPE=Telegram:https://t.me/alex_tg');
  expect(vcf).toContain('X-SOCIALPROFILE;TYPE=WeChat:alex_wx_01');
});

it('rejects invalid Instagram, WhatsApp, and Telegram values', () => {
  expect(validateCard({ ...EMPTY_CARD, displayName: 'Alex', instagram: 'ftp://ig.com/a' })).toMatch(/Instagram/);
  expect(validateCard({ ...EMPTY_CARD, displayName: 'Alex', whatsapp: 'abc' })).toMatch(/WhatsApp/);
  expect(validateCard({ ...EMPTY_CARD, displayName: 'Alex', telegram: 'a' })).toMatch(/Telegram/);
});

it('validates profile photo data URLs and embeds them in vCard', () => {
  const validPhoto = 'data:image/jpeg;base64,/9j/4AAQSkZJRg==';
  const card = normalizeCard({ displayName: 'Alex Rivera', photo: validPhoto });
  expect(validateCard(card)).toBeNull();
  expect(toVCard(card)).toContain('PHOTO;ENCODING=b;TYPE=JPEG:/9j/4AAQSkZJRg==');

  expect(
    validateCard({ ...EMPTY_CARD, displayName: 'Alex', photo: 'javascript:alert(1)' }),
  ).toMatch(/photo/i);
});
