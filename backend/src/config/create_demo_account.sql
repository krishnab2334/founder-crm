-- Create Demo Team Member Account
-- This creates a test team member account for easy testing

USE founder_crm;

-- Create demo founder workspace if it doesn't exist
INSERT IGNORE INTO workspaces (id, name, workspace_code, created_by, created_at)
VALUES (999, 'Demo Workspace', 'DEMO999', 1, NOW());

-- Create demo founder account (if not exists)
INSERT IGNORE INTO users (id, name, email, password, role, workspace_id, created_at)
VALUES (
  999, 
  'Demo Founder', 
  'founder@demo.com',
  -- Password: demo123 (bcrypt hash)
  '$2b$10$YourHashHere',
  'founder',
  999,
  NOW()
);

-- Update workspace created_by to demo founder
UPDATE workspaces SET created_by = 999 WHERE id = 999;

-- Create demo team member account
-- Email: demo@team.com
-- Password: demo123
INSERT INTO users (name, email, password, role, workspace_id, is_active, created_at)
VALUES (
  'Demo Team Member',
  'demo@team.com',
  -- This is bcrypt hash for 'demo123'
  -- You should generate this properly with bcrypt
  '$2b$10$rKZXvE5.RpGxF.J4zKZrr.xQH8F5F5F5F5F5F5F5F5F5F5F5F5',
  'team_member',
  999,
  true,
  NOW()
)
ON DUPLICATE KEY UPDATE
  name = 'Demo Team Member',
  role = 'team_member',
  workspace_id = 999,
  is_active = true;

-- Add some demo contacts for the demo workspace
INSERT INTO contacts (workspace_id, name, email, phone, company, type, created_by, created_at) VALUES
(999, 'John Smith', 'john@acme.com', '555-0101', 'Acme Corp', 'customer', 999, NOW()),
(999, 'Sarah Johnson', 'sarah@techstart.io', '555-0102', 'TechStart', 'lead', 999, NOW()),
(999, 'Mike Wilson', 'mike@ventures.com', '555-0103', 'Venture Partners', 'investor', 999, NOW())
ON DUPLICATE KEY UPDATE name = name;

-- Add some demo tasks
INSERT INTO tasks (workspace_id, title, description, assigned_to, created_by, category, priority, status, due_date, created_at) VALUES
(999, 'Follow up with Acme Corp', 'Send proposal and pricing details', (SELECT id FROM users WHERE email = 'demo@team.com'), 999, 'sales', 'high', 'todo', DATE_ADD(CURDATE(), INTERVAL 2 DAY), NOW()),
(999, 'Prepare demo presentation', 'Create slides for TechStart demo', (SELECT id FROM users WHERE email = 'demo@team.com'), 999, 'product', 'medium', 'in_progress', DATE_ADD(CURDATE(), INTERVAL 5 DAY), NOW()),
(999, 'Review investor deck', 'Update Q4 numbers and metrics', (SELECT id FROM users WHERE email = 'demo@team.com'), 999, 'fundraising', 'urgent', 'todo', CURDATE(), NOW())
ON DUPLICATE KEY UPDATE title = title;

-- Add some demo deals
INSERT INTO deals (workspace_id, contact_id, title, description, value, stage, probability, created_by, created_at) VALUES
(999, (SELECT id FROM contacts WHERE email = 'john@acme.com' LIMIT 1), 'Acme Enterprise Plan', 'Annual enterprise subscription', 50000.00, 'proposal', 75, 999, NOW()),
(999, (SELECT id FROM contacts WHERE email = 'sarah@techstart.io' LIMIT 1), 'TechStart Pro Plan', 'Monthly pro subscription', 5000.00, 'demo', 50, 999, NOW()),
(999, (SELECT id FROM contacts WHERE email = 'mike@ventures.com' LIMIT 1), 'Series A Funding', 'Venture capital round', 1000000.00, 'qualified', 30, 999, NOW())
ON DUPLICATE KEY UPDATE title = title;

-- Success message
SELECT 'Demo account created successfully!' as message,
       'Email: demo@team.com' as email,
       'Password: demo123' as password,
       'Note: Please update the bcrypt password hash properly' as warning;
