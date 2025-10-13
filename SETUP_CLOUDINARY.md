# 🖼️ Cloudinary Setup for Frontend Image Uploads

## Quick Setup (5 minutes)

### Step 1: Create `.env.local` File

Create a file named `.env.local` in the frontend root directory:

**Windows PowerShell:**
```powershell
cd D:\text\ver2\group3\group2\green-loop-fe
New-Item -Path .env.local -ItemType File
```

**Or manually:** Right-click in VS Code explorer → New File → `.env.local`

---

### Step 2: Add Configuration

Copy and paste this into `.env.local`:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8080

# Cloudinary Configuration (from backend)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dmpjc496u
NEXT_PUBLIC_CLOUDINARY_API_KEY=867162548936863
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=ml_default
```

---

### Step 3: Create Upload Preset in Cloudinary (IMPORTANT!)

The `ml_default` preset might not exist. Here's how to create/verify it:

1. **Login to Cloudinary:** https://cloudinary.com/console
   - Email: (use the account that owns `dmpjc496u`)

2. **Go to Settings:**
   - Click the gear icon (⚙️) top right
   - Click "Upload" tab in left sidebar

3. **Create Upload Preset:**
   - Scroll down to "Upload presets" section
   - Look for `ml_default` - if it exists and is "Unsigned", you're good!
   - If not, click **"Add upload preset"**

4. **Configure Preset:**
   - **Preset name:** `ml_default`
   - **Signing Mode:** **Unsigned** ⚠️ (CRITICAL for frontend uploads!)
   - **Folder:** `green-loop/items` (optional, organizes uploads)
   - **Allowed formats:** `jpg, jpeg, png, webp`
   - **Max file size:** `10 MB`
   - **Transformation:** (optional)
     - Quality: `auto:good`
     - Format: `auto`

5. **Click "Save"**

---

### Step 4: Restart Frontend Dev Server

```bash
# Stop the current dev server (Ctrl+C)
npm run dev
```

**The environment variables will be loaded on restart!**

---

## ✅ How to Verify It's Working

### Test 1: Check Environment Variables
Add this to any React component temporarily:
```tsx
console.log('Cloud Name:', process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME);
console.log('Upload Preset:', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);
```

You should see:
```
Cloud Name: dmpjc496u
Upload Preset: ml_default
```

### Test 2: Try Image Upload
1. Go to `/item/create` (user page)
2. Drag & drop an image or click to upload
3. Watch the console - you should see upload progress
4. Image should appear in preview

---

## 🎯 Two Upload Methods Available:

### Method 1: Frontend Direct Upload (User Pages)
**Route:** `/item/create`
- Uses: Cloudinary frontend SDK
- Requires: `.env.local` setup + upload preset
- User uploads directly to Cloudinary
- Faster (no backend hop)

### Method 2: Backend Upload (Admin Pages) ✅
**Route:** `/admin/items/create`
- Uses: Backend Cloudinary service
- Requires: Nothing! Already configured
- Images go through backend API
- More secure (API secret stays on server)
- **Already working!**

---

## 🔧 Troubleshooting

### Issue: "Upload failed" error

**Cause 1:** Missing `.env.local` file
- **Solution:** Create the file as shown in Step 2

**Cause 2:** Upload preset doesn't exist
- **Solution:** Create unsigned upload preset in Cloudinary (Step 3)

**Cause 3:** Upload preset is "Signed" mode
- **Solution:** Change to "Unsigned" mode in Cloudinary settings

**Cause 4:** Environment variables not loaded
- **Solution:** Restart dev server (`npm run dev`)

### Issue: Variables undefined in code

**Check:**
```tsx
// In any component
useEffect(() => {
  console.log('Env vars:', {
    cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    preset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
  });
}, []);
```

If undefined → .env.local not created or dev server not restarted

---

## 📝 Quick Reference

### Backend Cloudinary Config (Already Set):
```properties
cloudinary.cloud_name=dmpjc496u
cloudinary.api_key=867162548936863
cloudinary.api_secret=t_Wp6_Yoc8xLv0nXXfqO-gIVF8I
```

### Frontend Needed:
```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dmpjc496u
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=ml_default
```

### Upload Preset Settings:
- Mode: **Unsigned** ⚠️
- Name: `ml_default`
- Folder: `green-loop/items`
- Max size: 10 MB

---

## 🚀 Recommended Approach

**For now, use Admin Item Creation (`/admin/items/create`):**
- ✅ No frontend Cloudinary setup needed
- ✅ Uses backend API upload
- ✅ More secure
- ✅ Already working!

**Later, set up frontend upload for user pages:**
- Better UX (faster uploads)
- Less backend load
- Follow steps above

---

## 🔑 Summary

1. Create `.env.local` file (copy from above)
2. Create unsigned upload preset in Cloudinary console
3. Restart dev server: `npm run dev`
4. Test on `/item/create`

**OR**

Use `/admin/items/create` which works without any setup! ✅









