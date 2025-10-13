'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Package,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  Users,
  Award,
  Building2,
  Search,
  Star,
  ExternalLink,
  X
} from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import AdminLayout from '@/components/layout/AdminLayout';
import SearchBar from '@/components/ui/SearchBar';
import StatsCard from '@/components/ui/StatsCard';
import { BrandsAPI } from '@/api';

interface Brand {
  brandId: string;
  name: string;
  slug: string;
  description?: string;
  logoUrl?: string;
  website?: string;
  sustainabilityRating?: number;
  isVerified?: boolean;
  isPartner?: boolean;
  isActive?: boolean;
  totalItems?: number;
  isSustainable?: boolean;
}

export default function BrandsManagementPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    logoUrl: '',
    website: '',
    sustainabilityRating: 0,
    isVerified: false,
    isPartner: false,
    isActive: true
  });

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    verified: 0,
    partners: 0
  });

  useEffect(() => {
    fetchBrands();
    fetchStats();
  }, [currentPage]);

  const fetchBrands = async () => {
    try {
      setLoading(true);
      let response;

      if (searchTerm) {
        response = await BrandsAPI.searchBrands(searchTerm, {
          page: currentPage,
          size: 20
        });
      } else {
        response = await BrandsAPI.getAllBrands({
          page: currentPage,
          size: 20
        });
      }

      // Handle paginated response structure from backend
      if (response.content && Array.isArray(response.content)) {
        // Backend paginated response: { content: [], totalPages: 1, ... }
        setBrands(response.content);
        setTotalPages(response.totalPages || 1);
      } else if (Array.isArray(response)) {
        // Direct array response
        setBrands(response);
        setTotalPages(1);
      } else if (response.data && Array.isArray(response.data)) {
        // Alternative paginated response structure
        setBrands(response.data);
        setTotalPages(response.totalPages || 1);
      } else {
        // Fallback: empty array
        setBrands([]);
        setTotalPages(0);
      }
    } catch (error) {
      console.error('Failed to fetch brands:', error);
      setBrands([]);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const statistics = await BrandsAPI.getStatistics();
      setStats({
        total: statistics.totalBrands || 0,
        verified: statistics.verifiedBrands || 0,
        partners: statistics.partnerBrands || 0
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(0);
  };

  useEffect(() => {
    const delaySearch = setTimeout(() => {
      if (searchTerm) {
        fetchBrands();
      }
    }, 500);

    return () => clearTimeout(delaySearch);
  }, [searchTerm]);

  const handleDelete = async (brandId: string, isActive: boolean) => {
    if (isActive) {
      // Soft delete
      if (!confirm('Archive this brand? It will be hidden but can be restored later.')) return;
      
      try {
        await BrandsAPI.deleteBrand(brandId);
        fetchBrands();
        fetchStats();
      } catch (error: any) {
        alert(error.message || 'Failed to archive brand');
      }
    } else {
      // Restore
      if (!confirm('Restore this brand?')) return;
      
      try {
        await BrandsAPI.restoreBrand(brandId);
        fetchBrands();
        fetchStats();
      } catch (error: any) {
        alert(error.message || 'Failed to restore brand');
      }
    }
  };

  const handleCreate = async () => {
    try {
      await BrandsAPI.createBrand(formData);
      setShowCreateModal(false);
      resetForm();
      fetchBrands();
      fetchStats();
    } catch (error: any) {
      alert(error.message || 'Failed to create brand');
    }
  };

  const handleEdit = (brand: Brand) => {
    setEditingBrand(brand);
    setFormData({
      name: brand.name,
      description: brand.description || '',
      logoUrl: brand.logoUrl || '',
      website: brand.website || '',
      sustainabilityRating: brand.sustainabilityRating || 0,
      isVerified: brand.isVerified || false,
      isPartner: brand.isPartner || false,
      isActive: brand.isActive !== false
    });
    setShowEditModal(true);
  };

  const handleUpdate = async () => {
    if (!editingBrand) return;
    
    try {
      await BrandsAPI.updateBrand(editingBrand.brandId, formData);
      setShowEditModal(false);
      setEditingBrand(null);
      resetForm();
      fetchBrands();
      fetchStats();
    } catch (error: any) {
      alert(error.message || 'Failed to update brand');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      logoUrl: '',
      website: '',
      sustainabilityRating: 0,
      isVerified: false,
      isPartner: false,
      isActive: true
    });
  };

  const brandStats = [
    { icon: Building2, label: 'Total Brands', value: stats.total.toString() },
    { icon: CheckCircle, label: 'Verified', value: stats.verified.toString() },
    { icon: Award, label: 'Partners', value: stats.partners.toString() },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring" as const, stiffness: 100 }
    }
  };

  return (
    <AdminLayout>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Brand Management</h1>
            <p className="text-muted-foreground">
              Manage brands and their sustainability credentials
            </p>
          </div>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add New Brand
          </Button>
        </motion.div>

        {/* Stats */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {brandStats.map((stat, index) => (
            <StatsCard
              key={stat.label}
              icon={stat.icon}
              label={stat.label}
              value={stat.value}
              index={index}
            />
          ))}
        </motion.div>

        {/* Search */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardContent className="pt-6">
              <SearchBar
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Search brands by name..."
                className="flex-1"
              />
            </CardContent>
          </Card>
        </motion.div>

        {/* Brands Grid */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle>All Brands</CardTitle>
              <CardDescription>
                {loading ? 'Loading...' : `Showing ${brands.length} brands`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-4 text-muted-foreground">Loading brands...</p>
                </div>
              ) : !Array.isArray(brands) || brands.length === 0 ? (
                <div className="text-center py-8">
                  <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No brands found</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {brands.map((brand, index) => (
                    <motion.div
                      key={brand.brandId}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      {/* Brand Logo & Name */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-muted rounded-lg overflow-hidden flex items-center justify-center">
                            {brand.logoUrl ? (
                              <img
                                src={brand.logoUrl}
                                alt={brand.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Building2 className="w-6 h-6 text-muted-foreground" />
                            )}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-foreground">{brand.name}</h3>
                            <p className="text-xs text-muted-foreground">/{brand.slug}</p>
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-end space-y-1">
                          {brand.isVerified && (
                            <Badge variant="default" className="text-xs">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Verified
                            </Badge>
                          )}
                          {brand.isPartner && (
                            <Badge variant="secondary" className="text-xs">
                              <Award className="w-3 h-3 mr-1" />
                              Partner
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Description */}
                      {brand.description && (
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {brand.description}
                        </p>
                      )}

                      {/* Metrics */}
                      <div className="flex items-center justify-between mb-3 text-sm">
                        {brand.sustainabilityRating !== undefined && (
                          <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-medium">{brand.sustainabilityRating.toFixed(1)}</span>
                            <span className="text-muted-foreground">sustainability</span>
                          </div>
                        )}
                        
                        {brand.totalItems !== undefined && (
                          <div className="flex items-center space-x-1 text-muted-foreground">
                            <Package className="w-4 h-4" />
                            <span>{brand.totalItems} items</span>
                          </div>
                        )}
                      </div>

                      {/* Website Link */}
                      {brand.website && (
                        <a
                          href={brand.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-1 text-sm text-primary hover:underline mb-3"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>Visit website</span>
                        </a>
                      )}

                      {/* Actions */}
                      <div className="flex items-center space-x-2 pt-3 border-t">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => handleEdit(brand)}
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                        {brand.isActive ? (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDelete(brand.brandId, true)}
                            className="text-red-500 hover:text-red-700"
                            title="Archive brand (soft delete)"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        ) : (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDelete(brand.brandId, false)}
                            className="text-green-500 hover:text-green-700"
                            title="Restore brand"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center space-x-2 mt-6">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                    disabled={currentPage === 0}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {currentPage + 1} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                    disabled={currentPage >= totalPages - 1}
                  >
                    Next
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Create Brand Modal */}
        <AnimatePresence>
          {showCreateModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
              onClick={() => setShowCreateModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-background rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              >
                <div className="p-6 border-b flex items-center justify-between">
                  <h2 className="text-2xl font-bold">Create New Brand</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowCreateModal(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Brand Name *</label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Nike, Adidas, Patagonia"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                      placeholder="Brief description of the brand..."
                      className="w-full px-3 py-2 border border-input rounded-md resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Logo URL</label>
                      <Input
                        value={formData.logoUrl}
                        onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                        placeholder="https://..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Website</label>
                      <Input
                        value={formData.website}
                        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                        placeholder="https://..."
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Sustainability Rating (0-5)
                    </label>
                    <div className="flex items-center space-x-3">
                      <Input
                        type="number"
                        step="0.1"
                        min="0"
                        max="5"
                        value={formData.sustainabilityRating}
                        onChange={(e) => setFormData({ ...formData, sustainabilityRating: parseFloat(e.target.value) || 0 })}
                        className="w-32"
                      />
                      <div className="flex items-center space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-5 h-5 ${
                              i < Math.round(formData.sustainabilityRating)
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-6">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.isVerified}
                        onChange={(e) => setFormData({ ...formData, isVerified: e.target.checked })}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm">Verified Brand</span>
                    </label>

                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.isPartner}
                        onChange={(e) => setFormData({ ...formData, isPartner: e.target.checked })}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm">Partner Brand</span>
                    </label>

                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm">Active</span>
                    </label>
                  </div>
                </div>

                <div className="p-6 border-t flex justify-end space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowCreateModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreate}
                    disabled={!formData.name}
                  >
                    Create Brand
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Edit Brand Modal */}
        <AnimatePresence>
          {showEditModal && editingBrand && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
              onClick={() => setShowEditModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-background rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              >
                <div className="p-6 border-b flex items-center justify-between">
                  <h2 className="text-2xl font-bold">Edit Brand: {editingBrand.name}</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowEditModal(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Brand Name *</label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Nike, Adidas, Patagonia"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                      placeholder="Brief description of the brand..."
                      className="w-full px-3 py-2 border border-input rounded-md resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Logo URL</label>
                      <Input
                        value={formData.logoUrl}
                        onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                        placeholder="https://..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Website</label>
                      <Input
                        value={formData.website}
                        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                        placeholder="https://..."
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Sustainability Rating (0-5)
                    </label>
                    <div className="flex items-center space-x-3">
                      <Input
                        type="number"
                        step="0.1"
                        min="0"
                        max="5"
                        value={formData.sustainabilityRating}
                        onChange={(e) => setFormData({ ...formData, sustainabilityRating: parseFloat(e.target.value) || 0 })}
                        className="w-32"
                      />
                      <div className="flex items-center space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-5 h-5 ${
                              i < Math.round(formData.sustainabilityRating)
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-6">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.isVerified}
                        onChange={(e) => setFormData({ ...formData, isVerified: e.target.checked })}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm">Verified Brand</span>
                    </label>

                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.isPartner}
                        onChange={(e) => setFormData({ ...formData, isPartner: e.target.checked })}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm">Partner Brand</span>
                    </label>

                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm">Active</span>
                    </label>
                  </div>
                </div>

                <div className="p-6 border-t flex justify-end space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowEditModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleUpdate}
                    disabled={!formData.name}
                  >
                    Update Brand
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AdminLayout>
  );
}

