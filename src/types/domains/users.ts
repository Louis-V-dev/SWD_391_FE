export interface User {
  userId: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY';
  role: 'USER' | 'ADMIN' | 'STAFF';
  avatarUrl?: string;
  bio?: string;
  sustainabilityPoints: number;
  sustainabilityScore: number;
  trustScore: number;
  isVerified: boolean;
  emailVerified: boolean;
  phoneVerified: boolean;
  isActive: boolean;
  isBanned: boolean;
  followersCount?: number;
  followingCount?: number;
  itemsCount?: number;
  listingsCount?: number;
  ordersCount?: number;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserUpdateRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  avatarUrl?: string;
  bio?: string;
}

export interface UserStatistics {
  userId: string;
  username: string;
  sustainabilityPoints: number;
  sustainabilityScore: number;
  trustScore: number;
  followersCount: number;
  followingCount: number;
  itemsCount: number;
  listingsCount: number;
  ordersCount: number;
  createdAt: string;
  lastLogin?: string;
}

export interface UserManagementSummary {
  users: {
    content: User[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
  };
  totalUsers: number;
  activeUsers: number;
  bannedUsers: number;
  verifiedUsers: number;
  usersByRole: Record<string, number>;
}

export interface PasswordChangeRequest {
  oldPassword: string;
  newPassword: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirmRequest {
  token: string;
  newPassword: string;
}



















