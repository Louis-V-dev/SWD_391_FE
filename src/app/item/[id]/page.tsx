'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
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
  Leaf,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { ItemsAPI } from '@/api/items';

// Mock data for fallback
const mockItemData = {
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
    'https://via.placeholder.com/600x600?text=No+Image',
  ],
  seller: {
    id: '123',
    name: 'Sarah Johnson',
    avatar: 'https://via.placeholder.com/100x100?text=User',
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
  const router = useRouter();
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    loadItem();
  }, [params.id]);

  const loadItem = async () => {
    try {
      setLoading(true);
      const itemData = await ItemsAPI.getItemById(params.id as string);
      setItem(itemData);
    } catch (error) {
      console.error('Failed to load item:', error);
      // Use mock data as fallback
      setItem(mockItemData);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = () => {
    if (!item) return;
    
    setAddingToCart(true);
    
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    
    const existingItem = cart.find((i: any) => i.itemId === item.itemId);
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({
        itemId: item.itemId,
        itemName: item.name,
        itemImage: item.primaryImageUrl || item.images?.[0],
        price: item.resellPrice || item.currentEstimatedValue || 0,
        quantity: 1,
      });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('cartUpdated'));
    
    setTimeout(() => {
      setAddingToCart(false);
      // Show success message or redirect
    }, 500);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-bold mb-2">Không tìm thấy sản phẩm</h2>
          <Button asChild>
            <Link href="/marketplace">Quay lại marketplace</Link>
          </Button>
        </div>
      </div>
    );
  }

  const itemImages = item.images && item.images.length > 0 
    ? item.images 
    : (item.primaryImageUrl 
        ? [item.primaryImageUrl] 
        : ['https://via.placeholder.com/600x600?text=No+Image']);

  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === itemImages.length - 1 ? 0 : prev + 1
    );
  };

  const previousImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? itemImages.length - 1 : prev - 1
    );
  };

  const price = item.resellPrice || item.currentEstimatedValue || 0;
  const originalPrice = item.originalPrice || price * 2;
  const discount = originalPrice > 0 ? Math.round((1 - price / originalPrice) * 100) : 0;

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
            <span className="text-foreground">{item.name}</span>
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
                Quay lại Marketplace
              </Link>
            </Button>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Image Gallery */}
            <motion.div variants={itemVariants}>
              <div className="space-y-4">
                {/* Main Image */}
                <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                  <img
                    src={itemImages[currentImageIndex]}
                    alt={`${item.name} - Image ${currentImageIndex + 1}`}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.currentTarget.src = 'https://via.placeholder.com/600x600?text=No+Image';
                    }}
                  />
                  
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
                    {currentImageIndex + 1} / {itemImages.length}
                  </div>
                  
                  {/* Verified Badge */}
                  {item.isVerified && (
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-green-500">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Đã xác minh
                      </Badge>
                  </div>
                  )}
                </div>

                {/* Thumbnail Images */}
                <div className="grid grid-cols-4 gap-2">
                  {itemImages.map((_img: string, index: number) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`aspect-square rounded-md overflow-hidden border-2 transition-colors ${
                        currentImageIndex === index 
                          ? 'border-primary' 
                          : 'border-transparent hover:border-border'
                      }`}
                    >
                      <img 
                        src={_img} 
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = 'https://via.placeholder.com/100x100?text=No+Image';
                        }}
                      />
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
                    <h1 className="text-3xl font-bold mb-2">{item.name}</h1>
                    <div className="flex items-center space-x-4">
                      <Badge variant="secondary">{item.conditionText || 'Tốt'}</Badge>
                      {item.brandName && (
                        <Badge variant="outline">{item.brandName}</Badge>
                      )}
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
                  <span className="text-4xl font-bold text-primary">{price.toLocaleString()} điểm</span>
                  {originalPrice > price && (
                    <>
                  <span className="text-xl text-muted-foreground line-through">
                        {originalPrice.toLocaleString()} điểm
                  </span>
                  <Badge variant="destructive">
                        -{discount}%
                  </Badge>
                    </>
                  )}
                </div>

                {/* Description */}
                <p className="text-muted-foreground leading-relaxed">
                  {item.description || 'Không có mô tả'}
                </p>
              </div>

              {/* Item Specifications */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Chi tiết sản phẩm</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {item.brandName && (
                    <div>
                        <span className="text-sm text-muted-foreground">Thương hiệu</span>
                        <p className="font-medium">{item.brandName}</p>
                    </div>
                    )}
                    {item.size && (
                    <div>
                      <span className="text-sm text-muted-foreground">Size</span>
                        <p className="font-medium">{item.size}</p>
                    </div>
                    )}
                    {item.color && (
                    <div>
                        <span className="text-sm text-muted-foreground">Màu sắc</span>
                        <p className="font-medium">{item.color}</p>
                    </div>
                    )}
                    {item.categoryName && (
                    <div>
                        <span className="text-sm text-muted-foreground">Danh mục</span>
                        <p className="font-medium">{item.categoryName}</p>
                    </div>
                    )}
                    <div>
                      <span className="text-sm text-muted-foreground">Tình trạng</span>
                      <p className="font-medium">{item.conditionText || 'Tốt'}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Trạng thái</span>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{item.itemStatus}</p>
                        {item.isVerified && (
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Shipping Info */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-4">
                    <Package className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-medium">Giao hàng miễn phí</p>
                      <p className="text-sm text-muted-foreground">
                        Ước tính giao hàng: 3-5 ngày làm việc
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="space-y-3">
                <Button 
                  size="lg" 
                  className="w-full" 
                  onClick={addToCart}
                  disabled={addingToCart}
                >
                  {addingToCart ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Đang thêm...
                    </>
                  ) : (
                    <>
                  <ShoppingBag className="w-4 h-4 mr-2" />
                      Thêm vào giỏ hàng
                    </>
                  )}
                </Button>
                <Button variant="outline" size="lg" className="w-full">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Nhắn tin người bán
                </Button>
              </div>

              {/* Seller Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Thông tin người bán</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-2">{item.currentOwnerName || item.ownerName || 'Green Loop'}</h3>

                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-2" />
                          Việt Nam
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tags */}
              {item.tags && item.tags.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">Tags</h3>
                <div className="flex flex-wrap gap-2">
                    {item.tags.map((tag: string) => (
                    <Badge key={tag} variant="secondary">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </div>
              )}

              {/* Item Stats */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div className="text-center">
                  <p className="text-2xl font-bold">{item.viewCount || 0}</p>
                  <p className="text-sm text-muted-foreground">Lượt xem</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{item.likeCount || 0}</p>
                  <p className="text-sm text-muted-foreground">Yêu thích</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Related Items */}
          <motion.div variants={itemVariants} className="mt-16">
            <h2 className="text-2xl font-bold mb-6">Sản phẩm tương tự</h2>
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