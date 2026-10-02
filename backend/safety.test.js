import test from 'node:test';
import assert from 'node:assert/strict';
import { assertPublicUrl } from './safeFetch.js';
import { matchCompanies } from './companyMap.js';

for (const bad of ['http://localhost:3001/api/health', 'http://127.0.0.1/', 'http://10.0.0.5/x', 'http://192.168.1.1/', 'http://169.254.169.254/latest/meta-data', 'http://[::1]/', 'file:///etc/passwd', 'http://printer.local/']) {
  test(`blocks ${bad}`, async () => { await assert.rejects(() => assertPublicUrl(bad)); });
}

test('allows a public IP literal', async () => { await assert.doesNotReject(() => assertPublicUrl('https://8.8.8.8/')); });

const CASES = [
  ['Reliance on state aid is rising, says report', []],
  ['Reliance Industries shares fall 2% after Q2 results', ['RELIANCE']],
  ['Titan, the largest moon of Saturn, has methane lakes', []],
  ['Titan shares jump on strong jewellery demand', ['TITAN']],
  ['It is the best time to buy', []],
  ['ITC Ltd dividend announced', ['ITC']],
  ['Apollo Global buys stake in UK firm', []],
  ['L&T bags order; Larsen & Toubro shares rise', ['LT']],
];
for (const [text, expected] of CASES) {
  test(`companies: ${text.slice(0, 48)}`, () => { assert.deepEqual(matchCompanies(text), expected); });
}
