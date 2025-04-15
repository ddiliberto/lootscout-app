#!/usr/bin/env python3
"""
Test script for DKOldies scraper
"""

import sys
import json
import asyncio
from scrape_dkoldies import search_dkoldies

async def test_scraper():
    """Test the DKOldies scraper with a Zelda search query."""
    print("Testing DKOldies scraper with 'zelda' query...")
    
    # Test basic search
    products = await search_dkoldies("zelda", max_results=5)
    
    # Print results
    print(f"\nFound {len(products)} products:")
    for product in products:
        print(f"\nTitle: {product['title']}")
        print(f"Price: {product['price']}")
        print(f"URL: {product['url']}")
        print(f"Platform: {product.get('platform', 'Unknown')}")
        print("-" * 50)
    
    # Test with platform filter
    print("\nTesting with platform filter (n64)...")
    products = await search_dkoldies("zelda", platform="n64", max_results=5)
    
    print(f"\nFound {len(products)} N64 Zelda products:")
    for product in products:
        print(f"\nTitle: {product['title']}")
        print(f"Price: {product['price']}")
        print(f"URL: {product['url']}")
        print("-" * 50)

if __name__ == "__main__":
    asyncio.run(test_scraper()) 