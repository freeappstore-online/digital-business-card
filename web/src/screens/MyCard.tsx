import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@freeappstore/sdk/hooks';
import { PageHeader, SignInButton, Spinner, useToast } from '@freeappstore/sdk/ui';
import { fas } from '../fas';
import { CardForm } from '../components/CardForm';
import { CardPreview } from '../components/CardPreview';
import { SharePanel } from '../components/SharePanel';
import { pwa } from '../fas-capabilities/pwa';
import {
  cardFromDocument,
  cardsCollection,
  EMPTY_CARD,
  normalizeCard,
  validateCard,
  viewsCounterKey,
  type BusinessCard,
} from '../lib/card';
import { useI18n } from '../lib/i18n';

export function MyCard() {
  const { user, loading: authLoading } = useAuth(fas);
  const { t } = useI18n();
  const toast = useToast();
  const [draft, setDraft] = useState<BusinessCard>(EMPTY_CARD);
  const [saved, setSaved] = useState<BusinessCard>(EMPTY_CARD);
  const [cardId, setCardId] = useState<string | null>(null);
  const [views, setViews] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dirty = JSON.stringify(draft) !== JSON.stringify(saved);
  const busy = useRef(false);
  busy.current = dirty || saving;

  useEffect(() => pwa.addBusyGuard(() => busy.current), []);

  useEffect(() => {
    if (!user) {
      setCardId(null);
      setDraft(EMPTY_CARD);
      setSaved(EMPTY_CARD);
      setViews(null);
      setError(null);
      return;
    }

    const cards = cardsCollection(fas);
    const ac = new AbortController();
    setLoading(true);
    setError(null);

    void (async () => {
      try {
        const { documents } = await cards.query<BusinessCard>({
          limit: 1,
          orderBy: 'created_at',
          order: 'desc',
        });
        if (ac.signal.aborted) return;
        const doc = documents[0];
        if (doc) {
          const card = cardFromDocument(doc);
          const fields = normalizeCard(card);
          setCardId(card.id);
          setDraft(fields);
          setSaved(fields);
          try {
            const count = await fas.counters.get(viewsCounterKey(card.id));
            if (!ac.signal.aborted) setViews(count);
          } catch {
            if (!ac.signal.aborted) setViews(0);
          }
        } else {
          setCardId(null);
          setDraft(EMPTY_CARD);
          setSaved(EMPTY_CARD);
          setViews(null);
        }
      } catch (err) {
        if (!ac.signal.aborted) {
          const raw = err instanceof Error ? err.message : t.myCard.loadError;
          setError(/unknown app/i.test(raw) ? t.myCard.unknownAppError : raw);
        }
      } finally {
        if (!ac.signal.aborted) setLoading(false);
      }
    })();

    return () => ac.abort();
  }, [user, t.myCard.loadError, t.myCard.unknownAppError]);

  const save = async () => {
    const next = normalizeCard(draft);
    const invalid = validateCard(next, t.validation);
    if (invalid) {
      toast.show(invalid, { variant: 'error' });
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const cards = cardsCollection(fas);
      if (cardId) {
        const updated = await cards.update(cardId, next);
        const fields = normalizeCard(cardFromDocument(updated));
        setDraft(fields);
        setSaved(fields);
      } else {
        const created = await cards.create(next);
        const card = cardFromDocument(created);
        const fields = normalizeCard(card);
        setCardId(card.id);
        setDraft(fields);
        setSaved(fields);
        setViews(0);
      }
      toast.show(t.myCard.savedToast, { variant: 'success' });
    } catch (err) {
      const raw = err instanceof Error ? err.message : t.myCard.saveError;
      const message = /unknown app/i.test(raw) ? t.myCard.unknownAppError : raw;
      setError(message);
      toast.show(message, { variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (authLoading) {
    return (
      <>
        <PageHeader title={t.myCard.title} />
        <p role="status">{t.myCard.loadingAccount}</p>
        <Spinner />
      </>
    );
  }

  if (!user) {
    return (
      <>
        <PageHeader title={t.myCard.title} description={t.myCard.signInDescription} />
        <SignInButton app={fas} />
      </>
    );
  }

  return (
    <>
      <PageHeader
        title={t.myCard.title}
        description={t.myCard.description}
        actions={
          <button
            type="button"
            className="btn btn--primary"
            disabled={!dirty || saving}
            onClick={() => void save()}
          >
            {saving ? t.myCard.saving : t.myCard.save}
          </button>
        }
      />

      {loading ? (
        <>
          <p role="status">{t.myCard.loadingCard}</p>
          <Spinner />
        </>
      ) : null}
      {error ? (
        <p role="alert" className="form-alert">
          {error}
        </p>
      ) : null}
      {dirty ? (
        <p className="form-hint" role="status">
          {t.myCard.unsaved}
        </p>
      ) : null}

      <div className="my-card-layout">
        <CardForm value={draft} onChange={setDraft} disabled={loading || saving} />
        <div className="my-card-layout__side">
          <CardPreview card={draft} views={views} />
          {cardId && !dirty ? <SharePanel cardId={cardId} card={saved} /> : null}
          {cardId && dirty ? <p className="form-hint">{t.myCard.saveToRefresh}</p> : null}
        </div>
      </div>
    </>
  );
}
