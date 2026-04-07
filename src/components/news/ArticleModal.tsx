import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, Clock, Copy, Check, Maximize2, Minimize2, Loader2 } from 'lucide-react';
import { cn, timeAgo } from '@/lib/utils';
import type { NewsItem } from '@/types/news';
import CategoryBadge from './CategoryBadge';
import FeedSourceBadge from './FeedSourceBadge';
import CompanyMentionTag from '../company/CompanyMentionTag';

interface Props {
  item: NewsItem | null;
  onClose: () => void;
}

export default function ArticleModal({ item, onClose }: Props) {
  const [copied, setCopied] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [iframeError, setIframeError] = useState(false);

  // Reset states when item changes
  useEffect(() => {
    setIframeLoaded(false);
    setIframeError(false);
    setCopied(false);
  }, [item?.link]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (item) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [item]);

  const handleCopy = async () => {
    if (!item) return;
    await navigator.clipboard.writeText(item.link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      {item && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="fixed inset-2 md:inset-4 lg:inset-x-[5%] lg:inset-y-[3%] z-[101] flex flex-col bg-card rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10"
          >
            {/* Header Bar */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/5 shrink-0 bg-surface">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <FeedSourceBadge source={item.source} />
                <CategoryBadge category={item.category} />
                <span className="text-[11px] text-muted-foreground flex items-center gap-1 shrink-0">
                  <Clock className="w-3 h-3" />
                  {timeAgo(item.pubDate)}
                </span>
                <span className="hidden md:inline text-xs text-muted-foreground truncate ml-2 opacity-60">
                  {item.title}
                </span>
              </div>
              <div className="flex items-center gap-1 shrink-0 ml-2">
                {/* Company tags in header */}
                {item.companies.slice(0, 3).map(symbol => (
                  <CompanyMentionTag key={symbol} symbol={symbol} />
                ))}
                <div className="w-px h-5 bg-white/10 mx-1" />
                <button
                  onClick={handleCopy}
                  className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-muted-foreground hover:text-foreground"
                  title="Copy link"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-profit" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-muted-foreground hover:text-foreground"
                  title="Open in new tab"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-muted-foreground hover:text-foreground ml-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Article iframe — full embedded reader */}
            <div className="flex-1 relative bg-white">
              {/* Loading spinner */}
              {!iframeLoaded && !iframeError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-card z-10">
                  <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
                  <p className="text-sm text-muted-foreground">Loading article...</p>
                  <p className="text-xs text-muted-foreground/50 mt-1">{item.source.name}</p>
                </div>
              )}

              {/* Fallback if iframe blocked */}
              {iframeError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-card z-10 px-8">
                  <div className="max-w-xl text-center">
                    {item.image && (
                      <img src={item.image} alt="" className="w-full h-48 object-cover rounded-xl mb-6" />
                    )}
                    <h2 className="text-2xl font-display font-bold mb-4">{item.title}</h2>
                    <p className="text-muted-foreground mb-2 text-sm">
                      {new Date(item.pubDate).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                      {' • '}
                      {new Date(item.pubDate).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <p className="text-foreground/80 leading-relaxed mb-8">{item.description}</p>
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-primary text-primary-foreground font-semibold hover:bg-primary-hover transition-colors"
                    >
                      Read on {item.source.name}
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              )}

              <iframe
                key={item.link}
                src={`/api/article-proxy?url=${encodeURIComponent(item.link)}`}
                className="w-full h-full border-0"
                sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                referrerPolicy="no-referrer"
                onLoad={() => setIframeLoaded(true)}
                onError={() => setIframeError(true)}
              />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
