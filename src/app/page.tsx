"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { type TrendingProduct } from "@/lib/mock-data";
import { Container } from "@/components/Container";
import Link from "next/link";

// Sample trending searches
const trendingSearches = [
  "Grand Theft Auto IV",
  "Dark Souls II",
  "Nintendo 3DS",
  "Japanese Imports",
  "Legend of Zelda",
  "RPGs"
];

// Sample trending products
const trendingProducts: TrendingProduct[] = [
  {
    id: "gta-san-andreas",
    title: "Grand Theft Auto San Andreas",
    description: "PlayStation 2",
    price: "$24.99",
    source: "eBay",
    time: "2 hours ago",
    image: "/images/gta-san-andreas.jpg",
    condition: "Used",
    url: "/search?q=gta+san+andreas",
    searchCount: 1240
  },
  {
    id: "chrono-trigger",
    title: "Chrono Trigger",
    description: "Nintendo DS",
    price: "$89.99",
    source: "DKOldies",
    time: "3 hours ago",
    image: "/images/chrono-trigger-ds.jpg",
    condition: "Used",
    url: "/search?q=chrono+trigger+ds",
    searchCount: 980
  },
  {
    id: "seaman",
    title: "Seaman",
    description: "Dreamcast",
    price: "$45.99",
    source: "JJGames",
    time: "5 hours ago",
    image: "/images/seaman.jpg",
    condition: "Complete",
    url: "/search?q=seaman+dreamcast",
    searchCount: 875
  },
  {
    id: "red-dead-2",
    title: "Red Dead Redemption 2",
    description: "PlayStation 4",
    price: "$29.99",
    source: "VGNY",
    time: "6 hours ago",
    image: "/images/rdr2.jpg",
    condition: "Used",
    url: "/search?q=red+dead+redemption+2",
    searchCount: 760
  }
];

// Updated platform data with actual console images
const consoles = [
  { name: "Dreamcast", image: "/images/dreamcast.jpg", query: "dreamcast" },
  { name: "GameCube", image: "/images/gamecube.jpg", query: "gamecube" },
  { name: "PlayStation", image: "/images/playstation.jpg", query: "playstation" },
  { name: "XBOX", image: "/images/xbox.jpg", query: "xbox" },
  { name: "Nintendo64", image: "/images/n64.jpg", query: "n64" },
  { name: "Super Nintendo", image: "/images/snes.jpg", query: "snes" },
  { name: "Gameboy", image: "/images/gameboy.jpg", query: "gameboy" },
  { name: "XBOX 360", image: "/images/xbox360.jpg", query: "xbox-360" }
];

export default function LootScoutHomepage() {
  const [searchQuery, setSearchQuery] = useState("");

  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleTrendingSearch = (query: string) => {
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <Container>
      {/* Hero Section */}
      <section className="text-center max-w-2xl mx-auto mb-8">
        <h1 className="text-4xl font-light mb-4">
          Snipe Better Deals<br />on Used Games
        </h1>
        <p className="text-lg text-muted-foreground font-light mb-6">
          Search second hand sites in for used games, sealed copies,<br />and collector gold — before they disappear.
        </p>
        
        {/* Search Bar */}
        <form 
          onSubmit={handleSearch} 
          className="mx-auto w-full max-w-md flex items-center gap-2 bg-white/90 backdrop-blur-md px-4 py-3 rounded-[10px] shadow-xl mb-8"
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
      </section>

      {/* Trending Searches */}
      <section className="mb-12">
        <div className="flex flex-wrap justify-center gap-2">
          {trendingSearches.map((search) => (
            <button
              key={search}
              onClick={() => handleTrendingSearch(search)}
              className="px-4 py-1.5 bg-secondary rounded-full text-sm hover:bg-secondary/80 transition-colors font-light"
            >
              {search}
            </button>
          ))}
        </div>
      </section>

      {/* Trending Games */}
      <section className="mb-16">
        <h2 className="text-lg font-light mb-4 flex items-center">
          <Search className="w-4 h-4 mr-2" /> Trending Searches
        </h2>
        <div className="flex justify-center space-x-4 overflow-x-auto pb-4 -mx-4 px-4">
          {trendingProducts.map((product) => (
            <div key={product.id} className="relative flex-none w-[200px]">
              <Card className="overflow-hidden border-0 shadow-none bg-transparent hover:opacity-80 transition-opacity group">
                <button
                  onClick={() => handleTrendingSearch(product.title)}
                  className="absolute inset-0 w-full h-full z-0 cursor-pointer"
                  aria-label={`Search for ${product.title}`}
                />
                <img
                  src={product.image}
                  alt={product.title}
                  className="w-full h-[200px] object-cover rounded-[20px]"
                />
                <div className="p-3 text-center">
                  <h3 className="font-light text-sm">{product.title}</h3>
                </div>
              </Card>
            </div>
          ))}
        </div>
      </section>

      {/* Consoles Grid */}
      <section className="mb-16">
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
          {consoles.map((console) => (
            <button
              key={console.name}
              onClick={() => handleTrendingSearch(console.query)}
              className="block aspect-square relative overflow-hidden rounded-lg hover:opacity-90 transition-opacity"
            >
              <img
                src={console.image}
                alt={console.name}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="max-w-3xl mx-auto mb-20">
        <Link 
          href="/pricing" 
          className="inline-block w-full text-center hover:opacity-80 transition-opacity"
        >
          <h2 className="text-center text-2xl font-light mb-8">Upgrade</h2>
        </Link>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="border rounded-lg p-6 bg-white">
            <h3 className="text-xl font-light mb-4">Free</h3>
            <ul className="space-y-2 mb-6">
              <li className="flex items-center gap-2 font-light">
                <Search className="w-4 h-4" /> 5 Searches/day
              </li>
              <li className="flex items-center gap-2 font-light">
                <Search className="w-4 h-4" /> 1 saved alert
              </li>
              <li className="flex items-center gap-2 font-light">
                <Search className="w-4 h-4" /> 10 favorites
              </li>
              <li className="flex items-center gap-2 font-light">
                <Search className="w-4 h-4" /> Trending games feed
              </li>
            </ul>
            <div className="text-2xl font-light mb-4">Free</div>
            <Button variant="outline" className="w-full font-light">Search</Button>
          </div>
          <div className="border rounded-lg p-6 bg-white border-primary">
            <h3 className="text-xl font-light mb-4">Pro</h3>
            <ul className="space-y-2 mb-6">
              <li className="flex items-center gap-2 font-light">
                <Search className="w-4 h-4" /> Unlimited searches & alerts
              </li>
              <li className="flex items-center gap-2 font-light">
                <Search className="w-4 h-4" /> Instant price drop notifications
              </li>
              <li className="flex items-center gap-2 font-light">
                <Search className="w-4 h-4" /> Portfolio value tracking
              </li>
              <li className="flex items-center gap-2 font-light">
                <Search className="w-4 h-4" /> Advanced filters
              </li>
            </ul>
            <div className="text-2xl font-light mb-4">$5.99<span className="text-base font-light">/mo</span></div>
            <Button className="w-full font-light">Go Pro</Button>
          </div>
        </div>
      </section>
    </Container>
  );
}
