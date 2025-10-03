import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import Layout from '../components/Layout';
import { dealsAPI, contactsAPI } from '../services/api';
import { toast } from 'react-toastify';
import { FiPlus, FiDollarSign, FiMove } from 'react-icons/fi';
import { format } from 'date-fns';

const Pipeline = () => {
  const [pipeline, setPipeline] = useState({
    lead: [],
    qualified: [],
    demo: [],
    proposal: [],
    closed_won: [],
    closed_lost: []
  });
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    contact_id: '',
    title: '',
    description: '',
    value: '',
    stage: 'lead',
    probability: '10',
    expected_close_date: ''
  });

  useEffect(() => {
    loadPipeline();
    loadContacts();
  }, []);

  const loadPipeline = async () => {
    try {
      const response = await dealsAPI.getPipeline();
      setPipeline(response.data.data);
    } catch (error) {
      toast.error('Failed to load pipeline');
    } finally {
      setLoading(false);
    }
  };

  const loadContacts = async () => {
    try {
      const response = await contactsAPI.getAll();
      setContacts(response.data.data);
    } catch (error) {
      console.error('Failed to load contacts');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await dealsAPI.create(formData);
      toast.success('Deal created successfully!');
      setShowAddModal(false);
      setFormData({
        contact_id: '',
        title: '',
        description: '',
        value: '',
        stage: 'lead',
        probability: '10',
        expected_close_date: ''
      });
      loadPipeline();
    } catch (error) {
      toast.error('Failed to create deal');
    }
  };

  const handleStageChange = async (dealId, newStage) => {
    try {
      await dealsAPI.updateStage(dealId, newStage);
      toast.success('Deal moved!');
      loadPipeline();
    } catch (error) {
      toast.error('Failed to update deal');
    }
  };

  const onDragEnd = async (result) => {
    const { source, destination, draggableId } = result;

    // Dropped outside a droppable area
    if (!destination) return;

    // Dropped in the same position
    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }

    const sourceStage = source.droppableId;
    const destStage = destination.droppableId;

    // Optimistically update UI
    const newPipeline = { ...pipeline };
    const dealId = parseInt(draggableId);
    
    // Find the deal
    const dealToMove = newPipeline[sourceStage].find(d => d.id === dealId);
    if (!dealToMove) return;

    // Remove from source
    newPipeline[sourceStage] = newPipeline[sourceStage].filter(d => d.id !== dealId);
    
    // Add to destination
    newPipeline[destStage] = [...newPipeline[destStage]];
    newPipeline[destStage].splice(destination.index, 0, dealToMove);

    setPipeline(newPipeline);

    // Update backend if stage changed
    if (sourceStage !== destStage) {
      try {
        await dealsAPI.updateStage(dealId, destStage);
        toast.success(`Deal moved to ${destStage.replace('_', ' ')}!`);
      } catch (error) {
        toast.error('Failed to update deal');
        // Revert on error
        loadPipeline();
      }
    }
  };

  const calculateStageValue = (stage) => {
    return stage.reduce((sum, deal) => sum + parseFloat(deal.value || 0), 0);
  };

  const stageConfig = [
    { key: 'lead', label: 'Lead', color: 'gray' },
    { key: 'qualified', label: 'Qualified', color: 'blue' },
    { key: 'demo', label: 'Demo', color: 'purple' },
    { key: 'proposal', label: 'Proposal', color: 'orange' },
    { key: 'closed_won', label: 'Closed Won', color: 'green' },
    { key: 'closed_lost', label: 'Closed Lost', color: 'red' }
  ];

  const totalValue = Object.values(pipeline).flat().reduce((sum, deal) => {
    return sum + parseFloat(deal.value || 0);
  }, 0);

  return (
    <Layout>
      <div className="page-container">
        <div className="page-header">
          <div>
            <h1>Deal Pipeline</h1>
            <p className="subtitle">Total Pipeline Value: ${totalValue.toLocaleString()}</p>
          </div>
          <button onClick={() => setShowAddModal(true)} className="btn btn-primary">
            <FiPlus /> Add Deal
          </button>
        </div>

        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading pipeline...</p>
          </div>
        ) : (
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="pipeline-board">
              {stageConfig.map(stage => (
                <div key={stage.key} className="pipeline-column">
                  <div className={`column-header ${stage.color}`}>
                    <h3>{stage.label}</h3>
                    <div className="column-stats">
                      <span className="badge">{pipeline[stage.key]?.length || 0}</span>
                      <span className="value">
                        ${calculateStageValue(pipeline[stage.key] || []).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <Droppable droppableId={stage.key}>
                    {(provided, snapshot) => (
                      <div 
                        className={`deal-list ${snapshot.isDraggingOver ? 'dragging-over' : ''}`}
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                      >
                        {pipeline[stage.key] && pipeline[stage.key].length > 0 ? (
                          pipeline[stage.key].map((deal, index) => (
                            <Draggable key={deal.id} draggableId={deal.id.toString()} index={index}>
                              {(provided, snapshot) => (
                                <div 
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={`deal-card ${snapshot.isDragging ? 'dragging' : ''}`}
                                  style={provided.draggableProps.style}
                                >
                        <h4>{deal.title}</h4>
                        <p className="deal-contact">
                          {deal.contact_name} {deal.contact_company && `• ${deal.contact_company}`}
                        </p>
                        <div className="deal-value">
                          <FiDollarSign />
                          {parseFloat(deal.value || 0).toLocaleString()}
                        </div>
                        {deal.expected_close_date && (
                          <p className="deal-date">
                            Close: {format(new Date(deal.expected_close_date), 'MMM d, yyyy')}
                          </p>
                        )}
                        {deal.probability !== null && (
                          <div className="deal-probability">
                            <div className="probability-bar">
                              <div 
                                className="probability-fill" 
                                style={{ width: `${deal.probability}%` }}
                              ></div>
                            </div>
                            <span>{deal.probability}%</span>
                          </div>
                        )}
                        {deal.assigned_to_name && (
                          <p className="deal-assignee">
                            <span className="avatar-xs">
                              {deal.assigned_to_name.charAt(0).toUpperCase()}
                            </span>
                            {deal.assigned_to_name}
                          </p>
                        )}

                                  <div className="drag-indicator">
                                    <FiMove />
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          ))
                        ) : (
                          <p className="empty-state">Drop deals here</p>
                        )}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              ))}
            </div>
          </DragDropContext>
        )}

        {/* Add Deal Modal */}
        {showAddModal && (
          <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Create New Deal</h2>
                <button onClick={() => setShowAddModal(false)} className="close-btn">×</button>
              </div>

              <form onSubmit={handleSubmit} className="modal-form">
                <div className="form-group">
                  <label>Contact *</label>
                  <select
                    name="contact_id"
                    value={formData.contact_id}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select a contact</option>
                    {contacts.map(contact => (
                      <option key={contact.id} value={contact.id}>
                        {contact.name} {contact.company && `(${contact.company})`}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Deal Title *</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    placeholder="e.g., Q4 Enterprise Plan"
                  />
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="3"
                    placeholder="Deal details..."
                  ></textarea>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Value ($) *</label>
                    <input
                      type="number"
                      name="value"
                      value={formData.value}
                      onChange={handleChange}
                      required
                      placeholder="10000"
                      step="0.01"
                    />
                  </div>

                  <div className="form-group">
                    <label>Stage</label>
                    <select name="stage" value={formData.stage} onChange={handleChange}>
                      <option value="lead">Lead</option>
                      <option value="qualified">Qualified</option>
                      <option value="demo">Demo</option>
                      <option value="proposal">Proposal</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Probability (%)</label>
                    <input
                      type="number"
                      name="probability"
                      value={formData.probability}
                      onChange={handleChange}
                      min="0"
                      max="100"
                      placeholder="50"
                    />
                  </div>

                  <div className="form-group">
                    <label>Expected Close Date</label>
                    <input
                      type="date"
                      name="expected_close_date"
                      value={formData.expected_close_date}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="modal-actions">
                  <button type="button" onClick={() => setShowAddModal(false)} className="btn btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Create Deal
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

export default Pipeline;
