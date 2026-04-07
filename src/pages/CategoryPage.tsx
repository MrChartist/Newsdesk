import { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useNewsFeed, useFilteredNews } from '@/hooks/useNewsFeed';
import NewsFeed from '@/components/news/NewsFeed';
import ArticleModal from '@/components/news/ArticleModal';
import { getCategoryMeta, CATEGORIES } from '@/data/categories';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import type { NewsItem } from '@/types/news';

export default function CategoryPage() {
  const { slug } = useParams();
  const categoryId = slug || 'Markets';
  const meta = getCategoryMeta(categoryId);
  const Icon = meta.icon;
  const [selectedArticle, setSelectedArticle] = useState<NewsItem | null>(null);

  const { data, isLoading } = useNewsFeed();
  const filteredItems = useFilteredNews(data?.items, { category: categoryId });

  const sortedItems = useMemo(() => {
    return [...filteredItems].sort((a, b) =>
      new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
    );
  }, [filteredItems]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="surface-card p-6 flex flex-col items-center justify-center py-12 relative overflow-hidden">
        <div 
          className="absolute inset-0 opacity-10" 
          style={{ background: `radial-gradient(circle at center, ${meta.color} 0%, transparent 70%)` }} 
        />
        <div 
          className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 relative z-10"
          style={{ backgroundColor: meta.bgColor, color: meta.color }}
        >
          <Icon className="w-8 h-8" />
        </div>
        <h1 className="text-4xl font-display font-bold relative z-10">{meta.label}</h1>
        <p className="text-muted-foreground mt-2 relative z-10">{sortedItems.length} articles</p>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap gap-2 justify-center py-4">
        {CATEGORIES.slice(0, 12).map(cat => (
          <Link
            key={cat.id}
            to={`/category/${cat.id}`}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium transition-all group border",
              cat.id === categoryId 
                ? "bg-white/10 border-white/20 text-foreground" 
                : "border-transparent text-muted-foreground hover:bg-white/5"
            )}
          >
            <span className="flex items-center gap-2">
              <cat.icon className={cn("w-4 h-4", cat.id === categoryId ? "" : "group-hover:text-foreground")} style={{ color: cat.id === categoryId ? cat.color : undefined }} />
              {cat.label}
            </span>
          </Link>
        ))}
      </div>

      {/* Feed */}
      <NewsFeed
        items={sortedItems}
        isLoading={isLoading}
        onSelectArticle={setSelectedArticle}
      />

      <ArticleModal
        item={selectedArticle}
        onClose={() => setSelectedArticle(null)}
      />
    </div>
  );
}
