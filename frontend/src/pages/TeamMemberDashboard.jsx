import React, { useState, useEffect, useContext } from 'react';
import Layout from '../components/Layout';
import { dashboardAPI, tasksAPI } from '../services/api';
import { AuthContext } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import { FiPlus, FiClock, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import { format } from 'date-fns';

const TeamMemberDashboard = () => {
  const { user } = useContext(AuthContext);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [quickTaskTitle, setQuickTaskTitle] = useState('');

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
            <p className="subtitle" style={{ fontSize: '14px', marginTop: '4px' }}>
              Team Member Dashboard - Focus on your tasks and deals
            </p>
          </div>
          <div className="header-actions">
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
              <FiCheckCircle />
            </div>
            <div className="stat-content">
              <h3>{myDeals.length}</h3>
              <p>My Deals</p>
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
      </div>
    </Layout>
  );
};

export default TeamMemberDashboard;
