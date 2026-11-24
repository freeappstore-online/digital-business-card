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

type PublicCardProps = {
  cardId: string;
};

export function PublicCard({ cardId }: PublicCardProps) {
  const toast = useToast();
  const { user, loading: authLoading } = useAuth(fas);
  const [card, setCard] = useState<CardDocument | null>(null);
  const [views, setViews] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useDocumentTitle(card ? `${card.displayName} — Digital Card` : 'Card — Digital Card');

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
          setError('This card was not found, or the cards collection is not shared yet.');
          return;
        }
        setCard(cardFromDocument(doc));
      } catch (err) {
        if (!ac.signal.aborted) {
          const raw = err instanceof Error ? err.message : 'Could not load this card.';
          // Private collection → 401 for signed-out / other users until app owner runs
          // `fas db share cards`. Code `{ visibility: 'public-read' }` alone is not enough.
          setError(
            /\b401\b/.test(raw)
              ? 'This card is not public yet. The app owner needs to run: fas db share cards'
              : raw,
          );
        }
      } finally {
        if (!ac.signal.aborted) setLoading(false);
      }
    })();

    return () => ac.abort();
  }, [cardId]);

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
        <PageHeader title="Card" />
        <p role="status">Loading card…</p>
        <Spinner />
      </>
    );
  }

  if (error || !card) {
    return (
      <>
        <PageHeader title="Card not found" />
        <p role="alert">{error ?? 'This card is unavailable.'}</p>
      </>
    );
  }

  const url = publicCardUrl(card.id);

  return (
    <>
      <PageHeader
        title={card.displayName}
        description={[card.headline, card.company].filter(Boolean).join(' · ') || 'Digital business card'}
        actions={
          <button
            type="button"
            className="btn btn--primary"
            onClick={() => {
              downloadVCard(card, url);
              toast.show('vCard downloaded', { variant: 'success' });
            }}
          >
            Save contact
          </button>
        }
      />
      <CardPreview card={card} views={views} />
    </>
  );
}
