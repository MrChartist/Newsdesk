// Fetch arbitrary publisher URLs without letting a request reach internal services (SSRF guard).
import dns from 'node:dns/promises';
import net from 'node:net';

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

function isPrivateIp(ip) {
  if (net.isIPv4(ip)) {
    const [a, b] = ip.split('.').map(Number);
    return a === 10 || a === 127 || a === 0 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) || (a === 100 && b >= 64 && b <= 127) || a >= 224;
  }
  const v = ip.toLowerCase();
  return v === '::1' || v === '::' || v.startsWith('fc') || v.startsWith('fd') || v.startsWith('fe80') ||
    (v.startsWith('::ffff:') && isPrivateIp(v.slice(7)));
}

export async function assertPublicUrl(url) {
  const u = url instanceof URL ? url : new URL(url);
  if (!['http:', 'https:'].includes(u.protocol)) throw new Error('bad scheme');
  const host = u.hostname.replace(/^\[|\]$/g, '');
  if (host === 'localhost' || host.endsWith('.local') || host.endsWith('.internal')) throw new Error('blocked host');
  const addrs = net.isIP(host) ? [{ address: host }] : await dns.lookup(host, { all: true });
  if (!addrs.length || addrs.some((a) => isPrivateIp(a.address))) throw new Error('blocked address');
  return u;
}

/** GET with manual redirects so every hop is checked. Returns { res, url }. */
export async function safeGet(url, { accept = 'text/html,application/xhtml+xml;q=0.9,*/*;q=0.8', timeout = 15_000, maxHops = 5 } = {}) {
  let current = await assertPublicUrl(url);
  for (let hop = 0; hop <= maxHops; hop++) {
    const res = await fetch(current, {
      headers: { 'User-Agent': UA, Accept: accept, 'Accept-Language': 'en-US,en;q=0.5' },
      signal: AbortSignal.timeout(timeout),
      redirect: 'manual',
    });
    if (res.status >= 300 && res.status < 400 && res.headers.get('location')) {
      current = await assertPublicUrl(new URL(res.headers.get('location'), current));
      continue;
    }
    return { res, url: current };
  }
  throw new Error('too many redirects');
}
