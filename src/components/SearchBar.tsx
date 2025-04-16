"use client";

import React, { useState } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

export function SearchBar() {
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const router = useRouter();
  const pathname = usePathname();
  
  // Hide the search bar on the homepage and pricing page
  const hiddenPages = ['/', '/pricing'];
  if (hiddenPages.includes(pathname)) {
    return null;
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <form 
      onSubmit={handleSearch} 
      className="fixed bottom-4 left-0 right-0 z-50 mx-auto w-[90%] max-w-md flex items-center gap-2 bg-white/90 backdrop-blur-md px-4 py-3 rounded-[10px] shadow-xl"
    >
      <Input
        type="text"
        placeholder="Search games, e.g. 'EarthBound SNES'"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="border-none bg-transparent text-sm focus-visible:ring-0 focus-visible:ring-offset-0 flex-1 min-w-0"
      />
      <Button type="submit" variant="ghost" size="icon" className="p-1">
        <Search className="h-4 w-4" />
      </Button>
    </form>
  );
}
