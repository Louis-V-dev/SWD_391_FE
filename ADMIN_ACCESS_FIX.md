# Admin Access Fix

## Problem

Users were unable to access the admin panel even when they had admin privileges. The console showed:
```
User role: USER (type string)
User type: CONSUMER
Has admin access: false
```

## Root Cause

The frontend was only checking the `role` field to determine admin access, but the backend uses **both** fields:

1. **`userType`** - User classification: `CONSUMER`, `COLLECTOR`, `BRAND`, `ADMIN`, `MODERATOR`
2. **`role`** - Permission level: `USER`, `PREMIUM`, `COLLECTOR`, `ADMIN`, `SUPER_ADMIN`, `STAFF`

A user could have admin privileges through either field, but the code was only checking `role`.

## Solution

### 1. Created Auth Utility Functions (`src/lib/auth-utils.ts`)

Created a centralized utility module with reusable functions:

- `hasAdminAccess(user)` - Checks if user has admin/moderator access
- `hasModeratorAccess(user)` - Checks for moderator permissions
- `isCollector(user)` - Checks if user is a collector
- `isBrand(user)` - Checks if user is a brand
- `hasPremiumAccess(user)` - Checks for premium features
- `getRoleDisplayName(user)` - Gets formatted role name
- `getUserTypeDisplayName(user)` - Gets formatted user type name

### 2. Updated Admin Access Logic

The `hasAdminAccess()` function now checks **both** fields:

```typescript
export function hasAdminAccess(user: User | null): boolean {
  if (!user) return false;

  const userRole = String(user.role || '').toUpperCase();
  const userType = String(user.userType || '').toUpperCase();

  return (
    // Check role field
    userRole === 'ADMIN' || 
    userRole === 'STAFF' || 
    userRole === 'SUPER_ADMIN' ||
    // Check userType field
    userType === 'ADMIN' || 
    userType === 'MODERATOR'
  );
}
```

### 3. Updated Components

**AdminLayout.tsx** (`src/components/layout/AdminLayout.tsx`):
- Imported `hasAdminAccess` utility
- Replaced inline admin check with utility function
- Now properly validates admin access using both fields

**Header.tsx** (`src/components/layout/Header.tsx`):
- Imported `hasAdminAccess` utility
- Simplified admin panel link visibility check
- Now shows admin panel link for users with proper permissions

### 4. Updated Type Definitions

**auth.ts** (`src/types/domains/auth.ts`):
- Added missing role types: `PREMIUM`, `COLLECTOR`, `SUPER_ADMIN`
- Now matches backend schema completely

## Admin Access Criteria

A user has admin access if they have **ANY** of the following:

### Via Role Field:
- `ADMIN`
- `STAFF`
- `SUPER_ADMIN`

### Via UserType Field:
- `ADMIN`
- `MODERATOR`

## Testing

To test admin access:

1. **Login as admin user** - Check console logs:
   ```
   User role: <role_value>
   User type: <userType_value>
   Has admin access: true
   ```

2. **Verify admin panel access**:
   - Admin panel link should appear in user menu
   - `/admin` route should be accessible
   - No "Access Denied" message

3. **Test different user types**:
   - Admin with `userType: ADMIN` ✅
   - Moderator with `userType: MODERATOR` ✅
   - Staff with `role: STAFF` ✅
   - Regular user with `role: USER` and `userType: CONSUMER` ❌

## Benefits

1. **Correct Authorization** - Properly checks both user classification fields
2. **Reusable Code** - Centralized auth utilities prevent duplication
3. **Maintainable** - Single source of truth for permission checks
4. **Type Safe** - Full TypeScript support with proper types
5. **Extensible** - Easy to add new permission checks in the future

## Files Changed

1. `src/lib/auth-utils.ts` - **NEW** - Auth utility functions
2. `src/components/layout/AdminLayout.tsx` - Updated admin access check
3. `src/components/layout/Header.tsx` - Updated admin link visibility
4. `src/types/domains/auth.ts` - Added missing role types

## Migration Notes

If you have custom admin checks elsewhere in the codebase:

**Before:**
```typescript
const isAdmin = String(user.role).toUpperCase() === 'ADMIN';
```

**After:**
```typescript
import { hasAdminAccess } from '@/lib/auth-utils';
const isAdmin = hasAdminAccess(user);
```

## Related Documentation

- Backend Schema: `group2/green-loop-be/src/main/resources/db/migration/V1__Create_Fashion_Recycling_Schema.sql`
- Backend ERD: `group2/green-loop-be/CONCEPTUAL_ERD.md`
- User Management: `group2/green-loop-be/USER_AND_POINT_MANAGEMENT_README.md`











