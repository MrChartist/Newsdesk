import { useMemo } from 'react';
import { Bookmark } from 'lucide-react';
import { useBookmarks } from '@/hooks/useBookmarks';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { buildStories } from '@/lib/stories';
import NewsStream from '@/components/news/NewsStream';
import { PageHeader } from '@/components/ui/Section';
import EmptyState from '@/components/ui/EmptyState';

export default function SavedPage() {
  useDocumentTitle('Saved');
  const { items, count } = useBookmarks();
  const stories = useMemo(() => buildStories(items), [items]);

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Read later" title="Saved" subtitle={count ? `${count} stor${count === 1 ? 'y' : 'ies'} kept on this device.` : 'Stories you save show up here.'} />
      {count === 0 ? (
        <div className="card">
          <EmptyState icon={Bookmark} title="Nothing saved yet" hint="Tap the bookmark on any story, or press S while it’s selected. Saved stories stay even after the archive is pruned." />
        </div>
      ) : (
        <NewsStream stories={stories} live={false} title="Saved stories" digestTitle="Saved stories" />
      )}
    </div>
  );
}
