"use client";

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Heart } from 'lucide-react';
import { useFavorites } from '@/context/FavoritesContext';
import { useAuth } from '@/context/AuthContext';
import { Header } from '@/components/Header';
import { Container } from '@/components/Container';

export default function FavoritesPage() {
  const { favorites, loading, removeFromFavorites } = useFavorites();
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <Container>
        <Header className="mb-12" />

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
      <Header className="mb-12" />

      <div className="mb-8">
        <h2 className="text-2xl font-semibold">Your Favorites</h2>
        <p className="text-muted-foreground">Items you've saved for later</p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-lg">Loading your favorites...</p>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {favorites.map((product) => (
            <Card key={product.id} className="relative flex flex-col border border-[#EEEEEE] hover:border-gray-300 transition-colors">
              <div className="relative">
                <img
                  src={product.image}
                  alt={product.title}
                  className="w-full h-64 object-cover"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 text-white bg-black/40 hover:bg-black/60"
                  onClick={() => removeFromFavorites(product.id)}
                >
                  <Heart className="h-5 w-5 fill-current" />
                </Button>
                <div className="absolute bottom-2 left-2 bg-black/60 text-white px-2 py-1 rounded text-xs">
                  {product.source}
                </div>
              </div>
              <CardHeader>
                <CardTitle className="text-sm font-medium leading-snug">{product.title}</CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  {product.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="mt-auto">
                <p className="text-sm font-semibold">{product.price}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {product.condition} • {product.time}
                </p>
                <a href={product.url} className="text-xs text-primary mt-2 block">
                  Click for details
                </a>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </Container>
  );
}
