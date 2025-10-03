import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { authAPI } from '../services/api';
import { toast } from 'react-toastify';

const TeamMemberRegister = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    workspaceCode: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (!formData.workspaceCode.trim()) {
      toast.error('Workspace code is required');
      return;
    }

    setLoading(true);

    try {
      const response = await authAPI.registerTeamMember({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        workspaceCode: formData.workspaceCode
      });

      localStorage.setItem('token', response.data.data.token);
      toast.success('Registration successful! Welcome to the team!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <h1>⚡ Founder CRM</h1>
          <p>Join a workspace as team member</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Your Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="John Doe"
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="your@email.com"
            />
          </div>

          <div className="form-group">
            <label>Workspace Code</label>
            <input
              type="text"
              name="workspaceCode"
              value={formData.workspaceCode}
              onChange={handleChange}
              required
              placeholder="Enter workspace code from your founder"
              style={{ textTransform: 'uppercase' }}
            />
            <small>Ask your founder for the workspace code</small>
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Create a password"
            />
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              placeholder="Confirm your password"
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Joining workspace...' : 'Join Workspace'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Want to create your own workspace? <Link to="/register">Start as Founder</Link>
          </p>
          <p>
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default TeamMemberRegister;