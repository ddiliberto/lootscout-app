"use client";

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
  Gamepad2,
  DollarSign,
  TrendingUp,
} from "lucide-react";
import { 
  trendingProducts, 
  platformFilters,
  genreFilters,
  priceFilters,
  placeholderImage,
  type TrendingProduct
} from "@/lib/mock-data";
import { useAuth } from "@/context/AuthContext";
import { useFavorites } from "@/context/FavoritesContext";
import { Header } from "@/components/Header";
import { Container } from "@/components/Container";
import { Carousel } from "@/components/Carousel";
import { FullWidthSection } from "@/components/FullWidthSection";

export default function LootScoutHomepage() {
  const { isAuthenticated } = useAuth();
  const { isFavorited, addToFavorites, removeFromFavorites } = useFavorites();
  const [itemsToShow, setItemsToShow] = useState(3);
  
  // Set items to show based on window width
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setItemsToShow(2.5); // Show 2.5 cards on mobile
      } else if (window.innerWidth < 1024) {
        setItemsToShow(3);
      } else {
        setItemsToShow(4);
      }
    };
    
    // Initial call
    handleResize();
    
    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);
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
    <Container>
      <Header className="mb-12" />

      <div className="text-center max-w-xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-semibold mb-4">What game are you hunting for?</h2>
        <p className="text-muted-foreground mb-6">Track and discover rare retro games across the web.</p>
        <form onSubmit={handleSearch} className="flex items-center gap-2 bg-white border border-[#EEEEEE] px-4 py-2 rounded-full">
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
        <h3 className="text-lg font-semibold mb-4">
          Trending This Week
          <span className="text-xs font-normal text-muted-foreground ml-2">
            Most searched games
          </span>
        </h3>
      </div>
      
      <FullWidthSection className="mt-6 mb-16 py-8">
        <div className="px-6 md:px-12 lg:px-16">
          <Carousel 
            showDots 
            showArrows 
            autoPlay 
            interval={6000}
            itemsToShow={itemsToShow}
            fullWidth
            draggable
          >
          {trendingProducts.map((product, index) => (
            <div key={index} className="px-2 md:px-3">
              <Card className="relative flex flex-col border border-[#EEEEEE] hover:border-gray-300 transition-colors h-full">
                <div className="relative">
                  <img
                    src={product.image || placeholderImage}
                    alt={product.title}
                    className="w-full h-48 md:h-64 object-cover"
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
                  <div className="absolute top-2 left-2 bg-primary text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    {product.searchCount}+ searches
                  </div>
                </div>
                <CardHeader className="p-4">
                  <CardTitle className="text-sm font-medium leading-snug">{product.title}</CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">{product.description}</CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-0 mt-auto">
                  <p className="text-sm font-semibold">{product.price}</p>
                  <p className="text-xs text-muted-foreground mt-1">{product.source} • {product.time}</p>
                </CardContent>
              </Card>
            </div>
          ))}
          </Carousel>
        </div>
      </FullWidthSection>

      <div className="mt-16">
        <h3 className="text-lg font-semibold mb-4">Browse By Category</h3>
        
        <div className="mb-10">
          <h4 className="text-sm font-medium mb-4">Platforms</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {platformFilters.map((filter, idx) => (
              <div 
                key={idx} 
                onClick={() => handleFilterClick(filter.query)}
                className="cursor-pointer group"
              >
                <Card className="border border-[#EEEEEE] hover:border-gray-300 transition-colors overflow-hidden">
                  <div className="relative h-32 w-full">
                    <div 
                      className="absolute inset-0 flex items-center justify-center"
                      style={{ backgroundColor: filter.color }}
                    >
                      {filter.query === "ps1" && <Gamepad className="w-12 h-12 text-white" />}
                      {filter.query === "snes" && <Tv className="w-12 h-12 text-white" />}
                      {filter.query === "n64" && <Gamepad2 className="w-12 h-12 text-white" />}
                      {filter.query === "game boy" && <MonitorSmartphone className="w-12 h-12 text-white" />}
                      {filter.query === "genesis" && <Gamepad className="w-12 h-12 text-white" />}
                    </div>
                  </div>
                  <div className="p-3 text-center">
                    <p className="text-sm font-medium">{filter.name}</p>
                  </div>
                </Card>
              </div>
            ))}
          </div>
        </div>
        
        <div className="mb-10">
          <h4 className="text-sm font-medium mb-4">Genres</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {genreFilters.map((filter, idx) => (
              <div 
                key={idx} 
                onClick={() => handleFilterClick(filter.query)}
                className="cursor-pointer group"
              >
                <Card className="border border-[#EEEEEE] hover:border-gray-300 transition-colors overflow-hidden">
                  <div className="relative h-32 w-full">
                    <div 
                      className="absolute inset-0 flex items-center justify-center"
                      style={{ backgroundColor: filter.color }}
                    >
                      {filter.query === "rpg" && <Rocket className="w-12 h-12 text-white" />}
                      {filter.query === "fighting" && <Gamepad2 className="w-12 h-12 text-white" />}
                      {filter.query === "action" && <Gamepad className="w-12 h-12 text-white" />}
                      {filter.query === "adventure" && <Tv className="w-12 h-12 text-white" />}
                      {filter.query === "platformer" && <Gamepad2 className="w-12 h-12 text-white" />}
                      {filter.query === "horror" && <MonitorSmartphone className="w-12 h-12 text-white" />}
                    </div>
                  </div>
                  <div className="p-3 text-center">
                    <p className="text-sm font-medium">{filter.name}</p>
                  </div>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Container>
  );
}
