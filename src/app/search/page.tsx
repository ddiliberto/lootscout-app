"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
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
  ArrowUpDown,
  Filter,
  Gamepad2,
  DollarSign,
  X,
} from "lucide-react";
import Link from "next/link";
import { 
  mockProducts, 
  platformFilters, 
  genreFilters, 
  priceFilters, 
  sourceFilters,
  placeholderImage,
  type Product
} from "@/lib/mock-data";
import { useAuth } from "@/context/AuthContext";
import { useFavorites } from "@/context/FavoritesContext";
import { Header } from "@/components/Header";

export default function SearchPage() {
  const { isAuthenticated } = useAuth();
  const { isFavorited, addToFavorites, removeFromFavorites } = useFavorites();
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const [searchQuery, setSearchQuery] = useState(query);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(mockProducts);
  const [activePlatformFilters, setActivePlatformFilters] = useState<string[]>([]);
  const [activeGenreFilters, setActiveGenreFilters] = useState<string[]>([]);
  const [activePriceFilters, setActivePriceFilters] = useState<string[]>([]);
  const [activeSourceFilters, setActiveSourceFilters] = useState<string[]>([]);
  const [sortOrder, setSortOrder] = useState<"price-asc" | "price-desc" | "newest">("newest");
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  // Filter products based on search query and active filters
  useEffect(() => {
    let results = [...mockProducts];
    
    // Filter by search query
    if (query) {
      // Handle special keywords
      if (query.toLowerCase() === "trending") {
        // For trending, we'll just show all products (in a real app, this would be based on popularity)
        results = [...mockProducts];
      } else if (query.toLowerCase() === "under $50") {
        // Filter products under $50
        results = results.filter(product => 
          parseFloat(product.price.replace('$', '')) < 50
        );
      } else if (query.toLowerCase() === "sealed") {
        // Filter products that mention "sealed" in title or description
        results = results.filter(product => 
          product.title.toLowerCase().includes("sealed") || 
          product.description.toLowerCase().includes("sealed") ||
          product.description.toLowerCase().includes("complete in box")
        );
      } else if (query.toLowerCase() === "rare") {
        // Filter products that are considered rare (in this case, over $100)
        results = results.filter(product => 
          parseFloat(product.price.replace('$', '')) > 100
        );
      } else {
        // Regular search query
        results = results.filter(
          (product) =>
            product.title.toLowerCase().includes(query.toLowerCase()) ||
            product.description.toLowerCase().includes(query.toLowerCase())
        );
      }
    }
    
    // Apply platform filters
    if (activePlatformFilters.length > 0) {
      results = results.filter((product) => 
        activePlatformFilters.some(filter => 
          product.platform?.toLowerCase() === filter.toLowerCase() ||
          product.title.toLowerCase().includes(filter.toLowerCase())
        )
      );
    }
    
    // Apply genre filters
    if (activeGenreFilters.length > 0) {
      results = results.filter((product) => 
        activeGenreFilters.some(filter => 
          product.genre?.toLowerCase() === filter.toLowerCase() ||
          product.title.toLowerCase().includes(filter.toLowerCase())
        )
      );
    }
    
    // Apply price filters
    if (activePriceFilters.length > 0) {
      results = results.filter((product) => {
        const price = parseFloat(product.price.replace('$', ''));
        return activePriceFilters.some(filter => {
          if (filter === "under-25") return price < 25;
          if (filter === "under-50") return price < 50;
          if (filter === "under-100") return price < 100;
          if (filter === "over-100") return price >= 100;
          return false;
        });
      });
    }
    
    // Apply source filters
    if (activeSourceFilters.length > 0) {
      results = results.filter((product) => 
        activeSourceFilters.some(filter => 
          product.source.toLowerCase() === filter.toLowerCase()
        )
      );
    }
    
    // Apply sorting
    if (sortOrder === "price-asc") {
      results.sort((a, b) => 
        parseFloat(a.price.replace('$', '')) - parseFloat(b.price.replace('$', ''))
      );
    } else if (sortOrder === "price-desc") {
      results.sort((a, b) => 
        parseFloat(b.price.replace('$', '')) - parseFloat(a.price.replace('$', ''))
      );
    } else if (sortOrder === "newest") {
      // This is a simplified version since we don't have real timestamps
      // In a real app, you'd sort by actual date
      results.sort((a, b) => {
        if (a.time.includes("hour") && !b.time.includes("hour")) return -1;
        if (!a.time.includes("hour") && b.time.includes("hour")) return 1;
        if (a.time.includes("day") && b.time.includes("week")) return -1;
        if (a.time.includes("week") && b.time.includes("day")) return 1;
        return 0;
      });
    }
    
    setFilteredProducts(results);
  }, [query, activePlatformFilters, activeGenreFilters, activePriceFilters, activeSourceFilters, sortOrder]);

  // Handle search form submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Update URL with search query
    window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
  };

  // Toggle platform filter
  const togglePlatformFilter = (filter: string) => {
    setActivePlatformFilters((prev) =>
      prev.includes(filter)
        ? prev.filter((f) => f !== filter)
        : [...prev, filter]
    );
  };
  
  // Toggle genre filter
  const toggleGenreFilter = (filter: string) => {
    setActiveGenreFilters((prev) =>
      prev.includes(filter)
        ? prev.filter((f) => f !== filter)
        : [...prev, filter]
    );
  };
  
  // Toggle price filter
  const togglePriceFilter = (filter: string) => {
    setActivePriceFilters((prev) =>
      prev.includes(filter)
        ? prev.filter((f) => f !== filter)
        : [...prev, filter]
    );
  };
  
  // Toggle source filter
  const toggleSourceFilter = (filter: string) => {
    setActiveSourceFilters((prev) =>
      prev.includes(filter)
        ? prev.filter((f) => f !== filter)
        : [...prev, filter]
    );
  };
  
  // Clear all filters
  const clearAllFilters = () => {
    setActivePlatformFilters([]);
    setActiveGenreFilters([]);
    setActivePriceFilters([]);
    setActiveSourceFilters([]);
  };

  return (
    <div className="min-h-screen bg-white px-6 py-12 md:px-16">
      <Header />

      {/* Search Bar */}
      <div className="mb-8">
        <form onSubmit={handleSearch} className="flex items-center gap-2 bg-muted px-4 py-2 rounded-full">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search for retro games..."
            className="border-none bg-transparent text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Button type="submit" variant="ghost" size="icon">
            <Search className="h-4 w-4" />
          </Button>
        </form>
      </div>

      {/* Search Results Info */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold">
          {query ? `Results for "${query}"` : "All Results"}
          <span className="text-sm font-normal text-muted-foreground ml-2">
            ({filteredProducts.length} items)
          </span>
        </h2>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-1"
            onClick={() => setShowFilterMenu(!showFilterMenu)}
          >
            <Filter className="h-4 w-4" />
            Filter
          </Button>
          <div className="relative">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-1"
              onClick={() => {
                if (sortOrder === "newest") setSortOrder("price-asc");
                else if (sortOrder === "price-asc") setSortOrder("price-desc");
                else setSortOrder("newest");
              }}
            >
              <ArrowUpDown className="h-4 w-4" />
              {sortOrder === "newest" ? "Newest" : 
               sortOrder === "price-asc" ? "Price: Low to High" : 
               "Price: High to Low"}
            </Button>
          </div>
        </div>
      </div>

      {/* Active Filters */}
      {(activePlatformFilters.length > 0 || 
        activeGenreFilters.length > 0 || 
        activePriceFilters.length > 0 || 
        activeSourceFilters.length > 0) && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium">Active Filters:</h3>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearAllFilters}
              className="text-xs"
            >
              Clear All
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {activePlatformFilters.map((filter) => {
              const platformFilter = platformFilters.find(f => f.query === filter);
              return (
                <Button
                  key={filter}
                  variant="default"
                  size="sm"
                  onClick={() => togglePlatformFilter(filter)}
                  className="flex items-center gap-1 bg-primary/80"
                >
                  {platformFilter?.name}
                  <X className="w-3 h-3 ml-1" />
                </Button>
              );
            })}
            {activeGenreFilters.map((filter) => {
              const genreFilter = genreFilters.find(f => f.query === filter);
              return (
                <Button
                  key={filter}
                  variant="default"
                  size="sm"
                  onClick={() => toggleGenreFilter(filter)}
                  className="flex items-center gap-1 bg-primary/80"
                >
                  {genreFilter?.name}
                  <X className="w-3 h-3 ml-1" />
                </Button>
              );
            })}
            {activePriceFilters.map((filter) => {
              const priceFilter = priceFilters.find(f => f.query === filter);
              return (
                <Button
                  key={filter}
                  variant="default"
                  size="sm"
                  onClick={() => togglePriceFilter(filter)}
                  className="flex items-center gap-1 bg-primary/80"
                >
                  {priceFilter?.name}
                  <X className="w-3 h-3 ml-1" />
                </Button>
              );
            })}
            {activeSourceFilters.map((filter) => {
              const sourceFilter = sourceFilters.find(f => f.query === filter);
              return (
                <Button
                  key={filter}
                  variant="default"
                  size="sm"
                  onClick={() => toggleSourceFilter(filter)}
                  className="flex items-center gap-1 bg-primary/80"
                >
                  {sourceFilter?.name}
                  <X className="w-3 h-3 ml-1" />
                </Button>
              );
            })}
          </div>
        </div>
      )}

      {/* Platform Filter Pills */}
      <div className="flex flex-wrap gap-2 mb-6">
        {platformFilters.map((filter) => (
          <Button
            key={filter.query}
            variant={activePlatformFilters.includes(filter.query) ? "default" : "outline"}
            size="sm"
            onClick={() => togglePlatformFilter(filter.query)}
            className="flex items-center gap-1"
          >
            {filter.query === "ps1" && <Gamepad className="w-4 h-4 mr-1" />}
            {filter.query === "snes" && <Tv className="w-4 h-4 mr-1" />}
            {filter.query === "n64" && <Gamepad2 className="w-4 h-4 mr-1" />}
            {filter.query === "game boy" && <MonitorSmartphone className="w-4 h-4 mr-1" />}
            {filter.query === "genesis" && <Gamepad className="w-4 h-4 mr-1" />}
            {filter.name}
          </Button>
        ))}
      </div>
      
      {/* Filter Menu */}
      {showFilterMenu && (
        <div className="mb-6 p-4 border rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h3 className="text-sm font-semibold mb-2">Genre</h3>
              <div className="flex flex-col gap-2">
                {genreFilters.map((filter) => (
                  <Button
                    key={filter.query}
                    variant={activeGenreFilters.includes(filter.query) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleGenreFilter(filter.query)}
                    className="justify-start"
                  >
                    {filter.name}
                  </Button>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold mb-2">Price</h3>
              <div className="flex flex-col gap-2">
                {priceFilters.map((filter) => (
                  <Button
                    key={filter.query}
                    variant={activePriceFilters.includes(filter.query) ? "default" : "outline"}
                    size="sm"
                    onClick={() => togglePriceFilter(filter.query)}
                    className="justify-start"
                  >
                    {filter.name}
                  </Button>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold mb-2">Source</h3>
              <div className="flex flex-col gap-2">
                {sourceFilters.map((filter) => (
                  <Button
                    key={filter.query}
                    variant={activeSourceFilters.includes(filter.query) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleSourceFilter(filter.query)}
                    className="justify-start"
                  >
                    {filter.name}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search Results Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <Card key={product.id} className="relative flex flex-col hover:shadow-md transition-shadow">
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
                onClick={() => {
                  if (isAuthenticated) {
                    if (isFavorited(product.id)) {
                      removeFromFavorites(product.id);
                    } else {
                      addToFavorites(product);
                    }
                  } else {
                    // Redirect to auth page if not authenticated
                    window.location.href = '/auth';
                  }
                }}
              >
                <Heart className={`h-5 w-5 ${isFavorited(product.id) ? 'fill-current' : ''}`} />
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

      {/* No Results */}
      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-lg font-medium">No results found</p>
          <p className="text-muted-foreground">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
}
