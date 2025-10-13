'use client';

import React, { useState, useEffect } from 'react';
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
  Camera,
  DollarSign,
  Package,
  CheckCircle,
  Star,
  Hash
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import AdminLayout from '@/components/layout/AdminLayout';
import { ItemsAPI, CategoriesAPI, BrandsAPI } from '@/api';
import { useAuth } from '@/contexts/AuthContext';
import { AcquisitionMethod, ItemStatus } from '@/types';

const createItemSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters').max(200, 'Name too long'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(2000, 'Description too long'),
  categoryId: z.string().min(1, 'Category is required'),
  brandId: z.string().optional(),
  size: z.string().optional(),
  color: z.string().optional(),
  conditionScore: z.number().min(1).max(5, 'Condition score must be between 1 and 5'),
  conditionDescription: z.string().optional(),
  originalPrice: z.number().min(0).optional(),
  currentEstimatedValue: z.number().min(0).optional(),
  weightGrams: z.number().min(1).optional(),
  acquisitionMethod: z.string().min(1, 'Acquisition method is required'),
});

type CreateItemFormData = z.infer<typeof createItemSchema>;

export default function AdminCreateItemPage() {
  const [images, setImages] = useState<File[]>([]);
  const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CreateItemFormData>({
    resolver: zodResolver(createItemSchema),
    defaultValues: {
      conditionScore: 5.0,
      acquisitionMethod: AcquisitionMethod.COLLECTED
    }
  });

  useEffect(() => {
    fetchCategories();
    fetchBrands();
  }, []);

  const fetchCategories = async () => {
    try {
      const cats = await CategoriesAPI.getActiveCategories();
      setCategories(cats);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchBrands = async () => {
    try {
      const brandsData = await BrandsAPI.getActiveBrands();
      setBrands(brandsData);
    } catch (error) {
      console.error('Failed to fetch brands:', error);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newImages = Array.from(files).slice(0, 10 - images.length);
      setImages(prev => [...prev, ...newImages]);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const uploadImagesToBackend = async (itemId: string): Promise<string[]> => {
    setUploadingImages(true);
    const uploadedUrls: string[] = [];

    try {
      for (const file of images) {
        const response = await ItemsAPI.uploadImage(itemId, file);
        if (response.images && response.images.length > 0) {
          uploadedUrls.push(...response.images);
        }
      }
      return uploadedUrls;
    } catch (error) {
      console.error('Image upload failed:', error);
      throw error;
    } finally {
      setUploadingImages(false);
    }
  };

  const onSubmit = async (data: CreateItemFormData) => {
    if (!user?.userId) {
      setError('You must be logged in to create items');
      return;
    }

    try {
      setIsLoading(true);
      setError('');

      // Create item with admin privileges
      const itemData = {
        ...data,
        acquisitionMethod: data.acquisitionMethod as AcquisitionMethod,
        tags: ['admin-created', 'verified'],
        metadata: {
          createdByAdmin: true,
          trackingNumber: generateTrackingNumber(),
          verifiedAt: new Date().toISOString()
        }
      };

      // Create the item
      const createdItem = await ItemsAPI.createItem(itemData, user.userId);

      // Auto-verify the item (admin created items are pre-verified)
      await ItemsAPI.verifyItem(createdItem.itemId, user.userId);

      // Upload images if any
      if (images.length > 0) {
        await uploadImagesToBackend(createdItem.itemId);
      }

      alert('Item created and verified successfully! Tracking number: ' + itemData.metadata.trackingNumber);
      router.push('/admin/items');
    } catch (err: any) {
      setError(err.message || 'Failed to create item');
    } finally {
      setIsLoading(false);
    }
  };

  const generateTrackingNumber = (): string => {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `GL-${timestamp}-${random}`;
  };

  const watchedConditionScore = watch('conditionScore');

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Create Item (Admin)</h1>
            <p className="text-muted-foreground">
              Admin-created items are auto-verified and tracked with unique numbers
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/admin/items">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Link>
          </Button>
        </div>

        {/* Info Banner */}
        <Card className="border-green-200 bg-green-50 dark:bg-green-900/20">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-green-900 dark:text-green-100 mb-1">
                  Admin Item Creation
                </h3>
                <p className="text-sm text-green-800 dark:text-green-200">
                  Items created by admins are automatically verified, get a unique tracking number, 
                  and are marked as reliable for faster marketplace listing.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Images Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Camera className="h-5 w-5" />
                <span>Photos</span>
              </CardTitle>
              <CardDescription>
                Add up to 10 photos. First photo will be the main image.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* File Input */}
              <div>
                <label className="flex items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                  <div className="text-center">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Click to upload images (max 10)
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {images.length}/10 selected
                    </p>
                  </div>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                    disabled={images.length >= 10}
                  />
                </label>
              </div>

              {/* Image Previews */}
              {images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {images.map((image, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                        <img
                          src={URL.createObjectURL(image)}
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
                        <Badge className="absolute bottom-2 left-2">
                          <Star className="w-3 h-3 mr-1" />
                          Main
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">Item Name *</label>
                  <Input
                    {...register('name')}
                    placeholder="e.g., Vintage Levi's Denim Jacket"
                    className={errors.name ? 'border-red-500' : ''}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">Description *</label>
                  <textarea
                    {...register('description')}
                    rows={4}
                    placeholder="Detailed description of the item, condition, features..."
                    className={`w-full px-3 py-2 border rounded-md resize-none ${
                      errors.description ? 'border-red-500' : 'border-input'
                    }`}
                  />
                  {errors.description && (
                    <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Category *</label>
                  <select
                    {...register('categoryId')}
                    className={`w-full px-3 py-2 border rounded-md ${
                      errors.categoryId ? 'border-red-500' : 'border-input'
                    }`}
                  >
                    <option value="">Select category</option>
                    {categories.map((cat) => (
                      <option key={cat.categoryId} value={cat.categoryId}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  {errors.categoryId && (
                    <p className="text-red-500 text-sm mt-1">{errors.categoryId.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Brand</label>
                  <select
                    {...register('brandId')}
                    className="w-full px-3 py-2 border rounded-md border-input"
                  >
                    <option value="">Select brand (optional)</option>
                    {brands.map((brand) => (
                      <option key={brand.brandId} value={brand.brandId}>
                        {brand.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Size</label>
                  <Input
                    {...register('size')}
                    placeholder="e.g., M, L, XL"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Color</label>
                  <Input
                    {...register('color')}
                    placeholder="e.g., Blue, Black, Red"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Weight (grams)</label>
                  <Input
                    type="number"
                    {...register('weightGrams', { valueAsNumber: true })}
                    placeholder="e.g., 500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Acquisition Method *</label>
                  <select
                    {...register('acquisitionMethod')}
                    className={`w-full px-3 py-2 border rounded-md ${
                      errors.acquisitionMethod ? 'border-red-500' : 'border-input'
                    }`}
                  >
                    <option value={AcquisitionMethod.COLLECTED}>Collected</option>
                    <option value={AcquisitionMethod.PURCHASED}>Purchased</option>
                    <option value={AcquisitionMethod.TRADED}>Traded</option>
                    <option value={AcquisitionMethod.DONATED}>Donated</option>
                    <option value={AcquisitionMethod.IMPORTED}>Imported</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Condition & Pricing */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5" />
                <span>Condition & Pricing</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Condition Score * (1-5)
                  </label>
                  <div className="flex items-center space-x-3">
                    <Input
                      type="number"
                      step="0.1"
                      min="1"
                      max="5"
                      {...register('conditionScore', { valueAsNumber: true })}
                      className={errors.conditionScore ? 'border-red-500' : ''}
                    />
                    <div className="flex items-center space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${
                            i < Math.round(watchedConditionScore || 0)
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  {errors.conditionScore && (
                    <p className="text-red-500 text-sm mt-1">{errors.conditionScore.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Condition Description
                  </label>
                  <Input
                    {...register('conditionDescription')}
                    placeholder="e.g., Excellent, minor wear on sleeves"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Original Price ($)</label>
                  <Input
                    type="number"
                    step="0.01"
                    {...register('originalPrice', { valueAsNumber: true })}
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Current Estimated Value ($)
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    {...register('currentEstimatedValue', { valueAsNumber: true })}
                    placeholder="0.00"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Admin Features */}
          <Card className="border-blue-200 bg-blue-50 dark:bg-blue-900/20">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-blue-900 dark:text-blue-100">
                <Hash className="h-5 w-5" />
                <span>Admin Features</span>
              </CardTitle>
              <CardDescription className="text-blue-800 dark:text-blue-200">
                Automatic features for admin-created items
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-blue-900 dark:text-blue-100">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Auto-verified upon creation</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Unique tracking number generated (GL-XXXXX-XXXXX)</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Marked as reliable/trusted source</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Ready for immediate marketplace listing</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Journey tracking enabled</span>
              </div>
            </CardContent>
          </Card>

          {/* Error Display */}
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" asChild>
              <Link href="/admin/items">Cancel</Link>
            </Button>
            <Button 
              type="submit" 
              variant="default"
              disabled={isLoading || uploadingImages}
              className="min-w-[180px]"
            >
              {isLoading 
                ? (uploadingImages ? 'Uploading images...' : 'Creating...') 
                : 'Create & Verify Item'
              }
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}

