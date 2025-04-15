import { Product } from './mock-data';

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
 * Combines results from multiple sources (mock data and scraped data)
 * 
 * @param mockProducts Products from mock data
 * @param scrapedProducts Array of product arrays from different scrapers
 * @returns Combined and deduplicated product array
 */
export function combineProductResults(
  mockProducts: Product[],
  ...scrapedProducts: Product[][]
): Product[] {
  // Create a map to track products by title for deduplication
  const productMap = new Map<string, Product>();
  
  // Add mock products to the map
  mockProducts.forEach(product => {
    productMap.set(product.title.toLowerCase(), product);
  });
  
  // Add all scraped products from all sources
  scrapedProducts.forEach(productArray => {
    productArray.forEach(product => {
      productMap.set(product.title.toLowerCase(), product);
    });
  });
  
  // Convert map back to array
  return Array.from(productMap.values());
}
