'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Settings, 
  Package, 
  Heart, 
  MapPin, 
  Mail, 
  Phone, 
  Calendar,
  Edit3,
  Camera,
  ShoppingBag,
  Star,
  TrendingUp
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const tabs = [
  { id: 'overview', name: 'Overview', icon: User },
  { id: 'items', name: 'My Items', icon: Package },
  { id: 'favorites', name: 'Favorites', icon: Heart },
  { id: 'settings', name: 'Settings', icon: Settings },
];

const userStats = [
  { label: 'Items Listed', value: '24', icon: Package },
  { label: 'Items Sold', value: '18', icon: ShoppingBag },
  { label: 'Rating', value: '4.8', icon: Star },
  { label: 'Sustainability Score', value: '92%', icon: TrendingUp },
];

const recentItems = [
  {
    id: 1,
    title: 'Vintage Denim Jacket',
    price: '$45',
    status: 'active',
    views: 23,
    image: '/api/placeholder/200/200'
  },
  {
    id: 2,
    title: 'Sustainable Cotton Dress',
    price: '$32',
    status: 'sold',
    views: 45,
    image: '/api/placeholder/200/200'
  },
  {
    id: 3,
    title: 'Eco-friendly Sneakers',
    price: '$78',
    status: 'active',
    views: 12,
    image: '/api/placeholder/200/200'
  },
];

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const { user } = useAuth();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 100
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-primary to-primary-light">
        <div className="container mx-auto px-4 py-16">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row items-center gap-8"
          >
            {/* Profile Picture */}
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-white/20 backdrop-blur-sm border-4 border-white/30 flex items-center justify-center">
                <User className="w-16 h-16 text-white" />
              </div>
              <Button
                size="icon"
                className="absolute bottom-0 right-0 rounded-full"
                variant="secondary"
              >
                <Camera className="w-4 h-4" />
              </Button>
            </div>

            {/* Profile Info */}
            <div className="text-center md:text-left text-white">
              <h1 className="text-3xl font-bold mb-2">
                {user?.firstName || 'John'} {user?.lastName || 'Doe'}
              </h1>
              <p className="text-white/80 mb-4">
                Sustainable Fashion Enthusiast
              </p>
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>San Francisco, CA</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>Joined March 2024</span>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="ml-auto">
              <div className="grid grid-cols-2 gap-4">
                {userStats.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="text-center bg-white/10 backdrop-blur-sm rounded-lg p-3"
                  >
                    <stat.icon className="w-5 h-5 text-white mx-auto mb-1" />
                    <div className="text-2xl font-bold text-white">{stat.value}</div>
                    <div className="text-xs text-white/80">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b bg-background/80 backdrop-blur-sm sticky top-16 z-10">
        <div className="container mx-auto px-4">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Profile Details */}
              <motion.div variants={itemVariants} className="lg:col-span-2">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Profile Information</CardTitle>
                      <CardDescription>
                        Manage your personal information and preferences
                      </CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditing(!isEditing)}
                    >
                      <Edit3 className="w-4 h-4 mr-2" />
                      {isEditing ? 'Save' : 'Edit'}
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">First Name</label>
                        <Input
                          defaultValue={user?.firstName || 'John'}
                          disabled={!isEditing}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Last Name</label>
                        <Input
                          defaultValue={user?.lastName || 'Doe'}
                          disabled={!isEditing}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Email</label>
                      <Input
                        defaultValue={user?.email || 'john.doe@example.com'}
                        disabled={!isEditing}
                        type="email"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Bio</label>
                      <textarea
                        className="w-full p-3 border border-border rounded-md"
                        rows={4}
                        disabled={!isEditing}
                        defaultValue="Passionate about sustainable fashion and reducing environmental impact through conscious consumption."
                      />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Quick Actions */}
              <motion.div variants={itemVariants}>
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button className="w-full justify-start">
                      <Package className="w-4 h-4 mr-2" />
                      List New Item
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <ShoppingBag className="w-4 h-4 mr-2" />
                      Browse Marketplace
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <TrendingUp className="w-4 h-4 mr-2" />
                      View Analytics
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Settings className="w-4 h-4 mr-2" />
                      Account Settings
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          )}

          {/* Items Tab */}
          {activeTab === 'items' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">My Items</h2>
                <Button>
                  <Package className="w-4 h-4 mr-2" />
                  Add New Item
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recentItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    variants={itemVariants}
                    className="group"
                  >
                    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="aspect-square bg-muted relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary-light/20 flex items-center justify-center">
                          <Package className="w-16 h-16 text-primary/50" />
                        </div>
                        <div className="absolute top-2 right-2">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            item.status === 'active' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {item.status}
                          </span>
                        </div>
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-semibold mb-2">{item.title}</h3>
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-bold text-primary">{item.price}</span>
                          <span className="text-sm text-muted-foreground">{item.views} views</span>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Favorites Tab */}
          {activeTab === 'favorites' && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Favorite Items</h2>
              <div className="text-center py-12">
                <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No favorites yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start exploring the marketplace to add items to your favorites
                </p>
                <Button>Browse Marketplace</Button>
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="max-w-2xl">
              <h2 className="text-2xl font-bold mb-6">Account Settings</h2>
              
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Notifications</CardTitle>
                    <CardDescription>
                      Manage how you receive notifications
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Email notifications</span>
                      <input type="checkbox" defaultChecked className="rounded" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Push notifications</span>
                      <input type="checkbox" defaultChecked className="rounded" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Marketing emails</span>
                      <input type="checkbox" className="rounded" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Privacy</CardTitle>
                    <CardDescription>
                      Control your privacy settings
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Profile visibility</span>
                      <select className="border border-border rounded px-3 py-1">
                        <option>Public</option>
                        <option>Private</option>
                      </select>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Show activity status</span>
                      <input type="checkbox" defaultChecked className="rounded" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Danger Zone</CardTitle>
                    <CardDescription>
                      Irreversible and destructive actions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="destructive">Delete Account</Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      <Footer />
    </div>
  );
} 