import { useRef, useState, type ChangeEvent } from 'react';
import type { BusinessCard } from '../lib/card';
import { compressProfilePhoto } from '../lib/photo';

type CardFormProps = {
  value: BusinessCard;
  onChange: (next: BusinessCard) => void;
  disabled?: boolean;
};

type TextFieldKey = Exclude<keyof BusinessCard, 'photo'>;

const FIELDS: {
  key: TextFieldKey;
  label: string;
  type?: string;
  autoComplete?: string;
  placeholder?: string;
  multiline?: boolean;
}[] = [
  { key: 'displayName', label: 'Name', autoComplete: 'name', placeholder: 'Alex Rivera' },
  { key: 'headline', label: 'Headline', placeholder: 'Product designer' },
  { key: 'company', label: 'Company', autoComplete: 'organization', placeholder: 'Studio North' },
  { key: 'email', label: 'Email', type: 'email', autoComplete: 'email', placeholder: 'alex@example.com' },
  { key: 'phone', label: 'Phone', type: 'tel', autoComplete: 'tel', placeholder: '+1 555 0100' },
  { key: 'website', label: 'Website', type: 'url', placeholder: 'https://example.com' },
  { key: 'location', label: 'Location', autoComplete: 'address-level2', placeholder: 'Melbourne' },
  { key: 'linkedin', label: 'LinkedIn URL', type: 'url', placeholder: 'https://linkedin.com/in/…' },
  { key: 'x', label: 'X URL', type: 'url', placeholder: 'https://x.com/…' },
  { key: 'github', label: 'GitHub URL', type: 'url', placeholder: 'https://github.com/…' },
  { key: 'instagram', label: 'Instagram', placeholder: '@handle or https://instagram.com/…' },
  { key: 'whatsapp', label: 'WhatsApp', placeholder: '+61 411 935 878 or https://wa.me/…' },
  { key: 'wechat', label: 'WeChat ID', placeholder: 'your_wechat_id' },
  { key: 'telegram', label: 'Telegram', placeholder: '@username or https://t.me/…' },
  {
    key: 'bio',
    label: 'Bio',
    multiline: true,
    placeholder: 'One short line about what you do.',
  },
];

export function CardForm({ value, onChange, disabled }: CardFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);

  const handlePhotoChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    if (!file) return;
    setPhotoBusy(true);
    setPhotoError(null);
    try {
      const dataUrl = await compressProfilePhoto(file);
      onChange({ ...value, photo: dataUrl });
    } catch (err) {
      setPhotoError(err instanceof Error ? err.message : 'Could not load that photo.');
    } finally {
      setPhotoBusy(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="card-form">
      <div className="card-form__field">
        <label htmlFor="card-photo">Profile photo</label>
        <div className="photo-picker">
          {value.photo ? (
            <img
              src={value.photo}
              alt={`${value.displayName || 'Profile'} preview`}
              className="photo-picker__thumb"
            />
          ) : (
            <div className="photo-picker__placeholder" aria-hidden="true">
              {(value.displayName.trim()[0] || '?').toUpperCase()}
            </div>
          )}
          <div className="photo-picker__controls">
            <input
              ref={fileInputRef}
              id="card-photo"
              type="file"
              accept="image/*"
              disabled={disabled || photoBusy}
              onChange={(event) => void handlePhotoChange(event)}
              className="photo-picker__input"
            />
            {value.photo ? (
              <button
                type="button"
                className="btn"
                disabled={disabled || photoBusy}
                onClick={() => {
                  setPhotoError(null);
                  onChange({ ...value, photo: '' });
                }}
              >
                Remove photo
              </button>
            ) : null}
          </div>
        </div>
        <p className="form-hint">Cropped to a square and compressed automatically.</p>
        {photoError ? (
          <p role="alert" className="form-alert">
            {photoError}
          </p>
        ) : null}
      </div>

      {FIELDS.map((field) => {
        const id = `card-${field.key}`;
        const common = {
          id,
          name: field.key,
          disabled,
          value: value[field.key],
          onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
            onChange({ ...value, [field.key]: event.currentTarget.value }),
          placeholder: field.placeholder,
          autoComplete: field.autoComplete,
        };

        return (
          <div key={field.key} className="card-form__field">
            <label htmlFor={id}>{field.label}</label>
            {field.multiline ? (
              <textarea {...common} rows={3} />
            ) : (
              <input {...common} type={field.type ?? 'text'} />
            )}
          </div>
        );
      })}
    </div>
  );
}
