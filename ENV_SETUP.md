# 🔐 Environment Variables Setup

## Quick Start

### 1. Create your `.env.local` file:

```bash
# Copy this content into a new file called .env.local in the root of green-loop-fe

NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_WS_URL=http://localhost:8080/api/ws
```

### 2. For Production Deployment:

Set these in your deployment platform:

**Vercel:**
- Go to Project Settings > Environment Variables
- Add `NEXT_PUBLIC_API_URL` with your production backend URL

**Netlify:**
- Go to Site Settings > Build & Deploy > Environment
- Add `NEXT_PUBLIC_API_URL` with your production backend URL

**Docker:**
- Create `.env.production` file with your production values
- Pass via docker-compose.yml

---

## Environment Variable Reference

### Required

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:8080` (dev)<br>`https://api.yourapp.com` (prod) |

### Optional

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_WS_URL` | WebSocket URL (auto-derived if not set) | `http://localhost:8080/api/ws` (dev)<br>`https://api.yourapp.com/api/ws` (prod) |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Google OAuth Client ID | `your-client-id.apps.googleusercontent.com` |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Cloudinary Cloud Name | `your-cloud-name` |
| `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` | Cloudinary Upload Preset | `your-upload-preset` |

---

## Important Notes

⚠️ **Environment variables in Next.js are embedded at BUILD TIME**
- After changing environment variables, you must rebuild the application
- For deployment platforms, trigger a new deployment

✅ **Variables starting with `NEXT_PUBLIC_` are exposed to the browser**
- Never put secrets or API keys in `NEXT_PUBLIC_` variables
- These are safe for public URLs only

❌ **DO NOT commit `.env.local` to version control**
- It's already in `.gitignore`
- Only commit `.env.example` as a template

---

## Testing Your Configuration

1. Run the development server:
```bash
npm run dev
```

2. Visit: `http://localhost:3000/api-test`

3. Check that:
   - ✅ Backend URL is correct
   - ✅ API connection works
   - ✅ No localhost references in production

---

## Troubleshooting

### "API URL is not configured" error

**Cause:** `NEXT_PUBLIC_API_URL` is not set in production

**Solution:**
1. Set the environment variable in your deployment platform
2. Redeploy the application

### Still calling localhost in production

**Cause:** Environment variable not set at build time

**Solution:**
1. Verify the environment variable is set correctly
2. Trigger a new deployment (rebuild is required)
3. Clear browser cache

### CORS errors

**Cause:** Backend doesn't allow your frontend domain

**Solution:**
Update backend CORS configuration to include your production domain

---

## Example Files

### `.env.local` (Development)

```bash
# Local Development Configuration
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_WS_URL=http://localhost:8080/api/ws

# Optional: Add if using Google OAuth
# NEXT_PUBLIC_GOOGLE_CLIENT_ID=

# Optional: Add if using Cloudinary
# NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
# NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=
```

### `.env.production` (Production - for Docker)

```bash
# Production Configuration
NEXT_PUBLIC_API_URL=https://api.yourapp.com
NEXT_PUBLIC_WS_URL=https://api.yourapp.com/api/ws

# Add your production credentials
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-prod-client-id
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-prod-cloud
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your-prod-preset
```

---

## Need Help?

See the full [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed deployment instructions.

