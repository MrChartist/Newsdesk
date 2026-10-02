import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Toolbar from '@/components/layout/Toolbar';
import TabBar from '@/components/layout/TabBar';
import BackToTop from '@/components/layout/BackToTop';
import CommandPalette from '@/components/layout/CommandPalette';
import ShortcutsSheet from '@/components/layout/ShortcutsSheet';

import Home from '@/pages/Home';
import SearchPage from '@/pages/SearchPage';
import SavedPage from '@/pages/SavedPage';
import TopicsPage from '@/pages/TopicsPage';
import TopicPage from '@/pages/TopicPage';
import SourcesPage from '@/pages/SourcesPage';
import SourcePage from '@/pages/SourcePage';
import CompanyPage from '@/pages/CompanyPage';

export default function App() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);

  return (
    <div className="min-h-dvh">
      <Sidebar />
      <div className="lg:pl-[calc(var(--sidebar-w)+1.5rem)]">
        <Toolbar />
        <main className="mx-auto w-full max-w-[1280px] px-4 pb-[calc(var(--tabbar-h)+var(--safe-b)+2rem)] pt-5 sm:px-6 lg:px-8 lg:pb-12 lg:pt-7">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/saved" element={<SavedPage />} />
            <Route path="/topics" element={<TopicsPage />} />
            <Route path="/topic/:id" element={<TopicPage />} />
            <Route path="/sources" element={<SourcesPage />} />
            <Route path="/source/:id" element={<SourcePage />} />
            <Route path="/company/:symbol" element={<CompanyPage />} />
            {/* legacy URLs */}
            <Route path="/categories" element={<Navigate to="/topics" replace />} />
            <Route path="/category/:id" element={<LegacyTopic />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
      <TabBar />
      <BackToTop />
      <CommandPalette />
      <ShortcutsSheet />
    </div>
  );
}

function LegacyTopic() {
  const { pathname } = useLocation();
  return <Navigate to={pathname.replace('/category/', '/topic/')} replace />;
}
