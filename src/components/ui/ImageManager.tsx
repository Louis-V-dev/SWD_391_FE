'use client';

import React, { useState } from 'react';
import { motion, Reorder } from 'framer-motion';
import { 
  X, 
  GripVertical,
  Star,
  Image as ImageIcon,
  Upload
} from 'lucide-react';
import { Button } from './Button';
import { Badge } from './Badge';

interface ImageManagerProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  onUploadClick: () => void;
  maxImages?: number;
  className?: string;
}

export default function ImageManager({
  images,
  onImagesChange,
  onUploadClick,
  maxImages = 10,
  className = ''
}: ImageManagerProps) {
  
  const handleRemove = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  const handleSetPrimary = (index: number) => {
    if (index === 0) return; // Already primary
    
    const newImages = [...images];
    const [primaryImage] = newImages.splice(index, 1);
    newImages.unshift(primaryImage);
    onImagesChange(newImages);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Button */}
      {images.length < maxImages && (
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={onUploadClick}
        >
          <Upload className="w-4 h-4 mr-2" />
          Add More Images ({images.length}/{maxImages})
        </Button>
      )}

      {/* Images Grid with Drag & Drop */}
      {images.length > 0 && (
        <div>
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">
              Drag to reorder • First image is your main photo
            </p>
            <Badge variant="outline" className="text-xs">
              {images.length} image{images.length !== 1 ? 's' : ''}
            </Badge>
          </div>

          <Reorder.Group
            axis="y"
            values={images}
            onReorder={onImagesChange}
            className="space-y-3"
          >
            {images.map((imageUrl, index) => (
              <Reorder.Item
                key={imageUrl}
                value={imageUrl}
                className="list-none"
              >
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="group relative bg-muted/50 rounded-lg border border-border hover:border-primary/50 transition-colors overflow-hidden"
                >
                  <div className="flex items-center p-3 space-x-3">
                    {/* Drag Handle */}
                    <div className="cursor-grab active:cursor-grabbing flex-shrink-0">
                      <GripVertical className="w-5 h-5 text-muted-foreground" />
                    </div>

                    {/* Image Preview */}
                    <div className="relative w-20 h-20 bg-muted rounded-md overflow-hidden flex-shrink-0">
                      <img
                        src={imageUrl}
                        alt={`Image ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Image Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium truncate">
                          Image {index + 1}
                        </p>
                        {index === 0 && (
                          <Badge variant="default" className="text-xs">
                            <Star className="w-3 h-3 mr-1 fill-current" />
                            Main Photo
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {index === 0 
                          ? 'This is your main listing photo' 
                          : 'Click star to set as main photo'
                        }
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2 flex-shrink-0">
                      {index !== 0 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSetPrimary(index)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Star className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleRemove(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Primary Image Highlight */}
                  {index === 0 && (
                    <div className="absolute inset-0 border-2 border-primary rounded-lg pointer-events-none" />
                  )}
                </motion.div>
              </Reorder.Item>
            ))}
          </Reorder.Group>
        </div>
      )}

      {/* Empty State */}
      {images.length === 0 && (
        <div className="text-center py-12 border-2 border-dashed border-border rounded-lg">
          <ImageIcon className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground mb-4">No images uploaded yet</p>
          <Button type="button" variant="outline" onClick={onUploadClick}>
            <Upload className="w-4 h-4 mr-2" />
            Upload Your First Image
          </Button>
        </div>
      )}
    </div>
  );
}










