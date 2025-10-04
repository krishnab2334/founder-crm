import React, { useState, useEffect, useContext } from 'react';
import Layout from '../components/Layout';
import { dashboardAPI, tasksAPI, aiAPI } from '../services/api';
import { AuthContext } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import { FiPlus, FiClock, FiAlertCircle, FiCheckCircle, FiTrendingUp, FiUsers, FiTarget, FiCopy } from 'react-icons/fi';
import { format } from 'date-fns';

const FounderDashboard = () => {
  const { user, workspace } = useContext(AuthContext);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [quickTaskTitle, setQuickTaskTitle] = useState('');
  const [showWorkspaceInfo, setShowWorkspaceInfo] = useState(false);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const response = await dashboardAPI.getFounderDashboard();
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

  const handleAIPrioritize = async () => {
    try {
      const response = await aiAPI.prioritizeTasks();
      toast.success('AI analyzed your tasks!');
      console.log('AI Suggestions:', response.data.data);
    } catch (error) {
      toast.error('AI prioritization failed');
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
    pipelineStats = [],
    teamActivity = [],
    contactsSummary = [],
    taskStats = [],
    beautifiedMessages = []
  } = dashboardData || {};

  // Calculate metrics
  const totalDeals = pipelineStats.reduce((sum, s) => sum + parseInt(s.count), 0);
  const totalDealValue = pipelineStats.reduce((sum, s) => sum + parseFloat(s.total_value || 0), 0);
  const totalTasks = taskStats.reduce((sum, s) => sum + parseInt(s.count), 0);
  const completedTasks = taskStats.find(s => s.status === 'completed')?.count || 0;

  return (
    <Layout>
      <div className="dashboard">
        <div className="dashboard-header">
          <div>
            <h1>Welcome back, {user?.name}! 👋</h1>
            <p className="subtitle">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
          </div>
          <div className="header-actions">
            <button onClick={() => setShowWorkspaceInfo(true)} className="btn btn-secondary">
              <FiUsers /> Workspace Info
            </button>
            <button onClick={handleAIPrioritize} className="btn btn-secondary">
              🤖 AI Prioritize Tasks
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
              <FiTrendingUp />
            </div>
            <div className="stat-content">
              <h3>${totalDealValue.toLocaleString()}</h3>
              <p>Pipeline Value</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon purple">
              <FiUsers />
            </div>
            <div className="stat-content">
              <h3>{teamActivity.length}</h3>
              <p>Team Members</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon teal">
              <FiTarget />
            </div>
            <div className="stat-content">
              <h3>{totalDeals}</h3>
              <p>Active Deals</p>
            </div>
          </div>
        </div>

        <div className="dashboard-grid">
          {/* AI-Enhanced Team Updates */}
          <div className="dashboard-card featured">
            <div className="card-header">
              <h2>🤖 Team Status Updates</h2>
              <span className="badge">{beautifiedMessages.length}</span>
            </div>
            <div className="beautified-messages-list">
              {beautifiedMessages.length > 0 ? (
                beautifiedMessages.slice(0, 5).map(message => (
                  <div key={message.id} className="beautified-message-item">
                    <div className="message-header">
                      <div className="user-info">
                        <span className="user-avatar">
                          {message.user_name?.charAt(0).toUpperCase()}
                        </span>
                        <span className="user-name">{message.user_name}</span>
                      </div>
                      <div className="message-meta">
                        <span className={`priority-indicator ${message.priority}`}></span>
                        <span className="category-badge">{message.category}</span>
                        <span className="timestamp">
                          {format(new Date(message.created_at), 'MMM d, h:mm a')}
                        </span>
                      </div>
                    </div>
                    <div className="message-content">
                      <p className="beautified-text">{message.beautified_message}</p>
                      <p className="task-reference">Task: "{message.task_title}"</p>
                    </div>
                    <div className="status-change">
                      <span className="status-from">{message.original_status}</span>
                      <span className="arrow">→</span>
                      <span className="status-to">{message.new_status}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="empty-state">No recent team updates 📝</p>
              )}
            </div>
          </div>

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
                    <div className={`priority-indicator ${task.priority}`}></div>
                    <div className="task-content">
                      <h4>{task.title}</h4>
                      <p className="task-meta">
                        {task.assigned_to_name} • {task.category}
                        {task.contact_name && ` • ${task.contact_name}`}
                      </p>
                      {task.beautified_status_message && (
                        <div className="status-update-message">
                          <span className="message-icon">💬</span>
                          <p className="beautified-message">{task.beautified_status_message}</p>
                          {task.last_status_update && (
                            <span className="message-time">
                              {format(new Date(task.last_status_update), 'MMM d, h:mm a')}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
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
                {overdueTasks.slice(0, 5).map(task => (
                  <div key={task.id} className="task-item">
                    <div className="priority-indicator urgent"></div>
                    <div className="task-content">
                      <h4>{task.title}</h4>
                      <p className="task-meta">
                        Due: {format(new Date(task.due_date), 'MMM d, yyyy')}
                        {task.assigned_to_name && ` • ${task.assigned_to_name}`}
                      </p>
                      {task.beautified_status_message && (
                        <div className="status-update-message">
                          <span className="message-icon">💬</span>
                          <p className="beautified-message">{task.beautified_status_message}</p>
                          {task.last_status_update && (
                            <span className="message-time">
                              {format(new Date(task.last_status_update), 'MMM d, h:mm a')}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pipeline Overview */}
          <div className="dashboard-card">
            <div className="card-header">
              <h2>Deal Pipeline</h2>
              <span className="badge">{totalDeals}</span>
            </div>
            <div className="pipeline-overview">
              {pipelineStats.map(stage => (
                <div key={stage.stage} className="pipeline-stage-summary">
                  <div className="stage-header">
                    <span className="stage-name">{stage.stage.replace('_', ' ')}</span>
                    <span className="stage-count">{stage.count}</span>
                  </div>
                  <div className="stage-value">${parseFloat(stage.total_value || 0).toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Interactions */}
          <div className="dashboard-card">
            <div className="card-header">
              <h2>Recent Interactions</h2>
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
                        {interaction.user_name} • {format(new Date(interaction.interaction_date), 'MMM d, h:mm a')}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="empty-state">No recent interactions</p>
              )}
            </div>
          </div>

          {/* Team Activity */}
          <div className="dashboard-card">
            <div className="card-header">
              <h2>Team Activity</h2>
            </div>
            <div className="team-list">
              {teamActivity.map((member, idx) => (
                <div key={idx} className="team-member-stat">
                  <div className="member-avatar">
                    {member.user_name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="member-info">
                    <h4>{member.user_name}</h4>
                    <p>{member.completed_tasks}/{member.tasks_count} tasks completed</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Tasks */}
          <div className="dashboard-card">
            <div className="card-header">
              <h2>Upcoming Tasks (Next 7 Days)</h2>
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
                        Due: {format(new Date(task.due_date), 'MMM d')} • {task.assigned_to_name}
                      </p>
                      {task.beautified_status_message && (
                        <div className="status-update-message">
                          <span className="message-icon">💬</span>
                          <p className="beautified-message">{task.beautified_status_message}</p>
                          {task.last_status_update && (
                            <span className="message-time">
                              {format(new Date(task.last_status_update), 'MMM d, h:mm a')}
                            </span>
                          )}
                        </div>
                      )}
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

        {/* Workspace Info Modal */}
        {showWorkspaceInfo && (
          <div className="modal-overlay" onClick={() => setShowWorkspaceInfo(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Workspace Information</h2>
                <button onClick={() => setShowWorkspaceInfo(false)} className="close-btn">×</button>
              </div>
              
              <div className="workspace-info">
                <div className="info-section">
                  <h3>Workspace Details</h3>
                  <div className="info-item">
                    <label>Workspace Name:</label>
                    <span>{workspace?.name}</span>
                  </div>
                  <div className="info-item">
                    <label>Your Role:</label>
                    <span className="role-badge founder">Founder</span>
                  </div>
                  <div className="info-item">
                    <label>Team Members:</label>
                    <span>{teamActivity.length} members</span>
                  </div>
                </div>

                <div className="info-section">
                  <h3>Team Member Invitations</h3>
                  <p>Invite team members by email to join your workspace.</p>
                  <div className="help-text">
                    <p>Go to Team Management to send email invitations with secure links.</p>
                    <p>Team members will receive a unique invitation link to join your workspace.</p>
                  </div>
                </div>

                <div className="info-section">
                  <h3>Quick Actions</h3>
                  <div className="quick-actions">
                    <button 
                      onClick={() => {
                        setShowWorkspaceInfo(false);
                        window.location.href = '/team';
                      }} 
                      className="btn btn-primary"
                    >
                      <FiUsers /> Manage Team
                    </button>
                    <button 
                      onClick={() => {
                        setShowWorkspaceInfo(false);
                        window.location.href = '/contacts';
                      }} 
                      className="btn btn-secondary"
                    >
                      View Contacts
                    </button>
                    <button 
                      onClick={() => {
                        setShowWorkspaceInfo(false);
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
      </div>
    </Layout>
  );
};

export default FounderDashboard;
