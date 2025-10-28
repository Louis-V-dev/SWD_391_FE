# Frontend User & Point Management System

## Overview

This document describes the frontend implementation of the comprehensive user management and point management system for the Green Loop circular fashion platform built with Next.js 15 and TypeScript.

## Table of Contents

1. [Architecture](#architecture)
2. [API Integration](#api-integration)
3. [Components](#components)
4. [Pages](#pages)
5. [Hooks](#hooks)
6. [Usage Examples](#usage-examples)
7. [Features](#features)

---

## Architecture

### Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **State Management**: React Hooks
- **Icons**: Lucide React
- **Form Handling**: React Hook Form (existing)

### Directory Structure

```
src/
├── api/
│   ├── users.ts           # User management API calls
│   └── points.ts          # Point management API calls
├── types/
│   └── domains/
│       ├── users.ts       # User-related TypeScript types
│       └── points.ts      # Point-related TypeScript types
├── hooks/
│   ├── useUsers.ts        # Custom hooks for user management
│   └── usePoints.ts       # Custom hooks for point operations
├── components/
│   ├── users/
│   │   └── UserProfileCard.tsx
│   └── points/
│       ├── PointsDashboard.tsx
│       └── RedeemPointsModal.tsx
└── app/
    ├── admin/
    │   └── user-management/
    │       └── page.tsx
    └── profile/
        └── points/
            └── page.tsx
```

---

## API Integration

### User API (`src/api/users.ts`)

Provides functions for all user management operations:

**User Retrieval**
- `getUserById(userId)` - Get user by ID
- `getUserByEmail(email)` - Get user by email
- `getUserByUsername(username)` - Get user by username
- `getAllUsers(page, size)` - Get paginated users

**User Management**
- `updateUser(userId, data)` - Update user profile
- `updateUserAvatar(userId, avatarUrl)` - Update avatar
- `deleteUser(userId)` - Delete user account
- `activateUser(userId)` - Activate user
- `deactivateUser(userId)` - Deactivate user
- `banUser(userId, reason)` - Ban user
- `unbanUser(userId)` - Unban user
- `verifyUser(userId)` - Verify user account

**Search & Filtering**
- `searchUsers(keyword, page, size)` - Search users
- `getUsersByType(userType, page, size)` - Filter by type
- `getUsersByRole(role, page, size)` - Filter by role
- `getActiveUsers(page, size)` - Get active users
- `getBannedUsers(page, size)` - Get banned users

**Statistics**
- `getUserManagementSummary(page, size)` - Get management summary
- `getUserStatistics(userId)` - Get user statistics
- `getTotalUsersCount()` - Get total users count

**Social Features**
- `followUser(followerId, followedId)` - Follow user
- `unfollowUser(followerId, followedId)` - Unfollow user
- `getFollowersCount(userId)` - Get followers count
- `getFollowingCount(userId)` - Get following count

### Points API (`src/api/points.ts`)

Provides functions for point management:

**Transactions**
- `earnPoints(data)` - Award points
- `redeemPoints(data)` - Redeem points
- `adjustPoints(userId, points, reason)` - Manual adjustment

**Queries**
- `getPointSummary(userId)` - Get point summary
- `getUserTransactions(userId, page, size)` - Get transactions
- `getRecentTransactions(userId, limit)` - Get recent transactions
- `getTransactionsByType(userId, type, page, size)` - Filter by type
- `getTransactionsByDateRange(userId, start, end, page, size)` - Filter by date

**Calculations**
- `getAvailablePoints(userId)` - Get available points
- `getTotalEarnedPoints(userId)` - Get total earned
- `getTotalSpentPoints(userId)` - Get total spent
- `getExpiringPoints(userId, days)` - Get expiring points

**Point Awards**
- `awardPurchasePoints(userId, orderId, amount)` - Award purchase points
- `awardCollectionPoints(userId, collectionId)` - Award collection points
- `awardReviewPoints(userId, itemId)` - Award review points
- `awardReferralPoints(userId, referredId)` - Award referral points

**Rules Management**
- `getAllRules()` - Get all earning rules
- `getActiveRule()` - Get active rule
- `createRule(rule)` - Create new rule
- `updateRule(ruleId, rule)` - Update rule
- `activateRule(ruleId)` - Activate rule

---

## Components

### 1. PointsDashboard

**Location**: `src/components/points/PointsDashboard.tsx`

Displays a comprehensive points overview with:
- Available points card
- Total earned/spent cards
- Expiring points warning
- Points breakdown by category
- Recent transactions list

**Props**:
```typescript
interface PointsDashboardProps {
  userId: string;
}
```

**Usage**:
```tsx
<PointsDashboard userId={user.userId} />
```

### 2. RedeemPointsModal

**Location**: `src/components/points/RedeemPointsModal.tsx`

Modal for redeeming points with:
- Available points display
- Redemption type selection (Discount, Voucher, Donation)
- Points input with validation
- Estimated value calculation

**Props**:
```typescript
interface RedeemPointsModalProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}
```

**Usage**:
```tsx
<RedeemPointsModal
  userId={user.userId}
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  onSuccess={() => refetch()}
/>
```

### 3. UserProfileCard

**Location**: `src/components/users/UserProfileCard.tsx`

Displays comprehensive user information:
- Avatar and name
- User type and role badges
- Contact information
- Trust and sustainability scores
- Social stats (followers, listings, orders)

**Props**:
```typescript
interface UserProfileCardProps {
  user: User;
  showStats?: boolean;
}
```

---

## Pages

### 1. User Management Page (Admin)

**Location**: `src/app/admin/user-management/page.tsx`

Features:
- User statistics dashboard
- User type distribution
- Searchable user table
- Inline user actions (ban, verify, activate)
- Pagination

**Access**: Admin/Staff only

### 2. User Points Page

**Location**: `src/app/profile/points/page.tsx`

Features:
- Points dashboard
- Expiring points alerts
- Transaction history with pagination
- Point redemption
- Notification system

**Access**: All authenticated users

---

## Hooks

### User Hooks (`src/hooks/useUsers.ts`)

#### `useUser(userId)`
Manage individual user data.

```typescript
const { user, loading, error, update, updateAvatar, refetch } = useUser(userId);
```

#### `useUserStatistics(userId)`
Get user statistics.

```typescript
const { statistics, loading, error, refetch } = useUserStatistics(userId);
```

#### `useUserManagement(page, size)`
Admin user management.

```typescript
const { 
  summary, 
  loading, 
  banUser, 
  unbanUser, 
  activateUser,
  deactivateUser,
  verifyUser,
  refetch 
} = useUserManagement(page, size);
```

#### `useSocialFeatures(userId)`
Social features (follow/unfollow).

```typescript
const { 
  followersCount, 
  followingCount, 
  followUser, 
  unfollowUser, 
  refetch 
} = useSocialFeatures(userId);
```

### Point Hooks (`src/hooks/usePoints.ts`)

#### `usePointSummary(userId)`
Get point summary.

```typescript
const { summary, loading, error, refetch } = usePointSummary(userId);
```

#### `usePointTransactions(userId, page, size)`
Get paginated transactions.

```typescript
const { transactions, loading, error, refetch } = usePointTransactions(userId, page, size);
```

#### `useRecentTransactions(userId, limit)`
Get recent transactions.

```typescript
const { transactions, loading, error, refetch } = useRecentTransactions(userId, 10);
```

#### `usePointStatistics(userId)`
Get point statistics.

```typescript
const { statistics, loading, error, refetch } = usePointStatistics(userId);
```

#### `usePointRedemption(userId)`
Redeem points.

```typescript
const { redeem, canRedeem, hasEnough, loading, error } = usePointRedemption(userId);
```

#### `useExpiringPoints(userId, days)`
Get expiring points.

```typescript
const { expiringPoints, loading, notify, refetch } = useExpiringPoints(userId, 7);
```

#### `usePointEarningRules()`
Manage earning rules.

```typescript
const { rules, activeRule, loading, activateRule, refetch } = usePointEarningRules();
```

---

## Usage Examples

### 1. Display User Points Dashboard

```tsx
'use client';

import { useAuth } from '@/hooks/useAuth';
import { PointsDashboard } from '@/components/points/PointsDashboard';

export default function MyPointsPage() {
  const { user } = useAuth();
  
  if (!user) return <div>Please login</div>;
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">My Points</h1>
      <PointsDashboard userId={user.userId} />
    </div>
  );
}
```

### 2. Redeem Points

```tsx
import { useState } from 'react';
import { usePointRedemption } from '@/hooks/usePoints';
import { Button } from '@/components/ui/Button';

function RedeemButton({ userId }: { userId: string }) {
  const { redeem, loading } = usePointRedemption(userId);
  
  const handleRedeem = async () => {
    try {
      await redeem({
        userId,
        pointsToRedeem: 500,
        redemptionType: 'DISCOUNT',
        description: 'Order discount'
      });
      alert('Points redeemed successfully!');
    } catch (error) {
      alert('Failed to redeem points');
    }
  };
  
  return (
    <Button onClick={handleRedeem} disabled={loading}>
      {loading ? 'Redeeming...' : 'Redeem 500 Points'}
    </Button>
  );
}
```

### 3. Award Points After Purchase

```tsx
import { awardPurchasePoints } from '@/api/points';

async function handlePurchaseComplete(userId: string, orderId: string, amount: number) {
  try {
    const transaction = await awardPurchasePoints(userId, orderId, amount);
    console.log('Points awarded:', transaction);
    // Show notification to user
  } catch (error) {
    console.error('Failed to award points:', error);
  }
}
```

### 4. Admin User Management

```tsx
import { useUserManagement } from '@/hooks/useUsers';

function AdminPanel() {
  const { summary, banUser, loading } = useUserManagement(0, 20);
  
  const handleBanUser = async (userId: string) => {
    try {
      await banUser(userId, 'Spam activities');
      alert('User banned successfully');
    } catch (error) {
      alert('Failed to ban user');
    }
  };
  
  // Render user table with ban action...
}
```

### 5. Check Point Balance Before Action

```tsx
import { hasEnoughPoints } from '@/api/points';

async function attemptPremiumFeature(userId: string) {
  const requiredPoints = 1000;
  
  const hasPoints = await hasEnoughPoints(userId, requiredPoints);
  
  if (!hasPoints) {
    alert(`You need ${requiredPoints} points for this feature`);
    return;
  }
  
  // Proceed with feature...
}
```

---

## Features

### ✅ Implemented Features

**User Management**
- ✅ User profile viewing and editing
- ✅ User search and filtering
- ✅ User activation/deactivation
- ✅ User verification
- ✅ User banning/unbanning
- ✅ Social features (follow/unfollow)
- ✅ User statistics dashboard

**Point Management**
- ✅ Points dashboard
- ✅ Point earning tracking
- ✅ Point redemption
- ✅ Transaction history
- ✅ Expiring points alerts
- ✅ Point statistics
- ✅ Admin point adjustment

**UI/UX**
- ✅ Responsive design
- ✅ Loading states
- ✅ Error handling
- ✅ Pagination
- ✅ Search functionality
- ✅ Badge system for status
- ✅ Modal dialogs

### 🎨 Styling

Uses Tailwind CSS with:
- Green color scheme for primary actions
- Responsive grid layouts
- Card-based design
- Hover effects
- Loading spinners
- Status badges

---

## Best Practices

1. **Type Safety**: All API calls and components are fully typed with TypeScript

2. **Error Handling**: Comprehensive error handling with user-friendly messages

3. **Loading States**: All async operations show loading indicators

4. **Reusability**: Components and hooks are designed for maximum reusability

5. **Performance**: Uses pagination for large data sets

6. **Security**: Admin routes protected by role-based access control

7. **Accessibility**: Proper semantic HTML and ARIA labels

---

## Integration with Backend

All frontend components integrate seamlessly with the backend APIs:

- Base URL configured in `src/lib/axios.ts`
- JWT authentication via `AuthContext`
- Automatic token injection in headers
- Error interception and handling

---

## Future Enhancements

Planned features:
- Real-time point updates via WebSockets
- Advanced filtering and sorting
- Export transaction history
- Point transfer between users
- Gamification badges
- Achievement system
- Leaderboards
- Mobile app integration

---

## Support

For issues or questions:
1. Check the API documentation
2. Review component prop types
3. Test with the backend running
4. Contact the development team

---

**Last Updated**: 2024
**Version**: 1.0.0
**Framework**: Next.js 15
**Maintained By**: Green Loop Frontend Team



















