# 📡 Newsdesk — Market News, Grouped into Stories

**Newsdesk** is a fast, calm reader for Indian and global market news. It pulls 30+ sources into one archive, groups the same event reported by several publishers into a single **story**, and lets you read, filter and share without leaving the app.

It is a news product only: no prices, no screener, no indicators.

![Newsdesk — dark](./.github/assets/screenshot.png)

<p>
  <img src="./.github/assets/screenshot-light.png" alt="Newsdesk — light" width="62%" />
  <img src="./.github/assets/screenshot-mobile.png" alt="Newsdesk — mobile" width="26%" />
</p>

---

## ✨ What it does

### Stories, not duplicates
When Reuters, CNBC and BizToc all cover the same headline, Newsdesk shows **one card** with "+2 sources". Open it and switch between each publisher's version from the "Also from" strip. Clustering runs in the browser on headline similarity within a 36-hour window.

### A proper briefing
*   **Today**: greeting, stories in the last 24 hours, **Top stories** (ranked by how many sources cover it, whether it has an image, and freshness), and **In the news**: the companies mentioned most today.
*   **Latest**: grouped by *Last hour / Earlier today / Yesterday / This week*, with topic tabs, source and time-range filters, **Newest** or **Most covered** sort, and **Unread only**.
*   **Cards or List**: switch layout; your choice is remembered.
*   **"N new stories"** pill: new arrivals wait behind a pill, so the list never jumps while you read.
*   **One Filters menu** (source, time, order) with removable chips for whatever is on, instead of always-visible dropdowns.
*   **Clean cards**: a card never repeats the headline as its description.
*   **Mute noisy sources** on the Sources page and they disappear from every list; unmute any time.
*   **Feedback with Undo**: saving, muting and "Mark all read" confirm with a toast you can undo. "You're all caught up" when nothing is unread.
*   **Copy brief** on Today copies the top stories as a Telegram-ready post. Recent searches are remembered. An offline banner keeps cached stories readable if the server drops, and Back returns to where you were.

### Summaries, without AI
Open any story and the reader leads with a **Summary** built by plain algorithms, not a language model:

1.  The server fetches the article and pulls out the real text (navigation, ads, cookie banners and "related" lists are dropped).
2.  It splits the text into sentences and ranks them with **TextRank**: sentences similar to many others score higher. Scores are nudged up for lead position and overlap with the headline.
3.  The top three sentences are shown **verbatim and in original order** as *Key points*, with *Key figures* (₹ amounts, percentages, quantities) pulled out as chips, then the clean full text.

Nothing is generated or reworded, so every line is the publisher's own wording. BizToc stubs are followed through to the real article. If a publisher blocks automatic reading, the reader says so and falls back to the feed's own description. Summaries start loading when you hover a story and are cached for six hours.

### Reader
A sheet on phones, a centred panel on desktop, with **Summary** and **Original** tabs. Step through stories with ← / →, switch between publishers of the same story, save, or **copy as a Telegram-ready post** (headline, two key points, source, link, `@MrChartist`). The original page runs in a sandbox with no access to the app's storage.

### Browse
*   **Topics**: Markets, Economy, Business, Crypto, Commodities, Middle East, Defense, AI and more, with 24-hour unread counts.
*   **Sources**: every feed with stories-today and latest time; tap to read only that source.
*   **Companies**: tap any `$SYMBOL` chip for that company's news and the companies that often appear alongside it.
*   **Search**: word-start matching with highlighting. **Saved** keeps stories on your device even after the archive is pruned.
*   **Copy digest**: on any list, copy the top stories as one Telegram-ready post.

### Fast keyboard use
`⌘K` / `Ctrl+K` or `/` opens the command palette (companies, topics, sources, pages, story search, appearance, refresh, mark everything read). In a list: `J` / `K` move, `Enter` or `O` open, `S` save, `M` mark read. `?` shows all shortcuts.

---

## 🎨 Design: Liquid Glass (iOS 26 / macOS 26)

Newsdesk shares its design tokens with [IPO Decode](https://ipodecode.mrchartist.com), so the Mr. Chartist family reads as one product.

*   **Materials**: translucent Liquid Glass (blur, saturation, specular rim) for the sidebar, toolbar, tab bar and sheets; inset-grouped cards for content.
*   **macOS layout**: floating source-list sidebar with coloured squircle icons, translucent toolbar, large-title page headers.
*   **iOS layout**: floating capsule tab bar with a separate round Search button, bottom-sheet reader with a grabber and swipe-to-dismiss, safe-area spacing, 44 px touch targets.
*   **Appearance**: Light / Auto / Dark on warm-paper `#F9F7F4` and warm-black `#0F0E0D`, applied before first paint.
*   **Type**: Plus Jakarta Sans (display), Inter (body, tabular numerals), DM Serif Display italic (brand accent), self-hosted in `public/fonts`.
*   **Accessibility**: visible focus rings, reduced-motion, reduced-transparency and high-contrast fallbacks.
*   **Installable**: web-app manifest and icons, so it can be added to the iOS or Android home screen.

---

## 🏗️ Stack

**Frontend**: React 18, Vite, Tailwind CSS, Framer Motion, `cmdk`, React Query, React Router, Lucide icons.

**Backend**: Node.js + Express, `better-sqlite3` archive (30-day retention, URL de-duplication), `fast-xml-parser`, per-feed TTL caching with Google News fallbacks, headline-based topic routing for generic feeds, a Google News link resolver and an article proxy for the reader.

## 🚀 Run it

```bash
npm install
npm run start     # backend :3001 + Vite :5185
npm test          # backend (summariser, URL safety, company matching) and front-end (clustering, blurbs, sharing) tests
```

Open `http://localhost:5185`.

| Endpoint | Purpose |
| --- | --- |
| `GET /api/feeds` | Archived stories (30 days), newest first |
| `GET /api/feeds/sources` | Configured sources |
| `GET /api/feeds/:sourceId` | One source, live |
| `GET /api/companies` | Symbol → company name directory |
| `GET /api/company/:symbol` | Archived news mentioning a company |
| `GET /api/summary?url=&title=&desc=` | Extractive summary, key figures and clean text |
| `GET /api/article-proxy?url=` | Original-page proxy for the reader |

## 📂 Structure

```text
backend/            server.js · feedProxy.js (fetch, clean, categorise) · summarize.js (TextRank) · safeFetch.js (SSRF guard)
                    db.js · companyMap.js · gnewsResolver.js · *.test.js
src/
  lib/stories.ts    clustering + time buckets
  lib/share.ts      Telegram-ready post / digest
  hooks/            news, stories, theme, saved, read-state, persistent state
  components/
    layout/         Sidebar, Toolbar, TabBar, CommandPalette, ShortcutsSheet
    news/           NewsStream, NewsCard, NewsRow, LeadStory, ArticleModal, TrendingStrip
  pages/            Home, Search, Saved, Topics, Topic, Sources, Source, Company
  index.css         design tokens and components
```

## Notes

*   Company mentions come from a keyword map (`backend/companyMap.js`). Short tickers must match case-exactly and ambiguous single words (Titan, Reliance, Apollo…) need finance context, but the match is still keyword-based, so treat company pages as a convenience filter, not a verified tag.
*   Some publishers (for example Livemint and NDTV) refuse automatic fetches from servers; those stories get a feed-based summary and a notice.
*   Article and summary fetches only reach public internet addresses; localhost, private ranges and cloud metadata addresses are refused, including via redirects.
*   Story clustering is heuristic; two different events with near-identical headlines can occasionally be merged.

---

## 👨‍💻 Author

**Mr. Chartist — Rohit Singh**
*SEBI Registered Research Analyst (INH000015297)*

💖 **[Support Mr. Chartist](https://mrchartist.com)** · 📱 **[Community](https://t.me/MrChartist)** · 🐦 **[X](https://twitter.com/mrchartist)**
