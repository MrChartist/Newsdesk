export interface StockData {
  symbol: string;
  name: string;
  sector: string;
  industry?: string;
  fullSymbol?: string;
  price?: number | null;
  change?: number | null;
  changeAbs?: number | null;
  volume?: number | null;
  marketCap?: number | null;
}
