import {
  resolveInstagramUrl,
  resolveTelegramUrl,
  resolveWhatsAppUrl,
  type BusinessCard,
} from '../lib/card';
import { useI18n } from '../lib/i18n';

type CardPreviewProps = {
  card: BusinessCard;
  views?: number | null;
};

export function CardPreview({ card, views }: CardPreviewProps) {
  const { t } = useI18n();
  const igUrl = resolveInstagramUrl(card.instagram);
  const waUrl = resolveWhatsAppUrl(card.whatsapp);
  const tgUrl = resolveTelegramUrl(card.telegram);

  const links = [
    card.website ? { label: t.preview.website, href: card.website } : null,
    card.linkedin ? { label: 'LinkedIn', href: card.linkedin } : null,
    card.x ? { label: 'X', href: card.x } : null,
    card.github ? { label: 'GitHub', href: card.github } : null,
    igUrl ? { label: 'Instagram', href: igUrl } : null,
    waUrl ? { label: 'WhatsApp', href: waUrl } : null,
    tgUrl ? { label: 'Telegram', href: tgUrl } : null,
  ].filter(Boolean) as { label: string; href: string }[];

  return (
    <article className="card-surface" aria-label={t.preview.cardAria(card.displayName)}>
      <div className="card-surface__glow" aria-hidden="true" />
      <p className="card-surface__eyebrow">{t.preview.eyebrow}</p>
      <div className="card-surface__header">
        {card.photo ? (
          <img
            src={card.photo}
            alt={card.displayName || t.preview.photoAlt}
            className="card-surface__avatar"
          />
        ) : null}
        <div className="card-surface__identity">
          <h2 className="card-surface__name">{card.displayName || t.preview.fallbackName}</h2>
          {(card.headline || card.company) && (
            <p className="card-surface__role">
              {[card.headline, card.company].filter(Boolean).join(' · ')}
            </p>
          )}
          {card.location ? <p className="card-surface__meta">{card.location}</p> : null}
        </div>
      </div>
      {card.bio ? <p className="card-surface__bio">{card.bio}</p> : null}

      <dl className="card-surface__contacts">
        {card.email ? (
          <div>
            <dt>{t.preview.email}</dt>
            <dd>
              <a href={`mailto:${card.email}`}>{card.email}</a>
            </dd>
          </div>
        ) : null}
        {card.phone ? (
          <div>
            <dt>{t.preview.phone}</dt>
            <dd>
              <a href={`tel:${card.phone}`}>{card.phone}</a>
            </dd>
          </div>
        ) : null}
        {card.wechat ? (
          <div>
            <dt>{t.preview.wechat}</dt>
            <dd>{card.wechat}</dd>
          </div>
        ) : null}
      </dl>

      {links.length > 0 ? (
        <ul className="card-surface__links">
          {links.map((link) => (
            <li key={link.href}>
              <a href={link.href} target="_blank" rel="noreferrer">
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      ) : null}

      {typeof views === 'number' ? (
        <p className="card-surface__views" aria-live="polite">
          {t.preview.views(views)}
        </p>
      ) : null}
    </article>
  );
}
