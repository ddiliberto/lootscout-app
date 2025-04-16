"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Heart, User } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useFavorites } from '@/context/FavoritesContext';
import { cn } from '@/lib/utils';

interface HeaderProps {
  className?: string;
}

export function Header({ className = '' }: HeaderProps) {
  const { isAuthenticated, signOut } = useAuth();
  const { favorites } = useFavorites();
  const pathname = usePathname();

  return (
    <div className="sticky top-4 z-50 mx-auto w-[90%] max-w-md bg-white/90 backdrop-blur-md rounded-[10px] shadow-xl">
      <header className={cn("flex flex-row items-center justify-between h-16 px-4", className)}>
        <Link href="/">
          <h1 className="text-xl font-semibold">LootScout</h1>
        </Link>
        <div className="flex items-center gap-4 text-xs">
          <Link href="/pricing" className="text-xs hover:text-gray-600 transition-colors">
            Pricing
          </Link>
          
          {isAuthenticated ? (
            <>
              <Link href="/favorites" className="text-xs hover:text-gray-600 transition-colors relative">
                Favorites
                {favorites.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[10px] rounded-full w-3 h-3 flex items-center justify-center">
                    {favorites.length}
                  </span>
                )}
              </Link>
              <button 
                onClick={() => signOut()} 
                className="text-xs hover:text-gray-600 transition-colors"
              >
                Sign Out
              </button>
            </>
          ) : (
            <Link href="/auth" className="text-xs hover:text-gray-600 transition-colors">
              Sign In
            </Link>
          )}
        </div>
      </header>
    </div>
  );
}
