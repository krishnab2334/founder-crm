const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const {
  getFounderDashboard,
  getTeamMemberDashboard,
  getActivityLogs
} = require('../controllers/dashboardController');

// All routes require authentication
router.use(authMiddleware);

router.get('/founder', getFounderDashboard);
router.get('/team-member', getTeamMemberDashboard);
router.get('/activity', getActivityLogs);

module.exports = router;
