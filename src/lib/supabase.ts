import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper functions for favorites
export async function addFavorite(productData: any) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };
  
  return supabase.from('favorites').insert({
    user_id: user.id,
    product_id: productData.id,
    product_data: productData
  });
}

export async function removeFavorite(productId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };
  
  return supabase
    .from('favorites')
    .delete()
    .eq('user_id', user.id)
    .eq('product_id', productId);
}

export async function getFavorites() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: [] };
  
  return supabase
    .from('favorites')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });
}

export async function isFavorite(productId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: false };
  
  const { data, error } = await supabase
    .from('favorites')
    .select('id')
    .eq('user_id', user.id)
    .eq('product_id', productId)
    .single();
  
  return { data: !!data, error };
}
