'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  Filter, 
  Grid, 
  List, 
  Heart, 
  MapPin,
  SlidersHorizontal,
  ShoppingCart,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/contexts/AuthContext';
import { ItemsAPI, CategoriesAPI, BrandsAPI } from '@/api/items';
import { ItemStatus } from '@/types/domains/items';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

// Dynamic sizes and conditions from backend data
const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const priceRanges = ['Under $25', '$25-$50', '$50-$100', 'Over $100'];

const mockItems = [
  {
    id: 1,
    title: 'Vintage Denim Jacket',
    price: 45,
    originalPrice: 120,
    brand: 'Levi\'s',
    condition: 'Very Good',
    size: 'M',
    image: '/api/placeholder/300/300',
    seller: 'Sarah M.',
    location: 'New York',
    sustainabilityScore: 85,
    likes: 12,
    isLiked: false
  },
  {
    id: 2,
    title: 'Sustainable Cotton Dress',
    price: 32,
    originalPrice: 89,
    brand: 'Everlane',
    condition: 'Like New',
    size: 'S',
    image: '/api/placeholder/300/300',
    seller: 'Emma K.',
    location: 'California',
    sustainabilityScore: 92,
    likes: 8,
    isLiked: true
  },
  {
    id: 3,
    title: 'Designer Leather Bag',
    price: 150,
    originalPrice: 400,
    brand: 'Coach',
    condition: 'Good',
    size: 'One Size',
    image: '/api/placeholder/300/300',
    seller: 'Michael R.',
    location: 'Texas',
    sustainabilityScore: 78,
    likes: 25,
    isLiked: false
  },
  {
    id: 4,
    title: 'Eco-friendly Sneakers',
    price: 78,
    originalPrice: 130,
    brand: 'Allbirds',
    condition: 'Very Good',
    size: '9',
    image: '/api/placeholder/300/300',
    seller: 'Alex L.',
    location: 'Portland',
    sustainabilityScore: 95,
    likes: 15,
    isLiked: false
  },
  {
    id: 5,
    title: 'Vintage Band T-Shirt',
    price: 25,
    originalPrice: 45,
    brand: 'Vintage',
    condition: 'Good',
    size: 'L',
    image: '/api/placeholder/300/300',
    seller: 'Jamie P.',
    location: 'Chicago',
    sustainabilityScore: 80,
    likes: 6,
    isLiked: true
  },
  {
    id: 6,
    title: 'Cashmere Sweater',
    price: 65,
    originalPrice: 200,
    brand: 'J.Crew',
    condition: 'Like New',
    size: 'M',
    image: '/api/placeholder/300/300',
    seller: 'Taylor S.',
    location: 'Boston',
    sustainabilityScore: 88,
    likes: 18,
    isLiked: false
  }
];

export default function MarketplacePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const { user } = useAuth();
  const router = useRouter();

  // Load categories and brands on mount
  useEffect(() => {
    loadCategories();
    loadBrands();
  }, []);

  useEffect(() => {
    loadItems();
  }, [currentPage, selectedCategory, selectedBrand, verifiedOnly]);

  const loadCategories = async () => {
    try {
      const cats = await CategoriesAPI.getActiveCategories();
      setCategories(cats);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const loadBrands = async () => {
    try {
      const brandsData = await BrandsAPI.getActiveBrands();
      setBrands(brandsData);
    } catch (error) {
      console.error('Failed to load brands:', error);
    }
  };

  const loadItems = async () => {
    try {
      setLoading(true);
      // Fetch items with status READY_FOR_SALE only
      const filters: any = {
        statuses: [ItemStatus.READY_FOR_SALE],
        page: currentPage,
        size: 12
      };
      
      // Add category filter if selected
      if (selectedCategory) {
        filters.categoryId = selectedCategory;
      }
      
      // Add brand filter if selected
      if (selectedBrand) {
        filters.brandId = selectedBrand;
      }
      
      const response = await ItemsAPI.filterItems(filters);
      
      // Filter verified items on frontend if needed (or add backend support)
      let resultItems = response.content;
      if (verifiedOnly) {
        resultItems = resultItems.filter((item: any) => item.isVerified);
      }
      
      // Transform backend response to match UI expectations
      const transformed = resultItems.map((item: any) => ({
        id: item.itemId,
        title: item.name,
        price: item.resellPrice || item.estimatedValue || 0,
        originalPrice: item.originalPrice,
        brand: item.brandName,
        condition: item.conditionText || 'Good',
        size: item.size,
        image: item.primaryImageUrl || (item.images && item.images.length > 0 ? item.images[0] : 'https://via.placeholder.com/300x300?text=No+Image'),
        seller: item.ownerName || 'Green Loop',
        location: 'Vietnam',
        sustainabilityScore: Math.round((item.conditionScore / 5) * 100) || 75,
        likes: 0,
        isLiked: false,
        itemId: item.itemId, // UUID for cart
      }));
      
      setItems(transformed);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Failed to load items:', error);
      // Fallback to mock data
      setItems(mockItems);
    } finally {
      setLoading(false);
    }
  };

  const toggleLike = (itemId: number) => {
    setItems(items.map(item => 
      item.id === itemId 
        ? { ...item, isLiked: !item.isLiked, likes: item.isLiked ? item.likes - 1 : item.likes + 1 }
        : item
    ));
  };

  const addToCart = (item: any) => {
    if (!item.itemId) {
      alert('Cannot add this item to cart (missing ID)');
      return;
    }

    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    
    const existingItem = cart.find((i: any) => i.itemId === item.itemId);
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({
        itemId: item.itemId,
        itemName: item.title,
        itemImage: item.image,
        price: item.price,
        quantity: 1,
      });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Trigger cart update event for header badge
    window.dispatchEvent(new Event('cartUpdated'));
    
    alert(`Added ${item.title} to cart!`);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 100
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="text-center space-y-4">
            <h1 className="text-4xl font-bold">Marketplace</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover sustainable fashion from our community of conscious sellers
            </p>
          </motion.div>

          {/* Search and Filters */}
          <motion.div variants={itemVariants} className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center space-x-2"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  <span>Filters</span>
                </Button>
                
                <div className="flex border rounded-lg">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Categories */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedCategory === null ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(null)}
              >
                Tất cả
              </Button>
              {categories.map((category) => (
                <Button
                  key={category.categoryId}
                  variant={selectedCategory === category.categoryId ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category.categoryId)}
                >
                  {category.name}
                </Button>
              ))}
            </div>

            {/* Filters Panel */}
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="border rounded-lg p-6 space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div>
                    <h3 className="font-medium mb-3">Size</h3>
                    <div className="flex flex-wrap gap-2">
                      {sizes.map((size) => (
                        <Button key={size} variant="outline" size="sm">
                          {size}
                        </Button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-3">Thương hiệu</h3>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {brands.map((brand) => (
                        <label key={brand.brandId} className="flex items-center space-x-2">
                          <input 
                            type="radio" 
                            name="brand" 
                            className="rounded"
                            checked={selectedBrand === brand.brandId}
                            onChange={() => setSelectedBrand(brand.brandId)}
                          />
                          <span className="text-sm">{brand.name}</span>
                        </label>
                      ))}
                    </div>
                    {selectedBrand && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setSelectedBrand(null)}
                        className="mt-2"
                      >
                        Xóa bộ lọc
                      </Button>
                    )}
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-3">Khoảng giá (điểm)</h3>
                    <div className="space-y-2">
                      {['Dưới 100k', '100k-300k', '300k-500k', 'Trên 500k'].map((range) => (
                        <label key={range} className="flex items-center space-x-2">
                          <input type="radio" name="priceRange" className="rounded" />
                          <span className="text-sm">{range}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-3">Khác</h3>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2">
                        <input 
                          type="checkbox" 
                          className="rounded"
                          checked={verifiedOnly}
                          onChange={(e) => setVerifiedOnly(e.target.checked)}
                        />
                        <span className="text-sm">Chỉ hiện đã xác minh</span>
                      </label>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Items Grid */}
          <motion.div variants={itemVariants}>
            <div className={`grid gap-6 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                : 'grid-cols-1'
            }`}>
              {items.map((item) => (
                <motion.div
                  key={item.id}
                  variants={itemVariants}
                  whileHover={{ y: -5 }}
                  className="group"
                >
                  <Card className="overflow-hidden transition-shadow hover:shadow-lg">
                    <div className="relative">
                      <div className="aspect-square bg-muted overflow-hidden">
                        <img 
                          src={item.image} 
                          alt={item.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = 'https://via.placeholder.com/300x300?text=No+Image';
                          }}
                        />
                      </div>
                      
                      {/* Overlays */}
                      <div className="absolute top-3 left-3">
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          {item.sustainabilityScore}% Sustainable
                        </Badge>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`absolute top-3 right-3 ${
                          item.isLiked ? 'text-red-500' : 'text-muted-foreground'
                        }`}
                        onClick={() => toggleLike(item.id)}
                      >
                        <Heart className={`h-4 w-4 ${item.isLiked ? 'fill-current' : ''}`} />
                      </Button>
                    </div>
                    
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <Link href={`/item/${item.itemId}`}>
                          <h3 className="font-medium hover:text-primary transition-colors line-clamp-2">
                            {item.title}
                          </h3>
                        </Link>
                        
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <span>{item.brand}</span>
                          <span>•</span>
                          <span>Size {item.size}</span>
                          <span>•</span>
                          <span>{item.condition}</span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="text-lg font-bold">${item.price}</span>
                            <span className="text-sm text-muted-foreground line-through">
                              ${item.originalPrice}
                            </span>
                          </div>
                          <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                            <Heart className="h-3 w-3" />
                            <span>{item.likes}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          <span>{item.seller} • {item.location}</span>
                        </div>
                        
                        <Button
                          onClick={() => addToCart(item)}
                          className="w-full mt-3 bg-primary hover:bg-primary/90"
                        >
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          Add to Cart
                        </Button>
                        
                        <Button className="w-full" variant="outline" asChild>
                          <Link href={`/item/${item.itemId}`}>
                            Xem chi tiết
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Load More */}
          <motion.div variants={itemVariants} className="text-center">
            <Button variant="outline" size="lg">
              Load More Items
            </Button>
          </motion.div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}


