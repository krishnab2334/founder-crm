const { pool } = require('../config/database');

// Get dashboard data for founder
const getFounderDashboard = async (req, res) => {
  try {
    const workspaceId = req.user.workspace_id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get today's tasks
    const [todayTasks] = await pool.query(
      `SELECT t.*, u.name as assigned_to_name, c.name as contact_name,
              t.beautified_status_message, t.last_status_update
       FROM tasks t
       LEFT JOIN users u ON t.assigned_to = u.id
       LEFT JOIN contacts c ON t.contact_id = c.id
       WHERE t.workspace_id = ? AND DATE(t.due_date) = DATE(?)
       ORDER BY t.priority DESC`,
      [workspaceId, today]
    );

    // Get upcoming tasks (next 7 days)
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    const [upcomingTasks] = await pool.query(
      `SELECT t.*, u.name as assigned_to_name, c.name as contact_name,
              t.beautified_status_message, t.last_status_update
       FROM tasks t
       LEFT JOIN users u ON t.assigned_to = u.id
       LEFT JOIN contacts c ON t.contact_id = c.id
       WHERE t.workspace_id = ? AND t.due_date > ? AND t.due_date <= ? AND t.status != 'completed'
       ORDER BY t.due_date ASC`,
      [workspaceId, today, nextWeek]
    );

    // Get overdue tasks
    const [overdueTasks] = await pool.query(
      `SELECT t.*, u.name as assigned_to_name, c.name as contact_name,
              t.beautified_status_message, t.last_status_update
       FROM tasks t
       LEFT JOIN users u ON t.assigned_to = u.id
       LEFT JOIN contacts c ON t.contact_id = c.id
       WHERE t.workspace_id = ? AND t.due_date < ? AND t.status != 'completed'
       ORDER BY t.due_date ASC`,
      [workspaceId, today]
    );

    // Get recent interactions (last 7 days)
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);

    const [recentInteractions] = await pool.query(
      `SELECT i.*, c.name as contact_name, u.name as user_name
       FROM interactions i
       LEFT JOIN contacts c ON i.contact_id = c.id
       LEFT JOIN users u ON i.user_id = u.id
       WHERE c.workspace_id = ? AND i.interaction_date >= ?
       ORDER BY i.interaction_date DESC
       LIMIT 10`,
      [workspaceId, lastWeek]
    );

    // Get pipeline overview
    const [pipelineStats] = await pool.query(
      `SELECT 
        stage,
        COUNT(*) as count,
        SUM(value) as total_value
       FROM deals
       WHERE workspace_id = ?
       GROUP BY stage`,
      [workspaceId]
    );

    // Get team activity
    const [teamActivity] = await pool.query(
      `SELECT 
        u.name as user_name,
        COUNT(DISTINCT t.id) as tasks_count,
        COUNT(DISTINCT CASE WHEN t.status = 'completed' THEN t.id END) as completed_tasks
       FROM users u
       LEFT JOIN tasks t ON t.assigned_to = u.id AND t.workspace_id = ?
       WHERE u.workspace_id = ?
       GROUP BY u.id`,
      [workspaceId, workspaceId]
    );

    // Get contacts summary
    const [contactsSummary] = await pool.query(
      `SELECT 
        type,
        COUNT(*) as count
       FROM contacts
       WHERE workspace_id = ?
       GROUP BY type`,
      [workspaceId]
    );

    // Get task statistics
    const [taskStats] = await pool.query(
      `SELECT 
        status,
        COUNT(*) as count
       FROM tasks
       WHERE workspace_id = ?
       GROUP BY status`,
      [workspaceId]
    );

    // Get recent activity logs
    const [activityLogs] = await pool.query(
      `SELECT a.*, u.name as user_name
       FROM activity_logs a
       LEFT JOIN users u ON a.user_id = u.id
       WHERE a.workspace_id = ?
       ORDER BY a.created_at DESC
       LIMIT 20`,
      [workspaceId]
    );

    res.json({
      success: true,
      data: {
        todayTasks,
        upcomingTasks,
        overdueTasks,
        recentInteractions,
        pipelineStats,
        teamActivity,
        contactsSummary,
        taskStats,
        activityLogs
      }
    });
  } catch (error) {
    console.error('Get founder dashboard error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get dashboard data', 
      error: error.message 
    });
  }
};

// Get dashboard data for team member
const getTeamMemberDashboard = async (req, res) => {
  try {
    const userId = req.user.id;
    const workspaceId = req.user.workspace_id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get my today's tasks
    const [todayTasks] = await pool.query(
      `SELECT t.*, c.name as contact_name
       FROM tasks t
       LEFT JOIN contacts c ON t.contact_id = c.id
       WHERE t.workspace_id = ? AND t.assigned_to = ? AND DATE(t.due_date) = DATE(?)
       ORDER BY t.priority DESC`,
      [workspaceId, userId, today]
    );

    // Get my upcoming tasks (next 7 days)
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    const [upcomingTasks] = await pool.query(
      `SELECT t.*, c.name as contact_name
       FROM tasks t
       LEFT JOIN contacts c ON t.contact_id = c.id
       WHERE t.workspace_id = ? AND t.assigned_to = ? AND t.due_date > ? AND t.due_date <= ? AND t.status != 'completed'
       ORDER BY t.due_date ASC`,
      [workspaceId, userId, today, nextWeek]
    );

    // Get my overdue tasks
    const [overdueTasks] = await pool.query(
      `SELECT t.*, c.name as contact_name
       FROM tasks t
       LEFT JOIN contacts c ON t.contact_id = c.id
       WHERE t.workspace_id = ? AND t.assigned_to = ? AND t.due_date < ? AND t.status != 'completed'
       ORDER BY t.due_date ASC`,
      [workspaceId, userId, today]
    );

    // Get my recent interactions
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);

    const [recentInteractions] = await pool.query(
      `SELECT i.*, c.name as contact_name
       FROM interactions i
       LEFT JOIN contacts c ON i.contact_id = c.id
       WHERE c.workspace_id = ? AND i.user_id = ? AND i.interaction_date >= ?
       ORDER BY i.interaction_date DESC
       LIMIT 10`,
      [workspaceId, userId, lastWeek]
    );

    // Get my deals
    const [myDeals] = await pool.query(
      `SELECT d.*, c.name as contact_name
       FROM deals d
       LEFT JOIN contacts c ON d.contact_id = c.id
       WHERE d.workspace_id = ? AND d.assigned_to = ?
       ORDER BY d.created_at DESC`,
      [workspaceId, userId]
    );

    // Get my task statistics
    const [taskStats] = await pool.query(
      `SELECT 
        status,
        COUNT(*) as count
       FROM tasks
       WHERE workspace_id = ? AND assigned_to = ?
       GROUP BY status`,
      [workspaceId, userId]
    );

    // Get recent activity (team-wide)
    const [activityLogs] = await pool.query(
      `SELECT a.*, u.name as user_name
       FROM activity_logs a
       LEFT JOIN users u ON a.user_id = u.id
       WHERE a.workspace_id = ?
       ORDER BY a.created_at DESC
       LIMIT 10`,
      [workspaceId]
    );

    res.json({
      success: true,
      data: {
        todayTasks,
        upcomingTasks,
        overdueTasks,
        recentInteractions,
        myDeals,
        taskStats,
        activityLogs
      }
    });
  } catch (error) {
    console.error('Get team member dashboard error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get dashboard data', 
      error: error.message 
    });
  }
};

// Get activity logs
const getActivityLogs = async (req, res) => {
  try {
    const workspaceId = req.user.workspace_id;
    const { limit = 50 } = req.query;

    const [activityLogs] = await pool.query(
      `SELECT a.*, u.name as user_name
       FROM activity_logs a
       LEFT JOIN users u ON a.user_id = u.id
       WHERE a.workspace_id = ?
       ORDER BY a.created_at DESC
       LIMIT ?`,
      [workspaceId, parseInt(limit)]
    );

    res.json({
      success: true,
      data: activityLogs
    });
  } catch (error) {
    console.error('Get activity logs error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get activity logs', 
      error: error.message 
    });
  }
};

module.exports = {
  getFounderDashboard,
  getTeamMemberDashboard,
  getActivityLogs
};
