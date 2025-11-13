import { useState, useEffect, useCallback } from 'react';
import * as userApi from '@/api/users';
import type { User, UserUpdateRequest, UserStatistics, UserManagementSummary } from '@/types/domains/users';
import { handleApiError } from '@/api';
import { formatApiError } from '@/utils/errorMessages';

export const useUser = (userId?: string) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = useCallback(async () => {
    if (!userId) return;
    
    setLoading(true);
    setError(null);
    try {
      const data = await userApi.getUserById(userId);
      setUser(data);
    } catch (err: unknown) {
      const backendMessage = handleApiError(err);
      const friendlyMessage = formatApiError(
        backendMessage,
        'users',
        'Failed to fetch user details.'
      );
      setError(friendlyMessage);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const update = async (data: UserUpdateRequest) => {
    if (!userId) return;
    
    setLoading(true);
    setError(null);
    try {
      const updated = await userApi.updateUser(userId, data);
      setUser(updated);
      return updated;
    } catch (err: unknown) {
      const backendMessage = handleApiError(err);
      const friendlyMessage = formatApiError(
        backendMessage,
        'users',
        'Failed to update user.'
      );
      setError(friendlyMessage);
      throw new Error(friendlyMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateAvatar = async (avatarUrl: string) => {
    if (!userId) return;
    
    setLoading(true);
    setError(null);
    try {
      const updated = await userApi.updateUserAvatar(userId, avatarUrl);
      setUser(updated);
      return updated;
    } catch (err: unknown) {
      const backendMessage = handleApiError(err);
      const friendlyMessage = formatApiError(
        backendMessage,
        'users',
        'Failed to update avatar.'
      );
      setError(friendlyMessage);
      throw new Error(friendlyMessage);
    } finally {
      setLoading(false);
    }
  };

  return { user, loading, error, update, updateAvatar, refetch: fetchUser };
};

export const useUserStatistics = (userId?: string) => {
  const [statistics, setStatistics] = useState<UserStatistics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStatistics = useCallback(async () => {
    if (!userId) return;
    
    setLoading(true);
    setError(null);
    try {
      const data = await userApi.getUserStatistics(userId);
      setStatistics(data);
    } catch (err: unknown) {
      const backendMessage = handleApiError(err);
      const friendlyMessage = formatApiError(
        backendMessage,
        'users',
        'Failed to fetch user statistics.'
      );
      setError(friendlyMessage);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchStatistics();
  }, [fetchStatistics]);

  return { statistics, loading, error, refetch: fetchStatistics };
};

export const useUserManagement = (page: number = 0, size: number = 10) => {
  const [summary, setSummary] = useState<UserManagementSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await userApi.getUserManagementSummary(page, size);
      setSummary(data);
    } catch (err: unknown) {
      const backendMessage = handleApiError(err);
      const friendlyMessage = formatApiError(
        backendMessage,
        'admin/users',
        'Failed to fetch user management summary.'
      );
      setError(friendlyMessage);
    } finally {
      setLoading(false);
    }
  }, [page, size]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  const banUser = async (userId: string, reason: string) => {
    try {
      await userApi.banUser(userId, reason);
      await fetchSummary();
    } catch (err: unknown) {
      const backendMessage = handleApiError(err);
      const friendlyMessage = formatApiError(
        backendMessage,
        'admin/users',
        'Failed to ban user.'
      );
      throw new Error(friendlyMessage);
    }
  };

  const unbanUser = async (userId: string) => {
    try {
      await userApi.unbanUser(userId);
      await fetchSummary();
    } catch (err: unknown) {
      const backendMessage = handleApiError(err);
      const friendlyMessage = formatApiError(
        backendMessage,
        'admin/users',
        'Failed to unban user.'
      );
      throw new Error(friendlyMessage);
    }
  };

  const activateUser = async (userId: string) => {
    try {
      await userApi.activateUser(userId);
      await fetchSummary();
    } catch (err: unknown) {
      const backendMessage = handleApiError(err);
      const friendlyMessage = formatApiError(
        backendMessage,
        'admin/users',
        'Failed to activate user.'
      );
      throw new Error(friendlyMessage);
    }
  };

  const deactivateUser = async (userId: string) => {
    try {
      await userApi.deactivateUser(userId);
      await fetchSummary();
    } catch (err: unknown) {
      const backendMessage = handleApiError(err);
      const friendlyMessage = formatApiError(
        backendMessage,
        'admin/users',
        'Failed to deactivate user.'
      );
      throw new Error(friendlyMessage);
    }
  };

  const verifyUser = async (userId: string) => {
    try {
      await userApi.verifyUser(userId);
      await fetchSummary();
    } catch (err: unknown) {
      const backendMessage = handleApiError(err);
      const friendlyMessage = formatApiError(
        backendMessage,
        'admin/users',
        'Failed to verify user.'
      );
      throw new Error(friendlyMessage);
    }
  };

  return { 
    summary, 
    loading, 
    error, 
    banUser, 
    unbanUser,
    activateUser,
    deactivateUser,
    verifyUser,
    refetch: fetchSummary 
  };
};

export const useSocialFeatures = (userId?: string) => {
  const [followersCount, setFollowersCount] = useState<number>(0);
  const [followingCount, setFollowingCount] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCounts = useCallback(async () => {
    if (!userId) return;
    
    setLoading(true);
    setError(null);
    try {
      const [followers, following] = await Promise.all([
        userApi.getFollowersCount(userId),
        userApi.getFollowingCount(userId)
      ]);
      setFollowersCount(followers);
      setFollowingCount(following);
    } catch (err: unknown) {
      const backendMessage = handleApiError(err);
      const friendlyMessage = formatApiError(
        backendMessage,
        'users',
        'Failed to fetch social counts.'
      );
      setError(friendlyMessage);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchCounts();
  }, [fetchCounts]);

  const followUser = async (followedId: string) => {
    if (!userId) return;
    
    try {
      await userApi.followUser(userId, followedId);
      await fetchCounts();
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Failed to follow user');
    }
  };

  const unfollowUser = async (followedId: string) => {
    if (!userId) return;
    
    try {
      await userApi.unfollowUser(userId, followedId);
      await fetchCounts();
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Failed to unfollow user');
    }
  };

  return { 
    followersCount, 
    followingCount, 
    loading, 
    error, 
    followUser, 
    unfollowUser,
    refetch: fetchCounts 
  };
};



















