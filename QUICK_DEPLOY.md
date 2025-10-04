# Quick Deploy Guide - TL;DR Version

## 🚀 Deploy in 15 Minutes

### Prerequisites
- GitHub account
- Vercel account
- Render account  
- Database provider (Railway recommended)
- OpenAI API key

---

## Step 1: Database (5 min)

### Railway (Easiest)
1. Go to https://railway.app
2. New Project → Provision MySQL
3. Copy connection details
4. In Query tab, paste & run:
   - `backend/src/config/database.sql`
   - `backend/src/config/add_beautified_status.sql`

**Save these values:**
```
DB_HOST=xxx.railway.app
DB_PORT=3306
DB_USER=root
DB_PASSWORD=xxx
DB_NAME=railway
```

---

## Step 2: Backend (5 min)

### Render
1. Go to https://dashboard.render.com
2. New Web Service → Connect GitHub repo
3. Settings:
   ```
   Name: founder-crm-api
   Root Directory: backend
   Build: npm install
   Start: npm start
   ```

4. Environment Variables (click "Add Environment Variable"):
   ```
   NODE_ENV=production
   DB_HOST=<from-railway>
   DB_PORT=3306
   DB_USER=<from-railway>
   DB_PASSWORD=<from-railway>
   DB_NAME=railway
   JWT_SECRET=<random-32-char-string>
   OPENAI_API_KEY=<your-openai-key>
   FRONTEND_URL=https://your-app.vercel.app
   ```

5. Create Service → Wait for deploy

**Save Backend URL:** `https://founder-crm-api.onrender.com`

---

## Step 3: Frontend (5 min)

### Vercel

#### Option A: CLI (Faster)
```bash
cd frontend
npm install -g vercel
vercel login
vercel
# Follow prompts
vercel env add VITE_API_URL production
# Enter: https://founder-crm-api.onrender.com/api
vercel --prod
```

#### Option B: Dashboard
1. Go to https://vercel.com/new
2. Import your GitHub repo
3. Settings:
   ```
   Root: frontend
   Framework: Vite
   Build: npm run build
   Output: dist
   ```
4. Environment Variable:
   ```
   VITE_API_URL=https://founder-crm-api.onrender.com/api
   ```
5. Deploy

**Save Frontend URL:** `https://your-app.vercel.app`

---

## Step 4: Final Config

### Update Backend CORS
1. Go to Render → Your service → Environment
2. Update `FRONTEND_URL` to actual Vercel URL
3. Save → Redeploy

### Create Demo Account
1. Connect to Railway database
2. Run: `backend/src/scripts/createDemoAccount.js`
   OR use demo SQL file

---

## Test It! ✅

1. Visit your Vercel URL
2. Login with:
   ```
   Email: demo@team.com
   Password: demo123
   ```
3. Test features:
   - Create task
   - Drag task to different column
   - Create contact
   - Create deal
   - Drag deal in pipeline

---

## Environment Variables Cheat Sheet

### Backend (Render)
```bash
NODE_ENV=production
PORT=5000
DB_HOST=<railway-host>
DB_PORT=3306
DB_USER=<railway-user>
DB_PASSWORD=<railway-password>
DB_NAME=railway
JWT_SECRET=<random-string>
SESSION_SECRET=<random-string>
OPENAI_API_KEY=<openai-key>
FRONTEND_URL=<vercel-url>
```

### Frontend (Vercel)
```bash
VITE_API_URL=<render-backend-url>/api
```

---

## Generate Secrets

```bash
# In terminal:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Run twice for JWT_SECRET and SESSION_SECRET

---

## Troubleshooting

**Backend not responding?**
- Check Render logs
- Verify database connection
- Wait 30 seconds (free tier wakes up)

**Frontend can't connect?**
- Check VITE_API_URL is correct
- Verify CORS (FRONTEND_URL matches)
- Check browser console

**CORS errors?**
- Ensure no trailing slashes in URLs
- FRONTEND_URL must match exactly
- Redeploy backend after changing

---

## URLs to Bookmark

- Frontend: `<your-vercel-url>`
- Backend: `<your-render-url>`
- Backend Health: `<your-render-url>/health`
- Database: Railway dashboard

---

## Cost: $0/month

All using free tiers:
- Vercel: Free
- Render: Free (sleeps after 15min)
- Railway: $5 free credit/month
- OpenAI: Pay-as-you-go (~$5-10/month for light usage)

---

## Keep Backend Awake

**Option 1: UptimeRobot**
1. Go to https://uptimerobot.com
2. Add monitor
3. URL: `<your-render-url>/health`
4. Interval: 5 minutes

**Option 2: Cron Job**
Add this to render.yaml:
```yaml
- type: cron
  name: keep-alive
  schedule: "*/14 * * * *"
  command: curl https://your-app.onrender.com/health
```

---

## Next Steps

1. ✅ Add custom domain (optional)
2. ✅ Set up monitoring
3. ✅ Invite team members
4. ✅ Start using!

---

**That's it! You're live! 🎉**

Full docs: See `DEPLOYMENT_GUIDE.md`
