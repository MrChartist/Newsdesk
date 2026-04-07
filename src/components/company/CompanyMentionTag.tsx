import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
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

  // Stop propagation so clicking the tag doesn't trigger the card's main link
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/company/${symbol}`);
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <button
        onClick={handleClick}
        className={cn(
          "inline-flex items-center px-1.5 py-0.5 rounded-[4px] text-xs font-semibold tracking-wide transition-colors",
          "bg-white/10 hover:bg-primary/20 hover:text-primary ring-1 ring-white/10"
        )}
      >
        ${symbol}
      </button>

      <AnimatePresence>
        {hovered && stock && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 min-w-[200px]"
            onClick={handleClick} // Clicking the popover also goes to the company page
          >
            <div className="glass rounded-xl p-1 shadow-xl cursor-pointer hover:bg-white/5 transition-colors">
              <StockMiniCard stock={stock} compact={false} className="border-none bg-transparent" />
            </div>
            {/* Arrow */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-[1px] border-4 border-transparent border-t-[var(--glass-bg)]" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
