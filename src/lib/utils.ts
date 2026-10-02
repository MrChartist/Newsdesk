import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(value: number | null | undefined): string {
  if (value == null) return '—';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatChange(value: number | null | undefined): string {
  if (value == null) return '—';
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
}

export function formatMarketCap(value: number | null | undefined): string {
  if (value == null) return '—';
  if (value >= 1e12) return `₹${(value / 1e12).toFixed(1)}T`;
  if (value >= 1e9) return `₹${(value / 1e9).toFixed(1)}B`;
  if (value >= 1e7) return `₹${(value / 1e7).toFixed(0)}Cr`;
  if (value >= 1e5) return `₹${(value / 1e5).toFixed(0)}L`;
  return `₹${value.toLocaleString('en-IN')}`;
}

export function formatVolume(value: number | null | undefined): string {
  if (value == null) return '—';
  if (value >= 1e7) return `${(value / 1e7).toFixed(1)}Cr`;
  if (value >= 1e5) return `${(value / 1e5).toFixed(1)}L`;
  if (value >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
  return value.toLocaleString('en-IN');
}

export function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

/** Where price sits inside its 52-week range, 0–100 (null if unknown). */
export function rangePosition(
  price: number | null | undefined,
  low: number | null | undefined,
  high: number | null | undefined,
): number | null {
  if (price == null || low == null || high == null || high <= low) return null;
  return Math.max(0, Math.min(100, ((price - low) / (high - low)) * 100));
}

/** % distance of price below its 52-week high (0 = at the high). */
export function offHigh(price: number | null | undefined, high: number | null | undefined): number | null {
  if (price == null || high == null || high <= 0) return null;
  return ((price - high) / high) * 100;
}

export function formatDateIN(d: Date = new Date()): string {
  return d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });
}

export function greeting(d: Date = new Date()): string {
  const h = Number(d.toLocaleString('en-IN', { hour: 'numeric', hour12: false, timeZone: 'Asia/Kolkata' }));
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
}
