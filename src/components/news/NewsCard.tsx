import { Bookmark } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { NewsItem } from '@/types/news';
import { useBookmarks } from '@/hooks/useBookmarks';
import FeedSourceBadge from './FeedSourceBadge';
import CategoryBadge from './CategoryBadge';
import TimeAgo from './TimeAgo';
import CompanyMentionTag from '../company/CompanyMentionTag';

interface Props {
  item: NewsItem;
  onSelect?: (item: NewsItem) => void;
}

export default function NewsCard({ item, onSelect }: Props) {
  const isNew = (Date.now() - new Date(item.pubDate).getTime()) < 5 * 60 * 1000;
  const { isBookmarked, toggle } = useBookmarks();
  const saved = isBookmarked(item.link);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onSelect?.(item);
  };

  const handleBookmark = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggle(item);
  };

  return (
    <div
      onClick={handleClick}
      className={cn("premium-card flex flex-col group cursor-pointer overflow-hidden relative", isNew && "row-new")}
    >
      {/* Bookmark toggle */}
      <button
        onClick={handleBookmark}
        title={saved ? 'Remove from saved' : 'Save article'}
        aria-label={saved ? 'Remove from saved' : 'Save article'}
        className={cn(
          "absolute top-2.5 right-2.5 z-10 p-1.5 rounded-lg backdrop-blur-md ring-1 transition-all",
          saved
            ? "bg-primary/20 ring-primary/40 text-primary opacity-100"
            : "bg-black/40 ring-white/10 text-white/80 opacity-0 group-hover:opacity-100 hover:text-primary"
        )}
      >
        <Bookmark className={cn("w-3.5 h-3.5", saved && "fill-current")} />
      </button>

      {item.image && (
        <div className="w-full h-40 overflow-hidden relative">
          <img
            src={item.image}
            alt=""
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>
      )}

      <div className="p-4 flex flex-col flex-1 gap-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-wrap">
            <FeedSourceBadge source={item.source} />
            <CategoryBadge category={item.category} />
          </div>
          <TimeAgo date={item.pubDate} className="shrink-0" />
        </div>

        <h3 className="font-display font-semibold text-base leading-snug group-hover:text-primary transition-colors line-clamp-3">
          {item.title}
        </h3>

        <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
          {item.description}
        </p>

        <div className="mt-auto pt-4 flex flex-wrap items-center gap-1.5">
          {item.companies.map((symbol) => (
            <CompanyMentionTag key={symbol} symbol={symbol} />
          ))}
        </div>
      </div>
    </div>
  );
}
