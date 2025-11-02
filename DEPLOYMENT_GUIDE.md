# 🚀 Green Loop Frontend - Deployment Guide

## ⚠️ Critical: Environment Variables Setup

**IMPORTANT:** Before deploying, you **MUST** configure the `NEXT_PUBLIC_API_URL` environment variable to point to your production backend API. Without this, the app will fail in production.

## 📋 Environment Variables

### Required Variables

```bash
# Backend API URL (REQUIRED for production)
NEXT_PUBLIC_API_URL=https://your-backend-api.com

# WebSocket URL (Optional - auto-derived from API_URL if not set)
NEXT_PUBLIC_WS_URL=https://your-backend-api.com/api/ws
```

### Optional Variables

```bash
# Google OAuth (if using Google login)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id

# Cloudinary (if using image uploads)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your-upload-preset
```

---

## 🔧 Local Development Setup

### 1. Create Environment File

```bash
# Copy the example file
cp .env.example .env.local

# Edit .env.local with your local backend URL
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_WS_URL=http://localhost:8080/api/ws
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Run Development Server

```bash
npm run dev
```

Your app should now be running at `http://localhost:3000`

---

## 📦 Deployment to Vercel

### Step 1: Push Code to Git

```bash
git add .
git commit -m "Configure environment variables for deployment"
git push origin main
```

### Step 2: Import Project to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click **"Add New Project"**
3. Import your Git repository
4. Select the `green-loop-fe` folder as the root directory

### Step 3: Configure Environment Variables

In Vercel Project Settings:

1. Go to **Settings > Environment Variables**
2. Add the following variables:

| Name | Value | Environment |
|------|-------|-------------|
| `NEXT_PUBLIC_API_URL` | `https://your-backend-api.com` | Production, Preview, Development |
| `NEXT_PUBLIC_WS_URL` | `https://your-backend-api.com/api/ws` | Production, Preview, Development |

### Step 4: Deploy

1. Click **"Deploy"**
2. Wait for build to complete
3. Your app will be live at `https://your-app.vercel.app`

### Important Notes for Vercel:

- ✅ Environment variables are set at **build time**
- ✅ Redeploy after changing environment variables
- ✅ Use separate values for Production, Preview, and Development environments

---

## 📦 Deployment to Netlify

### Step 1: Push Code to Git

```bash
git add .
git commit -m "Configure environment variables for deployment"
git push origin main
```

### Step 2: Import Project to Netlify

1. Go to [netlify.com](https://netlify.com)
2. Click **"Add new site"** > **"Import an existing project"**
3. Connect your Git repository
4. Select the `green-loop-fe` folder

### Step 3: Configure Build Settings

- **Base directory:** `green-loop-fe` (if in monorepo)
- **Build command:** `npm run build`
- **Publish directory:** `.next`

### Step 4: Configure Environment Variables

In Netlify Site Settings:

1. Go to **Site settings > Build & deploy > Environment**
2. Add the following variables:

```bash
NEXT_PUBLIC_API_URL=https://your-backend-api.com
NEXT_PUBLIC_WS_URL=https://your-backend-api.com/api/ws
```

### Step 5: Deploy

1. Click **"Deploy site"**
2. Wait for build to complete
3. Your app will be live at `https://your-app.netlify.app`

---

## 🐳 Deployment with Docker

### Step 1: Create `.env.production` File

```bash
# .env.production
NEXT_PUBLIC_API_URL=https://your-backend-api.com
NEXT_PUBLIC_WS_URL=https://your-backend-api.com/api/ws
```

### Step 2: Create Dockerfile

```dockerfile
# Dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Build the application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set environment variables (can be overridden at runtime)
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_WS_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_WS_URL=$NEXT_PUBLIC_WS_URL

RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

### Step 3: Create docker-compose.yml

```yaml
version: '3.8'

services:
  frontend:
    build:
      context: .
      args:
        NEXT_PUBLIC_API_URL: ${NEXT_PUBLIC_API_URL}
        NEXT_PUBLIC_WS_URL: ${NEXT_PUBLIC_WS_URL}
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
      - NEXT_PUBLIC_WS_URL=${NEXT_PUBLIC_WS_URL}
    env_file:
      - .env.production
```

### Step 4: Build and Run

```bash
# Build the image
docker-compose build

# Run the container
docker-compose up -d
```

---

## ✅ Verify Deployment

### 1. Check Configuration

Visit your deployed app and open the browser console:

```javascript
// You should NOT see "localhost" in production
// Check the API configuration
```

### 2. Test API Connection

Navigate to `/api-test` on your deployed app to verify:

- ✅ Backend URL is correct
- ✅ API endpoints are accessible
- ✅ WebSocket connection works

### 3. Monitor for Errors

Check for these common issues:

❌ **"API URL is not configured"** → Set `NEXT_PUBLIC_API_URL` in deployment platform

❌ **"Failed to fetch"** → Check CORS settings on backend

❌ **Calling localhost:8080** → Rebuild after setting environment variables

---

## 🔍 Troubleshooting

### Issue: Still calling localhost after deployment

**Solution:**
1. Verify environment variables are set correctly
2. **Redeploy** the application (environment variables are set at build time)
3. Clear browser cache and test again

### Issue: CORS errors in production

**Solution:**
Update your backend CORS configuration to allow your frontend domain:

```java
// Backend CORS configuration
.allowedOrigins(
    "http://localhost:3000",  // Development
    "https://your-app.vercel.app",  // Production
    "https://your-app.netlify.app"  // Production
)
```

### Issue: WebSocket connection fails

**Solution:**
1. Ensure `NEXT_PUBLIC_WS_URL` is set correctly
2. Check if your backend supports WebSocket on the production URL
3. Verify SSL/TLS certificates are valid (use `wss://` for HTTPS sites)

### Issue: Environment variables not updating

**Solution:**
1. Clear Next.js cache: `rm -rf .next`
2. Rebuild: `npm run build`
3. For deployment platforms: Trigger a new deployment after changing variables

---

## 📚 Additional Resources

- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [Vercel Deployment](https://vercel.com/docs)
- [Netlify Deployment](https://docs.netlify.com/)
- [Docker Deployment](https://docs.docker.com/)

---

## 🎯 Quick Checklist

Before deploying to production:

- [ ] Set `NEXT_PUBLIC_API_URL` environment variable
- [ ] Set `NEXT_PUBLIC_WS_URL` environment variable (optional)
- [ ] Update backend CORS to allow frontend domain
- [ ] Test API connection on `/api-test` page
- [ ] Verify no console errors in browser
- [ ] Test user login/registration flow
- [ ] Test WebSocket features (chat, video calls)
- [ ] Check that NO requests go to localhost

---

## 💡 Need Help?

If you encounter issues:

1. Check the browser console for errors
2. Visit `/api-test` to diagnose API connection
3. Verify environment variables in deployment platform
4. Check backend server logs
5. Ensure backend is accessible from the internet

**Remember:** Next.js environment variables starting with `NEXT_PUBLIC_` are embedded at **build time**, so you must redeploy after changing them!

