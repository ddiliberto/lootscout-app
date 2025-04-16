import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET() {
  // 1. Manual trending from 'trending' table
  const { data: manualRows, error: manualError } = await supabase
    .from('trending')
    .select('product_id, sort_order')
    .order('sort_order', { ascending: true });

  if (manualError) return NextResponse.json({ error: manualError.message }, { status: 500 });

  const manualIds = manualRows?.map(row => row.product_id) || [];

  // 2. Fetch product details for manual trending
  const { data: manualProducts, error: manualProductsError } = await supabase
    .from('products')
    .select('*')
    .in('id', manualIds);

  if (manualProductsError) return NextResponse.json({ error: manualProductsError.message }, { status: 500 });

  // 3. Auto trending: most favorited in last 7 days
  const { data: autoRows, error: autoError } = await supabase
    .from('favorites')
    .select('product_id, count:product_id')
    .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
    .group('product_id')
    .order('count', { ascending: false })
    .limit(12);

  if (autoError) return NextResponse.json({ error: autoError.message }, { status: 500 });

  const autoIds = autoRows
    ?.map(row => row.product_id)
    .filter(id => !manualIds.includes(id)) || [];

  // 4. Fetch product details for auto trending
  const { data: autoProducts, error: autoProductsError } = await supabase
    .from('products')
    .select('*')
    .in('id', autoIds);

  if (autoProductsError) return NextResponse.json({ error: autoProductsError.message }, { status: 500 });

  // 5. Combine, manual first, then auto
  const combined = [
    ...(manualProducts || []),
    ...(autoProducts || [])
  ];

  return NextResponse.json(combined);
} 