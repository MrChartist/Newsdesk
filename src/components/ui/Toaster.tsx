import { AnimatePresence, motion } from 'framer-motion';
import { useToasts, dismissToast } from '@/lib/toast';

/** Glass confirmation capsules, like iOS: bottom-centre, above the tab bar on phones. */
export default function Toaster() {
  const toasts = useToasts();
  return (
    <div
      aria-live="polite" aria-atomic="false"
      className="pointer-events-none fixed inset-x-0 z-[120] flex flex-col items-center gap-2 px-4 bottom-6 max-lg:bottom-[calc(var(--safe-b)+var(--tabbar-h)+28px)] lg:pl-[calc(var(--sidebar-w)+1.5rem)]"
    >
      <AnimatePresence initial={false}>
        {toasts.map((t) => (
          <motion.div
            key={t.id} layout
            initial={{ opacity: 0, y: 16, scale: 0.94 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 460, damping: 34 }}
            className="pointer-events-auto flex items-center gap-4 rounded-full bg-popover py-2.5 pl-5 pr-2.5 text-sm font-semibold text-popover-foreground shadow-float ring-1 ring-[var(--mat-hairline)]"
            role="status"
          >
            <span>{t.message}</span>
            {t.action ? (
              <button
                onClick={() => { t.action!.run(); dismissToast(t.id); }}
                className="rounded-full bg-primary/15 px-3.5 py-1.5 text-[0.8125rem] font-bold text-primary transition-colors hover:bg-primary/25"
              >
                {t.action.label}
              </button>
            ) : <span className="w-2" />}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
