const { pool } = require('../config/database');

// Get all deals for workspace
const getDeals = async (req, res) => {
  try {
    const workspaceId = req.user.workspace_id;
    const { stage } = req.query;

    let query = `
      SELECT d.*, 
        c.name as contact_name,
        c.email as contact_email,
        c.company as contact_company,
        u1.name as assigned_to_name,
        u2.name as created_by_name
      FROM deals d
      LEFT JOIN contacts c ON d.contact_id = c.id
      LEFT JOIN users u1 ON d.assigned_to = u1.id
      LEFT JOIN users u2 ON d.created_by = u2.id
      WHERE d.workspace_id = ?
    `;
    const params = [workspaceId];

    if (stage) {
      query += ' AND d.stage = ?';
      params.push(stage);
    }

    query += ' ORDER BY d.created_at DESC';

    const [deals] = await pool.query(query, params);

    res.json({
      success: true,
      data: deals
    });
  } catch (error) {
    console.error('Get deals error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get deals', 
      error: error.message 
    });
  }
};

// Get deals by pipeline stage (for Kanban view)
const getDealsByPipeline = async (req, res) => {
  try {
    const workspaceId = req.user.workspace_id;

    const [deals] = await pool.query(
      `SELECT d.*, 
        c.name as contact_name,
        c.email as contact_email,
        c.company as contact_company,
        u.name as assigned_to_name
       FROM deals d
       LEFT JOIN contacts c ON d.contact_id = c.id
       LEFT JOIN users u ON d.assigned_to = u.id
       WHERE d.workspace_id = ?
       ORDER BY d.created_at DESC`,
      [workspaceId]
    );

    // Group by stage
    const pipeline = {
      lead: [],
      qualified: [],
      demo: [],
      proposal: [],
      closed_won: [],
      closed_lost: []
    };

    deals.forEach(deal => {
      if (pipeline[deal.stage]) {
        pipeline[deal.stage].push(deal);
      }
    });

    res.json({
      success: true,
      data: pipeline
    });
  } catch (error) {
    console.error('Get pipeline error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get pipeline', 
      error: error.message 
    });
  }
};

// Get single deal
const getDeal = async (req, res) => {
  try {
    const { id } = req.params;
    const workspaceId = req.user.workspace_id;

    const [deals] = await pool.query(
      `SELECT d.*, 
        c.name as contact_name,
        c.email as contact_email,
        c.company as contact_company,
        u1.name as assigned_to_name,
        u2.name as created_by_name
       FROM deals d
       LEFT JOIN contacts c ON d.contact_id = c.id
       LEFT JOIN users u1 ON d.assigned_to = u1.id
       LEFT JOIN users u2 ON d.created_by = u2.id
       WHERE d.id = ? AND d.workspace_id = ?`,
      [id, workspaceId]
    );

    if (deals.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Deal not found' 
      });
    }

    res.json({
      success: true,
      data: deals[0]
    });
  } catch (error) {
    console.error('Get deal error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get deal', 
      error: error.message 
    });
  }
};

// Create new deal
const createDeal = async (req, res) => {
  try {
    const { contact_id, title, description, value, stage, probability, expected_close_date, assigned_to } = req.body;
    const workspaceId = req.user.workspace_id;
    const userId = req.user.id;

    // Validation
    if (!contact_id || !title) {
      return res.status(400).json({ 
        success: false, 
        message: 'Contact and title are required' 
      });
    }

    // Check if contact exists
    const [contacts] = await pool.query(
      'SELECT id FROM contacts WHERE id = ? AND workspace_id = ?',
      [contact_id, workspaceId]
    );

    if (contacts.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Contact not found' 
      });
    }

    // Create deal
    const [result] = await pool.query(
      `INSERT INTO deals (workspace_id, contact_id, title, description, value, stage, probability, expected_close_date, created_by, assigned_to)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [workspaceId, contact_id, title, description, value || 0, stage || 'lead', 
       probability || 0, expected_close_date, userId, assigned_to || userId]
    );

    const dealId = result.insertId;

    // Log activity
    await pool.query(
      `INSERT INTO activity_logs (workspace_id, user_id, action_type, entity_type, entity_id, description)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [workspaceId, userId, 'created', 'deal', dealId, `Created deal: ${title}`]
    );

    res.status(201).json({
      success: true,
      message: 'Deal created successfully',
      data: {
        id: dealId,
        contact_id,
        title,
        description,
        value: value || 0,
        stage: stage || 'lead',
        probability: probability || 0,
        expected_close_date,
        assigned_to: assigned_to || userId
      }
    });
  } catch (error) {
    console.error('Create deal error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create deal', 
      error: error.message 
    });
  }
};

// Update deal
const updateDeal = async (req, res) => {
  try {
    const { id } = req.params;
    const { contact_id, title, description, value, stage, probability, expected_close_date, assigned_to } = req.body;
    const workspaceId = req.user.workspace_id;

    // Check if deal exists
    const [deals] = await pool.query(
      'SELECT stage FROM deals WHERE id = ? AND workspace_id = ?',
      [id, workspaceId]
    );

    if (deals.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Deal not found' 
      });
    }

    // Update deal
    const closed_at = (stage === 'closed_won' || stage === 'closed_lost') ? new Date() : null;
    
    await pool.query(
      `UPDATE deals 
       SET contact_id = ?, title = ?, description = ?, value = ?, stage = ?, 
           probability = ?, expected_close_date = ?, assigned_to = ?, closed_at = ?
       WHERE id = ?`,
      [contact_id, title, description, value, stage, probability, expected_close_date, assigned_to, closed_at, id]
    );

    // Log activity
    const oldStage = deals[0].stage;
    let activityDesc = `Updated deal: ${title}`;
    if (oldStage !== stage) {
      activityDesc = `Moved deal "${title}" from ${oldStage} to ${stage}`;
    }

    await pool.query(
      `INSERT INTO activity_logs (workspace_id, user_id, action_type, entity_type, entity_id, description)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [workspaceId, req.user.id, 'updated', 'deal', id, activityDesc]
    );

    res.json({
      success: true,
      message: 'Deal updated successfully',
      data: {
        id,
        contact_id,
        title,
        description,
        value,
        stage,
        probability,
        expected_close_date,
        assigned_to
      }
    });
  } catch (error) {
    console.error('Update deal error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update deal', 
      error: error.message 
    });
  }
};

// Update deal stage (for drag and drop)
const updateDealStage = async (req, res) => {
  try {
    const { id } = req.params;
    const { stage } = req.body;
    const workspaceId = req.user.workspace_id;

    // Validation
    const validStages = ['lead', 'qualified', 'demo', 'proposal', 'closed_won', 'closed_lost'];
    if (!validStages.includes(stage)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid stage' 
      });
    }

    // Check if deal exists
    const [deals] = await pool.query(
      'SELECT title, stage FROM deals WHERE id = ? AND workspace_id = ?',
      [id, workspaceId]
    );

    if (deals.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Deal not found' 
      });
    }

    const closed_at = (stage === 'closed_won' || stage === 'closed_lost') ? new Date() : null;

    // Update stage
    await pool.query(
      'UPDATE deals SET stage = ?, closed_at = ? WHERE id = ?',
      [stage, closed_at, id]
    );

    // Log activity
    await pool.query(
      `INSERT INTO activity_logs (workspace_id, user_id, action_type, entity_type, entity_id, description)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [workspaceId, req.user.id, 'stage_changed', 'deal', id, 
       `Moved deal "${deals[0].title}" from ${deals[0].stage} to ${stage}`]
    );

    res.json({
      success: true,
      message: 'Deal stage updated successfully',
      data: {
        id,
        stage
      }
    });
  } catch (error) {
    console.error('Update deal stage error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update deal stage', 
      error: error.message 
    });
  }
};

// Delete deal
const deleteDeal = async (req, res) => {
  try {
    const { id } = req.params;
    const workspaceId = req.user.workspace_id;

    // Check if deal exists
    const [deals] = await pool.query(
      'SELECT title FROM deals WHERE id = ? AND workspace_id = ?',
      [id, workspaceId]
    );

    if (deals.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Deal not found' 
      });
    }

    // Delete deal
    await pool.query('DELETE FROM deals WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Deal deleted successfully'
    });
  } catch (error) {
    console.error('Delete deal error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete deal', 
      error: error.message 
    });
  }
};

module.exports = {
  getDeals,
  getDealsByPipeline,
  getDeal,
  createDeal,
  updateDeal,
  updateDealStage,
  deleteDeal
};
