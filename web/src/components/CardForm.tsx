import { useRef, useState, type ChangeEvent } from 'react';
import type { BusinessCard } from '../lib/card';
import { useI18n } from '../lib/i18n';
import { compressProfilePhoto } from '../lib/photo';

type CardFormProps = {
  value: BusinessCard;
  onChange: (next: BusinessCard) => void;
  disabled?: boolean;
};

type TextFieldKey = Exclude<keyof BusinessCard, 'photo'>;

const FIELDS: {
  key: TextFieldKey;
  type?: string;
  autoComplete?: string;
  multiline?: boolean;
}[] = [
  { key: 'displayName', autoComplete: 'name' },
  { key: 'headline' },
  { key: 'company', autoComplete: 'organization' },
  { key: 'email', type: 'email', autoComplete: 'email' },
  { key: 'phone', type: 'tel', autoComplete: 'tel' },
  { key: 'website', type: 'url' },
  { key: 'location', autoComplete: 'address-level2' },
  { key: 'linkedin', type: 'url' },
  { key: 'x', type: 'url' },
  { key: 'github', type: 'url' },
  { key: 'instagram' },
  { key: 'whatsapp' },
  { key: 'wechat' },
  { key: 'telegram' },
  { key: 'bio', multiline: true },
];

export function CardForm({ value, onChange, disabled }: CardFormProps) {
  const { t } = useI18n();
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
      setPhotoError(err instanceof Error ? err.message : t.form.photoError);
    } finally {
      setPhotoBusy(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="card-form">
      <div className="card-form__field">
        <label htmlFor="card-photo">{t.form.photoLabel}</label>
        <div className="photo-picker">
          {value.photo ? (
            <img
              src={value.photo}
              alt={t.form.photoPreviewAlt(value.displayName)}
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
                {t.form.removePhoto}
              </button>
            ) : null}
          </div>
        </div>
        <p className="form-hint">{t.form.photoHint}</p>
        {photoError ? (
          <p role="alert" className="form-alert">
            {photoError}
          </p>
        ) : null}
      </div>

      {FIELDS.map((field) => {
        const id = `card-${field.key}`;
        const copy = t.form.fields[field.key];
        const common = {
          id,
          name: field.key,
          disabled,
          value: value[field.key],
          onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
            onChange({ ...value, [field.key]: event.currentTarget.value }),
          placeholder: copy.placeholder,
          autoComplete: field.autoComplete,
        };

        return (
          <div key={field.key} className="card-form__field">
            <label htmlFor={id}>{copy.label}</label>
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
