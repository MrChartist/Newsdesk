import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStockLookup } from '@/hooks/useStockData';
import { useNavigate } from 'react-router-dom';
import StockMiniCard from './StockMiniCard';

interface Props {
  symbol: string;
}

export default function CompanyMentionTag({ symbol }: Props) {
  const getStock = useStockLookup();
  const stock = getStock(symbol);
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);

  // Stop propagation so tapping the tag doesn't also open the article
  const go = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/company/${symbol}`);
  };

  const up = (stock?.change ?? 0) >= 0;

  return (
    <span
      className="relative inline-block"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
    >
      <button
        onClick={go}
        className="inline-flex items-center gap-1 rounded-full bg-[var(--mat-fill-2)] px-2.5 py-1 text-[11px] font-bold leading-none transition-colors hover:bg-primary/15 hover:text-primary"
      >
        ${symbol}
        {stock?.change != null && (
          <span className={up ? 'text-profit' : 'text-loss'} aria-hidden>{up ? '▲' : '▼'}</span>
        )}
      </button>

      <AnimatePresence>
        {hovered && stock && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.96 }}
            transition={{ duration: 0.14 }}
            className="absolute bottom-full left-0 z-50 mb-2"
            onClick={go}
          >
            <div className="glass-thick cursor-pointer rounded-[var(--r-md)] shadow-float">
              <StockMiniCard stock={stock} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  );
}
