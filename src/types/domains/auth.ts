// User Types - Updated to match backend
export enum UserType {
  CONSUMER = 'CONSUMER',
  COLLECTOR = 'COLLECTOR', 
  BRAND = 'BRAND',
  ADMIN = 'ADMIN',
  MODERATOR = 'MODERATOR'
}

export enum Role {
  USER = 'USER',
  ADMIN = 'ADMIN', 
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
  userType: UserType;
  role: Role; // Added role field
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
  userType?: UserType; // Added user type
}

// Authentication Response Types
export interface LoginResponse {
  token: string;
  tokenType: string;
  userId: string; // Changed from number to string (UUID)
  firstName: string;
  lastName: string;
  email: string;
  username?: string;
  userType: UserType;
  role: Role; // Added role field
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
  userType: UserType;
  role: Role; // Added role field
  sustainabilityScore: number;
  sustainabilityPoints: number; // Added points field
  emailVerified: boolean;
  phoneVerified: boolean; // Added phone verification
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}
