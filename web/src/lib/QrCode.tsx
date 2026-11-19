import { renderSVG } from 'uqr';

type QrCodeProps = {
  value: string;
  label: string;
  className?: string;
};

/** Accessible QR SVG for a public card URL. */
export function QrCode({ value, label, className }: QrCodeProps) {
  const svg = renderSVG(value, {
    ecc: 'M',
    border: 2,
  });

  return (
    <div
      className={className}
      role="img"
      aria-label={label}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
