# Quick Fix: SSL Protocol Error

## The Error You're Seeing
```
POST https://localhost:5000/api/auth/login net::ERR_SSL_PROTOCOL_ERROR
```

## Why It Happens
- Frontend trying to use HTTPS (https://)
- Backend running on HTTP (http://)
- No SSL certificate for local development

## The Fix (3 Steps)

### Step 1: Create .env.local
```bash
cd frontend
```

Create file `frontend/.env.local` with this content:
```bash
VITE_API_URL=http://localhost:5000/api
```

**Important**: Use `http://` NOT `https://`

### Step 2: Restart Frontend
```bash
# Stop frontend server (Ctrl+C)
npm run dev
```

Vite needs restart to load new environment variables.

### Step 3: Verify
Open browser console and run:
```javascript
console.log(import.meta.env.VITE_API_URL)
```

Should show: `http://localhost:5000/api`

---

## If Still Not Working

### Check Backend is Running
```bash
# Test in browser or curl
curl http://localhost:5000/health
```

Should return JSON with `"success": true`

If not working:
```bash
cd backend
npm run dev
```

### Check Frontend Environment
1. File must be named `.env.local` (not `.env`)
2. Variable must start with `VITE_`
3. Must restart dev server after creating file
4. Clear browser cache

### Complete Reset
```bash
# Stop all servers (Ctrl+C)

# Backend
cd backend
rm -rf node_modules
npm install
npm run dev

# Frontend (new terminal)
cd frontend
rm -rf node_modules
npm install
# Make sure .env.local exists with correct content
npm run dev
```

---

## Quick Start Script
We created a helper script:

```bash
./start-dev.sh
```

This will:
- ✅ Create missing .env files
- ✅ Install dependencies
- ✅ Start both servers
- ✅ Everything configured correctly

---

## Environment Files Summary

### Backend: `backend/.env`
```bash
NODE_ENV=development
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=founder_crm
JWT_SECRET=generate-random-string
FRONTEND_URL=http://localhost:5173
```

### Frontend: `frontend/.env.local`
```bash
VITE_API_URL=http://localhost:5000/api
```

---

## Testing Your Fix

### 1. Backend Health Check
Open: http://localhost:5000/health

Should see:
```json
{
  "success": true,
  "message": "Founder CRM API is running"
}
```

### 2. Frontend Loading
Open: http://localhost:5173

Should see login page with no errors

### 3. Console Check
Open browser DevTools (F12) → Console tab

Should see NO errors about SSL or CORS

### 4. Network Tab
DevTools → Network tab → Try to login

Request URL should be: `http://localhost:5000/api/auth/login`
(NOT https://)

---

## Common Variations of This Error

### "net::ERR_CONNECTION_REFUSED"
**Meaning**: Backend not running

**Fix**: Start backend
```bash
cd backend
npm run dev
```

### "CORS policy" error
**Meaning**: CORS not configured

**Fix**: In backend/.env
```bash
FRONTEND_URL=http://localhost:5173
```

### "Cannot GET /api/auth/login"
**Meaning**: Wrong URL or route

**Fix**: Check URL is `http://localhost:5000/api/auth/login`

---

## Still Stuck?

Read the comprehensive guide:
```bash
# Full troubleshooting guide
TROUBLESHOOTING_LOCAL_DEV.md

# Complete local setup
README_DEPLOYMENT.md (Local Development section)
```

---

## TL;DR - Copy & Paste Solution

```bash
# 1. Create frontend/.env.local
echo "VITE_API_URL=http://localhost:5000/api" > frontend/.env.local

# 2. Restart frontend
cd frontend
# Press Ctrl+C to stop
npm run dev

# 3. Verify backend is running
curl http://localhost:5000/health

# 4. If backend not running
cd backend
npm run dev
```

**Done! Try logging in again.** ✅
