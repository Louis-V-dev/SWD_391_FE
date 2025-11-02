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

### Development Mode

1. Run the development server:
```bash
npm run dev
```

2. Visit: `http://localhost:3000/api-test`

3. Check that:
   - ✅ Backend URL is correct
   - ✅ API connection works

### Production Deployment

After deploying to Azure, verify the build was correct:

1. Visit: `https://greenloop-fe.azurewebsites.net/env-check`

2. Verify:
   - ✅ API URL shows production backend (no localhost)
   - ✅ All environment variables are correct
   - ✅ No error banners appear

### Quick Diagnosis (Before Deploying)

Run the diagnostic script:
```bash
bash diagnose-deployment.sh
```

This checks:
- No problematic .env files
- GitHub Secrets are accessible
- Build output doesn't contain localhost

---

## Troubleshooting

### 🚨 Deployed App Still Calls `localhost:8080`

This is the most common issue! Even with correct GitHub Secrets and Azure settings, the app calls localhost.

**Root Cause:** Next.js bakes `NEXT_PUBLIC_*` variables into JavaScript at BUILD time. If the build doesn't have correct env vars, localhost gets hardcoded in the bundle.

**Quick Fix:**
1. Verify GitHub Secrets are set (not Azure Web App settings - those don't affect build)
2. Commit and push to trigger new build:
   ```bash
   git commit --allow-empty -m "Force rebuild with correct env vars"
   git push origin develop
   ```
3. Wait for deployment (2-3 minutes)
4. Visit `/env-check` page to verify
5. Hard refresh browser (Ctrl+Shift+R)

**For detailed troubleshooting, see:** [`DEPLOYMENT_ENV_TROUBLESHOOTING.md`](./DEPLOYMENT_ENV_TROUBLESHOOTING.md)

### "API URL is not configured" error

**Cause:** `NEXT_PUBLIC_API_URL` is not set during build

**Solution:**
1. Set GitHub Secret (not just Azure config)
2. Trigger new deployment (rebuild required)

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

### 📚 Documentation

- **Deployment Issues:** [DEPLOYMENT_ENV_TROUBLESHOOTING.md](./DEPLOYMENT_ENV_TROUBLESHOOTING.md)
- **Full Deployment Guide:** [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

### 🔧 Diagnostic Tools

1. **Pre-Deployment Check:**
   ```bash
   bash diagnose-deployment.sh
   ```

2. **Post-Deployment Check:**
   Visit: `https://greenloop-fe.azurewebsites.net/env-check`

3. **Build-Time Verification:**
   Automatically runs via `npm run build` (checks env vars before building)

