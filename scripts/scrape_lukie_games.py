#!/usr/bin/env python3
"""
LukieGames.com Scraper

This script scrapes product information from LukieGames.com based on search parameters.
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

def search_lukie_games(query, platform=None, max_results=16):
    """
    Search LukieGames.com for products matching the query and platform.
    
    Args:
        query (str): Search term
        platform (str, optional): Game platform (e.g., 'ps1', 'snes')
        max_results (int, optional): Maximum number of results to return
        
    Returns:
        list: List of product dictionaries
    """
    # Construct the search URL
    base_url = "https://www.lukiegames.com/search.asp"
    search_url = f"{base_url}?q={query}"
    
    try:
        # Make the request
        response = requests.get(search_url, headers=HEADERS, timeout=10)
        response.raise_for_status()
        
        # Parse the HTML
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Find all product listings
        products = []
        product_elements = soup.select('.ss__result.ss__result--item')
        
        print(f"Found {len(product_elements)} products on LukieGames.com", file=sys.stderr)
        
        for product_elem in product_elements[:max_results]:
            try:
                try:
                    # Extract product details from the correct HTML structure
                    product_name_elem = product_elem.select_one('.ss__result__name a')
                    if not product_name_elem:
                        print("Could not find product name element", file=sys.stderr)
                        continue
                    
                    product_name = product_name_elem.text.strip()
                    product_url = product_name_elem['href']
                    if not product_url.startswith('http'):
                        product_url = f"https://www.lukiegames.com{product_url}"
                    
                    # Skip if platform filter is provided and doesn't match
                    if platform and platform.lower() not in product_name.lower():
                        continue
                    
                    # Extract price - first try sale price, then regular price
                    price_elem = product_elem.select_one('.ss__result__price.ss__result__price--on-sale')
                    if not price_elem:
                        price_elem = product_elem.select_one('.ss__result__price')
                    
                    # Extract the actual price text (removing labels)
                    if price_elem:
                        # Get the text content directly from the element, not its children
                        price_text = price_elem.get_text(strip=True)
                        # Extract just the price part (e.g., "$40.97" from "On Sale:$40.97")
                        price = price_text.split(":")[-1] if ":" in price_text else price_text
                    else:
                        price = "Price not available"
                    
                    # Extract image
                    img_link = product_elem.select_one('.ss__result__image a')
                    if img_link:
                        img_elem = img_link.select_one('img')
                        img_url = img_elem['src'] if img_elem and 'src' in img_elem.attrs else ""
                        if img_url and not img_url.startswith('http'):
                            img_url = f"https://www.lukiegames.com{img_url}"
                    else:
                        img_url = ""
                    
                    # Extract stock status
                    stock_elem = product_elem.select_one('.ss__result__shipping__label')
                    in_stock = stock_elem and "In Stock" in stock_elem.text if stock_elem else False
                except Exception as e:
                    print(f"Error extracting product details: {str(e)}", file=sys.stderr)
                    continue
                
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
                    "id": f"lukie-{hash(product_url)}",
                    "title": product_name,
                    "description": f"From LukieGames.com",
                    "price": price,
                    "source": "LukieGames",
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
    parser = argparse.ArgumentParser(description='Scrape LukieGames.com for product information.')
    parser.add_argument('--query', type=str, required=True, help='Search term')
    parser.add_argument('--platform', type=str, help='Game platform (e.g., ps1, snes)')
    parser.add_argument('--max_results', type=int, default=16, help='Maximum number of results')
    parser.add_argument('--debug', action='store_true', help='Enable debug mode')
    
    args = parser.parse_args()
    
    if args.debug:
        print(f"Searching for '{args.query}' on LukieGames.com...", file=sys.stderr)
    
    try:
        # Execute search
        products = search_lukie_games(args.query, args.platform, args.max_results)
        
        if args.debug:
            print(f"Found {len(products)} products", file=sys.stderr)
        
        # Output as JSON
        print(json.dumps(products))
    except Exception as e:
        print(f"Error in main function: {str(e)}", file=sys.stderr)
        print("[]")  # Return empty array on error

if __name__ == "__main__":
    main()
