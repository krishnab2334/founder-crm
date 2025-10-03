# ⚡ Founder CRM + Task Management

A simple, powerful CRM and task management system designed specifically for early-stage founders and small startup teams.

## 🎯 Problem We Solve

Startup founders juggle too much: customer conversations, feature requests, team tasks, investor follow-ups, product roadmap. Everything is scattered across emails, WhatsApp, notebooks.

**Solution**: A unified platform that keeps everything organized, accessible, and actionable with AI-powered insights.

## ✨ Core Features

### 1. Authentication & Team Management
- ✅ Founder registration with workspace creation
- ✅ Team member invitations
- ✅ Role-based access (Founder & Team Member)
- ✅ Secure JWT authentication

### 2. Contact Management (CRM)
- ✅ Add and manage contacts (customers, investors, partners, leads)
- ✅ Store contact info: name, email, company, type
- ✅ Add notes and track conversations
- ✅ Tag contacts for easy filtering
- ✅ Track all interactions (calls, emails, meetings, notes)
- ✅ Search and filter contacts

### 3. Task Management
- ✅ Create, assign, and track tasks
- ✅ Set due dates and priorities (low, medium, high, urgent)
- ✅ Link tasks to contacts
- ✅ Categories: Sales, Product, Operations, Fundraising, Other
- ✅ Kanban-style task board (To Do, In Progress, Completed)
- ✅ Filter by status, priority, category

### 4. Pipeline/Deal Tracking
- ✅ Track sales opportunities and deals
- ✅ Pipeline stages: Lead → Qualified → Demo → Proposal → Closed Won/Lost
- ✅ Associate deals with contacts
- ✅ Track deal value and probability
- ✅ Expected close dates
- ✅ Visual Kanban pipeline board

### 5. Dashboard
- ✅ **Founder Dashboard**: Complete workspace overview
  - Today's tasks and upcoming deadlines
  - Overdue tasks alerts
  - Pipeline overview with values
  - Recent contact interactions
  - Team activity tracking
- ✅ **Team Member Dashboard**: Personal productivity view
  - My tasks and deadlines
  - My deals
  - My recent interactions
  - Task completion stats

### 6. 🤖 AI Integration
- ✅ **Analyze Notes**: AI analyzes contact interactions and suggests:
  - Follow-up tasks
  - Contact tags
  - Priority levels
  - Recommended timeline
- ✅ **Task Prioritization**: AI prioritizes your task list based on urgency and context
- ✅ **Email Generation**: Generate follow-up emails based on context
- ✅ **Contact Categorization**: Auto-categorize contacts based on information
- ✅ **Deal Prediction**: Predict deal conversion likelihood
- ✅ **Notes Summarization**: Summarize long notes into key points

### 7. Real-time Updates (WebSocket)
- ✅ Live notifications when team members:
  - Come online/offline
  - Update tasks
  - Move deals in pipeline
  - Add contacts
  - Create interactions

## 🛠️ Tech Stack

### Backend
- **Node.js** + **Express.js** - REST API
- **MySQL** - Relational database
- **Socket.io** - Real-time WebSocket communication
- **JWT** - Authentication
- **OpenAI API** - AI features
- **bcrypt** - Password hashing

### Frontend
- **React** (Vite) - UI framework
- **React Router** - Navigation
- **Axios** - API calls
- **Socket.io Client** - Real-time updates
- **React Toastify** - Notifications
- **React Icons** - Icon library
- **date-fns** - Date formatting

## 📚 Documentation

- **[QUICK_START.md](QUICK_START.md)** - Get running in 10 minutes
- **[SETUP_GUIDE.md](SETUP_GUIDE.md)** - Detailed installation guide
- **[USER_GUIDE.md](USER_GUIDE.md)** - Complete user manual
- **[API_DOCUMENTATION.md](API_DOCUMENTATION.md)** - API reference
- **[PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)** - Architecture overview

## 📦 Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MySQL (v5.7 or higher)
- npm or yarn

### Quick Start (10 minutes)

See **[QUICK_START.md](QUICK_START.md)** for the fastest setup, or follow detailed instructions below.

### 1. Clone the Repository
```bash
git clone <repository-url>
cd founder-crm
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create `.env` file:
```env
PORT=5000
NODE_ENV=development

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=founder_crm
DB_PORT=3306

JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRE=7d

OPENAI_API_KEY=your_openai_api_key

FRONTEND_URL=http://localhost:3000
```

Set up database:
```bash
# Login to MySQL
mysql -u root -p

# Create database and tables
source src/config/database.sql
```

Start backend server:
```bash
npm start        # Production
npm run dev      # Development (with nodemon)
```

Backend will run on `http://localhost:5000`

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Start frontend:
```bash
npm run dev      # Development server
npm run build    # Production build
```

Frontend will run on `http://localhost:3000`

## 🚀 Usage Guide

### For Founders

#### 1. Getting Started
1. Register at `/register` with your name, email, password, and workspace name
2. You'll be logged in automatically as a Founder

#### 2. Dashboard Overview
- View today's tasks, upcoming tasks, and overdue items
- Monitor pipeline value and deal stages
- Track team activity and recent interactions
- Use "Quick Add Task" for fast task creation
- Click "AI Prioritize Tasks" to get AI-powered task prioritization

#### 3. Managing Contacts
- Navigate to "Contacts" section
- Click "Add Contact" to create new contact
- Fill in details: name, email, phone, company, type (customer/investor/partner/lead)
- Add tags for better organization
- Enable "Use AI to categorize contact" for smart suggestions
- Click on any contact to view details, interactions, and related tasks/deals

#### 4. Creating Tasks
- Go to "Tasks" section or use quick add from dashboard
- Create task with title, description, priority, category
- Assign to team members
- Set due dates
- Link to contacts when relevant
- Drag tasks between columns: To Do → In Progress → Completed

#### 5. Managing Pipeline
- Navigate to "Pipeline" section
- Click "Add Deal" to create new opportunity
- Select contact, add deal title, value, and expected close date
- Deals automatically move through stages
- Use ← → buttons to move deals between stages
- Track total pipeline value at the top

#### 6. Team Management
- Go to "Team" section
- Click "Invite Team Member"
- Enter email and select role (Team Member or Founder)
- Copy invitation link and share
- Team members accept invitation and join workspace

#### 7. AI Features
- **In Contact Details**: Add interaction → Check "Analyze with AI"
- AI will suggest follow-up tasks, tags, and timelines
- **In Dashboard**: Click "AI Prioritize Tasks" for smart task ordering
- AI considers urgency, deadlines, and context

### For Team Members

#### 1. Joining Workspace
1. Receive invitation link from founder
2. Click link and enter your name and password
3. You'll be added to the workspace

#### 2. Your Dashboard
- View your assigned tasks for today
- See upcoming deadlines
- Track your deals
- Monitor your recent interactions

#### 3. Managing Your Tasks
- Complete tasks by checking them off
- Update task status by clicking "Start" or "Complete"
- Filter to see only "My Tasks"
- Add new tasks as needed

#### 4. Working with Contacts
- View all workspace contacts
- Add interactions and notes
- Create follow-up tasks linked to contacts
- Use AI to analyze notes and get suggestions

## 📚 API Documentation

### Authentication Endpoints

```bash
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
POST /api/auth/invite
POST /api/auth/accept-invitation
```

### Contact Endpoints

```bash
GET    /api/contacts
GET    /api/contacts/:id
POST   /api/contacts
PUT    /api/contacts/:id
DELETE /api/contacts/:id
POST   /api/contacts/:contactId/interactions
```

### Task Endpoints

```bash
GET    /api/tasks
GET    /api/tasks/my-tasks
GET    /api/tasks/:id
POST   /api/tasks
PUT    /api/tasks/:id
DELETE /api/tasks/:id
```

### Deal Endpoints

```bash
GET    /api/deals
GET    /api/deals/pipeline
GET    /api/deals/:id
POST   /api/deals
PUT    /api/deals/:id
PATCH  /api/deals/:id/stage
DELETE /api/deals/:id
```

### Dashboard Endpoints

```bash
GET /api/dashboard/founder
GET /api/dashboard/team-member
GET /api/dashboard/activity
```

### AI Endpoints

```bash
POST /api/ai/analyze-note
POST /api/ai/prioritize-tasks
POST /api/ai/generate-email
POST /api/ai/categorize-contact
POST /api/ai/summarize-notes
GET  /api/ai/predict-deal/:dealId
GET  /api/ai/suggestions
```

## 🔐 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Protected routes with middleware
- Workspace-level data isolation
- Role-based access control

## 🎨 Design Principles

- **Simple, not complex**: Built for early-stage founders, not enterprise
- **Fast**: Quick capture, quick view, quick actions
- **Clear**: See what matters today
- **Useful**: Solves real founder pain points

## 📱 Responsive Design

- Fully responsive layout
- Mobile-friendly interface
- Optimized for desktop and tablet use

## 🔄 Real-time Features

- Live task updates across team
- Deal pipeline changes broadcast instantly
- Team member online/offline status
- New contact notifications

## 🤖 AI Capabilities

The AI integration uses OpenAI's GPT-3.5-turbo model to provide:

1. **Context-aware suggestions**: Analyzes conversation notes to suggest next steps
2. **Smart prioritization**: Ranks tasks by urgency and importance
3. **Email drafting**: Generates professional follow-up emails
4. **Auto-categorization**: Identifies contact types automatically
5. **Deal insights**: Predicts conversion probability

## 🚧 Future Enhancements (Not Implemented)

These features are planned but not part of the current core release:
- Email integration (Gmail sync)
- Calendar view
- File attachments
- WhatsApp/Slack integration
- Custom fields
- Import/export
- Advanced analytics
- Meeting notes templates

## 📄 License

MIT License - feel free to use this for your startup!

## 👥 Team

Team 4: Krishna & Vaishnavi

## 🆘 Support

For issues or questions:
1. Check the API documentation
2. Review the user guide
3. Check database connection and environment variables
4. Ensure OpenAI API key is valid

## 🎯 Perfect For

- **Startup Founders** managing customer relationships
- **Small Teams** (2-10 people) needing simple CRM
- **Early-stage startups** tracking investor relationships
- **Product teams** managing customer feedback
- **Sales teams** tracking deals and pipeline

---

**Built with ❤️ for founders who need simple, powerful tools.**
