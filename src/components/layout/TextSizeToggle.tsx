import { TEXT_SIZES, useTextSize } from '@/hooks/useTextSize';
import { cn } from '@/lib/utils';

/** Three "Aa" steps — Default / Large / Largest. */
export default function TextSizeToggle({ className }: { className?: string }) {
  const { size, setSize } = useTextSize();
  return (
    <div role="radiogroup" aria-label="Text size" className={cn('segmented w-full', className)}>
      {TEXT_SIZES.map((t, i) => (
        <button
          key={t.id} role="radio" aria-checked={size === t.id} onClick={() => setSize(t.id)} title={t.label}
          className={cn('segmented-item flex-1 justify-center !px-2 !py-1 font-bold transition-colors', size === t.id && 'bg-card text-foreground shadow-1')}
          style={{ fontSize: `${0.8 + i * 0.16}rem` }}
        >
          Aa<span className="sr-only"> {t.label}</span>
        </button>
      ))}
    </div>
  );
}
