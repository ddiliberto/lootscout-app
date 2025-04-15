import { NextRequest, NextResponse } from 'next/server';
import { Product } from '@/lib/mock-data';

// Cache for storing search results to reduce API call frequency
const CACHE_DURATION = 1000 * 60 * 15; // 15 minutes
const cache: Record<string, { data: Product[], timestamp: number }> = {};

// eBay Finding API endpoint (using sandbox since we have sandbox credentials)
const EBAY_API_ENDPOINT = 'https://svcs.sandbox.ebay.com/services/search/FindingService/v1';

// Video Games category ID
const VIDEO_GAMES_CATEGORY = '139973';

export async function GET(request: NextRequest) {
  try {
    // Get search parameters
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || '';
    const platform = searchParams.get('platform') || '';
    
    // Create cache key
    const cacheKey = `${query}-${platform}`.toLowerCase();
    
    // Check cache
    const now = Date.now();
    if (cache[cacheKey] && now - cache[cacheKey].timestamp < CACHE_DURATION) {
      console.log('Returning cached eBay results for:', cacheKey);
      return NextResponse.json(cache[cacheKey].data);
    }
    
    console.log('Fetching from eBay API for:', query, platform ? `(platform: ${platform})` : '');
    
    // Prepare search keywords
    let keywords = query;
    if (platform) {
      keywords += ` ${platform}`;
    }
    keywords += ' video game';
    
    // Build eBay API request parameters
    const params = new URLSearchParams({
      'OPERATION-NAME': 'findItemsByKeywords',
      'SERVICE-VERSION': '1.0.0',
      'SECURITY-APPNAME': process.env.EBAY_APP_ID || '',
      'RESPONSE-DATA-FORMAT': 'JSON',
      'REST-PAYLOAD': 'true',
      'keywords': keywords,
      'categoryId': VIDEO_GAMES_CATEGORY,
      'itemFilter(0).name': 'ListingType',
      'itemFilter(0).value': 'FixedPrice',
      'paginationInput.entriesPerPage': '16',
      'sortOrder': 'BestMatch'
    });
    
    // Log the full URL for debugging
    const apiUrl = `${EBAY_API_ENDPOINT}?${params.toString()}`;
    console.log('eBay API URL:', apiUrl);
    
    // For development purposes, use mock data instead of making a real API call
    // This is because we're using sandbox credentials which might not return real data
    console.log('Using mock eBay data for development');
    const data = getMockEbayResponse(query);
    console.log('eBay API mock response:', JSON.stringify(data, null, 2));
    
    // Parse eBay response and convert to our Product format
    const products = parseEbayResponse(data, query);
    
    // Update cache
    cache[cacheKey] = {
      data: products,
      timestamp: now
    };
    
    // Return the results
    return NextResponse.json(products);
    
  } catch (error) {
    console.error('eBay API route error:', error);
    // Log more detailed error information
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    return NextResponse.json(
      { error: 'Failed to fetch from eBay API', message: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

/**
 * Parse eBay API response and convert to our Product format
 */
function parseEbayResponse(data: any, query: string): Product[] {
  try {
    console.log('Parsing eBay response for query:', query);
    
    // Check if we have search results
    const searchResult = data.findItemsByKeywordsResponse?.[0]?.searchResult?.[0];
    
    // Log the structure of the response for debugging
    console.log('eBay response structure:', {
      hasResponse: !!data.findItemsByKeywordsResponse,
      responseLength: data.findItemsByKeywordsResponse?.length,
      hasSearchResult: !!data.findItemsByKeywordsResponse?.[0]?.searchResult,
      searchResultLength: data.findItemsByKeywordsResponse?.[0]?.searchResult?.length,
      hasItems: !!data.findItemsByKeywordsResponse?.[0]?.searchResult?.[0]?.item,
      itemCount: data.findItemsByKeywordsResponse?.[0]?.searchResult?.[0]?.item?.length || 0
    });
    
    if (!searchResult || !searchResult.item || searchResult.item.length === 0) {
      console.log('No eBay results found');
      return [];
    }
    
    console.log(`Found ${searchResult.item.length} eBay items`);
    
    // Map eBay items to our Product format
    return searchResult.item.map((item: any) => {
      // Extract item details
      const itemId = item.itemId?.[0] || '';
      const title = item.title?.[0] || 'Unknown Title';
      const subtitle = item.subtitle?.[0] || '';
      const currentPrice = item.sellingStatus?.[0]?.currentPrice?.[0]?.__value__ || '0.00';
      const imageUrl = item.galleryURL?.[0] || '';
      const viewItemUrl = item.viewItemURL?.[0] || '';
      const conditionId = item.condition?.[0]?.conditionId?.[0] || '';
      const conditionName = item.condition?.[0]?.conditionDisplayName?.[0] || 'Unknown';
      const listingTime = item.listingInfo?.[0]?.startTime?.[0] || '';
      
      // Extract platform from title or category
      let platform = '';
      const platformKeywords = ['ps1', 'ps2', 'ps3', 'ps4', 'ps5', 'playstation', 
                               'xbox', 'nintendo', 'switch', 'wii', 'gamecube', 'n64', 
                               'gameboy', 'ds', '3ds', 'genesis', 'dreamcast', 'sega'];
      
      const titleLower = title.toLowerCase();
      for (const keyword of platformKeywords) {
        if (titleLower.includes(keyword)) {
          platform = keyword;
          break;
        }
      }
      
      // Format the time string (e.g., "2 days ago", "5 hours ago")
      const timeString = formatTimeAgo(listingTime);
      
      // Format price with $ sign
      const formattedPrice = `$${parseFloat(currentPrice).toFixed(2)}`;
      
      // Create description from subtitle or condition
      const description = subtitle || `Condition: ${conditionName}`;
      
      return {
        id: itemId,
        title,
        description,
        price: formattedPrice,
        source: 'eBay',
        time: timeString,
        image: imageUrl || 'https://via.placeholder.com/300x300?text=No+Image',
        condition: conditionName,
        url: viewItemUrl,
        platform
      };
    });
    
  } catch (error) {
    console.error('Error parsing eBay response:', error);
    return [];
  }
}

/**
 * Generate mock eBay API response for development
 */
function getMockEbayResponse(query: string): any {
  // Create a timestamp for a recent date
  const now = new Date();
  const recentDate = new Date(now.getTime() - 1000 * 60 * 60 * 24 * 2); // 2 days ago
  const isoDate = recentDate.toISOString();
  
  // Generate items based on the query
  const items = [];
  const platforms = ['Nintendo Switch', 'PlayStation 4', 'Xbox One', 'Nintendo 64', 'GameCube'];
  const conditions = ['New', 'Like New', 'Very Good', 'Good', 'Acceptable'];
  
  // Generate 5-10 items
  const itemCount = Math.floor(Math.random() * 6) + 5;
  
  for (let i = 0; i < itemCount; i++) {
    const platform = platforms[Math.floor(Math.random() * platforms.length)];
    const condition = conditions[Math.floor(Math.random() * conditions.length)];
    const price = (Math.random() * 100 + 20).toFixed(2); // Random price between $20-$120
    
    items.push({
      itemId: [`${i}${Date.now()}`],
      title: [`${query.charAt(0).toUpperCase() + query.slice(1)}: ${['Adventure', 'Collector Edition', 'Ultimate', 'Classic', 'Deluxe'][i % 5]} (${platform})`],
      subtitle: [i % 2 === 0 ? `Great ${condition.toLowerCase()} condition game!` : ''],
      galleryURL: [`https://via.placeholder.com/300x300?text=${query}+${i+1}`],
      viewItemURL: [`https://www.ebay.com/itm/${i}${Date.now()}`],
      sellingStatus: [{
        currentPrice: [{
          __value__: price,
          '@currencyId': 'USD'
        }]
      }],
      condition: [{
        conditionId: [`${1000 + i}`],
        conditionDisplayName: [condition]
      }],
      listingInfo: [{
        startTime: [isoDate]
      }]
    });
  }
  
  // Return mock response in eBay API format
  return {
    findItemsByKeywordsResponse: [{
      searchResult: [{
        '@count': `${items.length}`,
        item: items
      }]
    }]
  };
}

/**
 * Format ISO date string to relative time (e.g., "2 days ago")
 */
function formatTimeAgo(isoDateString: string): string {
  try {
    const date = new Date(isoDateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    
    // Convert to hours
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    }
    
    // Convert to days
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays < 7) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    }
    
    // Convert to weeks
    const diffWeeks = Math.floor(diffDays / 7);
    return `${diffWeeks} week${diffWeeks !== 1 ? 's' : ''} ago`;
    
  } catch (error) {
    return 'Recently';
  }
}
