'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  ArrowLeft, 
  Camera,
  DollarSign,
  Loader2
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import ImageUpload from '@/components/ui/ImageUpload';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { formatApiError } from '@/utils/errorMessages';
import { ItemsAPI, CategoriesAPI, BrandsAPI, handleApiError } from '@/api';
import { AcquisitionMethod, Brand, Category, CreateItemRequest, UpdateItemRequest } from '@/types';

const conditionOptions = [
  { value: 5, label: 'New with tags' },
  { value: 4.5, label: 'Like new' },
  { value: 4, label: 'Very good' },
  { value: 3.5, label: 'Good' },
  { value: 3, label: 'Fair' }
];

const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'One Size'];

const createItemSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters').max(200, 'Name too long'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(2000, 'Description too long'),
  categoryId: z.string().min(1, 'Category is required'),
  brandId: z.string().optional(),
  size: z.string().optional(),
  color: z.string().optional(),
  conditionScore: z.number().min(1, 'Condition score must be at least 1').max(5, 'Condition score cannot exceed 5'),
  conditionDescription: z.string().optional(),
  originalPrice: z.number().min(0).optional(),
  resellPrice: z.number().min(1, 'Resell price must be at least 1'),
  weightGrams: z.number().min(0).optional(),
});

type CreateItemFormData = z.infer<typeof createItemSchema>;

export default function CreateItemPage() {
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPrefilling, setIsPrefilling] = useState(false);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const editingItemId = searchParams.get('itemId');
  const isEditing = Boolean(editingItemId);
  const initialImagesRef = useRef<string[]>([]);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<CreateItemFormData>({
    resolver: zodResolver(createItemSchema),
    defaultValues: {
      conditionScore: 4,
      categoryId: '',
      brandId: '',
      size: '',
      color: '',
    }
  });

  const watchedResellPrice = watch('resellPrice');
  const watchedOriginalPrice = watch('originalPrice');
  const watchedConditionScore = watch('conditionScore');

  useEffect(() => {
    if (!editingItemId) {
      initialImagesRef.current = [];
      return;
    }

    const loadItem = async () => {
      try {
        setIsPrefilling(true);
        setError('');
        const item = await ItemsAPI.getItemById(editingItemId);

        reset({
          name: item.name ?? '',
          description: item.description ?? '',
          categoryId: item.categoryId ?? '',
          brandId: item.brandId ?? '',
          size: item.size ?? '',
          color: item.color ?? '',
          conditionScore: item.conditionScore ?? 4,
          conditionDescription: item.conditionDescription ?? '',
          originalPrice: item.originalPrice ?? undefined,
          resellPrice: item.resellPrice ?? item.currentEstimatedValue ?? undefined,
          weightGrams: item.weightGrams ?? undefined,
        });

        const existingImages = item.images ?? [];
        setUploadedUrls(existingImages);
        initialImagesRef.current = existingImages;
        setSelectedFiles([]);
      } catch (err) {
        console.error('Failed to load item for editing', err);
        setError('Unable to load item details. Please try again or contact support.');
      } finally {
        setIsPrefilling(false);
      }
    };

    loadItem();
  }, [editingItemId, reset]);

  useEffect(() => {
    const loadMetadata = async () => {
      try {
        const [activeCategories, activeBrands] = await Promise.all([
          CategoriesAPI.getActiveCategories(),
          BrandsAPI.getActiveBrands()
        ]);
        setCategories(activeCategories ?? []);
        setBrands(activeBrands ?? []);
      } catch (err) {
        console.error('Failed to load item metadata', err);
      }
    };

    loadMetadata();
  }, []);

  const onSubmit = async (data: CreateItemFormData) => {
    if (!user?.userId) {
      setError('You must be logged in to manage items.');
      return;
    }

    if (isPrefilling) {
      return;
    }

    const remoteImages = uploadedUrls.filter(url => !url.startsWith('blob:'));
    const hasRemoteImages = remoteImages.length > 0;
    const hasNewFiles = selectedFiles.length > 0;

    if (!hasRemoteImages && !hasNewFiles) {
      setError('Please upload at least one image for your item.');
      return;
    }

    try {
      setIsLoading(true);
      setError('');

      if (isEditing && editingItemId) {
        const updatePayload: UpdateItemRequest = {
          categoryId: data.categoryId,
          brandId: data.brandId ? data.brandId : undefined,
          name: data.name,
          description: data.description,
          size: data.size ? data.size : undefined,
          color: data.color ? data.color : undefined,
          conditionScore: data.conditionScore,
          conditionDescription: data.conditionDescription ? data.conditionDescription : undefined,
          originalPrice: data.originalPrice ?? undefined,
          currentEstimatedValue: data.originalPrice ?? data.resellPrice,
          resellPrice: data.resellPrice,
          weightGrams: data.weightGrams ?? undefined,
          images: hasRemoteImages ? remoteImages : [],
        };

        await ItemsAPI.updateItem(editingItemId, updatePayload);

        const removedImages = initialImagesRef.current.filter(url => !remoteImages.includes(url));
        if (removedImages.length > 0) {
          await Promise.all(
            removedImages.map((imageUrl) => ItemsAPI.removeImage(editingItemId, imageUrl))
          );
        }

        if (selectedFiles.length > 0) {
          await ItemsAPI.uploadMultipleImages(editingItemId, selectedFiles);
        }

        router.push('/profile/items');
        return;
      }

      const payload: CreateItemRequest = {
        categoryId: data.categoryId,
        brandId: data.brandId ? data.brandId : undefined,
        name: data.name,
        description: data.description,
        size: data.size ? data.size : undefined,
        color: data.color ? data.color : undefined,
        conditionScore: data.conditionScore,
        conditionDescription: data.conditionDescription ? data.conditionDescription : undefined,
        originalPrice: data.originalPrice ?? undefined,
        currentEstimatedValue: data.originalPrice ?? data.resellPrice,
        resellPrice: data.resellPrice,
        weightGrams: data.weightGrams ?? undefined,
        acquisitionMethod: AcquisitionMethod.COLLECTED,
        images: undefined,
        tags: [],
        metadata: {
          createdVia: 'USER_PORTAL',
        },
      };

      const createdItem = await ItemsAPI.createItem(payload, user.userId);

      if (createdItem?.itemId && selectedFiles.length > 0) {
        await ItemsAPI.uploadMultipleImages(createdItem.itemId, selectedFiles);
      }

      router.push('/profile/items');
    } catch (err) {
      const backendMessage = handleApiError(err);
      const friendlyMessage = formatApiError(
        backendMessage,
        'items',
        isEditing ? 'Failed to update item. Please try again.' : 'Failed to create item. Please try again.'
      );
      setError(friendlyMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = useCallback((urls: string[]) => {
    setUploadedUrls(urls.slice(0, 10));
  }, []);

  const handleFileSelect = useCallback((files: File[]) => {
    setSelectedFiles(files.slice(0, 10));
  }, []);

  const savings = watchedOriginalPrice && watchedResellPrice 
    ? Math.round(((watchedOriginalPrice - watchedResellPrice) / watchedOriginalPrice) * 100)
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

  if (isPrefilling) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

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
            <h1 className="text-3xl font-bold mb-2">
              {isEditing ? 'Edit Item' : 'List a New Item'}
            </h1>
            <p className="text-muted-foreground">
              {isEditing
                ? 'Update your listing details and keep potential buyers informed.'
                : 'Share your pre-loved fashion items with our sustainable community'}
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
                  <ImageUpload
                    onUpload={handleImageUpload}
                    existingImages={uploadedUrls.filter(url => !url.startsWith('blob:'))}
                    mode="deferred"
                    onFileSelect={handleFileSelect}
                  />
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
                    <label className="block text-sm font-medium mb-2">Name *</label>
                    <Input
                      {...register('name')}
                      placeholder="e.g., Vintage Levi's Denim Jacket"
                      className={errors.name ? 'border-red-500' : ''}
                    />
                    {errors.name && (
                      <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
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
                      <label className="block text-sm font-medium mb-2">Category *</label>
                      <select
                        {...register('categoryId')}
                        className={`w-full px-3 py-2 border rounded-md ${
                          errors.categoryId ? 'border-red-500' : 'border-input'
                        }`}
                      >
                        <option value="">Select a category</option>
                        {categories.map((category) => (
                          <option key={category.categoryId} value={category.categoryId}>
                            {category.name}
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
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Size</label>
                      <select
                        {...register('size')}
                        className="w-full px-3 py-2 border rounded-md border-input"
                      >
                        <option value="">Select size (optional)</option>
                        {sizes.map((size) => (
                          <option key={size} value={size}>
                            {size}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Color</label>
                      <Input
                        {...register('color')}
                        placeholder="e.g., Blue, Black, White"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Weight (grams)</label>
                      <Input
                        type="number"
                        step="1"
                        {...register('weightGrams', { valueAsNumber: true })}
                        placeholder="e.g., 500"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Condition & Pricing */}
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <DollarSign className="h-5 w-5" />
                    <span>Condition & Pricing</span>
                  </CardTitle>
                  <CardDescription>
                    Set a fair price and describe the condition so buyers know what to expect.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Condition Score *</label>
                      <select
                        {...register('conditionScore', { valueAsNumber: true })}
                        className={`w-full px-3 py-2 border rounded-md ${
                          errors.conditionScore ? 'border-red-500' : 'border-input'
                        }`}
                      >
                        <option value="">Select condition</option>
                        {conditionOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      {errors.conditionScore && (
                        <p className="text-red-500 text-sm mt-1">{errors.conditionScore.message}</p>
                      )}
                      <p className="text-sm text-muted-foreground mt-2">
                        Selected score: {watchedConditionScore ? `${watchedConditionScore}/5` : 'Not set yet'}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Condition Details</label>
                      <Input
                        {...register('conditionDescription')}
                        placeholder="e.g., Worn twice, no visible flaws"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Resell Price *</label>
                      <Input
                        type="number"
                        step="0.01"
                        {...register('resellPrice', { valueAsNumber: true })}
                        placeholder="0.00"
                        className={errors.resellPrice ? 'border-red-500' : ''}
                      />
                      {errors.resellPrice && (
                        <p className="text-red-500 text-sm mt-1">{errors.resellPrice.message}</p>
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
                disabled={isLoading}
                className="min-w-[120px]"
              >
                {isLoading ? (isEditing ? 'Saving...' : 'Creating...') : (isEditing ? 'Save Changes' : 'List Item')}
              </Button>
            </motion.div>
          </form>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
