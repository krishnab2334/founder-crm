const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const {
  register,
  login,
  getMe,
  inviteTeamMember,
  acceptInvitation,
  registerTeamMember
} = require('../controllers/authController');

// Public routes
router.post('/register', register);
router.post('/register-team-member', registerTeamMember);
router.post('/login', login);
router.post('/accept-invitation', acceptInvitation);

// Protected routes
router.get('/me', authMiddleware, getMe);
router.post('/invite', authMiddleware, inviteTeamMember);

module.exports = router;
