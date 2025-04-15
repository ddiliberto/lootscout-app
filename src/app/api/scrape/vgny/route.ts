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
    const scriptPath = path.join(process.cwd(), 'scripts', 'scrape_vgny.py');
    const options: Options = {
      mode: 'text' as const,
      pythonOptions: ['-u'], // unbuffered output
      args: [
        '--query', query,
        ...(platform ? ['--platform', platform] : []),
        '--max_results', '16'
      ]
    };
    
    console.log('Scraping VideoGamesNewYork.com for:', query, platform ? `(platform: ${platform})` : '');
    
    // Run the Python script
    const results = await new Promise<Product[]>((resolve, reject) => {
      PythonShell.run(scriptPath, options)
        .then((results: string[]) => {
          if (!results || results.length === 0) {
            return resolve([]);
          }
          
          try {
            // Parse the JSON output from the Python script
            const products = JSON.parse(results[0]) as Product[];
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
    });
    
    // Update cache
    cache[cacheKey] = {
      data: results,
      timestamp: now
    };
    
    // Return the results
    return NextResponse.json(results);
    
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json(
      { error: 'Failed to scrape VideoGamesNewYork.com' },
      { status: 500 }
    );
  }
}
