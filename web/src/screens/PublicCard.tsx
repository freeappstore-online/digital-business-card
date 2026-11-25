import { useEffect, useRef, useState, type PointerEvent } from 'react';
import { useDocumentTitle, PageHeader, Spinner, useToast } from '@freeappstore/sdk/ui';
import { useAuth } from '@freeappstore/sdk/hooks';
import { fas } from '../fas';
import {
  cardFromDocument,
  cardsCollection,
  downloadVCard,
  publicCardUrl,
  resolveInstagramUrl,
  resolveTelegramUrl,
  resolveWhatsAppUrl,
  viewsCounterKey,
  type CardDocument,
} from '../lib/card';
import { useI18n } from '../lib/i18n';
import { QrCode } from '../lib/QrCode';

type PublicCardProps = {
  cardId: string;
};

export function PublicCard({ cardId }: PublicCardProps) {
  const { t } = useI18n();
  const toast = useToast();
  const { user, loading: authLoading } = useAuth(fas);
  const [card, setCard] = useState<CardDocument | null>(null);
  const [views, setViews] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [flipped, setFlipped] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);

  useDocumentTitle(
    card ? `${card.displayName} — ${t.appName}` : `${t.publicCard.loadingTitle} — ${t.appName}`,
  );

  useEffect(() => {
    const ac = new AbortController();
    setLoading(true);
    setError(null);
    setFlipped(false);

    void (async () => {
      try {
        const doc = await cardsCollection(fas).get(cardId);
        if (ac.signal.aborted) return;
        if (!doc) {
          setCard(null);
          setError(t.publicCard.notFound);
          return;
        }
        setCard(cardFromDocument(doc));
      } catch (err) {
        if (!ac.signal.aborted) {
          const raw = err instanceof Error ? err.message : t.publicCard.loadError;
          setError(/\b401\b/.test(raw) ? t.publicCard.notPublic : raw);
        }
      } finally {
        if (!ac.signal.aborted) setLoading(false);
      }
    })();

    return () => ac.abort();
  }, [cardId, t.publicCard.loadError, t.publicCard.notFound, t.publicCard.notPublic]);

  useEffect(() => {
    if (!card || authLoading) return;
    const key = viewsCounterKey(card.id);
    const seenKey = `fas:card-viewed:${card.id}`;
    let cancelled = false;

    void (async () => {
      try {
        let count = await fas.counters.get(key);
        if (cancelled) return;
        setViews(count);

        if (user && !sessionStorage.getItem(seenKey)) {
          count = await fas.counters.increment(key, 1);
          if (cancelled) return;
          sessionStorage.setItem(seenKey, '1');
          setViews(count);
        }
      } catch {
        if (!cancelled) setViews((current) => current ?? 0);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [card, user, authLoading]);

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const el = stageRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width;
    const py = (event.clientY - rect.top) / rect.height;
    const tiltY = (px - 0.5) * 18;
    const tiltX = (0.5 - py) * 14;
    el.style.setProperty('--tilt-x', `${tiltX.toFixed(2)}deg`);
    el.style.setProperty('--tilt-y', `${tiltY.toFixed(2)}deg`);
    el.dataset.tilting = 'true';
  };

  const resetTilt = () => {
    const el = stageRef.current;
    if (!el) return;
    el.style.setProperty('--tilt-x', '0deg');
    el.style.setProperty('--tilt-y', '0deg');
    delete el.dataset.tilting;
  };

  if (loading) {
    return (
      <>
        <PageHeader title={t.publicCard.loadingTitle} />
        <p role="status">{t.publicCard.loading}</p>
        <Spinner />
      </>
    );
  }

  if (error || !card) {
    return (
      <>
        <PageHeader title={t.publicCard.notFoundTitle} />
        <p role="alert">{error ?? t.publicCard.unavailable}</p>
      </>
    );
  }

  const url = publicCardUrl(card.id);
  const roleLine = [card.headline, card.company].filter(Boolean).join(' · ');
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

  const copyWeChat = async () => {
    if (!card.wechat) return;
    try {
      await navigator.clipboard.writeText(card.wechat);
      toast.show(t.publicCard.wechatCopied, { variant: 'success' });
    } catch {
      // Clipboard unavailable — ignore.
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast.show(t.share.copiedToast, { variant: 'success' });
    } catch {
      toast.show(t.share.copyFailedToast, { variant: 'error' });
    }
  };

  return (
    <div
      ref={stageRef}
      className="card-3d-stage"
      onPointerMove={handlePointerMove}
      onPointerLeave={resetTilt}
      onPointerCancel={resetTilt}
    >
      <div className="card-3d-tilt">
        <div className={flipped ? 'card-3d-flipper card-3d-flipper--flipped' : 'card-3d-flipper'}>
          <article
            className="visitor-card card-3d-face card-3d-face--front"
            aria-label={t.preview.cardAria(card.displayName)}
            aria-hidden={flipped}
          >
            <div className="visitor-card__banner" aria-hidden="true" />

            <div className="visitor-card__body">
              <div className="visitor-card__avatar-wrap">
                {card.photo ? (
                  <img
                    src={card.photo}
                    alt={card.displayName || t.preview.photoAlt}
                    className="visitor-card__avatar"
                  />
                ) : (
                  <div
                    className="visitor-card__avatar visitor-card__avatar--initials"
                    aria-hidden="true"
                  >
                    {(card.displayName.trim()[0] || '?').toUpperCase()}
                  </div>
                )}
              </div>

              <h1 className="visitor-card__name">{card.displayName}</h1>
              {roleLine ? <p className="visitor-card__role">{roleLine}</p> : null}
              {card.location ? <p className="visitor-card__location">{card.location}</p> : null}
              {card.bio ? <p className="visitor-card__bio">{card.bio}</p> : null}

              <div className="visitor-card__cta-row">
                <button
                  type="button"
                  className="btn btn--primary visitor-card__save"
                  tabIndex={flipped ? -1 : 0}
                  onClick={() => {
                    downloadVCard(card, url);
                    toast.show(t.publicCard.vCardDownloaded, { variant: 'success' });
                  }}
                >
                  {t.publicCard.saveContact}
                </button>
                <button
                  type="button"
                  className="btn visitor-card__flip-btn"
                  tabIndex={flipped ? -1 : 0}
                  onClick={() => setFlipped(true)}
                >
                  {t.publicCard.flipToQr}
                </button>
              </div>

              {(card.phone || card.email || card.wechat) && (
                <div className="visitor-card__contacts">
                  {card.phone ? (
                    <a
                      className="visitor-card__row"
                      href={`tel:${card.phone}`}
                      tabIndex={flipped ? -1 : 0}
                    >
                      <span className="visitor-card__row-label">{t.preview.phone}</span>
                      <span className="visitor-card__row-value">{card.phone}</span>
                    </a>
                  ) : null}
                  {card.email ? (
                    <a
                      className="visitor-card__row"
                      href={`mailto:${card.email}`}
                      tabIndex={flipped ? -1 : 0}
                    >
                      <span className="visitor-card__row-label">{t.preview.email}</span>
                      <span className="visitor-card__row-value">{card.email}</span>
                    </a>
                  ) : null}
                  {card.wechat ? (
                    <button
                      type="button"
                      className="visitor-card__row"
                      tabIndex={flipped ? -1 : 0}
                      onClick={() => void copyWeChat()}
                    >
                      <span className="visitor-card__row-label">{t.preview.wechat}</span>
                      <span className="visitor-card__row-value">{card.wechat}</span>
                    </button>
                  ) : null}
                </div>
              )}

              {links.length > 0 ? (
                <ul className="visitor-card__links">
                  {links.map((link) => (
                    <li key={link.href}>
                      <a
                        className="visitor-card__pill"
                        href={link.href}
                        target="_blank"
                        rel="noreferrer"
                        tabIndex={flipped ? -1 : 0}
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              ) : null}

              {typeof views === 'number' && views > 0 ? (
                <p className="visitor-card__views" aria-live="polite">
                  {t.preview.views(views)}
                </p>
              ) : null}
            </div>
          </article>

          <section
            className="visitor-card card-3d-face card-3d-face--back"
            aria-label={t.share.qrAlt(card.displayName)}
            aria-hidden={!flipped}
          >
            <div className="visitor-card__banner" aria-hidden="true" />
            <div className="visitor-card__body visitor-card__back-body">
              <h2 className="visitor-card__back-title">{card.displayName}</h2>
              {roleLine ? <p className="visitor-card__role">{roleLine}</p> : null}

              <div className="visitor-card__qr">
                <QrCode
                  value={url}
                  label={t.share.qrAlt(card.displayName)}
                  className="share-panel__qr-svg"
                />
              </div>

              <div className="visitor-card__cta-row">
                <button
                  type="button"
                  className="btn btn--primary visitor-card__save"
                  tabIndex={flipped ? 0 : -1}
                  onClick={() => void copyLink()}
                >
                  {t.share.copyLink}
                </button>
                <button
                  type="button"
                  className="btn visitor-card__flip-btn"
                  tabIndex={flipped ? 0 : -1}
                  onClick={() => setFlipped(false)}
                >
                  {t.publicCard.flipToFront}
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
