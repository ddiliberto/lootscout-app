"use client";

import { useSearchParams, useRouter } from "next/navigation";
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
import { 
  fetchLukieGamesProducts, 
  fetchVGNYProducts, 
  fetchJJGamesProducts, 
  fetchDKOldiesProducts, 
  fetchEbayProducts,
  combineProductResults 
} from "@/lib/scraper";
import { useAuth } from "@/context/AuthContext";
import { useFavorites } from "@/context/FavoritesContext";
import { Container } from "@/components/Container";
import { FilterModal } from "@/components/FilterModal";
import { Spinner } from "@/components/ui/spinner";
import { Toaster, toast } from "sonner";
import { cn } from "@/lib/utils";

export default function SearchPage() {
  const { isAuthenticated } = useAuth();
  const { isFavorited: checkIsFavorited, addToFavorites, removeFromFavorites } = useFavorites();
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const [searchQuery, setSearchQuery] = useState(query);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(mockProducts);
  const [displayedProducts, setDisplayedProducts] = useState<Product[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 12;
  const [activePlatformFilters, setActivePlatformFilters] = useState<string[]>([]);
  const [activeGenreFilters, setActiveGenreFilters] = useState<string[]>([]);
  const [activePriceFilters, setActivePriceFilters] = useState<string[]>([]);
  const [activeSourceFilters, setActiveSourceFilters] = useState<string[]>([]);
  const [sortOrder, setSortOrder] = useState<"price-asc" | "price-desc" | "newest">("price-asc");
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch products from all sources
  useEffect(() => {
    const fetchData = async () => {
      // Only fetch if there's a query
      if (query) {
        setIsLoading(true);
        try {
          // Get the active platform filter if any
          const activePlatform = activePlatformFilters.length > 0 ? activePlatformFilters[0] : undefined;
          
          // Fetch products from scrapers and APIs
          const lukieProducts = await fetchLukieGamesProducts(query, activePlatform);
          const vgnyProducts = await fetchVGNYProducts(query, activePlatform);
          const jjgamesProducts = await fetchJJGamesProducts(query, activePlatform);
          const dkoldiesProducts = await fetchDKOldiesProducts(query, activePlatform);
          const ebayProducts = await fetchEbayProducts(query, activePlatform);
          
          // Log product counts for debugging
          console.log('Product counts:', {
            lukieProducts: lukieProducts.length,
            vgnyProducts: vgnyProducts.length,
            jjgamesProducts: jjgamesProducts.length,
            dkoldiesProducts: dkoldiesProducts.length,
            ebayProducts: ebayProducts.length
          });
          
          // Handle special keywords
          let results: Product[] = [];
          
          if (query.toLowerCase() === "trending") {
            // For trending, we'll just show all products
            results = combineProductResults(lukieProducts, vgnyProducts, jjgamesProducts, dkoldiesProducts, ebayProducts);
          } else if (query.toLowerCase() === "under $50") {
            // Filter products under $50
            const allProducts = combineProductResults(lukieProducts, vgnyProducts, jjgamesProducts, dkoldiesProducts, ebayProducts);
            results = allProducts.filter(product => 
              parseFloat(product.price.replace('$', '')) < 50
            );
          } else if (query.toLowerCase() === "sealed") {
            // Filter products that mention "sealed" in title or description
            const allProducts = combineProductResults(lukieProducts, vgnyProducts, jjgamesProducts, dkoldiesProducts, ebayProducts);
            results = allProducts.filter(product => 
              product.title.toLowerCase().includes("sealed") || 
              product.description.toLowerCase().includes("sealed") ||
              product.description.toLowerCase().includes("complete in box")
            );
          } else if (query.toLowerCase() === "rare") {
            // Filter products that are considered rare (in this case, over $100)
            const allProducts = combineProductResults(lukieProducts, vgnyProducts, jjgamesProducts, dkoldiesProducts, ebayProducts);
            results = allProducts.filter(product => 
              parseFloat(product.price.replace('$', '')) > 100
            );
          } else {
            // Regular search query - combine all results
            results = combineProductResults(lukieProducts, vgnyProducts, jjgamesProducts, dkoldiesProducts, ebayProducts);
          }
          
          // Apply additional filters
          applyFilters(results);
        } catch (error) {
          console.error("Error fetching products:", error);
          setFilteredProducts([]);
        } finally {
          setIsLoading(false);
        }
      } else {
        setFilteredProducts([]);
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

  // Update displayed products when filtered products or page changes
  useEffect(() => {
    const endIndex = currentPage * productsPerPage;
    setDisplayedProducts(filteredProducts.slice(0, endIndex));
  }, [filteredProducts, currentPage]);

  const loadMore = () => {
    setCurrentPage(prev => prev + 1);
  };

  const router = useRouter();

  // Handle search form submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Update URL with search query
    router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
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

  // Handle adding to favorites with toast notification
  const handleAddToFavorites = async (product: Product) => {
    if (!isAuthenticated) {
      toast.error("Please sign in to add items to favorites");
      return;
    }

    const isProductFavorited = checkIsFavorited(product.id);
    
    if (isProductFavorited) {
      await removeFromFavorites(product.id);
      toast.success("Removed from favorites");
    } else {
      await addToFavorites(product);
      toast.success("Added to favorites");
    }
  };

  return (
    <Container>
      {/* Results */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-light">Search Results</h1>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowFilterModal(true)}
              className="flex items-center gap-1"
            >
              <Filter className="h-4 w-4" />
              Filters
            </Button>
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
                onClick={() => setSortOrder(sortOrder === "price-asc" ? "price-desc" : sortOrder === "price-desc" ? "newest" : "price-asc")}
              >
                <ArrowUpDown className="h-4 w-4" />
                {sortOrder === "newest" ? "Newest" : sortOrder === "price-asc" ? "Price: Low to High" : "Price: High to Low"}
              </Button>
            </div>
          </div>
        </div>
        
        {/* Active filters */}
        {(activePlatformFilters.length > 0 || 
          activeGenreFilters.length > 0 || 
          activePriceFilters.length > 0 || 
          activeSourceFilters.length > 0) && (
          <div className="flex flex-wrap gap-2 mb-4">
            {activePlatformFilters.map((filter) => {
              const platformFilter = platformFilters.find(f => f.query === filter);
              return (
                <Button
                  key={filter}
                  variant="default"
                  size="sm"
                  onClick={() => togglePlatformFilter(filter)}
                  className="flex items-center gap-1 bg-primary/80 text-xs"
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
                  className="flex items-center gap-1 bg-primary/80 text-xs"
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
                  className="flex items-center gap-1 bg-primary/80 text-xs"
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
                  className="flex items-center gap-1 bg-primary/80 text-xs"
                >
                  {sourceFilter?.name}
                  <X className="w-3 h-3 ml-1" />
                </Button>
              );
            })}
            {(activePlatformFilters.length > 0 || 
              activeGenreFilters.length > 0 || 
              activePriceFilters.length > 0 || 
              activeSourceFilters.length > 0) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="text-xs"
              >
                Clear All
              </Button>
            )}
          </div>
        )}
        
        {isLoading ? (
          <div className="flex flex-col sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-6">
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
        ) : (
          <>
            <div className="flex flex-col sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-6">
              {displayedProducts.map((product) => (
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
                  
                  {/* Favorite button - positioned top-left on mobile, top-right on desktop */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      handleAddToFavorites(product);
                    }}
                    className="absolute top-2 left-2 sm:left-auto sm:right-2 p-2 bg-black rounded-full hover:bg-black/80 transition-colors z-10"
                  >
                    <Heart className={cn("h-4 w-4 text-white", {
                      "text-red-500 fill-red-500": checkIsFavorited(product.id)
                    })} />
                  </button>
                </Card>
              ))}
            </div>
            
            {/* More Button */}
            {displayedProducts.length < filteredProducts.length && (
              <div className="flex justify-center mt-8">
                <button
                  onClick={loadMore}
                  className="px-8 py-2 bg-black hover:bg-black/80 text-white rounded-full text-sm font-light transition-colors"
                >
                  More
                </button>
              </div>
            )}
          </>
        )}
      </div>
      
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
    </Container>
  );
}
