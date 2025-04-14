"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Search,
  Heart,
  Gamepad,
  MonitorSmartphone,
  Tv,
  Rocket,
  Gamepad2,
  DollarSign,
} from "lucide-react";
import { 
  trendingProducts, 
  communityPicks, 
  inspirationCategories,
  platformFilters,
  genreFilters,
  placeholderImage
} from "@/lib/mock-data";

export default function LootScoutHomepage() {
  const handleFilterClick = (query: string) => {
    window.location.href = `/search?q=${encodeURIComponent(query)}`;
  };
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const searchInput = document.querySelector('input') as HTMLInputElement;
    if (searchInput && searchInput.value.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchInput.value.trim())}`;
    }
  };
  
  return (
    <div className="min-h-screen bg-white px-6 py-12 md:px-16">
      <div className="flex justify-between items-center mb-12">
        <h1 className="text-xl font-semibold">LootScout</h1>
        <div className="flex items-center gap-4">
          <Button variant="ghost" className="text-sm">Pricing</Button>
          <Button variant="ghost" className="text-sm">Community</Button>
          <Button variant="default" size="sm">Sign Up</Button>
        </div>
      </div>

      <div className="text-center max-w-xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-semibold mb-4">What game are you hunting for?</h2>
        <p className="text-muted-foreground mb-6">Track and discover rare retro games across the web.</p>
        <form onSubmit={handleSearch} className="flex items-center gap-2 bg-muted px-4 py-2 rounded-full">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Try 'sealed EarthBound SNES' or 'Castlevania PS1'"
            className="border-none bg-transparent text-sm"
          />
          <Button type="submit" variant="ghost" size="icon">
            <Search className="h-4 w-4" />
          </Button>
        </form>

        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <Button variant="outline" size="sm" onClick={() => handleFilterClick("trending")}>Trending Games</Button>
          <Button variant="outline" size="sm" onClick={() => handleFilterClick("under $50")}>Under $50</Button>
          <Button variant="outline" size="sm" onClick={() => handleFilterClick("sealed")}>Sealed Only</Button>
          <Button variant="outline" size="sm" onClick={() => handleFilterClick("rare")}>Show Me Rare Finds</Button>
        </div>
      </div>

      <div className="mt-16">
        <h3 className="text-lg font-semibold mb-4">Trending This Week</h3>
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-muted rounded">
          {trendingProducts.map((product, index) => (
            <Card key={index} className="relative min-w-[250px] max-w-[300px] flex-shrink-0 hover:shadow-md transition-shadow">
              <img
                src={product.image || placeholderImage}
                alt={product.title}
                className="w-full h-64 object-cover"
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 text-white bg-black/40 hover:bg-black/60"
              >
                <Heart className="h-5 w-5" />
              </Button>
              <CardHeader>
                <CardTitle className="text-sm font-medium leading-snug">{product.title}</CardTitle>
                <CardDescription className="text-xs text-muted-foreground">{product.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm font-semibold">{product.price}</p>
                <p className="text-xs text-muted-foreground mt-1">{product.source} • {product.time}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="mt-16">
        <h3 className="text-lg font-semibold mb-4">Inspiration Filters</h3>
        <div className="flex flex-wrap justify-center gap-2">
          {[...platformFilters, ...genreFilters.slice(0, 2)].map((filter, idx) => (
            <Button
              key={idx}
              variant="outline"
              size="sm"
              onClick={() => handleFilterClick(filter.query)}
              className="flex items-center gap-1 transition-transform hover:scale-105"
            >
              {filter.query === "ps1" && <Gamepad className="w-4 h-4 mr-1" />}
              {filter.query === "snes" && <Tv className="w-4 h-4 mr-1" />}
              {filter.query === "n64" && <Gamepad2 className="w-4 h-4 mr-1" />}
              {filter.query === "game boy" && <MonitorSmartphone className="w-4 h-4 mr-1" />}
              {filter.query === "genesis" && <Gamepad className="w-4 h-4 mr-1" />}
              {filter.query === "rpg" && <Rocket className="w-4 h-4 mr-1" />}
              {filter.query === "fighting" && <Gamepad2 className="w-4 h-4 mr-1" />}
              {filter.name}
            </Button>
          ))}
        </div>
      </div>

      <div className="mt-16">
        <h3 className="text-lg font-semibold mb-4">Community Spotlight</h3>
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-muted rounded">
          {communityPicks.map((member, idx) => (
            <div key={idx} className="text-center min-w-[250px] max-w-[300px] flex-shrink-0">
              <img src={member.image} alt={member.name} className="rounded-xl w-full h-64 object-cover mb-2" />
              <p className="text-sm font-medium lowercase">{member.name}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-16">
        <h3 className="text-lg font-semibold mb-4">Inspiration</h3>
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-muted rounded">
          {inspirationCategories.map((cat, idx) => (
            <div
              key={idx}
              onClick={() => handleFilterClick(cat.name)}
              className="text-center min-w-[250px] max-w-[300px] flex-shrink-0 cursor-pointer hover:scale-105 transition-transform"
            >
              <img src={cat.image} alt={cat.name} className="rounded-xl w-full h-64 object-cover mb-2" />
              <p className="text-sm font-medium lowercase">{cat.name}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
