import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, LineChart, Layers, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import CompanySearch from '@/components/company/CompanySearch';
import { useWatchlist } from '@/hooks/useWatchlist';

export default function IslandNavbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { count } = useWatchlist();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: Home },
    { name: 'Markets', path: '/markets', icon: LineChart },
    { name: 'Sectors', path: '/sectors', icon: Layers },
    { name: 'Watchlist', path: '/watchlist', icon: Star, badge: count },
  ];

  return (
    <div className="glass rounded-full px-2 py-1.5 flex items-center gap-1 shadow-sm">
      {navItems.map((item) => {
        const isActive = item.path === '/'
          ? location.pathname === '/'
          : location.pathname.startsWith(item.path);
        const Icon = item.icon;

        return (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "relative group px-3.5 py-2 rounded-full flex items-center gap-2 text-sm font-medium transition-all",
              isActive ? "text-primary" : "text-muted-foreground hover:text-foreground hover:bg-white/5"
            )}
          >
            <Icon className="w-4 h-4" />
            <span className="hidden xl:inline">{item.name}</span>
            {item.badge ? (
              <span className="px-1.5 py-0.5 rounded-full bg-amber-400/20 text-amber-400 text-[10px] font-mono-data leading-none">
                {item.badge}
              </span>
            ) : null}
            {isActive && (
              <motion.div
                layoutId="navbar-indicator"
                className="absolute inset-0 rounded-full bg-primary/10 -z-10"
                initial={false}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
          </Link>
        );
      })}

      <div className="w-[1px] h-6 bg-border/50 mx-1" />

      <div className="w-44 xl:w-52 relative">
        <CompanySearch onSelect={(symbol) => navigate(`/company/${symbol}`)} />
      </div>
    </div>
  );
}
