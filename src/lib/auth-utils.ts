/**
 * Authentication and Authorization Utilities
 * 
 * This file contains utility functions for checking user permissions and access levels.
 */

import { User, Role } from '@/types';

/**
 * Check if a user has admin access based on their role
 * 
 * Admin access is granted if the user has:
 * Role: ADMIN, STAFF, or SUPER_ADMIN
 * 
 * @param user - The user object to check
 * @returns true if the user has admin access, false otherwise
 */
export function hasAdminAccess(user: User | null): boolean {
  if (!user) return false;

  const userRole = String(user.role || '').toUpperCase();

  return (
    userRole === 'ADMIN' || 
    userRole === 'STAFF' || 
    userRole === 'SUPER_ADMIN'
  );
}

/**
 * Check if a user has moderator access based on their role
 * 
 * @param user - The user object to check
 * @returns true if the user has moderator access, false otherwise
 */
export function hasModeratorAccess(user: User | null): boolean {
  if (!user) return false;

  const userRole = String(user.role || '').toUpperCase();

  return (
    userRole === 'ADMIN' || 
    userRole === 'STAFF' || 
    userRole === 'SUPER_ADMIN'
  );
}

/**
 * Check if a user is a collector based on their role
 * 
 * @param user - The user object to check
 * @returns true if the user is a collector, false otherwise
 */
export function isCollector(user: User | null): boolean {
  if (!user) return false;

  const userRole = String(user.role || '').toUpperCase();

  return userRole === 'COLLECTOR';
}

/**
 * Check if a user is a brand (deprecated - use role instead)
 * 
 * @param user - The user object to check
 * @returns false (brand functionality removed)
 */
export function isBrand(user: User | null): boolean {
  // Brand functionality has been removed
  return false;
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













