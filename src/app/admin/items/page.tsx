'use client';

import React, { useState } from 'react';
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
  Clock
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import AdminLayout from '@/components/layout/AdminLayout';
import SearchBar from '@/components/ui/SearchBar';
import StatsCard from '@/components/ui/StatsCard';

const itemStats = [
  { icon: Package, label: 'Total Items', value: '3,456' },
  { icon: CheckCircle, label: 'Approved', value: '2,891' },
  { icon: Clock, label: 'Pending Review', value: '234' },
  { icon: XCircle, label: 'Rejected', value: '331' },
];

const mockItems = [
  {
    id: 1,
    title: 'Vintage Denim Jacket',
    seller: 'Sarah Johnson',
    category: 'Jackets',
    price: 45,
    condition: 'Very Good',
    status: 'approved',
    views: 234,
    likes: 18,
    listedDate: '2024-01-15',
  },
  {
    id: 2,
    title: 'Sustainable Cotton Dress',
    seller: 'Emma Wilson',
    category: 'Dresses',
    price: 32,
    condition: 'Like New',
    status: 'pending',
    views: 45,
    likes: 8,
    listedDate: '2024-02-20',
  },
  {
    id: 3,
    title: 'Designer Leather Bag',
    seller: 'John Davis',
    category: 'Bags',
    price: 150,
    condition: 'Good',
    status: 'approved',
    views: 456,
    likes: 35,
    listedDate: '2024-01-10',
  },
];

export default function ItemsManagementPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');

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
                  onChange={setSearchTerm}
                  placeholder="Search items..."
                  className="flex-1"
                />

                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-3 py-2 border border-input rounded-md bg-background"
                >
                  <option value="all">All Status</option>
                  <option value="approved">Approved</option>
                  <option value="pending">Pending</option>
                  <option value="rejected">Rejected</option>
                </select>

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
              <CardDescription>Review and manage platform items</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                        <Package className="w-8 h-8 text-primary/50" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">{item.title}</h3>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                          <span>by {item.seller}</span>
                          <span>•</span>
                          <span>{item.category}</span>
                          <span>•</span>
                          <span>{item.condition}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-8">
                      <div className="text-right">
                        <p className="text-lg font-bold text-foreground">${item.price}</p>
                        <p className="text-sm text-muted-foreground">{item.views} views</p>
                      </div>

                      <Badge 
                        variant={
                          item.status === 'approved' ? 'default' : 
                          item.status === 'pending' ? 'secondary' : 
                          'destructive'
                        }
                      >
                        {item.status}
                      </Badge>

                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AdminLayout>
  );
}
