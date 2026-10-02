// Extractive summarisation — no AI, no external service.
//   1. pull the article body out of the HTML (paragraph heuristics)
//   2. split into sentences
//   3. rank sentences with TextRank (sentence-similarity graph + PageRank),
//      boosted for lead position and overlap with the headline
//   4. return the top sentences in their original order, plus key figures
//      (money, percentages, quantities) found in the text.

const STOP = new Set(`a an the and or but if then than so as of to in on at by for with from into over under about after before
between during without within is are was were be been being am do does did done have has had having will would shall should can
could may might must it its this that these those there here he she they them his her their our your we you i not no nor too very
just also more most less least much many some any all each every other such own same only own up down out off again further once
said says say told according per via new news mr mrs ms dr`.split(/\s+/));

const BOILERPLATE = /(cookie|subscribe|sign in|log in|newsletter|advertis|all rights reserved|copyright|click here|read more|follow us|download the app|terms of (use|service)|privacy policy|javascript|enable js|share this|related (stories|articles)|also read|watch:|photo:|image:|file photo|getty|sponsored|we use cookies|whatsapp|telegram channel|©)/i;

const decode = (s) => s
  .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
  .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(parseInt(d, 10)))
  .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&quot;/g, '"').replace(/&apos;|&#039;/g, "'").replace(/&rsquo;|&lsquo;/g, '’')
  .replace(/&ldquo;|&rdquo;/g, '"').replace(/&mdash;/g, '—').replace(/&ndash;/g, '–').replace(/&hellip;/g, '…');

const stripTags = (s) => decode(s.replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim();

function meta(html, key) {
  const re = new RegExp(`<meta[^>]+(?:property|name)=["']${key}["'][^>]*content=["']([^"']*)["']|<meta[^>]+content=["']([^"']*)["'][^>]*(?:property|name)=["']${key}["']`, 'i');
  const m = html.match(re);
  return m ? decode(m[1] ?? m[2] ?? '').trim() : '';
}

/** Pull title, description and body paragraphs out of an article page. */
export function extractArticle(html) {
  const title = meta(html, 'og:title') || stripTags((html.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || '');
  const description = meta(html, 'og:description') || meta(html, 'description');
  const image = meta(html, 'og:image');

  let body = html
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<(script|style|noscript|svg|iframe|form|nav|header|footer|aside|button|select)\b[\s\S]*?<\/\1>/gi, ' ');

  // Prefer an <article> (or the largest one) when the page has it
  const articles = [...body.matchAll(/<article\b[\s\S]*?<\/article>/gi)].map((m) => m[0]);
  if (articles.length) body = articles.sort((a, b) => b.length - a.length)[0];

  const paragraphs = [];
  const seen = new Set();
  for (const m of body.matchAll(/<(p|h2|h3|li|blockquote)\b[^>]*>([\s\S]*?)<\/\1>/gi)) {
    const tag = m[1].toLowerCase();
    const text = stripTags(m[2]);
    if (tag === 'li' && text.length < 80) continue;
    if (tag.startsWith('h') ) { if (text.length > 6 && text.length < 120) paragraphs.push({ text, heading: true }); continue; }
    if (text.length < 50 || BOILERPLATE.test(text) || seen.has(text)) continue;
    // mostly-link paragraphs are menus/related lists
    const linkText = [...m[2].matchAll(/<a\b[^>]*>([\s\S]*?)<\/a>/gi)].reduce((n, a) => n + stripTags(a[1]).length, 0);
    if (linkText > text.length * 0.6) continue;
    seen.add(text);
    paragraphs.push({ text, heading: false });
  }
  // drop headings with no paragraph after them
  const clean = paragraphs.filter((p, i) => !p.heading || (paragraphs[i + 1] && !paragraphs[i + 1].heading));
  return { title, description, image, paragraphs: clean };
}

const ABBR = /\b(Mr|Mrs|Ms|Dr|Prof|Sr|Jr|St|Inc|Ltd|Co|Corp|vs|etc|No|Rs|Cr|Lt|Gen|Col|Sen|Rep|Gov|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec|U\.S|U\.K|U\.N|E\.U|a\.m|p\.m)\.$/;

export function splitSentences(text) {
  const raw = text.replace(/\s+/g, ' ').split(/(?<=[.!?])["”’)]*\s+(?=["“‘(]?[A-Z0-9₹$])/);
  const out = [];
  for (const piece of raw) {
    const last = out[out.length - 1];
    if (last && (ABBR.test(last) || /\b[A-Z]\.$/.test(last) || /\d\.$/.test(last) && piece.length < 4)) out[out.length - 1] = `${last} ${piece}`;
    else out.push(piece);
  }
  return out.map((s) => s.trim()).filter(Boolean);
}

const stem = (w) => w.replace(/(ing|ed|es|s|ly)$/, (m, _s, off) => (off > 3 ? '' : m));
function tokenize(s) {
  return s.toLowerCase().replace(/[^a-z0-9₹$%.\s]/g, ' ').split(/\s+/)
    .map((w) => w.replace(/^\.+|\.+$/g, '')).filter((w) => w.length > 2 && !STOP.has(w)).map(stem);
}

function textRank(sentences, tokens) {
  const n = sentences.length;
  const sets = tokens.map((t) => new Set(t));
  const sim = Array.from({ length: n }, () => new Float64Array(n));
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if (sets[i].size < 3 || sets[j].size < 3) continue;
      let inter = 0;
      for (const t of sets[i]) if (sets[j].has(t)) inter++;
      const s = inter / (Math.log(sets[i].size + 1) + Math.log(sets[j].size + 1));
      sim[i][j] = sim[j][i] = s;
    }
  }
  const out = new Float64Array(n).fill(1 / n);
  const rowSum = sim.map((r) => r.reduce((a, b) => a + b, 0));
  for (let iter = 0; iter < 30; iter++) {
    const next = new Float64Array(n);
    for (let i = 0; i < n; i++) {
      let acc = 0;
      for (let j = 0; j < n; j++) if (sim[j][i] && rowSum[j]) acc += (sim[j][i] / rowSum[j]) * out[j];
      next[i] = 0.15 / n + 0.85 * acc;
    }
    out.set(next);
  }
  return out;
}

/**
 * Rank sentences and return the best `count`, in original order.
 * `title` boosts sentences that talk about the headline's subject.
 */
export function summarizeText(text, { title = '', count = 3, minLen = 45, maxLen = 320 } = {}) {
  const all = splitSentences(text);
  const candidates = all
    .map((s, idx) => ({ s, idx }))
    .filter(({ s }) => s.length >= minLen && s.length <= maxLen && !BOILERPLATE.test(s) && !/^["“]?(Also|Read|Watch|See)\b/.test(s));
  if (candidates.length <= count) return candidates.map((c) => c.s);

  const sentences = candidates.map((c) => c.s);
  const tokens = sentences.map(tokenize);
  const rank = textRank(sentences, tokens);
  const titleSet = new Set(tokenize(title));

  const scored = candidates.map((c, i) => {
    let titleHits = 0;
    for (const t of tokens[i]) if (titleSet.has(t)) titleHits++;
    const titleBoost = titleSet.size ? 1 + (titleHits / titleSet.size) * 0.8 : 1;
    const lead = 1 + Math.max(0, 0.6 - (c.idx / Math.max(all.length, 1)) * 1.5); // news puts the point first
    const hasFigure = /(\d|₹|\$|%)/.test(c.s) ? 1.08 : 1;
    return { ...c, score: rank[i] * titleBoost * lead * hasFigure };
  });

  const picked = [];
  for (const cand of scored.sort((a, b) => b.score - a.score)) {
    // skip near-duplicates of what we already picked
    const ts = new Set(tokenize(cand.s));
    const dup = picked.some((p) => {
      const ps = new Set(tokenize(p.s));
      let inter = 0; for (const t of ts) if (ps.has(t)) inter++;
      return inter / (Math.min(ts.size, ps.size) || 1) > 0.7;
    });
    if (!dup) picked.push(cand);
    if (picked.length === count) break;
  }
  return picked.sort((a, b) => a.idx - b.idx).map((p) => p.s);
}

const FIGURE_RE = /(?:₹|Rs\.?\s?|INR\s?|US\$|\$|€|£)\s?\d[\d,]*(?:\.\d+)?(?:\s?(?:trillion|billion|million|thousand|crore|lakh|bn|mn|tn|cr|k)\b)?|\b\d[\d,]*(?:\.\d+)?(?:\s?%|\s?(?:per cent|percent|basis points|bps|crore|lakh|billion|million|trillion)\b)/gi;

/** Key numbers in the chosen sentences, shown as quick-fact chips. */
export function extractFigures(sentences, limit = 5) {
  const seen = new Set();
  const out = [];
  for (const s of sentences) {
    for (const m of s.matchAll(FIGURE_RE)) {
      let f = m[0].replace(/\s+/g, ' ').trim().replace(/[.,]$/, '');
      // Format Indian currency representations to ₹
      f = f.replace(/^(?:Rs\.?\s?|INR\s?)/i, '₹');
      const k = f.toLowerCase();
      if (!seen.has(k) && f.length >= 2) { seen.add(k); out.push(f); }
      if (out.length === limit) return out;
    }
  }
  return out;
}

const GENERIC_DESC = /(entire business world|one-stop finance|get the latest|breaking news,? (world|latest)|top stories|news hub|subscribe)/i;

/** Summary built only from the feed's own blurb(s) — used when the article page can't be read. */
export function summarizeBlurb(title, blurbs) {
  const text = blurbs.filter((b) => b && !GENERIC_DESC.test(b)).join(' ');
  const titleTokens = new Set(tokenize(title));
  // drop sentences that only restate the headline (some feeds put the title in the description)
  const summary = summarizeText(text, { title, count: 2, minLen: 25 }).filter((sentence) => {
    const t = tokenize(sentence);
    let hit = 0; for (const w of t) if (titleTokens.has(w)) hit++;
    return !(t.length && hit / t.length >= 0.75);
  });
  return {
    status: 'blocked', title, image: null, summary, figures: extractFigures(summary),
    paragraphs: [], words: 0, readingMinutes: 1,
  };
}

/** Full pipeline for one article page. */
export function summarizeArticle(html, { fallbackTitle = '', fallbackDescription = '' } = {}) {
  const a = extractArticle(html);
  const title = a.title || fallbackTitle;
  const body = a.paragraphs.filter((p) => !p.heading).map((p) => p.text).join(' ');
  const words = body.split(/\s+/).filter(Boolean).length;

  const thin = a.paragraphs.filter((p) => !p.heading).length < 3 || words < 120;
  const pageDesc = a.description && !GENERIC_DESC.test(a.description) ? a.description : '';
  const source = thin ? [fallbackDescription, pageDesc].filter(Boolean).join(' ') : body;
  const summary = summarizeText(source || fallbackDescription, { title, count: thin ? 2 : 3, minLen: thin ? 30 : 45 });

  return {
    status: thin ? 'thin' : 'ok',
    title,
    image: a.image || null,
    summary,
    figures: extractFigures(summary.length ? summary : splitSentences(body).slice(0, 8)),
    paragraphs: a.paragraphs.slice(0, 60),
    words,
    readingMinutes: Math.max(1, Math.round(words / 220)),
  };
}
