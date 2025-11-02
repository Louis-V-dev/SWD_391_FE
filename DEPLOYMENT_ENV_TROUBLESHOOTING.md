# 🔧 Deployment Environment Variables Troubleshooting

## Problem: Deployed App Still Calls `localhost:8080`

Even though environment variables are correctly set in GitHub Secrets and Azure Web App Configuration, the deployed app is calling `localhost:8080` instead of the production backend URL.

---

## 🔍 Root Cause

**Next.js bakes `NEXT_PUBLIC_*` environment variables into the JavaScript bundle at BUILD time.**

If the build process doesn't have the correct environment variables available, those wrong values (like `localhost:8080`) get hardcoded into the compiled JavaScript files.

Setting environment variables AFTER the build has no effect on `NEXT_PUBLIC_*` variables.

---

## ✅ The Fix (Applied)

### 1. **Build-Time Environment Verification** ✅

Created `verify-env-build.js` that runs BEFORE every build to verify:
- All required environment variables are set
- No localhost references in production builds
- Correct values will be baked into the bundle

This is automatically run via the `prebuild` script in `package.json`.

### 2. **Clean Build Process** ✅

Updated GitHub Actions workflow to:
- Delete `.next` folder before building
- Clear Node.js cache
- Force a completely clean build every time

### 3. **Build Output Verification** ✅

Added a step in GitHub Actions that:
- Searches the built JavaScript bundle for `localhost:8080`
- Fails the build if localhost references are found
- Prevents deploying a misconfigured bundle

### 4. **Diagnostic Page** ✅

Created `/env-check` page that shows:
- What API URL is actually in the built bundle
- All environment variables baked into the JavaScript
- Clear error messages if localhost is detected in production

---

## 🚀 How to Deploy with Correct Environment Variables

### Step 1: Verify GitHub Secrets

Ensure these are set in your GitHub repository:

```
Settings → Secrets and variables → Actions → Repository secrets
```

Required secrets:
- `NEXT_PUBLIC_API_URL` = `https://greenloop-heb0bffxh4h4e0hy.canadacentral-01.azurewebsites.net`
- `NEXT_PUBLIC_WS_URL` = `wss://greenloop-heb0bffxh4h4e0hy.canadacentral-01.azurewebsites.net/api/ws`
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID`
- Other Cloudinary secrets

### Step 2: Trigger New Deployment

```bash
# Commit any changes (or make an empty commit)
git commit --allow-empty -m "Force rebuild with correct env vars"
git push origin develop
```

### Step 3: Monitor GitHub Actions

1. Go to your GitHub repository
2. Click "Actions" tab
3. Watch the workflow run

**Key things to check:**
- ✅ "Verify all required secrets are set" step passes
- ✅ "Build application" step shows correct URLs
- ✅ "Verify built bundle doesn't contain localhost" step passes

### Step 4: Verify Deployment

After deployment completes (wait 2-3 minutes):

1. Visit: `https://greenloop-fe.azurewebsites.net/env-check`
2. Check that `NEXT_PUBLIC_API_URL` shows your production backend URL
3. Verify no localhost references

---

## 🐛 Troubleshooting

### Issue: GitHub Actions Build Fails at "Verify environment variables"

**Cause:** GitHub Secrets not set or contain wrong values

**Fix:**
1. Go to GitHub Settings → Secrets and variables → Actions
2. Verify all `NEXT_PUBLIC_*` secrets are set
3. Ensure they contain production URLs (no localhost)

### Issue: GitHub Actions Build Fails at "Verify built bundle doesn't contain localhost"

**Cause:** Environment variables weren't available during build, or a `.env.local` file was committed

**Fix:**
1. Check the build logs - what values were used?
2. Ensure no `.env.local` file is in the repository
3. Verify GitHub Secrets are correctly named (exact match required)

### Issue: `/env-check` Page Shows Localhost in Production

**Cause:** The JavaScript bundle was built with localhost values

**Fix:**
1. Check GitHub Actions logs for the most recent deployment
2. Look for the "Build application" step - verify it shows production URLs
3. If it shows localhost, GitHub Secrets are not configured correctly
4. Trigger a new deployment after fixing secrets

### Issue: Browser Still Shows Old Version

**Cause:** Browser cache

**Fix:**
1. Hard refresh: `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)
2. Clear browser cache completely
3. Try incognito/private browsing mode
4. Try a different browser

### Issue: Deployment Succeeds But App Won't Start

**Cause:** Various Azure Web App issues

**Fix:**
1. Check Azure Web App logs:
   ```bash
   az webapp log tail --name greenloop-fe --resource-group <your-resource-group>
   ```
2. Restart the Web App:
   ```bash
   az webapp restart --name greenloop-fe --resource-group <your-resource-group>
   ```
3. Verify the `startup command` is set correctly in Azure (should be empty for standalone Next.js)

---

## 📋 Verification Checklist

Before considering the issue fixed, verify:

- [ ] GitHub Secrets are set correctly (no localhost)
- [ ] GitHub Actions build passes all steps
- [ ] Build logs show production URLs being used
- [ ] Bundle verification step passes (no localhost in built files)
- [ ] `/env-check` page shows production URLs
- [ ] Main application can make API calls to production backend
- [ ] No console errors about CORS or network failures

---

## 🔬 Advanced Debugging

### Check What's Actually in the Built Bundle

```bash
# Locally (after building)
grep -r "localhost:8080" .next/static

# Should return nothing if correctly built
```

### Verify Azure Web App Environment Variables

```bash
az webapp config appsettings list \
  --name greenloop-fe \
  --resource-group <your-resource-group>
```

**Note:** These Azure Web App settings do NOT affect `NEXT_PUBLIC_*` variables after the build. They're only useful for server-side environment variables.

### Test Build Locally with Production Env Vars

```bash
# Set environment variables
export NEXT_PUBLIC_API_URL=https://greenloop-heb0bffxh4h4e0hy.canadacentral-01.azurewebsites.net
export NEXT_PUBLIC_WS_URL=wss://greenloop-heb0bffxh4h4e0hy.canadacentral-01.azurewebsites.net/api/ws
export NODE_ENV=production

# Clean and build
rm -rf .next
npm run build

# Start production server
npm start

# Visit http://localhost:3000/env-check
# Should show production URLs even though running locally
```

---

## 📚 Understanding Next.js Environment Variables

### Build-Time vs Runtime

| Variable Type | When It's Set | Can Change After Build |
|---------------|---------------|------------------------|
| `NEXT_PUBLIC_*` | **Build time** | ❌ No - baked into JavaScript |
| Regular env vars | Runtime (server-side only) | ✅ Yes - can change at runtime |

### The Golden Rule

> **If it starts with `NEXT_PUBLIC_`, it must be correct at BUILD time.**

No amount of Azure Web App configuration changes will fix a bundle that was built with wrong values.

---

## 🆘 Still Having Issues?

1. **Check the `/env-check` page** - This shows exactly what's in your bundle
2. **Review GitHub Actions logs** - Build logs show what values were used
3. **Clear everything and rebuild**:
   ```bash
   # Delete local build
   rm -rf .next
   
   # Commit changes
   git commit --allow-empty -m "Force clean rebuild"
   git push origin develop
   
   # Wait for deployment
   # Hard refresh browser after deployment
   ```

---

## ✅ Success Criteria

You'll know it's fixed when:

1. ✅ GitHub Actions build completes successfully
2. ✅ `/env-check` shows production URLs (no localhost)
3. ✅ Main application can communicate with backend
4. ✅ No CORS errors in browser console
5. ✅ API calls go to `greenloop-heb0bffxh4h4e0hy.canadacentral-01.azurewebsites.net`

---

## 📝 Prevention

To prevent this issue in the future:

1. ✅ **Never commit `.env.local` files** (already in `.gitignore`)
2. ✅ **Always set GitHub Secrets before building** (verified in workflow)
3. ✅ **Use the `/env-check` page** after every deployment
4. ✅ **Monitor GitHub Actions logs** for build-time environment values
5. ✅ **The workflow now automatically verifies** everything


