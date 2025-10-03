const bcrypt = require('bcryptjs');
const { pool } = require('../config/database');

async function createDemoAccount() {
  try {
    console.log('Creating demo account...');

    // Hash the password 'demo123'
    const password = 'demo123';
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create demo workspace
    const workspaceCode = 'DEMO' + Math.random().toString(36).substring(2, 6).toUpperCase();
    
    const [workspaceResult] = await pool.query(
      `INSERT INTO workspaces (name, workspace_code, created_by) 
       VALUES ('Demo Workspace', ?, 1) 
       ON DUPLICATE KEY UPDATE name = 'Demo Workspace'`,
      [workspaceCode]
    );

    let workspaceId = workspaceResult.insertId;
    
    // If workspace already exists, get its ID
    if (workspaceResult.affectedRows === 0 || workspaceId === 0) {
      const [existingWorkspace] = await pool.query(
        'SELECT id FROM workspaces WHERE name = "Demo Workspace" LIMIT 1'
      );
      if (existingWorkspace.length > 0) {
        workspaceId = existingWorkspace[0].id;
      }
    }

    console.log(`Workspace ID: ${workspaceId}`);

    // Create demo team member
    await pool.query(
      `INSERT INTO users (name, email, password, role, workspace_id, is_active)
       VALUES ('Demo Team Member', 'demo@team.com', ?, 'team_member', ?, true)
       ON DUPLICATE KEY UPDATE 
         password = ?,
         role = 'team_member',
         workspace_id = ?,
         is_active = true`,
      [hashedPassword, workspaceId, hashedPassword, workspaceId]
    );

    console.log('✅ Demo account created successfully!');
    console.log('');
    console.log('=================================');
    console.log('Demo Team Member Credentials:');
    console.log('=================================');
    console.log('Email: demo@team.com');
    console.log('Password: demo123');
    console.log('Workspace: Demo Workspace');
    console.log('=================================');
    console.log('');

    // Add some demo data
    await addDemoData(workspaceId);

    process.exit(0);
  } catch (error) {
    console.error('Error creating demo account:', error);
    process.exit(1);
  }
}

async function addDemoData(workspaceId) {
  try {
    // Get demo user ID
    const [demoUser] = await pool.query(
      'SELECT id FROM users WHERE email = "demo@team.com"'
    );
    const demoUserId = demoUser[0]?.id;

    if (!demoUserId) {
      console.log('Demo user not found, skipping demo data');
      return;
    }

    // Add contacts
    await pool.query(
      `INSERT IGNORE INTO contacts (workspace_id, name, email, phone, company, type, created_by) VALUES
       (?, 'John Smith', 'john@acme.com', '555-0101', 'Acme Corp', 'customer', ?),
       (?, 'Sarah Johnson', 'sarah@techstart.io', '555-0102', 'TechStart', 'lead', ?),
       (?, 'Mike Wilson', 'mike@ventures.com', '555-0103', 'Venture Partners', 'investor', ?)`,
      [workspaceId, demoUserId, workspaceId, demoUserId, workspaceId, demoUserId]
    );

    // Add tasks
    await pool.query(
      `INSERT IGNORE INTO tasks (workspace_id, title, description, assigned_to, created_by, category, priority, status, due_date) VALUES
       (?, 'Follow up with Acme Corp', 'Send proposal and pricing details', ?, ?, 'sales', 'high', 'todo', DATE_ADD(CURDATE(), INTERVAL 2 DAY)),
       (?, 'Prepare demo presentation', 'Create slides for TechStart demo', ?, ?, 'product', 'medium', 'in_progress', DATE_ADD(CURDATE(), INTERVAL 5 DAY)),
       (?, 'Review investor deck', 'Update Q4 numbers and metrics', ?, ?, 'fundraising', 'urgent', 'todo', CURDATE())`,
      [workspaceId, demoUserId, demoUserId, workspaceId, demoUserId, demoUserId, workspaceId, demoUserId, demoUserId]
    );

    console.log('✅ Demo data added successfully!');
  } catch (error) {
    console.error('Error adding demo data:', error);
  }
}

createDemoAccount();
