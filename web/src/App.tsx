import { useEffect, useState } from 'react';
import { type NavItem, Shell } from '@freeappstore/sdk/ui';
import { fas } from './fas';
import { LOCALE_OPTIONS, LocaleProvider, useI18n, type Locale } from './lib/i18n';
import { About } from './screens/About';
import { Home } from './screens/Home';
import { MyCard } from './screens/MyCard';
import { PublicCard } from './screens/PublicCard';

export { fas };

function matchPublicCard(path: string): string | null {
  const match = /^\/c\/([^/]+)\/?$/.exec(path);
  return match ? decodeURIComponent(match[1]) : null;
}

function AppShell() {
  const { locale, setLocale, t } = useI18n();
  const [path, setPath] = useState(() => window.location.pathname);

  useEffect(() => {
    const sync = () => setPath(window.location.pathname);
    window.addEventListener('popstate', sync);
    return () => window.removeEventListener('popstate', sync);
  }, []);

  const navigate = (href: string) => {
    window.history.pushState(null, '', href);
    setPath(window.location.pathname);
  };

  const nav: NavItem[] = [
    { label: t.nav.home, href: '/', title: t.appName },
    { label: t.nav.myCard, href: '/my', title: `${t.nav.myCard} — ${t.appName}` },
    { label: t.nav.about, href: '/about', title: `${t.nav.about} — ${t.appName}` },
  ];

  const publicCardId = matchPublicCard(path);

  return (
    <Shell
      app={fas}
      appName={t.appName}
      nav={nav}
      onNavigate={navigate}
      headerActions={
        <select
          className="lang-select"
          value={locale}
          onChange={(event) => setLocale(event.currentTarget.value as Locale)}
          aria-label={t.langSelectAria}
        >
          {LOCALE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      }
    >
      <div className="mx-auto w-full max-w-3xl p-4 sm:p-8">
        {publicCardId ? (
          <PublicCard cardId={publicCardId} />
        ) : path === '/my' ? (
          <MyCard />
        ) : path === '/about' ? (
          <About />
        ) : (
          <Home onNavigate={navigate} />
        )}
      </div>
    </Shell>
  );
}

export default function App() {
  return (
    <LocaleProvider>
      <AppShell />
    </LocaleProvider>
  );
}
