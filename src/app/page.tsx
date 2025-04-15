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
  Zap,
  Bell,
  Save,
  BarChart3,
  Users,
} from "lucide-react";
import { 
  platformFilters,
  genreFilters,
  priceFilters,
  placeholderImage,
  type Product,
  type TrendingProduct
} from "@/lib/mock-data";
import { useAuth } from "@/context/AuthContext";
import { useFavorites } from "@/context/FavoritesContext";
import { Header } from "@/components/Header";
import { Container } from "@/components/Container";
import { Carousel } from "@/components/Carousel";
import { FullWidthSection } from "@/components/FullWidthSection";

// Sample trending products for the homepage
const trendingProducts: TrendingProduct[] = [
  {
    id: "trending-1",
    title: "Earthbound (SNES)",
    description: "Cartridge Only",
    price: "$250",
    source: "LukieGames",
    time: "1 hour ago",
    image: placeholderImage,
    condition: "Good",
    url: "/search?q=earthbound",
    platform: "snes",
    genre: "rpg",
    searchCount: 1240
  },
  {
    id: "trending-2",
    title: "Final Fantasy VII (PS1)",
    description: "Black Label Original",
    price: "$65",
    source: "JJGames",
    time: "5 hours ago",
    image: placeholderImage,
    condition: "Very Good",
    url: "/search?q=final+fantasy+vii",
    platform: "ps1",
    genre: "rpg",
    searchCount: 980
  },
  {
    id: "trending-3",
    title: "The Legend of Zelda: Ocarina of Time (N64)",
    description: "Complete with Manual",
    price: "$75",
    source: "VGNY",
    time: "12 hours ago",
    image: placeholderImage,
    condition: "Very Good",
    url: "/search?q=zelda+ocarina",
    platform: "n64",
    genre: "adventure",
    searchCount: 875
  },
  {
    id: "trending-4",
    title: "Chrono Trigger (SNES)",
    description: "Complete in Box",
    price: "$180",
    source: "DKOldies",
    time: "3 hours ago",
    image: placeholderImage,
    condition: "Good",
    url: "/search?q=chrono+trigger",
    platform: "snes",
    genre: "rpg",
    searchCount: 760
  },
  {
    id: "trending-5",
    title: "Castlevania: Symphony of the Night (PS1)",
    description: "Greatest Hits Version",
    price: "$85",
    source: "LukieGames",
    time: "3 days ago",
    image: placeholderImage,
    condition: "Very Good",
    url: "/search?q=castlevania+symphony",
    platform: "ps1",
    genre: "action",
    searchCount: 650
  },
  {
    id: "trending-6",
    title: "Pokémon Red Version (Game Boy)",
    description: "Authentic Cartridge",
    price: "$45",
    source: "JJGames",
    time: "2 days ago",
    image: placeholderImage,
    condition: "Used",
    url: "/search?q=pokemon+red",
    platform: "game boy",
    genre: "rpg",
    searchCount: 540
  }
];

export default function LootScoutHomepage() {
  const { isAuthenticated } = useAuth();
  const { isFavorited, addToFavorites, removeFromFavorites } = useFavorites();
  const [itemsToShow, setItemsToShow] = useState(3);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setItemsToShow(2.5);
      } else if (window.innerWidth < 1024) {
        setItemsToShow(3);
      } else {
        setItemsToShow(4);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleFilterClick = (query: string) => {
    window.location.href = `/search?q=${encodeURIComponent(query)}`;
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  return (
    <Container>
      <Header className="mb-12" />
      {/* 🕹️ Hero Section */}
      <section className="text-center max-w-2xl mx-auto mb-16">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">
          Track Rare Games. Snipe Better Deals.
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground mb-6">
          LootScout scans secondhand sites in real-time so you can lock down vintage games, sealed copies, and collector gold—before they disappear.
        </p>
        <form
          onSubmit={handleSearch}
          className="flex items-center gap-2 bg-white border border-[#EEEEEE] px-4 py-2 rounded-full max-w-xl mx-auto"
        >
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Try 'sealed EarthBound SNES' or 'Castlevania PS1'"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="border-none bg-transparent text-sm"
          />
          <Button type="submit" variant="ghost" size="icon">
            <Search className="h-4 w-4" />
          </Button>
        </form>
      </section>

      {/* ⚡️ Why LootScout */}
      <section className="max-w-3xl mx-auto mb-16">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 justify-center">
          <Zap className="w-6 h-6 text-primary" /> Why LootScout
        </h2>
        <div className="grid md:grid-cols-2 gap-6 text-left">
          <div>
            <h3 className="font-semibold mb-2">One search. Every marketplace.</h3>
            <p className="text-muted-foreground mb-4">
              We crawl eBay, Mercari, Poshmark, Facebook Marketplace, and more—surfacing the best deals across the web.
            </p>
            <ul className="space-y-2">
              <li className="flex items-center gap-2"><Search className="w-4 h-4 text-primary" /> Find games by title, console, or condition</li>
              <li className="flex items-center gap-2"><Bell className="w-4 h-4 text-primary" /> Get alerts the second a deal drops</li>
              <li className="flex items-center gap-2"><Save className="w-4 h-4 text-primary" /> Save favorites in your personal vault</li>
              <li className="flex items-center gap-2"><BarChart3 className="w-4 h-4 text-primary" /> See price history and market trends</li>
            </ul>
          </div>
          <div className="flex flex-col justify-center">
            <h3 className="font-semibold mb-2">🎮 Made for Collectors</h3>
            <p className="text-muted-foreground">
              Whether you're chasing a sealed copy of EarthBound or rebuilding your PS1 shelf—LootScout keeps the hunt effortless and automatic.
            </p>
          </div>
        </div>
      </section>

      {/* 💾 Works Across */}
      <section className="max-w-2xl mx-auto mb-16">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2 justify-center">
          <Save className="w-5 h-5 text-primary" /> Works Across
        </h2>
        <div className="flex flex-wrap justify-center gap-4 text-lg font-medium">
          <span className="bg-gray-100 px-4 py-2 rounded">eBay</span>
          <span className="bg-gray-100 px-4 py-2 rounded">Mercari</span>
          <span className="bg-gray-100 px-4 py-2 rounded">Facebook Marketplace</span>
          <span className="bg-gray-100 px-4 py-2 rounded">Etsy</span>
          <span className="bg-gray-100 px-4 py-2 rounded">Poshmark</span>
        </div>
        <p className="text-muted-foreground mt-4 text-center">Real-time results. No more tab-hopping.</p>
      </section>

      {/* 💸 Pricing */}
      <section className="max-w-3xl mx-auto mb-20">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 justify-center">
          <DollarSign className="w-6 h-6 text-primary" /> Pricing
        </h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="border rounded-lg p-6 bg-white shadow-sm">
            <h3 className="text-xl font-semibold mb-2">Free</h3>
            <ul className="mb-4 space-y-1 text-muted-foreground">
              <li>5 searches/day</li>
              <li>1 saved alert</li>
              <li>10 favorites</li>
              <li>Trending games feed</li>
            </ul>
            <div className="text-3xl font-bold mb-2">Free</div>
            <Button variant="outline" className="w-full">Get Started</Button>
          </div>
          <div className="border rounded-lg p-6 bg-white shadow-md border-primary">
            <h3 className="text-xl font-semibold mb-2">Pro <span className="ml-2 text-base font-normal text-primary">– $5.99/month</span></h3>
            <ul className="mb-4 space-y-1 text-muted-foreground">
              <li>Unlimited searches & alerts</li>
              <li>Instant drop notifications</li>
              <li>Portfolio value tracking</li>
              <li>Advanced filters</li>
              <li>First access to new features</li>
            </ul>
            <div className="text-3xl font-bold mb-2 text-primary">$5.99<span className="text-base font-normal">/mo</span></div>
            <Button variant="default" className="w-full">Go Pro</Button>
          </div>
        </div>
      </section>
    </Container>
  );
}
