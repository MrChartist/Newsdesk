import { useQuery } from '@tanstack/react-query';
import type { StockData } from '@/types/stock';
import type { NewsItem } from '@/types/news';

export interface StocksResponse {
  count: number;
  stocks: StockData[];
  sectors: string[];
}

export interface CompanyResponse {
  symbol: string;
  name: string;
  instrument: StockData | null;
  news: { count: number; items: NewsItem[] };
}

export function useStocks(refetchInterval = 120_000) {
  return useQuery<StocksResponse>({
    queryKey: ['stocks-universe'],
    queryFn: async () => {
      const res = await fetch('/api/stocks');
      if (!res.ok) throw new Error('Failed to fetch preloaded instruments');
      return res.json();
    },
    staleTime: 60_000,
    refetchInterval,
  });
}

export function useCompanyQuote(symbol: string) {
  const sym = symbol?.toUpperCase();
  return useQuery<CompanyResponse>({
    queryKey: ['company-quote', sym],
    queryFn: async () => {
      const res = await fetch(`/api/company/${encodeURIComponent(sym)}`);
      if (!res.ok) throw new Error(`Failed to fetch company ${sym}`);
      return res.json();
    },
    enabled: !!sym,
    staleTime: 60_000,
  });
}

/** Formatter helper for Indian Rupees */
export function formatRupees(amount: number | null | undefined): string {
  if (amount == null || isNaN(amount)) return '—';
  return `₹${amount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    useGrouping: true,
  })}`;
}

/** Formats market capitalization in Crores or Lakh Crores with ₹ symbol */
export function formatMarketCapINR(val: number | null | undefined): string {
  if (val == null || isNaN(val)) return '—';
  const crore = val / 1_00_00_000;
  if (crore >= 1_00_000) {
    const lakhCr = crore / 1_00_00_000;
    return `₹${lakhCr.toFixed(2)} Lakh Cr`;
  }
  if (crore >= 1_000) {
    return `₹${crore.toLocaleString('en-IN', { maximumFractionDigits: 0 })} Cr`;
  }
  return `₹${crore.toFixed(1)} Cr`;
}
