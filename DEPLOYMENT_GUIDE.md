# Deployment Guide - Founder CRM

## Overview
This guide will walk you through deploying:
- **Frontend** → Vercel (Free tier)
- **Backend** → Render (Free tier)
- **Database** → Railway/PlanetScale/Render PostgreSQL (Free tier)

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Database Setup](#database-setup)
3. [Backend Deployment (Render)](#backend-deployment-render)
4. [Frontend Deployment (Vercel)](#frontend-deployment-vercel)
5. [Post-Deployment](#post-deployment)
6. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Accounts
- ✅ GitHub account (for code repository)
- ✅ Vercel account (sign up at https://vercel.com)
- ✅ Render account (sign up at https://render.com)
- ✅ Database provider account (choose one):
  - Railway (https://railway.app) - Recommended
  - PlanetScale (https://planetscale.com)
  - Render PostgreSQL

### Required Tools
- Git installed locally
- Node.js 18+ installed
- OpenAI API key (for AI features)

---

## Database Setup

### Option 1: Railway (Recommended)

1. **Create Account**
   - Go to https://railway.app
   - Sign up with GitHub

2. **Create MySQL Database**
   - Click "New Project"
   - Select "Provision MySQL"
   - Wait for provisioning

3. **Get Database Credentials**
   - Click on the MySQL service
   - Go to "Connect" tab
   - Copy these values:
     - `MYSQLHOST` → Your DB_HOST
     - `MYSQLPORT` → Your DB_PORT (usually 3306)
     - `MYSQLUSER` → Your DB_USER
     - `MYSQLPASSWORD` → Your DB_PASSWORD
     - `MYSQLDATABASE` → Your DB_NAME

4. **Initialize Database**
   - Use the "Query" tab or connect via MySQL client
   - Run the SQL from `backend/src/config/database.sql`
   - Run the SQL from `backend/src/config/add_beautified_status.sql`

### Option 2: PlanetScale

1. **Create Database**
   - Go to https://planetscale.com
   - Create new database
   - Create a branch (main)

2. **Get Connection String**
   - Click "Connect"
   - Select "Node.js"
   - Copy the connection details

3. **Initialize Schema**
   - Use PlanetScale CLI or web console
   - Import schema from `backend/src/config/database.sql`

### Option 3: Render PostgreSQL

1. **Create PostgreSQL Database**
   - In Render dashboard, click "New +"
   - Select "PostgreSQL"
   - Choose free tier
   - Wait for creation

2. **Convert MySQL to PostgreSQL**
   - Note: You'll need to convert the schema
   - Use a conversion tool or manual adaptation

---

## Backend Deployment (Render)

### Step 1: Prepare Repository

1. **Push Code to GitHub**
   ```bash
   cd your-project
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

### Step 2: Deploy on Render

1. **Create New Web Service**
   - Go to https://dashboard.render.com
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select the repository containing your backend

2. **Configure Build Settings**
   ```
   Name: founder-crm-backend
   Region: Oregon (or closest to you)
   Branch: main
   Root Directory: backend
   Environment: Node
   Build Command: npm install
   Start Command: npm start
   ```

3. **Set Plan**
   - Select "Free" tier
   - Note: Free tier sleeps after inactivity

4. **Add Environment Variables**
   
   Click "Advanced" → "Add Environment Variable"
   
   Add these variables:
   
   ```
   NODE_ENV=production
   PORT=5000
   DB_HOST=<your-database-host>
   DB_PORT=3306
   DB_USER=<your-database-user>
   DB_PASSWORD=<your-database-password>
   DB_NAME=founder_crm
   JWT_SECRET=<generate-a-random-string>
   SESSION_SECRET=<generate-another-random-string>
   OPENAI_API_KEY=<your-openai-api-key>
   FRONTEND_URL=https://your-app.vercel.app
   ```

   **How to generate secrets:**
   ```bash
   # In terminal, generate random strings:
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

5. **Create Web Service**
   - Click "Create Web Service"
   - Wait for deployment (5-10 minutes)
   - Note your backend URL: `https://your-app.onrender.com`

### Step 3: Verify Backend

1. **Test Health Endpoint**
   - Visit: `https://your-app.onrender.com/health`
   - Should see: `{"success": true, "message": "Founder CRM API is running"}`

2. **Check Logs**
   - In Render dashboard, click "Logs"
   - Verify no errors

---

## Frontend Deployment (Vercel)

### Step 1: Update Environment Configuration

1. **Create Production ENV File**
   
   In `frontend/.env.production`:
   ```
   VITE_API_URL=https://your-backend.onrender.com/api
   ```

2. **Update vercel.json**
   
   Replace `your-backend-app` with your actual Render URL in:
   `frontend/vercel.json`

### Step 2: Deploy to Vercel

#### Option A: Vercel CLI (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   cd frontend
   vercel
   ```

4. **Follow Prompts**
   - Setup and deploy: Yes
   - Which scope: Your account
   - Link to existing project: No
   - Project name: founder-crm
   - Directory: ./
   - Override settings: No

5. **Set Production Environment Variable**
   ```bash
   vercel env add VITE_API_URL production
   ```
   Enter: `https://your-backend.onrender.com/api`

6. **Deploy to Production**
   ```bash
   vercel --prod
   ```

#### Option B: Vercel Dashboard

1. **Import Project**
   - Go to https://vercel.com/dashboard
   - Click "Add New" → "Project"
   - Import your Git repository
   - Select the repository

2. **Configure Project**
   ```
   Framework Preset: Vite
   Root Directory: frontend
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```

3. **Environment Variables**
   - Add `VITE_API_URL`
   - Value: `https://your-backend.onrender.com/api`

4. **Deploy**
   - Click "Deploy"
   - Wait for build (2-5 minutes)

### Step 3: Update Backend CORS

1. **Update Backend Environment**
   - Go to Render dashboard
   - Click on your backend service
   - Go to "Environment"
   - Update `FRONTEND_URL` to your Vercel URL
   - Example: `https://founder-crm.vercel.app`
   - Save and redeploy

2. **Update server.js** (if needed)
   
   In `backend/src/server.js`, replace:
   ```javascript
   'https://your-app.vercel.app'
   ```
   with your actual Vercel URL

---

## Post-Deployment

### Create Demo Account

1. **SSH into Render (or use MySQL client)**
   ```bash
   node src/scripts/createDemoAccount.js
   ```

2. **Or manually run SQL**
   - Use Railway/PlanetScale console
   - Run the demo account creation script

### Test Your Application

1. **Visit Your Frontend**
   - Go to your Vercel URL
   - Example: `https://founder-crm.vercel.app`

2. **Test Login**
   - Use demo account:
     - Email: `demo@team.com`
     - Password: `demo123`

3. **Test Features**
   - ✅ Create a task
   - ✅ Create a contact
   - ✅ Create a deal
   - ✅ Test drag-and-drop
   - ✅ Test AI features (status updates)
   - ✅ Test mobile responsiveness

### Set Up Custom Domain (Optional)

#### Vercel
1. Go to Project Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions

#### Render
1. Go to Service Settings → Custom Domain
2. Add your API subdomain (e.g., api.yourdomain.com)
3. Update CNAME records

---

## Environment Variables Checklist

### Backend (Render)
- [x] `NODE_ENV=production`
- [x] `PORT=5000`
- [x] `DB_HOST`
- [x] `DB_PORT`
- [x] `DB_USER`
- [x] `DB_PASSWORD`
- [x] `DB_NAME`
- [x] `JWT_SECRET`
- [x] `SESSION_SECRET`
- [x] `OPENAI_API_KEY`
- [x] `FRONTEND_URL`

### Frontend (Vercel)
- [x] `VITE_API_URL`

---

## Troubleshooting

### Backend Issues

**Problem: "Cannot connect to database"**
- ✅ Check DB credentials in Render environment
- ✅ Verify database is running
- ✅ Check firewall rules (allow Render IPs)

**Problem: "CORS error"**
- ✅ Verify `FRONTEND_URL` matches your Vercel URL exactly
- ✅ Check CORS configuration in `server.js`
- ✅ Ensure no trailing slashes

**Problem: "Backend sleeps"**
- ✅ Render free tier sleeps after 15 min inactivity
- ✅ Use a ping service like UptimeRobot
- ✅ Or upgrade to paid tier

### Frontend Issues

**Problem: "API calls fail"**
- ✅ Check `VITE_API_URL` is set correctly
- ✅ Verify backend is running
- ✅ Check browser console for errors

**Problem: "White screen"**
- ✅ Check Vercel build logs
- ✅ Verify build command succeeded
- ✅ Check for JavaScript errors in console

**Problem: "Routes not working"**
- ✅ Verify `vercel.json` rewrites are configured
- ✅ Check that all routes redirect to index.html

### Database Issues

**Problem: "Tables don't exist"**
- ✅ Run database migration scripts
- ✅ Verify SQL executed successfully
- ✅ Check table names match exactly

**Problem: "Connection timeout"**
- ✅ Check database is accessible from Render
- ✅ Verify connection string format
- ✅ Check SSL requirements

---

## Performance Optimization

### Backend
1. **Enable Compression**
   - Install: `npm install compression`
   - Add to server.js

2. **Database Connection Pooling**
   - Already configured in `database.js`

3. **Rate Limiting** (Optional)
   - Install: `npm install express-rate-limit`

### Frontend
1. **Code Splitting**
   - Already handled by Vite

2. **Image Optimization**
   - Use Vercel's image optimization

3. **Caching**
   - Already configured in vercel.json

---

## Monitoring

### Recommended Tools

1. **Uptime Monitoring**
   - UptimeRobot (free): https://uptimerobot.com
   - Ping your backend every 5 minutes

2. **Error Tracking**
   - Sentry (free tier): https://sentry.io
   - Track frontend and backend errors

3. **Analytics**
   - Vercel Analytics (built-in)
   - Or Google Analytics

---

## Maintenance

### Regular Tasks

1. **Weekly**
   - Check error logs
   - Monitor uptime

2. **Monthly**
   - Update dependencies
   - Review database size
   - Check API usage (OpenAI)

3. **As Needed**
   - Scale database
   - Upgrade Render/Vercel plans
   - Optimize slow queries

---

## Cost Breakdown

### Free Tier Limits

**Vercel (Frontend)**
- ✅ Unlimited deployments
- ✅ 100 GB bandwidth/month
- ✅ Custom domain support
- ✅ Automatic SSL

**Render (Backend)**
- ✅ 750 hours/month
- ✅ Sleeps after 15 min inactivity
- ✅ 512 MB RAM
- ✅ Custom domain support

**Railway (Database)**
- ✅ $5 free credit/month
- ✅ ~500MB storage
- ✅ Auto scaling

**OpenAI API**
- Pay as you go
- Estimated: $5-10/month for small usage

### When to Upgrade

Upgrade when:
- Backend sleep time affects UX
- Database storage > 500MB
- Need more API requests
- Require better performance

---

## Security Checklist

### Pre-Deployment
- [x] All secrets in environment variables
- [x] No hardcoded credentials
- [x] CORS properly configured
- [x] JWT secret is strong
- [x] SQL injection prevention (parameterized queries)

### Post-Deployment
- [x] HTTPS enabled (automatic on Vercel/Render)
- [x] Database not publicly accessible
- [x] Rate limiting configured
- [x] Error messages don't leak sensitive data

---

## Support & Resources

### Documentation
- Vercel Docs: https://vercel.com/docs
- Render Docs: https://render.com/docs
- Railway Docs: https://docs.railway.app

### Community
- Render Community: https://community.render.com
- Vercel Discord: https://vercel.com/discord

---

## Quick Reference

### Useful Commands

```bash
# Vercel
vercel                    # Deploy preview
vercel --prod            # Deploy production
vercel logs              # View logs
vercel env ls            # List environment variables

# Git
git status               # Check changes
git add .                # Stage all changes
git commit -m "msg"      # Commit
git push                 # Push to GitHub

# Database
npm run create-demo      # Create demo account
```

### URLs to Save

- Frontend: `https://your-app.vercel.app`
- Backend: `https://your-app.onrender.com`
- API Docs: `https://your-app.onrender.com/health`
- Database: `<your-database-url>`

---

**Deployment Complete! 🎉**

Your Founder CRM is now live and accessible worldwide!
