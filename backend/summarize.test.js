import test from 'node:test';
import assert from 'node:assert/strict';
import { splitSentences, summarizeText, extractFigures, extractArticle, summarizeArticle, summarizeBlurb } from './summarize.js';

test('splitSentences keeps abbreviations and decimals together', () => {
  const s = splitSentences('Mr. Rao said the U.S. dollar rose 1.5 per cent on Friday. Dr. Mehta disagreed with the Rs. 500 crore estimate. Markets closed lower.');
  assert.equal(s.length, 3);
  assert.match(s[0], /^Mr\. Rao/);
  assert.match(s[1], /^Dr\. Mehta/);
});

const ARTICLE = `
Reliance Industries reported a net profit of Rs 18,540 crore for the quarter, up 12 per cent from a year earlier.
The company said retail revenue grew 9% while the oil-to-chemicals business remained under pressure from weak margins.
Analysts had expected profit of about Rs 17,900 crore, according to a poll.
The board also recommended a dividend of Rs 10 per share, payable after shareholder approval.
Shares of Reliance Industries ended 1.4% higher on the exchange after the results were announced.
In a separate development, the company said it will invest $2 billion in new energy projects over the next three years.
The weather in Mumbai was warm on Friday with light winds from the west.
Brokerages raised their target prices, citing steady growth in the digital and retail segments.
`.trim().replace(/\n/g, ' ');

test('summarizeText returns the requested number of sentences in original order', () => {
  const out = summarizeText(ARTICLE, { title: 'Reliance Industries Q2 profit rises 12%', count: 3 });
  assert.equal(out.length, 3);
  const positions = out.map((s) => ARTICLE.indexOf(s));
  assert.deepEqual(positions, [...positions].sort((a, b) => a - b));
  assert.ok(out.every((s) => !/weather in Mumbai/.test(s)), 'off-topic sentence is not picked');
});

test('summarizeText is deterministic and only uses original sentences', () => {
  const a = summarizeText(ARTICLE, { title: 'Reliance profit', count: 3 });
  const b = summarizeText(ARTICLE, { title: 'Reliance profit', count: 3 });
  assert.deepEqual(a, b);
  for (const s of a) assert.ok(ARTICLE.includes(s), 'every line is verbatim');
});

test('extractFigures finds money, percentages and quantities', () => {
  const f = extractFigures(['Profit rose 12 per cent to Rs 18,540 crore.', 'It will invest $2 billion; shares gained 1.4%.']);
  assert.ok(f.some((x) => /18,540 crore/.test(x)));
  assert.ok(f.some((x) => /12 per cent/.test(x)));
  assert.ok(f.some((x) => /\$2 billion/.test(x)));
  assert.ok(f.some((x) => /1\.4%/.test(x)));
});

const PAGE = `<html><head><title>Fallback</title><meta property="og:title" content="Profit rises"><meta property="og:description" content="Short blurb"></head>
<body><nav><p>Home | World | Markets menu item long enough to pass the length filter easily here</p></nav>
<article>
<p>${ARTICLE}</p>
<p>Subscribe to our newsletter to get the latest stories delivered straight to your inbox every morning.</p>
<p>The company's chief executive said the results reflected disciplined execution across consumer businesses and a steady pipeline of projects.</p>
<p>Investors will watch commentary on capital expenditure and the timing of new energy launches in the coming quarters of the year.</p>
<script>var x = 'not text';</script>
</article><footer><p>Copyright 2026 all rights reserved by the publisher of this particular website page.</p></footer></body></html>`;

test('extractArticle drops navigation, boilerplate and scripts', () => {
  const a = extractArticle(PAGE);
  assert.equal(a.title, 'Profit rises');
  const text = a.paragraphs.map((p) => p.text).join(' ');
  assert.ok(!/newsletter/i.test(text));
  assert.ok(!/Copyright/i.test(text));
  assert.ok(!/not text/.test(text));
  assert.ok(!/menu item/.test(text));
  assert.ok(a.paragraphs.length >= 3);
});

test('summarizeArticle marks a full article ok and a stub thin', () => {
  const ok = summarizeArticle(PAGE);
  assert.equal(ok.status, 'ok');
  assert.ok(ok.summary.length >= 2);
  const thin = summarizeArticle('<html><head><meta property="og:description" content="The Entire Business World on a Single Page with the Web\'s Most Comprehensive One-Stop Finance News Hub."></head><body><p>x</p></body></html>',
    { fallbackTitle: 'Bank completes merger', fallbackDescription: 'The lender completed its merger with a rival after regulatory approval on Friday.' });
  assert.equal(thin.status, 'thin');
  assert.ok(thin.summary.every((s) => !/Entire Business World/.test(s)), 'generic site tagline is ignored');
});

test('summarizeBlurb drops sentences that only restate the headline', () => {
  const r = summarizeBlurb('AI winners and losers are emerging in Indian IT', ['AI winners and losers are emerging in Indian IT Livemint']);
  assert.equal(r.status, 'blocked');
  assert.deepEqual(r.summary, []);
});
