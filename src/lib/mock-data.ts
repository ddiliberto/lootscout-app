// Types for our data
export type Product = {
  id: string;
  title: string;
  description: string;
  price: string;
  source: "eBay" | "Mercari" | "Poshmark" | "Etsy" | "LukieGames" | "VGNY" | "JJGames" | "DKOldies";
  time: string;
  image: string;
  condition: string;
  url: string;
  platform?: string;
  genre?: string;
};

// Placeholder image for products without images
export const placeholderImage =
  "https://via.placeholder.com/300x300?text=No+Image";

// Empty array for search results - no more mock data
export const mockProducts: Product[] = [];

// Filter options
export const platformFilters = [
  { 
    name: "PlayStation 1", 
    query: "ps1", 
    image: "https://via.placeholder.com/300x200?text=PlayStation+1",
    color: "#5271ff"
  },
  { 
    name: "Super Nintendo", 
    query: "snes", 
    image: "https://via.placeholder.com/300x200?text=Super+Nintendo",
    color: "#ff5757"
  },
  { 
    name: "Nintendo 64", 
    query: "n64", 
    image: "https://via.placeholder.com/300x200?text=Nintendo+64",
    color: "#57c9ff"
  },
  { 
    name: "Game Boy", 
    query: "game boy", 
    image: "https://via.placeholder.com/300x200?text=Game+Boy",
    color: "#57ff8f"
  },
  { 
    name: "Genesis", 
    query: "genesis", 
    image: "https://via.placeholder.com/300x200?text=Genesis",
    color: "#ff57e4"
  },
];

export const genreFilters = [
  { 
    name: "RPG", 
    query: "rpg",
    image: "https://via.placeholder.com/300x200?text=RPG",
    color: "#ff9f57"
  },
  { 
    name: "Fighting", 
    query: "fighting",
    image: "https://via.placeholder.com/300x200?text=Fighting",
    color: "#ff5757"
  },
  { 
    name: "Action", 
    query: "action",
    image: "https://via.placeholder.com/300x200?text=Action",
    color: "#5271ff"
  },
  { 
    name: "Adventure", 
    query: "adventure",
    image: "https://via.placeholder.com/300x200?text=Adventure",
    color: "#57c9ff"
  },
  { 
    name: "Platformer", 
    query: "platformer",
    image: "https://via.placeholder.com/300x200?text=Platformer",
    color: "#57ff8f"
  },
  { 
    name: "Horror", 
    query: "horror",
    image: "https://via.placeholder.com/300x200?text=Horror",
    color: "#a957ff"
  },
];

export const priceFilters = [
  { name: "Under $25", query: "under-25", filter: (price: string) => parseFloat(price.replace('$', '')) < 25 },
  { name: "Under $50", query: "under-50", filter: (price: string) => parseFloat(price.replace('$', '')) < 50 },
  { name: "Under $100", query: "under-100", filter: (price: string) => parseFloat(price.replace('$', '')) < 100 },
  { name: "$100+", query: "over-100", filter: (price: string) => parseFloat(price.replace('$', '')) >= 100 },
];

export const sourceFilters = [
  { name: "eBay", query: "ebay" },
  { name: "Mercari", query: "mercari" },
  { name: "Poshmark", query: "poshmark" },
  { name: "Etsy", query: "etsy" },
  { name: "LukieGames", query: "lukiegames" },
  { name: "VGNY", query: "vgny" },
  { name: "JJGames", query: "jjgames" },
  { name: "DKOldies", query: "dkoldies" },
];

// Trending products interface
export interface TrendingProduct extends Product {
  searchCount: number;
}

// Empty array for trending products - no more mock data
export const trendingProducts: TrendingProduct[] = [];
