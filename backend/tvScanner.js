// TradingView Scanner API Integration
// Fetches live stock data for 500 NSE/BSE stocks

const TV_SCAN_URL = 'https://scanner.tradingview.com/india/scan';
const STOCK_CACHE_TTL = 60_000; // 60 seconds
const INDEX_CACHE_TTL = 30_000; // 30 seconds

let stockCache = { data: null, ts: 0 };
let indexCache = { data: null, ts: 0 };

const STOCK_COLUMNS = [
  'name', 'description', 'logoid',
  'close', 'change', 'change_abs', 'volume',
  'market_cap_basic', 'sector', 'industry',
  'Recommend.All', 'Recommend.MA', 'Recommend.Other',
  'Perf.W', 'Perf.1M', 'Perf.3M',
  'price_52_week_high', 'price_52_week_low',
  'RSI', 'ADX',
];

const INDEX_TICKERS = ['NSE:NIFTY', 'NSE:BANKNIFTY', 'BSE:SENSEX'];

async function fetchStocks() {
  const now = Date.now();
  if (stockCache.data && now - stockCache.ts < STOCK_CACHE_TTL) {
    return stockCache.data;
  }

  try {
    const payload = {
      filter: [
        { left: 'exchange', operation: 'in_range', right: ['NSE'] },
        { left: 'is_primary', operation: 'equal', right: true },
        { left: 'active_symbol', operation: 'equal', right: true },
      ],
      options: { lang: 'en' },
      symbols: { query: { types: ['stock'] }, tickers: [] },
      columns: STOCK_COLUMNS,
      sort: { sortBy: 'market_cap_basic', sortOrder: 'desc' },
      range: [0, 500],
    };

    const res = await fetch(TV_SCAN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error(`TV Scanner returned ${res.status}`);
    const json = await res.json();

    // Parse response into structured objects
    const stocks = {};
    for (const item of json.data || []) {
      const d = item.d;
      const fullSymbol = item.s; // e.g. "NSE:TCS"
      const symbol = fullSymbol.split(':')[1] || fullSymbol;

      stocks[symbol] = {
        symbol,
        fullSymbol,
        name: d[1] || symbol,  // description
        logoId: d[2],
        price: d[3],
        change: d[4],
        changeAbs: d[5],
        volume: d[6],
        marketCap: d[7],
        sector: d[8],
        industry: d[9],
        recommendAll: d[10],
        recommendMA: d[11],
        recommendOther: d[12],
        perfWeek: d[13],
        perfMonth: d[14],
        perf3Month: d[15],
        high52W: d[16],
        low52W: d[17],
        rsi: d[18],
        adx: d[19],
      };
    }

    stockCache = { data: stocks, ts: now };
    console.log(`[TV Scanner] Fetched ${Object.keys(stocks).length} stocks`);
    return stocks;
  } catch (err) {
    console.error('[TV Scanner] Error:', err.message);
    return stockCache.data || {};
  }
}

async function fetchIndices() {
  const now = Date.now();
  if (indexCache.data && now - indexCache.ts < INDEX_CACHE_TTL) {
    return indexCache.data;
  }

  try {
    const payload = {
      symbols: { tickers: INDEX_TICKERS },
      columns: ['name', 'description', 'close', 'change', 'change_abs', 'high', 'low'],
    };

    const res = await fetch(TV_SCAN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error(`TV Index scan returned ${res.status}`);
    const json = await res.json();

    const indices = {};
    for (const item of json.data || []) {
      const d = item.d;
      const name = d[0];
      indices[name] = {
        symbol: item.s,
        name: d[1],
        price: d[2],
        change: d[3],
        changeAbs: d[4],
        dayHigh: d[5],
        dayLow: d[6],
      };
    }

    indexCache = { data: indices, ts: now };
    return indices;
  } catch (err) {
    console.error('[TV Scanner] Index error:', err.message);
    return indexCache.data || {};
  }
}

function getTopMovers(stocks) {
  const arr = Object.values(stocks).filter(s => s.price && s.change != null);
  const sorted = arr.sort((a, b) => (b.change || 0) - (a.change || 0));
  return {
    gainers: sorted.slice(0, 10),
    losers: sorted.slice(-10).reverse(),
    mostActive: getMostActive(stocks),
  };
}

/** Top stocks by traded volume — proxy for where the action is today. */
function getMostActive(stocks) {
  return Object.values(stocks)
    .filter(s => s.volume != null && s.price != null)
    .sort((a, b) => (b.volume || 0) - (a.volume || 0))
    .slice(0, 10);
}

/** Roll a list of stocks into a single sector summary (breadth, cap, sentiment). */
function summarizeSector(name, list) {
  const valued = list.filter(s => s.change != null);
  const advancers = valued.filter(s => s.change > 0).length;
  const decliners = valued.filter(s => s.change < 0).length;
  const totalChange = valued.reduce((sum, s) => sum + s.change, 0);
  const marketCap = list.reduce((sum, s) => sum + (s.marketCap || 0), 0);
  const bullish = list.filter(s => s.recommendAll != null && s.recommendAll >= 0.1).length;
  const byChange = [...valued].sort((a, b) => b.change - a.change);

  return {
    sector: name,
    avgChange: valued.length ? totalChange / valued.length : 0,
    count: list.length,
    advancers,
    decliners,
    marketCap,
    bullishPct: list.length ? (bullish / list.length) * 100 : 0,
    topStock: byChange[0] ? { symbol: byChange[0].symbol, change: byChange[0].change } : null,
    bottomStock: byChange.length ? { symbol: byChange[byChange.length - 1].symbol, change: byChange[byChange.length - 1].change } : null,
    stocks: list.map(s => s.symbol),
  };
}

function getSectorPerformance(stocks) {
  const groups = {};
  for (const s of Object.values(stocks)) {
    if (!s.sector) continue;
    (groups[s.sector] ||= []).push(s);
  }
  return Object.entries(groups)
    .map(([name, list]) => summarizeSector(name, list))
    .sort((a, b) => b.avgChange - a.avgChange);
}

/** Full breakdown for a single sector: summary + leaders/laggards + constituents. */
function getSectorDetail(stocks, name) {
  const list = Object.values(stocks).filter(s => s.sector === name);
  if (!list.length) return null;

  const byChange = list.filter(s => s.change != null).sort((a, b) => b.change - a.change);
  const constituents = [...list].sort((a, b) => (b.marketCap || 0) - (a.marketCap || 0));

  return {
    ...summarizeSector(name, list),
    leaders: byChange.slice(0, 5),
    laggards: byChange.slice(-5).reverse(),
    constituents,
  };
}

function getRecommendationLabel(value) {
  if (value == null) return 'Neutral';
  if (value >= 0.5) return 'Strong Buy';
  if (value >= 0.1) return 'Buy';
  if (value > -0.1) return 'Neutral';
  if (value > -0.5) return 'Sell';
  return 'Strong Sell';
}

export { fetchStocks, fetchIndices, getTopMovers, getMostActive, getSectorPerformance, getSectorDetail, getRecommendationLabel };
