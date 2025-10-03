import React, { useState, useEffect, useContext } from 'react';
import Layout from '../components/Layout';
import { dashboardAPI, tasksAPI, aiAPI } from '../services/api';
import { AuthContext } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import { FiPlus, FiClock, FiAlertCircle, FiCheckCircle, FiTarget, FiTrendingUp, FiUser, FiEdit3, FiSend, FiZap } from 'react-icons/fi';
import { format } from 'date-fns';

const TeamMemberDashboard = () => {
  const { user, workspace } = useContext(AuthContext);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [quickTaskTitle, setQuickTaskTitle] = useState('');
  const [showMyProfile, setShowMyProfile] = useState(false);
  const [showStatusUpdate, setShowStatusUpdate] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const response = await dashboardAPI.getTeamMemberDashboard();
      setDashboardData(response.data.data);
    } catch (error) {
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAddTask = async (e) => {
    e.preventDefault();
    if (!quickTaskTitle.trim()) return;

    try {
      await tasksAPI.create({
        title: quickTaskTitle,
        status: 'todo',
        priority: 'medium',
        assigned_to: user.id
      });
      setQuickTaskTitle('');
      setShowQuickAdd(false);
      toast.success('Task added!');
      loadDashboard();
    } catch (error) {
      toast.error('Failed to add task');
    }
  };

  const handleMarkComplete = async (taskId) => {
    try {
      const task = [...dashboardData.todayTasks, ...dashboardData.upcomingTasks]
        .find(t => t.id === taskId);
      
      await tasksAPI.update(taskId, {
        ...task,
        status: 'completed'
      });
      toast.success('Task completed!');
      loadDashboard();
    } catch (error) {
      toast.error('Failed to update task');
    }
  };

  const handleOpenStatusUpdate = (task) => {
    setSelectedTask(task);
    setNewStatus(task.status);
    setStatusMessage('');
    setAiSuggestions([]);
    setShowStatusUpdate(true);
  };

  const handleGetAISuggestions = async () => {
    if (!selectedTask) return;
    
    setLoadingSuggestions(true);
    try {
      const response = await aiAPI.getTaskStatusSuggestions(selectedTask.id);
      setAiSuggestions(response.data.data.suggestions || []);
      toast.success('AI suggestions generated!');
    } catch (error) {
      toast.error('Failed to get AI suggestions');
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handleUpdateTaskStatus = async (e) => {
    e.preventDefault();
    if (!selectedTask) return;

    try {
      await tasksAPI.update(selectedTask.id, {
        ...selectedTask,
        status: newStatus,
        status_message: statusMessage
      });
      toast.success('Task status updated successfully!');
      setShowStatusUpdate(false);
      loadDashboard();
    } catch (error) {
      toast.error('Failed to update task status');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="loading-screen">
          <div className="spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </Layout>
    );
  }

  const {
    todayTasks = [],
    upcomingTasks = [],
    overdueTasks = [],
    recentInteractions = [],
    myDeals = [],
    taskStats = []
  } = dashboardData || {};

  const totalTasks = taskStats.reduce((sum, s) => sum + parseInt(s.count), 0);
  const completedTasks = taskStats.find(s => s.status === 'completed')?.count || 0;

  return (
    <Layout>
      <div className="dashboard">
        <div className="dashboard-header">
          <div>
            <h1>Welcome back, {user?.name}! 👋</h1>
            <p className="subtitle">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
            <p className="workspace-info">
              <strong>{workspace?.name}</strong> • Team Member
            </p>
          </div>
          <div className="header-actions">
            <button onClick={() => setShowMyProfile(true)} className="btn btn-secondary">
              <FiUser /> My Profile
            </button>
            <button onClick={() => setShowQuickAdd(true)} className="btn btn-primary">
              <FiPlus /> Quick Add Task
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon blue">
              <FiCheckCircle />
            </div>
            <div className="stat-content">
              <h3>{completedTasks}/{totalTasks}</h3>
              <p>Tasks Completed</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon orange">
              <FiClock />
            </div>
            <div className="stat-content">
              <h3>{todayTasks.length}</h3>
              <p>Today's Tasks</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon red">
              <FiAlertCircle />
            </div>
            <div className="stat-content">
              <h3>{overdueTasks.length}</h3>
              <p>Overdue Tasks</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon green">
              <FiTarget />
            </div>
            <div className="stat-content">
              <h3>{myDeals.length}</h3>
              <p>My Deals</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon purple">
              <FiTrendingUp />
            </div>
            <div className="stat-content">
              <h3>
                {myDeals.reduce((sum, deal) => sum + parseFloat(deal.value || 0), 0).toLocaleString('en-US', {
                  style: 'currency',
                  currency: 'USD',
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0
                })}
              </h3>
              <p>My Pipeline Value</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon teal">
              <FiCheckCircle />
            </div>
            <div className="stat-content">
              <h3>{Math.round((completedTasks / Math.max(totalTasks, 1)) * 100)}%</h3>
              <p>Completion Rate</p>
            </div>
          </div>
        </div>

        <div className="dashboard-grid">
          {/* Today's Tasks */}
          <div className="dashboard-card">
            <div className="card-header">
              <h2>Today's Tasks</h2>
              <span className="badge">{todayTasks.length}</span>
            </div>
            <div className="task-list">
              {todayTasks.length > 0 ? (
                todayTasks.map(task => (
                  <div key={task.id} className="task-item">
                    <input
                      type="checkbox"
                      checked={task.status === 'completed'}
                      onChange={() => handleMarkComplete(task.id)}
                    />
                    <div className={`priority-indicator ${task.priority}`}></div>
                    <div className="task-content">
                      <h4>{task.title}</h4>
                      <p className="task-meta">
                        {task.category}
                        {task.contact_name && ` • ${task.contact_name}`}
                      </p>
                    </div>
                    <button 
                      onClick={() => handleOpenStatusUpdate(task)} 
                      className="btn-icon"
                      title="Update Status"
                    >
                      <FiEdit3 />
                    </button>
                    <span className={`status-badge ${task.status}`}>{task.status}</span>
                  </div>
                ))
              ) : (
                <p className="empty-state">No tasks for today 🎉</p>
              )}
            </div>
          </div>

          {/* Overdue Tasks */}
          {overdueTasks.length > 0 && (
            <div className="dashboard-card alert">
              <div className="card-header">
                <h2>Overdue Tasks</h2>
                <span className="badge danger">{overdueTasks.length}</span>
              </div>
              <div className="task-list">
                {overdueTasks.map(task => (
                  <div key={task.id} className="task-item">
                    <input
                      type="checkbox"
                      checked={task.status === 'completed'}
                      onChange={() => handleMarkComplete(task.id)}
                    />
                    <div className="priority-indicator urgent"></div>
                    <div className="task-content">
                      <h4>{task.title}</h4>
                      <p className="task-meta">
                        Due: {format(new Date(task.due_date), 'MMM d, yyyy')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* My Deals */}
          <div className="dashboard-card">
            <div className="card-header">
              <h2>My Deals</h2>
              <span className="badge">{myDeals.length}</span>
            </div>
            <div className="deal-list">
              {myDeals.length > 0 ? (
                myDeals.map(deal => (
                  <div key={deal.id} className="deal-item">
                    <div className="deal-content">
                      <h4>{deal.title}</h4>
                      <p className="deal-meta">
                        {deal.contact_name} • ${parseFloat(deal.value).toLocaleString()}
                      </p>
                    </div>
                    <span className={`stage-badge ${deal.stage}`}>
                      {deal.stage.replace('_', ' ')}
                    </span>
                  </div>
                ))
              ) : (
                <p className="empty-state">No deals assigned</p>
              )}
            </div>
          </div>

          {/* Recent Interactions */}
          <div className="dashboard-card">
            <div className="card-header">
              <h2>My Recent Interactions</h2>
            </div>
            <div className="interaction-list">
              {recentInteractions.length > 0 ? (
                recentInteractions.slice(0, 5).map(interaction => (
                  <div key={interaction.id} className="interaction-item">
                    <div className={`interaction-type ${interaction.type}`}>
                      {interaction.type.charAt(0).toUpperCase()}
                    </div>
                    <div className="interaction-content">
                      <h4>{interaction.contact_name}</h4>
                      <p>{interaction.notes?.substring(0, 80)}...</p>
                      <p className="interaction-meta">
                        {format(new Date(interaction.interaction_date), 'MMM d, h:mm a')}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="empty-state">No recent interactions</p>
              )}
            </div>
          </div>

          {/* Upcoming Tasks */}
          <div className="dashboard-card">
            <div className="card-header">
              <h2>Upcoming Tasks</h2>
              <span className="badge">{upcomingTasks.length}</span>
            </div>
            <div className="task-list">
              {upcomingTasks.length > 0 ? (
                upcomingTasks.slice(0, 5).map(task => (
                  <div key={task.id} className="task-item">
                    <div className={`priority-indicator ${task.priority}`}></div>
                    <div className="task-content">
                      <h4>{task.title}</h4>
                      <p className="task-meta">
                        Due: {format(new Date(task.due_date), 'MMM d')}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="empty-state">No upcoming tasks</p>
              )}
            </div>
          </div>
        </div>

        {/* Quick Add Task Modal */}
        {showQuickAdd && (
          <div className="modal-overlay" onClick={() => setShowQuickAdd(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <h3>Quick Add Task</h3>
              <form onSubmit={handleQuickAddTask}>
                <input
                  type="text"
                  value={quickTaskTitle}
                  onChange={(e) => setQuickTaskTitle(e.target.value)}
                  placeholder="What needs to be done?"
                  autoFocus
                />
                <div className="modal-actions">
                  <button type="button" onClick={() => setShowQuickAdd(false)} className="btn btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Add Task
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* My Profile Modal */}
        {showMyProfile && (
          <div className="modal-overlay" onClick={() => setShowMyProfile(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>My Profile</h2>
                <button onClick={() => setShowMyProfile(false)} className="close-btn">×</button>
              </div>
              
              <div className="profile-info">
                <div className="profile-avatar">
                  <div className="avatar-circle">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                </div>

                <div className="info-section">
                  <h3>Personal Information</h3>
                  <div className="info-item">
                    <label>Name:</label>
                    <span>{user?.name}</span>
                  </div>
                  <div className="info-item">
                    <label>Email:</label>
                    <span>{user?.email}</span>
                  </div>
                  <div className="info-item">
                    <label>Role:</label>
                    <span className="role-badge team-member">Team Member</span>
                  </div>
                </div>

                <div className="info-section">
                  <h3>Workspace</h3>
                  <div className="info-item">
                    <label>Workspace:</label>
                    <span>{workspace?.name}</span>
                  </div>
                  <div className="info-item">
                    <label>Member Since:</label>
                    <span>{user?.created_at ? format(new Date(user.created_at), 'MMM d, yyyy') : 'N/A'}</span>
                  </div>
                </div>

                <div className="info-section">
                  <h3>My Performance</h3>
                  <div className="performance-stats">
                    <div className="perf-stat">
                      <span className="perf-number">{completedTasks}</span>
                      <span className="perf-label">Tasks Completed</span>
                    </div>
                    <div className="perf-stat">
                      <span className="perf-number">{myDeals.length}</span>
                      <span className="perf-label">Active Deals</span>
                    </div>
                    <div className="perf-stat">
                      <span className="perf-number">{recentInteractions.length}</span>
                      <span className="perf-label">Recent Interactions</span>
                    </div>
                  </div>
                </div>

                <div className="info-section">
                  <h3>Quick Actions</h3>
                  <div className="quick-actions">
                    <button 
                      onClick={() => {
                        setShowMyProfile(false);
                        window.location.href = '/tasks';
                      }} 
                      className="btn btn-primary"
                    >
                      View All Tasks
                    </button>
                    <button 
                      onClick={() => {
                        setShowMyProfile(false);
                        window.location.href = '/contacts';
                      }} 
                      className="btn btn-secondary"
                    >
                      View Contacts
                    </button>
                    <button 
                      onClick={() => {
                        setShowMyProfile(false);
                        window.location.href = '/pipeline';
                      }} 
                      className="btn btn-secondary"
                    >
                      View Pipeline
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Status Update Modal */}
        {showStatusUpdate && selectedTask && (
          <div className="modal-overlay" onClick={() => setShowStatusUpdate(false)}>
            <div className="modal modal-large" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Update Task Status</h2>
                <button onClick={() => setShowStatusUpdate(false)} className="close-btn">×</button>
              </div>
              
              <form onSubmit={handleUpdateTaskStatus}>
                <div className="status-update-form">
                  <div className="task-info-banner">
                    <h3>{selectedTask.title}</h3>
                    <p>{selectedTask.category} • {selectedTask.priority} priority</p>
                  </div>

                  <div className="form-group">
                    <label>New Status</label>
                    <select 
                      value={newStatus} 
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="form-control"
                    >
                      <option value="todo">To Do</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <div className="label-with-action">
                      <label>Status Update Message</label>
                      <button 
                        type="button"
                        onClick={handleGetAISuggestions}
                        disabled={loadingSuggestions}
                        className="btn btn-sm btn-secondary"
                      >
                        <FiZap /> {loadingSuggestions ? 'Loading...' : 'Get AI Suggestions'}
                      </button>
                    </div>
                    <textarea
                      value={statusMessage}
                      onChange={(e) => setStatusMessage(e.target.value)}
                      placeholder="Describe what you've done, any blockers, or next steps..."
                      rows="4"
                      className="form-control"
                    />
                    <p className="help-text">
                      💡 This message will be enhanced by AI and shown to the founder
                    </p>
                  </div>

                  {aiSuggestions.length > 0 && (
                    <div className="ai-suggestions-box">
                      <h4><FiZap /> AI Suggestions</h4>
                      <p className="suggestions-hint">Click a suggestion to use it:</p>
                      <div className="suggestions-list">
                        {aiSuggestions.map((suggestion, idx) => (
                          <div 
                            key={idx} 
                            className="suggestion-item"
                            onClick={() => setStatusMessage(suggestion)}
                          >
                            <FiSend className="suggestion-icon" />
                            <span>{suggestion}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="modal-actions">
                    <button 
                      type="button" 
                      onClick={() => setShowStatusUpdate(false)} 
                      className="btn btn-secondary"
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                      <FiCheckCircle /> Update Status
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default TeamMemberDashboard;
