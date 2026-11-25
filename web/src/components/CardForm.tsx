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

type FieldDef = {
  key: TextFieldKey;
  type?: string;
  autoComplete?: string;
  multiline?: boolean;
  full?: boolean;
};

const CORE_FIELDS: FieldDef[] = [
  { key: 'displayName', autoComplete: 'name' },
  { key: 'location', autoComplete: 'address-level2' },
  { key: 'headline' },
  { key: 'company', autoComplete: 'organization' },
  { key: 'email', type: 'email', autoComplete: 'email' },
  { key: 'phone', type: 'tel', autoComplete: 'tel' },
  { key: 'website', type: 'url', full: true },
  { key: 'bio', multiline: true, full: true },
];

const SOCIAL_FIELDS: FieldDef[] = [
  { key: 'linkedin', type: 'url' },
  { key: 'x', type: 'url' },
  { key: 'github', type: 'url' },
  { key: 'instagram' },
  { key: 'whatsapp' },
  { key: 'wechat' },
  { key: 'telegram' },
];

export function CardForm({ value, onChange, disabled }: CardFormProps) {
  const { t } = useI18n();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);

  const filledSocialCount = SOCIAL_FIELDS.filter((f) => value[f.key].trim().length > 0).length;

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

  const renderField = (field: FieldDef) => {
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
      <div
        key={field.key}
        className={field.full ? 'card-form__field card-form__field--full' : 'card-form__field'}
      >
        <label htmlFor={id}>{copy.label}</label>
        {field.multiline ? (
          <textarea {...common} rows={2} />
        ) : (
          <input {...common} type={field.type ?? 'text'} />
        )}
      </div>
    );
  };

  return (
    <div className="card-form">
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
            className="sr-only"
            aria-label={t.form.photoLabel}
          />
          <button
            type="button"
            className="btn"
            disabled={disabled || photoBusy}
            onClick={() => fileInputRef.current?.click()}
          >
            {value.photo ? t.form.changePhoto : t.form.uploadPhoto}
          </button>
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
      {photoError ? (
        <p role="alert" className="form-alert">
          {photoError}
        </p>
      ) : null}

      <div className="card-form__grid">{CORE_FIELDS.map(renderField)}</div>

      <details className="card-form__section" open={filledSocialCount > 0}>
        <summary className="card-form__summary">
          {t.form.socialLinksSection(filledSocialCount)}
        </summary>
        <div className="card-form__grid card-form__grid--social">
          {SOCIAL_FIELDS.map(renderField)}
        </div>
      </details>
    </div>
  );
}
