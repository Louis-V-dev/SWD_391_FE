import axiosInstance from '@/lib/axios';
import type { User, UserUpdateRequest, UserStatistics, UserManagementSummary, PasswordChangeRequest, PasswordResetRequest, PasswordResetConfirmRequest } from '@/types/domains/users';

// User Retrieval
export const getUserById = async (userId: string): Promise<User> => {
  const response = await axiosInstance.get(`/api/users/${userId}`);
  return response.data.data;
};

export const getUserByEmail = async (email: string): Promise<User> => {
  const response = await axiosInstance.get(`/api/users/email/${email}`);
  return response.data.data;
};

export const getUserByUsername = async (username: string): Promise<User> => {
  const response = await axiosInstance.get(`/api/users/username/${username}`);
  return response.data.data;
};

export const getAllUsers = async (page: number = 0, size: number = 10) => {
  const response = await axiosInstance.get('/api/users', {
    params: { page, size }
  });
  return response.data.data;
};

// User Update
export const updateUser = async (userId: string, data: UserUpdateRequest): Promise<User> => {
  const response = await axiosInstance.put(`/api/users/${userId}`, data);
  return response.data.data;
};

export const updateUserAvatar = async (userId: string, avatarUrl: string): Promise<User> => {
  const response = await axiosInstance.patch(`/api/users/${userId}/avatar`, null, {
    params: { avatarUrl }
  });
  return response.data.data;
};

// User Management
export const deleteUser = async (userId: string): Promise<void> => {
  await axiosInstance.delete(`/api/users/${userId}`);
};

export const activateUser = async (userId: string): Promise<void> => {
  await axiosInstance.patch(`/api/users/${userId}/activate`);
};

export const deactivateUser = async (userId: string): Promise<void> => {
  await axiosInstance.patch(`/api/users/${userId}/deactivate`);
};

export const banUser = async (userId: string, reason: string): Promise<void> => {
  await axiosInstance.patch(`/api/users/${userId}/ban`, null, {
    params: { reason }
  });
};

export const unbanUser = async (userId: string): Promise<void> => {
  await axiosInstance.patch(`/api/users/${userId}/unban`);
};

export const verifyUser = async (userId: string): Promise<void> => {
  await axiosInstance.patch(`/api/users/${userId}/verify`);
};

// Search & Filtering
export const searchUsers = async (keyword: string, page: number = 0, size: number = 10) => {
  const response = await axiosInstance.get('/api/users/search', {
    params: { keyword, page, size }
  });
  // Backend returns Page object with content array
  const pageData = response.data.data;
  return pageData?.content || [];
};

// Removed getUsersByType - userType field has been removed, use getUsersByRole instead

export const getUsersByRole = async (role: string, page: number = 0, size: number = 10) => {
  const response = await axiosInstance.get(`/api/users/role/${role}`, {
    params: { page, size }
  });
  return response.data.data;
};

export const getActiveUsers = async (page: number = 0, size: number = 10) => {
  const response = await axiosInstance.get('/api/users/active', {
    params: { page, size }
  });
  return response.data.data;
};

export const getBannedUsers = async (page: number = 0, size: number = 10) => {
  const response = await axiosInstance.get('/api/users/banned', {
    params: { page, size }
  });
  return response.data.data;
};

// Statistics
export const getUserManagementSummary = async (page: number = 0, size: number = 10): Promise<UserManagementSummary> => {
  const response = await axiosInstance.get('/api/users/management/summary', {
    params: { page, size }
  });
  return response.data.data;
};

export const getUserStatistics = async (userId: string): Promise<UserStatistics> => {
  const response = await axiosInstance.get(`/api/users/${userId}/statistics`);
  return response.data.data;
};

export const getTotalUsersCount = async (): Promise<number> => {
  const response = await axiosInstance.get('/api/users/statistics/total');
  return response.data.data;
};

// Verification
export const sendVerificationEmail = async (userId: string): Promise<void> => {
  await axiosInstance.post(`/api/users/${userId}/send-verification`);
};

export const verifyEmail = async (userId: string, token: string): Promise<void> => {
  await axiosInstance.post(`/api/users/${userId}/verify-email`, null, {
    params: { token }
  });
};

export const verifyPhone = async (userId: string, code: string): Promise<void> => {
  await axiosInstance.post(`/api/users/${userId}/verify-phone`, null, {
    params: { code }
  });
};

// Password Management
export const changePassword = async (userId: string, data: PasswordChangeRequest): Promise<void> => {
  await axiosInstance.post(`/api/users/${userId}/change-password`, null, {
    params: data
  });
};

export const resetPassword = async (data: PasswordResetRequest): Promise<void> => {
  await axiosInstance.post('/api/users/reset-password', null, {
    params: data
  });
};

export const confirmPasswordReset = async (data: PasswordResetConfirmRequest): Promise<void> => {
  await axiosInstance.post('/api/users/reset-password/confirm', null, {
    params: data
  });
};

// Social Features
export const followUser = async (followerId: string, followedId: string): Promise<void> => {
  await axiosInstance.post(`/api/users/${followerId}/follow/${followedId}`);
};

export const unfollowUser = async (followerId: string, followedId: string): Promise<void> => {
  await axiosInstance.delete(`/api/users/${followerId}/unfollow/${followedId}`);
};

export const getFollowersCount = async (userId: string): Promise<number> => {
  const response = await axiosInstance.get(`/api/users/${userId}/followers/count`);
  return response.data.data;
};

export const getFollowingCount = async (userId: string): Promise<number> => {
  const response = await axiosInstance.get(`/api/users/${userId}/following/count`);
  return response.data.data;
};

// Score Management
export const updateTrustScore = async (userId: string): Promise<void> => {
  await axiosInstance.patch(`/api/users/${userId}/update-trust-score`);
};

export const updateSustainabilityScore = async (userId: string): Promise<void> => {
  await axiosInstance.patch(`/api/users/${userId}/update-sustainability-score`);
};
