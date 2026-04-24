/**
 * Product Categories Data
 * Defines all product categories for the crazzzy store.
 * NOTE: Images use the /api/media/lib-data/ route which maps to lib/data/ on disk.
 * Can be replaced with database queries later.
 */

export interface Category {
  id: string
  name: string
  slug: string
  description: string
  image: string
  color: string // Accent color for the category gradient fallback
}

export const categories: Category[] = [
  {
    id: 'tote-bags',
    name: 'Tote Bags',
    slug: 'tote-bags',
    description: 'Aesthetic tote bags for every vibe',
    image: '/api/media/lib-data/Tote%20Bags/2.jpg',
    color: '#c084fc',
  },
  {
    id: 'die-cast-cars-and-bikes',
    name: 'Die Cast Cars and Bikes',
    slug: 'die-cast-cars-and-bikes',
    description: 'Premium 1:24 scale die-cast models',
    image: '/api/media/lib-data/Die%20cast%20Cars%20and%20Bikes/2.jpg',
    color: '#f97316',
  },
  {
    id: 'perfumes',
    name: 'Perfumes',
    slug: 'perfumes',
    description: 'Premium imported fragrances',
    image: '/api/media/lib-data/Perfumes/2.jpg',
    color: '#d4af37',
  },
  {
    id: 'wall-posters',
    name: 'Wall Posters',
    slug: 'wall-posters',
    description: 'High-quality wall art and posters',
    image: '/api/media/lib-data/Wall%20Posters/2.jpg',
    color: '#06b6d4',
  },
  {
    id: 'anime-figures',
    name: 'Anime Figures',
    slug: 'anime-figures',
    description: 'Detailed anime and manga collectibles',
    image: '/api/media/lib-data/Anime%20Figures/2.jpg',
    color: '#f43f5e',
  },
  {
    id: 'hot-wheels',
    name: 'Hot Wheels',
    slug: 'hot-wheels',
    description: '1:64 scale Hot Wheels collectibles',
    image: '/api/media/lib-data/Hotwheels/2.jpg',
    color: '#ef4444',
  },
  {
    id: 'keychains',
    name: 'Keychains',
    slug: 'keychains',
    description: 'Unique collectible keychains',
    image: '/api/media/lib-data/Keychains/1.jpg',
    color: '#10b981',
  },
  {
    id: 'chocolate-and-beverages',
    name: 'Chocolate and Beverages',
    slug: 'chocolate-and-beverages',
    description: 'Imported chocolates and exotic drinks',
    image: '/api/media/lib-data/Chocolate%20and%20Beverages/1.jpg',
    color: '#92400e',
  },
  {
    id: 'aesthetic-items',
    name: 'Aesthetic Items',
    slug: 'aesthetic-items',
    description: 'Curated décor for modern spaces',
    image: '/api/media/lib-data/Asthetic%20items/2.jpg',
    color: '#8b5cf6',
  },
]

