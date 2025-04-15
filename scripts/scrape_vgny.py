#!/usr/bin/env python3
"""
VideoGamesNewYork.com Scraper

This script scrapes product information from VideoGamesNewYork.com based on search parameters.
It returns the data in JSON format for use in the LootScout application.
"""

import sys
import json
import time
import argparse
from datetime import datetime
import requests
from bs4 import BeautifulSoup

# Set up headers to mimic a browser
HEADERS = {
    'User-Agent': 'LootScout/1.0 (https://lootscout.app; info@lootscout.app)',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
    'Cache-Control': 'max-age=0',
}

def search_vgny(query, platform=None, max_results=16):
    """
    Search VideoGamesNewYork.com for products matching the query and platform.
    
    Args:
        query (str): Search term
        platform (str, optional): Game platform (e.g., 'ps1', 'snes')
        max_results (int, optional): Maximum number of results to return
        
    Returns:
        list: List of product dictionaries
    """
    # Construct the search URL
    base_url = "https://videogamesnewyork.com/search.php"
    params = {
        'search_query': query,
        'section': 'product'
    }
    
    try:
        # Make the request
        response = requests.get(base_url, params=params, headers=HEADERS, timeout=10)
        response.raise_for_status()
        
        # Parse the HTML
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Debug: Print a snippet of the HTML
        print(f"HTML snippet: {response.text[:1000]}", file=sys.stderr)
        
        # Find all product listings
        products = []
        product_elements = soup.select('li.product')
        
        print(f"Found {len(product_elements)} products on VideoGamesNewYork.com", file=sys.stderr)
        
        if not product_elements:
            # Try alternative selectors
            product_elements = soup.select('.productGrid li')
            print(f"Trying alternative selector '.productGrid li', found {len(product_elements)} products", file=sys.stderr)
        
        for product_elem in product_elements[:max_results]:
            try:
                # Extract product details
                article_elem = product_elem.select_one('article.card')
                if not article_elem:
                    print("Could not find article.card element", file=sys.stderr)
                    article_elem = product_elem  # Fall back to the li element
                
                # Extract product name and URL
                product_name_elem = article_elem.select_one('h4.card-title a')
                if not product_name_elem:
                    print("Could not find product name element, trying alternative selectors", file=sys.stderr)
                    product_name_elem = article_elem.select_one('.card-title a')
                    if not product_name_elem:
                        continue
                
                product_name = product_name_elem.text.strip()
                product_url = product_name_elem['href']
                if not product_url.startswith('http'):
                    product_url = f"https://videogamesnewyork.com{product_url}"
                
                # Skip if platform filter is provided and doesn't match
                if platform and platform.lower() not in product_name.lower():
                    continue
                
                # Extract price - try different selectors based on the HTML structure
                price = "Price not available"
                
                # First try the main price
                price_elem = article_elem.select_one('.price.price--withoutTax.price--main')
                if price_elem:
                    price = price_elem.text.strip()
                else:
                    # Try alternative price selectors
                    price_elem = article_elem.select_one('.price--withoutTax')
                    if price_elem:
                        price = price_elem.text.strip()
                    else:
                        price_elem = article_elem.select_one('.price')
                        if price_elem:
                            price = price_elem.text.strip()
                
                # Extract image
                img_elem = article_elem.select_one('.card-figure img')
                if not img_elem:
                    img_elem = article_elem.select_one('img')
                
                img_url = img_elem['src'] if img_elem and 'src' in img_elem.attrs else ""
                if img_url and not img_url.startswith('http'):
                    img_url = f"https://videogamesnewyork.com{img_url}"
                
                # Extract product summary/description if available
                description = "From VideoGamesNewYork.com"
                summary_elem = article_elem.select_one('.card-text--summary')
                if summary_elem:
                    summary_text = summary_elem.text.strip()
                    if summary_text:
                        description = summary_text[:100] + "..." if len(summary_text) > 100 else summary_text
                
                # Determine condition from title (approximate)
                condition = "Used"
                if "new" in product_name.lower():
                    condition = "New"
                elif "sealed" in product_name.lower():
                    condition = "Sealed"
                elif "complete" in product_name.lower():
                    condition = "Complete"
                
                # Extract platform from title (approximate)
                detected_platform = None
                platform_keywords = {
                    "ps1": ["playstation", "ps1", "psx", "psone"],
                    "snes": ["super nintendo", "snes", "super nes"],
                    "n64": ["nintendo 64", "n64"],
                    "game boy": ["game boy", "gameboy", "gba", "gbc"],
                    "genesis": ["genesis", "sega genesis", "mega drive"]
                }
                
                for p, keywords in platform_keywords.items():
                    if any(keyword in product_name.lower() for keyword in keywords):
                        detected_platform = p
                        break
                
                # Create product object
                product = {
                    "id": f"vgny-{hash(product_url)}",
                    "title": product_name,
                    "description": description,
                    "price": price,
                    "source": "VGNY",
                    "time": "Just now",  # We don't have actual listing time
                    "image": img_url,
                    "condition": condition,
                    "url": product_url,
                    "platform": detected_platform
                }
                
                products.append(product)
                
            except Exception as e:
                print(f"Error parsing product: {str(e)}", file=sys.stderr)
                continue
        
        return products
        
    except requests.RequestException as e:
        print(f"Request error: {str(e)}", file=sys.stderr)
        return []
    except Exception as e:
        print(f"Unexpected error: {str(e)}", file=sys.stderr)
        return []

def main():
    """Main function to handle command line arguments and execute the search."""
    parser = argparse.ArgumentParser(description='Scrape VideoGamesNewYork.com for product information.')
    parser.add_argument('--query', type=str, required=True, help='Search term')
    parser.add_argument('--platform', type=str, help='Game platform (e.g., ps1, snes)')
    parser.add_argument('--max_results', type=int, default=16, help='Maximum number of results')
    parser.add_argument('--debug', action='store_true', help='Enable debug mode')
    
    args = parser.parse_args()
    
    if args.debug:
        print(f"Searching for '{args.query}' on VideoGamesNewYork.com...", file=sys.stderr)
    
    try:
        # Execute search
        products = search_vgny(args.query, args.platform, args.max_results)
        
        if args.debug:
            print(f"Found {len(products)} products", file=sys.stderr)
            if products:
                print(f"Sample product: {products[0]['title']} - {products[0]['price']}", file=sys.stderr)
        
        # Output as JSON
        print(json.dumps(products))
    except Exception as e:
        print(f"Error in main function: {str(e)}", file=sys.stderr)
        print("[]")  # Return empty array on error

if __name__ == "__main__":
    main()
