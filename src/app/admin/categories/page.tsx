'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FolderTree,
  Plus,
  Edit,
  Trash2,
  ChevronRight,
  ChevronDown,
  Package,
  Folder,
  FolderOpen,
  X,
  CheckCircle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import AdminLayout from '@/components/layout/AdminLayout';
import SearchBar from '@/components/ui/SearchBar';
import StatsCard from '@/components/ui/StatsCard';
import { CategoriesAPI, handleApiError } from '@/api';
import { formatApiError } from '@/utils/errorMessages';

interface Category {
  categoryId: string;
  name: string;
  slug: string;
  description?: string;
  parentCategoryId?: string;
  parentCategoryName?: string;
  subCategories?: Category[];
  displayOrder?: number;
  isActive?: boolean;
  isRootCategory?: boolean;
  hasSubCategories?: boolean;
  fullPath?: string;
  level?: number;
  totalItems?: number;
}

export default function CategoriesManagementPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    parentCategoryId: '',
    displayOrder: 0,
    isActive: true
  });

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    root: 0,
    sub: 0
  });

  useEffect(() => {
    fetchCategories();
    fetchStats();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      
      if (searchTerm) {
        const response = await CategoriesAPI.searchCategories(searchTerm, {
          page: 0,
          size: 100
        });
        setCategories(response.data || []);
      } else {
        // Get category tree for hierarchical display
        const tree = await CategoriesAPI.getCategoryTree();
        setCategories(tree);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const statistics = await CategoriesAPI.getStatistics();
      setStats({
        total: statistics.totalCategories || 0,
        root: statistics.rootCategories || 0,
        sub: statistics.subCategories || 0
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  useEffect(() => {
    const delaySearch = setTimeout(() => {
      fetchCategories();
    }, 500);

    return () => clearTimeout(delaySearch);
  }, [searchTerm]);

  const handleDelete = async (categoryId: string, isActive: boolean) => {
    if (isActive) {
      // Soft delete
      if (!confirm('Archive this category and all subcategories? They will be hidden but can be restored later.')) return;
      
      try {
        await CategoriesAPI.deleteCategory(categoryId);
        fetchCategories();
        fetchStats();
      } catch (error: unknown) {
        const backendMessage = handleApiError(error);
        const friendlyMessage = formatApiError(
          backendMessage,
          'admin/categories',
          'Failed to archive category.'
        );
        alert(friendlyMessage);
      }
    } else {
      // Restore
      if (!confirm('Restore this category?')) return;
      
      try {
        await CategoriesAPI.restoreCategory(categoryId);
        fetchCategories();
        fetchStats();
      } catch (error: unknown) {
        const backendMessage = handleApiError(error);
        const friendlyMessage = formatApiError(
          backendMessage,
          'admin/categories',
          'Failed to restore category.'
        );
        alert(friendlyMessage);
      }
    }
  };

  const handleCreate = async () => {
    try {
      const submitData = {
        ...formData,
        parentCategoryId: formData.parentCategoryId || undefined
      };
      await CategoriesAPI.createCategory(submitData);
      setShowCreateModal(false);
      resetForm();
      fetchCategories();
      fetchStats();
    } catch (error: unknown) {
      const backendMessage = handleApiError(error);
      const friendlyMessage = formatApiError(
        backendMessage,
        'admin/categories',
        'Failed to create category. Please review the details and try again.'
      );
      alert(friendlyMessage);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      parentCategoryId: category.parentCategoryId || '',
      displayOrder: category.displayOrder || 0,
      isActive: category.isActive !== false
    });
    setShowEditModal(true);
  };

  const handleUpdate = async () => {
    if (!editingCategory) return;
    
    try {
      const submitData = {
        ...formData,
        parentCategoryId: formData.parentCategoryId || undefined
      };
      await CategoriesAPI.updateCategory(editingCategory.categoryId, submitData);
      setShowEditModal(false);
      setEditingCategory(null);
      resetForm();
      fetchCategories();
      fetchStats();
    } catch (error: unknown) {
      const backendMessage = handleApiError(error);
      const friendlyMessage = formatApiError(
        backendMessage,
        'admin/categories',
        'Failed to update category. Please review the details and try again.'
      );
      alert(friendlyMessage);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      parentCategoryId: '',
      displayOrder: 0,
      isActive: true
    });
  };

  const toggleExpand = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const renderCategory = (category: Category, level: number = 0) => {
    const isExpanded = expandedCategories.has(category.categoryId);
    const hasChildren = category.subCategories && category.subCategories.length > 0;

    return (
      <div key={category.categoryId} className="mb-2">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors ${
            level > 0 ? 'ml-' + (level * 6) : ''
          }`}
          style={{ marginLeft: level * 24 + 'px' }}
        >
          <div className="flex items-center space-x-3 flex-1">
            {/* Expand/Collapse Button */}
            <button
              onClick={() => toggleExpand(category.categoryId)}
              className={`p-1 ${hasChildren ? 'visible' : 'invisible'}`}
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>

            {/* Category Icon */}
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              {isExpanded ? (
                <FolderOpen className="w-5 h-5 text-primary" />
              ) : (
                <Folder className="w-5 h-5 text-primary" />
              )}
            </div>

            {/* Category Info */}
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-foreground">{category.name}</h3>
                {category.isRootCategory && (
                  <Badge variant="outline" className="text-xs">Root</Badge>
                )}
                {!category.isActive && (
                  <Badge variant="secondary" className="text-xs">Inactive</Badge>
                )}
              </div>
              <div className="flex items-center space-x-3 text-xs text-muted-foreground mt-1">
                <span>/{category.slug}</span>
                {category.totalItems !== undefined && (
                  <>
                    <span>•</span>
                    <span className="flex items-center space-x-1">
                      <Package className="w-3 h-3" />
                      <span>{category.totalItems} items</span>
                    </span>
                  </>
                )}
                {hasChildren && (
                  <>
                    <span>•</span>
                    <span>{category.subCategories!.length} subcategories</span>
                  </>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => handleEdit(category)}
              >
                <Edit className="w-4 h-4" />
              </Button>
              {category.isActive ? (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => handleDelete(category.categoryId, true)}
                  className="text-red-500 hover:text-red-700"
                  title="Archive category (soft delete)"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              ) : (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => handleDelete(category.categoryId, false)}
                  className="text-green-500 hover:text-green-700"
                  title="Restore category"
                >
                  <CheckCircle className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Render subcategories */}
        {isExpanded && hasChildren && (
          <div className="mt-1">
            {category.subCategories!.map(subCat => renderCategory(subCat, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const categoryStats = [
    { icon: FolderTree, label: 'Total Categories', value: stats.total.toString() },
    { icon: Folder, label: 'Root Categories', value: stats.root.toString() },
    { icon: FolderOpen, label: 'Subcategories', value: stats.sub.toString() },
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
            <h1 className="text-3xl font-bold text-foreground">Category Management</h1>
            <p className="text-muted-foreground">
              Organize your item categories in a hierarchical structure
            </p>
          </div>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add New Category
          </Button>
        </motion.div>

        {/* Stats */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {categoryStats.map((stat, index) => (
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
                placeholder="Search categories..."
                className="flex-1"
              />
            </CardContent>
          </Card>
        </motion.div>

        {/* Categories Tree */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle>Category Hierarchy</CardTitle>
              <CardDescription>
                {loading ? 'Loading...' : `Showing ${categories.length} root categories`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-4 text-muted-foreground">Loading categories...</p>
                </div>
              ) : categories.length === 0 ? (
                <div className="text-center py-8">
                  <FolderTree className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No categories found</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {categories.map(category => renderCategory(category))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Create Category Modal */}
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
                  <h2 className="text-2xl font-bold">Create New Category</h2>
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
                    <label className="block text-sm font-medium mb-2">Category Name *</label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Clothing, Shoes, Accessories"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                      placeholder="Brief description of the category..."
                      className="w-full px-3 py-2 border border-input rounded-md resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Parent Category</label>
                    <select
                      value={formData.parentCategoryId}
                      onChange={(e) => setFormData({ ...formData, parentCategoryId: e.target.value })}
                      className="w-full px-3 py-2 border border-input rounded-md"
                    >
                      <option value="">None (Root Category)</option>
                      {categories.map((cat) => (
                        <option key={cat.categoryId} value={cat.categoryId}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Display Order <span className="text-muted-foreground text-xs">Optional</span></label>
                    <Input
                      type="number"
                      value={formData.displayOrder}
                      onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
                      placeholder="0"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Order in which categories appear (0 = first)</p>
                  </div>

                  <div className="flex items-center space-x-6">
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
                    onClick={() => { setShowCreateModal(false); resetForm(); }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreate}
                    disabled={!formData.name}
                  >
                    Create Category
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Edit Category Modal */}
        <AnimatePresence>
          {showEditModal && editingCategory && (
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
                  <h2 className="text-2xl font-bold">Edit Category: {editingCategory.name}</h2>
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
                    <label className="block text-sm font-medium mb-2">Category Name *</label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Clothing, Shoes, Accessories"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                      placeholder="Brief description of the category..."
                      className="w-full px-3 py-2 border border-input rounded-md resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Parent Category</label>
                    <select
                      value={formData.parentCategoryId}
                      onChange={(e) => setFormData({ ...formData, parentCategoryId: e.target.value })}
                      className="w-full px-3 py-2 border border-input rounded-md"
                    >
                      <option value="">None (Root Category)</option>
                      {categories.filter(cat => cat.categoryId !== editingCategory.categoryId).map((cat) => (
                        <option key={cat.categoryId} value={cat.categoryId}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Display Order <span className="text-muted-foreground text-xs">Optional</span></label>
                    <Input
                      type="number"
                      value={formData.displayOrder}
                      onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
                      placeholder="0"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Order in which categories appear (0 = first)</p>
                  </div>

                  <div className="flex items-center space-x-6">
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
                    onClick={() => { setShowEditModal(false); resetForm(); }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleUpdate}
                    disabled={!formData.name}
                  >
                    Update Category
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



