import { Routes, Route } from 'react-router-dom';
import TopBar from '@/components/layout/TopBar';
import TickerBar from '@/components/layout/TickerBar';
import BackToTop from '@/components/layout/BackToTop';
import MobileNav from '@/components/layout/MobileNav';

import Home from '@/pages/Home';
import CompanyPage from '@/pages/CompanyPage';
import CategoryPage from '@/pages/CategoryPage';
import MarketsPage from '@/pages/MarketsPage';
import SectorsPage from '@/pages/SectorsPage';
import SectorDetailPage from '@/pages/SectorDetailPage';
import WatchlistPage from '@/pages/WatchlistPage';

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary/30 selection:text-primary">
      {/* Global Fixed Header Stack */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <TopBar />
        <TickerBar />
      </div>

      {/* Main Content Area — offset for fixed header (~64+40 = 104px),
          extra bottom padding on mobile for the bottom nav bar */}
      <main className="flex-1 w-full max-w-[1600px] mx-auto px-4 pt-[120px] sm:px-6 lg:px-8 pb-24 md:pb-8">
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

      <BackToTop />
      <MobileNav />
    </div>
  );
}
