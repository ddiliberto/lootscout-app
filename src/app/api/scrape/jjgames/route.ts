import { NextRequest, NextResponse } from 'next/server';
import { PythonShell, Options } from 'python-shell';
import path from 'path';
import { Product } from '@/lib/mock-data';

// Cache for storing search results to reduce scraping frequency
const CACHE_DURATION = 1000 * 60 * 15; // 15 minutes
const cache: Record<string, { data: Product[], timestamp: number }> = {};

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
      console.log('Returning cached results for:', cacheKey);
      return NextResponse.json(cache[cacheKey].data);
    }
    
    // Set up Python script options
    const scriptPath = path.join(process.cwd(), 'scripts', 'scrape_jjgames.py');
    const options: Options = {
      mode: 'text' as const,
      pythonOptions: ['-u'], // unbuffered output
      args: [
        '--query', query,
        ...(platform ? ['--platform', platform] : []),
        '--max_results', '16',
        '--debug'
      ]
    };
    
    console.log('Scraping JJGames.com for:', query, platform ? `(platform: ${platform})` : '');
    
    // Run the Python script with a timeout
    const results = await Promise.race([
      new Promise<Product[]>((resolve, reject) => {
        PythonShell.run(scriptPath, options)
          .then((results: string[]) => {
            if (!results || results.length === 0) {
              console.log('No results returned from Python script');
              return resolve([]);
            }
            
            try {
              // Parse the JSON output from the Python script
              const products = JSON.parse(results[0]) as Product[];
              console.log(`Successfully parsed ${products.length} products from JJGames`);
              resolve(products);
            } catch (e) {
              console.error('Error parsing Python script output:', e);
              reject(e);
            }
          })
          .catch((err: Error) => {
            console.error('Error running Python script:', err);
            reject(err);
          });
      }),
      // Add a timeout of 30 seconds (reduced from 120 seconds)
      new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Scraping timeout')), 30000)
      )
    ]);
    
    // Update cache
    cache[cacheKey] = {
      data: results,
      timestamp: now
    };
    
    // Return the results
    return NextResponse.json(results);
    
  } catch (error) {
    console.error('API route error:', error);
    
    // Return a more specific error message
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { 
        error: 'Failed to scrape JJGames.com',
        details: errorMessage,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
