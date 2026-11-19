import { useToast } from '@freeappstore/sdk/ui';
import { downloadVCard, publicCardUrl, type BusinessCard } from '../lib/card';
import { QrCode } from '../lib/QrCode';

type SharePanelProps = {
  cardId: string;
  card: BusinessCard;
};

export function SharePanel({ cardId, card }: SharePanelProps) {
  const toast = useToast();
  const url = publicCardUrl(cardId);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast.show('Link copied', { variant: 'success' });
    } catch {
      toast.show('Could not copy — select the link instead', { variant: 'error' });
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
        text: `${card.displayName}'s digital business card`,
        url,
      });
    } catch {
      // User cancelled share sheet — ignore.
    }
  };

  return (
    <section className="share-panel" aria-labelledby="share-title">
      <h2 id="share-title">Share</h2>
      <p className="share-panel__hint">
        Others open your public profile from this link or QR code. NFC writing is not available in
        iOS Safari, so sharing is QR and link only.
      </p>

      <div className="share-panel__qr">
        <QrCode value={url} label={`QR code for ${card.displayName}'s card`} className="share-panel__qr-svg" />
      </div>

      <p className="share-panel__url">
        <a href={url}>{url}</a>
      </p>

      <div className="share-panel__actions">
        <button type="button" className="btn btn--primary" onClick={() => void copyLink()}>
          Copy link
        </button>
        <button type="button" className="btn" onClick={() => void shareNative()}>
          Share…
        </button>
        <button
          type="button"
          className="btn"
          onClick={() => downloadVCard(card, url)}
        >
          Download vCard
        </button>
      </div>
    </section>
  );
}
