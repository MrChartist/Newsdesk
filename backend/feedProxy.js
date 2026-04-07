// RSS Feed Proxy — Fetches, parses, caches & archives news articles
import { XMLParser } from 'fast-xml-parser';
import { matchCompanies } from './companyMap.js';
import { archiveArticles, getRecentArticles, pruneArticles, getArticleCount } from './db.js';

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  textNodeName: '#text',
  cdataPropName: '__cdata',
  trimValues: true,
});

// Feed configurations with tiered refresh
const FEEDS = [
  // ═══════════════════════════════════════════
  // TIER 1 — 60s (Breaking / Hot)
  // ═══════════════════════════════════════════
  { id: 'livemint-markets', name: 'Livemint Markets', url: 'https://www.livemint.com/rss/markets', category: 'Markets', ttl: 60_000, color: '#EC4327' },
  { id: 'et-markets', name: 'ET Markets', url: 'https://economictimes.indiatimes.com/markets/rssfeeds/1977021501.cms', category: 'Markets', ttl: 60_000, color: '#1A73E8' },
  { id: 'biztoc', name: 'BizToc', url: 'https://biztoc.com/feed', category: 'Global', ttl: 60_000, color: '#FF6B35' },

  // ═══════════════════════════════════════════
  // TIER 2 — 120s (Active feeds)
  // ═══════════════════════════════════════════
  { id: 'livemint-companies', name: 'Livemint Companies', url: 'https://www.livemint.com/rss/companies', category: 'Corporate', ttl: 120_000, color: '#EC4327' },
  { id: 'et-stocks', name: 'ET Stocks', url: 'https://economictimes.indiatimes.com/markets/stocks/rssfeeds/2146842.cms', category: 'Stocks', ttl: 120_000, color: '#1A73E8' },
  { id: 'cnbc-business', name: 'CNBC Business', url: 'https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=10001147', category: 'Business', ttl: 120_000, color: '#005994' },

  // ═══════════════════════════════════════════
  // TIER 3 — 300s (Standard)
  // ═══════════════════════════════════════════
  { id: 'livemint-news', name: 'Livemint News', url: 'https://www.livemint.com/rss/news', category: 'Headlines', ttl: 300_000, color: '#EC4327' },
  { id: 'livemint-money', name: 'Livemint Money', url: 'https://www.livemint.com/rss/money', category: 'Money', ttl: 300_000, color: '#EC4327' },
  { id: 'cnbc-world', name: 'CNBC World', url: 'https://www.cnbc.com/id/100727362/device/rss/rss.html', category: 'World', ttl: 300_000, color: '#005994' },
  { id: 'cnbc-economy', name: 'CNBC Economy', url: 'https://www.cnbc.com/id/20910255/device/rss/rss.html', category: 'Economy', ttl: 300_000, color: '#005994' },
  { id: 'etcfo-top', name: 'ET CFO', url: 'https://cfo.economictimes.indiatimes.com/rss/topstories', category: 'CFO', ttl: 300_000, color: '#0F766E' },
  { id: 'etcfo-economy', name: 'ET CFO Economy', url: 'https://cfo.economictimes.indiatimes.com/rss/economy', category: 'Economy', ttl: 300_000, color: '#0F766E' },
  { id: 'etcfo-corporate', name: 'ET CFO Corporate', url: 'https://cfo.economictimes.indiatimes.com/rss/corporate-finance', category: 'Corporate', ttl: 300_000, color: '#0F766E' },

  // ═══════════════════════════════════════════
  // GEOPOLITICS / IRAN / MIDDLE EAST / DEFENSE
  // ═══════════════════════════════════════════
  // BBC — Official RSS feeds (reliable, fast)
  { id: 'bbc-world', name: 'BBC World', url: 'http://feeds.bbci.co.uk/news/world/rss.xml', category: 'World', ttl: 120_000, color: '#BB1919' },
  { id: 'bbc-middleeast', name: 'BBC Middle East', url: 'http://feeds.bbci.co.uk/news/world/middle_east/rss.xml', category: 'MiddleEast', ttl: 120_000, color: '#BB1919' },
  { id: 'bbc-asia', name: 'BBC Asia', url: 'http://feeds.bbci.co.uk/news/world/asia/rss.xml', category: 'World', ttl: 300_000, color: '#BB1919' },

  // Google News — Topic-specific keyword feeds
  { id: 'gn-iran-war', name: 'GN Iran Conflict', url: 'https://news.google.com/rss/search?q=Iran+war+conflict+missile+drone+strike&hl=en-US&gl=US&ceid=US:en', category: 'Geopolitics', ttl: 120_000, color: '#E53935' },
  { id: 'gn-middleeast', name: 'GN Middle East', url: 'https://news.google.com/rss/search?q=Middle+East+crisis+conflict+Israel+Lebanon+Syria&hl=en-US&gl=US&ceid=US:en', category: 'MiddleEast', ttl: 120_000, color: '#E53935' },
  { id: 'gn-defense', name: 'GN Defense', url: 'https://news.google.com/rss/search?q=defense+military+geopolitics+NATO+sanctions&hl=en-US&gl=US&ceid=US:en', category: 'Defense', ttl: 300_000, color: '#E53935' },
  { id: 'gn-geopolitics', name: 'GN Geopolitics', url: 'https://news.google.com/rss/search?q=geopolitics+diplomacy+sanctions+ceasefire+negotiations&hl=en-US&gl=US&ceid=US:en', category: 'Geopolitics', ttl: 300_000, color: '#E53935' },
  { id: 'gn-india-defense', name: 'GN India Defense', url: 'https://news.google.com/rss/search?q=India+defense+military+DRDO+HAL+border&hl=en-IN&gl=IN&ceid=IN:en', category: 'Defense', ttl: 300_000, color: '#E53935' },
  { id: 'gn-ai', name: 'GN Artificial Intelligence', url: 'https://news.google.com/rss/search?q=Artificial+Intelligence+OpenAI+ChatGPT+AI+Nvidia&hl=en-US&gl=US&ceid=US:en', category: 'AI', ttl: 300_000, color: '#10B981' },

  // Defense News — Official RSS
  { id: 'defensenews-global', name: 'Defense News', url: 'https://www.defensenews.com/arc/outboundfeeds/rss/?outputType=xml', category: 'Defense', ttl: 300_000, color: '#1B3F5E' },

  // NDTV World
  { id: 'ndtv-world', name: 'NDTV World', url: 'https://feeds.feedburner.com/ndtvnews-world-news', category: 'World', ttl: 300_000, color: '#E23838' },

  // Al Jazeera via Google News (official RSS deprecated)
  { id: 'gn-aljazeera', name: 'Al Jazeera', url: 'https://news.google.com/rss/search?q=site:aljazeera.com+Middle+East+OR+Iran+OR+Israel&hl=en-US&gl=US&ceid=US:en', category: 'MiddleEast', ttl: 300_000, color: '#FA9000' },

  // ═══════════════════════════════════════════
  // INSTITUTIONAL INTELLIGENCE (Global Finance)
  // ═══════════════════════════════════════════
  { id: 'gn-bloomberg', name: 'Bloomberg', url: 'https://news.google.com/rss/search?q=when:1d+source:"Bloomberg"&hl=en-US&gl=US&ceid=US:en', category: 'Markets', ttl: 300_000, color: '#F59E0B' },
  { id: 'gn-reuters', name: 'Reuters', url: 'https://news.google.com/rss/search?q=when:1d+source:"Reuters"&hl=en-US&gl=US&ceid=US:en', category: 'Global', ttl: 300_000, color: '#F97316' },
  { id: 'gn-wsj', name: 'Wall Street Journal', url: 'https://news.google.com/rss/search?q=when:1d+source:"The+Wall+Street+Journal"+OR+source:"WSJ"&hl=en-US&gl=US&ceid=US:en', category: 'Business', ttl: 300_000, color: '#06B6D4' },
  { id: 'gn-ft', name: 'Financial Times', url: 'https://news.google.com/rss/search?q=when:1d+source:"Financial+Times"&hl=en-US&gl=US&ceid=US:en', category: 'Economy', ttl: 300_000, color: '#F472B6' },
  { id: 'zerohedge', name: 'ZeroHedge', url: 'https://feeds.feedburner.com/zerohedge/feed', category: 'Markets', ttl: 300_000, color: '#D97706' },
  { id: 'seeking-alpha', name: 'Seeking Alpha', url: 'https://seekingalpha.com/market_currents.xml', category: 'Stocks', ttl: 300_000, color: '#EA580C' },
];

// Per-feed cache
const feedCache = {};

function extractText(val) {
  if (!val) return '';
  if (typeof val === 'string') return val;
  if (val.__cdata) return val.__cdata;
  if (val['#text']) return val['#text'];
  return String(val);
}

function extractImage(item) {
  // Livemint: media:content with url attribute
  const media = item['media:content'];
  if (media && media['@_url']) return media['@_url'];
  // ET: enclosure with url
  const enc = item.enclosure;
  if (enc && enc['@_url']) return enc['@_url'];
  return null;
}

function parseDate(dateStr) {
  try {
    const d = new Date(extractText(dateStr));
    // Guard: if invalid or in the future, use current time
    if (isNaN(d.getTime()) || d.getTime() > Date.now() + 60000) {
      return new Date();
    }
    return d;
  } catch {
    return new Date();
  }
}

// Geopolitical keyword matching for smart category routing
const GEO_KEYWORDS = {
  MiddleEast: /\b(iran|israel|lebanon|hezbollah|hamas|gaza|west\s?bank|syria|iraq|yemen|houthi|saudi|uae|dubai|bahrain|kuwait|qatar|tehran|jerusalem|tel\s?aviv|netanyahu|khamenei|irgc|idf|middle\s?east|arab)\b/i,
  Defense:    /\b(military|defense|defence|missile|drone\s?strike|warplane|airstrike|air\s?strike|nato|pentagon|army|navy|air\s?force|weapons|ammunition|troops|soldiers|combat|warfare|munitions|artillery|nuclear|ballistic|cruise\s?missile|radar|submarine|fighter\s?jet|bomber|infantry|drdo|hal|isro|rafale)\b/i,
  Geopolitics:/\b(geopoliti|sanctions|ceasefire|diplomacy|negotiations|embargo|treaty|alliance|summit|bilateral|multilateral|un\s?security|g7|g20|brics|coup|regime|invasion|occupation|territorial|sovereignty|humanitarian|refugee|asylum|border\s?conflict)\b/i,
  War:        /\b(war|conflict|bombing|shelling|casualties|killed|wounded|attack|explosion|blast|siege|offensive|counteroffensive|escalation|retaliation|strike)\b/i,
  AI:         /\b(artificial intelligence|openai|chatgpt|llm|generative ai|nvidia|anthropic|sam altman|machine learning|deep learning|ai startup|ai agent|gemini|claude)\b/i,
};

function extractCategory(title, link, feedCategory) {
  // BizToc: category in title as #hashtag
  const hashMatch = extractText(title).match(/#(\w+)\s*$/);
  if (hashMatch) return hashMatch[1].charAt(0).toUpperCase() + hashMatch[1].slice(1);

  const titleText = extractText(title);

  // ── Geopolitical keyword detection (highest priority for geo feeds) ──
  if (GEO_KEYWORDS.MiddleEast.test(titleText)) return 'MiddleEast';
  if (GEO_KEYWORDS.Defense.test(titleText)) return 'Defense';
  if (GEO_KEYWORDS.Geopolitics.test(titleText)) return 'Geopolitics';
  if (GEO_KEYWORDS.AI.test(titleText)) return 'AI';
  // War keyword only if the feed is already geo-tagged or world
  if (['World', 'Geopolitics', 'MiddleEast', 'Defense', 'Global'].includes(feedCategory) && GEO_KEYWORDS.War.test(titleText)) return 'Geopolitics';

  // ── Derive from URL segments ──
  const url = extractText(link);
  if (url.includes('/market/stock-market')) return 'Stocks';
  if (url.includes('/market/ipo')) return 'IPO';
  if (url.includes('/market/commodit')) return 'Commodities';
  if (url.includes('/market/cryptocurrency')) return 'Crypto';
  if (url.includes('/market/forex')) return 'Forex';
  if (url.includes('/companies')) return 'Corporate';
  if (url.includes('/money')) return 'Money';
  if (url.includes('/economy')) return 'Economy';
  if (url.includes('/middle-east') || url.includes('/middleeast')) return 'MiddleEast';
  if (url.includes('/defense') || url.includes('/defence') || url.includes('/military')) return 'Defense';
  if (url.includes('/politics') || url.includes('/diplomacy')) return 'Geopolitics';

  return feedCategory || 'General';
}

function unescapeHtml(text) {
  if (!text) return '';
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#160;/g, ' ')
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–');
}

function cleanTitle(title) {
  let cleaned = extractText(title);
  // Remove BizToc hashtags from title
  cleaned = cleaned.replace(/#\w+\s*$/, '').trim();
  // Remove Google News ' - Source Name' suffix  
  cleaned = cleaned.replace(/\s*-\s*[A-Z][A-Za-z\s&'.]+$/, '').trim();
  return unescapeHtml(cleaned);
}

function parseItems(xml, feedConfig) {
  try {
    const parsed = parser.parse(xml);
    const channel = parsed?.rss?.channel;
    if (!channel) return [];

    let items = channel.item;
    if (!items) return [];
    if (!Array.isArray(items)) items = [items];

    return items.map((item, idx) => {
      const title = cleanTitle(item.title);
      const description = extractText(item.description);
      const link = extractText(item.link);
      const pubDate = parseDate(item.pubDate);
      const image = extractImage(item);
      const category = extractCategory(item.title, item.link, feedConfig.category);
      const companies = matchCompanies(title + ' ' + description);

      // Google News feeds include a <source> element with the original publisher
      const gnSource = item.source;
      const gnSourceName = gnSource ? (typeof gnSource === 'string' ? gnSource : extractText(gnSource)) : null;

      return {
        id: `${feedConfig.id}-${idx}-${pubDate.getTime()}`,
        title,
        description: unescapeHtml(description).replace(/<[^>]+>/g, '').slice(0, 300), // Strip any HTML and decode entities
        link,
        pubDate: pubDate.toISOString(),
        image,
        category,
        companies,
        source: {
          id: feedConfig.id,
          name: gnSourceName || feedConfig.name,
          color: feedConfig.color,
        },
      };
    });
  } catch (err) {
    console.error(`[Feed] Parse error for ${feedConfig.id}:`, err.message);
    return [];
  }
}

async function fetchFeed(feedConfig) {
  const now = Date.now();
  const cached = feedCache[feedConfig.id];

  if (cached && now - cached.ts < feedConfig.ttl) {
    return cached.items;
  }

  try {
    const res = await fetch(feedConfig.url, {
      headers: {
        'User-Agent': 'Newsdesk/1.0 (MrChartist)',
        'Accept': 'application/rss+xml, application/xml, text/xml',
      },
      signal: AbortSignal.timeout(10_000),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const xml = await res.text();
    const items = parseItems(xml, feedConfig);

    feedCache[feedConfig.id] = { items, ts: now };
    console.log(`[Feed] ${feedConfig.id}: ${items.length} items`);
    return items;
  } catch (err) {
    console.error(`[Feed] ${feedConfig.id} error:`, err.message);
    return cached?.items || [];
  }
}

async function fetchAllFeeds() {
  // 1. Fetch fresh items from all RSS feeds
  const results = await Promise.allSettled(FEEDS.map(f => fetchFeed(f)));
  const freshItems = [];
  for (const result of results) {
    if (result.status === 'fulfilled') {
      freshItems.push(...result.value);
    }
  }

  // 2. Insert into SQLite (deduplicates via UNIQUE link constraint)
  const inserted = archiveArticles(freshItems);
  if (inserted > 0) {
    console.log(`[DB] +${inserted} new articles | Total: ${getArticleCount()}`);
  }

  // 3. Prune articles older than 30 days
  const pruned = pruneArticles(30);
  if (pruned > 0) {
    console.log(`[DB] Pruned ${pruned} old articles`);
  }

  // 4. Return all articles from the last 30 days, sorted by newest
  return getRecentArticles(30);
}

function getFeedConfigs() {
  return FEEDS.map(f => ({ id: f.id, name: f.name, category: f.category, color: f.color }));
}

export { fetchAllFeeds, fetchFeed, getFeedConfigs, FEEDS };
