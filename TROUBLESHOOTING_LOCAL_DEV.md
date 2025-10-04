# Troubleshooting Local Development

## Common Error: "ERR_SSL_PROTOCOL_ERROR"

### Problem
You see this error:
```
POST https://localhost:5000/api/auth/login net::ERR_SSL_PROTOCOL_ERROR
```

### Cause
- Frontend is trying to connect via HTTPS (https://localhost:5000)
- Backend is running on HTTP (http://localhost:5000)
- SSL/HTTPS is not configured for local development

### Solution

#### Step 1: Create `.env.local` file
Create `frontend/.env.local` with:
```bash
VITE_API_URL=http://localhost:5000/api
```

**Note**: Use `http://` (not `https://`) for local development

#### Step 2: Restart Frontend Dev Server
```bash
cd frontend
# Stop the current server (Ctrl+C)
npm run dev
```

Vite needs to be restarted to pick up new environment variables.

---

## Complete Local Development Setup

### Backend Setup

1. **Navigate to backend**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create .env file**
   ```bash
   cp .env.example .env
   ```

4. **Edit .env file**
   ```bash
   # Use your preferred editor
   nano .env
   # or
   code .env
   ```

   **Minimum required variables:**
   ```bash
   NODE_ENV=development
   PORT=5000
   
   # Database (update with your MySQL credentials)
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=founder_crm
   
   # JWT Secret (generate random string)
   JWT_SECRET=your-super-secret-jwt-key-here
   
   # OpenAI API Key (for AI features)
   OPENAI_API_KEY=sk-your-openai-api-key
   
   # Frontend URL
   FRONTEND_URL=http://localhost:5173
   ```

5. **Generate JWT Secret**
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
   Copy the output and use it for `JWT_SECRET`

6. **Set up database**
   
   **Option A: Using MySQL CLI**
   ```bash
   mysql -u root -p
   ```
   ```sql
   CREATE DATABASE founder_crm;
   USE founder_crm;
   source src/config/database.sql;
   source src/config/add_beautified_status.sql;
   EXIT;
   ```

   **Option B: Using MySQL Workbench**
   - Open MySQL Workbench
   - Connect to your database
   - Create new database: `founder_crm`
   - Execute `backend/src/config/database.sql`
   - Execute `backend/src/config/add_beautified_status.sql`

7. **Start backend server**
   ```bash
   npm run dev
   ```

   You should see:
   ```
   🚀 Founder CRM API Server
   📡 Server running on port 5000
   🌐 Environment: development
   ```

### Frontend Setup

1. **Navigate to frontend** (new terminal)
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create .env.local file**
   ```bash
   cp .env.example .env.local
   ```

4. **Edit .env.local**
   ```bash
   # Use your preferred editor
   nano .env.local
   # or
   code .env.local
   ```

   **Content:**
   ```bash
   VITE_API_URL=http://localhost:5000/api
   ```

   **Important**: Use `http://` not `https://`

5. **Start frontend dev server**
   ```bash
   npm run dev
   ```

   You should see:
   ```
   VITE v4.x.x  ready in xxx ms
   
   ➜  Local:   http://localhost:5173/
   ➜  Network: use --host to expose
   ```

6. **Open browser**
   - Go to: http://localhost:5173
   - You should see the login page

---

## Verification Checklist

### Backend Running ✅
```bash
# Test health endpoint
curl http://localhost:5000/health

# Should return:
{
  "success": true,
  "message": "Founder CRM API is running",
  "timestamp": "2025-10-03T..."
}
```

### Frontend Running ✅
- Open: http://localhost:5173
- Should load login page
- Check browser console for errors

### Database Connected ✅
Backend logs should show:
```
✅ Database connected successfully
```

If you see connection errors:
- Verify MySQL is running
- Check DB credentials in `.env`
- Verify database `founder_crm` exists

---

## Common Issues & Solutions

### Issue 1: "Cannot connect to database"

**Error:**
```
❌ Database connection failed
```

**Solutions:**
1. Check MySQL is running:
   ```bash
   # macOS
   brew services list | grep mysql
   
   # Linux
   sudo systemctl status mysql
   
   # Windows
   # Check Services app
   ```

2. Verify credentials:
   ```bash
   mysql -u root -p
   # If this fails, your credentials are wrong
   ```

3. Check database exists:
   ```sql
   SHOW DATABASES;
   # Should list founder_crm
   ```

4. Create database if missing:
   ```sql
   CREATE DATABASE founder_crm;
   ```

### Issue 2: "Port 5000 already in use"

**Error:**
```
Error: listen EADDRINUSE: address already in use :::5000
```

**Solutions:**

**Option A: Kill process on port 5000**
```bash
# macOS/Linux
lsof -ti:5000 | xargs kill -9

# Windows (PowerShell)
Get-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess | Stop-Process
```

**Option B: Use different port**
In `backend/.env`:
```bash
PORT=5001
```

Then update frontend `.env.local`:
```bash
VITE_API_URL=http://localhost:5001/api
```

### Issue 3: "CORS error"

**Error:**
```
Access to XMLHttpRequest blocked by CORS policy
```

**Solution:**
In `backend/.env`, ensure:
```bash
FRONTEND_URL=http://localhost:5173
```

Restart backend server.

### Issue 4: "Module not found"

**Error:**
```
Error: Cannot find module 'express'
```

**Solution:**
```bash
cd backend
rm -rf node_modules package-lock.json
npm install
```

### Issue 5: "Vite environment variables not working"

**Problem:**
Environment variables not loading

**Solution:**
1. Ensure file is named `.env.local` (not `.env`)
2. Variables must start with `VITE_`
3. Restart dev server after creating/editing
4. Clear browser cache

**Verify:**
```javascript
// In browser console
console.log(import.meta.env.VITE_API_URL)
// Should show: http://localhost:5000/api
```

### Issue 6: "OpenAI API errors"

**Error:**
```
OpenAI API error: Incorrect API key
```

**Solution:**
1. Get API key from https://platform.openai.com/api-keys
2. Add to `backend/.env`:
   ```bash
   OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxx
   ```
3. Restart backend

**Test without AI:**
- AI features are optional
- App works without OpenAI key
- Just skip AI status updates

---

## Testing Your Setup

### 1. Test Backend
```bash
# Health check
curl http://localhost:5000/health

# API health check
curl http://localhost:5000/api/health
```

### 2. Test Database
```bash
# In MySQL
mysql -u root -p founder_crm

# Run query
SELECT COUNT(*) FROM users;
```

### 3. Test Frontend
- Open: http://localhost:5173
- Should see login page
- No console errors
- Network tab shows requests to http://localhost:5000

### 4. Create Demo Account
```bash
cd backend
npm run create-demo
```

Then login with:
- Email: `demo@team.com`
- Password: `demo123`

---

## Development Workflow

### Daily Startup

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

**Terminal 3 - Database (if needed):**
```bash
mysql -u root -p
```

### Hot Reloading

**Backend:**
- Uses nodemon
- Auto-restarts on file changes
- Check terminal for reload messages

**Frontend:**
- Uses Vite HMR
- Instant updates
- Check browser for updates

### Debugging

**Backend:**
- Check terminal logs
- Add `console.log()` statements
- Check `backend/logs/` if enabled

**Frontend:**
- Open browser DevTools (F12)
- Check Console tab for errors
- Check Network tab for API calls
- Check Application tab for localStorage

---

## Environment Variables Reference

### Backend (.env)
```bash
# Server
NODE_ENV=development
PORT=5000

# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=founder_crm

# Authentication
JWT_SECRET=<random-32-char-string>
SESSION_SECRET=<random-32-char-string>

# External APIs
OPENAI_API_KEY=sk-your-key (optional)

# CORS
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env.local)
```bash
# API URL
VITE_API_URL=http://localhost:5000/api
```

---

## Quick Commands Reference

### Backend
```bash
npm run dev          # Start dev server
npm start            # Start production server
npm run create-demo  # Create demo account
```

### Frontend
```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
```

### Database
```bash
# Connect
mysql -u root -p founder_crm

# Backup
mysqldump -u root -p founder_crm > backup.sql

# Restore
mysql -u root -p founder_crm < backup.sql

# Reset (DANGER!)
mysql -u root -p -e "DROP DATABASE founder_crm; CREATE DATABASE founder_crm;"
mysql -u root -p founder_crm < src/config/database.sql
```

---

## Still Having Issues?

### Check Logs
1. **Backend logs**: Check terminal running `npm run dev`
2. **Frontend logs**: Check browser console (F12)
3. **Database logs**: Check MySQL error log

### Verify Versions
```bash
node --version   # Should be 18+
npm --version    # Should be 9+
mysql --version  # Should be 5.7+ or 8.0+
```

### Clean Install
```bash
# Backend
cd backend
rm -rf node_modules package-lock.json
npm install

# Frontend
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### Reset Everything
```bash
# Stop all servers (Ctrl+C in all terminals)

# Clean backend
cd backend
rm -rf node_modules package-lock.json
npm install

# Clean frontend
cd frontend
rm -rf node_modules package-lock.json dist
npm install

# Reset database
mysql -u root -p -e "DROP DATABASE IF EXISTS founder_crm; CREATE DATABASE founder_crm;"
mysql -u root -p founder_crm < backend/src/config/database.sql
mysql -u root -p founder_crm < backend/src/config/add_beautified_status.sql

# Restart servers
cd backend && npm run dev  # Terminal 1
cd frontend && npm run dev # Terminal 2
```

---

## Success Indicators

### Backend Running Successfully ✅
```
=================================
🚀 Founder CRM API Server
=================================
📡 Server running on port 5000
🌐 Environment: development
🔗 API URL: http://localhost:5000
🔌 WebSocket ready
=================================
✅ Database connected successfully
```

### Frontend Running Successfully ✅
```
VITE v4.5.0  ready in 450 ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
➜  press h to show help
```

### Both Connected ✅
- Frontend loads at http://localhost:5173
- Login page appears
- No CORS errors in console
- Network tab shows successful API calls

---

**Now you should be ready to develop! 🚀**

If you still have issues, check the specific error message and search this document for solutions.
