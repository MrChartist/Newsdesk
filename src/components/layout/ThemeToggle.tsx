import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme, type ThemePref } from '@/hooks/useTheme';
import { cn } from '@/lib/utils';

const OPTIONS: { id: ThemePref; icon: typeof Sun; label: string }[] = [
  { id: 'light', icon: Sun, label: 'Light' },
  { id: 'system', icon: Monitor, label: 'Auto' },
  { id: 'dark', icon: Moon, label: 'Dark' },
];

/** Three-way appearance switch — Light / Auto / Dark, like System Settings. */
export default function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  return (
    <div role="radiogroup" aria-label="Appearance" className={cn('segmented w-full', className)}>
      {OPTIONS.map(({ id, icon: Icon, label }) => (
        <button
          key={id}
          role="radio"
          aria-checked={theme === id}
          aria-selected={theme === id}
          onClick={() => setTheme(id)}
          title={label}
          className={cn(
            'segmented-item flex-1 justify-center !px-2 !py-1.5 transition-colors',
            theme === id && 'bg-card text-foreground shadow-1',
          )}
        >
          <Icon className="w-4 h-4" />
          <span className="sr-only">{label}</span>
        </button>
      ))}
    </div>
  );
}
