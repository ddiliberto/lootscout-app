# LootScout

LootScout is a web app that searches across secondhand marketplaces and retro game stores like LukieGames, VGNY, JJGames, and DKOldies to surface deals on retro and collectible video games.

## Features

- Search across multiple retro game stores
- Filter by platform, genre, price, and source
- Sort results by price or recency
- Save favorite listings
- Track search history
- Real-time scraping of multiple retro game websites

## Tech Stack

- Next.js 15 (App Router)
- Tailwind CSS + ShadCN UI
- Lucide React Icons
- TypeScript
- Python (for web scrapers)
- Beautiful Soup 4

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/yourusername/lootscout-app.git
cd lootscout-app
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Project Structure

- `src/app/page.tsx` - Homepage
- `src/app/search/page.tsx` - Search results page
- `src/app/api/scrape/` - API routes for scrapers
- `src/components/ui/` - UI components from ShadCN
- `src/lib/scraper.ts` - Scraper utility functions
- `scripts/` - Python scraper scripts

## Current Status

This project is currently in development. The homepage and search page UI are complete, with real-time data from multiple retro game stores (LukieGames, VGNY, JJGames, and DKOldies). Future development will include integration with marketplace APIs like eBay, Mercari, and Etsy.

## License

MIT
