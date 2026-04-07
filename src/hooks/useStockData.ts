import { useQuery } from '@tanstack/react-query';
import type { StockData, IndexData, TopMovers, SectorPerf } from '@/types/stock';

async function fetchAllStocks(): Promise<{ count: number; stocks: Record<string, StockData> }> {
  const res = await fetch('/api/market/all');
  if (!res.ok) throw new Error('Failed to fetch stocks');
  return res.json();
}

async function fetchIndices(): Promise<Record<string, IndexData>> {
  const res = await fetch('/api/market/indices');
  if (!res.ok) throw new Error('Failed to fetch indices');
  return res.json();
}

async function fetchMovers(): Promise<TopMovers> {
  const res = await fetch('/api/market/movers');
  if (!res.ok) throw new Error('Failed to fetch movers');
  return res.json();
}

async function fetchSectors(): Promise<SectorPerf[]> {
  const res = await fetch('/api/market/sectors');
  if (!res.ok) throw new Error('Failed to fetch sectors');
  return res.json();
}

export function useStocks(refetchInterval = 60000) {
  return useQuery({
    queryKey: ['stocks-all'],
    queryFn: fetchAllStocks,
    refetchInterval,
    staleTime: 30000,
  });
}

export function useIndices(refetchInterval = 30000) {
  return useQuery({
    queryKey: ['indices'],
    queryFn: fetchIndices,
    refetchInterval,
    staleTime: 15000,
  });
}

export function useTopMovers(refetchInterval = 60000) {
  return useQuery({
    queryKey: ['top-movers'],
    queryFn: fetchMovers,
    refetchInterval,
    staleTime: 30000,
  });
}

export function useSectors(refetchInterval = 120000) {
  return useQuery({
    queryKey: ['sectors'],
    queryFn: fetchSectors,
    refetchInterval,
    staleTime: 60000,
  });
}

export function useStockLookup() {
  const { data } = useStocks();
  return (symbol: string): StockData | null => {
    return data?.stocks?.[symbol] || null;
  };
}
