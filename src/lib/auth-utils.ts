/**
 * Authentication and Authorization Utilities
 * 
 * This file contains utility functions for checking user permissions and access levels.
 */

import { User, UserType, Role } from '@/types';

/**
 * Check if a user has admin access based on their role or userType
 * 
 * Admin access is granted if the user has:
 * 1. Role: ADMIN, STAFF, or SUPER_ADMIN
 * 2. UserType: ADMIN or MODERATOR
 * 
 * @param user - The user object to check
 * @returns true if the user has admin access, false otherwise
 */
export function hasAdminAccess(user: User | null): boolean {
  if (!user) return false;

  const userRole = String(user.role || '').toUpperCase();
  const userType = String(user.userType || '').toUpperCase();

  return (
    userRole === 'ADMIN' || 
    userRole === 'STAFF' || 
    userRole === 'SUPER_ADMIN' ||
    userType === 'ADMIN' || 
    userType === 'MODERATOR'
  );
}

/**
 * Check if a user has moderator access based on their role or userType
 * 
 * @param user - The user object to check
 * @returns true if the user has moderator access, false otherwise
 */
export function hasModeratorAccess(user: User | null): boolean {
  if (!user) return false;

  const userRole = String(user.role || '').toUpperCase();
  const userType = String(user.userType || '').toUpperCase();

  return (
    userRole === 'ADMIN' || 
    userRole === 'STAFF' || 
    userRole === 'SUPER_ADMIN' ||
    userType === 'ADMIN' || 
    userType === 'MODERATOR'
  );
}

/**
 * Check if a user is a collector based on their role or userType
 * 
 * @param user - The user object to check
 * @returns true if the user is a collector, false otherwise
 */
export function isCollector(user: User | null): boolean {
  if (!user) return false;

  const userRole = String(user.role || '').toUpperCase();
  const userType = String(user.userType || '').toUpperCase();

  return (
    userRole === 'COLLECTOR' ||
    userType === 'COLLECTOR'
  );
}

/**
 * Check if a user is a brand based on their userType
 * 
 * @param user - The user object to check
 * @returns true if the user is a brand, false otherwise
 */
export function isBrand(user: User | null): boolean {
  if (!user) return false;

  const userType = String(user.userType || '').toUpperCase();
  return userType === 'BRAND';
}

/**
 * Check if a user has premium access based on their role
 * 
 * @param user - The user object to check
 * @returns true if the user has premium access, false otherwise
 */
export function hasPremiumAccess(user: User | null): boolean {
  if (!user) return false;

  const userRole = String(user.role || '').toUpperCase();

  return (
    userRole === 'PREMIUM' ||
    userRole === 'ADMIN' || 
    userRole === 'SUPER_ADMIN'
  );
}

/**
 * Get the display name for a user's role
 * 
 * @param user - The user object
 * @returns The formatted role name
 */
export function getRoleDisplayName(user: User | null): string {
  if (!user) return 'Guest';

  const userRole = String(user.role || '').toUpperCase();
  
  switch (userRole) {
    case 'SUPER_ADMIN':
      return 'Super Admin';
    case 'ADMIN':
      return 'Admin';
    case 'STAFF':
      return 'Staff';
    case 'COLLECTOR':
      return 'Collector';
    case 'PREMIUM':
      return 'Premium';
    default:
      return 'User';
  }
}

/**
 * Get the display name for a user's type
 * 
 * @param user - The user object
 * @returns The formatted user type name
 */
export function getUserTypeDisplayName(user: User | null): string {
  if (!user) return 'Guest';

  const userType = String(user.userType || '').toUpperCase();
  
  switch (userType) {
    case 'ADMIN':
      return 'Admin';
    case 'MODERATOR':
      return 'Moderator';
    case 'BRAND':
      return 'Brand';
    case 'COLLECTOR':
      return 'Collector';
    case 'CONSUMER':
      return 'Consumer';
    default:
      return 'User';
  }
}











