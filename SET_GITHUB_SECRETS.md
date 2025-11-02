# 🔐 How to Set GitHub Secrets

## Problem
The deployed app is calling `localhost:8080` because GitHub Secrets are not set correctly, so the build uses fallback values.

## Solution: Set GitHub Secrets

### Step 1: Go to GitHub Repository Settings

1. Go to: `https://github.com/YOUR_USERNAME/YOUR_REPO`
2. Click **Settings** tab (at the top)
3. In the left sidebar, click **Secrets and variables** → **Actions**

### Step 2: Add These Secrets

Click **"New repository secret"** for each of these:

#### Required Secrets:

**1. NEXT_PUBLIC_API_URL**
```
Name: NEXT_PUBLIC_API_URL
Value: https://greenloop-heb0bffxh4h4e0hy.canadacentral-01.azurewebsites.net
```

**2. NEXT_PUBLIC_WS_URL**
```
Name: NEXT_PUBLIC_WS_URL
Value: wss://greenloop-heb0bffxh4h4e0hy.canadacentral-01.azurewebsites.net/api/ws
```

**3. NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME**
```
Name: NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
Value: dmpjc496u
```

**4. NEXT_PUBLIC_CLOUDINARY_API_KEY**
```
Name: NEXT_PUBLIC_CLOUDINARY_API_KEY
Value: 867162548936863
```

**5. NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET**
```
Name: NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
Value: ml_default
```

**6. NEXT_PUBLIC_GOOGLE_CLIENT_ID**
```
Name: NEXT_PUBLIC_GOOGLE_CLIENT_ID
Value: 1093884420538-ka17a3efctfkv117f1lqotu4uusgokn9.apps.googleusercontent.com
```

**7. CLOUDINARY_API_SECRET**
```
Name: CLOUDINARY_API_SECRET
Value: t_Wp6_Yoc8xLv0nXXfqO-gIVF8I
```

### Step 3: Verify Secrets Are Set

After adding all secrets, you should see them listed:
- NEXT_PUBLIC_API_URL
- NEXT_PUBLIC_WS_URL
- NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
- NEXT_PUBLIC_CLOUDINARY_API_KEY
- NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
- NEXT_PUBLIC_GOOGLE_CLIENT_ID
- CLOUDINARY_API_SECRET

(Plus any Azure deployment secrets you already have)

### Step 4: Trigger New Deployment

After setting secrets, commit and push to trigger a new build:

```bash
cd d:\text\ver2\group3\group2\green-loop-fe

git add .
git commit -m "Fix: Remove localhost fallback - force production URL"
git push origin develop
```

### Step 5: Verify the Build

1. Go to GitHub → Actions tab
2. Watch the workflow run
3. Click on "Build application" step
4. **Verify it now shows:**
   ```
   NEXT_PUBLIC_API_URL: https://greenloop-heb0bffxh4h4e0hy.canadacentral-01.azurewebsites.net
   ```

### Step 6: Verify Deployment

After deployment completes:
1. Visit: `https://greenloop-fe.azurewebsites.net/env-check`
2. Should show production backend URL
3. Hard refresh browser: Ctrl+Shift+R
4. Try Google login - should work now!

---

## ⚠️ IMPORTANT NOTES

### Why Azure Web App Settings Don't Work

Azure Web App environment variables are set AFTER the build completes. But Next.js bakes `NEXT_PUBLIC_*` variables into the JavaScript at BUILD time.

**Setting them in Azure does NOTHING for `NEXT_PUBLIC_*` variables!**

You MUST set them in GitHub Secrets so they're available DURING the build process.

### Double Check the Names

The secret names MUST match EXACTLY:
- ✅ `NEXT_PUBLIC_API_URL` 
- ❌ `NEXT_PUBLIC_API_BASE_URL` (wrong!)
- ❌ `API_URL` (wrong!)

### Verify in GitHub Actions Logs

Always check the build logs to see what values were used:
```
Actions → Latest run → Build application → Step output
```

Look for:
```
Environment variables that will be BAKED into the bundle:
  NEXT_PUBLIC_API_URL: https://greenloop-heb0bffxh4h4e0hy.canadacentral-01.azurewebsites.net
```

If it shows `***` or empty, the secret isn't set correctly.

---

## 🎯 Success Criteria

You'll know it's working when:

1. ✅ GitHub Actions build logs show production URL
2. ✅ `/env-check` page shows production URL
3. ✅ Browser console shows no localhost references
4. ✅ API calls go to production backend
5. ✅ Google login works
6. ✅ No CORS errors

---

## 🆘 Still Not Working?

If you've done all this and it still calls localhost:

1. **Clear browser cache completely** - This is the #1 cause
2. **Try incognito/private mode** - Tests with fresh cache
3. **Check console errors** - Look for clues
4. **Restart Azure Web App** - Sometimes needed
5. **Check this doc:** `DEPLOYMENT_ENV_TROUBLESHOOTING.md`

