const { pool } = require('../config/database');
const aiService = require('../services/aiService');

// Get all tasks for workspace
const getTasks = async (req, res) => {
  try {
    const workspaceId = req.user.workspace_id;
    const { status, assigned_to, category, priority } = req.query;

    let query = `
      SELECT t.*, 
        u1.name as assigned_to_name,
        u2.name as created_by_name,
        c.name as contact_name
      FROM tasks t
      LEFT JOIN users u1 ON t.assigned_to = u1.id
      LEFT JOIN users u2 ON t.created_by = u2.id
      LEFT JOIN contacts c ON t.contact_id = c.id
      WHERE t.workspace_id = ?
    `;
    const params = [workspaceId];

    if (status) {
      query += ' AND t.status = ?';
      params.push(status);
    }

    if (assigned_to) {
      query += ' AND t.assigned_to = ?';
      params.push(assigned_to);
    }

    if (category) {
      query += ' AND t.category = ?';
      params.push(category);
    }

    if (priority) {
      query += ' AND t.priority = ?';
      params.push(priority);
    }

    query += ' ORDER BY t.due_date ASC, t.priority DESC';

    const [tasks] = await pool.query(query, params);

    res.json({
      success: true,
      data: tasks
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get tasks', 
      error: error.message 
    });
  }
};

// Get my tasks (assigned to current user)
const getMyTasks = async (req, res) => {
  try {
    const userId = req.user.id;
    const workspaceId = req.user.workspace_id;
    const { status } = req.query;

    let query = `
      SELECT t.*, 
        u.name as created_by_name,
        c.name as contact_name
      FROM tasks t
      LEFT JOIN users u ON t.created_by = u.id
      LEFT JOIN contacts c ON t.contact_id = c.id
      WHERE t.workspace_id = ? AND t.assigned_to = ?
    `;
    const params = [workspaceId, userId];

    if (status) {
      query += ' AND t.status = ?';
      params.push(status);
    }

    query += ' ORDER BY t.due_date ASC, t.priority DESC';

    const [tasks] = await pool.query(query, params);

    res.json({
      success: true,
      data: tasks
    });
  } catch (error) {
    console.error('Get my tasks error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get tasks', 
      error: error.message 
    });
  }
};

// Get single task
const getTask = async (req, res) => {
  try {
    const { id } = req.params;
    const workspaceId = req.user.workspace_id;

    const [tasks] = await pool.query(
      `SELECT t.*, 
        u1.name as assigned_to_name,
        u2.name as created_by_name,
        c.name as contact_name
       FROM tasks t
       LEFT JOIN users u1 ON t.assigned_to = u1.id
       LEFT JOIN users u2 ON t.created_by = u2.id
       LEFT JOIN contacts c ON t.contact_id = c.id
       WHERE t.id = ? AND t.workspace_id = ?`,
      [id, workspaceId]
    );

    if (tasks.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Task not found' 
      });
    }

    res.json({
      success: true,
      data: tasks[0]
    });
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get task', 
      error: error.message 
    });
  }
};

// Create new task
const createTask = async (req, res) => {
  try {
    const { title, description, assigned_to, contact_id, category, priority, status, due_date } = req.body;
    const workspaceId = req.user.workspace_id;
    const userId = req.user.id;

    // Validation
    if (!title) {
      return res.status(400).json({ 
        success: false, 
        message: 'Task title is required' 
      });
    }

    // Create task
    const [result] = await pool.query(
      `INSERT INTO tasks (workspace_id, title, description, assigned_to, created_by, contact_id, category, priority, status, due_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [workspaceId, title, description, assigned_to, userId, contact_id, 
       category || 'other', priority || 'medium', status || 'todo', due_date]
    );

    const taskId = result.insertId;

    // Log activity
    await pool.query(
      `INSERT INTO activity_logs (workspace_id, user_id, action_type, entity_type, entity_id, description)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [workspaceId, userId, 'created', 'task', taskId, `Created task: ${title}`]
    );

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: {
        id: taskId,
        title,
        description,
        assigned_to,
        contact_id,
        category: category || 'other',
        priority: priority || 'medium',
        status: status || 'todo',
        due_date
      }
    });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create task', 
      error: error.message 
    });
  }
};

// Update task
const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, assigned_to, contact_id, category, priority, status, due_date } = req.body;
    const workspaceId = req.user.workspace_id;

    // Get current task data for comparison
    const [currentTasks] = await pool.query(
      `SELECT t.*, u.name as assigned_to_name
       FROM tasks t
       LEFT JOIN users u ON t.assigned_to = u.id
       WHERE t.id = ? AND t.workspace_id = ?`,
      [id, workspaceId]
    );

    if (currentTasks.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Task not found' 
      });
    }

    const currentTask = currentTasks[0];
    const oldStatus = currentTask.status;
    const statusChanged = oldStatus !== status;

    // Update task
    const completed_at = status === 'completed' ? new Date() : null;
    
    await pool.query(
      `UPDATE tasks 
       SET title = ?, description = ?, assigned_to = ?, contact_id = ?, 
           category = ?, priority = ?, status = ?, due_date = ?, completed_at = ?
       WHERE id = ?`,
      [title, description, assigned_to, contact_id, category, priority, status, due_date, completed_at, id]
    );

    // If status changed, generate beautified message using AI
    if (statusChanged) {
      try {
        const taskData = {
          title: title || currentTask.title,
          description: description || currentTask.description,
          category: category || currentTask.category,
          priority: priority || currentTask.priority,
          assigned_to_name: currentTask.assigned_to_name
        };

        const updateData = {
          status,
          oldStatus
        };

        const userInfo = {
          name: req.user.name
        };

        // Generate beautified message
        const beautifiedUpdate = await aiService.beautifyTaskStatusMessage(taskData, updateData, userInfo);

        // Store beautified message
        await pool.query(
          `INSERT INTO beautified_status_messages 
           (workspace_id, user_id, task_id, original_status, new_status, beautified_message, summary, priority, category, action_type, metadata)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            workspaceId, 
            req.user.id, 
            id, 
            oldStatus, 
            status, 
            beautifiedUpdate.beautifiedMessage,
            beautifiedUpdate.summary,
            beautifiedUpdate.priority,
            beautifiedUpdate.category,
            beautifiedUpdate.actionType,
            JSON.stringify(beautifiedUpdate)
          ]
        );
      } catch (aiError) {
        console.error('AI beautification error:', aiError);
        // Continue with regular update even if AI fails
      }
    }

    // Log activity
    await pool.query(
      `INSERT INTO activity_logs (workspace_id, user_id, action_type, entity_type, entity_id, description)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [workspaceId, req.user.id, 'updated', 'task', id, `Updated task: ${title}`]
    );

    res.json({
      success: true,
      message: 'Task updated successfully',
      data: {
        id,
        title,
        description,
        assigned_to,
        contact_id,
        category,
        priority,
        status,
        due_date,
        statusChanged
      }
    });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update task', 
      error: error.message 
    });
  }
};

// Delete task
const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const workspaceId = req.user.workspace_id;

    // Check if task exists
    const [tasks] = await pool.query(
      'SELECT title FROM tasks WHERE id = ? AND workspace_id = ?',
      [id, workspaceId]
    );

    if (tasks.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Task not found' 
      });
    }

    // Delete task
    await pool.query('DELETE FROM tasks WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete task', 
      error: error.message 
    });
  }
};

module.exports = {
  getTasks,
  getMyTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask
};
