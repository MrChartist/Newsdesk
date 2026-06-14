// Google News RSS links are opaque redirect URLs (news.google.com/rss/articles/CBMi…)
// that resolve to the real publisher article only via client-side JS — so they
// render blank inside the sandboxed reader iframe. This resolves them to the real
// URL server-side using Google's internal batchexecute endpoint, with caching so
// each article is resolved at most once.

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

const cache = new Map(); // gnUrl -> realUrl

export function isGoogleNewsUrl(url) {
  try {
    const u = new URL(url);
    return u.hostname.endsWith('news.google.com') && u.pathname.includes('/articles/');
  } catch {
    return false;
  }
}

export async function resolveGoogleNewsUrl(url) {
  if (cache.has(url)) return cache.get(url);

  // 1. Load the article page to obtain the per-article signature + timestamp
  const pageRes = await fetch(url, {
    headers: { 'User-Agent': UA },
    signal: AbortSignal.timeout(15_000),
    redirect: 'follow',
  });
  if (!pageRes.ok) throw new Error(`GN page HTTP ${pageRes.status}`);
  const html = await pageRes.text();

  const sg = html.match(/data-n-a-sg="([^"]+)"/)?.[1];
  const ts = html.match(/data-n-a-ts="([^"]+)"/)?.[1];
  const id = html.match(/data-n-a-id="([^"]+)"/)?.[1]
    || new URL(pageRes.url || url).pathname.split('/articles/')[1];

  if (!sg || !ts || !id) throw new Error('GN signature not found');

  // 2. Ask the batchexecute endpoint to translate the article id into a URL
  const inner = JSON.stringify([
    'garturlreq',
    [['X', 'X', ['X', 'X'], null, null, 1, 1, 'US:en', null, 1, null, null, null, null, null, 0, 1], 'X', 'X', 1, [1, 1, 1], 1, 1, null, 0, 0, null, 0],
    id, Number(ts), sg,
  ]);
  const body = 'f.req=' + encodeURIComponent(JSON.stringify([[['Fbv4je', inner, null, 'generic']]]));

  const res = await fetch('https://news.google.com/_/DotsSplashUi/data/batchexecute?rpcids=Fbv4je&source-path=%2Frss%2Farticles&hl=en-US&gl=US', {
    method: 'POST',
    headers: {
      'User-Agent': UA,
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
      'Referer': 'https://news.google.com/',
    },
    body,
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) throw new Error(`GN batchexecute HTTP ${res.status}`);
  const text = await res.text();

  // Response is anti-hijack-prefixed; the payload contains ["garturlres","<realUrl>",…]
  const match = text.match(/\\"garturlres\\",\\"(https?:[^"\\]+)\\"/);
  if (!match) throw new Error('GN url not in response');
  const real = match[1];

  cache.set(url, real);
  return real;
}
