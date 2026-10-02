// Newsdesk Backend — Express API Server
import express from 'express';
import cors from 'cors';
import { fetchAllFeeds, getFeedConfigs, FEEDS, fetchFeed } from './feedProxy.js';
import { COMPANY_MAP, getCompanyName, getAllCompanies } from './companyMap.js';
import { getInstruments, getInstrument, getSectors } from './instruments.js';
import { getArticlesByCompany } from './db.js';
import { isGoogleNewsUrl, resolveGoogleNewsUrl } from './gnewsResolver.js';
import { safeGet } from './safeFetch.js';
import { summarizeArticle, summarizeBlurb } from './summarize.js';

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

// ─── Preloaded Instruments & Companies Directory ──
app.get('/api/companies', (req, res) => {
  res.json(getAllCompanies());
});

app.get('/api/stocks', (req, res) => {
  const instruments = getInstruments();
  res.json({
    count: instruments.length,
    stocks: instruments,
    sectors: getSectors(),
  });
});

app.get('/api/company/:symbol', (req, res) => {
  try {
    const symbol = req.params.symbol.toUpperCase();
    const instrument = getInstrument(symbol);
    const news = getArticlesByCompany(symbol, 30);
    res.json({
      symbol,
      name: instrument?.name || getCompanyName(symbol),
      instrument,
      news: { count: news.length, items: news.slice(0, 80) },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Article loading (shared by reader proxy and summariser) ──
async function loadArticle(rawUrl) {
  const parsed = new URL(rawUrl); // throws on garbage
  if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('bad scheme');

  // Google News links are JS redirects — resolve to the real publisher URL first
  let target = parsed;
  if (isGoogleNewsUrl(parsed.href)) {
    try { target = new URL(await resolveGoogleNewsUrl(parsed.href)); }
    catch (e) { console.warn(`[Article] GN resolve failed: ${e.message}`); }
  }

  const { res, url } = await safeGet(target);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const html = await res.text();
  return { html, finalUrl: url.href };
}

// ─── Article Proxy (bypass X-Frame-Options) ──
app.get('/api/article-proxy', async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).json({ error: 'Missing url param' });
  try { new URL(url); } catch { return res.status(400).json({ error: 'Invalid url param' }); }

  try {
    let { html, finalUrl } = await loadArticle(url);
    // CSP <meta> tags survive proxying (unlike headers) and block assets in the iframe
    html = html.replace(/<meta[^>]+http-equiv=["']?content-security-policy["']?[^>]*>/gi, '');
    // <base> so relative URLs resolve against the publisher
    html = html.replace(/<head([^>]*)>/i, `<head$1><base href="${finalUrl}" target="_self">`);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  } catch (err) {
    res.status(502).json({ error: `Failed to load article: ${err.message}` });
  }
});

// ─── Article Summary (extractive, no AI) ─────
const summaryCache = new Map(); // url -> { ts, data }
const SUMMARY_TTL = 6 * 3600_000;
const SUMMARY_MAX = 600;

app.get('/api/summary', async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).json({ error: 'Missing url param' });
  try { new URL(url); } catch { return res.status(400).json({ error: 'Invalid url param' }); }

  const hit = summaryCache.get(url);
  if (hit && Date.now() - hit.ts < SUMMARY_TTL) return res.json(hit.data);

  const title = String(req.query.title || '');
  const desc = String(req.query.desc || '');

  try {
    let { html, finalUrl } = await loadArticle(url);

    // BizToc pages are stubs that point at the real article — follow that link once
    if (/(^|\.)biztoc\.com$/.test(new URL(finalUrl).hostname)) {
      const m = html.match(/This story appeared on\s*<a[^>]+href=["']([^"']+)["']/i)
        || html.match(/<h1[\s\S]*?<\/h1>\s*(?:<[^>]+>\s*)*<a[^>]+href=["'](https?:\/\/[^"']+)["']/i);
      if (m) {
        try { ({ html, finalUrl } = await loadArticle(m[1])); }
        catch (e) { console.warn(`[Summary] BizToc follow failed: ${e.message}`); }
      }
    }

    const data = {
      ...summarizeArticle(html, { fallbackTitle: title, fallbackDescription: desc }),
      host: new URL(finalUrl).hostname.replace(/^www\./, ''),
      url: finalUrl,
    };
    remember(url, data);
    res.json(data);
  } catch (err) {
    // Publisher blocked us (403 etc.) — degrade to a summary of the feed's own blurb
    console.warn(`[Summary] ${err.message} — ${url.slice(0, 80)}`);
    const data = { ...summarizeBlurb(title, [desc]), host: new URL(url).hostname.replace(/^www\./, ''), url, reason: err.message };
    remember(url, data);
    res.json(data);
  }
});

function remember(url, data) {
  if (summaryCache.size >= SUMMARY_MAX) summaryCache.delete(summaryCache.keys().next().value);
  summaryCache.set(url, { ts: Date.now(), data });
}

// ─── Start ───────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n  🗞️  Newsdesk Backend running on http://localhost:${PORT}`);
  console.log(`  📡  ${FEEDS.length} RSS feeds configured (incl. geopolitics, Iran, Middle East, defense)`);
  console.log(`  📊  Preloaded instruments loaded\n`);

  // Warm up caches
  fetchAllFeeds().then(items => console.log(`  ✅  Initial feed load: ${items.length} articles`));
});
