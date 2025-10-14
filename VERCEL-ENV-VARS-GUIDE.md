# 🚀 VERCEL DEPLOYMENT ERROR FIX

## ❌ **Error:**

```
Error: Missing env.NEXT_PUBLIC_SUPABASE_URL
```

**Cause:** Environment variables from `.env.local` are NOT uploaded to Vercel (they're in `.gitignore`).

---

## ✅ **SOLUTION: Add Environment Variables in Vercel**

### **Step 1: Go to Vercel Dashboard**

1. Open your Vercel project
2. Click **Settings** (top navigation)
3. Click **Environment Variables** (left sidebar)

---

### **Step 2: Add These Environment Variables**

Add each of these with their values from your `.env.local` file:

| Variable Name | Value Source | Required |
|--------------|--------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | From Supabase Dashboard → Settings → API | ✅ YES |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | From Supabase Dashboard → Settings → API | ✅ YES |
| `SUPABASE_SERVICE_ROLE_KEY` | From Supabase Dashboard → Settings → API | ✅ YES |
| `NEXT_PUBLIC_SITE_URL` | Your Vercel URL (e.g., `https://your-app.vercel.app`) | ⚠️ Optional |

---

### **Step 3: Get Values from `.env.local`**

**Open your `.env.local` file and copy these values:**

```bash
# In nemm-connect/.env.local

NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

### **Step 4: Add in Vercel**

For **each variable**:

1. Click **"Add New"** in Vercel
2. **Name:** `NEXT_PUBLIC_SUPABASE_URL`
3. **Value:** (paste from `.env.local`)
4. **Environments:** Check ✅ Production, ✅ Preview, ✅ Development
5. Click **Save**

**Repeat for all 3 required variables!**

---

### **Step 5: Redeploy**

After adding all variables:

1. Go to **Deployments** tab
2. Click **"..."** on the latest failed deployment
3. Click **"Redeploy"**

**OR** just push a new commit to trigger rebuild.

---

## 📋 **Quick Checklist:**

- [ ] `NEXT_PUBLIC_SUPABASE_URL` added
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` added
- [ ] `SUPABASE_SERVICE_ROLE_KEY` added
- [ ] All set to Production + Preview + Development
- [ ] Redeployed

---

## 🎯 **Visual Guide:**

### **Vercel Dashboard:**
```
Your Project
  ├── Settings (click here)
  │     ├── Environment Variables (click here)
  │     │     ├── [Add New] ← Click this
  │     │     │     ├── Name: NEXT_PUBLIC_SUPABASE_URL
  │     │     │     ├── Value: https://xxxxx.supabase.co
  │     │     │     └── Environments: ✅ All
  │     │     └── [Save]
```

---

## ⚠️ **IMPORTANT:**

### **For Production Deployment:**

If your Supabase URL changes or you're using a production Supabase project:
- Use **Production** Supabase credentials
- Update `NEXT_PUBLIC_SITE_URL` to your actual Vercel URL
- Add the Vercel URL to Supabase Auth Redirect URLs

---

## 🚀 **After Adding Variables:**

Your deployment will succeed! Then:

1. ✅ Visit your Vercel URL
2. ✅ Test login
3. ✅ Test all features
4. ✅ **You're live!** 🎉

---

## 📝 **Need the Values?**

If you lost your `.env.local` file, get them from:

**Supabase Dashboard:**
1. Go to **Settings** → **API**
2. Copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - anon/public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - service_role key → `SUPABASE_SERVICE_ROLE_KEY`

---

**Once you add these variables, Vercel will deploy successfully!** 🚀

