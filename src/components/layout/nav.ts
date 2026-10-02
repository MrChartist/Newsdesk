import { Newspaper, LineChart, Layers, Star, Bookmark, LayoutGrid, type LucideIcon } from 'lucide-react';

export interface NavItem {
  label: string;
  short?: string;
  path: string;
  icon: LucideIcon;
  /** iOS system colour used for the squircle icon */
  tint: string;
  badge?: 'watchlist' | 'saved';
  match?: (pathname: string, search: string) => boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Newsdesk', short: 'News', path: '/', icon: Newspaper, tint: '#0A84FF',
    match: (p, s) => p === '/' && !s.includes('saved=1') },
  { label: 'Saved', path: '/?saved=1', icon: Bookmark, tint: '#FF9F0A', badge: 'saved',
    match: (p, s) => p === '/' && s.includes('saved=1') },
  { label: 'Screener', short: 'Markets', path: '/markets', icon: LineChart, tint: '#30D158' },
  { label: 'Sectors', path: '/sectors', icon: Layers, tint: '#BF5AF2',
    match: (p) => p.startsWith('/sector') },
  { label: 'Watchlist', short: 'Watch', path: '/watchlist', icon: Star, tint: '#FFD60A', badge: 'watchlist' },
];

export const TAB_ITEMS: NavItem[] = [
  NAV_ITEMS[0], NAV_ITEMS[2], NAV_ITEMS[3], NAV_ITEMS[4],
  { label: 'Topics', path: '/categories', icon: LayoutGrid, tint: '#FF375F',
    match: (p) => p.startsWith('/categor') },
];

export function isActive(item: NavItem, pathname: string, search: string) {
  if (item.match) return item.match(pathname, search);
  return pathname === item.path || pathname.startsWith(item.path + '/');
}

/** Largest-title text for the toolbar, derived from the route. */
export function titleFor(pathname: string, search: string): string {
  if (pathname === '/') return search.includes('saved=1') ? 'Saved' : 'Newsdesk';
  if (pathname.startsWith('/markets')) return 'Screener';
  if (pathname.startsWith('/sectors')) return 'Sectors';
  if (pathname.startsWith('/sector/')) return 'Sector';
  if (pathname.startsWith('/watchlist')) return 'Watchlist';
  if (pathname.startsWith('/company/')) return pathname.split('/')[2] ?? 'Company';
  if (pathname.startsWith('/categor')) return 'Topics';
  return 'Newsdesk';
}
