'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ShoppingBag, 
  Filter,
  MoreVertical,
  Edit,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import AdminLayout from '@/components/layout/AdminLayout';
import SearchBar from '@/components/ui/SearchBar';
import StatsCard from '@/components/ui/StatsCard';

const listingStats = [
  { icon: ShoppingBag, label: 'Total Listings', value: '1,234' },
  { icon: CheckCircle, label: 'Active', value: '856' },
  { icon: Clock, label: 'Pending', value: '123' },
  { icon: DollarSign, label: 'Total Value', value: '$45,678' },
];

const mockListings = [
  {
    id: 1,
    title: 'Vintage Denim Jacket',
    seller: 'Sarah Johnson',
    type: 'sale',
    price: 45,
    status: 'active',
    views: 234,
    created: '2024-01-15',
  },
  {
    id: 2,
    title: 'Sustainable Cotton Dress',
    seller: 'Emma Wilson',
    type: 'rent',
    price: 15,
    status: 'pending',
    views: 45,
    created: '2024-02-20',
  },
];

export default function ListingsManagementPage() {
  const [searchTerm, setSearchTerm] = useState('');

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
        <motion.div variants={itemVariants}>
          <h1 className="text-3xl font-bold">Listings Management</h1>
          <p className="text-muted-foreground">Manage all marketplace listings</p>
        </motion.div>

        <motion.div variants={itemVariants} className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {listingStats.map((stat, index) => (
            <StatsCard
              key={stat.label}
              icon={stat.icon}
              label={stat.label}
              value={stat.value}
              index={index}
            />
          ))}
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card>
            <CardContent className="pt-6">
              <SearchBar
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder="Search listings..."
              />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle>All Listings</CardTitle>
              <CardDescription>Manage marketplace listings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockListings.map((listing) => (
                  <div key={listing.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-semibold">{listing.title}</h3>
                      <p className="text-sm text-muted-foreground">by {listing.seller}</p>
                    </div>
                    <Badge variant={listing.status === 'active' ? 'default' : 'secondary'}>
                      {listing.status}
                    </Badge>
                    <div className="flex space-x-2 ml-4">
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AdminLayout>
  );
}
