import axiosInstance from '@/lib/axios';
import type { User, UserUpdateRequest, UserStatistics, UserManagementSummary, PasswordChangeRequest, PasswordResetRequest, PasswordResetConfirmRequest } from '@/types/domains/users';

// User Retrieval
export const getUserById = async (userId: string): Promise<User> => {
  const response = await axiosInstance.get(`/users/${userId}`);
  return response.data.data;
};

export const getUserByEmail = async (email: string): Promise<User> => {
  const response = await axiosInstance.get(`/users/email/${email}`);
  return response.data.data;
};

export const getUserByUsername = async (username: string): Promise<User> => {
  const response = await axiosInstance.get(`/users/username/${username}`);
  return response.data.data;
};

export const getAllUsers = async (page: number = 0, size: number = 10) => {
  const response = await axiosInstance.get('/users', {
    params: { page, size }
  });
  return response.data.data;
};

// User Update
export const updateUser = async (userId: string, data: UserUpdateRequest): Promise<User> => {
  const response = await axiosInstance.put(`/users/${userId}`, data);
  return response.data.data;
};

export const updateUserAvatar = async (userId: string, avatarUrl: string): Promise<User> => {
  const response = await axiosInstance.patch(`/users/${userId}/avatar`, null, {
    params: { avatarUrl }
  });
  return response.data.data;
};

// User Management
export const deleteUser = async (userId: string): Promise<void> => {
  await axiosInstance.delete(`/users/${userId}`);
};

export const activateUser = async (userId: string): Promise<void> => {
  await axiosInstance.patch(`/users/${userId}/activate`);
};

export const deactivateUser = async (userId: string): Promise<void> => {
  await axiosInstance.patch(`/users/${userId}/deactivate`);
};

export const banUser = async (userId: string, reason: string): Promise<void> => {
  await axiosInstance.patch(`/users/${userId}/ban`, null, {
    params: { reason }
  });
};

export const unbanUser = async (userId: string): Promise<void> => {
  await axiosInstance.patch(`/users/${userId}/unban`);
};

export const verifyUser = async (userId: string): Promise<void> => {
  await axiosInstance.patch(`/users/${userId}/verify`);
};

// Search & Filtering
export const searchUsers = async (keyword: string, page: number = 0, size: number = 10) => {
  const response = await axiosInstance.get('/users/search', {
    params: { keyword, page, size }
  });
  return response.data.data;
};

export const getUsersByType = async (userType: string, page: number = 0, size: number = 10) => {
  const response = await axiosInstance.get(`/users/type/${userType}`, {
    params: { page, size }
  });
  return response.data.data;
};

export const getUsersByRole = async (role: string, page: number = 0, size: number = 10) => {
  const response = await axiosInstance.get(`/users/role/${role}`, {
    params: { page, size }
  });
  return response.data.data;
};

export const getActiveUsers = async (page: number = 0, size: number = 10) => {
  const response = await axiosInstance.get('/users/active', {
    params: { page, size }
  });
  return response.data.data;
};

export const getBannedUsers = async (page: number = 0, size: number = 10) => {
  const response = await axiosInstance.get('/users/banned', {
    params: { page, size }
  });
  return response.data.data;
};

// Statistics
export const getUserManagementSummary = async (page: number = 0, size: number = 10): Promise<UserManagementSummary> => {
  const response = await axiosInstance.get('/users/management/summary', {
    params: { page, size }
  });
  return response.data.data;
};

export const getUserStatistics = async (userId: string): Promise<UserStatistics> => {
  const response = await axiosInstance.get(`/users/${userId}/statistics`);
  return response.data.data;
};

export const getTotalUsersCount = async (): Promise<number> => {
  const response = await axiosInstance.get('/users/statistics/total');
  return response.data.data;
};

// Verification
export const sendVerificationEmail = async (userId: string): Promise<void> => {
  await axiosInstance.post(`/users/${userId}/send-verification`);
};

export const verifyEmail = async (userId: string, token: string): Promise<void> => {
  await axiosInstance.post(`/users/${userId}/verify-email`, null, {
    params: { token }
  });
};

export const verifyPhone = async (userId: string, code: string): Promise<void> => {
  await axiosInstance.post(`/users/${userId}/verify-phone`, null, {
    params: { code }
  });
};

// Password Management
export const changePassword = async (userId: string, data: PasswordChangeRequest): Promise<void> => {
  await axiosInstance.post(`/users/${userId}/change-password`, null, {
    params: data
  });
};

export const resetPassword = async (data: PasswordResetRequest): Promise<void> => {
  await axiosInstance.post('/users/reset-password', null, {
    params: data
  });
};

export const confirmPasswordReset = async (data: PasswordResetConfirmRequest): Promise<void> => {
  await axiosInstance.post('/users/reset-password/confirm', null, {
    params: data
  });
};

// Social Features
export const followUser = async (followerId: string, followedId: string): Promise<void> => {
  await axiosInstance.post(`/users/${followerId}/follow/${followedId}`);
};

export const unfollowUser = async (followerId: string, followedId: string): Promise<void> => {
  await axiosInstance.delete(`/users/${followerId}/unfollow/${followedId}`);
};

export const getFollowersCount = async (userId: string): Promise<number> => {
  const response = await axiosInstance.get(`/users/${userId}/followers/count`);
  return response.data.data;
};

export const getFollowingCount = async (userId: string): Promise<number> => {
  const response = await axiosInstance.get(`/users/${userId}/following/count`);
  return response.data.data;
};

// Score Management
export const updateTrustScore = async (userId: string): Promise<void> => {
  await axiosInstance.patch(`/users/${userId}/update-trust-score`);
};

export const updateSustainabilityScore = async (userId: string): Promise<void> => {
  await axiosInstance.patch(`/users/${userId}/update-sustainability-score`);
};
