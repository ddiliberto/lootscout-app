import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { addFavorite, getFavorites, isFavorite, removeFavorite } from '@/lib/supabase';
import { Product } from '@/lib/mock-data';

type FavoritesContextType = {
  favorites: Product[];
  loading: boolean;
  addToFavorites: (product: Product) => Promise<void>;
  removeFromFavorites: (productId: string) => Promise<void>;
  isFavorited: (productId: string) => boolean;
  refreshFavorites: () => Promise<void>;
};

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuth();
  const [favorites, setFavorites] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Load favorites when auth state changes
  useEffect(() => {
    if (isAuthenticated) {
      loadFavorites();
    } else {
      // If not authenticated, clear favorites
      setFavorites([]);
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  const loadFavorites = async () => {
    setLoading(true);
    try {
      const result = await getFavorites();
      if ('error' in result && result.error) {
        console.error('Error loading favorites:', result.error);
        setFavorites([]);
      } else if ('data' in result && result.data) {
        // Extract product_data from each favorite
        const favoriteProducts = result.data.map((fav: any) => fav.product_data);
        setFavorites(favoriteProducts);
      } else {
        setFavorites([]);
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  };

  const addToFavorites = async (product: Product) => {
    if (!isAuthenticated) {
      // Handle unauthenticated users
      alert('Please sign in to save favorites');
      return;
    }

    try {
      const result = await addFavorite(product);
      if ('error' in result && result.error) {
        console.error('Error adding favorite:', result.error);
      } else {
        // Update local state
        setFavorites((prev) => [...prev, product]);
      }
    } catch (error) {
      console.error('Error adding favorite:', error);
    }
  };

  const removeFromFavorites = async (productId: string) => {
    if (!isAuthenticated) return;

    try {
      const result = await removeFavorite(productId);
      if ('error' in result && result.error) {
        console.error('Error removing favorite:', result.error);
      } else {
        // Update local state
        setFavorites((prev) => prev.filter((product) => product.id !== productId));
      }
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  };

  const isFavorited = (productId: string) => {
    return favorites.some((product) => product.id === productId);
  };

  const refreshFavorites = async () => {
    if (isAuthenticated) {
      await loadFavorites();
    }
  };

  const value = {
    favorites,
    loading,
    addToFavorites,
    removeFromFavorites,
    isFavorited,
    refreshFavorites,
  };

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
}
