'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  ArrowLeft,
  Save,
  Camera,
  DollarSign,
  Star,
  Package,
  Upload,
  X
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Select';
import AdminLayout from '@/components/layout/AdminLayout';
import { ItemsAPI, CategoriesAPI, BrandsAPI } from '@/api';
import { useAuth } from '@/contexts/AuthContext';
import { AcquisitionMethod, ItemStatus } from '@/types';
import type { ItemResponse } from '@/types';

const editItemSchema = z.object({
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
  resellPrice: z.number().min(0).optional(),
  weightGrams: z.number().min(1).optional(),
  acquisitionMethod: z.string().optional(),
  itemStatus: z.string().optional(),
});

type EditItemFormData = z.infer<typeof editItemSchema>;

export default function AdminEditItemPage() {
  const params = useParams();
  const router = useRouter();
  const itemId = params.id as string;
  const { user } = useAuth();

  const [item, setItem] = useState<ItemResponse | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [newImages, setNewImages] = useState<File[]>([]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<EditItemFormData>({
    resolver: zodResolver(editItemSchema),
  });

  useEffect(() => {
    fetchData();
  }, [itemId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [itemData, cats, brandsData] = await Promise.all([
        ItemsAPI.getItemById(itemId),
        CategoriesAPI.getActiveCategories(),
        BrandsAPI.getActiveBrands(),
      ]);

      setItem(itemData);
      setCategories(cats);
      setBrands(brandsData);

      // Populate form with item data
      setValue('name', itemData.name);
      setValue('description', itemData.description || '');
      setValue('categoryId', itemData.categoryId || '');
      setValue('brandId', itemData.brandId || '');
      setValue('size', itemData.size || '');
      setValue('color', itemData.color || '');
      setValue('conditionScore', itemData.conditionScore || 5);
      setValue('conditionDescription', itemData.conditionDescription || '');
      setValue('originalPrice', itemData.originalPrice || 0);
      setValue('currentEstimatedValue', itemData.currentEstimatedValue || 0);
      setValue('resellPrice', itemData.resellPrice || 0);
      setValue('weightGrams', itemData.weightGrams || 0);
      setValue('acquisitionMethod', itemData.acquisitionMethod || AcquisitionMethod.COLLECTED);
      setValue('itemStatus', itemData.itemStatus || ItemStatus.SUBMITTED);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch item');
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const imageFiles = Array.from(files).slice(0, 10 - newImages.length);
      setNewImages(prev => [...prev, ...imageFiles]);
    }
  };

  const removeNewImage = (index: number) => {
    setNewImages(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: EditItemFormData) => {
    try {
      setSaving(true);
      setError('');

      // Update item data
      await ItemsAPI.updateItem(itemId, data as any);

      // Upload new images if any
      if (newImages.length > 0) {
        await ItemsAPI.uploadMultipleImages(itemId, newImages);
      }

      // Redirect back to detail page
      router.push(`/admin/items/${itemId}`);
    } catch (err: any) {
      setError(err.message || 'Failed to update item');
    } finally {
      setSaving(false);
    }
  };

  const watchedConditionScore = watch('conditionScore');

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    );
  }

  if (error && !item) {
    return (
      <AdminLayout>
        <div className="p-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
          </div>
          <Button asChild variant="outline" className="mt-4">
            <Link href="/admin/items">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Items
            </Link>
          </Button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Edit Item</h1>
            <p className="text-muted-foreground">
              Update item information and images
            </p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" asChild>
              <Link href={`/admin/items/${itemId}`}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Cancel
              </Link>
            </Button>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Current Images */}
          {item?.images && item.images.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Camera className="h-5 w-5" />
                  <span>Current Images</span>
                </CardTitle>
                <CardDescription>
                  These are the existing images for this item
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {item.images.map((url, index) => (
                    <div key={index} className="relative">
                      <div className="aspect-square bg-muted rounded-lg overflow-hidden border">
                        <img
                          src={url}
                          alt={`Current ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      {index === 0 && (
                        <Badge className="absolute bottom-2 left-2 bg-yellow-500">
                          <Star className="w-3 h-3 mr-1 fill-white" />
                          Primary
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Add New Images */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Upload className="h-5 w-5" />
                <span>Add New Images</span>
              </CardTitle>
              <CardDescription>
                Upload additional images (optional)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="flex items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                  <div className="text-center">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Click to upload additional images
                    </p>
                  </div>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                </label>
              </div>

              {newImages.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {newImages.map((image, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square bg-muted rounded-lg overflow-hidden border">
                        <img
                          src={URL.createObjectURL(image)}
                          alt={`New ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeNewImage(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
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
                    placeholder="Detailed description of the item..."
                    className={`w-full px-3 py-2 border rounded-md resize-none ${
                      errors.description ? 'border-red-500' : 'border-input'
                    }`}
                  />
                  {errors.description && (
                    <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
                  )}
                </div>

                <div>
                  <Select
                    label="Category *"
                    error={errors.categoryId?.message}
                    {...register('categoryId')}
                  >
                    <option value="">Select category</option>
                    {categories.map((cat) => (
                      <option key={cat.categoryId} value={cat.categoryId}>
                        {cat.name}
                      </option>
                    ))}
                  </Select>
                </div>

                <div>
                  <Select
                    label="Brand"
                    {...register('brandId')}
                  >
                    <option value="">Select brand (optional)</option>
                    {brands.map((brand) => (
                      <option key={brand.brandId} value={brand.brandId}>
                        {brand.name}
                      </option>
                    ))}
                  </Select>
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
                  <Select
                    label="Acquisition Method"
                    {...register('acquisitionMethod')}
                  >
                    <option value={AcquisitionMethod.COLLECTED}>Collected</option>
                    <option value={AcquisitionMethod.PURCHASED}>Purchased</option>
                    <option value={AcquisitionMethod.TRADED}>Traded</option>
                    <option value={AcquisitionMethod.DONATED}>Donated</option>
                    <option value={AcquisitionMethod.IMPORTED}>Imported</option>
                  </Select>
                </div>

                <div>
                  <Select
                    label="Item Status"
                    helperText="Current lifecycle status of the item"
                    {...register('itemStatus')}
                  >
                    <option value={ItemStatus.SUBMITTED}>Submitted</option>
                    <option value={ItemStatus.PENDING_COLLECTION}>Pending Collection</option>
                    <option value={ItemStatus.COLLECTED}>Collected</option>
                    <option value={ItemStatus.VALUING}>Valuing</option>
                    <option value={ItemStatus.VALUED}>Valued</option>
                    <option value={ItemStatus.PROCESSING}>Processing</option>
                    <option value={ItemStatus.READY_FOR_SALE}>Ready For Sale</option>
                    <option value={ItemStatus.LISTED}>Listed</option>
                    <option value={ItemStatus.SOLD}>Sold</option>
                    <option value={ItemStatus.RENTED}>Rented</option>
                    <option value={ItemStatus.DONATED}>Donated</option>
                    <option value={ItemStatus.RECYCLED}>Recycled</option>
                    <option value={ItemStatus.REJECTED}>Rejected</option>
                  </Select>
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
                    Condition Score (1-5)
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
                    placeholder="e.g., Excellent, minor wear"
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

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Resell Price ($)
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    {...register('resellPrice', { valueAsNumber: true })}
                    placeholder="0.00"
                  />
                </div>
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
              <Link href={`/admin/items/${itemId}`}>Cancel</Link>
            </Button>
            <Button 
              type="submit" 
              variant="default"
              disabled={saving}
              className="min-w-[120px]"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}

