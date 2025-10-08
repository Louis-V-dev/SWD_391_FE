'use client';

import React from 'react';
import Link from 'next/link';
import { Heart, MapPin, Package } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { motion } from 'framer-motion';

interface ItemCardProps {
  id: number;
  title: string;
  price: number;
  originalPrice: number;
  brand: string;
  condition: string;
  size: string;
  seller: string;
  location: string;
  sustainabilityScore: number;
  likes: number;
  isLiked: boolean;
  onToggleLike?: (id: number) => void;
  image?: string;
}

export default function ItemCard({
  id,
  title,
  price,
  originalPrice,
  brand,
  condition,
  size,
  seller,
  location,
  sustainabilityScore,
  likes,
  isLiked,
  onToggleLike,
  image
}: ItemCardProps) {
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
    <motion.div
      variants={itemVariants}
      whileHover={{ y: -5 }}
      className="group"
    >
      <Card className="overflow-hidden transition-shadow hover:shadow-lg">
        <div className="relative">
          <div className="aspect-square bg-muted flex items-center justify-center">
            {image ? (
              <img src={image} alt={title} className="w-full h-full object-cover" />
            ) : (
              <div className="text-muted-foreground">
                <Package className="w-16 h-16 text-primary/50" />
              </div>
            )}
          </div>
          
          {/* Overlays */}
          <div className="absolute top-3 left-3">
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              {sustainabilityScore}% Sustainable
            </Badge>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            className={`absolute top-3 right-3 ${
              isLiked ? 'text-red-500' : 'text-muted-foreground'
            }`}
            onClick={(e) => {
              e.preventDefault();
              onToggleLike?.(id);
            }}
          >
            <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
          </Button>
        </div>
        
        <CardContent className="p-4">
          <div className="space-y-2">
            <Link href={`/item/${id}`}>
              <h3 className="font-medium hover:text-primary transition-colors line-clamp-2">
                {title}
              </h3>
            </Link>
            
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <span>{brand}</span>
              <span>•</span>
              <span>Size {size}</span>
              <span>•</span>
              <span>{condition}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold">${price}</span>
                <span className="text-sm text-muted-foreground line-through">
                  ${originalPrice}
                </span>
              </div>
              <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                <Heart className="h-3 w-3" />
                <span>{likes}</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <MapPin className="h-3 w-3" />
              <span>{seller} • {location}</span>
            </div>
            
            <Button className="w-full" asChild>
              <Link href={`/item/${id}`}>
                View Details
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
