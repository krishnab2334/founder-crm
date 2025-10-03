# ⚡ Quick Start Guide - Founder CRM

Get up and running in 10 minutes!

## Prerequisites Check

```bash
# Check if you have Node.js installed
node --version
# Should show v14.0.0 or higher

# Check if you have MySQL installed
mysql --version
# Should show MySQL 5.7 or higher
```

## Step 1: Database Setup (2 minutes)

```bash
# Login to MySQL
mysql -u root -p

# Create the database and tables
source backend/src/config/database.sql

# Verify it worked
USE founder_crm;
SHOW TABLES;
# You should see 10 tables

# Exit MySQL
exit;
```

## Step 2: Backend Setup (3 minutes)

```bash
# Go to backend folder
cd backend

# Install dependencies
npm install

# Create .env file
cat > .env << 'EOF'
PORT=5000
NODE_ENV=development
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=YOUR_MYSQL_PASSWORD_HERE
DB_NAME=founder_crm
DB_PORT=3306
JWT_SECRET=founder_crm_secret_key_change_this_in_production_min_32_chars
JWT_EXPIRE=7d
OPENAI_API_KEY=your_openai_key_optional
FRONTEND_URL=http://localhost:3000
EOF

# Edit the .env file and replace YOUR_MYSQL_PASSWORD_HERE
# nano .env  (or use any text editor)

# Start the backend server
npm start
```

**You should see:**
```
✅ Database connected successfully
🚀 Founder CRM API Server
📡 Server running on port 5000
```

## Step 3: Frontend Setup (3 minutes)

**Open a NEW terminal window** (keep backend running!)

```bash
# Go to frontend folder
cd frontend

# Install dependencies
npm install

# Start the frontend
npm run dev
```

**You should see:**
```
VITE ready in XXX ms
Local: http://localhost:3000
```

## Step 4: Test It! (2 minutes)

1. **Open browser**: Go to `http://localhost:3000`

2. **Register**:
   - Click "Register as Founder"
   - Name: Test User
   - Email: test@test.com
   - Workspace: Test Startup
   - Password: test123
   - Click "Create Workspace"

3. **You're in!** 🎉
   - You should see the Founder Dashboard
   - Try clicking "Quick Add Task"
   - Navigate to "Contacts" and add one

## Troubleshooting

### Problem: "Database connection failed"

```bash
# Check if MySQL is running
# On Mac: brew services list | grep mysql
# On Linux: sudo systemctl status mysql
# On Windows: Check Services app

# If not running, start it:
# Mac: brew services start mysql
# Linux: sudo systemctl start mysql
```

### Problem: "Port 5000 already in use"

Change the PORT in `backend/.env` to 5001 and restart.

### Problem: "npm install fails"

```bash
# Clear cache and try again
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Problem: "Can't see frontend"

Check that both servers are running:
- Terminal 1: Backend on port 5000
- Terminal 2: Frontend on port 3000

## What's Next?

- Read the [USER_GUIDE.md](USER_GUIDE.md) for detailed feature documentation
- Check [API_DOCUMENTATION.md](API_DOCUMENTATION.md) for API reference
- Review [SETUP_GUIDE.md](SETUP_GUIDE.md) for advanced configuration

## Project Structure

```
founder-crm/
├── backend/          # Node.js API (Port 5000)
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── services/
│   │   └── server.js
│   └── package.json
│
└── frontend/         # React App (Port 3000)
    ├── src/
    │   ├── pages/
    │   ├── components/
    │   └── App.jsx
    └── package.json
```

## Core Features to Try

✅ **Add Contact** → Contacts page → "Add Contact"
✅ **Create Task** → Dashboard → "Quick Add Task"
✅ **Add Deal** → Pipeline → "Add Deal"
✅ **Invite Team** → Team → "Invite Team Member"
✅ **AI Features** → Add interaction to contact → Enable "Analyze with AI"

## Default URLs

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Health Check: http://localhost:5000/health

## Need Help?

1. Check the error message in the terminal
2. Read the [SETUP_GUIDE.md](SETUP_GUIDE.md)
3. Review the [USER_GUIDE.md](USER_GUIDE.md)
4. Check your MySQL connection
5. Verify all environment variables are set

---

**You're ready to build your CRM! 🚀**
