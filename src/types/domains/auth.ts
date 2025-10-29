// User Types - Updated to match backend
export enum Role {
  USER = 'USER',
  PREMIUM = 'PREMIUM',
  COLLECTOR = 'COLLECTOR',
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN',
  STAFF = 'STAFF'
}

export interface User {
  userId: string; // Changed from number to string (UUID)
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  role: Role;
  sustainabilityScore: number;
  sustainabilityPoints: number; // Added points field
  trustScore: number; // Added trust score
  createdAt: string;
  updatedAt: string;
  isVerified: boolean;
  isActive: boolean;
  avatarUrl?: string;
  emailVerified: boolean;
  phoneVerified: boolean; // Added phone verification
  isBanned: boolean; // Added banned status
  username?: string;
  bio?: string; // Added bio field
}

// Authentication Request Types
export interface LoginRequest {
  emailOrUsername: string; // Changed from usernameOrEmail to match backend
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  username?: string;
}

// Authentication Response Types
export interface LoginResponse {
  accessToken: string; // Backend uses 'accessToken', not 'token'
  tokenType: string;
  userId: string; // Changed from number to string (UUID)
  firstName: string;
  lastName: string;
  email: string;
  username?: string;
  role: Role;
  sustainabilityScore: number;
  sustainabilityPoints: number; // Added points field
  emailVerified: boolean;
  phoneVerified: boolean; // Added phone verification
}

export interface UserResponse {
  userId: string; // Changed from number to string (UUID)
  firstName: string;
  lastName: string;
  email: string;
  username?: string;
  role: Role;
  sustainabilityScore: number;
  sustainabilityPoints: number; // Added points field
  emailVerified: boolean;
  phoneVerified: boolean; // Added phone verification
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}
