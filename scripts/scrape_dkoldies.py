#!/usr/bin/env python3
"""
DKOldies.com Scraper

This script scrapes product information from DKOldies.com based on search parameters.
It returns the data in JSON format for use in the LootScout application.
"""

import sys
import json
import time
import argparse
from datetime import datetime
from urllib.parse import quote_plus
import asyncio
from playwright.async_api import async_playwright
from bs4 import BeautifulSoup

async def search_dkoldies(query, platform=None, max_results=16):
    """
    Search DKOldies.com for products matching the query and platform.
    
    Args:
        query (str): Search term
        platform (str, optional): Game platform (e.g., 'ps1', 'snes')
        max_results (int, optional): Maximum number of results to return
        
    Returns:
        list: List of product dictionaries
    """
    # Construct the search URL with proper encoding
    base_url = "https://www.dkoldies.com/searchresults.html"
    encoded_query = quote_plus(query)
    search_url = f"{base_url}?search_query={encoded_query}"
    
    print(f"Searching URL: {search_url}", file=sys.stderr)
    
    async with async_playwright() as p:
        try:
            # Launch browser
            browser = await p.chromium.launch(headless=True)
            context = await browser.new_context(
                viewport={'width': 1920, 'height': 1080},
                user_agent='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            )
            page = await context.new_page()
            
            # Go to search URL
            await page.goto(search_url, wait_until='networkidle')
            
            # Wait for the product grid to load
            await page.wait_for_selector('.productGrid', timeout=10000)
            
            # Give extra time for all products to load
            await asyncio.sleep(2)
            
            # Get the page content
            content = await page.content()
            soup = BeautifulSoup(content, 'html.parser')
            
            # Find all product listings
            products = []
            
            # Find the product grid
            product_grid = soup.select_one('.productGrid')
            if not product_grid:
                print("Could not find product grid", file=sys.stderr)
                return []
            
            # Find all product elements
            product_elements = product_grid.select('.product')
            print(f"Found {len(product_elements)} products on DKOldies.com", file=sys.stderr)
            
            for product_elem in product_elements[:max_results]:
                try:
                    # Extract product details
                    # Title
                    title_elem = product_elem.select_one('.card-title a')
                    if not title_elem:
                        print("Could not find product title element", file=sys.stderr)
                        continue
                    
                    product_name = title_elem.text.strip()
                    
                    # Skip if platform filter is provided and doesn't match
                    if platform and platform.lower() not in product_name.lower():
                        continue
                    
                    # URL
                    product_url = title_elem['href'] if 'href' in title_elem.attrs else ""
                    if product_url and not product_url.startswith('http'):
                        product_url = f"https://www.dkoldies.com{product_url}"
                    
                    # Image
                    img_url = ""
                    img_elem = product_elem.select_one('.card-image')
                    if img_elem and 'src' in img_elem.attrs:
                        img_url = img_elem['src']
                    else:
                        img_elem = product_elem.select_one('.card-img-container img')
                        if img_elem and 'src' in img_elem.attrs:
                            img_url = img_elem['src']
                    
                    if img_url and not img_url.startswith('http'):
                        img_url = f"https://www.dkoldies.com{img_url}"
                    
                    # Price
                    price = "Price not available"
                    price_elem = product_elem.select_one('.price:not(.price--rrp)')
                    if price_elem:
                        price = price_elem.text.strip()
                    
                    # Extract description/summary
                    description = f"From DKOldies.com"
                    
                    # Reviews
                    review_count_elem = product_elem.select_one('.yotpo-bottomline p.text-m')
                    review_count = "0 Reviews"
                    if review_count_elem:
                        review_count = review_count_elem.text.strip()
                        description += f" • {review_count}"
                    
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
                        "id": f"dkoldies-{hash(product_url)}",
                        "title": product_name,
                        "description": description,
                        "price": price,
                        "source": "DKOldies",
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
            
        except Exception as e:
            print(f"Error: {str(e)}", file=sys.stderr)
            return []
        finally:
            await browser.close()

async def main():
    """Main function to handle command line arguments and execute the search."""
    parser = argparse.ArgumentParser(description='Scrape DKOldies.com for product information.')
    parser.add_argument('--query', type=str, required=True, help='Search term')
    parser.add_argument('--platform', type=str, help='Game platform (e.g., ps1, snes)')
    parser.add_argument('--max_results', type=int, default=16, help='Maximum number of results')
    parser.add_argument('--debug', action='store_true', help='Enable debug mode')
    
    args = parser.parse_args()
    
    if args.debug:
        print(f"Searching for '{args.query}' on DKOldies.com...", file=sys.stderr)
    
    try:
        # Execute search
        products = await search_dkoldies(args.query, args.platform, args.max_results)
        
        if args.debug:
            print(f"Found {len(products)} products", file=sys.stderr)
            if products:
                print(f"Sample product: {products[0]['title']} - {products[0]['price']}", file=sys.stderr)
        
        # Output results as JSON
        print(json.dumps(products))
        
    except Exception as e:
        print(f"Error: {str(e)}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main())
