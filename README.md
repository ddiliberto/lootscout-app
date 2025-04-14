# LootScout

LootScout is a web app that searches across secondhand marketplaces like eBay, Mercari, Etsy, Poshmark, and Facebook Marketplace to surface deals on retro and collectible video games.

## Features

- Search across multiple marketplaces for retro games
- Filter by platform, genre, price, and source
- Sort results by price or recency
- Save favorite listings
- Track search history

## Tech Stack

- Next.js 15 (App Router)
- Tailwind CSS + ShadCN UI
- Lucide React Icons
- TypeScript

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
- `src/components/ui/` - UI components from ShadCN
- `src/lib/mock-data.ts` - Mock data for development

## Current Status

This project is currently in development. The homepage and search page UI are complete, with mock data for demonstration purposes. Future development will include integration with actual marketplace APIs.

## License

MIT
