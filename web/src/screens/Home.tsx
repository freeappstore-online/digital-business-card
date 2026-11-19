import { PageHeader, SignInButton } from '@freeappstore/sdk/ui';
import { useAuth } from '@freeappstore/sdk/hooks';
import { fas } from '../fas';

type HomeProps = {
  onNavigate: (href: string) => void;
};

export function Home({ onNavigate }: HomeProps) {
  const { user, loading } = useAuth(fas);

  return (
    <>
      <PageHeader
        title="Digital Card"
        description="Networking without paper — free QR, vCard, and a public profile page."
      />

      <section className="home-hero" aria-label="Get started">
        <p className="home-hero__lead">
          Create one card. Share a link or QR. Contacts save you with a tap — no subscriptions,
          no ads, no NFC required.
        </p>

        <div className="home-hero__actions">
          {loading ? (
            <p role="status">Checking sign-in…</p>
          ) : user ? (
            <button type="button" className="btn btn--primary" onClick={() => onNavigate('/my')}>
              Open my card
            </button>
          ) : (
            <>
              <SignInButton app={fas} />
              <p className="home-hero__note">Sign in to create and edit your card. Public profiles stay open without an account.</p>
            </>
          )}
        </div>
      </section>

      <section className="home-points" aria-labelledby="how-title">
        <h2 id="how-title">How it works</h2>
        <ol>
          <li>Sign in and fill in your details.</li>
          <li>Publish — your card gets a public page and QR code.</li>
          <li>Someone scans or opens the link, then downloads your vCard.</li>
        </ol>
      </section>
    </>
  );
}
