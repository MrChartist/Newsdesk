import { Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Toolbar from '@/components/layout/Toolbar';
import TabBar from '@/components/layout/TabBar';
import BackToTop from '@/components/layout/BackToTop';
import CommandPalette from '@/components/layout/CommandPalette';

import Home from '@/pages/Home';
import CompanyPage from '@/pages/CompanyPage';
import CategoryPage from '@/pages/CategoryPage';
import MarketsPage from '@/pages/MarketsPage';
import SectorsPage from '@/pages/SectorsPage';
import SectorDetailPage from '@/pages/SectorDetailPage';
import WatchlistPage from '@/pages/WatchlistPage';

export default function App() {
  const { pathname } = useLocation();

  // Start every navigation at the top, like a native push
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);

  return (
    <div className="min-h-dvh">
      <Sidebar />
      <div className="lg:pl-[calc(var(--sidebar-w)+1.5rem)]">
        <Toolbar />
        <main className="mx-auto w-full max-w-[1280px] px-4 pt-5 sm:px-6 lg:px-8 lg:pt-7 pb-[calc(var(--tabbar-h)+var(--safe-b)+2rem)] lg:pb-12">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/company/:symbol" element={<CompanyPage />} />
            <Route path="/markets" element={<MarketsPage />} />
            <Route path="/sectors" element={<SectorsPage />} />
            <Route path="/sector/:name" element={<SectorDetailPage />} />
            <Route path="/watchlist" element={<WatchlistPage />} />
            <Route path="/category/:slug" element={<CategoryPage />} />
            <Route path="/categories" element={<CategoryPage />} />
            <Route path="*" element={<Home />} />
          </Routes>
        </main>
      </div>
      <TabBar />
      <BackToTop />
      <CommandPalette />
    </div>
  );
}
