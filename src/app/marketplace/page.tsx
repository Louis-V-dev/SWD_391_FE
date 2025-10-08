'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  Search, 
  Filter, 
  Grid, 
  List, 
  Heart, 
  MapPin,
  SlidersHorizontal,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const categories = [
  'All Categories', 'Clothing', 'Shoes', 'Accessories', 'Bags', 'Jewelry'
];

const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const conditions = ['New', 'Like New', 'Good', 'Fair'];
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
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [items, setItems] = useState(mockItems);
  const { user } = useAuth();

  const toggleLike = (itemId: number) => {
    setItems(items.map(item => 
      item.id === itemId 
        ? { ...item, isLiked: !item.isLiked, likes: item.isLiked ? item.likes - 1 : item.likes + 1 }
        : item
    ));
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
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
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
                    <h3 className="font-medium mb-3">Condition</h3>
                    <div className="space-y-2">
                      {conditions.map((condition) => (
                        <label key={condition} className="flex items-center space-x-2">
                          <input type="checkbox" className="rounded" />
                          <span className="text-sm">{condition}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-3">Price Range</h3>
                    <div className="space-y-2">
                      {priceRanges.map((range) => (
                        <label key={range} className="flex items-center space-x-2">
                          <input type="radio" name="priceRange" className="rounded" />
                          <span className="text-sm">{range}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-3">Sustainability Score</h3>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" className="rounded" />
                        <span className="text-sm">90%+ (Excellent)</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" className="rounded" />
                        <span className="text-sm">80%+ (Very Good)</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" className="rounded" />
                        <span className="text-sm">70%+ (Good)</span>
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
                      <div className="aspect-square bg-muted flex items-center justify-center">
                        <div className="text-muted-foreground">Image</div>
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
                        <Link href={`/item/${item.id}`}>
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
                        
                        <Button className="w-full" asChild>
                          <Link href={`/item/${item.id}`}>
                            View Details
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


