# 🚀 Founder CRM - Complete Setup Guide

This guide will walk you through setting up the Founder CRM application from scratch.

## Prerequisites Checklist

Before you begin, ensure you have:
- ✅ Node.js (v14 or higher) installed
- ✅ MySQL (v5.7 or higher) installed and running
- ✅ npm or yarn package manager
- ✅ OpenAI API key (for AI features)
- ✅ Code editor (VS Code recommended)
- ✅ Terminal/Command line access

## Step-by-Step Installation

### Step 1: Download the Project

```bash
# If you have the project as a zip file, extract it
# Or if it's in a git repository:
git clone <repository-url>
cd founder-crm
```

### Step 2: Set Up MySQL Database

#### Option A: Using MySQL Workbench (GUI)
1. Open MySQL Workbench
2. Connect to your local MySQL server
3. Open the SQL file: `backend/src/config/database.sql`
4. Execute the entire script
5. Verify the `founder_crm` database was created

#### Option B: Using Command Line
```bash
# Login to MySQL
mysql -u root -p

# You'll be prompted for your MySQL password
# Then run:
source /path/to/backend/src/config/database.sql

# Or copy-paste the SQL content directly
```

#### Verify Database Setup
```sql
USE founder_crm;
SHOW TABLES;
-- You should see: users, workspaces, contacts, tasks, deals, etc.
```

### Step 3: Backend Configuration

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install
```

#### Create Environment File

Create a file named `.env` in the `backend` directory:

```bash
cd backend
touch .env  # On Mac/Linux
# OR
type nul > .env  # On Windows
```

Add the following content to `.env`:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_root_password
DB_NAME=founder_crm
DB_PORT=3306

# JWT Configuration (Change this to a random secret string!)
JWT_SECRET=your_super_secret_jwt_key_min_32_characters_long
JWT_EXPIRE=7d

# OpenAI Configuration
OPENAI_API_KEY=sk-your-openai-api-key-here

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000
```

**Important Notes:**
- Replace `your_mysql_root_password` with your actual MySQL root password
- Replace `your_super_secret_jwt_key_min_32_characters_long` with a random secret (at least 32 characters)
- Get your OpenAI API key from: https://platform.openai.com/api-keys

#### Generate a Strong JWT Secret

```bash
# On Mac/Linux:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# On Windows PowerShell:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Copy the output and use it as your JWT_SECRET
```

#### Test Backend Connection

```bash
# Start the backend server
npm start

# You should see:
# ✅ Database connected successfully
# 🚀 Server running on port 5000
```

If you see errors:
- **Database connection failed**: Check your MySQL credentials in `.env`
- **Port already in use**: Change PORT in `.env` to 5001 or another port
- **OpenAI error**: AI features will fail, but app will work. Get API key from OpenAI.

### Step 4: Frontend Configuration

Open a NEW terminal window (keep backend running):

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install
```

#### Configure Frontend (if needed)

The frontend is pre-configured to work with the backend on port 5000. If you changed the backend port, update `vite.config.js`:

```javascript
// frontend/vite.config.js
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000', // Change 5000 to your backend port
        changeOrigin: true,
      },
    },
  },
})
```

#### Start Frontend

```bash
# Start the development server
npm run dev

# You should see:
# VITE ready in XXX ms
# Local: http://localhost:3000
```

### Step 5: Verify Everything Works

1. **Open Browser**: Go to `http://localhost:3000`
2. **You should see**: The login page with "⚡ Founder CRM"
3. **Test Registration**:
   - Click "Register as Founder"
   - Fill in:
     - Name: Test Founder
     - Email: founder@test.com
     - Workspace: Test Startup
     - Password: test123456
   - Click "Create Workspace"
4. **You should be redirected** to the Founder Dashboard
5. **Test Features**:
   - Click "Add Contact" - should open modal
   - Click "Quick Add Task" - should work
   - Navigate to different pages - all should load

## Common Issues & Solutions

### Issue: "Database connection failed"

**Solution:**
```bash
# Check if MySQL is running
# On Mac:
brew services list | grep mysql

# On Linux:
sudo systemctl status mysql

# On Windows:
# Open Services app and check MySQL status

# Start MySQL if it's not running:
# Mac: brew services start mysql
# Linux: sudo systemctl start mysql
# Windows: Start MySQL service in Services app
```

### Issue: "Port 5000 already in use"

**Solution:**
```bash
# Find and kill the process using port 5000
# On Mac/Linux:
lsof -ti:5000 | xargs kill -9

# On Windows:
netstat -ano | findstr :5000
# Note the PID and then:
taskkill /PID <PID> /F

# OR change the PORT in backend/.env to 5001
```

### Issue: "npm install fails"

**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Install again
npm install
```

### Issue: "AI features not working"

**Reason**: No OpenAI API key or invalid key

**Solution:**
1. Sign up at https://platform.openai.com
2. Create an API key
3. Add to `.env`: `OPENAI_API_KEY=sk-...`
4. Restart backend server

**Note**: App works without AI, you just won't get AI suggestions.

### Issue: "Cannot connect to backend"

**Solution:**
```bash
# Check backend is running:
curl http://localhost:5000/health

# Should return:
# {"success":true,"message":"Founder CRM API is running"}

# If not, check backend terminal for errors
```

## Development Workflow

### Running Both Servers

You'll need TWO terminal windows:

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev  # Uses nodemon for auto-restart
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### Making Code Changes

- **Backend changes**: Server auto-restarts (with nodemon)
- **Frontend changes**: Page auto-reloads
- **Database changes**: 
  - Edit `backend/src/config/database.sql`
  - Re-run the SQL script in MySQL

### Viewing Logs

- **Backend logs**: Check Terminal 1
- **Frontend logs**: Check browser console (F12)
- **Database queries**: Logged in backend terminal

## Testing the Application

### Test Scenario 1: Complete Founder Workflow

1. **Register** as a founder
2. **Add a contact**:
   - Name: John Customer
   - Email: john@customer.com
   - Type: Customer
   - Notes: "Met at conference, interested in product"
   - Enable "Use AI to categorize"
3. **Add interaction** to the contact:
   - Type: Call
   - Notes: "Discussed pricing, sending proposal next week"
   - Enable "Analyze with AI"
   - AI should suggest follow-up tasks
4. **Create a deal**:
   - Contact: John Customer
   - Title: "Enterprise Plan Q1"
   - Value: 50000
   - Stage: Qualified
5. **Move deal** through pipeline (Qualified → Demo → Proposal)
6. **Invite team member**:
   - Go to Team page
   - Invite with email
   - Copy invitation link
   - Open in incognito window
   - Accept invitation
7. **View dashboard** - should show all your activity

### Test Scenario 2: Team Member Workflow

1. **Login** as team member
2. **View your dashboard** (different from founder)
3. **Complete tasks** assigned to you
4. **Add interaction** to a contact
5. **Check real-time updates** (if founder updates something in another window)

## Next Steps

### For Development

1. **Customize the code** for your needs
2. **Add more features** from the "Go Beyond" section
3. **Improve AI prompts** in `backend/src/services/aiService.js`
4. **Add more routes** or pages

### For Production

See `DEPLOYMENT.md` for production deployment guide.

## Getting Help

### Quick Diagnostics

```bash
# Check Node version
node --version  # Should be v14+

# Check npm version
npm --version

# Check MySQL version
mysql --version

# Test database connection
mysql -u root -p -e "USE founder_crm; SELECT COUNT(*) FROM users;"
```

### Check Logs

**Backend logs:**
```bash
cd backend
npm start 2>&1 | tee app.log
# Logs will be saved to app.log
```

**Frontend logs:**
- Open browser console (F12)
- Check "Console" tab for errors
- Check "Network" tab for API call failures

### Verify Environment

```bash
# Backend
cd backend
cat .env | grep -v PASSWORD  # View .env (hides password)

# Check if all dependencies installed
npm list --depth=0
```

## Resources

- **MySQL Documentation**: https://dev.mysql.com/doc/
- **Node.js Documentation**: https://nodejs.org/docs/
- **React Documentation**: https://react.dev/
- **OpenAI API**: https://platform.openai.com/docs/
- **Socket.io Documentation**: https://socket.io/docs/

## Support

If you encounter issues:
1. Check this guide's "Common Issues" section
2. Review error messages in terminal
3. Check database connection
4. Verify all environment variables are set
5. Ensure all dependencies are installed

---

**You're all set! 🎉 Start building your CRM!**
