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
  collectedFromUserId: z.string().optional(), // Optional - if not provided, uses admin's ID
  size: z.string().optional(),
  color: z.string().optional(),
  conditionScore: z.number().min(1).max(5, 'Condition score must be between 1 and 5'),
  conditionDescription: z.string().optional(),
  originalPrice: z.number().min(0).optional(),
  currentEstimatedValue: z.number().min(0, 'Current estimated value is required'),
  resellPrice: z.number().min(0, 'Resell price is required'),
  weightGrams: z.number().min(1).optional(),
  acquisitionMethod: z.string().min(1, 'Acquisition method is required'),
});

type CreateItemFormData = z.infer<typeof createItemSchema>;

export default function AdminCreateItemPage() {
  const [images, setImages] = useState<File[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isSearchingUsers, setIsSearchingUsers] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdItemId, setCreatedItemId] = useState<string | null>(null);
  const [createdItemCode, setCreatedItemCode] = useState<string | null>(null);
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
    defaultValues: {
      conditionScore: 5.0,
      acquisitionMethod: AcquisitionMethod.COLLECTED
    }
  });

  useEffect(() => {
    fetchCategories();
    fetchBrands();
    // Don't fetch all users on mount - search on demand instead
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

  const searchUsersFromBackend = async (searchTerm: string) => {
    if (!searchTerm || searchTerm.length < 2) {
      setFilteredUsers([]);
      setShowUserDropdown(false);
      return;
    }

    try {
      setIsSearchingUsers(true);
      const { searchUsers } = await import('@/api/users');
      const results = await searchUsers(searchTerm, 0, 10); // Get top 10 results
      setFilteredUsers(results || []);
      setShowUserDropdown((results || []).length > 0);
    } catch (error) {
      console.error('Failed to search users:', error);
      setFilteredUsers([]);
      setShowUserDropdown(false);
    } finally {
      setIsSearchingUsers(false);
    }
  };

  const handleUserSearch = (searchTerm: string) => {
    setUserSearchTerm(searchTerm);
    setSelectedUser(null); // Clear selection when typing
    
    if (!searchTerm.trim() || searchTerm.length < 2) {
      setFilteredUsers([]);
      setShowUserDropdown(false);
    }
  };

  // Debounced search effect
  useEffect(() => {
    // Only search if we have at least 2 characters and user is not already selected
    if (!userSearchTerm || userSearchTerm.length < 2 || selectedUser) {
      return;
    }

    const timeoutId = setTimeout(() => {
      searchUsersFromBackend(userSearchTerm);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [userSearchTerm, selectedUser]);

  const handleSelectUser = (user: any) => {
    setSelectedUser(user);
    setUserSearchTerm(`${user.username} - ${user.email}`);
    setShowUserDropdown(false);
    // Update form value
    setValue('collectedFromUserId', user.userId);
  };

  const handleClearUser = () => {
    setSelectedUser(null);
    setUserSearchTerm('');
    setFilteredUsers([]);
    setShowUserDropdown(false);
    setValue('collectedFromUserId', '');
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

  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    const dragIndex = parseInt(e.dataTransfer.getData('text/plain'));
    
    if (dragIndex === dropIndex) return;

    setImages(prev => {
      const newImages = [...prev];
      const draggedImage = newImages[dragIndex];
      newImages.splice(dragIndex, 1);
      newImages.splice(dropIndex, 0, draggedImage);
      return newImages;
    });
  };


  const onSubmit = async (data: CreateItemFormData) => {
    if (!user?.userId) {
      setError('You must be logged in to create items');
      return;
    }

    try {
      setIsLoading(true);
      setError('');

      // Determine the owner: collected from user or admin
      const ownerId = data.collectedFromUserId || user.userId;

      // Create item data
      const itemData = {
        ...data,
        acquisitionMethod: data.acquisitionMethod as AcquisitionMethod,
        tags: [],
        metadata: {
          collectedBy: user.userId,
          collectedAt: new Date().toISOString()
        }
      };

      // Remove collectedFromUserId from itemData as it's not part of the API
      delete (itemData as any).collectedFromUserId;

      let createdItem;

      // Use transactional API if images are provided
      if (images.length > 0) {
        console.log('Creating item with images using transactional API...');
        console.log('Images array:', images);
        console.log('Images are File objects?', images.every(img => img instanceof File));
        console.log('Images count:', images.length);
        createdItem = await ItemsAPI.createItemWithImages(itemData, ownerId, images);
        console.log('Item and images created successfully:', createdItem);
      } else {
        // Create item without images
        console.log('Creating item without images...');
        createdItem = await ItemsAPI.createItem(itemData, ownerId);
        console.log('Item created successfully:', createdItem);
      }

      // Auto-verify the item (admin created items are pre-verified)
      await ItemsAPI.verifyItem(createdItem.itemId, user.userId);

      // Show success modal with options
      setCreatedItemId(createdItem.itemId);
      setCreatedItemCode(createdItem.itemCode);
      setShowSuccessModal(true);
    } catch (err: any) {
      console.error('Item creation failed:', err);
      setError(err.message || 'Failed to create item. If images failed to upload, the item was not created.');
    } finally {
      setIsLoading(false);
    }
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
              Create items collected from donors and award them points upon verification
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/admin/items">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Link>
          </Button>
        </div>

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
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    💡 Drag images to reorder. First image will be the main/primary image.
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {images.map((image, index) => (
                      <div 
                        key={index} 
                        className="relative group cursor-move"
                        draggable
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, index)}
                      >
                        <div className="aspect-square bg-muted rounded-lg overflow-hidden border-2 border-transparent hover:border-primary transition-colors">
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
                          <Badge className="absolute bottom-2 left-2 bg-yellow-500">
                            <Star className="w-3 h-3 mr-1 fill-white" />
                            Primary
                          </Badge>
                        )}
                        <div className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                          #{index + 1}
                        </div>
                      </div>
                    ))}
                  </div>
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

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">
                    Collected From User (Optional)
                  </label>
                  
                  {/* Autocomplete Search Input */}
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder="Search by email, phone, or name... (min 2 chars)"
                      value={userSearchTerm}
                      onChange={(e) => handleUserSearch(e.target.value)}
                      onFocus={() => {
                        if (userSearchTerm && filteredUsers.length > 0 && !selectedUser) {
                          setShowUserDropdown(true);
                        }
                      }}
                      className="pr-10"
                      disabled={isSearchingUsers}
                      autoComplete="off"
                    />
                    {isSearchingUsers && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      </div>
                    )}
                    {selectedUser && !isSearchingUsers && (
                      <button
                        type="button"
                        onClick={handleClearUser}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                    
                    {/* Dropdown Results */}
                    {showUserDropdown && filteredUsers.length > 0 && (
                      <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto">
                        {filteredUsers.map((user) => (
                          <button
                            key={user.userId}
                            type="button"
                            onClick={() => handleSelectUser(user)}
                            className="w-full px-4 py-2 text-left hover:bg-gray-100 flex flex-col border-b last:border-b-0"
                          >
                            <span className="font-medium">{user.username}</span>
                            <span className="text-sm text-gray-600">{user.email}</span>
                            {user.phoneNumber && (
                              <span className="text-sm text-gray-500">{user.phoneNumber}</span>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                    
                    {/* No Results Message */}
                    {!isSearchingUsers && userSearchTerm && userSearchTerm.length >= 2 && filteredUsers.length === 0 && (
                      <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg p-4">
                        <p className="text-sm text-gray-500">No users found matching "{userSearchTerm}"</p>
                      </div>
                    )}
                    
                    {/* Minimum chars message */}
                    {userSearchTerm && userSearchTerm.length === 1 && !selectedUser && (
                      <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg p-4">
                        <p className="text-sm text-gray-400">Type at least 2 characters to search...</p>
                      </div>
                    )}
                  </div>
                  
                  {/* Hidden input for form */}
                  <input type="hidden" {...register('collectedFromUserId')} />
                  
                  <p className="text-sm text-muted-foreground mt-2">
                    {selectedUser ? (
                      <span className="text-green-600">✓ Selected: {selectedUser.username}</span>
                    ) : (
                      'Search and select a user, or leave empty to use Admin ID as default.'
                    )}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Points will be awarded to the selected user upon verification.
                  </p>
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
                    Current Estimated Value ($) *
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    {...register('currentEstimatedValue', { valueAsNumber: true })}
                    placeholder="0.00"
                  />
                  {errors.currentEstimatedValue && (
                    <p className="text-red-500 text-xs mt-1">{errors.currentEstimatedValue.message}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">Market reference value</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Resell Price ($) *
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    {...register('resellPrice', { valueAsNumber: true })}
                    placeholder="0.00"
                  />
                  {errors.resellPrice && (
                    <p className="text-red-500 text-xs mt-1">{errors.resellPrice.message}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">Actual selling price</p>
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
              <Link href="/admin/items">Cancel</Link>
            </Button>
            <Button 
              type="submit" 
              variant="default"
              disabled={isLoading}
              className="min-w-[180px]"
            >
              {isLoading ? 'Creating...' : 'Create & Verify Item'}
            </Button>
          </div>
        </form>
      </div>

      {/* Success Modal */}
      {showSuccessModal && createdItemId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-background rounded-lg shadow-xl max-w-md w-full p-6"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Item Created Successfully!</h2>
              <div className="space-y-3 mb-6 text-left bg-muted/50 p-4 rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Tracking Code:</p>
                  <p className="font-mono font-bold text-primary text-lg">{createdItemCode}</p>
                </div>
                <div className="text-sm text-muted-foreground">
                  <p>✓ Item created and verified</p>
                  <p>✓ Tracking code generated</p>
                  <p className="mt-2">💡 Print the QR code and attach it to the physical item for tracking</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <Link href={`/admin/items/${createdItemId}`} className="block">
                  <Button
                    className="w-full"
                    size="lg"
                  >
                    View Item Details
                  </Button>
                </Link>
                <Link href="/admin/items" className="block">
                  <Button
                    variant="outline"
                    className="w-full"
                  >
                    Back to Items
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AdminLayout>
  );
}

