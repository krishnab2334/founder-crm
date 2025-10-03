import React, { useState, useEffect, useContext } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import Layout from '../components/Layout';
import { tasksAPI, contactsAPI, aiAPI } from '../services/api';
import { AuthContext } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import { FiPlus, FiFilter, FiClock, FiZap, FiMove, FiUser, FiCalendar } from 'react-icons/fi';
import { format, isPast, isToday } from 'date-fns';

const Tasks = () => {
  const { user } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [showMyTasks, setShowMyTasks] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assigned_to: user?.id,
    contact_id: '',
    category: 'other',
    priority: 'medium',
    status: 'todo',
    due_date: ''
  });

  useEffect(() => {
    loadTasks();
    loadContacts();
  }, [filterStatus, filterPriority, filterCategory, showMyTasks]);

  const loadTasks = async () => {
    try {
      const params = {};
      if (filterStatus) params.status = filterStatus;
      if (filterPriority) params.priority = filterPriority;
      if (filterCategory) params.category = filterCategory;

      const response = showMyTasks 
        ? await tasksAPI.getMyTasks(params)
        : await tasksAPI.getAll(params);
      
      setTasks(response.data.data);
    } catch (error) {
      toast.error('Failed to load tasks');
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
      await tasksAPI.create(formData);
      toast.success('Task created successfully!');
      setShowAddModal(false);
      setFormData({
        title: '',
        description: '',
        assigned_to: user?.id,
        contact_id: '',
        category: 'other',
        priority: 'medium',
        status: 'todo',
        due_date: ''
      });
      loadTasks();
    } catch (error) {
      toast.error('Failed to create task');
    }
  };

  const onDragEnd = async (result) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }

    const taskId = parseInt(draggableId);
    const newStatus = destination.droppableId;

    try {
      const task = tasks.find(t => t.id === taskId);
      await tasksAPI.update(taskId, { ...task, status: newStatus });
      toast.success(`Task moved to ${newStatus.replace('_', ' ')}!`);
      loadTasks();
    } catch (error) {
      toast.error('Failed to update task');
    }
  };

  const groupByStatus = () => {
    const grouped = {
      todo: [],
      in_progress: [],
      completed: []
    };

    tasks.forEach(task => {
      if (grouped[task.status]) {
        grouped[task.status].push(task);
      }
    });

    return grouped;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'green',
      medium: 'blue',
      high: 'orange',
      urgent: 'red'
    };
    return colors[priority] || 'gray';
  };

  const getTaskDueStatus = (dueDate) => {
    if (!dueDate) return null;
    const date = new Date(dueDate);
    if (isPast(date) && !isToday(date)) return 'overdue';
    if (isToday(date)) return 'today';
    return null;
  };

  const groupedTasks = groupByStatus();

  const columnConfig = [
    { key: 'todo', label: 'To Do', icon: FiClock, color: 'gray' },
    { key: 'in_progress', label: 'In Progress', icon: FiZap, color: 'blue' },
    { key: 'completed', label: 'Completed', icon: FiUser, color: 'green' }
  ];

  return (
    <Layout>
      <div className="page-container">
        <div className="page-header">
          <div>
            <h1>📋 Tasks</h1>
            <p className="subtitle">Manage and track your team's tasks</p>
          </div>
          <button onClick={() => setShowAddModal(true)} className="btn btn-primary">
            <FiPlus /> New Task
          </button>
        </div>

        {/* Modern Filters */}
        <div className="modern-filters">
          <div className="filter-tabs">
            <button
              className={`filter-tab ${!showMyTasks ? 'active' : ''}`}
              onClick={() => setShowMyTasks(false)}
            >
              All Tasks ({tasks.length})
            </button>
            <button
              className={`filter-tab ${showMyTasks ? 'active' : ''}`}
              onClick={() => setShowMyTasks(true)}
            >
              My Tasks
            </button>
          </div>

          <div className="filter-dropdowns">
            <select 
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value)}
              className="filter-select"
            >
              <option value="">All Status</option>
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>

            <select 
              value={filterPriority} 
              onChange={(e) => setFilterPriority(e.target.value)}
              className="filter-select"
            >
              <option value="">All Priority</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>

            <select 
              value={filterCategory} 
              onChange={(e) => setFilterCategory(e.target.value)}
              className="filter-select"
            >
              <option value="">All Category</option>
              <option value="sales">Sales</option>
              <option value="product">Product</option>
              <option value="operations">Operations</option>
              <option value="fundraising">Fundraising</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        {/* Kanban Board with Drag & Drop */}
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading tasks...</p>
          </div>
        ) : (
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="tasks-board-modern">
              {columnConfig.map(column => (
                <div key={column.key} className="task-column-modern">
                  <div className={`column-header-modern ${column.color}`}>
                    <column.icon className="column-icon" />
                    <h3>{column.label}</h3>
                    <span className="task-count">{groupedTasks[column.key]?.length || 0}</span>
                  </div>

                  <Droppable droppableId={column.key}>
                    {(provided, snapshot) => (
                      <div
                        className={`task-list-modern ${snapshot.isDraggingOver ? 'dragging-over' : ''}`}
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                      >
                        {groupedTasks[column.key] && groupedTasks[column.key].length > 0 ? (
                          groupedTasks[column.key].map((task, index) => (
                            <Draggable key={task.id} draggableId={task.id.toString()} index={index}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={`task-card-modern ${snapshot.isDragging ? 'dragging' : ''} ${task.status === 'completed' ? 'completed' : ''}`}
                                  style={provided.draggableProps.style}
                                >
                                  <div className="task-card-header">
                                    <span className={`priority-dot ${getPriorityColor(task.priority)}`}></span>
                                    <span className="category-tag">{task.category}</span>
                                    <FiMove className="drag-handle" />
                                  </div>

                                  <h4 className="task-title">{task.title}</h4>
                                  
                                  {task.description && (
                                    <p className="task-desc">{task.description.substring(0, 100)}...</p>
                                  )}

                                  <div className="task-meta-modern">
                                    {task.assigned_to_name && (
                                      <div className="task-assignee">
                                        <span className="assignee-avatar">
                                          {task.assigned_to_name.charAt(0).toUpperCase()}
                                        </span>
                                        <span>{task.assigned_to_name}</span>
                                      </div>
                                    )}

                                    {task.due_date && (
                                      <div className={`task-due ${getTaskDueStatus(task.due_date)}`}>
                                        <FiCalendar />
                                        <span>{format(new Date(task.due_date), 'MMM d')}</span>
                                      </div>
                                    )}

                                    {task.contact_name && (
                                      <div className="task-contact">
                                        <span>📧 {task.contact_name}</span>
                                      </div>
                                    )}
                                  </div>

                                  {task.beautified_status_message && (
                                    <div className="task-status-message">
                                      <small>{task.beautified_status_message}</small>
                                    </div>
                                  )}
                                </div>
                              )}
                            </Draggable>
                          ))
                        ) : (
                          <p className="empty-state-modern">Drop tasks here</p>
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

        {/* Modern Add Task Modal */}
        {showAddModal && (
          <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
            <div className="modal modal-modern" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Create New Task</h2>
                <button onClick={() => setShowAddModal(false)} className="close-btn">×</button>
              </div>

              <form onSubmit={handleSubmit} className="modal-form-modern">
                <div className="form-group">
                  <label>Task Title *</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    placeholder="What needs to be done?"
                    className="form-input-modern"
                  />
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="4"
                    placeholder="Add more details..."
                    className="form-input-modern"
                  ></textarea>
                </div>

                <div className="form-row-modern">
                  <div className="form-group">
                    <label>Priority</label>
                    <select name="priority" value={formData.priority} onChange={handleChange} className="form-input-modern">
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Category</label>
                    <select name="category" value={formData.category} onChange={handleChange} className="form-input-modern">
                      <option value="sales">Sales</option>
                      <option value="product">Product</option>
                      <option value="operations">Operations</option>
                      <option value="fundraising">Fundraising</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="form-row-modern">
                  <div className="form-group">
                    <label>Related Contact (Optional)</label>
                    <select name="contact_id" value={formData.contact_id} onChange={handleChange} className="form-input-modern">
                      <option value="">None</option>
                      {contacts.map(contact => (
                        <option key={contact.id} value={contact.id}>
                          {contact.name} {contact.company && `(${contact.company})`}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Due Date</label>
                    <input
                      type="date"
                      name="due_date"
                      value={formData.due_date}
                      onChange={handleChange}
                      className="form-input-modern"
                    />
                  </div>
                </div>

                <div className="modal-actions">
                  <button type="button" onClick={() => setShowAddModal(false)} className="btn btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    <FiPlus /> Create Task
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

export default Tasks;
