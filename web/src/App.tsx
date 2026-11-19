import { useEffect, useState } from 'react';
import { type NavItem, Shell } from '@freeappstore/sdk/ui';
import { fas } from './fas';
import { About } from './screens/About';
import { Home } from './screens/Home';
import { MyCard } from './screens/MyCard';
import { PublicCard } from './screens/PublicCard';

export { fas };

const APP_NAME = 'Digital Card';

const NAV: NavItem[] = [
  { label: 'Home', href: '/', title: APP_NAME },
  { label: 'My card', href: '/my', title: `My card — ${APP_NAME}` },
  { label: 'About', href: '/about', title: `About — ${APP_NAME}` },
];

function matchPublicCard(path: string): string | null {
  const match = /^\/c\/([^/]+)\/?$/.exec(path);
  return match ? decodeURIComponent(match[1]) : null;
}

export default function App() {
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

  const publicCardId = matchPublicCard(path);

  return (
    <Shell app={fas} appName={APP_NAME} nav={NAV} onNavigate={navigate}>
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
