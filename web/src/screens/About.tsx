import { PageHeader } from '@freeappstore/sdk/ui';
import { useI18n } from '../lib/i18n';

export function About() {
  const { t } = useI18n();

  return (
    <>
      <PageHeader title={t.about.title} description={t.about.description} />
      <div className="prose">
        <p>{t.about.p1}</p>
        <p>{t.about.p2}</p>
        <p>{t.about.p3}</p>
      </div>
    </>
  );
}
