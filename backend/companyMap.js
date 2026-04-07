// Company name ↔ symbol mapping for 200+ NSE/BSE stocks
// Used by feedProxy to enrich news with stock mentions
// Used by tvScanner to resolve symbols

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

/**
 * Match company mentions in text against the company map.
 * Returns array of matched symbols.
 */
function matchCompanies(text) {
  if (!text) return [];
  const matched = new Set();
  const upperText = text.toUpperCase();

  for (const [symbol, aliases] of Object.entries(COMPANY_MAP)) {
    for (const alias of aliases) {
      // Use word boundary-aware matching
      const escapedAlias = alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`\\b${escapedAlias}\\b`, 'i');
      if (regex.test(text)) {
        matched.add(symbol);
        break;
      }
    }
  }

  return Array.from(matched);
}

/**
 * Get display name for a symbol
 */
function getCompanyName(symbol) {
  const aliases = COMPANY_MAP[symbol];
  return aliases ? aliases[0] : symbol;
}

export { COMPANY_MAP, matchCompanies, getCompanyName };
