import { useToast } from '@freeappstore/sdk/ui';
import { downloadVCard, publicCardUrl, type BusinessCard } from '../lib/card';
import { useI18n } from '../lib/i18n';
import { QrCode } from '../lib/QrCode';

type SharePanelProps = {
  cardId: string;
  card: BusinessCard;
};

export function SharePanel({ cardId, card }: SharePanelProps) {
  const { t } = useI18n();
  const toast = useToast();
  const url = publicCardUrl(cardId);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast.show(t.share.copiedToast, { variant: 'success' });
    } catch {
      toast.show(t.share.copyFailedToast, { variant: 'error' });
    }
  };

  const shareNative = async () => {
    if (!navigator.share) {
      await copyLink();
      return;
    }
    try {
      await navigator.share({
        title: card.displayName,
        text: t.share.shareText(card.displayName),
        url,
      });
    } catch {
      // User cancelled share sheet — ignore.
    }
  };

  return (
    <section className="share-panel" aria-labelledby="share-title">
      <h2 id="share-title">{t.share.title}</h2>
      <p className="share-panel__hint">{t.share.hint}</p>

      <div className="share-panel__qr">
        <QrCode value={url} label={t.share.qrAlt(card.displayName)} className="share-panel__qr-svg" />
      </div>

      <p className="share-panel__url">
        <a href={url}>{url}</a>
      </p>

      <div className="share-panel__actions">
        <button type="button" className="btn btn--primary" onClick={() => void copyLink()}>
          {t.share.copyLink}
        </button>
        <button type="button" className="btn" onClick={() => void shareNative()}>
          {t.share.share}
        </button>
        <button type="button" className="btn" onClick={() => downloadVCard(card, url)}>
          {t.share.downloadVCard}
        </button>
      </div>
    </section>
  );
}
