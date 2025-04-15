
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
  ArrowUpDown,
  Filter,
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
import { fetchLukieGamesProducts, combineProductResults } from "@/lib/scraper";
import { useAuth } from "@/context/AuthContext";
import { useFavorites } from "@/context/FavoritesContext";
import { Header } from "@/components/Header";
import { Container } from "@/components/Container";
import { FilterModal } from "@/components/FilterModal";

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
  const [showFilterModal, setShowFilterModal] = useState(false);

  // Fetch products from LukieGames.com
  useEffect(() => {
    const fetchData = async () => {
      // Only fetch if there's a query
      if (query) {
        try {
          // Get the active platform filter if any
          const activePlatform = activePlatformFilters.length > 0 ? activePlatformFilters[0] : undefined;
          
          // Fetch products from LukieGames
          const lukieProducts = await fetchLukieGamesProducts(query, activePlatform);
          
          // Filter mock products based on query
          let mockResults = [...mockProducts];
          
          // Handle special keywords
          if (query.toLowerCase() === "trending") {
            // For trending, we'll just show all products
            mockResults = [...mockProducts];
          } else if (query.toLowerCase() === "under $50") {
            // Filter products under $50
            mockResults = mockResults.filter(product => 
              parseFloat(product.price.replace('$', '')) < 50
            );
          } else if (query.toLowerCase() === "sealed") {
            // Filter products that mention "sealed" in title or description
            mockResults = mockResults.filter(product => 
              product.title.toLowerCase().includes("sealed") || 
              product.description.toLowerCase().includes("sealed") ||
              product.description.toLowerCase().includes("complete in box")
            );
          } else if (query.toLowerCase() === "rare") {
            // Filter products that are considered rare (in this case, over $100)
            mockResults = mockResults.filter(product => 
              parseFloat(product.price.replace('$', '')) > 100
            );
          } else {
            // Regular search query
            mockResults = mockResults.filter(
              (product) =>
                product.title.toLowerCase().includes(query.toLowerCase()) ||
                product.description.toLowerCase().includes(query.toLowerCase())
            );
          }
          
          // Combine results from both sources
          let combinedResults = combineProductResults(mockResults, lukieProducts);
          
          // Apply additional filters
          applyFilters(combinedResults);
        } catch (error) {
          console.error("Error fetching products:", error);
          // Fall back to mock data only
          let results = [...mockProducts];
          
          // Apply query filter to mock data
          if (query) {
            // Regular search query
            results = results.filter(
              (product) =>
                product.title.toLowerCase().includes(query.toLowerCase()) ||
                product.description.toLowerCase().includes(query.toLowerCase())
            );
          }
          
          // Apply additional filters
          applyFilters(results);
        }
      } else {
        // No query, just use mock data
        applyFilters([...mockProducts]);
      }
    };
    
    fetchData();
  }, [query, activePlatformFilters, activeGenreFilters, activePriceFilters, activeSourceFilters]);
  
  // Apply filters to the product list
  const applyFilters = (results: Product[]) => {
    
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
  };
  
  // Apply sorting when sort order changes
  useEffect(() => {
    setFilteredProducts(prevProducts => {
      const sortedProducts = [...prevProducts];
      
      if (sortOrder === "price-asc") {
        sortedProducts.sort((a, b) => 
          parseFloat(a.price.replace('$', '')) - parseFloat(b.price.replace('$', ''))
        );
      } else if (sortOrder === "price-desc") {
        sortedProducts.sort((a, b) => 
          parseFloat(b.price.replace('$', '')) - parseFloat(a.price.replace('$', ''))
        );
      } else if (sortOrder === "newest") {
        sortedProducts.sort((a, b) => {
          if (a.time.includes("hour") && !b.time.includes("hour")) return -1;
          if (!a.time.includes("hour") && b.time.includes("hour")) return 1;
          if (a.time.includes("day") && b.time.includes("week")) return -1;
          if (a.time.includes("week") && b.time.includes("day")) return 1;
          return 0;
        });
      }
      
      return sortedProducts;
    });
  }, [sortOrder]);

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
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Combined header and filter section */}
      <div className="bg-white w-full sticky top-0 z-10 border-b shadow-sm">
        {/* Navigation header */}
        <div className="max-w-screen-lg mx-auto px-6 md:px-16 pb-0">
          <Header className="py-4" />
        </div>
        
        {/* Filter row - no top padding */}
        <div className="max-w-screen-lg mx-auto px-6 md:px-16 pt-0 pb-4">
        {/* Search Results Info */}
        <div className="flex justify-between items-center mb-2">
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
              onClick={() => setShowFilterModal(true)}
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

        {/* Display active filter count if any filters are applied */}
        {(activePlatformFilters.length > 0 || 
          activeGenreFilters.length > 0 || 
          activePriceFilters.length > 0 || 
          activeSourceFilters.length > 0) && (
          <div>
            <div className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
              {activePlatformFilters.length + activeGenreFilters.length + 
               activePriceFilters.length + activeSourceFilters.length} filters applied
            </div>
          </div>
        )}
        </div>
      </div>
      
      {/* Main Content Container */}
      <div className="max-w-screen-lg mx-auto px-6 md:px-16 py-6">
        {/* Filter Modal */}
        <FilterModal
          isOpen={showFilterModal}
          onClose={() => setShowFilterModal(false)}
          activePlatformFilters={activePlatformFilters}
          activeGenreFilters={activeGenreFilters}
          activePriceFilters={activePriceFilters}
          activeSourceFilters={activeSourceFilters}
          togglePlatformFilter={togglePlatformFilter}
          toggleGenreFilter={toggleGenreFilter}
          togglePriceFilter={togglePriceFilter}
          toggleSourceFilter={toggleSourceFilter}
          clearAllFilters={clearAllFilters}
        />

        {/* Search Results Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {filteredProducts.map((product) => (
          <Card key={product.id} className="relative flex flex-col border border-[#EEEEEE] hover:border-gray-300 transition-colors">
            <div className="relative">
              <img
                src={product.image}
                alt={product.title}
                className="w-full h-40 md:h-64 object-cover"
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
            <CardHeader className="p-3 md:p-6">
              <CardTitle className="text-xs md:text-sm font-medium leading-snug">{product.title}</CardTitle>
              <CardDescription className="text-xs text-muted-foreground line-clamp-2">
                {product.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="mt-auto p-3 md:p-6 pt-0 md:pt-0">
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
      
      {/* Floating Search Bar */}
      <div className="fixed bottom-4 left-0 right-0 z-10 px-4 md:px-16 max-w-screen-lg mx-auto">
        <form onSubmit={handleSearch} className="flex items-center gap-2 bg-white border border-[#EEEEEE] px-4 py-2 rounded-full shadow-lg">
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
    </div>
  );
}
