import { Routes, Route, Navigate, useLocation, useNavigationType } from 'react-router-dom';
import { WifiOff } from 'lucide-react';
import { useNewsFeed } from '@/hooks/useNewsFeed';
import { useEffect } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Toolbar from '@/components/layout/Toolbar';
import TabBar from '@/components/layout/TabBar';
import BackToTop from '@/components/layout/BackToTop';
import CommandPalette from '@/components/layout/CommandPalette';
import ShortcutsSheet from '@/components/layout/ShortcutsSheet';
import Footer from '@/components/layout/Footer';
import Toaster from '@/components/ui/Toaster';

import Home from '@/pages/Home';
import SearchPage from '@/pages/SearchPage';
import SavedPage from '@/pages/SavedPage';
import TopicsPage from '@/pages/TopicsPage';
import TopicPage from '@/pages/TopicPage';
import SourcesPage from '@/pages/SourcesPage';
import SourcePage from '@/pages/SourcePage';
import CompanyPage from '@/pages/CompanyPage';
import StocksPage from '@/pages/StocksPage';

export default function App() {
  const { pathname } = useLocation();
  const navType = useNavigationType();
  const { isError, data, refetch } = useNewsFeed();

  // New pages start at the top; going Back keeps the browser's restored scroll position
  useEffect(() => { if (navType !== 'POP') window.scrollTo(0, 0); }, [pathname, navType]);

  return (
    <div className="min-h-dvh">
      <a href="#main" className="sr-only z-[200] rounded-full bg-primary px-4 py-2 font-semibold text-primary-foreground focus:not-sr-only focus:fixed focus:left-4 focus:top-4">Skip to content</a>
      <Sidebar />
      <div className="lg:pl-[calc(var(--sidebar-w)+1.5rem)]">
        <Toolbar />
        {isError && data && (
          <div role="status" className="flex items-center justify-center gap-2 bg-ios-orange/15 px-4 py-2 text-center text-[0.8125rem] font-semibold text-warning">
            <WifiOff className="h-4 w-4 shrink-0" />
            <span>Can’t reach the news server — showing stories already loaded.</span>
            <button onClick={() => refetch()} className="underline underline-offset-2">Retry</button>
          </div>
        )}
        <main id="main" tabIndex={-1} className="mx-auto w-full max-w-[1280px] px-4 pb-[calc(var(--tabbar-h)+var(--safe-b)+2rem)] pt-5 sm:px-6 lg:px-8 lg:pb-12 lg:pt-7 outline-none">
          <div key={pathname} className="route-in">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/stocks" element={<StocksPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/saved" element={<SavedPage />} />
            <Route path="/topics" element={<TopicsPage />} />
            <Route path="/topic/:id" element={<TopicPage />} />
            <Route path="/sources" element={<SourcesPage />} />
            <Route path="/source/:id" element={<SourcePage />} />
            <Route path="/company/:symbol" element={<CompanyPage />} />
            {/* legacy URLs */}
            <Route path="/markets" element={<Navigate to="/stocks" replace />} />
            <Route path="/screener" element={<Navigate to="/stocks" replace />} />
            <Route path="/categories" element={<Navigate to="/topics" replace />} />
            <Route path="/category/:id" element={<LegacyTopic />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          </div>
        </main>
        <Footer />
      </div>
      <TabBar />
      <BackToTop />
      <CommandPalette />
      <ShortcutsSheet />
      <Toaster />
    </div>
  );
}

function LegacyTopic() {
  const { pathname } = useLocation();
  return <Navigate to={pathname.replace('/category/', '/topic/')} replace />;
}
