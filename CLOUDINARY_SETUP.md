# Cloudinary Setup Guide

## 🎯 Quick Setup (5 minutes)

### Step 1: Create Cloudinary Account
1. Go to https://cloudinary.com/
2. Sign up for a free account
3. Verify your email

### Step 2: Get Your Credentials
1. Go to Dashboard: https://cloudinary.com/console
2. You'll see:
   - **Cloud Name**: `dxxxxxx` (your cloud name)
   - **API Key**: `123456789012345`
   - **API Secret**: `xxxxxxxxxx` (keep this secret!)

### Step 3: Create Upload Preset (IMPORTANT!)
1. Go to **Settings** (gear icon) → **Upload**
2. Scroll to **Upload presets** section
3. Click **Add upload preset**
4. Configure:
   - **Preset name**: `green_loop_items`
   - **Signing Mode**: **Unsigned** ⚠️ (important for frontend uploads!)
   - **Folder**: `green-loop/items`
   - **Allowed formats**: `jpg, png, webp, jpeg`
   - **Max file size**: `10 MB`
5. Click **Save**

### Step 4: Create Environment File
Create `.env.local` in the frontend root:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8080

# Cloudinary Configuration
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dmpjc496u
NEXT_PUBLIC_CLOUDINARY_API_KEY=867162548936863
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=green_loop_items
```

**⚠️ Replace with YOUR credentials from Step 2!**

### Step 5: Restart Frontend
```bash
npm run dev
```

---

## 🔧 Alternative: Use Backend Upload (No Frontend Config Needed)

If you don't want to configure Cloudinary on frontend, the **Admin Item Create page** (`/admin/items/create`) already uses **backend API uploads**!

**Advantages:**
- ✅ No Cloudinary credentials in frontend
- ✅ More secure (API keys on server only)
- ✅ Centralized upload management
- ✅ Better error handling

**It works like this:**
1. User selects images
2. Images uploaded through backend API: `POST /api/items/{id}/images/upload`
3. Backend handles Cloudinary upload
4. Returns secure URLs

---

## 🎨 Two Item Creation Options:

### 1. User Item Creation (`/item/create`)
- For regular users
- Items start as `SUBMITTED` status
- Need admin verification
- Uses frontend Cloudinary upload (needs upload preset)

### 2. Admin Item Creation (`/admin/items/create`)
- For admins/staff only
- Items **auto-verified** ✅
- Gets unique tracking number
- Status: `READY_FOR_SALE`
- Uses **backend API upload** (no frontend config needed!)
- Journey tracking enabled

---

## ✅ Current Backend Cloudinary Config

Your backend already has Cloudinary configured:
```properties
cloudinary.cloud_name=dmpjc496u
cloudinary.api_key=867162548936863
cloudinary.api_secret=t_Wp6_Yoc8xLv0nXXfqO-gIVF8I
```

**This works for backend uploads!**

---

## 🚀 Quick Test:

1. **Login as admin**
2. Go to **Admin → Items → Create Item (Admin)**
3. Fill form and select images
4. Click "Create & Verify Item"
5. Images will upload through backend API ✅

No Cloudinary frontend setup needed for admin creation!

---

## 📝 Summary:

**Option A: Configure Frontend Cloudinary**
- Create upload preset (unsigned)
- Add .env.local file
- Works for `/item/create` (user page)

**Option B: Use Backend Upload Only (Recommended!)**
- No frontend config needed
- Use `/admin/items/create`
- More secure
- Already working! ✅

Choose Option B for now - it's simpler and more secure!









