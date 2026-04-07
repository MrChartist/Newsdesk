export interface StockData {
  symbol: string;
  fullSymbol: string;
  name: string;
  logoId: string | null;
  price: number | null;
  change: number | null;
  changeAbs: number | null;
  volume: number | null;
  marketCap: number | null;
  sector: string | null;
  industry: string | null;
  recommendAll: number | null;
  recommendMA: number | null;
  recommendOther: number | null;
  perfWeek: number | null;
  perfMonth: number | null;
  perf3Month: number | null;
  high52W: number | null;
  low52W: number | null;
  rsi: number | null;
  adx: number | null;
}

export interface IndexData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changeAbs: number;
  dayHigh: number;
  dayLow: number;
}

export interface TopMovers {
  gainers: StockData[];
  losers: StockData[];
}

export interface SectorPerf {
  sector: string;
  avgChange: number;
  count: number;
  totalChange: number;
  stocks: string[];
}
