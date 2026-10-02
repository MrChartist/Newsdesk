import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, Copy, Check, Loader2, Bookmark, Share2 } from 'lucide-react';
import { cn, timeAgo } from '@/lib/utils';
import type { NewsItem } from '@/types/news';
import { useBookmarks } from '@/hooks/useBookmarks';
import CategoryBadge from './CategoryBadge';
import FeedSourceBadge from './FeedSourceBadge';
import CompanyMentionTag from '../company/CompanyMentionTag';

interface Props {
  item: NewsItem | null;
  onClose: () => void;
}

type ReaderStatus = 'loading' | 'ready' | 'error';

/** Reader sheet — iOS-style sheet on phones, centred macOS panel on desktop. */
export default function ArticleModal({ item, onClose }: Props) {
  const [copied, setCopied] = useState(false);
  const [status, setStatus] = useState<ReaderStatus>('loading');
  const [srcDoc, setSrcDoc] = useState('');
  const { isBookmarked, toggle } = useBookmarks();
  const saved = item ? isBookmarked(item.link) : false;

  // Fetch the proxied article HTML so failures (403/502 bodies) can be detected
  // and replaced with the graceful "Read on source" card instead of raw JSON.
  useEffect(() => {
    setCopied(false);
    if (!item) return;

    setStatus('loading');
    setSrcDoc('');
    const ctrl = new AbortController();

    fetch(`/api/article-proxy?url=${encodeURIComponent(item.link)}`, { signal: ctrl.signal })
      .then(async (res) => {
        const ct = res.headers.get('content-type') || '';
        if (!res.ok || !ct.includes('text/html')) throw new Error(`status ${res.status}`);
        setSrcDoc(await res.text());
        setStatus('ready');
      })
      .catch((err) => { if (err.name !== 'AbortError') setStatus('error'); });

    return () => ctrl.abort();
  }, [item?.link]);

  useEffect(() => {
    if (!item) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', handler); document.body.style.overflow = ''; };
  }, [item, onClose]);

  const handleCopy = async () => {
    if (!item) return;
    try {
      await navigator.clipboard.writeText(item.link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* clipboard blocked */ }
  };

  const handleShare = async () => {
    if (!item) return;
    if (navigator.share) {
      try { await navigator.share({ title: item.title, url: item.link }); } catch { /* cancelled */ }
    } else {
      handleCopy();
    }
  };

  return (
    <AnimatePresence>
      {item && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/45 backdrop-blur-[3px]"
            onClick={onClose}
          />

          <motion.div
            key="sheet"
            role="dialog"
            aria-modal="true"
            aria-label={item.title}
            initial={{ opacity: 0, y: 48, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 48, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 360, damping: 34 }}
            className="fixed inset-x-0 bottom-0 top-[max(0.75rem,var(--safe-t))] z-[101] flex flex-col overflow-hidden rounded-t-[var(--r-xl)] bg-card shadow-float md:inset-x-6 md:bottom-6 md:top-6 md:rounded-[var(--r-xl)] lg:inset-x-[7%] xl:inset-x-[12%]"
          >
            {/* grabber (phones) */}
            <div className="flex justify-center pt-2 md:hidden" aria-hidden>
              <span className="h-1 w-9 rounded-full bg-[var(--mat-fill-3)]" />
            </div>

            <div className="glass-thick flex shrink-0 items-center gap-2 border-b border-[var(--mat-separator)] px-4 py-2.5">
              <div className="flex min-w-0 flex-1 items-center gap-2">
                <FeedSourceBadge source={item.source} />
                <span className="text-muted-foreground/50">·</span>
                <span className="whitespace-nowrap text-xs tnum text-muted-foreground">{timeAgo(item.pubDate)}</span>
                <CategoryBadge category={item.category} className="hidden sm:inline-flex" />
                <div className="ml-1 hidden items-center gap-1 lg:flex">
                  {item.companies.slice(0, 3).map((symbol) => <CompanyMentionTag key={symbol} symbol={symbol} />)}
                </div>
              </div>

              <button
                onClick={() => toggle(item)}
                className={cn('icon-btn', saved && '!text-ios-orange')}
                aria-label={saved ? 'Remove from saved' : 'Save article'}
                aria-pressed={saved}
              >
                <Bookmark className={cn('h-[18px] w-[18px]', saved && 'fill-current')} />
              </button>
              <button onClick={handleShare} className="icon-btn sm:hidden" aria-label="Share"><Share2 className="h-[18px] w-[18px]" /></button>
              <button onClick={handleCopy} className="icon-btn hidden sm:inline-flex" aria-label="Copy link">
                {copied ? <Check className="h-[18px] w-[18px] text-profit" /> : <Copy className="h-[18px] w-[18px]" />}
              </button>
              <a href={item.link} target="_blank" rel="noopener noreferrer" className="icon-btn" aria-label="Open original">
                <ExternalLink className="h-[18px] w-[18px]" />
              </a>
              <button onClick={onClose} className="icon-btn bg-[var(--mat-fill-2)]" aria-label="Close"><X className="h-[18px] w-[18px]" /></button>
            </div>

            <div className="relative flex-1 bg-white">
              {status === 'loading' && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-card">
                  <Loader2 className="mb-3 h-7 w-7 animate-spin text-primary" />
                  <p className="text-sm font-medium">Opening article…</p>
                  <p className="mt-1 text-xs text-muted-foreground">{item.source.name}</p>
                </div>
              )}

              {status === 'error' && (
                <div className="absolute inset-0 z-10 flex items-center justify-center overflow-y-auto bg-card px-6 py-10">
                  <div className="max-w-xl text-center">
                    {item.image && <img src={item.image} alt="" className="mb-6 h-48 w-full rounded-[var(--r-lg)] object-cover" />}
                    <h2 className="mb-3 font-display text-2xl font-extrabold leading-tight tracking-tight">{item.title}</h2>
                    <p className="mb-4 text-xs tnum text-muted-foreground">
                      {new Date(item.pubDate).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                      {' · '}
                      {new Date(item.pubDate).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <p className="mb-6 leading-relaxed text-foreground/80">{item.description}</p>
                    <p className="mb-6 text-xs text-muted-foreground">
                      This publisher blocks in-app reading or needs a subscription.
                    </p>
                    <a href={item.link} target="_blank" rel="noopener noreferrer" className="btn btn-primary !min-h-12 !px-6">
                      Read on {item.source.name} <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              )}

              {status === 'ready' && (
                <iframe
                  key={item.link}
                  title={item.title}
                  srcDoc={srcDoc}
                  className="h-full w-full border-0"
                  sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                  referrerPolicy="no-referrer"
                />
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
