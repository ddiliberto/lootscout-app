# LootScout Scrapers

This directory contains web scrapers for various retro game marketplaces.

## Setup

1. Make sure you have Python 3.8+ installed on your system.

2. Install the required Python dependencies:

```bash
pip install -r requirements.txt
```

## Available Scrapers

### LukieGames.com Scraper

The `scrape_lukie_games.py` script scrapes product information from LukieGames.com.

#### Usage

You can run the script directly from the command line:

```bash
python scrape_lukie_games.py --query "final fantasy" --platform "ps1" --max_results 10
```

Parameters:
- `--query`: Search term (required)
- `--platform`: Game platform (optional, e.g., "ps1", "snes")
- `--max_results`: Maximum number of results to return (optional, default: 16)

The script outputs JSON data to stdout.

### VideoGamesNewYork.com Scraper

The `scrape_vgny.py` script scrapes product information from VideoGamesNewYork.com.

#### Usage

You can run the script directly from the command line:

```bash
python scrape_vgny.py --query "metal gear" --platform "ps1" --max_results 10
```

Parameters:
- `--query`: Search term (required)
- `--platform`: Game platform (optional, e.g., "ps1", "snes")
- `--max_results`: Maximum number of results to return (optional, default: 16)

The script outputs JSON data to stdout.

## Integration with Next.js

The scrapers are integrated with the LootScout app through Next.js API routes. The API routes handle:

1. Executing the Python scripts
2. Caching results to reduce load on the source websites
3. Normalizing data to match the app's product model
4. Combining results with other data sources

## Legal Considerations

These scrapers are intended for educational purposes only. When using web scrapers:

1. Always respect the website's robots.txt file
2. Implement rate limiting to avoid overloading the target servers
3. Check the terms of service of the websites you're scraping
4. Consider using official APIs when available
