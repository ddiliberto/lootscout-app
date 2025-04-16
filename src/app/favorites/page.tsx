"use client";

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Heart } from 'lucide-react';
import { useFavorites } from '@/context/FavoritesContext';
import { useAuth } from '@/context/AuthContext';
import { Container } from '@/components/Container';

export default function FavoritesPage() {
  const { favorites, loading, removeFromFavorites } = useFavorites();
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <Container>
        <div className="text-center max-w-xl mx-auto mt-16">
          <h2 className="text-3xl md:text-4xl font-semibold mb-4">Sign in to view your favorites</h2>
          <p className="text-muted-foreground mb-6">Create an account or sign in to save and view your favorite listings.</p>
          <Button variant="default" size="lg" asChild>
            <Link href="/auth">Sign In</Link>
          </Button>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className="mb-8">
        <h2 className="text-2xl font-semibold">Your Favorites</h2>
        <p className="text-muted-foreground">Items you've saved for later</p>
      </div>

      {loading ? (
        <div className="flex flex-col sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex flex-row sm:flex-col mb-2 sm:mb-0">
              <div className="w-1/3 sm:w-full flex-shrink-0">
                <div className="h-20 sm:h-64 bg-gray-100 rounded-[20px]" />
              </div>
              <div className="flex-1 pl-3 sm:pl-0 sm:mt-3 space-y-1 sm:space-y-2">
                <div className="h-4 w-1/2 bg-gray-100 rounded" />
                <div className="h-3 w-3/4 bg-gray-100 rounded" />
                <div className="h-3 w-1/4 bg-gray-100 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : favorites.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium mb-2">No favorites yet</h3>
          <p className="text-muted-foreground mb-6">Start browsing and save items you're interested in.</p>
          <Link href="/">
            <Button variant="default">Browse Games</Button>
          </Link>
        </div>
      ) : (
        <div className="flex flex-col sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-6">
          {/* Favorites are already sorted by newest first from the Supabase query */}
          {favorites.map((product) => (
            <Card key={product.id} className="flex flex-row sm:flex-col border-0 shadow-none bg-transparent mb-2 sm:mb-0 relative group hover:opacity-95 transition-opacity">
              {/* Make entire card clickable */}
              <a 
                href={product.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="absolute inset-0 z-0"
                aria-label={`View details for ${product.title}`}
              />
              
              {/* Mobile: Left image, desktop: top image */}
              <div className="w-1/3 sm:w-full flex-shrink-0">
                <div className="bg-white rounded-[20px] p-2 sm:p-8 h-full flex items-center justify-center">
                  <img
                    src={product.image}
                    alt={product.title}
                    className="w-full h-20 sm:h-48 object-contain"
                  />
                </div>
              </div>
              
              {/* Content section */}
              <div className="flex-1 pl-3 sm:pl-0 sm:mt-3 flex flex-col justify-between py-0.5">
                <div>
                  <div className="flex items-center justify-between mb-0.5">
                    <div className="font-light text-base sm:text-base">{product.price}</div>
                    <div className="text-gray-500 text-xs">{product.source}</div>
                  </div>
                  <h2 className="text-xs sm:text-sm font-light mb-0.5 line-clamp-2 sm:line-clamp-none">{product.title}</h2>
                  <div className="hidden sm:flex sm:items-center sm:gap-2 sm:mt-2">
                    <span className="px-2 py-1 bg-secondary rounded-full text-xs font-light">
                      {product.source}
                    </span>
                    {product.platform && (
                      <span className="px-2 py-1 bg-secondary rounded-full text-xs font-light">
                        {product.platform}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Remove from favorites button - positioned top-left on mobile, top-right on desktop */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  removeFromFavorites(product.id);
                }}
                className="absolute top-2 left-2 sm:left-auto sm:right-2 p-2 bg-black rounded-full hover:bg-black/80 transition-colors z-10"
              >
                <Heart className="h-4 w-4 text-white" />
              </button>
            </Card>
          ))}
        </div>
      )}
    </Container>
  );
}
