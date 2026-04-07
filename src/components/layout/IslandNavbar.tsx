import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, LineChart, LayoutGrid } from 'lucide-react';
import { cn } from '@/lib/utils';
import CompanySearch from '@/components/company/CompanySearch';
import { useNavigate } from 'react-router-dom';

export default function IslandNavbar() {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: Home },
    { name: 'Markets', path: '/category/Markets', icon: LineChart },
    { name: 'Categories', path: '/categories', icon: LayoutGrid },
  ];

  return (
    <div className="glass rounded-full px-2 py-1.5 flex items-center gap-1.5 shadow-sm">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path || 
                        (item.path !== '/' && location.pathname.startsWith(item.path));
        const Icon = item.icon;

        return (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "relative group px-4 py-2 rounded-full flex items-center gap-2 text-sm font-medium transition-all",
              isActive ? "text-primary dark:text-primary" : "text-muted-foreground hover:text-foreground hover:bg-white/5"
            )}
          >
            <Icon className="w-4 h-4" />
            <span className="hidden lg:inline">{item.name}</span>
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

      <div className="w-48 xl:w-56 relative">
        <CompanySearch 
          onSelect={(symbol) => navigate(`/company/${symbol}`)} 
        />
      </div>
    </div>
  );
}
