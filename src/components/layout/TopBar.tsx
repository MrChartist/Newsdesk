import { useState, useEffect } from 'react';
import { Clock, Activity, Wifi } from 'lucide-react';
import { useNewsFeed } from '@/hooks/useNewsFeed';
import IslandNavbar from './IslandNavbar';

export default function TopBar() {
  const [time, setTime] = useState(new Date());
  const { isFetching, error } = useNewsFeed();

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="w-full h-16 border-b border-white/5 bg-background/80 backdrop-blur-md relative z-50 flex items-center justify-between px-6">
      
      {/* Brand */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-[0_0_15px_rgba(105,91,184,0.5)]">
          <Activity className="w-5 h-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="font-brand text-2xl leading-none tracking-wide text-foreground">Newsdesk</h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold ml-0.5 mt-0.5">by Mr. Chartist</p>
        </div>
      </div>

      {/* Center Nav */}
      <div className="absolute left-1/2 -translate-x-1/2 hidden md:block">
        <IslandNavbar />
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-6">
        
        {/* Status */}
        <div className="flex items-center gap-2">
          {error ? (
            <span className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
          ) : isFetching ? (
            <span className="w-2 h-2 rounded-full bg-warning animate-pulse" />
          ) : (
            <span className="w-2 h-2 rounded-full bg-profit shadow-[0_0_8px_rgba(20,184,166,0.6)]" />
          )}
          <span className="text-xs font-mono-data text-muted-foreground uppercase tracking-wider">
            {error ? 'Offline' : isFetching ? 'Syncing' : 'Live'}
          </span>
        </div>

        <div className="w-px h-4 bg-white/10" />

        {/* Clock */}
        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock className="w-4 h-4" />
          <span className="font-mono-data text-sm tracking-wide">
            {time.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            <span className="ml-2 text-[10px] text-dim">IST</span>
          </span>
        </div>

      </div>
    </header>
  );
}
