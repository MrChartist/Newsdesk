import { cn } from '@/lib/utils';
import type { NewsItem } from '@/types/news';
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

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onSelect?.(item);
  };

  return (
    <div
      onClick={handleClick}
      className={cn("premium-card flex flex-col group cursor-pointer overflow-hidden", isNew && "row-new")}
    >
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
