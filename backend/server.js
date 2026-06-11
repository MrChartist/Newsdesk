// Newsdesk Backend — Express API Server
import express from 'express';
import cors from 'cors';
import { fetchAllFeeds, getFeedConfigs, FEEDS, fetchFeed } from './feedProxy.js';
import { fetchStocks, fetchIndices, getTopMovers, getSectorPerformance } from './tvScanner.js';
import { matchCompanies, getCompanyName } from './companyMap.js';
import { getArticlesByCompany } from './db.js';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// ─── Health ──────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', ts: new Date().toISOString() });
});

// ─── Feed Sources ────────────────────────────
app.get('/api/feeds/sources', (req, res) => {
  res.json(getFeedConfigs());
});

// ─── All News ────────────────────────────────
app.get('/api/feeds', async (req, res) => {
  try {
    const items = await fetchAllFeeds();
    res.json({ count: items.length, items });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── News by Source ──────────────────────────
app.get('/api/feeds/:sourceId', async (req, res) => {
  const feed = FEEDS.find(f => f.id === req.params.sourceId);
  if (!feed) return res.status(404).json({ error: 'Feed not found' });
  try {
    const items = await fetchFeed(feed);
    res.json({ source: feed.name, count: items.length, items });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Market Data (TradingView) ───────────────
app.get('/api/market/all', async (req, res) => {
  try {
    const stocks = await fetchStocks();
    res.json({ count: Object.keys(stocks).length, stocks });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/market/indices', async (req, res) => {
  try {
    const indices = await fetchIndices();
    res.json(indices);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/market/movers', async (req, res) => {
  try {
    const stocks = await fetchStocks();
    const movers = getTopMovers(stocks);
    res.json(movers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/market/sectors', async (req, res) => {
  try {
    const stocks = await fetchStocks();
    const sectors = getSectorPerformance(stocks);
    res.json(sectors);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/market/:symbol', async (req, res) => {
  try {
    const stocks = await fetchStocks();
    const symbol = req.params.symbol.toUpperCase();
    const stock = stocks[symbol];
    if (!stock) return res.status(404).json({ error: `${symbol} not found` });
    res.json(stock);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Company (combined: stock + news) ────────
app.get('/api/company/:symbol', async (req, res) => {
  try {
    const symbol = req.params.symbol.toUpperCase();
    const stocks = await fetchStocks();

    const stock = stocks[symbol] || null;
    const companyName = getCompanyName(symbol);

    // Query company news directly from SQLite
    const news = getArticlesByCompany(symbol, 30);

    res.json({
      symbol,
      name: companyName,
      stock,
      news: { count: news.length, items: news.slice(0, 50) },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Article Proxy (bypass X-Frame-Options) ──
app.get('/api/article-proxy', async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).json({ error: 'Missing url param' });

  // Only proxy http(s) URLs — reject file:, data:, internal schemes etc.
  let parsedUrl;
  try {
    parsedUrl = new URL(url);
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) throw new Error('bad scheme');
  } catch {
    return res.status(400).json({ error: 'Invalid url param' });
  }

  try {
    const response = await fetch(parsedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
      signal: AbortSignal.timeout(15_000),
      redirect: 'follow',
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    let html = await response.text();

    // Strip <meta http-equiv="Content-Security-Policy"> tags — they survive
    // proxying (unlike response headers) and block assets inside the iframe
    html = html.replace(/<meta[^>]+http-equiv=["']?content-security-policy["']?[^>]*>/gi, '');

    // Inject a <base> tag so relative URLs resolve correctly
    // (response.url reflects the final URL after redirects)
    const baseTag = `<base href="${response.url || url}" target="_self">`;
    html = html.replace(/<head([^>]*)>/i, `<head$1>${baseTag}`);

    // Serving from our own origin drops the publisher's X-Frame-Options /
    // CSP headers, so the article can render inside the reader iframe
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  } catch (err) {
    res.status(502).json({ error: `Failed to load article: ${err.message}` });
  }
});

// ─── Start ───────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n  🗞️  Newsdesk Backend running on http://localhost:${PORT}`);
  console.log(`  📡  ${FEEDS.length} RSS feeds configured (incl. geopolitics, Iran, Middle East, defense)`);
  console.log(`  📊  TradingView Scanner active\n`);

  // Warm up caches
  fetchAllFeeds().then(items => console.log(`  ✅  Initial feed load: ${items.length} articles`));
  fetchStocks().then(stocks => console.log(`  ✅  Initial stock scan: ${Object.keys(stocks).length} stocks`));
  fetchIndices().then(idx => console.log(`  ✅  Index data loaded: ${Object.keys(idx).length} indices`));
});
