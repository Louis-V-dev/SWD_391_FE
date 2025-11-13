'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Edit,
  Package,
  DollarSign,
  Star,
  CheckCircle,
  Clock,
  User,
  Tag,
  Camera,
  Leaf,
  QrCode,
  History
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import AdminLayout from '@/components/layout/AdminLayout';
import { ItemsAPI, handleApiError } from '@/api';
import { formatApiError } from '@/utils/errorMessages';
import type { ItemResponse } from '@/types';

export default function AdminItemDetailPage() {
  const params = useParams();
  const router = useRouter();
  const itemId = params.id as string;
  
  const [item, setItem] = useState<ItemResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState<any>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchItem();
  }, [itemId]);

  const fetchItem = async () => {
    try {
      setLoading(true);
      const data = await ItemsAPI.getItemById(itemId);
      setItem(data);
      setEditFormData({
        name: data.name,
        description: data.description,
        size: data.size,
        color: data.color,
        conditionScore: data.conditionScore,
        conditionDescription: data.conditionDescription,
        originalPrice: data.originalPrice,
        currentEstimatedValue: data.currentEstimatedValue,
        resellPrice: data.resellPrice,
        itemStatus: data.itemStatus,
      });
    } catch (err: unknown) {
      const backendMessage = handleApiError(err);
      const friendlyMessage = formatApiError(
        backendMessage,
        'admin/items',
        'Failed to load item details. Please try again.'
      );
      setError(friendlyMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!item) return;
    
    try {
      setSaving(true);
      await ItemsAPI.updateItem(item.itemId, editFormData);
      await fetchItem();
      setShowEditModal(false);
    } catch (err: unknown) {
      const backendMessage = handleApiError(err);
      const friendlyMessage = formatApiError(
        backendMessage,
        'admin/items',
        'Failed to update the item. Please review the details and try again.'
      );
      setError(friendlyMessage);
    } finally {
      setSaving(false);
    }
  };

  const getConditionColor = (score?: number) => {
    if (!score) return 'gray';
    if (score >= 4.5) return 'green';
    if (score >= 3.5) return 'yellow';
    if (score >= 2.5) return 'orange';
    return 'red';
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'LISTED':
      case 'READY_FOR_SALE':
        return 'default';
      case 'SOLD':
        return 'success';
      case 'PENDING_COLLECTION':
      case 'VALUING':
        return 'warning';
      default:
        return 'secondary';
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    );
  }

  if (error || !item) {
    return (
      <AdminLayout>
        <div className="p-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error || 'Item not found'}</p>
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
      <div className="p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/items">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{item.displayName}</h1>
              <p className="text-gray-500">ID: {item.itemCode}</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button onClick={() => setShowEditModal(true)}>
              <Edit className="w-4 h-4 mr-2" />
              Edit Item
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Images */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Camera className="w-5 h-5 mr-2" />
                  Images ({item.images?.length || 0})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {item.images && item.images.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {item.images.map((url, index) => (
                      <div key={index} className="relative aspect-square rounded-lg overflow-hidden border">
                        <img
                          src={url}
                          alt={`${item.name} - ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        {index === 0 && (
                          <Badge className="absolute top-2 left-2 bg-yellow-500">
                            <Star className="w-3 h-3 mr-1 fill-white" />
                            Primary
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No images uploaded</p>
                )}
              </CardContent>
            </Card>

            {/* Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="w-5 h-5 mr-2" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-500">Category</label>
                    <p className="font-medium">{item.categoryName}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Brand</label>
                    <p className="font-medium">{item.brandName || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Size</label>
                    <p className="font-medium">{item.size || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Color</label>
                    <p className="font-medium">{item.color || 'N/A'}</p>
                  </div>
                  {item.weightGrams && (
                    <div>
                      <label className="text-sm text-gray-500">Weight</label>
                      <p className="font-medium">{item.weightGrams}g</p>
                    </div>
                  )}
                </div>
                
                {item.description && (
                  <div>
                    <label className="text-sm text-gray-500">Description</label>
                    <p className="mt-1">{item.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Pricing */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="w-5 h-5 mr-2" />
                  Pricing & Valuation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  {item.originalPrice && (
                    <div>
                      <label className="text-sm text-gray-500">Original Price</label>
                      <p className="font-bold text-lg">${item.originalPrice.toFixed(2)}</p>
                    </div>
                  )}
                  {item.currentEstimatedValue && (
                    <div>
                      <label className="text-sm text-gray-500">Est. Value</label>
                      <p className="font-bold text-lg text-blue-600">${item.currentEstimatedValue.toFixed(2)}</p>
                    </div>
                  )}
                  {item.resellPrice && (
                    <div>
                      <label className="text-sm text-gray-500">Resell Price</label>
                      <p className="font-bold text-lg text-green-600">${item.resellPrice.toFixed(2)}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Condition */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Star className="w-5 h-5 mr-2" />
                  Condition
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-6 h-6 ${
                          star <= (item.conditionScore || 0)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-2xl font-bold">{item.conditionScore?.toFixed(1)}</span>
                  <Badge variant={getConditionColor(item.conditionScore) as any}>
                    {item.conditionText}
                  </Badge>
                </div>
                {item.conditionDescription && (
                  <p className="mt-4 text-gray-600">{item.conditionDescription}</p>
                )}
              </CardContent>
            </Card>

            {/* Sustainability */}
            {item.isSustainable && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Leaf className="w-5 h-5 mr-2 text-green-600" />
                    Sustainability Impact
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    {item.carbonFootprintKg && (
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">{item.carbonFootprintKg}kg</p>
                        <p className="text-sm text-gray-500">CO₂ Saved</p>
                      </div>
                    )}
                    {item.waterSavedLiters && (
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600">{item.waterSavedLiters}L</p>
                        <p className="text-sm text-gray-500">Water Saved</p>
                      </div>
                    )}
                    {item.energySavedKwh && (
                      <div className="text-center">
                        <p className="text-2xl font-bold text-yellow-600">{item.energySavedKwh}kWh</p>
                        <p className="text-sm text-gray-500">Energy Saved</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Status */}
            <Card>
              <CardHeader>
                <CardTitle>Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm text-gray-500">Item Status</label>
                  <div className="mt-1">
                    <Badge variant={getStatusBadgeVariant(item.itemStatus)}>
                      {item.itemStatus.replace(/_/g, ' ')}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Verification</label>
                  <div className="mt-1">
                    {item.isVerified ? (
                      <Badge variant="success">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    ) : (
                      <Badge variant="warning">Pending</Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* QR Code */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <QrCode className="w-5 h-5 mr-2" />
                  QR Code
                </CardTitle>
                <CardDescription>Scan to track item lifecycle</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-white p-4 rounded-lg border flex items-center justify-center">
                  <div className="text-center">
                    <div className="bg-gray-100 p-8 rounded-lg mb-2">
                      <QrCode className="w-32 h-32 mx-auto text-gray-400" />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Code: {item.itemCode}</p>
                    <Button variant="outline" size="sm" className="mt-4">
                      Download QR
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Ownership */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Ownership
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-sm text-gray-500">Original Owner</label>
                  <p className="font-medium">{item.originalOwnerName}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Current Owner</label>
                  <p className="font-medium">{item.currentOwnerName}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Acquisition</label>
                  <p className="font-medium">{item.acquisitionMethod?.replace(/_/g, ' ')}</p>
                </div>
              </CardContent>
            </Card>

            {/* Timestamps */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="w-5 h-5 mr-2" />
                  Timeline
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-sm text-gray-500">Created</label>
                  <p className="text-sm">{new Date(item.createdAt).toLocaleString()}</p>
                </div>
                {item.verificationDate && (
                  <div>
                    <label className="text-sm text-gray-500">Verified</label>
                    <p className="text-sm">{new Date(item.verificationDate).toLocaleString()}</p>
                  </div>
                )}
                <div>
                  <label className="text-sm text-gray-500">Last Updated</label>
                  <p className="text-sm">{new Date(item.updatedAt).toLocaleString()}</p>
                </div>
              </CardContent>
            </Card>

            {/* Tags */}
            {item.tags && item.tags.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Tag className="w-5 h-5 mr-2" />
                    Tags
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {item.tags.map((tag, index) => (
                      <Badge key={index} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-6">Edit Item</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Name</label>
                  <Input
                    value={editFormData.name || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea
                    className="w-full px-3 py-2 border rounded-lg"
                    rows={4}
                    value={editFormData.description || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Size</label>
                    <Input
                      value={editFormData.size || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, size: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Color</label>
                    <Input
                      value={editFormData.color || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, color: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Condition Score (1-5)</label>
                  <Input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    value={editFormData.conditionScore || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, conditionScore: parseFloat(e.target.value) })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Condition Description</label>
                  <Input
                    value={editFormData.conditionDescription || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, conditionDescription: e.target.value })}
                  />
                </div>

                <div>
                  <Select
                    label="Item Status"
                    value={editFormData.itemStatus || 'SUBMITTED'}
                    onChange={(e) => setEditFormData({ ...editFormData, itemStatus: e.target.value })}
                  >
                    <option value="SUBMITTED">Submitted</option>
                    <option value="PENDING_COLLECTION">Pending Collection</option>
                    <option value="COLLECTED">Collected</option>
                    <option value="VALUING">Valuing</option>
                    <option value="VALUED">Valued</option>
                    <option value="PROCESSING">Processing</option>
                    <option value="READY_FOR_SALE">Ready For Sale</option>
                    <option value="LISTED">Listed</option>
                    <option value="SOLD">Sold</option>
                    <option value="RENTED">Rented</option>
                    <option value="DONATED">Donated</option>
                    <option value="RECYCLED">Recycled</option>
                    <option value="REJECTED">Rejected</option>
                  </Select>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Original Price ($)</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={editFormData.originalPrice || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, originalPrice: parseFloat(e.target.value) })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Est. Value ($)</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={editFormData.currentEstimatedValue || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, currentEstimatedValue: parseFloat(e.target.value) })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Resell Price ($)</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={editFormData.resellPrice || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, resellPrice: parseFloat(e.target.value) })}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setShowEditModal(false)}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button onClick={handleSaveEdit} disabled={saving}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AdminLayout>
  );
}

