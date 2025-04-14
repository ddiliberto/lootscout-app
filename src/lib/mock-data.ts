// Types for our data
export type Product = {
  id: string;
  title: string;
  description: string;
  price: string;
  source: "eBay" | "Mercari" | "Poshmark" | "Etsy";
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

// Mock data for search results
export const mockProducts: Product[] = [
  {
    id: "1",
    title: "Chrono Trigger (SNES)",
    description: "Complete in Box",
    price: "$180",
    source: "eBay",
    time: "3 hours ago",
    image: placeholderImage,
    condition: "Good",
    url: "#",
    platform: "snes",
    genre: "rpg",
  },
  {
    id: "2",
    title: "Metal Gear Solid (PS1)",
    description: "Good Condition",
    price: "$24",
    source: "Mercari",
    time: "2 hours ago",
    image: placeholderImage,
    condition: "Used",
    url: "#",
    platform: "ps1",
    genre: "action",
  },
  {
    id: "3",
    title: "Final Fantasy VII (PS1)",
    description: "Black Label Original",
    price: "$65",
    source: "eBay",
    time: "5 hours ago",
    image: placeholderImage,
    condition: "Very Good",
    url: "#",
    platform: "ps1",
    genre: "rpg",
  },
  {
    id: "4",
    title: "Super Mario 64 (N64)",
    description: "Cartridge Only",
    price: "$35",
    source: "Mercari",
    time: "1 day ago",
    image: placeholderImage,
    condition: "Good",
    url: "#",
    platform: "n64",
    genre: "platformer",
  },
  {
    id: "5",
    title: "The Legend of Zelda: Ocarina of Time (N64)",
    description: "Complete with Manual",
    price: "$75",
    source: "Poshmark",
    time: "12 hours ago",
    image: placeholderImage,
    condition: "Very Good",
    url: "#",
    platform: "n64",
    genre: "adventure",
  },
  {
    id: "6",
    title: "Pokémon Red Version (Game Boy)",
    description: "Authentic Cartridge",
    price: "$45",
    source: "Etsy",
    time: "2 days ago",
    image: placeholderImage,
    condition: "Used",
    url: "#",
    platform: "game boy",
    genre: "rpg",
  },
  {
    id: "7",
    title: "Resident Evil 2 (PS1)",
    description: "Dual Shock Edition",
    price: "$40",
    source: "eBay",
    time: "6 hours ago",
    image: placeholderImage,
    condition: "Good",
    url: "#",
    platform: "ps1",
    genre: "horror",
  },
  {
    id: "8",
    title: "Super Smash Bros. (N64)",
    description: "Tested & Working",
    price: "$50",
    source: "Mercari",
    time: "1 day ago",
    image: placeholderImage,
    condition: "Fair",
    url: "#",
    platform: "n64",
    genre: "fighting",
  },
  {
    id: "9",
    title: "Castlevania: Symphony of the Night (PS1)",
    description: "Greatest Hits Version",
    price: "$85",
    source: "Poshmark",
    time: "3 days ago",
    image: placeholderImage,
    condition: "Very Good",
    url: "#",
    platform: "ps1",
    genre: "action",
  },
  {
    id: "10",
    title: "Earthbound (SNES)",
    description: "Cartridge Only",
    price: "$250",
    source: "eBay",
    time: "1 hour ago",
    image: placeholderImage,
    condition: "Good",
    url: "#",
    platform: "snes",
    genre: "rpg",
  },
  {
    id: "11",
    title: "Mega Man X (SNES)",
    description: "With Original Box",
    price: "$120",
    source: "Etsy",
    time: "4 days ago",
    image: placeholderImage,
    condition: "Good",
    url: "#",
    platform: "snes",
    genre: "action",
  },
  {
    id: "12",
    title: "Sonic the Hedgehog 2 (Genesis)",
    description: "Complete in Box",
    price: "$30",
    source: "Mercari",
    time: "2 days ago",
    image: placeholderImage,
    condition: "Very Good",
    url: "#",
    platform: "genesis",
    genre: "platformer",
  },
  {
    id: "13",
    title: "Street Fighter II Turbo (SNES)",
    description: "Box and Manual Included",
    price: "$55",
    source: "eBay",
    time: "8 hours ago",
    image: placeholderImage,
    condition: "Good",
    url: "#",
    platform: "snes",
    genre: "fighting",
  },
  {
    id: "14",
    title: "Crash Bandicoot (PS1)",
    description: "Original Black Label",
    price: "$28",
    source: "Mercari",
    time: "3 days ago",
    image: placeholderImage,
    condition: "Good",
    url: "#",
    platform: "ps1",
    genre: "platformer",
  },
  {
    id: "15",
    title: "The Legend of Zelda: A Link to the Past (SNES)",
    description: "Cartridge Only",
    price: "$40",
    source: "Poshmark",
    time: "5 days ago",
    image: placeholderImage,
    condition: "Fair",
    url: "#",
    platform: "snes",
    genre: "adventure",
  },
  {
    id: "16",
    title: "Donkey Kong 64 (N64)",
    description: "With Expansion Pak",
    price: "$60",
    source: "Etsy",
    time: "1 week ago",
    image: placeholderImage,
    condition: "Good",
    url: "#",
    platform: "n64",
    genre: "platformer",
  },
];

// Filter options
export const platformFilters = [
  { name: "PlayStation 1", query: "ps1" },
  { name: "Super Nintendo", query: "snes" },
  { name: "Nintendo 64", query: "n64" },
  { name: "Game Boy", query: "game boy" },
  { name: "Genesis", query: "genesis" },
];

export const genreFilters = [
  { name: "RPG", query: "rpg" },
  { name: "Fighting", query: "fighting" },
  { name: "Action", query: "action" },
  { name: "Adventure", query: "adventure" },
  { name: "Platformer", query: "platformer" },
  { name: "Horror", query: "horror" },
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
];

// Trending products for homepage
export const trendingProducts: Product[] = mockProducts.slice(0, 2);

// Community picks
export const communityPicks = [
  { name: "mika's picks", image: "https://via.placeholder.com/300x300?text=Mika" },
  { name: "susan's picks", image: "https://via.placeholder.com/300x300?text=Susan" },
  { name: "fuad's picks", image: "https://via.placeholder.com/300x300?text=Fuad" },
  { name: "alex's picks", image: "https://via.placeholder.com/300x300?text=Alex" }
];

// Inspiration categories
export const inspirationCategories = [
  { name: "furniture", image: "https://via.placeholder.com/300x300?text=Furniture" },
  { name: "gear", image: "https://via.placeholder.com/300x300?text=Gear" },
  { name: "collectibles", image: "https://via.placeholder.com/300x300?text=Collectibles" },
  { name: "electronics", image: "https://via.placeholder.com/300x300?text=Electronics" }
];
