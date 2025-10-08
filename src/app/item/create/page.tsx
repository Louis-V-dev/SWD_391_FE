'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  ArrowLeft, 
  Upload, 
  X, 
  Plus,
  Camera,
  DollarSign,
  Package,
  Info
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import ImageUpload from '@/components/ui/ImageUpload';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const categories = [
  'Clothing', 'Shoes', 'Accessories', 'Bags', 'Jewelry', 'Outerwear'
];

const conditions = [
  { value: 'new', label: 'New with tags' },
  { value: 'like-new', label: 'Like new' },
  { value: 'very-good', label: 'Very good' },
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' }
];

const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'One Size'];

const createItemSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title too long'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(1000, 'Description too long'),
  price: z.number().min(1, 'Price must be at least $1').max(10000, 'Price too high'),
  originalPrice: z.number().optional(),
  brand: z.string().min(1, 'Brand is required'),
  category: z.string().min(1, 'Category is required'),
  condition: z.string().min(1, 'Condition is required'),
  size: z.string().min(1, 'Size is required'),
  color: z.string().min(1, 'Color is required'),
  material: z.string().optional(),
});

type CreateItemFormData = z.infer<typeof createItemSchema>;

export default function CreateItemPage() {
  const [images, setImages] = useState<string[]>([]); // Changed from File[] to string[]
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateItemFormData>({
    resolver: zodResolver(createItemSchema),
  });

  const watchedPrice = watch('price');
  const watchedOriginalPrice = watch('originalPrice');

  const onSubmit = async (data: CreateItemFormData) => {
    try {
      setIsLoading(true);
      setError('');

      // Here you would upload images and create the item
      console.log('Creating item:', data);
      console.log('Images:', images);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create item');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = (urls: string[]) => { // Changed from File[] to string[]
    setImages(prev => [...prev, ...urls].slice(0, 10)); // Max 10 images
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const savings = watchedOriginalPrice && watchedPrice 
    ? Math.round(((watchedOriginalPrice - watchedPrice) / watchedOriginalPrice) * 100)
    : 0;

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
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          {/* Back Button */}
          <Button variant="ghost" className="mb-6" asChild>
            <Link href="/profile">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Profile
            </Link>
          </Button>

          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">List a New Item</h1>
            <p className="text-muted-foreground">
              Share your pre-loved fashion items with our sustainable community
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Images Section */}
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Camera className="h-5 w-5" />
                    <span>Photos</span>
                  </CardTitle>
                  <CardDescription>
                    Add up to 10 photos. The first photo will be your cover image.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ImageUpload onUpload={handleImageUpload} />
                  
                  {images.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      {images.map((imageUrl, index) => (
                        <div key={index} className="relative group">
                          <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                            <img
                              src={imageUrl} // Changed from URL.createObjectURL(image) to imageUrl
                              alt={`Upload ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => removeImage(index)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                          {index === 0 && (
                            <Badge className="absolute bottom-2 left-2">Cover</Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Basic Information */}
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Title *</label>
                    <Input
                      {...register('title')}
                      placeholder="e.g., Vintage Levi's Denim Jacket"
                      className={errors.title ? 'border-red-500' : ''}
                    />
                    {errors.title && (
                      <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Description *</label>
                    <textarea
                      {...register('description')}
                      rows={4}
                      placeholder="Describe your item's condition, fit, and any unique features..."
                      className={`w-full px-3 py-2 border rounded-md resize-none ${
                        errors.description ? 'border-red-500' : 'border-input'
                      }`}
                    />
                    {errors.description && (
                      <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Brand *</label>
                      <Input
                        {...register('brand')}
                        placeholder="e.g., Levi's, Nike, Zara"
                        className={errors.brand ? 'border-red-500' : ''}
                      />
                      {errors.brand && (
                        <p className="text-red-500 text-sm mt-1">{errors.brand.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Category *</label>
                      <select
                        {...register('category')}
                        className={`w-full px-3 py-2 border rounded-md ${
                          errors.category ? 'border-red-500' : 'border-input'
                        }`}
                      >
                        <option value="">Select a category</option>
                        {categories.map((category) => (
                          <option key={category} value={category.toLowerCase()}>
                            {category}
                          </option>
                        ))}
                      </select>
                      {errors.category && (
                        <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Condition *</label>
                      <select
                        {...register('condition')}
                        className={`w-full px-3 py-2 border rounded-md ${
                          errors.condition ? 'border-red-500' : 'border-input'
                        }`}
                      >
                        <option value="">Select condition</option>
                        {conditions.map((condition) => (
                          <option key={condition.value} value={condition.value}>
                            {condition.label}
                          </option>
                        ))}
                      </select>
                      {errors.condition && (
                        <p className="text-red-500 text-sm mt-1">{errors.condition.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Size *</label>
                      <select
                        {...register('size')}
                        className={`w-full px-3 py-2 border rounded-md ${
                          errors.size ? 'border-red-500' : 'border-input'
                        }`}
                      >
                        <option value="">Select size</option>
                        {sizes.map((size) => (
                          <option key={size} value={size}>
                            {size}
                          </option>
                        ))}
                      </select>
                      {errors.size && (
                        <p className="text-red-500 text-sm mt-1">{errors.size.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Color *</label>
                      <Input
                        {...register('color')}
                        placeholder="e.g., Blue, Black, White"
                        className={errors.color ? 'border-red-500' : ''}
                      />
                      {errors.color && (
                        <p className="text-red-500 text-sm mt-1">{errors.color.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Material (Optional)</label>
                    <Input
                      {...register('material')}
                      placeholder="e.g., 100% Cotton, Polyester Blend"
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Pricing */}
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <DollarSign className="h-5 w-5" />
                    <span>Pricing</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Your Price *</label>
                      <Input
                        type="number"
                        step="0.01"
                        {...register('price', { valueAsNumber: true })}
                        placeholder="0.00"
                        className={errors.price ? 'border-red-500' : ''}
                      />
                      {errors.price && (
                        <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Original Price (Optional)</label>
                      <Input
                        type="number"
                        step="0.01"
                        {...register('originalPrice', { valueAsNumber: true })}
                        placeholder="0.00"
                      />
                      <p className="text-sm text-muted-foreground mt-1">
                        Help buyers see the value
                      </p>
                    </div>
                  </div>

                  {savings > 0 && (
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <p className="text-green-800 dark:text-green-200 font-medium">
                        Buyers save {savings}% off the original price!
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Error Display */}
            {error && (
              <motion.div variants={itemVariants}>
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-red-800 dark:text-red-200">{error}</p>
                </div>
              </motion.div>
            )}

            {/* Actions */}
            <motion.div variants={itemVariants} className="flex justify-end space-x-4">
              <Button type="button" variant="outline" asChild>
                <Link href="/dashboard">Cancel</Link>
              </Button>
              <Button 
                type="submit" 
                variant="gradient" 
                disabled={isLoading || images.length === 0}
                className="min-w-[120px]"
              >
                {isLoading ? 'Creating...' : 'List Item'}
              </Button>
            </motion.div>
          </form>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
