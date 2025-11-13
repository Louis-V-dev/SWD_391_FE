'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  UserPlus,
  MoreVertical,
  Edit,
  Ban,
  CheckCircle,
  TrendingUp,
  UserCheck,
  UserX,
  Shield,
  Loader2
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import AdminLayout from '@/components/layout/AdminLayout';
import SearchBar from '@/components/ui/SearchBar';
import StatsCard from '@/components/ui/StatsCard';
import { useUserManagement } from '@/hooks/useUsers';
import { adjustPoints } from '@/api/points';
import type { User } from '@/types/domains/users';
import { UserDetailModal } from '@/components/users/UserDetailModal';
import { AdjustPointsModal } from '@/components/users/AdjustPointsModal';
import { BanUserModal } from '@/components/users/BanUserModal';
import { handleApiError } from '@/api';
import { formatApiError } from '@/utils/errorMessages';

export default function UsersManagementPage() {
  const [page, setPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [detailUserId, setDetailUserId] = useState<string | null>(null);
  const [adjustPointsUser, setAdjustPointsUser] = useState<User | null>(null);
  const [banUserTarget, setBanUserTarget] = useState<User | null>(null);

  const { summary, loading, banUser, unbanUser, activateUser, deactivateUser, verifyUser, refetch } = useUserManagement(page, 20);
  const usersList: User[] = summary?.users?.content ?? [];
  const detailUser = detailUserId ? usersList.find((user) => user.userId === detailUserId) ?? null : null;

  useEffect(() => {
    if (detailUserId && !loading && !detailUser) {
      setDetailUserId(null);
    }
  }, [detailUserId, detailUser, loading]);

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

  const handleBanUser = async ({ userId, reason }: { userId: string; reason: string }) => {
    try {
      await banUser(userId, reason);
      setSelectedUser(null);
      alert('User banned successfully.');
    } catch (err: unknown) {
      const backendMessage = handleApiError(err);
      const friendlyMessage = formatApiError(
        backendMessage,
        'admin/users',
        'Failed to ban user. Please try again.'
      );
      throw new Error(friendlyMessage);
    }
  };

  const handleUnbanUser = async (userId: string) => {
    try {
      await unbanUser(userId);
      setSelectedUser(null);
    } catch (err: unknown) {
      const backendMessage = handleApiError(err);
      const friendlyMessage = formatApiError(
        backendMessage,
        'admin/users',
        'Failed to unban user. Please try again.'
      );
      alert(friendlyMessage);
    }
  };

  const handleVerifyUser = async (userId: string) => {
    try {
      await verifyUser(userId);
      setSelectedUser(null);
    } catch (err: unknown) {
      const backendMessage = handleApiError(err);
      const friendlyMessage = formatApiError(
        backendMessage,
        'admin/users',
        'Failed to verify user. Please try again.'
      );
      alert(friendlyMessage);
    }
  };

  const handleActivateUser = async (userId: string) => {
    try {
      await activateUser(userId);
      setSelectedUser(null);
    } catch (err: unknown) {
      const backendMessage = handleApiError(err);
      const friendlyMessage = formatApiError(
        backendMessage,
        'admin/users',
        'Failed to activate user. Please try again.'
      );
      alert(friendlyMessage);
    }
  };

  const handleDeactivateUser = async (userId: string) => {
    try {
      await deactivateUser(userId);
      setSelectedUser(null);
    } catch (err: unknown) {
      const backendMessage = handleApiError(err);
      const friendlyMessage = formatApiError(
        backendMessage,
        'admin/users',
        'Failed to deactivate user. Please try again.'
      );
      alert(friendlyMessage);
    }
  };

  const handleAdjustPoints = async ({ userId, amount, reason }: { userId: string; amount: number; reason: string }) => {
    try {
      await adjustPoints(userId, amount, reason);
      await refetch();
      alert('Points adjusted successfully.');
      setSelectedUser(null);
    } catch (err: unknown) {
      const backendMessage = handleApiError(err);
      const friendlyMessage = formatApiError(
        backendMessage,
        'admin/users',
        'Failed to adjust points. Please try again.'
      );
      throw new Error(friendlyMessage);
    }
  };

  const filteredUsers = usersList.filter(user => {
    const matchesSearch = !searchTerm || 
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.fullName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    const matchesStatus = selectedStatus === 'all' || 
      (selectedStatus === 'active' && user.isActive) ||
      (selectedStatus === 'banned' && user.isBanned) ||
      (selectedStatus === 'inactive' && !user.isActive && !user.isBanned);
    
    return matchesSearch && matchesRole && matchesStatus;
  }) || [];

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
          <StatsCard
            icon={Users}
            label="Total Users"
            value={summary?.totalUsers || 0}
            index={0}
          />
          <StatsCard
            icon={UserCheck}
            label="Active Users"
            value={summary?.activeUsers || 0}
            index={1}
          />
          <StatsCard
            icon={Shield}
            label="Verified Users"
            value={summary?.verifiedUsers || 0}
            index={2}
          />
          <StatsCard
            icon={UserX}
            label="Banned Users"
            value={summary?.bannedUsers || 0}
            index={3}
          />
        </motion.div>

        {/* Users by Role Distribution */}
        {summary?.usersByRole && Object.keys(summary.usersByRole).length > 0 && (
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle>Users by Role</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {Object.entries(summary.usersByRole).map(([role, count]) => (
                    <div key={role} className="text-center p-4 bg-muted rounded-lg">
                      <p className="text-2xl font-bold text-foreground">{count as number}</p>
                      <p className="text-sm text-muted-foreground mt-1">{role}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

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
                  <option value="USER">User</option>
                  <option value="ADMIN">Admin</option>
                  <option value="STAFF">Staff</option>
                </select>

                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-3 py-2 border border-input rounded-md bg-background"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="banned">Banned</option>
                  <option value="inactive">Inactive</option>
                </select>
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
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No users found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">User</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Role</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Points</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Stats</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Joined</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((user, index) => (
                        <motion.tr
                          key={user.userId}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="border-b hover:bg-muted/50 transition-colors"
                        >
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white font-bold">
                                {user.username[0].toUpperCase()}
                              </div>
                              <div>
                                <p className="font-medium text-foreground">{user.fullName || user.username}</p>
                                <p className="text-sm text-muted-foreground">{user.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <Badge variant="outline">{user.role}</Badge>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex flex-col gap-1">
                              {user.isVerified && <Badge variant="success">Verified</Badge>}
                              {user.isActive && <Badge variant="success">Active</Badge>}
                              {user.isBanned && <Badge variant="error">Banned</Badge>}
                              {!user.isActive && !user.isBanned && <Badge variant="warning">Inactive</Badge>}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="text-sm">
                              <p className="font-medium text-green-600">{user.sustainabilityPoints?.toLocaleString() ?? '0'}</p>
                              <p className="text-muted-foreground">Eco: {user.sustainabilityScore?.toFixed(1) ?? '0.0'}/10</p>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="text-sm text-muted-foreground">
                              <p>{user.followersCount || 0} followers</p>
                              <p>{user.itemsCount || 0} items</p>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-sm text-muted-foreground">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-4 px-4 text-right">
                            <div className="relative inline-block">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => setSelectedUser(selectedUser === user.userId ? null : user.userId)}
                              >
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                              
                              {selectedUser === user.userId && (
                                <div className="absolute right-0 mt-2 w-48 bg-background rounded-lg shadow-lg border border-border z-10">
                                  <div className="py-1">
                                    {!user.isVerified && (
                                      <button
                                        onClick={() => handleVerifyUser(user.userId)}
                                        className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-muted flex items-center gap-2"
                                      >
                                        <CheckCircle className="h-4 w-4" />
                                        Verify User
                                      </button>
                                    )}
                                    {user.isBanned ? (
                                      <button
                                        onClick={() => handleUnbanUser(user.userId)}
                                        className="w-full text-left px-4 py-2 text-sm text-green-600 hover:bg-muted flex items-center gap-2"
                                      >
                                        <CheckCircle className="h-4 w-4" />
                                        Unban User
                                      </button>
                                    ) : (
                                      <button
                                        onClick={() => {
                                          setBanUserTarget(user);
                                          setSelectedUser(null);
                                        }}
                                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-muted flex items-center gap-2"
                                      >
                                        <Ban className="h-4 w-4" />
                                        Ban User
                                      </button>
                                    )}
                                    <button
                                      onClick={() => {
                                        setDetailUserId(user.userId);
                                        setSelectedUser(null);
                                      }}
                                      className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-muted flex items-center gap-2"
                                    >
                                      <Edit className="h-4 w-4" />
                                      View Details
                                    </button>
                                    <button
                                      onClick={() => {
                                        setAdjustPointsUser(user);
                                        setSelectedUser(null);
                                      }}
                                      className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-muted flex items-center gap-2"
                                    >
                                      <TrendingUp className="h-4 w-4" />
                                      Adjust Points
                                    </button>
                                    <button
                                      onClick={() => window.location.href = `/profile/points?userId=${user.userId}`}
                                      className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-muted"
                                    >
                                      View Points
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination */}
              {summary?.users && summary.users.totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t">
                  <div className="text-sm text-muted-foreground">
                    Showing <span className="font-medium">{page * 20 + 1}</span> to{' '}
                    <span className="font-medium">
                      {Math.min((page + 1) * 20, summary.users.totalElements)}
                    </span>{' '}
                    of <span className="font-medium">{summary.users.totalElements}</span> results
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setPage(Math.max(0, page - 1))}
                      disabled={page === 0}
                      variant="outline"
                      size="sm"
                    >
                      Previous
                    </Button>
                    <Button
                      onClick={() => setPage(page + 1)}
                      disabled={page >= summary.users.totalPages - 1}
                      variant="outline"
                      size="sm"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
      {detailUser && (
        <UserDetailModal
          user={detailUser}
          onClose={() => setDetailUserId(null)}
          onVerify={handleVerifyUser}
          onBanClick={(user) => setBanUserTarget(user)}
          onUnban={handleUnbanUser}
          onAdjustPointsClick={(user) => setAdjustPointsUser(user)}
          onActivate={handleActivateUser}
          onDeactivate={handleDeactivateUser}
        />
      )}
      <AdjustPointsModal
        user={adjustPointsUser}
        isOpen={Boolean(adjustPointsUser)}
        onClose={() => setAdjustPointsUser(null)}
        onSubmit={handleAdjustPoints}
      />
      <BanUserModal
        user={banUserTarget}
        isOpen={Boolean(banUserTarget)}
        onClose={() => setBanUserTarget(null)}
        onSubmit={handleBanUser}
      />
    </AdminLayout>
  );
}
