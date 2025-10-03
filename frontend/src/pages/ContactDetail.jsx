import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { contactsAPI, tasksAPI, aiAPI } from '../services/api';
import { toast } from 'react-toastify';
import { FiMail, FiPhone, FiBuilding, FiEdit, FiPlus, FiMessageSquare } from 'react-icons/fi';
import { format } from 'date-fns';

const ContactDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [contact, setContact] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddInteraction, setShowAddInteraction] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);
  const [useAI, setUseAI] = useState(false);
  const [interactionData, setInteractionData] = useState({
    type: 'note',
    subject: '',
    notes: ''
  });
  const [taskData, setTaskData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    category: 'sales',
    due_date: ''
  });

  useEffect(() => {
    loadContact();
  }, [id]);

  const loadContact = async () => {
    try {
      const response = await contactsAPI.getById(id);
      setContact(response.data.data);
    } catch (error) {
      toast.error('Failed to load contact');
      navigate('/contacts');
    } finally {
      setLoading(false);
    }
  };

  const handleAddInteraction = async (e) => {
    e.preventDefault();

    try {
      let aiSuggestions = null;

      // Get AI suggestions if enabled
      if (useAI && interactionData.notes) {
        try {
          const aiResponse = await aiAPI.analyzeNote({
            contactId: id,
            note: interactionData.notes
          });
          aiSuggestions = aiResponse.data.data;
          toast.info('AI analyzed your note!');
        } catch (error) {
          console.error('AI analysis failed:', error);
        }
      }

      await contactsAPI.addInteraction(id, interactionData);
      toast.success('Interaction added!');
      
      // Show AI suggestions if available
      if (aiSuggestions && aiSuggestions.tasks && aiSuggestions.tasks.length > 0) {
        const createTasks = window.confirm(
          `AI suggests creating ${aiSuggestions.tasks.length} task(s). Create them now?`
        );
        
        if (createTasks) {
          for (const task of aiSuggestions.tasks) {
            await tasksAPI.create({
              ...task,
              contact_id: id
            });
          }
          toast.success('AI-suggested tasks created!');
        }
      }

      setInteractionData({ type: 'note', subject: '', notes: '' });
      setShowAddInteraction(false);
      setUseAI(false);
      loadContact();
    } catch (error) {
      toast.error('Failed to add interaction');
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();

    try {
      await tasksAPI.create({
        ...taskData,
        contact_id: id
      });
      toast.success('Task created!');
      setTaskData({
        title: '',
        description: '',
        priority: 'medium',
        category: 'sales',
        due_date: ''
      });
      setShowAddTask(false);
      loadContact();
    } catch (error) {
      toast.error('Failed to create task');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="loading-screen">
          <div className="spinner"></div>
          <p>Loading contact...</p>
        </div>
      </Layout>
    );
  }

  if (!contact) {
    return (
      <Layout>
        <div className="error-state">
          <h2>Contact not found</h2>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="page-container">
        <div className="page-header">
          <button onClick={() => navigate('/contacts')} className="btn btn-secondary">
            ← Back
          </button>
          <div className="header-actions">
            <button onClick={() => setShowAddTask(true)} className="btn btn-secondary">
              <FiPlus /> Add Task
            </button>
            <button onClick={() => setShowAddInteraction(true)} className="btn btn-primary">
              <FiMessageSquare /> Add Interaction
            </button>
          </div>
        </div>

        <div className="contact-detail">
          {/* Contact Header */}
          <div className="contact-detail-header">
            <div className="contact-avatar-large">
              {contact.name.charAt(0).toUpperCase()}
            </div>
            <div className="contact-info-header">
              <h1>{contact.name}</h1>
              <div className="contact-meta">
                <span className={`type-badge ${contact.type}`}>{contact.type}</span>
                {contact.status && <span className="status-badge">{contact.status}</span>}
              </div>
              <div className="contact-details">
                {contact.email && (
                  <div className="detail-item">
                    <FiMail /> {contact.email}
                  </div>
                )}
                {contact.phone && (
                  <div className="detail-item">
                    <FiPhone /> {contact.phone}
                  </div>
                )}
                {contact.company && (
                  <div className="detail-item">
                    <FiBuilding /> {contact.company}
                  </div>
                )}
              </div>
              {contact.tags && contact.tags.length > 0 && (
                <div className="contact-tags">
                  {contact.tags.map(tag => (
                    <span key={tag} className="tag">{tag}</span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          {contact.notes && (
            <div className="detail-card">
              <h3>Notes</h3>
              <p>{contact.notes}</p>
            </div>
          )}

          <div className="detail-grid">
            {/* Interactions */}
            <div className="detail-card">
              <h3>Interactions ({contact.interactions?.length || 0})</h3>
              <div className="interaction-timeline">
                {contact.interactions && contact.interactions.length > 0 ? (
                  contact.interactions.map(interaction => (
                    <div key={interaction.id} className="timeline-item">
                      <div className={`timeline-marker ${interaction.type}`}></div>
                      <div className="timeline-content">
                        <div className="timeline-header">
                          <span className="interaction-type">{interaction.type}</span>
                          <span className="timeline-date">
                            {format(new Date(interaction.interaction_date), 'MMM d, yyyy h:mm a')}
                          </span>
                        </div>
                        {interaction.subject && <h4>{interaction.subject}</h4>}
                        <p>{interaction.notes}</p>
                        <small>by {interaction.user_name}</small>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="empty-state">No interactions yet</p>
                )}
              </div>
            </div>

            {/* Related Tasks */}
            <div className="detail-card">
              <h3>Related Tasks ({contact.tasks?.length || 0})</h3>
              <div className="task-list">
                {contact.tasks && contact.tasks.length > 0 ? (
                  contact.tasks.map(task => (
                    <div key={task.id} className="task-item-small">
                      <div className={`priority-dot ${task.priority}`}></div>
                      <div className="task-content">
                        <h4>{task.title}</h4>
                        <p>
                          {task.assigned_to_name} • 
                          {task.due_date && ` Due: ${format(new Date(task.due_date), 'MMM d')}`}
                        </p>
                      </div>
                      <span className={`status-badge ${task.status}`}>{task.status}</span>
                    </div>
                  ))
                ) : (
                  <p className="empty-state">No tasks yet</p>
                )}
              </div>
            </div>

            {/* Related Deals */}
            <div className="detail-card">
              <h3>Related Deals ({contact.deals?.length || 0})</h3>
              <div className="deal-list">
                {contact.deals && contact.deals.length > 0 ? (
                  contact.deals.map(deal => (
                    <div key={deal.id} className="deal-item-small">
                      <div className="deal-content">
                        <h4>{deal.title}</h4>
                        <p>${parseFloat(deal.value).toLocaleString()}</p>
                      </div>
                      <span className={`stage-badge ${deal.stage}`}>
                        {deal.stage.replace('_', ' ')}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="empty-state">No deals yet</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Add Interaction Modal */}
        {showAddInteraction && (
          <div className="modal-overlay" onClick={() => setShowAddInteraction(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Add Interaction</h2>
                <button onClick={() => setShowAddInteraction(false)} className="close-btn">×</button>
              </div>

              <form onSubmit={handleAddInteraction} className="modal-form">
                <div className="form-group">
                  <label>Type</label>
                  <select
                    value={interactionData.type}
                    onChange={(e) => setInteractionData({ ...interactionData, type: e.target.value })}
                  >
                    <option value="note">Note</option>
                    <option value="call">Call</option>
                    <option value="email">Email</option>
                    <option value="meeting">Meeting</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Subject</label>
                  <input
                    type="text"
                    value={interactionData.subject}
                    onChange={(e) => setInteractionData({ ...interactionData, subject: e.target.value })}
                    placeholder="Brief subject..."
                  />
                </div>

                <div className="form-group">
                  <label>Notes *</label>
                  <textarea
                    value={interactionData.notes}
                    onChange={(e) => setInteractionData({ ...interactionData, notes: e.target.value })}
                    required
                    rows="5"
                    placeholder="What happened in this interaction?"
                  ></textarea>
                </div>

                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={useAI}
                      onChange={(e) => setUseAI(e.target.checked)}
                    />
                    🤖 Analyze with AI and suggest follow-ups
                  </label>
                </div>

                <div className="modal-actions">
                  <button type="button" onClick={() => setShowAddInteraction(false)} className="btn btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Add Interaction
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add Task Modal */}
        {showAddTask && (
          <div className="modal-overlay" onClick={() => setShowAddTask(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Add Task for {contact.name}</h2>
                <button onClick={() => setShowAddTask(false)} className="close-btn">×</button>
              </div>

              <form onSubmit={handleAddTask} className="modal-form">
                <div className="form-group">
                  <label>Title *</label>
                  <input
                    type="text"
                    value={taskData.title}
                    onChange={(e) => setTaskData({ ...taskData, title: e.target.value })}
                    required
                    placeholder="Follow up with..."
                  />
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={taskData.description}
                    onChange={(e) => setTaskData({ ...taskData, description: e.target.value })}
                    rows="3"
                    placeholder="Task details..."
                  ></textarea>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Priority</label>
                    <select
                      value={taskData.priority}
                      onChange={(e) => setTaskData({ ...taskData, priority: e.target.value })}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Category</label>
                    <select
                      value={taskData.category}
                      onChange={(e) => setTaskData({ ...taskData, category: e.target.value })}
                    >
                      <option value="sales">Sales</option>
                      <option value="product">Product</option>
                      <option value="operations">Operations</option>
                      <option value="fundraising">Fundraising</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Due Date</label>
                  <input
                    type="date"
                    value={taskData.due_date}
                    onChange={(e) => setTaskData({ ...taskData, due_date: e.target.value })}
                  />
                </div>

                <div className="modal-actions">
                  <button type="button" onClick={() => setShowAddTask(false)} className="btn btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Create Task
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ContactDetail;
