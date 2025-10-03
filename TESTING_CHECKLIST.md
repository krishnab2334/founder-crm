# ✅ Testing Checklist - Founder CRM

Use this checklist to verify all features are working correctly.

## Pre-Testing Setup

- [ ] MySQL is running
- [ ] Database `founder_crm` created with all tables
- [ ] Backend server running on port 5000
- [ ] Frontend server running on port 3000
- [ ] `.env` file configured in backend
- [ ] OpenAI API key added (optional but recommended)

## 1. Authentication & Registration

### Founder Registration
- [ ] Navigate to http://localhost:3000
- [ ] Click "Register as Founder"
- [ ] Fill in all fields:
  - [ ] Name: Test Founder
  - [ ] Email: founder@test.com
  - [ ] Workspace: Test Startup
  - [ ] Password: test123456
- [ ] Click "Create Workspace"
- [ ] Redirected to Founder Dashboard
- [ ] Dashboard shows welcome message with your name

### Login
- [ ] Logout from account
- [ ] Navigate to login page
- [ ] Enter email and password
- [ ] Click "Login"
- [ ] Successfully redirected to dashboard

### Invalid Login
- [ ] Try logging in with wrong password
- [ ] Error message displayed
- [ ] Not logged in

## 2. Dashboard Features

### Founder Dashboard
- [ ] See stats cards (Tasks, Today's Tasks, Overdue, Pipeline Value)
- [ ] Today's Tasks section visible
- [ ] Pipeline overview showing all stages
- [ ] Click "Quick Add Task" button
- [ ] Modal opens
- [ ] Can add task quickly
- [ ] Task appears in dashboard

### Navigation
- [ ] Click "Contacts" in sidebar
- [ ] Navigates to Contacts page
- [ ] Click "Tasks" in sidebar
- [ ] Navigates to Tasks page
- [ ] Click "Pipeline" in sidebar
- [ ] Navigates to Pipeline page
- [ ] All navigation items work

## 3. Contact Management

### Add Contact
- [ ] Go to Contacts page
- [ ] Click "Add Contact"
- [ ] Modal opens with form
- [ ] Fill in contact details:
  - [ ] Name: John Customer
  - [ ] Email: john@customer.com
  - [ ] Phone: +1234567890
  - [ ] Company: Acme Corp
  - [ ] Type: Customer
  - [ ] Notes: "Met at conference"
- [ ] Add tags: "hot-lead", "enterprise"
- [ ] Click "Add Contact"
- [ ] Success notification appears
- [ ] Contact appears in grid

### Filter Contacts
- [ ] Click "Leads" filter
- [ ] Only leads shown
- [ ] Click "Customers" filter
- [ ] Only customers shown
- [ ] Click "All" filter
- [ ] All contacts shown

### Search Contacts
- [ ] Type contact name in search box
- [ ] Contact filtered in real-time
- [ ] Clear search
- [ ] All contacts shown again

### View Contact Detail
- [ ] Click on a contact card
- [ ] Redirected to contact detail page
- [ ] See contact information
- [ ] See tags
- [ ] See empty interactions list

### Add Interaction
- [ ] On contact detail page
- [ ] Click "Add Interaction"
- [ ] Fill in interaction:
  - [ ] Type: Call
  - [ ] Subject: "Follow-up call"
  - [ ] Notes: "Discussed pricing and next steps"
- [ ] Click "Add Interaction"
- [ ] Interaction appears in timeline
- [ ] Shows your name and timestamp

### AI Analysis of Note (if OpenAI key configured)
- [ ] Add new interaction
- [ ] Enable "🤖 Analyze with AI"
- [ ] Write detailed notes in interaction
- [ ] Click "Add Interaction"
- [ ] AI suggestion notification appears
- [ ] Suggested tasks are offered
- [ ] Accept to create tasks
- [ ] Tasks appear in contact's task list

### Add Task from Contact
- [ ] On contact detail page
- [ ] Click "Add Task"
- [ ] Fill in task details
- [ ] Submit
- [ ] Task appears in "Related Tasks" section

## 4. Task Management

### Create Task
- [ ] Go to Tasks page
- [ ] Click "Add Task"
- [ ] Fill in task details:
  - [ ] Title: "Follow up with customer"
  - [ ] Description: "Send pricing information"
  - [ ] Priority: High
  - [ ] Category: Sales
  - [ ] Due Date: Tomorrow
- [ ] Click "Create Task"
- [ ] Task appears in "To Do" column

### Move Task to In Progress
- [ ] Find task in "To Do" column
- [ ] Click "Start" button
- [ ] Task moves to "In Progress" column
- [ ] Toast notification shown

### Complete Task
- [ ] Find task in "In Progress" column
- [ ] Click "Complete" button
- [ ] Task moves to "Completed" column
- [ ] Completion date shown

### Filter Tasks
- [ ] Use status filter dropdown
- [ ] Select "In Progress"
- [ ] Only in-progress tasks shown
- [ ] Use priority filter
- [ ] Select "High"
- [ ] Only high-priority tasks shown
- [ ] Clear filters
- [ ] All tasks shown

### My Tasks View
- [ ] Click "My Tasks" filter
- [ ] Only tasks assigned to you shown
- [ ] Click "All Tasks"
- [ ] All workspace tasks shown

## 5. Pipeline & Deals

### Create Deal
- [ ] Go to Pipeline page
- [ ] Click "Add Deal"
- [ ] Fill in deal details:
  - [ ] Contact: Select a contact
  - [ ] Title: "Enterprise Plan Q1"
  - [ ] Description: "Annual subscription"
  - [ ] Value: 50000
  - [ ] Stage: Qualified
  - [ ] Probability: 60
  - [ ] Expected Close Date: Next month
- [ ] Click "Create Deal"
- [ ] Deal appears in "Qualified" column

### Move Deal Through Pipeline
- [ ] Find deal in "Qualified" column
- [ ] Click → button
- [ ] Deal moves to "Demo" column
- [ ] Click → button again
- [ ] Deal moves to "Proposal" column
- [ ] Click ← button
- [ ] Deal moves back to "Demo"

### Pipeline Metrics
- [ ] Check total pipeline value at top
- [ ] Verify it matches sum of all deals
- [ ] Check each column's count and value
- [ ] Numbers match visible deals

## 6. Team Management

### Invite Team Member
- [ ] Go to Team page
- [ ] Click "Invite Team Member"
- [ ] Enter email: member@test.com
- [ ] Select role: Team Member
- [ ] Click "Send Invitation"
- [ ] Invitation link displayed
- [ ] Copy invitation link

### Accept Invitation
- [ ] Open invitation link in incognito/private window
- [ ] See invitation acceptance page
- [ ] Fill in:
  - [ ] Name: Team Member
  - [ ] Password: member123
- [ ] Click "Accept Invitation"
- [ ] Success message shown
- [ ] Redirected to login

### Team Member Login
- [ ] Login with member@test.com
- [ ] See Team Member Dashboard (different from founder)
- [ ] Can view contacts
- [ ] Can manage tasks
- [ ] Can work with pipeline
- [ ] Cannot access Team page (founders only)

## 7. AI Features

### AI Task Prioritization (if OpenAI key configured)
- [ ] Login as founder
- [ ] Have 5+ tasks in different priorities
- [ ] Click "🤖 AI Prioritize Tasks" on dashboard
- [ ] AI analyzes tasks
- [ ] Get prioritization suggestion
- [ ] See reasoning for prioritization

### AI Contact Categorization
- [ ] Create new contact
- [ ] Enable "🤖 Use AI to categorize"
- [ ] Add detailed notes about contact
- [ ] Submit
- [ ] AI suggests type and tags
- [ ] Contact created with AI suggestions

## 8. Real-time Features

### WebSocket Connection
- [ ] Login in two different browsers (or incognito)
- [ ] User 1: Update a task
- [ ] User 2: See toast notification about update
- [ ] User 1: Move a deal
- [ ] User 2: See notification about deal move

### Online Status
- [ ] Login in second browser
- [ ] First browser shows "User is online" notification
- [ ] Logout from second browser
- [ ] First browser shows "User is offline"

## 9. Error Handling

### Invalid Input
- [ ] Try creating contact without name
- [ ] Error message shown
- [ ] Try creating task without title
- [ ] Error message shown

### Authentication Required
- [ ] Logout
- [ ] Try to access dashboard directly
- [ ] Redirected to login page
- [ ] Login
- [ ] Can access dashboard

### 404 Handling
- [ ] Try accessing non-existent contact: /contacts/99999
- [ ] Proper error handling
- [ ] Navigate back to contacts

## 10. UI/UX Features

### Responsive Design
- [ ] Resize browser window
- [ ] Layout adjusts properly
- [ ] All features accessible on smaller screens
- [ ] Mobile view works (if testing on mobile)

### Loading States
- [ ] Refresh dashboard
- [ ] See loading spinner while data loads
- [ ] Data appears when loaded

### Empty States
- [ ] New workspace with no data
- [ ] See "No contacts found" message
- [ ] See "No tasks" in columns
- [ ] Empty states are helpful, not blank

### Toast Notifications
- [ ] All actions show notifications:
  - [ ] Task created
  - [ ] Contact added
  - [ ] Deal moved
  - [ ] Errors shown
- [ ] Notifications auto-dismiss
- [ ] Can manually close notifications

## 11. Data Persistence

### Browser Refresh
- [ ] Create a task
- [ ] Refresh browser
- [ ] Task still there
- [ ] Logout and login
- [ ] Task still there

### Cross-Browser
- [ ] Login in Chrome
- [ ] Create contact
- [ ] Logout
- [ ] Login in Firefox (or another browser)
- [ ] Contact is there

## 12. Search & Filter

### Contact Search
- [ ] Add 5+ contacts
- [ ] Search by name
- [ ] Results filter correctly
- [ ] Search by email
- [ ] Results filter correctly
- [ ] Search by company
- [ ] Results filter correctly

### Task Filters
- [ ] Create tasks with different:
  - [ ] Statuses
  - [ ] Priorities
  - [ ] Categories
- [ ] Use filters
- [ ] Each filter works correctly
- [ ] Combine multiple filters
- [ ] Results match criteria

## Performance Checks

### Page Load Speed
- [ ] Dashboard loads in < 2 seconds
- [ ] Contacts page loads in < 2 seconds
- [ ] Tasks page loads in < 2 seconds
- [ ] Pipeline loads in < 2 seconds

### API Response Time
- [ ] Check browser Network tab
- [ ] API calls complete in < 500ms
- [ ] Database queries are efficient

## Security Checks

### Authentication
- [ ] Cannot access dashboard without login
- [ ] Cannot access API without token
- [ ] Logout clears session
- [ ] Expired tokens rejected (wait 7 days or change JWT_EXPIRE)

### Authorization
- [ ] Team member cannot access Team page
- [ ] User cannot see other workspace's data
- [ ] User cannot edit other's workspace data

## Accessibility

### Keyboard Navigation
- [ ] Can tab through forms
- [ ] Can press Enter to submit forms
- [ ] Can Escape to close modals

### Form Validation
- [ ] Required fields marked
- [ ] Email validation works
- [ ] Helpful error messages shown

## Database Integrity

### Check MySQL
```sql
-- Verify data is saving
USE founder_crm;
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM contacts;
SELECT COUNT(*) FROM tasks;
SELECT COUNT(*) FROM deals;

-- Check relationships
SELECT c.name, COUNT(t.id) as task_count 
FROM contacts c 
LEFT JOIN tasks t ON c.id = t.contact_id 
GROUP BY c.id;
```

## Final Checks

- [ ] No console errors in browser
- [ ] No errors in backend terminal
- [ ] All features work as expected
- [ ] Data persists correctly
- [ ] Real-time updates work
- [ ] AI features work (if configured)
- [ ] UI is responsive
- [ ] Notifications work
- [ ] Search and filters work
- [ ] Authentication works
- [ ] Team collaboration works

## Test Results

### Passed: ____ / Total Tests

### Issues Found:
1. _____________________
2. _____________________
3. _____________________

### Notes:
_________________________________
_________________________________
_________________________________

---

**Testing completed on:** _______________

**Tested by:** _______________

**Overall Status:** ☐ Pass  ☐ Fail  ☐ Pass with minor issues
