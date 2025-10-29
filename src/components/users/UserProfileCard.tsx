'use client';

import { User } from '@/types/domains/users';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Mail, Phone, Calendar, Award, Users, ShoppingBag } from 'lucide-react';

interface UserProfileCardProps {
  user: User;
  showStats?: boolean;
}

export function UserProfileCard({ user, showStats = true }: UserProfileCardProps) {
  return (
    <Card className="p-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="h-20 w-20 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white text-2xl font-bold">
          {user.firstName?.[0] || user.username[0].toUpperCase()}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-gray-900">{user.fullName || user.username}</h2>
            {user.isVerified && (
              <Badge variant="success">Verified</Badge>
            )}
            {user.isBanned && (
              <Badge variant="error">Banned</Badge>
            )}
          </div>
          <p className="text-gray-600 mt-1">@{user.username}</p>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline">{user.role}</Badge>
          </div>
        </div>
      </div>

      {/* Bio */}
      {user.bio && (
        <p className="text-gray-700 mt-4">{user.bio}</p>
      )}

      {/* Contact Info */}
      <div className="mt-4 space-y-2">
        {user.email && (
          <div className="flex items-center gap-2 text-gray-600">
            <Mail className="h-4 w-4" />
            <span className="text-sm">{user.email}</span>
            {user.emailVerified && <span className="text-green-600 text-xs">(Verified)</span>}
          </div>
        )}
        {user.phone && (
          <div className="flex items-center gap-2 text-gray-600">
            <Phone className="h-4 w-4" />
            <span className="text-sm">{user.phone}</span>
            {user.phoneVerified && <span className="text-green-600 text-xs">(Verified)</span>}
          </div>
        )}
        <div className="flex items-center gap-2 text-gray-600">
          <Calendar className="h-4 w-4" />
          <span className="text-sm">Joined {new Date(user.createdAt).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Scores */}
      <div className="grid grid-cols-3 gap-4 mt-6">
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <Award className="h-5 w-5 text-green-600 mx-auto mb-1" />
          <p className="text-xs text-gray-600">Points</p>
          <p className="text-lg font-bold text-gray-900">{user.sustainabilityPoints}</p>
        </div>
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <p className="text-xs text-gray-600">Trust Score</p>
          <p className="text-lg font-bold text-gray-900">{user.trustScore.toFixed(1)}/10</p>
        </div>
        <div className="text-center p-3 bg-purple-50 rounded-lg">
          <p className="text-xs text-gray-600">Eco Score</p>
          <p className="text-lg font-bold text-gray-900">{user.sustainabilityScore.toFixed(1)}/10</p>
        </div>
      </div>

      {/* Stats */}
      {showStats && (
        <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t">
          <div className="text-center">
            <Users className="h-5 w-5 text-gray-400 mx-auto mb-1" />
            <p className="text-sm font-medium text-gray-900">{user.followersCount || 0}</p>
            <p className="text-xs text-gray-600">Followers</p>
          </div>
          <div className="text-center">
            <ShoppingBag className="h-5 w-5 text-gray-400 mx-auto mb-1" />
            <p className="text-sm font-medium text-gray-900">{user.listingsCount || 0}</p>
            <p className="text-xs text-gray-600">Listings</p>
          </div>
          <div className="text-center">
            <ShoppingBag className="h-5 w-5 text-gray-400 mx-auto mb-1" />
            <p className="text-sm font-medium text-gray-900">{user.ordersCount || 0}</p>
            <p className="text-xs text-gray-600">Orders</p>
          </div>
        </div>
      )}
    </Card>
  );
}



















