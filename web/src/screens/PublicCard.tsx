import { useEffect, useState } from 'react';
import { useDocumentTitle, PageHeader, Spinner, useToast } from '@freeappstore/sdk/ui';
import { useAuth } from '@freeappstore/sdk/hooks';
import { fas } from '../fas';
import { CardPreview } from '../components/CardPreview';
import {
  cardFromDocument,
  cardsCollection,
  downloadVCard,
  publicCardUrl,
  viewsCounterKey,
  type CardDocument,
} from '../lib/card';
import { useI18n } from '../lib/i18n';

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

  useDocumentTitle(
    card ? `${card.displayName} — ${t.appName}` : `${t.publicCard.loadingTitle} — ${t.appName}`,
  );

  useEffect(() => {
    const ac = new AbortController();
    setLoading(true);
    setError(null);

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

  return (
    <>
      <PageHeader
        title={card.displayName}
        description={[card.headline, card.company].filter(Boolean).join(' · ') || t.publicCard.fallbackDesc}
        actions={
          <button
            type="button"
            className="btn btn--primary"
            onClick={() => {
              downloadVCard(card, url);
              toast.show(t.publicCard.vCardDownloaded, { variant: 'success' });
            }}
          >
            {t.publicCard.saveContact}
          </button>
        }
      />
      <CardPreview card={card} views={views} />
    </>
  );
}
