# 📁 Founder CRM - Project Structure

Complete overview of the project architecture and file organization.

## Directory Tree

```
founder-crm/
├── backend/                          # Node.js/Express API Server
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js          # MySQL connection & pool setup
│   │   │   └── database.sql         # Database schema & tables
│   │   ├── controllers/
│   │   │   ├── authController.js    # Authentication logic
│   │   │   ├── contactController.js # Contact CRUD operations
│   │   │   ├── taskController.js    # Task management
│   │   │   ├── dealController.js    # Pipeline/deal management
│   │   │   ├── dashboardController.js # Dashboard data aggregation
│   │   │   └── aiController.js      # AI feature endpoints
│   │   ├── middleware/
│   │   │   └── auth.js              # JWT verification & role checks
│   │   ├── routes/
│   │   │   ├── auth.js              # Auth routes
│   │   │   ├── contacts.js          # Contact routes
│   │   │   ├── tasks.js             # Task routes
│   │   │   ├── deals.js             # Deal routes
│   │   │   ├── dashboard.js         # Dashboard routes
│   │   │   └── ai.js                # AI routes
│   │   ├── services/
│   │   │   └── aiService.js         # OpenAI integration & prompts
│   │   ├── utils/
│   │   │   └── websocket.js         # Socket.io setup & events
│   │   └── server.js                # Express app entry point
│   ├── package.json                 # Backend dependencies
│   ├── .env.example                 # Environment variables template
│   └── .gitignore
│
├── frontend/                         # React (Vite) Application
│   ├── public/
│   │   └── (static assets)
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout.jsx           # Main layout with sidebar
│   │   │   └── PrivateRoute.jsx     # Protected route wrapper
│   │   ├── contexts/
│   │   │   ├── AuthContext.jsx      # Auth state & functions
│   │   │   └── WebSocketContext.jsx # WebSocket connection
│   │   ├── pages/
│   │   │   ├── Login.jsx            # Login page
│   │   │   ├── Register.jsx         # Registration page
│   │   │   ├── AcceptInvitation.jsx # Team invitation acceptance
│   │   │   ├── FounderDashboard.jsx # Founder dashboard
│   │   │   ├── TeamMemberDashboard.jsx # Team member dashboard
│   │   │   ├── Contacts.jsx         # Contact list & creation
│   │   │   ├── ContactDetail.jsx    # Single contact view
│   │   │   ├── Tasks.jsx            # Task board
│   │   │   ├── Pipeline.jsx         # Deal pipeline
│   │   │   └── TeamManagement.jsx   # Team invitations
│   │   ├── services/
│   │   │   └── api.js               # Axios API calls
│   │   ├── styles/
│   │   │   └── index.css            # Global styles
│   │   ├── App.jsx                  # Root component & routing
│   │   └── main.jsx                 # React entry point
│   ├── index.html                   # HTML template
│   ├── vite.config.js               # Vite configuration
│   ├── package.json                 # Frontend dependencies
│   └── .gitignore
│
├── README.md                         # Project overview & features
├── SETUP_GUIDE.md                    # Installation instructions
├── USER_GUIDE.md                     # End-user documentation
├── API_DOCUMENTATION.md              # API endpoint reference
└── PROJECT_STRUCTURE.md              # This file
```

## Backend Architecture

### Layer Structure

```
Request Flow:
Client → Express Routes → Middleware → Controllers → Services → Database
                                                    ↓
                                            AI Services (OpenAI)
```

### Component Responsibilities

#### 1. **server.js**
- Express app initialization
- Middleware setup (CORS, body-parser)
- Route registration
- WebSocket initialization
- Error handling
- Server startup

#### 2. **Routes** (`/routes`)
- Define API endpoints
- Apply middleware (authentication, validation)
- Map URLs to controller functions
- Group related endpoints

**Example:**
```javascript
// routes/contacts.js
router.get('/', getContacts);           // GET /api/contacts
router.post('/', createContact);        // POST /api/contacts
router.get('/:id', getContact);         // GET /api/contacts/:id
```

#### 3. **Controllers** (`/controllers`)
- Handle HTTP requests/responses
- Input validation
- Call service/database functions
- Format responses
- Error handling

**Responsibilities:**
- Parse request data
- Validate inputs
- Execute business logic
- Return JSON responses

#### 4. **Middleware** (`/middleware`)
- **auth.js**: JWT token verification
- **authMiddleware**: Verifies user is logged in
- **isFounder**: Checks founder role
- **checkWorkspaceAccess**: Ensures user belongs to workspace

#### 5. **Services** (`/services`)
- **aiService.js**: OpenAI integration
  - Analyze contact notes
  - Prioritize tasks
  - Generate emails
  - Categorize contacts
  - Predict deal conversion

**Service Functions:**
- `analyzeContactNote()`
- `prioritizeTasks()`
- `generateFollowUpEmail()`
- `categorizeContact()`
- `summarizeNotes()`
- `predictDealConversion()`

#### 6. **Config** (`/config`)
- **database.js**: MySQL connection pool
- **database.sql**: Schema definitions

#### 7. **Utils** (`/utils`)
- **websocket.js**: Socket.io server
  - Real-time event broadcasting
  - User authentication
  - Room management

### Database Schema

**Core Tables:**
1. **users**: User accounts
2. **workspaces**: Company/team workspaces
3. **contacts**: CRM contacts
4. **contact_tags**: Contact tags (many-to-many)
5. **interactions**: Contact interaction history
6. **tasks**: Task management
7. **deals**: Sales pipeline
8. **invitations**: Team invitations
9. **activity_logs**: Audit trail
10. **ai_suggestions**: AI-generated suggestions

**Relationships:**
```
workspaces (1) ─── (many) users
workspaces (1) ─── (many) contacts
workspaces (1) ─── (many) tasks
workspaces (1) ─── (many) deals

contacts (1) ─── (many) interactions
contacts (1) ─── (many) tasks
contacts (1) ─── (many) deals
contacts (1) ─── (many) contact_tags

users (1) ─── (many) tasks (assigned_to)
users (1) ─── (many) deals (assigned_to)
```

## Frontend Architecture

### Component Hierarchy

```
App.jsx
├── AuthProvider
│   ├── WebSocketProvider
│   │   ├── Login
│   │   ├── Register
│   │   ├── AcceptInvitation
│   │   └── PrivateRoute
│   │       └── Layout
│   │           ├── FounderDashboard
│   │           ├── TeamMemberDashboard
│   │           ├── Contacts
│   │           ├── ContactDetail
│   │           ├── Tasks
│   │           ├── Pipeline
│   │           └── TeamManagement
└── ToastContainer
```

### State Management

#### Context API Usage

**AuthContext:**
- User authentication state
- Login/logout functions
- User profile data
- Workspace information
- Token management

**WebSocketContext:**
- Socket.io connection
- Real-time event listeners
- Emit helper functions
- Connection status

### Page Components

#### 1. **Authentication Pages**
- `Login.jsx`: User login form
- `Register.jsx`: Founder registration
- `AcceptInvitation.jsx`: Team member signup

#### 2. **Dashboard Pages**
- `FounderDashboard.jsx`: Complete workspace view
  - Stats cards
  - Today's tasks
  - Overdue tasks
  - Pipeline overview
  - Recent interactions
  - Team activity
- `TeamMemberDashboard.jsx`: Personal view
  - Personal stats
  - My tasks
  - My deals
  - My interactions

#### 3. **Feature Pages**
- `Contacts.jsx`: Contact list with filters
- `ContactDetail.jsx`: Single contact view
  - Contact info
  - Interactions timeline
  - Related tasks
  - Related deals
- `Tasks.jsx`: Kanban task board
- `Pipeline.jsx`: Deal pipeline board
- `TeamManagement.jsx`: Team invitations

### Shared Components

#### Layout.jsx
- Sidebar navigation
- User profile display
- Workspace info
- Logout functionality
- Role-based menu items

#### PrivateRoute.jsx
- Authentication check
- Redirect to login if not authenticated
- Loading state while checking auth

### Service Layer

**api.js**: Centralized API calls
```javascript
contactsAPI.getAll()
contactsAPI.create()
tasksAPI.getMyTasks()
dealsAPI.getPipeline()
dashboardAPI.getFounderDashboard()
aiAPI.analyzeNote()
```

### Styling Approach

**CSS Architecture:**
- Single global stylesheet (`index.css`)
- CSS Variables for theming
- BEM-inspired class naming
- Responsive design with media queries
- Component-scoped styles

**Color Scheme:**
- Primary: `#6366f1` (Indigo)
- Success: `#10b981` (Green)
- Danger: `#ef4444` (Red)
- Warning: `#f59e0b` (Amber)
- Info: `#3b82f6` (Blue)

## API Integration

### Request Flow

```
Frontend Component
    ↓
API Service (api.js)
    ↓
Axios HTTP Request
    ↓
Backend Route
    ↓
Middleware (Auth)
    ↓
Controller
    ↓
Database/Service
    ↓
Response to Frontend
    ↓
Update Component State
```

### Authentication Flow

1. User logs in → Receive JWT token
2. Store token in `localStorage`
3. Set token in Axios default headers
4. All subsequent requests include token
5. Backend middleware verifies token
6. Grant/deny access based on verification

### WebSocket Flow

```
Frontend:
1. Connect with JWT token
2. Join workspace room
3. Listen for events

Backend:
1. Verify JWT on connection
2. Add socket to workspace room
3. Broadcast events to room

Real-time Updates:
- Task updated → All workspace users notified
- Deal moved → Pipeline updates for everyone
- Contact added → Team sees new contact
```

## Key Features Implementation

### 1. Contact Management
**Files:**
- Backend: `contactController.js`, `routes/contacts.js`
- Frontend: `Contacts.jsx`, `ContactDetail.jsx`
- Database: `contacts`, `contact_tags`, `interactions`

**Flow:**
1. User adds contact via form
2. POST request to `/api/contacts`
3. Controller validates data
4. Insert into `contacts` table
5. Insert tags into `contact_tags`
6. Log activity
7. Return created contact
8. Frontend updates state

### 2. Task Management
**Files:**
- Backend: `taskController.js`, `routes/tasks.js`
- Frontend: `Tasks.jsx`
- Database: `tasks`

**Features:**
- Kanban board (3 columns)
- Filters (status, priority, category)
- Assignment to users
- Contact linking
- Due dates

### 3. Pipeline/Deals
**Files:**
- Backend: `dealController.js`, `routes/deals.js`
- Frontend: `Pipeline.jsx`
- Database: `deals`

**Features:**
- 6-stage pipeline
- Drag & drop (via buttons)
- Value tracking
- Probability scoring
- Expected close dates

### 4. AI Integration
**Files:**
- Backend: `aiService.js`, `aiController.js`
- Frontend: All pages with AI features
- OpenAI API: GPT-3.5-turbo

**Features:**
- Note analysis with task suggestions
- Task prioritization
- Email generation
- Contact categorization
- Deal prediction

### 5. Real-time Updates
**Files:**
- Backend: `utils/websocket.js`
- Frontend: `WebSocketContext.jsx`
- Socket.io

**Events:**
- `user_online` / `user_offline`
- `task_updated`
- `deal_stage_changed`
- `contact_created`
- `interaction_added`

## Environment Configuration

### Backend (.env)
```env
PORT=5000
NODE_ENV=development
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=password
DB_NAME=founder_crm
JWT_SECRET=secret_key
OPENAI_API_KEY=sk-...
FRONTEND_URL=http://localhost:3000
```

### Frontend (vite.config.js)
```javascript
server: {
  port: 3000,
  proxy: {
    '/api': 'http://localhost:5000'
  }
}
```

## Security Measures

1. **JWT Authentication**: Secure token-based auth
2. **Password Hashing**: bcrypt with salt
3. **Workspace Isolation**: Users only see their workspace data
4. **Role-Based Access**: Founder vs Team Member permissions
5. **Input Validation**: Server-side validation
6. **CORS Configuration**: Restricted origins
7. **SQL Injection Prevention**: Parameterized queries

## Performance Optimizations

1. **Database Indexing**: Key columns indexed
2. **Connection Pooling**: MySQL connection pool
3. **Lazy Loading**: Pages load on demand
4. **Code Splitting**: Vite handles automatically
5. **Caching**: Browser caches static assets
6. **Efficient Queries**: JOIN operations minimized

## Deployment Considerations

### Backend
- Set `NODE_ENV=production`
- Use process manager (PM2)
- Enable HTTPS
- Configure firewall
- Set up database backups
- Monitor logs

### Frontend
- Build production bundle (`npm run build`)
- Serve via Nginx/Apache
- Enable gzip compression
- Use CDN for static assets
- Configure caching headers

### Database
- Set up regular backups
- Enable binary logging
- Configure replication (if needed)
- Optimize queries
- Monitor performance

## Testing Strategy

### Backend
- Unit tests for services
- Integration tests for routes
- Database connection tests
- Middleware tests

### Frontend
- Component tests
- Integration tests
- E2E tests with Cypress
- API mock tests

## Future Enhancements

Potential additions (not implemented):
- Email integration
- Calendar sync
- File uploads
- Advanced analytics
- Custom fields
- Bulk operations
- Mobile app
- Slack/Teams integration

---

**This structure provides a solid foundation for a production-ready CRM system.**
