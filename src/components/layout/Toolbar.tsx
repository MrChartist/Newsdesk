import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeft, Search } from 'lucide-react';
import BrandMark from './BrandMark';
import MarketStatus from './MarketStatus';
import { titleFor } from './nav';
import { openCommandPalette } from './CommandPalette';
import { useTheme } from '@/hooks/useTheme';
import { Sun, Moon, Monitor } from 'lucide-react';

const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform);

/** macOS-style window toolbar / iOS navigation bar: translucent, content scrolls beneath. */
export default function Toolbar() {
  const { pathname, search } = useLocation();
  const navigate = useNavigate();
  const { theme, cycle } = useTheme();
  const title = titleFor(pathname, search);
  const nested = pathname !== '/' && !['/markets', '/sectors', '/watchlist', '/categories'].includes(pathname);
  const ThemeIcon = theme === 'light' ? Sun : theme === 'system' ? Monitor : Moon;

  return (
    <header
      className="sticky top-0 z-30 border-b border-[var(--mat-separator)] glass-thick !bg-[var(--mat-glass-strong)]"
      style={{ paddingTop: 'var(--safe-t)' }}
    >
      <div className="flex h-[var(--toolbar-h)] items-center gap-3 px-4 sm:px-6 lg:px-8">
        {/* Leading */}
        <div className="flex items-center gap-2.5 min-w-0">
          {nested ? (
            <button onClick={() => navigate(-1)} className="icon-btn -ml-2" aria-label="Back">
              <ChevronLeft className="w-6 h-6" />
            </button>
          ) : (
            <BrandMark size={30} className="lg:hidden" />
          )}
          <h1 className="font-display font-bold text-[1.125rem] tracking-tight truncate">{title}</h1>
        </div>

        {/* Search field → command palette */}
        <button
          onClick={openCommandPalette}
          className="field !w-auto ml-auto lg:ml-6 lg:flex-1 lg:max-w-md flex items-center gap-2 !py-2 text-left text-muted-foreground"
          aria-label="Search (command palette)"
        >
          <Search className="w-4 h-4 shrink-0" />
          <span className="hidden sm:inline flex-1 truncate">Search stocks, news, sectors…</span>
          <span className="hidden sm:inline-flex items-center gap-1">
            <kbd className="kbd">{isMac ? '⌘' : 'Ctrl'}</kbd><kbd className="kbd">K</kbd>
          </span>
        </button>

        {/* Trailing */}
        <div className="hidden md:flex items-center gap-2 lg:ml-auto">
          <MarketStatus />
        </div>
        <button onClick={cycle} className="icon-btn lg:hidden" aria-label={`Appearance: ${theme}`}>
          <ThemeIcon className="w-[18px] h-[18px]" />
        </button>
      </div>
    </header>
  );
}
