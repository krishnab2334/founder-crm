const aiService = require('../services/aiService');
const { pool } = require('../config/database');

// Analyze contact note
const analyzeContactNote = async (req, res) => {
  try {
    const { contactId, note } = req.body;
    const userId = req.user.id;
    const workspaceId = req.user.workspace_id;

    if (!contactId || !note) {
      return res.status(400).json({ 
        success: false, 
        message: 'Contact ID and note are required' 
      });
    }

    const suggestions = await aiService.analyzeContactNote(contactId, note, userId, workspaceId);

    res.json({
      success: true,
      message: 'Note analyzed successfully',
      data: suggestions
    });
  } catch (error) {
    console.error('Analyze contact note error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to analyze note', 
      error: error.message 
    });
  }
};

// Prioritize tasks
const prioritizeTasks = async (req, res) => {
  try {
    const userId = req.user.id;
    const workspaceId = req.user.workspace_id;

    const suggestions = await aiService.prioritizeTasks(userId, workspaceId);

    res.json({
      success: true,
      message: 'Tasks prioritized successfully',
      data: suggestions
    });
  } catch (error) {
    console.error('Prioritize tasks error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to prioritize tasks', 
      error: error.message 
    });
  }
};

// Generate follow-up email
const generateFollowUpEmail = async (req, res) => {
  try {
    const { contactId, context } = req.body;
    const userId = req.user.id;
    const workspaceId = req.user.workspace_id;

    if (!contactId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Contact ID is required' 
      });
    }

    const email = await aiService.generateFollowUpEmail(contactId, context || '', userId, workspaceId);

    res.json({
      success: true,
      message: 'Email generated successfully',
      data: email
    });
  } catch (error) {
    console.error('Generate email error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to generate email', 
      error: error.message 
    });
  }
};

// Categorize contact
const categorizeContact = async (req, res) => {
  try {
    const contactData = req.body;

    const suggestions = await aiService.categorizeContact(contactData);

    res.json({
      success: true,
      message: 'Contact categorized successfully',
      data: suggestions
    });
  } catch (error) {
    console.error('Categorize contact error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to categorize contact', 
      error: error.message 
    });
  }
};

// Summarize notes
const summarizeNotes = async (req, res) => {
  try {
    const { notes } = req.body;

    if (!notes) {
      return res.status(400).json({ 
        success: false, 
        message: 'Notes are required' 
      });
    }

    const summary = await aiService.summarizeNotes(notes);

    res.json({
      success: true,
      message: 'Notes summarized successfully',
      data: { summary }
    });
  } catch (error) {
    console.error('Summarize notes error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to summarize notes', 
      error: error.message 
    });
  }
};

// Predict deal conversion
const predictDealConversion = async (req, res) => {
  try {
    const { dealId } = req.params;
    const workspaceId = req.user.workspace_id;

    const prediction = await aiService.predictDealConversion(dealId, workspaceId);

    res.json({
      success: true,
      message: 'Deal analyzed successfully',
      data: prediction
    });
  } catch (error) {
    console.error('Predict deal conversion error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to analyze deal', 
      error: error.message 
    });
  }
};

// Get AI suggestions
const getAISuggestions = async (req, res) => {
  try {
    const userId = req.user.id;
    const workspaceId = req.user.workspace_id;
    const { is_applied } = req.query;

    let query = 'SELECT * FROM ai_suggestions WHERE workspace_id = ? AND user_id = ?';
    const params = [workspaceId, userId];

    if (is_applied !== undefined) {
      query += ' AND is_applied = ?';
      params.push(is_applied === 'true');
    }

    query += ' ORDER BY created_at DESC LIMIT 50';

    const [suggestions] = await pool.query(query, params);

    res.json({
      success: true,
      data: suggestions.map(s => ({
        ...s,
        metadata: s.metadata ? JSON.parse(s.metadata) : null
      }))
    });
  } catch (error) {
    console.error('Get AI suggestions error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get suggestions', 
      error: error.message 
    });
  }
};

// Mark suggestion as applied
const markSuggestionApplied = async (req, res) => {
  try {
    const { id } = req.params;
    const workspaceId = req.user.workspace_id;

    await pool.query(
      'UPDATE ai_suggestions SET is_applied = true WHERE id = ? AND workspace_id = ?',
      [id, workspaceId]
    );

    res.json({
      success: true,
      message: 'Suggestion marked as applied'
    });
  } catch (error) {
    console.error('Mark suggestion applied error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update suggestion', 
      error: error.message 
    });
  }
};

module.exports = {
  analyzeContactNote,
  prioritizeTasks,
  generateFollowUpEmail,
  categorizeContact,
  summarizeNotes,
  predictDealConversion,
  getAISuggestions,
  markSuggestionApplied
};
