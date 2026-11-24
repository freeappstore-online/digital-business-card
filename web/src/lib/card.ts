import type { FreeAppStore } from '@freeappstore/sdk';

export const CARDS_COLLECTION = 'cards';

export type BusinessCard = {
  displayName: string;
  headline: string;
  company: string;
  email: string;
  phone: string;
  website: string;
  location: string;
  bio: string;
  linkedin: string;
  x: string;
  github: string;
  instagram: string;
  whatsapp: string;
  wechat: string;
  telegram: string;
};

export type CardDocument = BusinessCard & { id: string };

export const EMPTY_CARD: BusinessCard = {
  displayName: '',
  headline: '',
  company: '',
  email: '',
  phone: '',
  website: '',
  location: '',
  bio: '',
  linkedin: '',
  x: '',
  github: '',
  instagram: '',
  whatsapp: '',
  wechat: '',
  telegram: '',
};

const MAX_BIO = 500;
const MAX_FIELD = 120;

export function cardsCollection(app: FreeAppStore) {
  return app.collections.collection(CARDS_COLLECTION, { visibility: 'public-read' });
}

export function viewsCounterKey(cardId: string): string {
  return `card-views:${cardId}`;
}

export function publicCardPath(cardId: string): string {
  return `/c/${encodeURIComponent(cardId)}`;
}

export function publicCardUrl(cardId: string): string {
  return `${window.location.origin}${publicCardPath(cardId)}`;
}

export function normalizeCard(input: Partial<BusinessCard>): BusinessCard {
  const trim = (value: unknown, max = MAX_FIELD) =>
    typeof value === 'string' ? value.trim().slice(0, max) : '';

  return {
    displayName: trim(input.displayName),
    headline: trim(input.headline),
    company: trim(input.company),
    email: trim(input.email),
    phone: trim(input.phone),
    website: trim(input.website, 200),
    location: trim(input.location),
    bio: trim(input.bio, MAX_BIO),
    linkedin: trim(input.linkedin, 200),
    x: trim(input.x, 200),
    github: trim(input.github, 200),
    instagram: trim(input.instagram, 200),
    whatsapp: trim(input.whatsapp, 200),
    wechat: trim(input.wechat, 64),
    telegram: trim(input.telegram, 200),
  };
}

export function resolveInstagramUrl(value: string): string | null {
  if (!value) return null;
  if (value.includes('://')) return isHttpUrl(value) ? value : null;
  const handle = value.replace(/^@/, '');
  return /^[a-zA-Z0-9._]{1,30}$/.test(handle) ? `https://instagram.com/${handle}` : null;
}

export function resolveTelegramUrl(value: string): string | null {
  if (!value) return null;
  if (value.includes('://')) return isHttpUrl(value) ? value : null;
  const handle = value.replace(/^@/, '');
  return /^[a-zA-Z0-9_]{3,32}$/.test(handle) ? `https://t.me/${handle}` : null;
}

export function resolveWhatsAppUrl(value: string): string | null {
  if (!value) return null;
  if (value.includes('://')) return isHttpUrl(value) ? value : null;
  if (!/^[+\d\s().-]+$/.test(value)) return null;
  const digits = value.replace(/\D/g, '');
  return digits.length >= 6 && digits.length <= 15 ? `https://wa.me/${digits}` : null;
}

export function validateCard(card: BusinessCard): string | null {
  if (!card.displayName) return 'Add your name.';
  if (card.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(card.email)) {
    return 'Enter a valid email, or leave it blank.';
  }
  for (const [label, value] of [
    ['Website', card.website],
    ['LinkedIn', card.linkedin],
    ['X', card.x],
    ['GitHub', card.github],
  ] as const) {
    if (value && !isHttpUrl(value)) {
      return `${label} must start with https://`;
    }
  }
  if (card.instagram && !resolveInstagramUrl(card.instagram)) {
    return 'Instagram must be a @handle or https:// URL.';
  }
  if (card.whatsapp && !resolveWhatsAppUrl(card.whatsapp)) {
    return 'WhatsApp must be a phone number (with country code) or https://wa.me/… URL.';
  }
  if (card.telegram && !resolveTelegramUrl(card.telegram)) {
    return 'Telegram must be a @username or https://t.me/… URL.';
  }
  return null;
}

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

export function toVCard(card: BusinessCard, pageUrl?: string): string {
  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${escapeVCard(card.displayName)}`,
  ];
  if (card.headline || card.company) {
    lines.push(`TITLE:${escapeVCard(card.headline)}`);
    lines.push(`ORG:${escapeVCard(card.company)}`);
  }
  if (card.phone) lines.push(`TEL;TYPE=CELL:${escapeVCard(card.phone)}`);
  if (card.email) lines.push(`EMAIL;TYPE=INTERNET:${escapeVCard(card.email)}`);
  if (card.website) lines.push(`URL:${escapeVCard(card.website)}`);
  if (card.location) lines.push(`ADR;TYPE=WORK:;;${escapeVCard(card.location)};;;;`);
  if (card.linkedin) lines.push(`URL;TYPE=LinkedIn:${escapeVCard(card.linkedin)}`);
  if (card.x) lines.push(`URL;TYPE=X:${escapeVCard(card.x)}`);
  if (card.github) lines.push(`URL;TYPE=GitHub:${escapeVCard(card.github)}`);
  const igUrl = resolveInstagramUrl(card.instagram);
  if (igUrl) lines.push(`URL;TYPE=Instagram:${escapeVCard(igUrl)}`);
  const waUrl = resolveWhatsAppUrl(card.whatsapp);
  if (waUrl) lines.push(`URL;TYPE=WhatsApp:${escapeVCard(waUrl)}`);
  const tgUrl = resolveTelegramUrl(card.telegram);
  if (tgUrl) lines.push(`URL;TYPE=Telegram:${escapeVCard(tgUrl)}`);
  if (card.wechat) lines.push(`X-SOCIALPROFILE;TYPE=WeChat:${escapeVCard(card.wechat)}`);
  if (card.bio) lines.push(`NOTE:${escapeVCard(card.bio)}`);
  if (pageUrl) lines.push(`URL;TYPE=Profile:${escapeVCard(pageUrl)}`);
  lines.push('END:VCARD');
  return `${lines.join('\r\n')}\r\n`;
}

function escapeVCard(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');
}

export function downloadVCard(card: BusinessCard, pageUrl?: string): void {
  const blob = new Blob([toVCard(card, pageUrl)], { type: 'text/vcard;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  const slug = card.displayName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'card';
  anchor.href = url;
  anchor.download = `${slug}.vcf`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function cardFromDocument(doc: Record<string, unknown> & { id: string }): CardDocument {
  return { id: doc.id, ...normalizeCard(doc as Partial<BusinessCard>) };
}
