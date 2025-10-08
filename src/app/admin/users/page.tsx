'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Search,
  Filter,
  UserPlus,
  MoreVertical,
  Edit,
  Trash2,
  Ban,
  CheckCircle,
  Mail,
  Calendar,
  TrendingUp
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import AdminLayout from '@/components/layout/AdminLayout';
import SearchBar from '@/components/ui/SearchBar';
import StatsCard from '@/components/ui/StatsCard';

const userStats = [
  { icon: Users, label: 'Total Users', value: '2,543' },
  { icon: CheckCircle, label: 'Active Users', value: '2,234' },
  { icon: UserPlus, label: 'New This Month', value: '234' },
  { icon: TrendingUp, label: 'Growth Rate', value: '+12%' },
];

const mockUsers = [
  {
    id: 1,
    name: 'Sarah Johnson',
    email: 'sarah.j@example.com',
    role: 'Seller',
    status: 'active',
    itemsListed: 24,
    itemsSold: 18,
    joinedDate: '2024-01-15',
    sustainabilityScore: 92,
  },
  {
    id: 2,
    name: 'Mike Chen',
    email: 'mike.chen@example.com',
    role: 'Buyer',
    status: 'active',
    itemsListed: 0,
    itemsSold: 0,
    joinedDate: '2024-02-20',
    sustainabilityScore: 85,
  },
  {
    id: 3,
    name: 'Emma Wilson',
    email: 'emma.w@example.com',
    role: 'Seller',
    status: 'suspended',
    itemsListed: 12,
    itemsSold: 8,
    joinedDate: '2024-01-05',
    sustainabilityScore: 78,
  },
  {
    id: 4,
    name: 'John Davis',
    email: 'john.d@example.com',
    role: 'Both',
    status: 'active',
    itemsListed: 15,
    itemsSold: 12,
    joinedDate: '2023-12-10',
    sustainabilityScore: 88,
  },
];

export default function UsersManagementPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
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
            <h1 className="text-3xl font-bold text-foreground">Users Management</h1>
            <p className="text-muted-foreground">
              Manage and monitor all platform users
            </p>
          </div>
          <Button>
            <UserPlus className="w-4 h-4 mr-2" />
            Add User
          </Button>
        </motion.div>

        {/* Stats */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {userStats.map((stat, index) => (
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
                  placeholder="Search users..."
                  className="flex-1"
                />
                
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="px-3 py-2 border border-input rounded-md bg-background"
                >
                  <option value="all">All Roles</option>
                  <option value="seller">Sellers</option>
                  <option value="buyer">Buyers</option>
                  <option value="both">Both</option>
                </select>

                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-3 py-2 border border-input rounded-md bg-background"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                  <option value="inactive">Inactive</option>
                </select>

                <Button variant="outline">
                  <Filter className="w-4 h-4 mr-2" />
                  More Filters
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Users Table */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle>All Users</CardTitle>
              <CardDescription>A list of all users on the platform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">User</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Role</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Items</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Sustainability</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Joined</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockUsers.map((user, index) => (
                      <motion.tr
                        key={user.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="border-b hover:bg-muted/50 transition-colors"
                      >
                        <td className="py-4 px-4">
                          <div>
                            <p className="font-medium text-foreground">{user.name}</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <Badge variant="outline">{user.role}</Badge>
                        </td>
                        <td className="py-4 px-4">
                          <Badge 
                            variant={user.status === 'active' ? 'default' : 'destructive'}
                          >
                            {user.status}
                          </Badge>
                        </td>
                        <td className="py-4 px-4">
                          <div className="text-sm">
                            <p className="text-foreground">{user.itemsListed} listed</p>
                            <p className="text-muted-foreground">{user.itemsSold} sold</p>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-2">
                            <div className="w-full max-w-[100px] bg-muted rounded-full h-2">
                              <div 
                                className="bg-green-500 h-2 rounded-full" 
                                style={{ width: `${user.sustainabilityScore}%` }}
                              />
                            </div>
                            <span className="text-sm text-muted-foreground">{user.sustainabilityScore}%</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-sm text-muted-foreground">
                          {new Date(user.joinedDate).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <Button variant="ghost" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Mail className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AdminLayout>
  );
}
