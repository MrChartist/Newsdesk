// Newsdesk Backend — Express API Server
import express from 'express';
import cors from 'cors';
import { fetchAllFeeds, getFeedConfigs, FEEDS, fetchFeed } from './feedProxy.js';
import { COMPANY_MAP, getCompanyName } from './companyMap.js';
import { getArticlesByCompany } from './db.js';
import { isGoogleNewsUrl, resolveGoogleNewsUrl } from './gnewsResolver.js';

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

// ─── Companies (news-only) ───────────────────
// Symbol → display name directory, used to label company mentions in the UI.
app.get('/api/companies', (req, res) => {
  res.json(Object.keys(COMPANY_MAP).map((symbol) => ({ symbol, name: getCompanyName(symbol) })));
});

app.get('/api/company/:symbol', (req, res) => {
  try {
    const symbol = req.params.symbol.toUpperCase();
    const news = getArticlesByCompany(symbol, 30);
    res.json({ symbol, name: getCompanyName(symbol), news: { count: news.length, items: news.slice(0, 80) } });
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
    // Google News links are JS redirects that render blank in the iframe —
    // resolve them to the real publisher URL before proxying.
    let target = parsedUrl;
    if (isGoogleNewsUrl(parsedUrl.href)) {
      try {
        target = new URL(await resolveGoogleNewsUrl(parsedUrl.href));
      } catch (e) {
        console.warn(`[Proxy] GN resolve failed: ${e.message}`);
      }
    }

    const response = await fetch(target, {
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

  // Warm up caches
  fetchAllFeeds().then(items => console.log(`  ✅  Initial feed load: ${items.length} articles`));
});
