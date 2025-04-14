import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Heart, User } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useFavorites } from '@/context/FavoritesContext';

export function Header() {
  const { isAuthenticated, signOut } = useAuth();
  const { favorites } = useFavorites();

  return (
    <div className="flex justify-between items-center mb-12">
      <Link href="/">
        <h1 className="text-xl font-semibold">LootScout</h1>
      </Link>
      <div className="flex items-center gap-4">
        <Button variant="ghost" className="text-sm" asChild>
          <Link href="/pricing">Pricing</Link>
        </Button>
        
        {isAuthenticated ? (
          <>
            <Button variant="ghost" className="text-sm relative" asChild>
              <Link href="/favorites">
                <Heart className="w-4 h-4 mr-1" />
                Favorites
                {favorites.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    {favorites.length}
                  </span>
                )}
              </Link>
            </Button>
            <Button variant="outline" size="sm" onClick={() => signOut()}>
              <User className="w-4 h-4 mr-1" />
              Sign Out
            </Button>
          </>
        ) : (
          <Button variant="default" size="sm" asChild>
            <Link href="/auth">Sign In</Link>
          </Button>
        )}
      </div>
    </div>
  );
}
