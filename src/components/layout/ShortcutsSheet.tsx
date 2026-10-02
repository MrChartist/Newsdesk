import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';

const EVENT = 'newsdesk:shortcuts';
export const openShortcuts = () => window.dispatchEvent(new Event(EVENT));

const GROUPS: { title: string; rows: [string[], string][] }[] = [
  { title: 'Anywhere', rows: [[['⌘', 'K'], 'Command palette'], [['/'], 'Search'], [['?'], 'This sheet']] },
  { title: 'In a story list', rows: [[['J'], 'Next story'], [['K'], 'Previous story'], [['Enter'], 'Open story'], [['S'], 'Save for later'], [['M'], 'Mark as read']] },
  { title: 'In the reader', rows: [[['→'], 'Next story'], [['←'], 'Previous story'], [['S'], 'Save'], [['Esc'], 'Close']] },
];

export default function ShortcutsSheet() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const onOpen = () => setOpen(true);
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName) || el.isContentEditable) return;
      if (e.key === '?') { e.preventDefault(); setOpen(true); }
      else if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener(EVENT, onOpen);
    window.addEventListener('keydown', onKey);
    return () => { window.removeEventListener(EVENT, onOpen); window.removeEventListener('keydown', onKey); };
  }, []);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div key="b" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[110] bg-black/40 backdrop-blur-[3px]" onClick={() => setOpen(false)} />
          <motion.div key="s" role="dialog" aria-modal="true" aria-label="Keyboard shortcuts"
            initial={{ opacity: 0, scale: 0.96, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ type: 'spring', stiffness: 400, damping: 32 }}
            className="glass-thick fixed left-1/2 top-1/2 z-[111] w-[min(28rem,calc(100vw-1.5rem))] -translate-x-1/2 -translate-y-1/2 rounded-[var(--r-xl)] p-6 shadow-float">
            <div className="mb-4 flex items-center">
              <h2 className="font-display text-xl font-extrabold">Keyboard shortcuts</h2>
              <button onClick={() => setOpen(false)} className="icon-btn ml-auto" aria-label="Close"><X className="h-[18px] w-[18px]" /></button>
            </div>
            <div className="space-y-5">
              {GROUPS.map((g) => (
                <div key={g.title}>
                  <p className="eyebrow mb-2">{g.title}</p>
                  <ul className="space-y-1.5">
                    {g.rows.map(([keys, label]) => (
                      <li key={label} className="flex items-center justify-between text-sm">
                        <span>{label}</span>
                        <span className="flex gap-1">{keys.map((k) => <kbd key={k} className="kbd">{k}</kbd>)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
