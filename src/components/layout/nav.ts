import { Newspaper, Bookmark, LayoutGrid, Radio, Search, type LucideIcon } from 'lucide-react';

export interface NavItem {
  label: string;
  path: string;
  icon: LucideIcon;
  /** iOS system colour for the squircle icon */
  tint: string;
  badge?: 'saved';
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Today', path: '/', icon: Newspaper, tint: '#0A84FF' },
  { label: 'Saved', path: '/saved', icon: Bookmark, tint: '#FF9F0A', badge: 'saved' },
  { label: 'Topics', path: '/topics', icon: LayoutGrid, tint: '#BF5AF2' },
  { label: 'Sources', path: '/sources', icon: Radio, tint: '#30D158' },
];

export const SEARCH_ITEM: NavItem = { label: 'Search', path: '/search', icon: Search, tint: '#8E8E93' };

export function isActive(item: NavItem, pathname: string) {
  if (item.path === '/') return pathname === '/';
  const base = item.path.replace(/s$/, ''); // /topics → /topic, /sources → /source
  return pathname === item.path || pathname.startsWith(item.path + '/') || pathname.startsWith(base + '/');
}

/** Toolbar title from the route (pages with a large title override via their own header). */
export function titleFor(pathname: string): string {
  if (pathname === '/') return 'Today';
  if (pathname.startsWith('/saved')) return 'Saved';
  if (pathname.startsWith('/topics') || pathname.startsWith('/topic/')) return 'Topics';
  if (pathname.startsWith('/sources') || pathname.startsWith('/source/')) return 'Sources';
  if (pathname.startsWith('/search')) return 'Search';
  if (pathname.startsWith('/company/')) return pathname.split('/')[2] ?? 'Company';
  return 'Newsdesk';
}

/** Routes that are roots of a tab (no back button). */
export const ROOT_PATHS = ['/', '/saved', '/topics', '/sources', '/search'];
