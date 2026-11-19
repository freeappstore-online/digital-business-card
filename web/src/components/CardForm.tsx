import type { ChangeEvent } from 'react';
import type { BusinessCard } from '../lib/card';

type CardFormProps = {
  value: BusinessCard;
  onChange: (next: BusinessCard) => void;
  disabled?: boolean;
};

const FIELDS: {
  key: keyof BusinessCard;
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
  {
    key: 'bio',
    label: 'Bio',
    multiline: true,
    placeholder: 'One short line about what you do.',
  },
];

export function CardForm({ value, onChange, disabled }: CardFormProps) {
  return (
    <div className="card-form">
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
