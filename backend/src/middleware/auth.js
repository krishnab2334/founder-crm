const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');

// Middleware to verify JWT token
const authMiddleware = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'No authentication token, access denied' 
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from database
    const [users] = await pool.query(
      'SELECT id, name, email, role, workspace_id FROM users WHERE id = ? AND is_active = true',
      [decoded.id]
    );

    if (users.length === 0) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not found or inactive' 
      });
    }

    // Attach user to request
    req.user = users[0];
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token' 
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Token expired' 
      });
    }

    res.status(500).json({ 
      success: false, 
      message: 'Authentication failed' 
    });
  }
};

// Middleware to check if user is founder
const isFounder = (req, res, next) => {
  if (req.user.role !== 'founder') {
    return res.status(403).json({ 
      success: false, 
      message: 'Access denied. Founder role required.' 
    });
  }
  next();
};

// Middleware to check if user belongs to workspace
const checkWorkspaceAccess = async (req, res, next) => {
  try {
    const workspaceId = req.params.workspaceId || req.body.workspace_id || req.user.workspace_id;

    if (!workspaceId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Workspace ID required' 
      });
    }

    if (req.user.workspace_id !== parseInt(workspaceId)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. You do not belong to this workspace.' 
      });
    }

    next();
  } catch (error) {
    console.error('Workspace access check error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to verify workspace access' 
    });
  }
};

module.exports = { authMiddleware, isFounder, checkWorkspaceAccess };
