# 🚀 BugTracker Pro — Production Deployment Guide

**Deployment Time:** ~15 minutes  
**Stack:** Vercel (Frontend) + Render (Backend) + MongoDB Atlas (Database)  
**Cost:** $0 (all free tiers)

---

## 📋 Pre-Deployment Checklist

- [ ] GitHub repository created with `bugtracker-pro/` code pushed
- [ ] MongoDB Atlas account created (free tier)
- [ ] Vercel account created (free tier)
- [ ] Render account created (free tier)

---

## Step 1: Database — MongoDB Atlas (3 minutes)

### 1.1 Create Free Cluster

1. Go to [mongodb.com/atlas](https://www.mongodb.com/atlas) → Sign up / Sign in
2. Click **"Build a Database"**
3. Select **M0 Free Tier** → Choose region closest to your users
4. Cluster name: `bugtracker-pro`
5. Click **"Create Deployment"**

### 1.2 Create Database User

1. Under **Database Access** → **Add New Database User**
2. Authentication: Password
3. Username: `bugtracker_admin`
4. Password: Click **Auto Generate** → **Copy the password**
5. Database User Privileges: **Read and write to any database**
6. Click **Add User**

### 1.3 Configure Network Access

1. Under **Network Access** → **Add IP Address**
2. Click **"Allow Access from Anywhere"** (sets `0.0.0.0/0`)
3. Click **Confirm**

> ⚠️ For production with real users, restrict this to your Render service IP.

### 1.4 Get Connection String

1. Go to **Database** → Click **"Connect"** on your cluster
2. Select **"Drivers"**
3. Copy the connection string:
```
mongodb+srv://bugtracker_admin:<password>@cluster0.xxxxx.mongodb.net/bugtracker-pro?retryWrites=true&w=majority
```
4. Replace `<password>` with the password from step 1.2

### 1.5 Seed the Database (Optional)

If you want pre-loaded demo data in production:

```bash
cd backend
MONGO_URI="your_atlas_connection_string" NODE_ENV=production node utils/seed.js
```

---

## Step 2: Backend — Render (5 minutes)

### 2.1 Create Web Service

1. Go to [render.com](https://render.com) → Sign in with GitHub
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure:

| Setting | Value |
|---------|-------|
| **Name** | `bugtracker-pro-api` |
| **Region** | Oregon (US West) or closest |
| **Root Directory** | `backend` |
| **Runtime** | Node |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |
| **Instance Type** | Free |

### 2.2 Set Environment Variables

In Render dashboard → **Environment** tab, add:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `PORT` | `10000` |
| `MONGO_URI` | `mongodb+srv://bugtracker_admin:<password>@cluster0.xxxxx.mongodb.net/bugtracker-pro?retryWrites=true&w=majority` |
| `JWT_SECRET` | *(Generate: run `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)* |
| `JWT_EXPIRE` | `7d` |
| `CLIENT_URL` | `https://bugtracker-pro.vercel.app` *(update after Vercel deployment)* |

### 2.3 Deploy

1. Click **"Create Web Service"**
2. Wait for build to complete (~2-3 minutes)
3. Note your backend URL: `https://bugtracker-pro-api.onrender.com`

### 2.4 Verify Backend

Open in browser:
```
https://bugtracker-pro-api.onrender.com/api/health
```

Expected response:
```json
{
  "success": true,
  "message": "BugTracker Pro API is running",
  "version": "1.0.0"
}
```

---

## Step 3: Frontend — Vercel (5 minutes)

### 3.1 Import Project

1. Go to [vercel.com](https://vercel.com) → Sign in with GitHub
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository
4. Configure:

| Setting | Value |
|---------|-------|
| **Framework Preset** | Vite |
| **Root Directory** | `frontend` |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |
| **Install Command** | `npm install` |

### 3.2 Set Environment Variables

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://bugtracker-pro-api.onrender.com/api` |

### 3.3 Deploy

1. Click **"Deploy"**
2. Wait ~1-2 minutes
3. Note your frontend URL: `https://bugtracker-pro.vercel.app`

### 3.4 Update Backend CORS

Go back to Render → **Environment** → Update:
```
CLIENT_URL=https://bugtracker-pro.vercel.app
```

Render will auto-redeploy with the new CORS origin.

---

## Step 4: Seed Production Data (2 minutes)

Run this **once** from your local machine:

```bash
cd backend

# Set production connection string temporarily
export MONGO_URI="mongodb+srv://bugtracker_admin:<password>@cluster0.xxxxx.mongodb.net/bugtracker-pro?retryWrites=true&w=majority"
export JWT_SECRET="your_production_jwt_secret"
export NODE_ENV="production"

# Seed
node utils/seed.js
```

Expected output:
```
✔ 15 Users inserted
✔ 10 Projects inserted
✔ 120 Bugs inserted
✔ 600+ Comments inserted
✔ 1300+ Activities inserted
✅ Seed complete!
```

---

## Step 5: Verification (2 minutes)

### Post-Deployment Checklist

Open your Vercel URL and verify:

| # | Test | Action | Expected |
|---|------|--------|----------|
| 1 | Login | Enter `siva0225@gmail.com` / `1231231234` | Redirects to Dashboard |
| 2 | Dashboard | Observe stats and charts | Non-zero numbers, charts render |
| 3 | Bugs List | Navigate to Bugs | Table with 120 bugs, pagination |
| 4 | Bug Detail | Click any bug | Detail page with comments, activity |
| 5 | Create Bug | Click "Report Bug", fill form, submit | New bug created, redirects to detail |
| 6 | Edit Bug | Open bug → Edit → Change priority → Save | Updated successfully |
| 7 | Comments | Add a comment on any bug | Comment appears immediately |
| 8 | Projects | Navigate to Projects | 10 project cards visible |
| 9 | Reports | Export CSV | File downloads |
| 10 | Search | Type "login" in search | Filtered results appear |
| 11 | Filters | Filter by Status: Open | Only open bugs shown |
| 12 | Profile | Navigate → Edit name → Save | Profile updated toast |
| 13 | Dark Mode | Settings → Dark Mode | Theme switches |
| 14 | Mobile | Resize to 390px | Responsive layout, sidebar collapses |
| 15 | Logout | Click Logout → Confirm | Returns to login page |
| 16 | Registration | Register new user | Account created, logged in |
| 17 | Health Check | Visit `/api/health` | JSON response with uptime |

---

## 🔧 Troubleshooting

### "Invalid credentials" on login
- Backend not seeded. Run seed script with production MONGO_URI.
- Or check that `NODE_ENV=production` is set (disables auto-seed).

### CORS error in browser console
- Update `CLIENT_URL` in Render env vars to match exact Vercel URL.
- Include `https://` prefix. No trailing slash.

### Backend returns 503 / sleeping
- Render free tier sleeps after 15 min of inactivity. First request takes ~30s to wake.
- Solution: Use [UptimeRobot](https://uptimerobot.com) to ping `/api/health` every 14 minutes.

### File uploads not working
- Render free tier uses ephemeral filesystem. Uploaded files are lost on redeploy.
- For permanent storage: use Cloudinary or AWS S3 (future enhancement).

### MongoDB connection timeout
- Verify Atlas Network Access allows `0.0.0.0/0`.
- Verify the connection string password doesn't contain unescaped special characters.

---

## 📊 Production Architecture

```
User Browser
    │
    ▼
┌─────────────────┐     HTTPS      ┌──────────────────────┐
│  Vercel CDN     │ ◄──────────── │  Frontend (React SPA) │
│  (Global Edge)  │                │  Static HTML/JS/CSS   │
└────────┬────────┘                └──────────────────────┘
         │
         │ API calls (HTTPS)
         ▼
┌─────────────────────┐
│  Render Web Service │
│  (Node.js/Express)  │
│  bugtracker-pro-api │
└────────┬────────────┘
         │
         │ MongoDB Driver (TLS)
         ▼
┌─────────────────────┐
│  MongoDB Atlas      │
│  (Free M0 Cluster)  │
│  bugtracker-pro DB  │
└─────────────────────┘
```

---

## 🔐 Production Security Configuration

| Concern | Mitigation |
|---------|-----------|
| JWT Secret | 64-char random hex string (not the default) |
| CORS | Restricted to exact Vercel domain |
| Rate Limiting | 10 requests / 15 min on auth endpoints |
| Passwords | bcrypt 12 rounds (brute-force resistant) |
| Headers | Helmet enables 11 security headers |
| Trust Proxy | Enabled for accurate IP behind Render proxy |
| Body Size | Limited to 10MB |
| File Uploads | 5MB max, image/PDF only, server-validated |
| Role Enforcement | Registration forced to 'developer' regardless of input |
| Sort Injection | Whitelist-validated sort parameter |

---

## 🚦 Deployment Order (Critical)

```
1. MongoDB Atlas   → Must be ready first (connection string needed)
2. Render Backend  → Needs MONGO_URI, provides API URL
3. Vercel Frontend → Needs API URL from step 2
4. Update CORS     → Backend CLIENT_URL must match Vercel domain
5. Seed Data       → Run once after backend is connected to Atlas
6. Verify          → Run through the 17-point checklist
```

---

## 📁 Repository Structure for Deployment

```
bugtracker-pro/          ← GitHub root
├── backend/             ← Render root directory
│   ├── package.json     ← "start": "NODE_ENV=production node server.js"
│   └── ...
├── frontend/            ← Vercel root directory
│   ├── package.json     ← "build": "vite build"
│   └── ...
└── README.md
```

---

## ⏱️ Total Deployment Time

| Step | Time |
|------|------|
| MongoDB Atlas setup | 3 min |
| Render backend deploy | 5 min |
| Vercel frontend deploy | 3 min |
| Seed + Verify | 4 min |
| **Total** | **~15 min** |

---

## ✅ You're Done!

Your production URLs:
- **Frontend:** `https://bugtracker-pro.vercel.app`
- **Backend API:** `https://bugtracker-pro-api.onrender.com`
- **Health Check:** `https://bugtracker-pro-api.onrender.com/api/health`

Login with: `siva0225@gmail.com` / `1231231234`

---

*Deployment guide prepared by Senior DevOps Engineering — BugTracker Pro v1.0.0*
