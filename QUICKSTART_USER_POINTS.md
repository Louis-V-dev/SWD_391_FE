# Quick Start Guide - User & Point Management

## 🚀 Getting Started

### 1. Install Dependencies (if needed)
```bash
cd group2/green-loop-fe
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```

### 3. Access the Features

**User Pages:**
- User Profile with Points: `http://localhost:3000/profile/points`
- Admin User Management: `http://localhost:3000/admin/user-management`

**API Endpoints (Backend should be running on port 8080):**
- Users: `http://localhost:8080/api/users`
- Points: `http://localhost:8080/api/points`
- Point Rules: `http://localhost:8080/api/point-rules`

---

## 📁 Key Files Created

### Types
```
src/types/domains/
├── users.ts          # User types & interfaces
└── points.ts         # Point types & interfaces
```

### API Services
```
src/api/
├── users.ts          # User API functions (30+ endpoints)
└── points.ts         # Points API functions (30+ endpoints)
```

### React Hooks
```
src/hooks/
├── useUsers.ts       # User management hooks
└── usePoints.ts      # Point management hooks
```

### Components
```
src/components/
├── users/
│   └── UserProfileCard.tsx
└── points/
    ├── PointsDashboard.tsx
    └── RedeemPointsModal.tsx
```

### Pages
```
src/app/
├── admin/
│   └── user-management/
│       └── page.tsx              # Admin user management
└── profile/
    └── points/
        └── page.tsx              # User points dashboard
```

---

## 🎯 Quick Usage Examples

### Display User Points
```tsx
import { PointsDashboard } from '@/components/points/PointsDashboard';

<PointsDashboard userId={user.userId} />
```

### Redeem Points
```tsx
import { usePointRedemption } from '@/hooks/usePoints';

const { redeem } = usePointRedemption(userId);

await redeem({
  userId,
  pointsToRedeem: 500,
  redemptionType: 'DISCOUNT',
  description: 'Order discount'
});
```

### Award Points (After Purchase)
```tsx
import { awardPurchasePoints } from '@/api/points';

await awardPurchasePoints(userId, orderId, 150.00);
```

### Get Point Summary
```tsx
import { usePointSummary } from '@/hooks/usePoints';

const { summary, loading } = usePointSummary(userId);
// summary.availablePoints
// summary.totalEarnedPoints
// summary.expiringPoints
```

### Admin: Ban a User
```tsx
import { useUserManagement } from '@/hooks/useUsers';

const { banUser } = useUserManagement();

await banUser(userId, 'Spam activities');
```

---

## 🔧 Available Hooks

### User Hooks
- `useUser(userId)` - Get & update user
- `useUserStatistics(userId)` - Get user stats
- `useUserManagement(page, size)` - Admin management
- `useSocialFeatures(userId)` - Follow/unfollow

### Point Hooks
- `usePointSummary(userId)` - Point summary
- `usePointTransactions(userId, page, size)` - Transactions
- `useRecentTransactions(userId, limit)` - Recent transactions
- `usePointStatistics(userId)` - Point statistics
- `usePointRedemption(userId)` - Redeem points
- `useExpiringPoints(userId, days)` - Expiring points
- `usePointEarningRules()` - Earning rules

---

## 🎨 UI Components

### PointsDashboard
Displays:
- Available points
- Total earned/spent
- Expiring points warning
- Points breakdown by category
- Recent transactions

### RedeemPointsModal
Features:
- Points input
- Redemption type selection (Discount/Voucher/Donation)
- Estimated value calculation
- Validation

### UserProfileCard
Shows:
- User avatar & info
- User type & role badges
- Contact information
- Trust & sustainability scores
- Social stats

---

## 🔐 Authentication

All API calls automatically include JWT token from `AuthContext`:

```tsx
import { useAuth } from '@/hooks/useAuth';

const { user, token } = useAuth();
```

---

## 📊 Data Flow

```
User Action
    ↓
Component
    ↓
Custom Hook
    ↓
API Function
    ↓
Axios Instance (with JWT)
    ↓
Backend API
    ↓
Response
    ↓
Update State
    ↓
Re-render Component
```

---

## 🎯 Point Earning Actions

Users earn points for:
- **Purchases**: 10 points per $1 spent
- **Collection/Recycling**: 50 points
- **Writing Reviews**: 20 points
- **Referrals**: 100 points
- **Sign up Bonus**: 50 points
- **Daily Login**: 5 points

Implement in your app:
```tsx
// After successful purchase
await awardPurchasePoints(userId, orderId, amount);

// After writing review
await awardReviewPoints(userId, itemId);

// After recycling items
await awardCollectionPoints(userId, collectionRequestId);

// After referring someone
await awardReferralPoints(userId, referredUserId);
```

---

## 🛠️ Admin Features

Access: `/admin/user-management`

Features:
- View all users with pagination
- Search users by name/email
- Filter by type/role/status
- Ban/unban users
- Activate/deactivate users
- Verify users
- View detailed user stats
- User type distribution charts

---

## 📱 Responsive Design

All components are fully responsive:
- Mobile: Stacked layout
- Tablet: 2-column grid
- Desktop: 4-column grid

---

## ⚡ Performance Tips

1. **Pagination**: Always use pagination for large datasets
   ```tsx
   const { transactions } = usePointTransactions(userId, page, 20);
   ```

2. **Loading States**: Show loaders for better UX
   ```tsx
   {loading ? <Loader /> : <Content />}
   ```

3. **Refetch on Actions**: Update data after mutations
   ```tsx
   const { refetch } = usePointSummary(userId);
   await redeemPoints(data);
   refetch(); // Update the dashboard
   ```

---

## 🐛 Troubleshooting

### Points not showing?
- Check backend is running on port 8080
- Verify user is authenticated
- Check browser console for API errors

### Admin page not accessible?
- Ensure user has ADMIN or STAFF role
- Check `AuthContext` for proper role

### API calls failing?
- Verify backend URL in `src/lib/axios.ts`
- Check JWT token in headers
- Ensure backend endpoints match

---

## 🔄 Real-time Updates

To implement real-time point updates:

```tsx
// Poll for updates every 30 seconds
useEffect(() => {
  const interval = setInterval(() => {
    refetch();
  }, 30000);
  
  return () => clearInterval(interval);
}, [refetch]);
```

Or use WebSockets (future enhancement).

---

## 📝 Type Safety

All components are fully typed with TypeScript:

```typescript
// User types
User, UserUpdateRequest, UserStatistics, UserManagementSummary

// Point types
PointTransaction, PointSummary, PointEarningRequest, PointRedemptionRequest

// Full autocomplete & type checking in IDE
```

---

## 🎉 Features Summary

✅ **30+ User API endpoints**
✅ **30+ Point API endpoints**
✅ **10+ Custom React hooks**
✅ **3 Reusable components**
✅ **2 Feature-complete pages**
✅ **Full TypeScript support**
✅ **Responsive design**
✅ **Admin management panel**
✅ **Point redemption system**
✅ **Transaction history**
✅ **Expiring points alerts**
✅ **User statistics**
✅ **Social features**

---

## 📚 Full Documentation

See `FRONTEND_USER_POINT_MANAGEMENT.md` for complete documentation.

---

**Ready to use! 🚀**









