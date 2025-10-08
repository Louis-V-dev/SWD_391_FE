'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useParams } from 'next/navigation';
import { 
  ArrowLeft, 
  Heart, 
  Share2, 
  ShoppingBag,
  Star,
  MapPin,
  Calendar,
  Package,
  Truck,
  Shield,
  ChevronLeft,
  ChevronRight,
  User,
  MessageCircle,
  Info,
  Leaf
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

// Mock data - in real app, this would come from API
const itemData = {
  id: '1',
  title: 'Vintage Denim Jacket',
  description: 'A beautiful vintage denim jacket in excellent condition. This classic piece features authentic wear patterns and has been carefully maintained. Perfect for layering and adding a timeless touch to any outfit.',
  price: 45,
  originalPrice: 120,
  condition: 'Very Good',
  size: 'M',
  brand: 'Levi\'s',
  category: 'Jackets',
  color: 'Blue',
  material: '100% Cotton',
  sustainabilityScore: 85,
  images: [
    '/api/placeholder/600/600',
    '/api/placeholder/600/600',
    '/api/placeholder/600/600',
    '/api/placeholder/600/600',
  ],
  seller: {
    id: '123',
    name: 'Sarah Johnson',
    avatar: '/api/placeholder/100/100',
    rating: 4.8,
    reviewCount: 42,
    responseTime: '< 1 hour',
    location: 'San Francisco, CA',
    joinedDate: 'March 2023',
    sustainabilityBadge: 'Eco Champion'
  },
  shipping: {
    cost: 5,
    estimatedDays: '3-5',
    freeShippingThreshold: 50
  },
  tags: ['vintage', 'sustainable', 'authentic', 'classic'],
  views: 234,
  favorites: 18,
  postedDate: '2024-01-15',
  lastUpdated: '2024-01-20'
};

export default function ItemDetailPage() {
  const params = useParams();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);
  const [selectedSize, setSelectedSize] = useState(itemData.size);

  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === itemData.images.length - 1 ? 0 : prev + 1
    );
  };

  const previousImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? itemData.images.length - 1 : prev - 1
    );
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
      
      {/* Breadcrumb */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-2 text-sm">
            <Link href="/" className="text-muted-foreground hover:text-foreground">
              Home
            </Link>
            <span className="text-muted-foreground">/</span>
            <Link href="/marketplace" className="text-muted-foreground hover:text-foreground">
              Marketplace
            </Link>
            <span className="text-muted-foreground">/</span>
            <span className="text-foreground">{itemData.title}</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Back Button */}
          <motion.div variants={itemVariants} className="mb-6">
            <Button variant="ghost" className="mb-4" asChild>
              <Link href="/marketplace">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Marketplace
              </Link>
            </Button>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Image Gallery */}
            <motion.div variants={itemVariants}>
              <div className="space-y-4">
                {/* Main Image */}
                <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary-light/20 flex items-center justify-center">
                    <Package className="w-32 h-32 text-primary/50" />
                  </div>
                  
                  {/* Navigation Arrows */}
                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm"
                    onClick={previousImage}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm"
                    onClick={nextImage}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>

                  {/* Image Counter */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                    {currentImageIndex + 1} / {itemData.images.length}
                  </div>
                </div>

                {/* Thumbnail Images */}
                <div className="grid grid-cols-4 gap-2">
                  {itemData.images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`aspect-square rounded-md overflow-hidden border-2 transition-colors ${
                        currentImageIndex === index 
                          ? 'border-primary' 
                          : 'border-transparent hover:border-border'
                      }`}
                    >
                      <div className="w-full h-full bg-muted flex items-center justify-center">
                        <Package className="w-8 h-8 text-muted-foreground" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Item Details */}
            <motion.div variants={itemVariants} className="space-y-6">
              {/* Title and Actions */}
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold mb-2">{itemData.title}</h1>
                    <div className="flex items-center space-x-4">
                      <Badge variant="secondary">{itemData.condition}</Badge>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Leaf className="w-4 h-4 mr-1 text-green-500" />
                        {itemData.sustainabilityScore}% Sustainable
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setIsFavorited(!isFavorited)}
                    >
                      <Heart className={`w-4 h-4 ${isFavorited ? 'fill-red-500 text-red-500' : ''}`} />
                    </Button>
                    <Button variant="outline" size="icon">
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Price */}
                <div className="flex items-baseline space-x-4 mb-6">
                  <span className="text-4xl font-bold text-primary">${itemData.price}</span>
                  <span className="text-xl text-muted-foreground line-through">
                    ${itemData.originalPrice}
                  </span>
                  <Badge variant="destructive">
                    {Math.round((1 - itemData.price / itemData.originalPrice) * 100)}% off
                  </Badge>
                </div>

                {/* Description */}
                <p className="text-muted-foreground leading-relaxed">
                  {itemData.description}
                </p>
              </div>

              {/* Item Specifications */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Item Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-muted-foreground">Brand</span>
                      <p className="font-medium">{itemData.brand}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Size</span>
                      <p className="font-medium">{itemData.size}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Color</span>
                      <p className="font-medium">{itemData.color}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Material</span>
                      <p className="font-medium">{itemData.material}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Category</span>
                      <p className="font-medium">{itemData.category}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Condition</span>
                      <p className="font-medium">{itemData.condition}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Shipping Info */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-4">
                    <Truck className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-medium">
                        {itemData.shipping.cost === 0 ? 'Free shipping' : `$${itemData.shipping.cost} shipping`}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Estimated delivery: {itemData.shipping.estimatedDays} business days
                      </p>
                      {itemData.price < itemData.shipping.freeShippingThreshold && (
                        <p className="text-sm text-muted-foreground">
                          Free shipping on orders over ${itemData.shipping.freeShippingThreshold}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="space-y-3">
                <Button size="lg" className="w-full">
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  Add to Cart
                </Button>
                <Button variant="outline" size="lg" className="w-full">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Message Seller
                </Button>
              </div>

              {/* Seller Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Seller Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-semibold">{itemData.seller.name}</h3>
                        <Badge variant="outline" className="text-xs">
                          {itemData.seller.sustainabilityBadge}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center space-x-4 mb-3">
                        <div className="flex items-center">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
                          <span className="font-medium">{itemData.seller.rating}</span>
                          <span className="text-muted-foreground text-sm ml-1">
                            ({itemData.seller.reviewCount} reviews)
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-2" />
                          {itemData.seller.location}
                        </div>
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2" />
                          Joined {itemData.seller.joinedDate}
                        </div>
                        <div className="flex items-center">
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Usually responds in {itemData.seller.responseTime}
                        </div>
                      </div>

                      <Button variant="outline" size="sm" className="mt-4" asChild>
                        <Link href={`/profile/${itemData.seller.id}`}>
                          View Profile
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tags */}
              <div>
                <h3 className="font-semibold mb-3">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {itemData.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Item Stats */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                <div className="text-center">
                  <p className="text-2xl font-bold">{itemData.views}</p>
                  <p className="text-sm text-muted-foreground">Views</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{itemData.favorites}</p>
                  <p className="text-sm text-muted-foreground">Favorites</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">
                    {Math.floor((Date.now() - new Date(itemData.postedDate).getTime()) / (1000 * 60 * 60 * 24))}
                  </p>
                  <p className="text-sm text-muted-foreground">Days Listed</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Related Items */}
          <motion.div variants={itemVariants} className="mt-16">
            <h2 className="text-2xl font-bold mb-6">Similar Items</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((item) => (
                <Card key={item} className="group cursor-pointer hover:shadow-lg transition-shadow">
                  <div className="aspect-square bg-muted relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary-light/20 flex items-center justify-center">
                      <Package className="w-16 h-16 text-primary/50" />
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-2">Related Item {item}</h3>
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-primary">$35</span>
                      <Badge variant="secondary">Very Good</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
} 