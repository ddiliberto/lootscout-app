"use client";

import React from 'react';
import { ThemeProvider } from 'next-themes';
import { AuthProvider } from '@/context/AuthContext';
import { FavoritesProvider } from '@/context/FavoritesContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      storageKey="lootscout-theme"
    >
      <AuthProvider>
        <FavoritesProvider>
          {children}
        </FavoritesProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
