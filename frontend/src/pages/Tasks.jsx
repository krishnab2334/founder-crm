import React, { useState, useEffect, useContext } from 'react';
import Layout from '../components/Layout';
import { tasksAPI } from '../services/api';
import { AuthContext } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
// Using simple icons
import { format } from 'date-fns';

const Tasks = () => {
  const { user } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [showMyTasks, setShowMyTasks] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assigned_to: user?.id,
    category: 'other',
    priority: 'medium',
    status: 'todo',
    due_date: ''
  });

  useEffect(() => {
    loadTasks();
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

  const handleStatusUpdate = async (taskId, newStatus) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      await tasksAPI.update(taskId, { ...task, status: newStatus });
      toast.success('Task updated!');
      loadTasks();
    } catch (error) {
      toast.error('Failed to update task');
    }
  };

  const groupByStatus = () => {
    const grouped = {
      todo: [],
      in_progress: [],
      completed: [],
      cancelled: []
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

  const groupedTasks = groupByStatus();

  return (
    <Layout>
      <div className="page-container">
        <div className="page-header">
          <h1>Tasks</h1>
          <button onClick={() => setShowAddModal(true)} className="btn btn-primary">
            <span>➕</span> Add Task
          </button>
        </div>

        {/* Filters */}
        <div className="filters-bar">
          <div className="filter-group">
            <button
              className={`filter-btn ${!showMyTasks ? 'active' : ''}`}
              onClick={() => setShowMyTasks(false)}
            >
              All Tasks
            </button>
            <button
              className={`filter-btn ${showMyTasks ? 'active' : ''}`}
              onClick={() => setShowMyTasks(true)}
            >
              My Tasks
            </button>
          </div>

          <div className="filter-group">
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="">All Status</option>
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>

            <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)}>
              <option value="">All Priority</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>

            <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
              <option value="">All Category</option>
              <option value="sales">Sales</option>
              <option value="product">Product</option>
              <option value="operations">Operations</option>
              <option value="fundraising">Fundraising</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        {/* Tasks Board */}
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading tasks...</p>
          </div>
        ) : (
          <div className="tasks-board">
            {/* To Do Column */}
            <div className="task-column">
              <div className="column-header">
                <h3>To Do</h3>
                <span className="badge">{groupedTasks.todo.length}</span>
              </div>
              <div className="task-list">
                {groupedTasks.todo.map(task => (
                  <div key={task.id} className="task-card">
                    <div className="task-header">
                      <span className={`priority-badge ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                      <span className="category-badge">{task.category}</span>
                    </div>
                    <h4>{task.title}</h4>
                    {task.description && <p className="task-description">{task.description}</p>}
                    <div className="task-meta">
                      {task.assigned_to_name && (
                        <div className="assignee">
                          <span className="avatar-sm">
                            {task.assigned_to_name.charAt(0).toUpperCase()}
                          </span>
                          {task.assigned_to_name}
                        </div>
                      )}
                      {task.due_date && (
                        <span className="due-date">
                          Due: {format(new Date(task.due_date), 'MMM d')}
                        </span>
                      )}
                      {task.contact_name && (
                        <span className="contact-link">📧 {task.contact_name}</span>
                      )}
                    </div>
                    <div className="task-actions">
                      <button 
                        onClick={() => handleStatusUpdate(task.id, 'in_progress')}
                        className="btn btn-sm"
                      >
                        Start
                      </button>
                    </div>
                  </div>
                ))}
                {groupedTasks.todo.length === 0 && (
                  <p className="empty-state">No tasks</p>
                )}
              </div>
            </div>

            {/* In Progress Column */}
            <div className="task-column">
              <div className="column-header">
                <h3>In Progress</h3>
                <span className="badge">{groupedTasks.in_progress.length}</span>
              </div>
              <div className="task-list">
                {groupedTasks.in_progress.map(task => (
                  <div key={task.id} className="task-card">
                    <div className="task-header">
                      <span className={`priority-badge ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                      <span className="category-badge">{task.category}</span>
                    </div>
                    <h4>{task.title}</h4>
                    {task.description && <p className="task-description">{task.description}</p>}
                    <div className="task-meta">
                      {task.assigned_to_name && (
                        <div className="assignee">
                          <span className="avatar-sm">
                            {task.assigned_to_name.charAt(0).toUpperCase()}
                          </span>
                          {task.assigned_to_name}
                        </div>
                      )}
                      {task.due_date && (
                        <span className="due-date">
                          Due: {format(new Date(task.due_date), 'MMM d')}
                        </span>
                      )}
                      {task.contact_name && (
                        <span className="contact-link">📧 {task.contact_name}</span>
                      )}
                    </div>
                    <div className="task-actions">
                      <button 
                        onClick={() => handleStatusUpdate(task.id, 'completed')}
                        className="btn btn-sm btn-success"
                      >
                        Complete
                      </button>
                    </div>
                  </div>
                ))}
                {groupedTasks.in_progress.length === 0 && (
                  <p className="empty-state">No tasks</p>
                )}
              </div>
            </div>

            {/* Completed Column */}
            <div className="task-column">
              <div className="column-header">
                <h3>Completed</h3>
                <span className="badge">{groupedTasks.completed.length}</span>
              </div>
              <div className="task-list">
                {groupedTasks.completed.map(task => (
                  <div key={task.id} className="task-card completed">
                    <div className="task-header">
                      <span className={`priority-badge ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                      <span className="category-badge">{task.category}</span>
                    </div>
                    <h4>{task.title}</h4>
                    {task.description && <p className="task-description">{task.description}</p>}
                    <div className="task-meta">
                      {task.assigned_to_name && (
                        <div className="assignee">
                          <span className="avatar-sm">
                            {task.assigned_to_name.charAt(0).toUpperCase()}
                          </span>
                          {task.assigned_to_name}
                        </div>
                      )}
                      {task.completed_at && (
                        <span className="completed-date">
                          ✓ {format(new Date(task.completed_at), 'MMM d')}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
                {groupedTasks.completed.length === 0 && (
                  <p className="empty-state">No completed tasks</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Add Task Modal */}
        {showAddModal && (
          <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Create New Task</h2>
                <button onClick={() => setShowAddModal(false)} className="close-btn">×</button>
              </div>

              <form onSubmit={handleSubmit} className="modal-form">
                <div className="form-group">
                  <label>Title *</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    placeholder="What needs to be done?"
                  />
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="3"
                    placeholder="Task details..."
                  ></textarea>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Priority</label>
                    <select name="priority" value={formData.priority} onChange={handleChange}>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Category</label>
                    <select name="category" value={formData.category} onChange={handleChange}>
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
                    name="due_date"
                    value={formData.due_date}
                    onChange={handleChange}
                  />
                </div>

                <div className="modal-actions">
                  <button type="button" onClick={() => setShowAddModal(false)} className="btn btn-secondary">
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

export default Tasks;
