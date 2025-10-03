import React, { useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { FiHome, FiUsers, FiCheckSquare, FiTrello, FiLogOut, FiUserPlus } from 'react-icons/fi';

const Layout = ({ children }) => {
  const { user, workspace, logout, isFounder } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2 className="logo">⚡ Founder CRM</h2>
          <div className="workspace-info">
            <p className="workspace-name">{workspace?.name}</p>
            <span className="user-role">{user?.role}</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <Link 
            to="/dashboard" 
            className={`nav-item ${isActive('/dashboard') ? 'active' : ''}`}
          >
            <FiHome /> Dashboard
          </Link>
          
          <Link 
            to="/contacts" 
            className={`nav-item ${isActive('/contacts') ? 'active' : ''}`}
          >
            <FiUsers /> Contacts
          </Link>
          
          <Link 
            to="/tasks" 
            className={`nav-item ${isActive('/tasks') ? 'active' : ''}`}
          >
            <FiCheckSquare /> Tasks
          </Link>
          
          <Link 
            to="/pipeline" 
            className={`nav-item ${isActive('/pipeline') ? 'active' : ''}`}
          >
            <FiTrello /> Pipeline
          </Link>

          {isFounder && (
            <Link 
              to="/team" 
              className={`nav-item ${isActive('/team') ? 'active' : ''}`}
            >
              <FiUserPlus /> Team
            </Link>
          )}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="user-details">
              <p className="user-name">{user?.name}</p>
              <p className="user-email">{user?.email}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="logout-btn">
            <FiLogOut /> Logout
          </button>
        </div>
      </aside>

      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

export default Layout;
