'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { 
  User as UserIcon, 
  Mail, 
  Phone, 
  Calendar,
  Edit3,
  Save,
  X,
  ShoppingBag,
  Award,
  Loader2,
  Camera
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import * as userApi from '@/api/users';
import type { User, UserUpdateRequest } from '@/types/domains/users';

export default function ProfileOverviewPage() {
  const { user: authUser, userPoints } = useAuth();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Full user data (from API, not just auth)
  const [user, setUser] = useState<User | null>(null);
  
  // Edit form states
  const [editForm, setEditForm] = useState<UserUpdateRequest>({
    firstName: '',
    lastName: '',
    phone: '',
    bio: '',
    dateOfBirth: '',
    gender: undefined
  });

  // Load full user data
  useEffect(() => {
    if (authUser?.userId) {
      loadUserData();
    }
  }, [authUser]);

  // Initialize edit form when user data loads
  useEffect(() => {
    if (user) {
      setEditForm({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
        bio: user.bio || '',
        dateOfBirth: user.dateOfBirth || '',
        gender: user.gender
      });
    }
  }, [user]);

  const loadUserData = async () => {
    if (!authUser?.userId) return;
    
    setLoading(true);
    try {
      const userData = await userApi.getUserById(authUser.userId);
      setUser(userData);
    } catch (error) {
      console.error('Failed to load user data:', error);
      // Fallback to auth user
      setUser(authUser as any);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user?.userId) return;

    setSaving(true);
    try {
      const updatedUser = await userApi.updateUser(user.userId, editForm);
      setUser(updatedUser);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    if (user) {
      setEditForm({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
        bio: user.bio || '',
        dateOfBirth: user.dateOfBirth || '',
        gender: user.gender
      });
    }
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Info Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Manage your personal information</CardDescription>
          </div>
          {!isEditing ? (
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
              <Edit3 className="w-4 h-4 mr-2" />
              Edit
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleCancelEdit} disabled={saving}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button size="sm" onClick={handleSaveProfile} disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Save
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Profile Picture */}
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center overflow-hidden">
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.firstName || 'Profile'} className="w-full h-full object-cover" />
                ) : (
                  <UserIcon className="w-12 h-12 text-green-600" />
                )}
              </div>
              <Button
                size="icon"
                className="absolute bottom-0 right-0 rounded-full h-8 w-8"
                variant="secondary"
                title="Update avatar"
              >
                <Camera className="w-4 h-4" />
              </Button>
            </div>
            <div>
              <h3 className="text-lg font-semibold">
                {user?.firstName} {user?.lastName}
              </h3>
              <p className="text-sm text-muted-foreground">@{user?.username}</p>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">First Name</label>
                <Input
                  value={editForm.firstName}
                  onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Last Name</label>
                <Input
                  value={editForm.lastName}
                  onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                  disabled={!isEditing}
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Email</label>
              <Input value={user?.email || ''} disabled type="email" />
            </div>
            <div>
              <label className="text-sm font-medium">Phone</label>
              <Input
                value={editForm.phone}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                disabled={!isEditing}
                type="tel"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Bio</label>
              <textarea
                className="w-full p-3 border border-border rounded-md bg-background disabled:opacity-50 disabled:cursor-not-allowed"
                rows={4}
                disabled={!isEditing}
                value={editForm.bio}
                onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                placeholder="Tell us about yourself..."
              />
            </div>
          </div>

          {/* Contact Info Display */}
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground border-t pt-4">
            {user?.email && (
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>{user.email}</span>
              </div>
            )}
            {user?.phone && (
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span>{user.phone}</span>
              </div>
            )}
            {user?.createdAt && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>Joined {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats - Points & Orders */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Points Card */}
        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push('/profile/points')}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                  <Award className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Available Points</p>
                  <h3 className="text-3xl font-bold text-green-600">{userPoints.toLocaleString()}</h3>
                </div>
              </div>
            </div>
            <Button variant="outline" className="w-full">
              View Points History
            </Button>
          </CardContent>
        </Card>

        {/* Orders Card */}
        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push('/profile/orders')}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                  <ShoppingBag className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Orders</p>
                  <h3 className="text-3xl font-bold text-blue-600">{user?.ordersCount || 0}</h3>
                </div>
              </div>
            </div>
            <Button variant="outline" className="w-full">
              View All Orders
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
