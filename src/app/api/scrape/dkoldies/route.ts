import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execPromise = promisify(exec);

export async function GET(request: NextRequest) {
  try {
    // Get search parameters
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');
    const platform = searchParams.get('platform');
    
    if (!query) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      );
    }
    
    // Activate virtual environment and run the Python script
    const scriptPath = path.join(process.cwd(), 'scripts', 'scrape_dkoldies.py');
    const venvPath = path.join(process.cwd(), 'venv', 'bin', 'activate');
    
    let command = `source ${venvPath} && python3 "${scriptPath}" --query "${query}"`;
    
    // Add platform filter if provided
    if (platform) {
      command += ` --platform "${platform}"`;
    }
    
    // Add max results limit
    command += ' --max_results 16';
    
    // Execute the Python script
    const { stdout, stderr } = await execPromise(command, { shell: '/bin/zsh' });
    
    if (stderr) {
      console.error('DKOldies scraper stderr:', stderr);
    }
    
    // Parse the JSON output from the script
    const products = JSON.parse(stdout);
    
    // Return the products as JSON
    return NextResponse.json(products);
  } catch (error) {
    console.error('Error in DKOldies scraper API route:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products from DKOldies' },
      { status: 500 }
    );
  }
}
