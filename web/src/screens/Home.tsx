import { PageHeader, SignInButton } from '@freeappstore/sdk/ui';
import { useAuth } from '@freeappstore/sdk/hooks';
import { fas } from '../fas';
import { useI18n } from '../lib/i18n';

type HomeProps = {
  onNavigate: (href: string) => void;
};

export function Home({ onNavigate }: HomeProps) {
  const { user, loading } = useAuth(fas);
  const { t } = useI18n();

  return (
    <>
      <PageHeader title={t.appName} description={t.home.description} />

      <section className="home-hero" aria-label={t.home.heroAria}>
        <p className="home-hero__lead">{t.home.lead}</p>

        <div className="home-hero__actions">
          {loading ? (
            <p role="status">{t.home.checkingSignIn}</p>
          ) : user ? (
            <button type="button" className="btn btn--primary" onClick={() => onNavigate('/my')}>
              {t.home.openMyCard}
            </button>
          ) : (
            <>
              <SignInButton app={fas} />
              <p className="home-hero__note">{t.home.signInNote}</p>
            </>
          )}
        </div>
      </section>

      <section className="home-points" aria-labelledby="how-title">
        <h2 id="how-title">{t.home.howTitle}</h2>
        <ol>
          <li>{t.home.step1}</li>
          <li>{t.home.step2}</li>
          <li>{t.home.step3}</li>
        </ol>
      </section>
    </>
  );
}
