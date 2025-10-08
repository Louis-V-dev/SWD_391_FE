'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Users, 
  Package, 
  DollarSign,
  ShoppingBag,
  ArrowUpRight,
  ArrowDownRight,
  Activity
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import AdminLayout from '@/components/layout/AdminLayout';
import StatsCard from '@/components/ui/StatsCard';

const stats = [
  { icon: DollarSign, label: 'Total Revenue', value: '$45,231' },
  { icon: ShoppingBag, label: 'Total Sales', value: '2,456' },
  { icon: Users, label: 'Active Users', value: '12,234' },
  { icon: Package, label: 'Items Listed', value: '8,543' },
];

const topCategories = [
  { name: 'Clothing', sales: 1234, revenue: '$12,340', growth: '+12%' },
  { name: 'Shoes', sales: 856, revenue: '$8,560', growth: '+8%' },
  { name: 'Accessories', sales: 543, revenue: '$5,430', growth: '+15%' },
  { name: 'Bags', sales: 432, revenue: '$4,320', growth: '-3%' },
];

const topSellers = [
  { name: 'Sarah Johnson', sales: 234, revenue: '$5,670', rating: 4.9 },
  { name: 'Mike Chen', sales: 189, revenue: '$4,234', rating: 4.8 },
  { name: 'Emma Wilson', sales: 156, revenue: '$3,890', rating: 4.7 },
  { name: 'John Davis', sales: 142, revenue: '$3,456', rating: 4.9 },
];

export default function AnalyticsPage() {
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
        <motion.div variants={itemVariants}>
          <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
          <p className="text-muted-foreground">
            Track platform performance and insights
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <StatsCard
              key={stat.label}
              icon={stat.icon}
              label={stat.label}
              value={stat.value}
              index={index}
            />
          ))}
        </motion.div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Chart */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle>Revenue Overview</CardTitle>
                <CardDescription>Monthly revenue for the last 6 months</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-muted/30 rounded-lg">
                  <div className="text-center">
                    <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">Chart will be implemented here</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* User Growth */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle>User Growth</CardTitle>
                <CardDescription>New users over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-muted/30 rounded-lg">
                  <div className="text-center">
                    <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">Chart will be implemented here</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Categories */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle>Top Categories</CardTitle>
                <CardDescription>Best performing categories</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topCategories.map((category, index) => (
                    <div key={category.name} className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{category.name}</p>
                        <p className="text-sm text-muted-foreground">{category.sales} sales</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-foreground">{category.revenue}</p>
                        <p className={`text-sm flex items-center justify-end ${
                          category.growth.startsWith('+') ? 'text-green-500' : 'text-red-500'
                        }`}>
                          {category.growth.startsWith('+') ? (
                            <ArrowUpRight className="w-3 h-3 mr-1" />
                          ) : (
                            <ArrowDownRight className="w-3 h-3 mr-1" />
                          )}
                          {category.growth}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Top Sellers */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle>Top Sellers</CardTitle>
                <CardDescription>Most successful sellers this month</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topSellers.map((seller, index) => (
                    <div key={seller.name} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 flex-1">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-medium text-primary">
                            {seller.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{seller.name}</p>
                          <p className="text-sm text-muted-foreground">{seller.sales} sales</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-foreground">{seller.revenue}</p>
                        <p className="text-sm text-muted-foreground">★ {seller.rating}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </AdminLayout>
  );
}
