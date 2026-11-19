import type { BusinessCard } from '../lib/card';

type CardPreviewProps = {
  card: BusinessCard;
  views?: number | null;
};

export function CardPreview({ card, views }: CardPreviewProps) {
  const links = [
    card.website ? { label: 'Website', href: card.website } : null,
    card.linkedin ? { label: 'LinkedIn', href: card.linkedin } : null,
    card.x ? { label: 'X', href: card.x } : null,
    card.github ? { label: 'GitHub', href: card.github } : null,
  ].filter(Boolean) as { label: string; href: string }[];

  return (
    <article className="card-surface" aria-label={`${card.displayName || 'Business'} card`}>
      <div className="card-surface__glow" aria-hidden="true" />
      <p className="card-surface__eyebrow">Digital card</p>
      <h2 className="card-surface__name">{card.displayName || 'Your name'}</h2>
      {(card.headline || card.company) && (
        <p className="card-surface__role">
          {[card.headline, card.company].filter(Boolean).join(' · ')}
        </p>
      )}
      {card.location ? <p className="card-surface__meta">{card.location}</p> : null}
      {card.bio ? <p className="card-surface__bio">{card.bio}</p> : null}

      <dl className="card-surface__contacts">
        {card.email ? (
          <div>
            <dt>Email</dt>
            <dd>
              <a href={`mailto:${card.email}`}>{card.email}</a>
            </dd>
          </div>
        ) : null}
        {card.phone ? (
          <div>
            <dt>Phone</dt>
            <dd>
              <a href={`tel:${card.phone}`}>{card.phone}</a>
            </dd>
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
          {views.toLocaleString()} views
        </p>
      ) : null}
    </article>
  );
}
