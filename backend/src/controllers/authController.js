const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');
const crypto = require('crypto');

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// Register new founder and create workspace
const register = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const { name, email, password, workspaceName } = req.body;

    // Validation
    if (!name || !email || !password || !workspaceName) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide all required fields' 
      });
    }

    // Check if user already exists
    const [existingUsers] = await connection.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'User already exists with this email' 
      });
    }

    await connection.beginTransaction();

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user first (without workspace_id)
    const [userResult] = await connection.query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, 'founder']
    );

    const userId = userResult.insertId;

    // Generate unique workspace code
    const generateWorkspaceCode = () => {
      return Math.random().toString(36).substring(2, 8).toUpperCase();
    };

    let workspaceCode;
    let isUnique = false;
    
    // Ensure workspace code is unique
    while (!isUnique) {
      workspaceCode = generateWorkspaceCode();
      const [existingCodes] = await connection.query(
        'SELECT id FROM workspaces WHERE workspace_code = ?',
        [workspaceCode]
      );
      if (existingCodes.length === 0) {
        isUnique = true;
      }
    }

    // Create workspace
    const [workspaceResult] = await connection.query(
      'INSERT INTO workspaces (name, created_by, workspace_code) VALUES (?, ?, ?)',
      [workspaceName, userId, workspaceCode]
    );

    const workspaceId = workspaceResult.insertId;

    // Update user with workspace_id
    await connection.query(
      'UPDATE users SET workspace_id = ? WHERE id = ?',
      [workspaceId, userId]
    );

    await connection.commit();

    // Generate token
    const token = generateToken(userId);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        user: {
          id: userId,
          name,
          email,
          role: 'founder',
          workspace_id: workspaceId
        },
        workspace: {
          id: workspaceId,
          name: workspaceName,
          workspace_code: workspaceCode
        },
        token
      }
    });
  } catch (error) {
    await connection.rollback();
    console.error('Register error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Registration failed', 
      error: error.message 
    });
  } finally {
    connection.release();
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide email and password' 
      });
    }

    // Check if user exists
    const [users] = await pool.query(
      'SELECT * FROM users WHERE email = ? AND is_active = true',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    const user = users[0];

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    // Get workspace info
    let workspace = null;
    if (user.workspace_id) {
      const [workspaces] = await pool.query(
        'SELECT id, name, workspace_code FROM workspaces WHERE id = ?',
        [user.workspace_id]
      );
      workspace = workspaces[0] || null;
    }

    // Generate token
    const token = generateToken(user.id);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          workspace_id: user.workspace_id,
          avatar_url: user.avatar_url
        },
        workspace,
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Login failed', 
      error: error.message 
    });
  }
};

// Get current user
const getMe = async (req, res) => {
  try {
    const [users] = await pool.query(
      'SELECT id, name, email, role, workspace_id, avatar_url, created_at FROM users WHERE id = ?',
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    const user = users[0];

    // Get workspace info
    let workspace = null;
    if (user.workspace_id) {
      const [workspaces] = await pool.query(
        'SELECT id, name, workspace_code, created_by FROM workspaces WHERE id = ?',
        [user.workspace_id]
      );
      workspace = workspaces[0] || null;
    }

    res.json({
      success: true,
      data: {
        user,
        workspace
      }
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get user info', 
      error: error.message 
    });
  }
};

// Invite team member
const inviteTeamMember = async (req, res) => {
  try {
    const { email, role } = req.body;
    const workspaceId = req.user.workspace_id;

    // Only founders can invite
    if (req.user.role !== 'founder') {
      return res.status(403).json({ 
        success: false, 
        message: 'Only founders can invite team members' 
      });
    }

    // Validation
    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email is required' 
      });
    }

    // Check if user already exists in workspace
    const [existingUsers] = await pool.query(
      'SELECT id FROM users WHERE email = ? AND workspace_id = ?',
      [email, workspaceId]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'User already exists in this workspace' 
      });
    }

    // Generate invitation token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // Create invitation
    await pool.query(
      'INSERT INTO invitations (workspace_id, email, role, token, invited_by, expires_at) VALUES (?, ?, ?, ?, ?, ?)',
      [workspaceId, email, role || 'team_member', token, req.user.id, expiresAt]
    );

    // In production, send email with invitation link
    const invitationLink = `${process.env.FRONTEND_URL}/accept-invitation/${token}`;

    res.json({
      success: true,
      message: 'Invitation sent successfully',
      data: {
        email,
        invitationLink,
        expiresAt
      }
    });
  } catch (error) {
    console.error('Invite error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send invitation', 
      error: error.message 
    });
  }
};

// Register team member with workspace code
const registerTeamMember = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const { name, email, password, workspaceCode } = req.body;

    // Validation
    if (!name || !email || !password || !workspaceCode) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide all required fields' 
      });
    }

    // Check if user already exists
    const [existingUsers] = await connection.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'User already exists with this email' 
      });
    }

    // Find workspace by code
    const [workspaces] = await connection.query(
      'SELECT id, name FROM workspaces WHERE workspace_code = ?',
      [workspaceCode.toUpperCase()]
    );

    if (workspaces.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid workspace code' 
      });
    }

    const workspace = workspaces[0];

    await connection.beginTransaction();

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const [userResult] = await connection.query(
      'INSERT INTO users (name, email, password, role, workspace_id) VALUES (?, ?, ?, ?, ?)',
      [name, email, hashedPassword, 'team_member', workspace.id]
    );

    const userId = userResult.insertId;

    await connection.commit();

    // Generate token
    const token = generateToken(userId);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        user: {
          id: userId,
          name,
          email,
          role: 'team_member',
          workspace_id: workspace.id
        },
        workspace: {
          id: workspace.id,
          name: workspace.name
        },
        token
      }
    });
  } catch (error) {
    await connection.rollback();
    console.error('Register team member error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Registration failed', 
      error: error.message 
    });
  } finally {
    connection.release();
  }
};

// Accept invitation
const acceptInvitation = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const { token, name, password } = req.body;

    // Validation
    if (!token || !name || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide all required fields' 
      });
    }

    // Get invitation
    const [invitations] = await connection.query(
      'SELECT * FROM invitations WHERE token = ? AND accepted = false AND expires_at > NOW()',
      [token]
    );

    if (invitations.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid or expired invitation' 
      });
    }

    const invitation = invitations[0];

    await connection.beginTransaction();

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const [userResult] = await connection.query(
      'INSERT INTO users (name, email, password, role, workspace_id) VALUES (?, ?, ?, ?, ?)',
      [name, invitation.email, hashedPassword, invitation.role, invitation.workspace_id]
    );

    const userId = userResult.insertId;

    // Mark invitation as accepted
    await connection.query(
      'UPDATE invitations SET accepted = true WHERE id = ?',
      [invitation.id]
    );

    await connection.commit();

    // Generate token
    const authToken = generateToken(userId);

    res.json({
      success: true,
      message: 'Invitation accepted successfully',
      data: {
        user: {
          id: userId,
          name,
          email: invitation.email,
          role: invitation.role,
          workspace_id: invitation.workspace_id
        },
        token: authToken
      }
    });
  } catch (error) {
    await connection.rollback();
    console.error('Accept invitation error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to accept invitation', 
      error: error.message 
    });
  } finally {
    connection.release();
  }
};

module.exports = {
  register,
  login,
  getMe,
  inviteTeamMember,
  acceptInvitation,
  registerTeamMember
};
