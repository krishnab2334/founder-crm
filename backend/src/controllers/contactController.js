const { pool } = require('../config/database');

// Get all contacts for workspace
const getContacts = async (req, res) => {
  try {
    const workspaceId = req.user.workspace_id;
    const { type, search } = req.query;

    let query = `
      SELECT c.*, u.name as created_by_name,
        GROUP_CONCAT(DISTINCT ct.tag) as tags
      FROM contacts c
      LEFT JOIN users u ON c.created_by = u.id
      LEFT JOIN contact_tags ct ON c.id = ct.contact_id
      WHERE c.workspace_id = ?
    `;
    const params = [workspaceId];

    if (type) {
      query += ' AND c.type = ?';
      params.push(type);
    }

    if (search) {
      query += ' AND (c.name LIKE ? OR c.email LIKE ? OR c.company LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ' GROUP BY c.id ORDER BY c.created_at DESC';

    const [contacts] = await pool.query(query, params);

    // Parse tags
    const formattedContacts = contacts.map(contact => ({
      ...contact,
      tags: contact.tags ? contact.tags.split(',') : []
    }));

    res.json({
      success: true,
      data: formattedContacts
    });
  } catch (error) {
    console.error('Get contacts error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get contacts', 
      error: error.message 
    });
  }
};

// Get single contact by ID
const getContact = async (req, res) => {
  try {
    const { id } = req.params;
    const workspaceId = req.user.workspace_id;

    const [contacts] = await pool.query(
      `SELECT c.*, u.name as created_by_name
       FROM contacts c
       LEFT JOIN users u ON c.created_by = u.id
       WHERE c.id = ? AND c.workspace_id = ?`,
      [id, workspaceId]
    );

    if (contacts.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Contact not found' 
      });
    }

    // Get tags
    const [tags] = await pool.query(
      'SELECT tag FROM contact_tags WHERE contact_id = ?',
      [id]
    );

    // Get interactions
    const [interactions] = await pool.query(
      `SELECT i.*, u.name as user_name
       FROM interactions i
       LEFT JOIN users u ON i.user_id = u.id
       WHERE i.contact_id = ?
       ORDER BY i.interaction_date DESC`,
      [id]
    );

    // Get related tasks
    const [tasks] = await pool.query(
      `SELECT t.*, u.name as assigned_to_name
       FROM tasks t
       LEFT JOIN users u ON t.assigned_to = u.id
       WHERE t.contact_id = ? AND t.workspace_id = ?
       ORDER BY t.due_date ASC`,
      [id, workspaceId]
    );

    // Get related deals
    const [deals] = await pool.query(
      `SELECT d.*, u.name as assigned_to_name
       FROM deals d
       LEFT JOIN users u ON d.assigned_to = u.id
       WHERE d.contact_id = ? AND d.workspace_id = ?
       ORDER BY d.created_at DESC`,
      [id, workspaceId]
    );

    res.json({
      success: true,
      data: {
        ...contacts[0],
        tags: tags.map(t => t.tag),
        interactions,
        tasks,
        deals
      }
    });
  } catch (error) {
    console.error('Get contact error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get contact', 
      error: error.message 
    });
  }
};

// Create new contact
const createContact = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const { name, email, phone, company, type, status, notes, tags } = req.body;
    const workspaceId = req.user.workspace_id;
    const userId = req.user.id;

    // Validation
    if (!name) {
      return res.status(400).json({ 
        success: false, 
        message: 'Contact name is required' 
      });
    }

    await connection.beginTransaction();

    // Create contact
    const [result] = await connection.query(
      `INSERT INTO contacts (workspace_id, name, email, phone, company, type, status, notes, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [workspaceId, name, email, phone, company, type || 'lead', status, notes, userId]
    );

    const contactId = result.insertId;

    // Add tags if provided
    if (tags && Array.isArray(tags) && tags.length > 0) {
      const tagValues = tags.map(tag => [contactId, tag]);
      await connection.query(
        'INSERT INTO contact_tags (contact_id, tag) VALUES ?',
        [tagValues]
      );
    }

    // Log activity
    await connection.query(
      `INSERT INTO activity_logs (workspace_id, user_id, action_type, entity_type, entity_id, description)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [workspaceId, userId, 'created', 'contact', contactId, `Created contact: ${name}`]
    );

    await connection.commit();

    res.status(201).json({
      success: true,
      message: 'Contact created successfully',
      data: {
        id: contactId,
        name,
        email,
        phone,
        company,
        type: type || 'lead',
        status,
        notes,
        tags: tags || []
      }
    });
  } catch (error) {
    await connection.rollback();
    console.error('Create contact error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create contact', 
      error: error.message 
    });
  } finally {
    connection.release();
  }
};

// Update contact
const updateContact = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const { id } = req.params;
    const { name, email, phone, company, type, status, notes, tags } = req.body;
    const workspaceId = req.user.workspace_id;

    // Check if contact exists
    const [contacts] = await connection.query(
      'SELECT id FROM contacts WHERE id = ? AND workspace_id = ?',
      [id, workspaceId]
    );

    if (contacts.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Contact not found' 
      });
    }

    await connection.beginTransaction();

    // Update contact
    await connection.query(
      `UPDATE contacts 
       SET name = ?, email = ?, phone = ?, company = ?, type = ?, status = ?, notes = ?
       WHERE id = ?`,
      [name, email, phone, company, type, status, notes, id]
    );

    // Update tags if provided
    if (tags && Array.isArray(tags)) {
      // Delete existing tags
      await connection.query('DELETE FROM contact_tags WHERE contact_id = ?', [id]);
      
      // Add new tags
      if (tags.length > 0) {
        const tagValues = tags.map(tag => [id, tag]);
        await connection.query(
          'INSERT INTO contact_tags (contact_id, tag) VALUES ?',
          [tagValues]
        );
      }
    }

    // Log activity
    await connection.query(
      `INSERT INTO activity_logs (workspace_id, user_id, action_type, entity_type, entity_id, description)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [workspaceId, req.user.id, 'updated', 'contact', id, `Updated contact: ${name}`]
    );

    await connection.commit();

    res.json({
      success: true,
      message: 'Contact updated successfully',
      data: {
        id,
        name,
        email,
        phone,
        company,
        type,
        status,
        notes,
        tags: tags || []
      }
    });
  } catch (error) {
    await connection.rollback();
    console.error('Update contact error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update contact', 
      error: error.message 
    });
  } finally {
    connection.release();
  }
};

// Delete contact
const deleteContact = async (req, res) => {
  try {
    const { id } = req.params;
    const workspaceId = req.user.workspace_id;

    // Check if contact exists
    const [contacts] = await pool.query(
      'SELECT name FROM contacts WHERE id = ? AND workspace_id = ?',
      [id, workspaceId]
    );

    if (contacts.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Contact not found' 
      });
    }

    // Delete contact (tags, interactions will be cascaded)
    await pool.query('DELETE FROM contacts WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Contact deleted successfully'
    });
  } catch (error) {
    console.error('Delete contact error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete contact', 
      error: error.message 
    });
  }
};

// Add interaction to contact
const addInteraction = async (req, res) => {
  try {
    const { contactId } = req.params;
    const { type, subject, notes, interaction_date } = req.body;
    const workspaceId = req.user.workspace_id;
    const userId = req.user.id;

    // Check if contact exists
    const [contacts] = await pool.query(
      'SELECT id, name FROM contacts WHERE id = ? AND workspace_id = ?',
      [contactId, workspaceId]
    );

    if (contacts.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Contact not found' 
      });
    }

    // Create interaction
    const [result] = await pool.query(
      `INSERT INTO interactions (contact_id, user_id, type, subject, notes, interaction_date)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [contactId, userId, type || 'note', subject, notes, interaction_date || new Date()]
    );

    // Log activity
    await pool.query(
      `INSERT INTO activity_logs (workspace_id, user_id, action_type, entity_type, entity_id, description)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [workspaceId, userId, 'added_interaction', 'contact', contactId, 
       `Added ${type || 'note'} to contact: ${contacts[0].name}`]
    );

    res.status(201).json({
      success: true,
      message: 'Interaction added successfully',
      data: {
        id: result.insertId,
        contact_id: contactId,
        type: type || 'note',
        subject,
        notes,
        interaction_date: interaction_date || new Date()
      }
    });
  } catch (error) {
    console.error('Add interaction error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to add interaction', 
      error: error.message 
    });
  }
};

module.exports = {
  getContacts,
  getContact,
  createContact,
  updateContact,
  deleteContact,
  addInteraction
};
