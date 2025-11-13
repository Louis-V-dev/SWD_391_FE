'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Package, 
  Filter,
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Image as ImageIcon,
  Star
} from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Select';
import AdminLayout from '@/components/layout/AdminLayout';
import SearchBar from '@/components/ui/SearchBar';
import StatsCard from '@/components/ui/StatsCard';
import { ItemsAPI, handleApiError } from '@/api';
import { ItemSummaryResponse, ItemStatus } from '@/types';
import { formatApiError } from '@/utils/errorMessages';

export default function ItemsManagementPage() {
  const [items, setItems] = useState<ItemSummaryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0
  });

  useEffect(() => {
    fetchItems();
    fetchStats();
  }, [selectedStatus, currentPage]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      let response;

      if (searchTerm) {
        response = await ItemsAPI.searchItems(searchTerm, {
          page: currentPage,
          size: 20
        });
      } else if (selectedStatus !== 'all') {
        response = await ItemsAPI.getItemsByStatus(
          selectedStatus.toUpperCase() as ItemStatus,
          { page: currentPage, size: 20 }
        );
      } else {
        response = await ItemsAPI.getAllItems({
          page: currentPage,
          size: 20
        });
      }

      // API returns paginated response with 'content' field
      setItems(response.content || []);
      setTotalPages(response.totalPages || 0);
    } catch (error) {
      console.error('Failed to fetch items:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const [listedCount, readyCount, submittedCount, rejectedCount] = await Promise.all([
        ItemsAPI.countItemsByStatus(ItemStatus.LISTED),
        ItemsAPI.countItemsByStatus(ItemStatus.READY_FOR_SALE),
        ItemsAPI.countItemsByStatus(ItemStatus.SUBMITTED),
        ItemsAPI.countItemsByStatus(ItemStatus.REJECTED)
      ]);

      setStats({
        total: listedCount + readyCount + submittedCount + rejectedCount,
        approved: listedCount + readyCount,
        pending: submittedCount,
        rejected: rejectedCount
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
        fetchItems();
      }
    }, 500);

    return () => clearTimeout(delaySearch);
  }, [searchTerm]);

  const handleDelete = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      await ItemsAPI.deleteItem(itemId);
      fetchItems();
      fetchStats();
    } catch (error) {
      console.error('Failed to delete item:', error);
      const backendMessage = handleApiError(error);
      const friendlyMessage = formatApiError(
        backendMessage,
        'admin/items',
        'Failed to delete item. Please try again.'
      );
      alert(friendlyMessage);
    }
  };

  const getStatusBadgeVariant = (status: ItemStatus) => {
    switch (status) {
      case ItemStatus.LISTED:
      case ItemStatus.READY_FOR_SALE:
        return 'default';
      case ItemStatus.SUBMITTED:
      case ItemStatus.PENDING_COLLECTION:
        return 'secondary';
      case ItemStatus.REJECTED:
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const itemStats = [
    { icon: Package, label: 'Total Items', value: stats.total.toString() },
    { icon: CheckCircle, label: 'Approved', value: stats.approved.toString() },
    { icon: Clock, label: 'Pending Review', value: stats.pending.toString() },
    { icon: XCircle, label: 'Rejected', value: stats.rejected.toString() },
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
            <h1 className="text-3xl font-bold text-foreground">Items Management</h1>
            <p className="text-muted-foreground">
              Review and manage all listed items
            </p>
          </div>
          <Button asChild>
            <Link href="/admin/items/create">
              <Plus className="w-4 h-4 mr-2" />
              Create Item (Admin)
            </Link>
          </Button>
        </motion.div>

        {/* Stats */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {itemStats.map((stat, index) => (
            <StatsCard
              key={stat.label}
              icon={stat.icon}
              label={stat.label}
              value={stat.value}
              index={index}
            />
          ))}
        </motion.div>

        {/* Filters */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <SearchBar
                  value={searchTerm}
                  onChange={handleSearchChange}
                  placeholder="Search items by name..."
                  className="flex-1"
                />

                <div className="sm:w-56">
                  <Select
                    value={selectedStatus}
                    onChange={(e) => {
                      setSelectedStatus(e.target.value);
                      setCurrentPage(0);
                    }}
                  >
                    <option value="all">All Status</option>
                    <option value={ItemStatus.LISTED}>Listed</option>
                    <option value={ItemStatus.READY_FOR_SALE}>Ready for Sale</option>
                    <option value={ItemStatus.SUBMITTED}>Submitted</option>
                    <option value={ItemStatus.PENDING_COLLECTION}>Pending Collection</option>
                    <option value={ItemStatus.COLLECTED}>Collected</option>
                    <option value={ItemStatus.VALUED}>Valued</option>
                    <option value={ItemStatus.REJECTED}>Rejected</option>
                  </Select>
                </div>

                <Button variant="outline">
                  <Filter className="w-4 h-4 mr-2" />
                  More Filters
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Items Grid */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle>All Items</CardTitle>
              <CardDescription>
                {loading ? 'Loading...' : `Showing ${items.length} items`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-4 text-muted-foreground">Loading items...</p>
                </div>
              ) : items.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No items found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item, index) => (
                    <motion.div
                      key={item.itemId}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center space-x-4 flex-1">
                        {/* Item Image */}
                        <div className="relative w-20 h-20 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                          {item.primaryImageUrl ? (
                            <>
                              <img
                                src={item.primaryImageUrl}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                              {item.isVerified && (
                                <div className="absolute top-1 right-1 bg-green-500 rounded-full p-1">
                                  <CheckCircle className="w-3 h-3 text-white" />
                                </div>
                              )}
                            </>
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ImageIcon className="w-8 h-8 text-primary/30" />
                            </div>
                          )}
                        </div>

                        {/* Item Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold text-foreground truncate">
                              {item.displayName || item.name}
                            </h3>
                            {item.isVerified && (
                              <Badge variant="outline" className="text-xs">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Verified
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center space-x-3 text-sm text-muted-foreground mt-1">
                            <span className="truncate">{item.categoryName || 'No category'}</span>
                            {item.brandName && (
                              <>
                                <span>•</span>
                                <span className="truncate">{item.brandName}</span>
                              </>
                            )}
                            {item.size && (
                              <>
                                <span>•</span>
                                <span>Size {item.size}</span>
                              </>
                            )}
                            {item.color && (
                              <>
                                <span>•</span>
                                <span>{item.color}</span>
                              </>
                            )}
                          </div>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-xs text-muted-foreground">
                              Code: {item.itemCode}
                            </span>
                            {item.conditionScore && (
                              <>
                                <span className="text-muted-foreground">•</span>
                                <span className="text-xs text-muted-foreground flex items-center">
                                  <Star className="w-3 h-3 mr-1 fill-yellow-400 text-yellow-400" />
                                  {item.conditionScore.toFixed(1)} - {item.conditionText}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-6">
                        {/* Price */}
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Est. Value</p>
                          <p className="text-lg font-bold text-blue-600">
                            ${item.currentEstimatedValue?.toFixed(2) || '0.00'}
                          </p>
                          {item.resellPrice && (
                            <>
                              <p className="text-sm text-muted-foreground mt-1">Resell Price</p>
                              <p className="text-lg font-bold text-green-600">
                                ${item.resellPrice.toFixed(2)}
                              </p>
                            </>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(item.createdAt).toLocaleDateString()}
                          </p>
                        </div>

                        {/* Status Badge */}
                        <Badge variant={getStatusBadgeVariant(item.itemStatus)}>
                          {item.itemStatus.replace(/_/g, ' ')}
                        </Badge>

                        {/* Actions */}
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/admin/items/${item.itemId}`}>
                              <Eye className="w-4 h-4" />
                            </Link>
                          </Button>
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/admin/items/${item.itemId}/edit`}>
                              <Edit className="w-4 h-4" />
                            </Link>
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDelete(item.itemId)}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
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
      </motion.div>
    </AdminLayout>
  );
}
