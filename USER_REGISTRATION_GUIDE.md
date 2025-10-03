# User Registration & Dashboard Guide

## Registration Options

### Option 1: Register as Founder (Create New Workspace)
**URL:** `/register`

**Use when:** You want to create a new workspace for your company/team

**Steps:**
1. Visit the registration page
2. Enter your details:
   - Your Name
   - Email Address
   - Workspace Name (e.g., "Acme Startup")
   - Password
   - Confirm Password
3. Click "Create Workspace"
4. You'll be logged in as a Founder with full access

**What you get:**
- Your own workspace
- Founder role with all permissions
- Access to Team Management
- Full dashboard with team overview

---

### Option 2: Join as Team Member (Join Existing Workspace)
**URL:** `/register-team-member`

**Use when:** You want to join an existing workspace

**Steps:**
1. Get the Workspace Code from your founder/admin
2. Visit the team member registration page
3. Enter your details:
   - Your Name
   - Email Address
   - **Workspace Code** (provided by your founder)
   - Password
   - Confirm Password
4. Click "Join Workspace"
5. You'll be logged in as a Team Member

**What you get:**
- Access to your team's workspace
- Team Member role
- Personal dashboard focused on your tasks
- Ability to manage contacts, tasks, and deals

---

### Option 3: Accept Team Invitation (Email Invitation)
**URL:** `/accept-invitation/:token`

**Use when:** You received an email invitation from a founder

**Steps:**
1. Click the invitation link from your email
2. Enter your details:
   - Your Name
   - Password
   - Confirm Password
3. Click "Accept Invitation"
4. Your account is created with the email from the invitation

---

## How to Get Workspace Code (For Founders)

If you're a founder and need to share your workspace code with team members:

1. Log in to your account
2. Go to **Team Management** (sidebar navigation)
3. At the top of the page, you'll see a **"Workspace Code"** section
4. Your Workspace ID is displayed prominently
5. Click **"Copy Code"** button
6. Share this code with your team members via email, Slack, etc.

**Example:**
```
Workspace ID: 1
```

---

## Dashboard Features by Role

### 👑 Founder Dashboard

**Header Actions:**
- 🤖 AI Prioritize Tasks
- 👥 Manage Team
- ➕ Quick Add Task

**Visible Information:**
- ✅ **Team-wide task statistics** - See all tasks across the team
- 📊 **Pipeline Overview** - All deals with stages and values
- 👥 **Team Activity** - Performance of all team members
- 📝 **All Interactions** - Workspace-wide contact interactions
- ⚠️ **Overdue Tasks** - All overdue tasks (not just yours)
- 📈 **Contacts Summary** - All workspace contacts

**Purpose:** High-level overview to manage the entire team and business

---

### 👤 Team Member Dashboard

**Header Actions:**
- ➕ Quick Add Task

**Visible Information:**
- ✅ **My Task Statistics** - Only tasks assigned to you
- 💼 **My Deals** - Deals assigned to you
- 📝 **My Interactions** - Your contact interactions
- ⏰ **My Schedule** - Your personal task timeline
- ☑️ **Quick Checkboxes** - Complete tasks with one click

**Purpose:** Focused view on personal productivity and responsibilities

---

## Quick Comparison

| Feature | Founder | Team Member |
|---------|---------|-------------|
| Create Workspace | ✅ Yes | ❌ No |
| Join Workspace | ✅ Yes | ✅ Yes |
| See All Tasks | ✅ Yes | ❌ No (only assigned tasks) |
| Team Management Access | ✅ Yes | ❌ No |
| Invite Team Members | ✅ Yes | ❌ No |
| AI Features | ✅ Yes | ✅ Yes |
| Manage Contacts | ✅ Yes | ✅ Yes |
| Create Tasks | ✅ Yes | ✅ Yes |
| Pipeline Access | ✅ Yes (all deals) | ✅ Yes (assigned deals) |

---

## Login Flow

**For All Users:** `/login`

1. Enter your email and password
2. Click "Login"
3. You'll be automatically directed to the appropriate dashboard based on your role:
   - **Founders** → Founder Dashboard
   - **Team Members** → Team Member Dashboard

**Don't have an account yet?**
- "Register as Founder" - Create a new workspace
- "Join as Team Member" - Join an existing workspace

---

## Tips

### For Founders:
- Share your workspace code securely (e.g., via internal communication channels)
- Use the Team Management page to track invitations
- Both invitation system and workspace code registration work simultaneously
- Consider which method is best for your team (invitations are more controlled)

### For Team Members:
- Make sure you have the correct workspace code before registering
- If you don't have a workspace code, ask your founder to send an invitation instead
- Your dashboard shows only your tasks - this helps you stay focused
- You can still see all workspace contacts and create new tasks/deals

### For Everyone:
- Keep your password secure
- Your role determines what you see in the dashboard
- All users can access Contacts, Tasks, and Pipeline pages
- Data filtering happens automatically based on your role

---

## Troubleshooting

**"Invalid workspace code" error:**
- Double-check the code with your founder
- Make sure you're entering just the number (e.g., "1" not "Workspace 1")

**"User already exists with this email":**
- You may have already registered
- Try logging in instead
- Contact your founder if you need to reset your password

**Can't see team management:**
- This is only available to founders
- Team members don't have access to this feature

**See different dashboard than expected:**
- Dashboard is based on your role
- If you need founder access, contact your workspace founder
- Role changes must be made by the workspace administrator
