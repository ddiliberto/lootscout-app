import { Product } from './mock-data';

/**
 * Fetches product data from eBay via our API route
 * 
 * @param query Search query
 * @param platform Optional platform filter
 * @returns Promise resolving to an array of products
 */
export async function fetchEbayProducts(
  query: string,
  platform?: string
): Promise<Product[]> {
  try {
    // Build the API URL with search parameters
    const params = new URLSearchParams();
    params.append('q', query);
    if (platform) {
      params.append('platform', platform);
    }
    
    const url = `/api/scrape/ebay?${params.toString()}`;
    
    // Make the request
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    // Parse the response
    const data = await response.json();
    return data as Product[];
    
  } catch (error) {
    console.error('Error fetching eBay products:', error);
    return []; // Return empty array on error
  }
}

/**
 * Fetches product data from JJGames.com via our scraper API
 * 
 * @param query Search query
 * @param platform Optional platform filter
 * @returns Promise resolving to an array of products
 */
export async function fetchJJGamesProducts(
  query: string,
  platform?: string
): Promise<Product[]> {
  try {
    // Build the API URL with search parameters
    const params = new URLSearchParams();
    params.append('q', query);
    if (platform) {
      params.append('platform', platform);
    }
    
    const url = `/api/scrape/jjgames?${params.toString()}`;
    
    // Make the request
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    // Parse the response
    const data = await response.json();
    return data as Product[];
    
  } catch (error) {
    console.error('Error fetching JJGames products:', error);
    return []; // Return empty array on error
  }
}

/**
 * Fetches product data from LukieGames.com via our scraper API
 * 
 * @param query Search query
 * @param platform Optional platform filter
 * @returns Promise resolving to an array of products
 */
export async function fetchLukieGamesProducts(
  query: string,
  platform?: string
): Promise<Product[]> {
  try {
    // Build the API URL with search parameters
    const params = new URLSearchParams();
    params.append('q', query);
    if (platform) {
      params.append('platform', platform);
    }
    
    const url = `/api/scrape/lukie-games?${params.toString()}`;
    
    // Make the request
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    // Parse the response
    const data = await response.json();
    return data as Product[];
    
  } catch (error) {
    console.error('Error fetching LukieGames products:', error);
    return []; // Return empty array on error
  }
}

/**
 * Fetches product data from VideoGamesNewYork.com via our scraper API
 * 
 * @param query Search query
 * @param platform Optional platform filter
 * @returns Promise resolving to an array of products
 */
export async function fetchVGNYProducts(
  query: string,
  platform?: string
): Promise<Product[]> {
  try {
    // Build the API URL with search parameters
    const params = new URLSearchParams();
    params.append('q', query);
    if (platform) {
      params.append('platform', platform);
    }
    
    const url = `/api/scrape/vgny?${params.toString()}`;
    
    // Make the request
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    // Parse the response
    const data = await response.json();
    return data as Product[];
    
  } catch (error) {
    console.error('Error fetching VGNY products:', error);
    return []; // Return empty array on error
  }
}

/**
 * Fetches product data from DKOldies.com via our scraper API
 * 
 * @param query Search query
 * @param platform Optional platform filter
 * @returns Promise resolving to an array of products
 */
export async function fetchDKOldiesProducts(
  query: string,
  platform?: string
): Promise<Product[]> {
  try {
    // Build the API URL with search parameters
    const params = new URLSearchParams();
    params.append('q', query);
    if (platform) {
      params.append('platform', platform);
    }
    
    const url = `/api/scrape/dkoldies?${params.toString()}`;
    
    // Make the request
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    // Parse the response
    const data = await response.json();
    return data as Product[];
    
  } catch (error) {
    console.error('Error fetching DKOldies products:', error);
    return []; // Return empty array on error
  }
}

/**
 * Combines results from multiple sources
 * 
 * @param scrapedProducts Array of product arrays from different scrapers
 * @returns Combined and deduplicated product array
 */
export function combineProductResults(
  ...scrapedProducts: Product[][]
): Product[] {
  // Create a map to track products by title for deduplication
  const productMap = new Map<string, Product>();
  
  // Log the number of products from each source
  console.log('Combining products:', scrapedProducts.map(arr => arr.length));
  
  // Add all scraped products from all sources
  scrapedProducts.forEach((productArray, index) => {
    console.log(`Source ${index} has ${productArray.length} products`);
    productArray.forEach(product => {
      productMap.set(product.title.toLowerCase(), product);
    });
  });
  
  // Convert map back to array
  const result = Array.from(productMap.values());
  console.log(`Combined ${result.length} unique products`);
  
  return result;
}
