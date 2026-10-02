// Preloaded NSE Instruments Directory (500+ Indian Equities)
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { registerStocks } from './companyMap.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const INSTRUMENTS_FILE = path.join(__dirname, 'instruments.json');

let instruments = [];
const instrumentMap = new Map();

try {
  const raw = fs.readFileSync(INSTRUMENTS_FILE, 'utf-8');
  instruments = JSON.parse(raw);
  const stockObj = {};
  for (const item of instruments) {
    const sym = item.symbol.toUpperCase();
    instrumentMap.set(sym, item);
    stockObj[sym] = item;
  }
  // Register all 500 instruments for news mention matching & directory
  registerStocks(stockObj);
  console.log(`  📊  Preloaded ${instruments.length} NSE instruments`);
} catch (err) {
  console.error('[Instruments] Failed to load instruments.json:', err.message);
}

export function getInstruments() {
  return instruments;
}

export function getInstrument(symbol) {
  if (!symbol) return null;
  return instrumentMap.get(symbol.toUpperCase()) || null;
}

export function getSectors() {
  const set = new Set();
  for (const inst of instruments) {
    if (inst.sector && inst.sector !== 'Diversified') set.add(inst.sector);
  }
  return Array.from(set).sort();
}
