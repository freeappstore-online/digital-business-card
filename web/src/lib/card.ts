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
  };
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
