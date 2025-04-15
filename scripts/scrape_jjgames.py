#!/usr/bin/env python3
"""
JJGames.com Scraper

This script scrapes product information from JJGames.com based on search parameters.
It returns the data in JSON format for use in the LootScout application.
Uses Ecwid's API for reliable data extraction.
"""

import sys
import json
import time
import argparse
import requests
from datetime import datetime
from urllib.parse import quote_plus

# JJGames Ecwid Store ID (obtained from their website)
JJGAMES_STORE_ID = "1003"

def search_jjgames(query, platform=None, max_results=16, debug=False):
    """
    Search JJGames.com for products matching the query and platform.
    
    Args:
        query (str): Search term
        platform (str, optional): Game platform (e.g., 'ps1', 'snes')
        max_results (int, optional): Maximum number of results to return
        debug (bool, optional): Enable debug mode
        
    Returns:
        list: List of product dictionaries
    """
    # Construct the API URL with proper encoding
    encoded_query = quote_plus(query)
    api_url = f"https://app.ecwid.com/api/v3/{JJGAMES_STORE_ID}/search?keyword={encoded_query}&limit={max_results}"
    
    if debug:
        print(f"Making API request to: {api_url}", file=sys.stderr)
    
    try:
        # Set up headers to mimic a browser
        headers = {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36',
            'Accept': 'application/json',
            'Referer': 'https://www.jjgames.com/'
        }
        
        # Make the API request
        response = requests.get(api_url, headers=headers, timeout=30)
        response.raise_for_status()
        
        # Parse the JSON response
        data = response.json()
        
        if 'items' not in data:
            if debug:
                print("No items found in API response", file=sys.stderr)
            return []
        
        products = []
        for item in data['items']:
            try:
                product_name = item.get('name', '')
                
                # Skip if platform filter is provided and doesn't match
                if platform and platform.lower() not in product_name.lower():
                    continue
                
                # Get the product URL
                product_url = f"https://www.jjgames.com/#!/~/product/{item.get('id')}"
                
                # Get the price
                price = item.get('price', {}).get('formatted', 'Price not available')
                
                # Get the image
                img_url = item.get('thumbnailUrl', '')
                
                # Check if product is out of stock
                is_out_of_stock = not item.get('inStock', True)
                
                # Skip out-of-stock products
                if is_out_of_stock:
                    if debug:
                        print(f"Skipping out of stock product: {product_name}", file=sys.stderr)
                    continue
                
                # Get the description
                description = item.get('description', 'From JJGames.com')
                if description:
                    description = description[:200] + "..." if len(description) > 200 else description
                
                # Add availability info to description
                if not is_out_of_stock:
                    description += " • In Stock"
                
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
                    "id": f"jjgames-{item.get('id')}",
                    "title": product_name,
                    "description": description,
                    "price": price,
                    "source": "JJGames",
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
        
        if debug:
            print(f"Found {len(products)} products on JJGames.com", file=sys.stderr)
        
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
    parser = argparse.ArgumentParser(description='Scrape JJGames.com for product information.')
    parser.add_argument('--query', type=str, required=True, help='Search term')
    parser.add_argument('--platform', type=str, help='Game platform (e.g., ps1, snes)')
    parser.add_argument('--max_results', type=int, default=16, help='Maximum number of results')
    parser.add_argument('--debug', action='store_true', help='Enable debug mode')
    
    args = parser.parse_args()
    
    if args.debug:
        print(f"Searching for '{args.query}' on JJGames.com...", file=sys.stderr)
    
    try:
        # Execute search
        products = search_jjgames(args.query, args.platform, args.max_results, args.debug)
        
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
