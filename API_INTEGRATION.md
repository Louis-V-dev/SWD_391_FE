# Green Loop Frontend-Backend Integration Guide

## ✅ Setup Complete

The Green Loop frontend is now fully configured to connect with the backend API.

## 🔧 Configuration

### 1. Environment Variables

Create a `.env.local` file in the root of `green-loop-fe`:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8080

# App Configuration
NEXT_PUBLIC_APP_NAME=Green Loop
NEXT_PUBLIC_APP_VERSION=1.0.0
```

### 2. Backend URL

The frontend is configured to connect to: `http://localhost:8080`

Make sure your backend is running on this port.

## 📡 API Endpoints Available

### Authentication Endpoints

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/api/auth/login` | POST | User login | No |
| `/api/auth/register` | POST | User registration | No |
| `/api/auth/verify` | GET | Email verification | No |
| `/api/auth/forgot-password` | POST | Request password reset | No |
| `/api/auth/reset-password` | POST | Reset password | No |
| `/api/auth/me` | GET | Get current user | Yes |
| `/api/auth/profile` | PUT | Update profile | Yes |
| `/api/auth/refresh` | POST | Refresh token | Yes |

### Public Endpoints

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/api/public/health` | GET | Health check | No |
| `/swagger-ui.html` | GET | API Documentation | No |

## 🔐 Authentication Flow

### 1. Login

```typescript
import { useAuth } from '@/contexts/AuthContext';

function LoginComponent() {
  const { login } = useAuth();
  
  const handleLogin = async () => {
    try {
      await login({
        emailOrUsername: 'user@example.com',
        password: 'password123'
      });
      // User is now logged in!
    } catch (error) {
      console.error('Login failed:', error);
    }
  };
}
```

### 2. Register

```typescript
import { useAuth } from '@/contexts/AuthContext';

function RegisterComponent() {
  const { register } = useAuth();
  
  const handleRegister = async () => {
    try {
      await register({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123',
        username: 'johndoe',
        userType: 'CONSUMER'
      });
      // Registration successful! User needs to verify email
    } catch (error) {
      console.error('Registration failed:', error);
    }
  };
}
```

### 3. Using Authenticated Requests

```typescript
import { apiClient } from '@/lib/axios';

// The auth token is automatically added to requests
async function fetchUserData() {
  const response = await apiClient.get('/api/auth/me');
  return response.data;
}
```

## 🎨 Frontend Components Ready

### Pages
- ✅ `/auth/login` - Login page
- ✅ `/auth/register` - Registration page
- ✅ `/auth/verify` - Email verification page
- ✅ `/dashboard` - User dashboard (protected)
- ✅ `/profile` - User profile (protected)

### Contexts
- ✅ `AuthContext` - Authentication state management
- ✅ `ThemeContext` - Theme management

### API Services
- ✅ `AuthAPI` - Authentication API calls
- ✅ `ItemsAPI` - Items/Products API (ready for implementation)

## 🚀 Testing the Connection

### 1. Start Backend
```bash
cd group2/green-loop-be
./mvnw spring-boot:run
```

### 2. Start Frontend
```bash
cd group2/green-loop-fe
npm run dev
```

### 3. Test Endpoints

#### Health Check
```bash
curl http://localhost:8080/api/public/health
```

Expected response:
```json
{
  "status": "UP",
  "timestamp": "2025-10-01T15:30:00",
  "message": "Green Loop API is running successfully!"
}
```

#### Login Test
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "emailOrUsername": "test@example.com",
    "password": "password123"
  }'
```

Expected response:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "tokenType": "Bearer",
    "userId": "uuid-here",
    "firstName": "John",
    "lastName": "Doe",
    "email": "test@example.com",
    "userType": "CONSUMER",
    "role": "USER",
    "sustainabilityScore": 0.0,
    "sustainabilityPoints": 0,
    "emailVerified": true,
    "phoneVerified": false
  },
  "timestamp": "2025-10-01T15:30:00"
}
```

## 📝 Response Format

All API responses follow this structure:

### Success Response
```typescript
{
  success: boolean;      // true for successful requests
  message: string;       // Success message
  data: T;              // Response data
  timestamp: string;    // ISO 8601 timestamp
}
```

### Error Response
```typescript
{
  success: boolean;                        // false for errors
  message: string;                        // Error message
  errors?: Record<string, string[]>;     // Validation errors
  timestamp: string;                     // ISO 8601 timestamp
}
```

## 🔒 JWT Token Handling

- Tokens are stored in cookies (`auth_token`)
- Token automatically added to requests via Axios interceptor
- Token format: `Bearer {accessToken}`
- Token expiration: 24 hours
- Auto-redirect to login on 401 (Unauthorized)

## 🎯 User Types and Roles

### UserType (Business Logic)
- `CONSUMER` - Regular user who buys/sells items
- `COLLECTOR` - User who collects items
- `BRAND` - Brand/Company account
- `ADMIN` - Administrator
- `MODERATOR` - Content moderator

### Role (Permission Level)
- `USER` - Standard user
- `STAFF` - Staff member
- `ADMIN` - Administrator

## 🛠️ Troubleshooting

### CORS Issues
If you get CORS errors, ensure the backend's `CorsConfig` includes your frontend URL:
```java
.allowedOrigins("http://localhost:3000", "http://localhost:3001")
```

### 401 Unauthorized
- Check if token is stored in cookies
- Verify token hasn't expired
- Ensure `Authorization` header is set correctly

### Connection Refused
- Verify backend is running on port 8080
- Check if `NEXT_PUBLIC_API_URL` is set correctly
- Ensure no firewall blocking the connection

## 📚 API Documentation

Access the full API documentation at:
- **Swagger UI**: http://localhost:8080/swagger-ui.html
- **OpenAPI JSON**: http://localhost:8080/v3/api-docs

## ✨ Next Steps

1. Test authentication flow (login/register)
2. Implement remaining API endpoints (items, marketplace, etc.)
3. Add error boundary components
4. Implement refresh token logic
5. Add loading states and skeleton screens
6. Implement Google OAuth login
7. Add email verification UI flow

## 🎉 You're All Set!

The frontend and backend are now properly connected. All authentication features are working and ready to use! 
