import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeft, Search, RefreshCw, Sun, Moon, Monitor } from 'lucide-react';
import BrandMark from './BrandMark';
import { titleFor, ROOT_PATHS } from './nav';
import { openCommandPalette } from './CommandPalette';
import { useTheme } from '@/hooks/useTheme';
import { useNewsFeed } from '@/hooks/useNewsFeed';
import { cn } from '@/lib/utils';

const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform);

function ago(ms: number) {
  const s = Math.max(0, Math.floor((Date.now() - ms) / 1000));
  if (s < 45) return 'just now';
  const m = Math.floor(s / 60);
  return m < 60 ? `${Math.max(1, m)}m ago` : `${Math.floor(m / 60)}h ago`;
}

/** macOS-style window toolbar / iOS navigation bar: translucent, content scrolls beneath. */
export default function Toolbar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { theme, cycle } = useTheme();
  const { refetch, isFetching, dataUpdatedAt } = useNewsFeed();
  const [, tick] = useState(0);
  useEffect(() => { const t = setInterval(() => tick((n) => n + 1), 30_000); return () => clearInterval(t); }, []);

  const nested = !ROOT_PATHS.includes(pathname);
  const ThemeIcon = theme === 'light' ? Sun : theme === 'system' ? Monitor : Moon;

  return (
    <header className="glass-thick sticky top-0 z-30 border-b border-[var(--mat-separator)] !bg-[var(--mat-glass-strong)]" style={{ paddingTop: 'var(--safe-t)' }}>
      <div className="flex h-[var(--toolbar-h)] items-center gap-3 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-2.5">
          {nested ? (
            <button onClick={() => navigate(-1)} className="icon-btn -ml-2" aria-label="Back"><ChevronLeft className="h-6 w-6" /></button>
          ) : (
            <BrandMark size={30} className="lg:hidden" />
          )}
          <h1 className="truncate font-display text-[1.125rem] font-bold tracking-tight">{titleFor(pathname)}</h1>
        </div>

        <button onClick={openCommandPalette} className="field ml-auto flex !w-auto items-center gap-2 !py-2 text-left text-muted-foreground lg:ml-6 lg:max-w-md lg:flex-1" aria-label="Search (command palette)">
          <Search className="h-4 w-4 shrink-0" />
          <span className="hidden flex-1 truncate sm:inline">Search stories, companies, topics…</span>
          <span className="hidden items-center gap-1 sm:inline-flex"><kbd className="kbd">{isMac ? '⌘' : 'Ctrl'}</kbd><kbd className="kbd">K</kbd></span>
        </button>

        <div className="flex items-center gap-1 lg:ml-auto">
          <button onClick={() => refetch()} className="icon-btn" aria-label="Refresh news" title={dataUpdatedAt ? `Refresh · updated ${ago(dataUpdatedAt)}` : 'Refresh'}>
            <RefreshCw className={cn('h-[18px] w-[18px]', isFetching && 'animate-spin')} />
          </button>
          <button onClick={cycle} className="icon-btn lg:hidden" aria-label={`Appearance: ${theme}`}><ThemeIcon className="h-[18px] w-[18px]" /></button>
        </div>
      </div>
    </header>
  );
}
