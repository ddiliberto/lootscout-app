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
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry
import os
import hashlib
from pathlib import Path

# Set up headers to mimic a browser
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
    'Cache-Control': 'max-age=0',
}

# Cache configuration
CACHE_DIR = Path(os.path.expanduser("~/.cache/lootscout"))
CACHE_DURATION = 3600  # Cache for 1 hour

def setup_cache_dir():
    """Create cache directory if it doesn't exist."""
    CACHE_DIR.mkdir(parents=True, exist_ok=True)

def get_cached_response(query, platform):
    """Get cached response if it exists and is not expired."""
    if not CACHE_DIR.exists():
        return None
        
    cache_key = hashlib.md5(f"{query}-{platform}".encode()).hexdigest()
    cache_file = CACHE_DIR / f"vgny-{cache_key}.json"
    
    if cache_file.exists():
        try:
            data = json.loads(cache_file.read_text())
            if time.time() - data['timestamp'] < CACHE_DURATION:
                return data['products']
        except Exception:
            pass
    return None

def cache_response(query, platform, products):
    """Cache the response for future use."""
    try:
        setup_cache_dir()
        cache_key = hashlib.md5(f"{query}-{platform}".encode()).hexdigest()
        cache_file = CACHE_DIR / f"vgny-{cache_key}.json"
        
        data = {
            'timestamp': time.time(),
            'products': products
        }
        cache_file.write_text(json.dumps(data))
    except Exception as e:
        print(f"Error caching response: {str(e)}", file=sys.stderr)

def create_session():
    """Create a requests session with retries and timeouts."""
    session = requests.Session()
    
    # Configure retries
    retries = Retry(
        total=3,  # number of retries
        backoff_factor=0.5,  # wait 0.5s * (2 ** retry) between retries
        status_forcelist=[500, 502, 503, 504],  # retry on these status codes
    )
    
    # Add retry adapter to session
    adapter = HTTPAdapter(max_retries=retries)
    session.mount('http://', adapter)
    session.mount('https://', adapter)
    
    return session

def search_vgny(query, platform=None, max_results=16, debug=False):
    """
    Search VideoGamesNewYork.com for products matching the query and platform.
    
    Args:
        query (str): Search term
        platform (str, optional): Game platform (e.g., 'ps1', 'snes')
        max_results (int, optional): Maximum number of results to return
        debug (bool, optional): Enable debug mode
        
    Returns:
        list: List of product dictionaries
    """
    # Check cache first
    cached_products = get_cached_response(query, platform)
    if cached_products is not None:
        if debug:
            print("Using cached response", file=sys.stderr)
        return cached_products[:max_results]
    
    # Construct the search URL
    base_url = "https://videogamesnewyork.com/search.php"
    params = {
        'search_query': query,
        'section': 'product'
    }
    
    try:
        # Create session with retries
        session = create_session()
        
        # Rate limiting - sleep briefly before request
        time.sleep(0.5)
        
        # Make the request
        response = session.get(base_url, params=params, headers=HEADERS, timeout=15)
        response.raise_for_status()
        
        # Parse the HTML
        soup = BeautifulSoup(response.text, 'html.parser')
        
        if debug:
            print(f"Response encoding: {response.encoding}", file=sys.stderr)
            print(f"Content type: {response.headers.get('content-type', 'unknown')}", file=sys.stderr)
            print(f"HTML snippet: {response.text[:1000]}", file=sys.stderr)
        
        # Find all product listings
        products = []
        product_elements = soup.select('.productGrid li.product')
        
        if debug:
            print(f"Found {len(product_elements)} products on VideoGamesNewYork.com", file=sys.stderr)
        
        if not product_elements:
            # Try alternative selectors
            product_elements = soup.select('li.product')
            if debug:
                print(f"Trying alternative selector 'li.product', found {len(product_elements)} products", file=sys.stderr)
        
        for product_elem in product_elements[:max_results]:
            try:
                # Check if product is out of stock
                out_of_stock_elem = product_elem.select_one('.sale-flag-side--outstock')
                if out_of_stock_elem:
                    if debug:
                        print("Skipping out of stock product", file=sys.stderr)
                    continue
                
                # Extract product details
                article_elem = product_elem.select_one('article.card')
                if not article_elem:
                    if debug:
                        print("Could not find article.card element", file=sys.stderr)
                    article_elem = product_elem  # Fall back to the li element
                
                # Extract product name and URL
                product_name_elem = article_elem.select_one('.card-title a')
                if not product_name_elem:
                    if debug:
                        print("Could not find product name element", file=sys.stderr)
                    continue
                
                product_name = product_name_elem.text.strip()
                product_url = product_name_elem['href']
                if not product_url.startswith('http'):
                    product_url = f"https://videogamesnewyork.com{product_url}"
                
                # Skip if platform filter is provided and doesn't match
                if platform and platform.lower() not in product_name.lower():
                    continue
                
                # Extract price - use the main price element
                price = "Price not available"
                price_elem = article_elem.select_one('.price--withoutTax.price--main')
                if price_elem:
                    price = price_elem.text.strip()
                else:
                    # Try alternative price selectors if main one not found
                    price_elem = article_elem.select_one('.price--withoutTax')
                    if price_elem:
                        price = price_elem.text.strip()
                    else:
                        price_elem = article_elem.select_one('.price')
                        if price_elem:
                            price = price_elem.text.strip()
                
                # Clean up price format
                price = price.replace('$', '').strip()
                try:
                    price_float = float(price.replace(',', ''))
                    price = f"${price_float:.2f}"
                except ValueError:
                    price = f"${price}"  # Keep original format if parsing fails
                
                # Extract image - get the first image in the container
                img_elem = article_elem.select_one('.card-img-container img')
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
                
                # Extract brand if available
                brand = "VGNY"
                brand_elem = article_elem.select_one('.card-text--brand')
                if brand_elem:
                    brand_text = brand_elem.text.strip()
                    if brand_text:
                        brand = brand_text
                
                # Determine condition from title (approximate)
                condition = "Used"
                if "new" in product_name.lower():
                    condition = "New"
                elif "sealed" in product_name.lower():
                    condition = "Sealed"
                elif "complete" in product_name.lower() or "cib" in product_name.lower():
                    condition = "Complete"
                elif "loose" in product_name.lower():
                    condition = "Loose"
                
                # Extract platform from title (approximate)
                detected_platform = None
                platform_keywords = {
                    "ps1": ["playstation", "ps1", "psx", "psone"],
                    "ps2": ["playstation 2", "ps2"],
                    "ps3": ["playstation 3", "ps3"],
                    "ps4": ["playstation 4", "ps4"],
                    "ps5": ["playstation 5", "ps5"],
                    "psp": ["psp", "playstation portable"],
                    "ps vita": ["ps vita", "playstation vita", "vita"],
                    "snes": ["super nintendo", "snes", "super nes"],
                    "nes": ["nintendo entertainment system", "nes"],
                    "n64": ["nintendo 64", "n64"],
                    "gamecube": ["gamecube", "nintendo gamecube", "gcn"],
                    "wii": ["nintendo wii", "wii"],
                    "wii u": ["nintendo wii u", "wii u"],
                    "switch": ["nintendo switch", "switch"],
                    "game boy": ["game boy", "gameboy", "gba", "gbc"],
                    "ds": ["nintendo ds", "nds", "ds"],
                    "3ds": ["nintendo 3ds", "3ds"],
                    "genesis": ["genesis", "sega genesis", "mega drive"],
                    "dreamcast": ["dreamcast", "sega dreamcast"],
                    "saturn": ["saturn", "sega saturn"],
                    "game gear": ["game gear", "sega game gear"],
                    "xbox": ["xbox"],
                    "xbox 360": ["xbox 360"],
                    "xbox one": ["xbox one"],
                    "xbox series": ["xbox series"]
                }
                
                for p, keywords in platform_keywords.items():
                    if any(keyword in product_name.lower() for keyword in keywords):
                        detected_platform = p
                        break
                
                # Create product object
                product = {
                    "id": f"vgny-{hashlib.md5(product_url.encode()).hexdigest()}",
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
                if debug:
                    print(f"Error parsing product: {str(e)}", file=sys.stderr)
                continue
        
        # Cache the results
        cache_response(query, platform, products)
        
        return products
        
    except requests.RequestException as e:
        if debug:
            print(f"Request error: {str(e)}", file=sys.stderr)
        return []
    except Exception as e:
        if debug:
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
        products = search_vgny(args.query, args.platform, args.max_results, args.debug)
        
        if args.debug:
            print(f"Found {len(products)} products", file=sys.stderr)
            if products:
                print(f"Sample product: {products[0]['title']} - {products[0]['price']}", file=sys.stderr)
        
        # Output as JSON
        print(json.dumps(products))
    except Exception as e:
        if args.debug:
            print(f"Error in main function: {str(e)}", file=sys.stderr)
        print("[]")  # Return empty array on error

if __name__ == "__main__":
    main()
