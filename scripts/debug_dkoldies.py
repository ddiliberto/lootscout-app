#!/usr/bin/env python3
"""
Debug script for DKOldies.com requests
"""

import requests
from bs4 import BeautifulSoup
from urllib.parse import quote_plus

def debug_request():
    """Test direct request to DKOldies.com"""
    # Set up headers to mimic a browser
    headers = {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Cache-Control': 'max-age=0',
    }
    
    # Test URL
    base_url = "https://www.dkoldies.com/searchresults.html"
    query = "zelda"
    encoded_query = quote_plus(query)
    search_url = f"{base_url}?search_query={encoded_query}"
    
    print(f"Making request to: {search_url}")
    
    try:
        # Make the request
        response = requests.get(search_url, headers=headers, timeout=30)
        response.raise_for_status()
        
        # Print response info
        print(f"\nResponse status code: {response.status_code}")
        print(f"Response headers: {dict(response.headers)}")
        
        # Parse and print HTML structure
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Print all div classes
        print("\nAll div classes found:")
        for div in soup.find_all('div', class_=True):
            print(f"Class: {div['class']}")
        
        # Print all product-related elements
        print("\nProduct-related elements:")
        for elem in soup.find_all(['div', 'article', 'li'], class_=True):
            if any(keyword in str(elem.get('class', [])).lower() for keyword in ['product', 'card', 'item', 'listing']):
                print(f"Element: {elem.name}, Classes: {elem.get('class', [])}")
        
        # Save HTML to file for inspection
        with open('dkoldies_response.html', 'w', encoding='utf-8') as f:
            f.write(response.text)
        print("\nSaved response HTML to dkoldies_response.html")
        
    except Exception as e:
        print(f"Error: {str(e)}")

if __name__ == "__main__":
    debug_request() 