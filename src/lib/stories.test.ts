import test from 'node:test';
import assert from 'node:assert/strict';
import { buildStories, coverage, timeBucket } from './stories.ts';
import { blurbOf } from './blurb.ts';
import { formatPost, formatDigest } from './share.ts';
import type { NewsItem } from '../types/news.ts';

const NOW = Date.UTC(2026, 9, 2, 6, 0, 0);
let n = 0;
const item = (title: string, source: string, minutesAgo: number, extra: Partial<NewsItem> = {}): NewsItem => ({
  id: `i${n++}`, title, description: '', link: `https://example.com/${n}`,
  pubDate: new Date(NOW - minutesAgo * 60_000).toISOString(), image: null, category: 'Markets', companies: [],
  source: { id: source.toLowerCase(), name: source, color: '#000' }, ...extra,
});

test('same event from different publishers becomes one story', () => {
  const stories = buildStories([
    item('Amazon seeks to offload $8 billion of Nvidia chips to investors, FT reports', 'Reuters', 10),
    item('Amazon seeks to offload $8bn of Nvidia chips to investors', 'BizToc', 20),
    item('Fed holds rates steady, signals two cuts before year end', 'CNBC', 15),
  ]);
  assert.equal(stories.length, 2);
  const amazon = stories.find((s) => /Amazon/.test(s.lead.title))!;
  assert.equal(coverage(amazon), 2);
  assert.equal(amazon.others[0].name === 'Reuters' || amazon.others[0].name === 'BizToc', true);
});

test('the same publisher repeating a headline does not inflate coverage', () => {
  const [s] = buildStories([
    item('Sensex jumps 400 points as banks rally on strong earnings', 'Mint', 5),
    item('Sensex jumps 400 points as banks rally on strong earnings', 'Mint', 30),
  ]);
  assert.equal(coverage(s), 1);
});

test('unrelated headlines are never merged', () => {
  const stories = buildStories([
    item('Brent crude falls as OPEC signals higher output next quarter', 'A', 10),
    item('Brent crude rises as Middle East tensions disrupt shipping lanes', 'B', 12),
  ]);
  assert.equal(stories.length, 2);
});

test('stories further apart than the window stay separate', () => {
  const stories = buildStories([
    item('Government announces new export duty on steel products', 'A', 5),
    item('Government announces new export duty on steel products', 'B', 60 * 50),
  ]);
  assert.equal(stories.length, 2);
});

test('timeBucket groups by recency', () => {
  assert.equal(timeBucket(NOW - 10 * 60_000, NOW), 'Last hour');
  assert.equal(timeBucket(NOW - 3 * 3600_000, NOW), 'Earlier today');
  assert.equal(timeBucket(NOW - 30 * 3600_000, NOW), 'Yesterday');
  assert.equal(timeBucket(NOW - 4 * 86400_000, NOW), 'This week');
  assert.equal(timeBucket(NOW - 20 * 86400_000, NOW), 'Older');
});

test('blurbOf never repeats the headline', () => {
  const t = 'In-flight attack on FlyDubai pilot puts aviation security measures under scrutiny';
  assert.equal(blurbOf(item(t, 'A', 1, { description: t })), '');
  assert.equal(blurbOf(item(t, 'A', 1, { description: `${t} Livemint` })), '');
  assert.equal(
    blurbOf(item(t, 'A', 1, { description: `${t} Israel has long focused its security on departing flights from Ben-Gurion airport.` })),
    'Israel has long focused its security on departing flights from Ben-Gurion airport.',
  );
  assert.equal(blurbOf(item('Short title here', 'A', 1, { description: 'A genuinely different description of the story with detail.' })), 'A genuinely different description of the story with detail.');
});

test('Telegram post and digest end with the brand and keep short paragraphs', () => {
  const it = item('Headline here', 'Reuters', 5);
  const post = formatPost(it, ['First key point.', 'Second key point.', 'Third.']);
  assert.ok(post.endsWith('@MrChartist'));
  assert.ok(post.includes('First key point.') && post.includes('Second key point.') && !post.includes('Third.'));
  const digest = formatDigest('Top stories', buildStories([it, item('Another distinct headline about monsoon rainfall deficits', 'Mint', 6)]));
  assert.ok(digest.startsWith('Top stories') && digest.includes('1. ') && digest.endsWith('@MrChartist'));
});
