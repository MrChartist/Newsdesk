import { ExternalLink, Scale, BookOpen, Layers, Heart, Github, ShieldAlert } from 'lucide-react';
import MrChartistLogo from './MrChartistLogo';

const ECOSYSTEM_LINKS = [
  { name: 'Mr. Chartist', url: 'https://mrchartist.com', desc: 'Main research portal' },
  { name: 'Weekly ChartBook', url: 'https://mrchartist.com/research/archive', desc: 'Chart-based setups & levels' },
  { name: 'IPO Decode', url: 'https://ipodecode.mrchartist.com', desc: 'Mainboard & SME IPO intel' },
  { name: 'FII / DII Data', url: 'https://fii-diidata.mrchartist.com', desc: 'Institutional cash & F&O flows' },
  { name: 'Scanner Pro', url: 'https://scanner.mrchartist.com', desc: '120+ algorithmic scans' },
  { name: 'The Academy', url: 'https://mrchartist.com/learn', desc: 'Free price-action curriculum' },
  { name: 'Price Action Books', url: 'https://mrchartist.com#book', desc: 'Candlestick & pattern books' },
];

const COMMUNITY_LINKS = [
  { name: 'GitHub', url: 'https://github.com/MrChartist' },
  { name: 'Telegram', url: 'https://t.me/MrChartist' },
  { name: 'YouTube', url: 'https://www.youtube.com/@MrChartist' },
  { name: 'X / Twitter', url: 'https://twitter.com/Mr_Chartist' },
  { name: 'WhatsApp', url: 'https://whatsapp.com/channel/0029VaDUeH159PwXDwq8yI1I' },
  { name: 'Instagram', url: 'https://www.instagram.com/mrchartist' },
  { name: 'LinkedIn', url: 'https://www.linkedin.com/in/mrchartist' },
  { name: 'TradingView', url: 'https://www.tradingview.com/u/MrChartist' },
];

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-[var(--mat-separator)] bg-[var(--mat-glass-subtle)] text-xs text-muted-foreground">
      <div className="mx-auto max-w-[1280px] px-4 py-10 sm:px-6 lg:px-8 space-y-8">
        {/* Top brand & ecosystem grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Column */}
          <div className="md:col-span-2 space-y-3.5">
            <a href="https://mrchartist.com" target="_blank" rel="noopener noreferrer" className="inline-block">
              <MrChartistLogo height={28} />
            </a>
            <p className="text-sm font-medium text-foreground/90 max-w-md leading-relaxed">
              Open-source real-time market intelligence, news aggregation, and story clustering for the Indian financial ecosystem by Mr. Chartist.
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <a
                href="https://github.com/MrChartist/Newsdesk"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full bg-[var(--mat-fill-2)] border border-[var(--mat-separator)] px-3 py-1 font-semibold text-foreground hover:bg-[var(--mat-fill-3)] transition-colors"
              >
                <Github className="h-3.5 w-3.5" />
                <span>Open Source on GitHub</span>
                <ExternalLink className="h-2.5 w-2.5 opacity-50" />
              </a>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 font-semibold text-emerald-600 dark:text-emerald-400">
                <Scale className="h-3.5 w-3.5" />
                <span>Non-Commercial License</span>
              </span>
            </div>
          </div>

          {/* Ecosystem Column */}
          <div className="space-y-2.5">
            <p className="eyebrow flex items-center gap-1.5 text-foreground font-bold">
              <Layers className="h-3.5 w-3.5 text-primary" /> Mr. Chartist Ecosystem
            </p>
            <ul className="space-y-1.5">
              {ECOSYSTEM_LINKS.slice(0, 4).map((l) => (
                <li key={l.name}>
                  <a
                    href={l.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-primary transition-colors inline-flex items-center gap-1 text-[12px]"
                  >
                    <span>{l.name}</span>
                    <ExternalLink className="h-2.5 w-2.5 opacity-40" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Education & Community */}
          <div className="space-y-2.5">
            <p className="eyebrow flex items-center gap-1.5 text-foreground font-bold">
              <BookOpen className="h-3.5 w-3.5 text-primary" /> Learning & Community
            </p>
            <ul className="space-y-1.5">
              {ECOSYSTEM_LINKS.slice(4).map((l) => (
                <li key={l.name}>
                  <a
                    href={l.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-primary transition-colors inline-flex items-center gap-1 text-[12px]"
                  >
                    <span>{l.name}</span>
                    <ExternalLink className="h-2.5 w-2.5 opacity-40" />
                  </a>
                </li>
              ))}
            </ul>
            <div className="pt-2 flex flex-wrap gap-2 text-[11px]">
              {COMMUNITY_LINKS.map((c) => (
                <a
                  key={c.name}
                  href={c.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-colors underline-offset-2 hover:underline"
                >
                  {c.name}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Disclaimer & License Note */}
        <div className="rounded-[var(--r-md)] border border-[var(--mat-separator)] bg-[var(--mat-fill-1)] p-4 space-y-2 leading-relaxed text-[11px]">
          <div className="flex items-center gap-1.5 font-bold text-foreground">
            <ShieldAlert className="h-3.5 w-3.5 text-primary" />
            <span>Open Source Educational & Research Notice</span>
          </div>
          <p>
            Newsdesk is an open-source project by Mr. Chartist, provided strictly for personal study, market research, and educational purposes.
            It does not offer personalized investment recommendations or advisory services. Investments in the securities market are subject to market risks; please read all scheme and company documents carefully.
          </p>
          <p>
            Licensed under the{' '}
            <a href="/LICENSE" className="text-primary underline font-medium">
              PolyForm Noncommercial License 1.0.0
            </a>.
            Free for personal and educational use. Commercial deployment, resale, fee-charging subscriptions, and commercial monetization are strictly prohibited.
          </p>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-[var(--mat-separator)] text-[11px]">
          <p>© {new Date().getFullYear()} Mr. Chartist. Open Source & Non-Commercial.</p>
          <p className="flex items-center gap-1">
            Built for Indian market participants with <Heart className="h-3 w-3 text-rose-500 fill-rose-500" />
          </p>
        </div>
      </div>
    </footer>
  );
}
