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
import { Header } from "@/components/Header";
import { Container } from "@/components/Container";
import { FilterModal } from "@/components/FilterModal";
import { Spinner } from "@/components/ui/spinner";
import { Toaster, toast } from "sonner";

export default function SearchPage() {
  const { isAuthenticated } = useAuth();
  const { isFavorited: checkIsFavorited, addToFavorites, removeFromFavorites } = useFavorites();
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
      <Header className="mb-12" />
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
      <Toaster 
        position="top-right"
        className="md:right-4 md:top-4 sm:left-1/2 sm:transform sm:-translate-x-1/2 sm:top-4"
      />

      <div className="mb-8">
        <h2 className="text-2xl font-semibold">Search Results</h2>
        <p className="text-muted-foreground">
          {query ? `Results for "${query}"` : "Enter a search term to find games"}
        </p>
      </div>

      <form onSubmit={handleSearch} className="flex items-center gap-2 bg-white border border-[#EEEEEE] px-4 py-2 rounded-full mb-8 max-w-xl mx-auto">
        <Button type="button" variant="ghost" size="icon" onClick={() => setShowFilterModal(true)}>
          <Filter className="h-4 w-4 text-muted-foreground" />
        </Button>
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Try 'sealed EarthBound SNES' or 'Castlevania PS1'"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="border-none bg-transparent text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
        />
        <Button type="submit" variant="ghost" size="icon">
          <Search className="h-4 w-4" />
        </Button>
      </form>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Spinner size="lg" className="mb-4" />
          <p className="text-muted-foreground">Searching across all stores...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium mb-2">No results found</h3>
          <p className="text-muted-foreground mb-6">
            Try adjusting your search or filters to find what you're looking for.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="relative flex flex-col border border-[#EEEEEE] hover:border-gray-300 transition-colors">
              <a 
                href={product.url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="block h-full"
              >
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
                    onClick={(e) => {
                      e.preventDefault(); // Prevent the card link from being triggered
                      handleAddToFavorites(product);
                    }}
                  >
                    <Heart className={`h-5 w-5 ${checkIsFavorited(product.id) ? 'fill-current' : ''}`} />
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
                  <span className="text-xs text-primary mt-2 block">
                    View on {product.source} →
                  </span>
                </CardContent>
              </a>
            </Card>
          ))}
        </div>
      )}
    </Container>
  );
}
