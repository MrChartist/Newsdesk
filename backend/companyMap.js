// Company name ↔ symbol mapping for 200+ NSE/BSE stocks
// Used by feedProxy to enrich news with stock mentions

const COMPANY_MAP = {
  // Nifty 50 Heavyweights
  'RELIANCE': ['Reliance', 'Reliance Industries', 'RIL', 'Mukesh Ambani'],
  'TCS': ['TCS', 'Tata Consultancy', 'Tata Consultancy Services'],
  'HDFCBANK': ['HDFC Bank', 'HDFCBANK'],
  'INFY': ['Infosys', 'INFY', 'Infosys Ltd', 'Infosys Limited'],
  'ICICIBANK': ['ICICI Bank', 'ICICIBANK', 'ICICI'],
  'HINDUNILVR': ['Hindustan Unilever', 'HUL', 'HINDUNILVR'],
  'ITC': ['ITC', 'ITC Ltd', 'ITC Limited'],
  'SBIN': ['SBI', 'State Bank', 'State Bank of India', 'SBIN'],
  'BHARTIARTL': ['Bharti Airtel', 'Airtel', 'BHARTIARTL'],
  'KOTAKBANK': ['Kotak Mahindra', 'Kotak Bank', 'KOTAKBANK'],
  'LT': ['Larsen & Toubro', 'L&T', 'Larsen'],
  'HCLTECH': ['HCL Tech', 'HCL Technologies', 'HCLTECH'],
  'AXISBANK': ['Axis Bank', 'AXISBANK'],
  'ASIANPAINT': ['Asian Paints', 'ASIANPAINT'],
  'MARUTI': ['Maruti Suzuki', 'Maruti', 'MARUTI'],
  'SUNPHARMA': ['Sun Pharma', 'Sun Pharmaceutical', 'SUNPHARMA'],
  'TITAN': ['Titan', 'Titan Company', 'TITAN'],
  'BAJFINANCE': ['Bajaj Finance', 'BAJFINANCE'],
  'BAJFINSV': ['Bajaj Finserv', 'BAJFINSV'],
  'WIPRO': ['Wipro', 'WIPRO'],
  'DMART': ['D-Mart', 'Avenue Supermarts', 'DMART', 'DMart'],
  'NESTLEIND': ['Nestle India', 'Nestle', 'NESTLEIND'],
  'ULTRACEMCO': ['UltraTech Cement', 'UltraTech', 'ULTRACEMCO'],
  'TATAMOTORS': ['Tata Motors', 'TATAMOTORS'],
  'TATASTEEL': ['Tata Steel', 'TATASTEEL'],
  'NTPC': ['NTPC', 'NTPC Ltd'],
  'POWERGRID': ['Power Grid', 'POWERGRID', 'Power Grid Corporation'],
  'ONGC': ['ONGC', 'Oil and Natural Gas'],
  'M&M': ['Mahindra & Mahindra', 'M&M', 'Mahindra'],
  'JSWSTEEL': ['JSW Steel', 'JSWSTEEL'],
  'ADANIENT': ['Adani Enterprises', 'ADANIENT', 'Adani'],
  'ADANIPORTS': ['Adani Ports', 'ADANIPORTS', 'Adani Ports and SEZ'],
  'ADANIPOWER': ['Adani Power', 'ADANIPOWER'],
  'ADANIGREEN': ['Adani Green', 'ADANIGREEN', 'Adani Green Energy'],
  'COALINDIA': ['Coal India', 'COALINDIA'],
  'BPCL': ['BPCL', 'Bharat Petroleum'],
  'IOC': ['Indian Oil', 'IOC', 'Indian Oil Corporation'],
  'GRASIM': ['Grasim', 'Grasim Industries', 'GRASIM'],
  'TECHM': ['Tech Mahindra', 'TECHM'],
  'INDUSINDBK': ['IndusInd Bank', 'INDUSINDBK'],
  'CIPLA': ['Cipla', 'CIPLA'],
  'DRREDDY': ['Dr Reddy', "Dr. Reddy's", 'DRREDDY', 'Dr Reddys'],
  'EICHERMOT': ['Eicher Motors', 'Royal Enfield', 'EICHERMOT'],
  'DIVISLAB': ["Divi's Lab", 'Divis Laboratories', 'DIVISLAB'],
  'APOLLOHOSP': ['Apollo Hospitals', 'Apollo', 'APOLLOHOSP'],
  'HEROMOTOCO': ['Hero MotoCorp', 'Hero', 'HEROMOTOCO'],
  'BAJAJ-AUTO': ['Bajaj Auto', 'BAJAJ-AUTO'],
  'BRITANNIA': ['Britannia', 'Britannia Industries', 'BRITANNIA'],
  'TATACONSUM': ['Tata Consumer', 'TATACONSUM', 'Tata Consumer Products'],
  'SBILIFE': ['SBI Life', 'SBILIFE', 'SBI Life Insurance'],
  'HDFCLIFE': ['HDFC Life', 'HDFCLIFE'],
  'VEDL': ['Vedanta', 'VEDL', 'Vedanta Ltd'],
  'HINDALCO': ['Hindalco', 'HINDALCO', 'Hindalco Industries'],
  'TRENT': ['Trent', 'TRENT', 'Trent Limited', 'Zudio'],
  'ETERNAL': ['Eternal', 'ETERNAL', 'Zomato'],
  'ZOMATO': ['Zomato', 'ZOMATO'],
  'PAYTM': ['Paytm', 'PAYTM', 'One97'],
  'NYKAA': ['Nykaa', 'NYKAA', 'FSN E-Commerce'],
  'POLICYBZR': ['PolicyBazaar', 'PB Fintech', 'POLICYBZR'],
  // Financials
  'PNB': ['Punjab National Bank', 'PNB'],
  'BANKBARODA': ['Bank of Baroda', 'BANKBARODA'],
  'CANBK': ['Canara Bank', 'CANBK'],
  'UNIONBANK': ['Union Bank', 'UNIONBANK'],
  'IDBI': ['IDBI Bank', 'IDBI'],
  'FEDERALBNK': ['Federal Bank', 'FEDERALBNK'],
  'IDFCFIRSTB': ['IDFC First Bank', 'IDFCFIRSTB'],
  'BANDHANBNK': ['Bandhan Bank', 'BANDHANBNK'],
  'AUBANK': ['AU Small Finance Bank', 'AU Bank', 'AUBANK'],
  'CREDITACC': ['CreditAccess Grameen', 'CreditAccess', 'CREDITACC'],
  // IT / Tech
  'LTIM': ['LTIMindtree', 'LTIM', 'LTI Mindtree'],
  'PERSISTENT': ['Persistent Systems', 'Persistent', 'PERSISTENT'],
  'COFORGE': ['Coforge', 'COFORGE'],
  'MPHASIS': ['Mphasis', 'MPHASIS'],
  'LTTS': ['L&T Technology', 'LTTS'],
  // Pharma
  'BIOCON': ['Biocon', 'BIOCON'],
  'LUPIN': ['Lupin', 'LUPIN'],
  'AUROPHARMA': ['Aurobindo Pharma', 'Aurobindo', 'AUROPHARMA'],
  'TORNTPHARM': ['Torrent Pharma', 'TORNTPHARM'],
  'NATCOPHARM': ['Natco Pharma', 'NATCOPHARM'],
  // Auto
  'TVSMOTOR': ['TVS Motor', 'TVSMOTOR'],
  'ASHOKLEY': ['Ashok Leyland', 'ASHOKLEY'],
  'MOTHERSON': ['Motherson', 'MOTHERSON', 'Samvardhana Motherson'],
  // Energy / Power
  'TATAPOWER': ['Tata Power', 'TATAPOWER'],
  'ADANIGREEN': ['Adani Green Energy', 'ADANIGREEN'],
  'NHPC': ['NHPC', 'NHPC Ltd'],
  'IREDA': ['IREDA', 'Indian Renewable Energy'],
  'SJVN': ['SJVN', 'SJVN Ltd'],
  // Defence
  'HAL': ['HAL', 'Hindustan Aeronautics'],
  'BEL': ['BEL', 'Bharat Electronics'],
  'BDL': ['BDL', 'Bharat Dynamics'],
  'COCHINSHIP': ['Cochin Shipyard', 'COCHINSHIP'],
  'MAZAGON': ['Mazagon Dock', 'MAZAGON'],
  // Infrastructure / Capital Goods
  'IRCON': ['IRCON', 'Ircon International'],
  'RVNL': ['RVNL', 'Rail Vikas Nigam'],
  'IRFC': ['IRFC', 'Indian Railway Finance'],
  'TITAGARH': ['Titagarh Rail', 'TITAGARH'],
  'RAILTEL': ['RailTel', 'RAILTEL'],
  // Consumer / FMCG
  'DABUR': ['Dabur', 'DABUR'],
  'MARICO': ['Marico', 'MARICO'],
  'GODREJCP': ['Godrej Consumer', 'GODREJCP'],
  'COLPAL': ['Colgate-Palmolive', 'Colgate', 'COLPAL'],
  'TATAELXSI': ['Tata Elxsi', 'TATAELXSI'],
  // Real Estate
  'DLF': ['DLF', 'DLF Ltd'],
  'GODREJPROP': ['Godrej Properties', 'GODREJPROP'],
  'OBEROIRLTY': ['Oberoi Realty', 'OBEROIRLTY'],
  'PRESTIGE': ['Prestige Estates', 'PRESTIGE'],
  // Metals / Mining
  'NMDC': ['NMDC', 'NMDC Ltd'],
  'NATIONALUM': ['NALCO', 'National Aluminium', 'NATIONALUM'],
  // Telecom
  'IDEA': ['Vodafone Idea', 'Vi', 'IDEA'],
  // Others
  'KALYANJWLR': ['Kalyan Jewellers', 'KALYANJWLR'],
  'PCJEWELLER': ['PC Jeweller', 'PCJEWELLER'],
  'DEEPIND': ['Deep Industries', 'DEEPIND'],
  'SWANDHI': ['Swan Defence', 'SWANDHI'],
  'PRIMEFOCUS': ['Prime Focus', 'PRIMEFOCUS'],
  'SMARTWORKS': ['Smartworks', 'SMARTWORKS'],
  'POWERICA': ['Powerica', 'POWERICA'],
  'JUBLFOOD': ['Jubilant FoodWorks', 'Jubilant', 'JUBLFOOD'],
  // Indices (for news matching)
  'NIFTY': ['Nifty', 'Nifty 50', 'Nifty50'],
  'SENSEX': ['Sensex', 'BSE Sensex', 'S&P BSE Sensex'],
  'BANKNIFTY': ['Bank Nifty', 'Nifty Bank', 'BankNifty'],
};

// Single common words that are also companies. They only count as a mention when
// written with a capital letter AND the text has finance context ("Titan shares", "Reliance Q2 results").
const AMBIGUOUS = new Set(['reliance', 'titan', 'apollo', 'hero', 'eternal', 'trent', 'larsen', 'britannia', 'union bank', 'power grid', 'indian oil', 'eicher']);
const FINANCE_CONTEXT = /\b(shares?|stocks?|NSE|BSE|Nifty|Sensex|Ltd|Limited|Q[1-4]|FY\s?\d{2}|earnings|dividend|IPO|market cap|brokerage|target price|stake|results|profit|revenue|crore|Rs\.?|investors?|analysts?)\b|₹/i;

// Known look-alikes: "Apollo Global" is a US fund, "Hero Group" isn't Hero MotoCorp, etc.
const NOT_FOLLOWED_BY = { apollo: /^\s+(Global|Management|Tyres?|Group|Hospitality)\b/, hero: /^\s+(Group|Honda|Wars)\b/, eternal: /^\s+(Sunshine|Love|City)\b/ };

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Instruments registry (populated from preloaded instruments list)
const DYNAMIC_STOCKS = new Map();
const DYNAMIC_MAP = { ...COMPANY_MAP };

export function registerStocks(stocks) {
  if (!stocks || typeof stocks !== 'object') return;
  for (const [sym, stock] of Object.entries(stocks)) {
    const symbol = sym.toUpperCase();
    DYNAMIC_STOCKS.set(symbol, stock);
    if (!DYNAMIC_MAP[symbol]) {
      const cleanName = (stock.name || symbol)
        .replace(/\s+(Limited|Ltd\.?|Corporation|Corp\.?|India)\b/gi, '')
        .trim();
      const aliases = [stock.name, cleanName, symbol].filter(Boolean);
      DYNAMIC_MAP[symbol] = Array.from(new Set(aliases));
    }
  }
}

/**
 * Match company mentions in text against the company map.
 * - short aliases (ITC, LT, IOC, SBI…) must match case-exactly, so "it", "lt" and "ioc" don't fire
 * - ambiguous single words need a capital letter and finance context
 * Returns array of matched symbols.
 */
function matchCompanies(text) {
  if (!text) return [];
  const matched = new Set();
  const hasContext = FINANCE_CONTEXT.test(text);

  for (const [symbol, aliases] of Object.entries(DYNAMIC_MAP)) {
    for (const alias of aliases) {
      if (!alias || alias.length < 2) continue;
      const body = escapeRe(alias);
      const ambiguous = AMBIGUOUS.has(alias.toLowerCase());
      const shortAlias = alias.length <= 4 && alias === alias.toUpperCase();
      const caseSensitive = ambiguous || shortAlias;
      const re = new RegExp(`(?<![\\w&])${body}(?![\\w&])`, caseSensitive ? '' : 'i');
      const m = re.exec(text);
      if (!m) continue;
      if (ambiguous && !hasContext) continue;
      const bad = NOT_FOLLOWED_BY[alias.toLowerCase()];
      if (bad && bad.test(text.slice(m.index + m[0].length))) continue;
      matched.add(symbol);
      break;
    }
  }
  return Array.from(matched);
}

/**
 * Get display name for a symbol
 */
function getCompanyName(symbol) {
  const s = symbol?.toUpperCase();
  const dynamic = DYNAMIC_STOCKS.get(s);
  if (dynamic?.name) return dynamic.name;
  const aliases = COMPANY_MAP[s] || DYNAMIC_MAP[s];
  return aliases ? aliases[0] : (symbol || '');
}

/**
 * Get list of all known companies with metadata
 */
function getAllCompanies() {
  const symbols = Array.from(new Set([...Object.keys(COMPANY_MAP), ...DYNAMIC_STOCKS.keys()]));
  return symbols.map((symbol) => {
    const dyn = DYNAMIC_STOCKS.get(symbol);
    return {
      symbol,
      name: dyn?.name || getCompanyName(symbol),
      sector: dyn?.sector || 'Other',
      price: dyn?.price ?? null,
      change: dyn?.change ?? null,
      marketCap: dyn?.marketCap ?? null,
    };
  });
}

export { COMPANY_MAP, matchCompanies, getCompanyName, getAllCompanies };

