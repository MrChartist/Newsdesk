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

export function getRecommendationLabel(value: number | null | undefined): { label: string; color: string } {
  if (value == null) return { label: 'N/A', color: 'text-muted-foreground' };
  if (value >= 0.5) return { label: 'Strong Buy', color: 'text-profit' };
  if (value >= 0.1) return { label: 'Buy', color: 'text-profit' };
  if (value > -0.1) return { label: 'Neutral', color: 'text-warning' };
  if (value > -0.5) return { label: 'Sell', color: 'text-loss' };
  return { label: 'Strong Sell', color: 'text-loss' };
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
