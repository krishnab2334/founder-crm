# 📡 Founder CRM - API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

---

## 🔐 Authentication Endpoints

### Register (Create Workspace)
Creates a new founder account and workspace.

**Endpoint:** `POST /auth/register`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@startup.com",
  "password": "securepassword123",
  "workspaceName": "My Startup"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@startup.com",
      "role": "founder",
      "workspace_id": 1
    },
    "workspace": {
      "id": 1,
      "name": "My Startup"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Login
Authenticate existing user.

**Endpoint:** `POST /auth/login`

**Request Body:**
```json
{
  "email": "john@startup.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { /* user object */ },
    "workspace": { /* workspace object */ },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Get Current User
Get authenticated user's information.

**Endpoint:** `GET /auth/me`

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@startup.com",
      "role": "founder",
      "workspace_id": 1
    },
    "workspace": {
      "id": 1,
      "name": "My Startup",
      "created_by": 1
    }
  }
}
```

### Invite Team Member
Invite a new team member to workspace (Founders only).

**Endpoint:** `POST /auth/invite`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "email": "team@startup.com",
  "role": "team_member"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Invitation sent successfully",
  "data": {
    "email": "team@startup.com",
    "invitationLink": "http://localhost:3000/accept-invitation/abc123token",
    "expiresAt": "2024-01-15T12:00:00.000Z"
  }
}
```

### Accept Invitation
Accept workspace invitation.

**Endpoint:** `POST /auth/accept-invitation`

**Request Body:**
```json
{
  "token": "abc123token",
  "name": "Jane Smith",
  "password": "securepassword123"
}
```

---

## 👥 Contact Endpoints

### Get All Contacts
Get all contacts in workspace.

**Endpoint:** `GET /contacts`

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `type` (optional): Filter by type (customer|investor|partner|lead)
- `search` (optional): Search by name, email, or company

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Alice Johnson",
      "email": "alice@company.com",
      "phone": "+1234567890",
      "company": "Tech Corp",
      "type": "customer",
      "status": "active",
      "notes": "Interested in enterprise plan",
      "tags": ["hot-lead", "enterprise"],
      "created_by": 1,
      "created_by_name": "John Doe",
      "created_at": "2024-01-10T10:00:00.000Z"
    }
  ]
}
```

### Get Contact by ID
Get detailed contact information.

**Endpoint:** `GET /contacts/:id`

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Alice Johnson",
    "email": "alice@company.com",
    "tags": ["hot-lead", "enterprise"],
    "interactions": [
      {
        "id": 1,
        "type": "call",
        "subject": "Initial discovery call",
        "notes": "Discussed requirements...",
        "user_name": "John Doe",
        "interaction_date": "2024-01-10T10:00:00.000Z"
      }
    ],
    "tasks": [ /* array of related tasks */ ],
    "deals": [ /* array of related deals */ ]
  }
}
```

### Create Contact
Add new contact.

**Endpoint:** `POST /contacts`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "Alice Johnson",
  "email": "alice@company.com",
  "phone": "+1234567890",
  "company": "Tech Corp",
  "type": "customer",
  "status": "active",
  "notes": "Met at conference",
  "tags": ["hot-lead", "enterprise"]
}
```

### Update Contact
Update existing contact.

**Endpoint:** `PUT /contacts/:id`

**Headers:** `Authorization: Bearer <token>`

**Request Body:** Same as Create Contact

### Delete Contact
Delete a contact.

**Endpoint:** `DELETE /contacts/:id`

**Headers:** `Authorization: Bearer <token>`

### Add Interaction
Add interaction/note to contact.

**Endpoint:** `POST /contacts/:contactId/interactions`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "type": "call",
  "subject": "Follow-up call",
  "notes": "Discussed pricing and timeline. Sending proposal next week.",
  "interaction_date": "2024-01-10T14:00:00.000Z"
}
```

---

## ✅ Task Endpoints

### Get All Tasks
Get all tasks in workspace.

**Endpoint:** `GET /tasks`

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `status`: Filter by status (todo|in_progress|completed|cancelled)
- `priority`: Filter by priority (low|medium|high|urgent)
- `category`: Filter by category (sales|product|operations|fundraising|other)
- `assigned_to`: Filter by assigned user ID

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Follow up with Alice",
      "description": "Send pricing proposal",
      "assigned_to": 1,
      "assigned_to_name": "John Doe",
      "created_by_name": "John Doe",
      "contact_id": 1,
      "contact_name": "Alice Johnson",
      "category": "sales",
      "priority": "high",
      "status": "todo",
      "due_date": "2024-01-15",
      "created_at": "2024-01-10T10:00:00.000Z"
    }
  ]
}
```

### Get My Tasks
Get tasks assigned to current user.

**Endpoint:** `GET /tasks/my-tasks`

**Headers:** `Authorization: Bearer <token>`

### Create Task
Create new task.

**Endpoint:** `POST /tasks`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "title": "Follow up with customer",
  "description": "Send pricing information",
  "assigned_to": 1,
  "contact_id": 1,
  "category": "sales",
  "priority": "high",
  "status": "todo",
  "due_date": "2024-01-15"
}
```

### Update Task
Update existing task.

**Endpoint:** `PUT /tasks/:id`

**Headers:** `Authorization: Bearer <token>`

**Request Body:** Same as Create Task

### Delete Task
Delete a task.

**Endpoint:** `DELETE /tasks/:id`

**Headers:** `Authorization: Bearer <token>`

---

## 💼 Deal Endpoints

### Get All Deals
Get all deals in workspace.

**Endpoint:** `GET /deals`

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `stage`: Filter by stage (lead|qualified|demo|proposal|closed_won|closed_lost)

### Get Pipeline View
Get deals grouped by stage.

**Endpoint:** `GET /deals/pipeline`

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "lead": [ /* array of deals */ ],
    "qualified": [ /* array of deals */ ],
    "demo": [ /* array of deals */ ],
    "proposal": [ /* array of deals */ ],
    "closed_won": [ /* array of deals */ ],
    "closed_lost": [ /* array of deals */ ]
  }
}
```

### Create Deal
Create new deal.

**Endpoint:** `POST /deals`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "contact_id": 1,
  "title": "Enterprise Plan - Q1 2024",
  "description": "Annual enterprise subscription",
  "value": 50000,
  "stage": "qualified",
  "probability": 60,
  "expected_close_date": "2024-03-31",
  "assigned_to": 1
}
```

### Update Deal Stage
Move deal to different stage.

**Endpoint:** `PATCH /deals/:id/stage`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "stage": "demo"
}
```

---

## 📊 Dashboard Endpoints

### Get Founder Dashboard
Get complete dashboard data for founders.

**Endpoint:** `GET /dashboard/founder`

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "todayTasks": [ /* tasks due today */ ],
    "upcomingTasks": [ /* tasks in next 7 days */ ],
    "overdueTasks": [ /* overdue tasks */ ],
    "recentInteractions": [ /* last 10 interactions */ ],
    "pipelineStats": [
      { "stage": "lead", "count": 5, "total_value": 100000 }
    ],
    "teamActivity": [
      { "user_name": "John Doe", "tasks_count": 10, "completed_tasks": 7 }
    ],
    "contactsSummary": [
      { "type": "customer", "count": 15 }
    ],
    "taskStats": [
      { "status": "completed", "count": 25 }
    ]
  }
}
```

### Get Team Member Dashboard
Get dashboard data for team members.

**Endpoint:** `GET /dashboard/team-member`

**Headers:** `Authorization: Bearer <token>`

---

## 🤖 AI Endpoints

### Analyze Contact Note
Analyze interaction note and get AI suggestions.

**Endpoint:** `POST /ai/analyze-note`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "contactId": 1,
  "note": "Had great call with investor. Very interested but wants to see more traction. Asked for metrics deck."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "tasks": [
      {
        "title": "Share metrics deck with investor",
        "description": "Prepare and send current traction metrics",
        "priority": "high",
        "category": "fundraising"
      },
      {
        "title": "Follow up in 1 week",
        "description": "Check if investor has questions",
        "priority": "medium",
        "category": "fundraising"
      }
    ],
    "tags": ["hot-lead", "needs-traction-proof", "investor-interested"],
    "priority": "high",
    "followUpDays": 7,
    "summary": "Investor is interested but needs traction proof. Share metrics and follow up next week."
  }
}
```

### Prioritize Tasks
Get AI-powered task prioritization.

**Endpoint:** `POST /ai/prioritize-tasks`

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "prioritizedOrder": [3, 1, 5, 2, 4],
    "topPriority": [3, 1, 5],
    "reasoning": "Tasks prioritized based on urgency, deadlines, and business impact.",
    "recommendations": "Focus on high-priority sales tasks first, then handle operations."
  }
}
```

### Generate Follow-up Email
Generate email draft for contact.

**Endpoint:** `POST /ai/generate-email`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "contactId": 1,
  "context": "Following up after demo call, they were interested in enterprise plan"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "subject": "Follow-up: Enterprise Plan Discussion",
    "body": "Hi Alice,\n\nThank you for taking the time to join our demo yesterday..."
  }
}
```

### Get AI Suggestions
Get recent AI suggestions.

**Endpoint:** `GET /ai/suggestions`

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `is_applied`: Filter by applied status (true|false)

---

## 🔌 WebSocket Events

Connect to WebSocket server:
```javascript
const socket = io('http://localhost:5000', {
  auth: { token: 'your-jwt-token' }
});
```

### Events to Listen:

**user_online**
```javascript
socket.on('user_online', (data) => {
  // { userId: 2, userName: "Jane Smith" }
});
```

**task_updated**
```javascript
socket.on('task_updated', (data) => {
  // { taskId: 1, updatedBy: "John Doe" }
});
```

**deal_stage_changed**
```javascript
socket.on('deal_stage_changed', (data) => {
  // { dealId: 1, stage: "demo", changedBy: "John Doe" }
});
```

**contact_created**
```javascript
socket.on('contact_created', (data) => {
  // { contactId: 1, createdBy: "John Doe" }
});
```

### Events to Emit:

```javascript
socket.emit('task_updated', { taskId: 1, status: 'completed' });
socket.emit('deal_stage_changed', { dealId: 1, stage: 'demo' });
socket.emit('contact_created', { contactId: 1 });
```

---

## Error Responses

All endpoints return errors in this format:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error (development only)"
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

## Rate Limiting

Currently no rate limiting is implemented. For production, consider adding rate limiting middleware.

## CORS

CORS is enabled for `http://localhost:3000` by default. Update `FRONTEND_URL` in `.env` for production.
