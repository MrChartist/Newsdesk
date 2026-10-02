import { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, Copy, Check, Loader2, Bookmark, Share2, ChevronUp, ChevronDown, Send } from 'lucide-react';
import { cn, timeAgo } from '@/lib/utils';
import type { NewsItem } from '@/types/news';
import type { Story } from '@/lib/stories';
import { formatPost, copyText } from '@/lib/share';
import { useBookmarks } from '@/hooks/useBookmarks';
import { useArticleSummary } from '@/hooks/useArticleSummary';
import { useTextSize, TEXT_SIZES } from '@/hooks/useTextSize';
import ReaderSummary from './ReaderSummary';
import { markRead } from '@/hooks/useReadArticles';
import { toast } from '@/lib/toast';
import CategoryBadge from './CategoryBadge';
import FeedSourceBadge from './FeedSourceBadge';
import CompanyMentionTag from '../company/CompanyMentionTag';

interface Props {
  story: Story | null;
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
}

type ReaderStatus = 'loading' | 'ready' | 'error';
type Tab = 'summary' | 'original';

/** Reader sheet — iOS-style sheet on phones, centred macOS panel on desktop. */
export default function ArticleModal({ story, onClose, onPrev, onNext }: Props) {
  // Which publisher's version of the story is on screen
  const [activeLink, setActiveLink] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>('summary');
  const [copied, setCopied] = useState<'link' | 'post' | null>(null);
  const [status, setStatus] = useState<ReaderStatus>('loading');
  const [srcDoc, setSrcDoc] = useState('');
  const { isBookmarked, toggle } = useBookmarks();
  const dialogRef = useRef<HTMLDivElement>(null);
  const { size: textSize, cycle: cycleTextSize } = useTextSize();
  // Keep keyboard focus on the sheet (not the publisher's iframe) so Esc / ← / → keep working
  const holdFocus = useCallback(() => dialogRef.current?.focus({ preventScroll: true }), []);

  const item: NewsItem | null = story ? (story.items.find((i) => i.link === activeLink) ?? story.lead) : null;
  const saved = item ? isBookmarked(item.link) : false;

  useEffect(() => { setActiveLink(null); setTab('summary'); }, [story?.id]);
  useEffect(() => { setTab('summary'); }, [activeLink]);

  const summary = useArticleSummary(story, item);

  // Fetch the proxied article HTML so failures (403/502 bodies) can be detected
  // and replaced with the graceful "Read on source" card instead of raw JSON.
  useEffect(() => {
    setCopied(null);
    if (!item) return;
    markRead(item.link);
    holdFocus();
    if (tab !== 'original') return;
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
  }, [item?.link, tab]); // eslint-disable-line react-hooks/exhaustive-deps

  const flash = useCallback((what: 'link' | 'post') => {
    setCopied(what);
    setTimeout(() => setCopied(null), 1800);
  }, []);

  useEffect(() => {
    if (!story) return;
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowRight' || e.key === 'j') onNext?.();
      else if (e.key === 'ArrowLeft' || e.key === 'k') onPrev?.();
      else if (e.key === 's' && item) toggle(item);
      else if (e.key === 'o') setTab('original');
      else if (e.key === 'r') setTab('summary');
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [story, item, onClose, onNext, onPrev, toggle]);

  const copyLink = async () => { if (item && await copyText(item.link)) { flash('link'); toast('Link copied'); } };
  const copyPost = async () => { if (item && await copyText(formatPost(item, summary.data?.summary))) { flash('post'); toast('Telegram post copied'); } };
  const share = async () => {
    if (!item) return;
    if (navigator.share) { try { await navigator.share({ title: item.title, url: item.link }); } catch { /* cancelled */ } }
    else copyLink();
  };

  // Rendered into <body> so no page ancestor (transforms, animations, overflow) can clip or re-stack it
  return createPortal(
    <AnimatePresence>
      {story && item && (
        <>
          <motion.div
            key="backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/45 backdrop-blur-[3px]" onClick={onClose}
          />
          <motion.div
            key="sheet" ref={dialogRef} tabIndex={-1} role="dialog" aria-modal="true" aria-label={item.title}
            initial={{ opacity: 0, y: 48, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 48, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 360, damping: 34 }}
            drag={typeof window !== 'undefined' && window.innerWidth < 768 ? 'y' : false}
            dragConstraints={{ top: 0, bottom: 0 }} dragElastic={{ top: 0, bottom: 0.5 }}
            onDragEnd={(_, info) => { if (info.offset.y > 120 || info.velocity.y > 600) onClose(); }}
            className="fixed inset-x-0 bottom-0 top-[max(0.75rem,var(--safe-t))] z-[101] flex flex-col outline-none overflow-hidden rounded-t-[var(--r-xl)] bg-card shadow-float md:inset-x-6 md:bottom-6 md:top-6 md:rounded-[var(--r-xl)] lg:inset-x-[7%] xl:inset-x-[12%]"
          >
            <div className="flex justify-center pt-2 md:hidden" aria-hidden>
              <span className="h-1 w-9 rounded-full bg-[var(--mat-fill-3)]" />
            </div>

            <div className="glass-thick shrink-0 border-b border-[var(--mat-separator)]">
              {/* Row 1 — what this is, where to go next, close */}
              <div className="flex items-center gap-2 px-4 pt-2.5">
                <div className="flex min-w-0 flex-1 items-center gap-2">
                  <FeedSourceBadge source={item.source} />
                  <span aria-hidden className="text-muted-foreground/50">·</span>
                  <span className="whitespace-nowrap text-xs tnum text-muted-foreground">{timeAgo(item.pubDate)}</span>
                  <CategoryBadge category={item.category} className="hidden sm:inline-flex" />
                </div>
                {(onPrev || onNext) && (
                  <div className="flex items-center">
                    <button onClick={onPrev} disabled={!onPrev} className="icon-btn disabled:opacity-30" aria-label="Previous story" title="Previous (←)"><ChevronUp className="h-[18px] w-[18px]" /></button>
                    <button onClick={onNext} disabled={!onNext} className="icon-btn disabled:opacity-30" aria-label="Next story" title="Next (→)"><ChevronDown className="h-[18px] w-[18px]" /></button>
                  </div>
                )}
                <button onClick={onClose} className="icon-btn bg-[var(--mat-fill-2)]" aria-label="Close" title="Close (Esc)"><X className="h-[18px] w-[18px]" /></button>
              </div>

              {/* Row 2 — how to view it, and what to do with it */}
              <div className="flex flex-wrap items-center gap-2 px-4 py-2">
                <div className="segmented" role="tablist" aria-label="View">
                  {(['summary', 'original'] as const).map((t) => (
                    <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)}
                      className={cn('segmented-item', tab === t && 'bg-card shadow-1')}>
                      {t === 'summary' ? 'Summary' : 'Original'}
                    </button>
                  ))}
                </div>
                <div className="ml-auto flex items-center">
                  <button onClick={() => toggle(item)} className={cn('icon-btn', saved && '!text-ios-orange')} aria-label={saved ? 'Remove from saved' : 'Save for later'} aria-pressed={saved} title="Save (s)">
                    <Bookmark className={cn('h-[18px] w-[18px]', saved && 'fill-current')} />
                  </button>
                  <button onClick={cycleTextSize} className="icon-btn" aria-label={`Text size: ${TEXT_SIZES.find((t) => t.id === textSize)!.label}. Tap to change`} title="Text size">
                    <span className="flex items-baseline font-extrabold leading-none"><span className="text-[0.75rem]">A</span><span className="text-[1.05rem]">A</span></span>
                  </button>
                  <button onClick={copyPost} className="icon-btn" aria-label="Copy as Telegram post" title="Copy as Telegram post">
                    {copied === 'post' ? <Check className="h-[18px] w-[18px] text-profit" /> : <Send className="h-[18px] w-[18px]" />}
                  </button>
                  <button onClick={share} className="icon-btn sm:hidden" aria-label="Share"><Share2 className="h-[18px] w-[18px]" /></button>
                  <button onClick={copyLink} className="icon-btn hidden sm:inline-flex" aria-label="Copy link" title="Copy link">
                    {copied === 'link' ? <Check className="h-[18px] w-[18px] text-profit" /> : <Copy className="h-[18px] w-[18px]" />}
                  </button>
                  <a href={item.link} target="_blank" rel="noopener noreferrer" className="icon-btn max-sm:hidden" aria-label="Open on publisher site" title="Open on publisher site"><ExternalLink className="h-[18px] w-[18px]" /></a>
                </div>
              </div>

              {story.items.length > 1 && (
                <div className="flex items-center gap-1.5 overflow-x-auto px-4 pb-2.5 scrollbar-none" role="group" aria-label="Coverage">
                  <span className="eyebrow shrink-0 pr-1">Also from</span>
                  {story.items.map((i) => {
                    const active = i.link === item.link;
                    return (
                      <button key={i.link} aria-pressed={active} onClick={() => setActiveLink(i.link)}
                        className={cn('chip shrink-0 !py-1.5 transition-colors', active ? '!bg-primary !text-primary-foreground' : 'hover:bg-[var(--mat-fill-3)]')}>
                        <span className="h-2 w-2 rounded-full" style={{ background: i.source.color }} />
                        {i.source.name}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className={cn('relative min-h-0 flex-1', tab === 'original' ? 'bg-white' : 'bg-card')}>
              {tab === 'summary' && (
                <ReaderSummary item={item} data={summary.data} loading={summary.isLoading} onOriginal={() => setTab('original')} />
              )}

              {tab === 'original' && status === 'loading' && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-card">
                  <Loader2 className="mb-3 h-7 w-7 animate-spin text-primary" />
                  <p className="text-sm font-medium">Opening the original page…</p>
                  <p className="mt-1 text-xs text-muted-foreground">{item.source.name}</p>
                </div>
              )}

              {tab === 'original' && status === 'error' && (
                <div className="absolute inset-0 z-10 flex items-center justify-center overflow-y-auto bg-card px-6 py-10">
                  <div className="max-w-xl text-center">
                    <h2 className="mb-3 font-display text-2xl font-extrabold leading-tight tracking-tight">This page can’t be shown here</h2>
                    <p className="mb-6 text-sm text-muted-foreground">The publisher blocks in-app viewing or needs a subscription. The Summary tab still has the key points.</p>
                    <div className="flex flex-wrap justify-center gap-3">
                      <button onClick={() => setTab('summary')} className="btn btn-plain">Back to summary</button>
                      <a href={item.link} target="_blank" rel="noopener noreferrer" className="btn btn-primary">Read on {item.source.name} <ExternalLink className="h-4 w-4" /></a>
                    </div>
                  </div>
                </div>
              )}

              {tab === 'original' && status === 'ready' && (
                <iframe
                  key={item.link} title={item.title} srcDoc={srcDoc} className="h-full w-full border-0"
                  /* No allow-same-origin: the publisher's scripts run in an opaque origin and can't reach the app's storage */
                  sandbox="allow-scripts allow-popups allow-forms" referrerPolicy="no-referrer" onLoad={holdFocus}
                />
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
}
